const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../config/db')

// 获取中间人列表
router.post('/getMiddlemanList', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `WHERE status != '失效' and status != '测试'`
    if (params.userInfo.position !== '管理员' && params.userInfo.position !== '总裁') {
        if (params.userInfo.position === '副总') {
            whereUser += ` and department = '${params.userInfo.department}'`
        }
        if (params.userInfo.position === '主管') {
            whereUser += ` and department = '${params.userInfo.department}' and company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
        }
    }
    // 条件筛选
    let whereFilter = `where z.status != '失效'`
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            whereFilter += ` and z.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            whereFilter += ` and z.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT z.* FROM (
                SELECT m.* FROM (
                    SELECT a.mid FROM (
                        (SELECT m.mid , m.u_id as u_id_1, null as u_id_2 FROM middleman m)
                        UNION
                        (SELECT m1.mid, tms0.u_id_1, tms0.u_id_2
                            FROM talent t
                                LEFT JOIN (SELECT tid, MAX(tsid) tsid FROM talent_schedule ts GROUP BY tid) ts1 ON ts1.tid = t.tid
                                LEFT JOIN talent_schedule ts0 ON ts0.tsid = ts1.tsid
                                LEFT JOIN middleman m1 ON m1.mid = ts0.m_id_1
                                LEFT JOIN talent_model tm ON tm.tid = t.tid
                                LEFT JOIN (SELECT tmid, MAX(tmsid) tmsid FROM talent_model_schedule tms GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                                LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid)
                        UNION
                        (SELECT m2.mid, tms0.u_id_1, tms0.u_id_2
                            FROM talent t
                                LEFT JOIN (SELECT tid, MAX(tsid) tsid FROM talent_schedule ts GROUP BY tid) ts1 ON ts1.tid = t.tid
                                LEFT JOIN talent_schedule ts0 ON ts0.tsid = ts1.tsid
                                LEFT JOIN middleman m2 ON m2.mid = ts0.m_id_2
                                LEFT JOIN talent_model tm ON tm.tid = t.tid
                                LEFT JOIN (SELECT tmid, MAX(tmsid) tmsid FROM talent_model_schedule tms GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                                LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid)
                    ) a
                        INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = a.u_id_1
                        LEFT JOIN (SELECT * FROM user ${whereUser}) u2 ON u2.uid = a.u_id_2
                    GROUP BY a.mid
                    ) b
                        LEFT JOIN middleman m ON m.mid = b.mid
                ) z
                ${whereFilter}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let s = sql + ` LIMIT ${pageSize} OFFSET ${current * pageSize}`
        db.query(s, (err, r) => {
            if (err) throw err;
            res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })
    })
})

// 添加中间人
router.post('/addMiddleman', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM middleman WHERE u_id = '${params.userInfo.uid}' and name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `${params.name} 已存在` })
        } else {
            let sql = `SELECT * FROM middleman`
            db.query(sql, (err, results) => {
                if (err) throw err;
                let mid = 'M' + `${results.length + 1}`.padStart(7, '0')
                let can_piao = params.can_piao ? `'${params.can_piao}'` : null
                let piao_type = params.piao_type ? `'${params.piao_type}'` : null
                let shui_point = params.shui_point ? `'${params.shui_point}'` : null
                let sql = `INSERT INTO middleman values('${mid}', '${params.type}', '${params.name}', '${params.liaison_name}', '${params.liaison_v}', '${params.liaison_phone}', '${params.pay_way}', ${can_piao}, ${piao_type}, ${shui_point}, '${params.pay_name}', '${params.pay_bank}', '${params.pay_account}', null, '正常', '${params.userInfo.uid}', '${dayjs().valueOf()}')`
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
    let sql = `SELECT * FROM middleman WHERE u_id = '${params.userInfo.uid}' and name = '${params.name}' and mid != '${params.mid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ code: 201, data: [], msg: `${params.name} 已存在` })
        } else {
            let can_piao = params.can_piao ? `'${params.can_piao}'` : null
            let piao_type = params.piao_type ? `'${params.piao_type}'` : null
            let shui_point = params.shui_point ? `'${params.shui_point}'` : null
            let sql = `UPDATE middleman SET type = '${params.type}', name = '${params.name}', liaison_name = '${params.liaison_name}', liaison_v = '${params.liaison_v}', liaison_phone = '${params.liaison_phone}', pay_way = '${params.pay_way}', can_piao = ${can_piao}, piao_type = ${piao_type}, shui_point = ${shui_point}, pay_name = '${params.pay_name}', pay_bank = '${params.pay_bank}', pay_account = '${params.pay_account}', history_other_info = '${params.history_other_info}' WHERE mid = '${params.mid}'`
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
    if (params.userInfo.position !== '管理员' && params.userInfo.position !== '总裁') {
        if (params.userInfo.position === '副总') {
            whereUser += ` and department = '${params.userInfo.department}'`
        }
        if (params.userInfo.position === '主管') {
            whereUser += ` and department = '${params.userInfo.department}' and company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
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