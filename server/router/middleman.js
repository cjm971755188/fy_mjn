const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../config/db')
const { power, filter } = require('../function/power')

// 获取中间人列表
router.post('/getMiddlemanList', (req, res) => {
    let params = req.body
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT SQL_CALC_FOUND_ROWS z.* 
                FROM (
                    SELECT m.*, u.name as u_name
                    FROM middleman m
                        LEFT JOIN user u ON u.uid  = m.u_id
                    WHERE ${power(['u'], params.userInfo)}
                ) z
                WHERE ${filter('normal', params.filters)}
                ORDER BY z.mid DESC
                LIMIT ${pageSize} OFFSET ${current * pageSize}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT FOUND_ROWS() as count`
        db.query(sql, (err, count) => {
            if (err) throw err;
            res.send({ code: 200, data: results, pagination: { ...params.pagination, total: count[0].count }, msg: `` })
        })
    })
})

// 添加中间人
router.post('/addMiddleman', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE u_id = '${params.userInfo.up_uid === 'null' || params.userInfo.up_uid === null ? params.userInfo.uid : params.userInfo.up_uid}' and name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `${params.name} 已存在` })
        } else {
            let sql = `SELECT * FROM middleman`
            db.query(sql, (err, results) => {
                if (err) throw err;
                let mid = 'M' + `${results.length + 1}`.padStart(7, '0')
                let liaison_phone = params.liaison_phone ? `'${params.liaison_phone}'` : null
                let can_piao = params.can_piao ? `'${params.can_piao}'` : null
                let piao_type = params.piao_type ? `'${params.piao_type}'` : null
                let shui_point = params.shui_point ? `'${params.shui_point}'` : null
                let pay_name = params.pay_name ? `'${params.pay_name}'` : null
                let pay_bank = params.pay_bank ? `'${params.pay_bank}'` : null
                let pay_account = params.pay_account ? `'${params.pay_account}'` : null
                let sql = `INSERT INTO middleman values('${mid}', '${params.type}', '${params.name}', '${params.liaison_name}', '${params.liaison_v}', ${liaison_phone}, '${params.pay_way}', ${can_piao}, ${piao_type}, ${shui_point}, ${pay_name}, ${pay_bank}, ${pay_account}, null, '正常', '${params.userInfo.up_uid === 'null' || params.userInfo.up_uid === null ? params.userInfo.uid : params.userInfo.up_uid}', '${dayjs().valueOf()}')`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `` })
                })
            })
        }
    })
})

// 修改中间人信息
router.post('/editMiddleman', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE u_id = '${params.userInfo.up_uid === 'null' || params.userInfo.up_uid === null ? params.userInfo.uid : params.userInfo.up_uid}' and name = '${params.name}' and mid != '${params.mid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ code: 201, data: [], msg: `${params.name} 已存在` })
        } else {
            let liaison_phone = params.liaison_phone ? `'${params.liaison_phone}'` : null
            let can_piao = params.can_piao ? `'${params.can_piao}'` : null
            let piao_type = params.piao_type ? `'${params.piao_type}'` : null
            let shui_point = params.shui_point ? `'${params.shui_point}'` : null
            let pay_name = params.pay_name ? `'${params.pay_name}'` : null
            let pay_bank = params.pay_bank ? `'${params.pay_bank}'` : null
            let pay_account = params.pay_account ? `'${params.pay_account}'` : null
            let sql = `UPDATE middleman SET type = '${params.type}', name = '${params.name}', liaison_name = '${params.liaison_name}', liaison_v = '${params.liaison_v}', liaison_phone = ${liaison_phone}, pay_way = '${params.pay_way}', can_piao = ${can_piao}, piao_type = ${piao_type}, shui_point = ${shui_point}, pay_name = ${pay_name}, pay_bank = ${pay_bank}, pay_account = ${pay_account}, history_other_info = '${params.history_other_info}' WHERE mid = '${params.mid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `` })
            })
        }
    })
})

// 获取中间人下拉框
router.post('/getmiddlemansItems', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where status != '失效' and status != '测试'`
    if (params.userInfo.department === '事业部') {
        if (params.userInfo.position === '副总' || (params.userInfo.company === '总公司' && params.userInfo.position === '助理')) {
            whereUser += ` and department = '${params.userInfo.department}'`
        }
        if (params.userInfo.position === '主管') {
            whereUser += ` and department = '${params.userInfo.department}' and company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
        }
        if (params.userInfo.company !== '总公司' && params.userInfo.position === '助理') {
            whereUser += ` and uid = '${params.userInfo.up_uid}'`
        }
    }
    let sql = `(SELECT m.* 
                    FROM middleman m 
                    INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = m.u_id)
                UNION
                (SELECT m1.*
                    FROM talent t
                        LEFT JOIN (SELECT tid, MAX(tsid) tsid FROM talent_schedule ts GROUP BY tid) ts1 ON ts1.tid = t.tid
                        LEFT JOIN talent_schedule ts0 ON ts0.tsid = ts1.tsid
                        LEFT JOIN middleman m1 ON m1.mid = ts0.m_id_1
                        LEFT JOIN talent_model tm ON tm.tid = t.tid
                        LEFT JOIN (SELECT tmid, MAX(tmsid) tmsid FROM talent_model_schedule tms GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                        LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid
                        INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = tms0.u_id_1)
                UNION
                (SELECT m2.*
                    FROM talent t
                        LEFT JOIN (SELECT tid, MAX(tsid) tsid FROM talent_schedule ts GROUP BY tid) ts1 ON ts1.tid = t.tid
                        LEFT JOIN talent_schedule ts0 ON ts0.tsid = ts1.tsid
                        LEFT JOIN middleman m2 ON m2.mid = ts0.m_id_2
                        LEFT JOIN talent_model tm ON tm.tid = t.tid
                        LEFT JOIN (SELECT tmid, MAX(tmsid) tmsid FROM talent_model_schedule tms GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                        LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid
                        INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = tms0.u_id_1)`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let middlemans = []
        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            if (element.mid) {
                middlemans.push({
                    label: element.name,
                    value: element.mid
                })
            }
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