const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../config/db')

// 获取中间人列表
router.post('/getMiddlemanList', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where status != '失效'`
    if (params.userInfo.position != '管理员' || params.userInfo.position.match('总裁')) {
        if (params.userInfo.position === '副总') {
            whereUser += ` and department = '${params.userInfo.department}'`
        }
        if (params.userInfo.department === '主管') {
            whereUser += ` and department = '${params.userInfo.department}' and company = '${params.userInfo.company}'`
        }
        if (params.userInfo.department === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
        }
    }
    // 条件筛选
    let whereFilter = `where m.status != '失效'`
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            whereFilter += ` and m.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            whereFilter += ` and m.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT m.*, u.name as u_name 
                FROM middleman m 
                    INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = m.u_id
                ${whereFilter}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results.slice(current * pageSize, (current + 1) * pageSize), pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

// 添加中间人
router.post('/addMiddleman', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE u_id = '${params.userInfo.uid}' and name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length !== 0) {
            res.send({ code: 201, data: {}, msg: `${params.name} 已存在` })
        } else {
            let sql = `SELECT * FROM middleman`
            db.query(sql, (err, results) => {
                if (err) throw err;
                let mid = 'M' + `${results.length + 1}`.padStart(5, '0')
                let can_piao = params.can_piao ? `'${params.can_piao}'` : null
                let piao_type = params.piao_type ? `'${params.piao_type}'` : null
                let shui_point = params.shui_point ? `'${params.shui_point}'` : null
                let sql = `INSERT INTO middleman values('${mid}', '${params.type}', '${params.name}', '${params.liaison_name}', '${params.liaison_v}', '${params.liaison_phone}', '${params.pay_way}', ${can_piao}, ${piao_type}, ${shui_point}, '${params.pay_name}', '${params.pay_bank}', '${params.pay_account}', '正常', '${params.userInfo.uid}', '${dayjs().valueOf()}')`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: {}, msg: `` })
                })
            })
        }
    })
})

// 修改中间人信息
router.post('/editMiddleman', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE u_id = '${params.userInfo.uid}' and name = '${params.name}' and mid != '${params.mid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ code: 201, data: {}, msg: `${params.name} 已存在` })
        } else {
            let can_piao = params.can_piao ? `'${params.can_piao}'` : null
            let piao_type = params.piao_type ? `'${params.piao_type}'` : null
            let shui_point = params.shui_point ? `'${params.shui_point}'` : null
            let sql = `UPDATE middleman SET type = '${params.type}', name = '${params.name}', liaison_name = '${params.liaison_name}', liaison_v = '${params.liaison_v}', liaison_phone = '${params.liaison_phone}', pay_way = '${params.pay_way}', can_piao = ${can_piao}, piao_type = ${piao_type}, shui_point = ${shui_point}, pay_name = '${params.pay_name}', pay_bank = '${params.pay_bank}', pay_account = '${params.pay_account}' WHERE mid = '${params.mid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: {}, msg: `` })
            })
        }
    })
})

// 搜索中间人
router.post('/searchMiddlemans', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE name like '%${params.value}%' and u_id = '${params.userInfo.uid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let middlemans = []
        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            middlemans.push({
                label: element.name,
                value: element.mid
            })
        }
        res.send({ code: 200, data: middlemans, msg: `` })
    })
})

// 查看中间人支付信息
router.post('/getMiddlemanInfo', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE mid = '${params.mid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let items = [], i = 0
        for (const key in results[0]) {
            if (Object.hasOwnProperty.call(results[0], key)) {
                const element = {
                    key: i,
                    label: key,
                    children: results[0][key]
                }
                if (i >= 6 && i <= 12) {
                    items.push(element)
                }
            }
            i++
        }
        res.send({ code: 200, data: items, msg: `` })
    })
})

module.exports = router