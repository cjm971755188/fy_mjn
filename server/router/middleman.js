const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 获取中间人列表
router.post('/getMiddlemans', (req, res) => {
    let params = req.body
    let where = `where u.status != '2'`
    // 权限筛选
    if (params.userInfo.position != '管理员') {
        if (params.userInfo.company != '总公司') {
            where += ` and u.company = '${params.userInfo.company}'`
        }
        if (params.userInfo.department != '总裁办') {
            where += ` and u.department = '${params.userInfo.department}'`
        }
        if (params.userInfo.position != '主管') {
            where += ` and u.uid = '${params.userInfo.uid}'`
        }
    }
    // 条件筛选
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            where += ` and m.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            where += ` and m.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    // 分页
    let current = 0
    let pageSize = 10
    if (params.pagination.current) {
        current = params.pagination.current
    }
    if (params.pagination.pageSize) {
        pageSize = params.pagination.pageSize
    }
    let sql = `SELECT * FROM middleman m LEFT JOIN user u on u.uid = m.uid ${where} order by m.mid`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT m.*, u.name as u_name FROM middleman m LEFT JOIN user u on u.uid = m.uid ${where} order by mid desc limit ${pageSize} offset ${current * pageSize}`
        db.query(sql, (err, r) => {
            if (err) throw err;
            res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })

    })
})

// 添加中间人
router.post('/addMiddleman', (req, res) => {
    let time = new Date()
    let currentDate = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE uid = '${params.userInfo.uid}' and name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ code: 201, data: {}, msg: `${params.name} 已存在` })
        } else {
            let sql = `SELECT * FROM middleman`
            db.query(sql, (err, results) => {
                if (err) throw err;
                let mid = 'M' + `${results.length + 1}`.padStart(5, '0')
                let can_piao = params.can_piao ? `'${params.can_piao}'` : null
                let piao_type = params.piao_type ? `'${params.piao_type}'` : null
                let shui_point = params.shui_point ? `'${params.shui_point}'` : null
                let sql = `INSERT INTO middleman values('${mid}', '${params.type}', '${params.name}', '${params.liaison_name}', '${params.liaison_v}', '${params.liaison_phone}', '${params.pay_way}', ${can_piao}, ${piao_type}, ${shui_point}, '${params.pay_name}', '${params.pay_bank}', '${params.pay_account}', '${params.userInfo.uid}', '${currentDate}')`
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
    let time = new Date()
    let currentDate = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE uid = '${params.userInfo.uid}' and name = '${params.name}' and mid != '${params.mid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ code: 201, data: {}, msg: `${params.name} 已存在` })
        } else {
            let can_piao = params.can_piao ? `'${params.can_piao}'` : null
            let piao_type = params.piao_type ? `'${params.piao_type}'` : null
            let shui_point = params.shui_point ? `'${params.shui_point}'` : null
            console.log(params.piao_type, piao_type);
            let sql = `UPDATE middleman SET type = '${params.type}', name = '${params.name}', liaison_name = '${params.liaison_name}', liaison_v = '${params.liaison_v}', liaison_phone = '${params.liaison_phone}', pay_way = '${params.pay_way}', can_piao = ${can_piao}, piao_type = ${piao_type}, shui_point = ${shui_point}, pay_name = '${params.pay_name}', pay_bank = '${params.pay_bank}', pay_account = '${params.pay_account}' WHERE mid = '${params.mid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: {}, msg: `` })
            })
        }
    })
})

// 搜索所有中间人
router.post('/searchMiddlemans', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE name like '%${params.value}%' and uid = '${params.userInfo.uid}'`
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

module.exports = router