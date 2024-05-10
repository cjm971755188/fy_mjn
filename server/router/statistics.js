const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../config/db')
const { power, filter } = require('../function/power')

// 数量
router.post('/getCount', (req, res) => {
    let params = req.body
    let start_time = params.filtersDate.length === 2 ? params.filtersDate[0] : ''
    let end_time = params.filtersDate.length === 2 ? params.filtersDate[1] : '2000000000000'
    let sql = `SELECT u.name, c.status, COUNT(*) as count
                FROM chance c
                    INNER JOIN (SELECT * FROM user WHERE status != '失效') u ON u.uid = c.u_id 
                WHERE ${power(['u'], params.userInfo)} and c.status != '已失效' and (c.create_time >= '${start_time}' and c.create_time < '${end_time}' OR c.advance_time >= '${start_time}' and c.advance_time < '${end_time}' OR c.report_time >= '${start_time}' and c.report_time < '${end_time}')
                GROUP BY u.name, c.status
                ORDER BY u.name, c.status`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let chance = { find: 0, advance: 0, report: 0 }, name = [], find = [], advance = [], c_report = [], t_report = []
        for (let i = 0; i < results.length; i++) {
            name.push(results[i].name)
            switch (results[i].status) {
                case '待推进': chance.find += results[i].count; break;
                case '待报备': chance.advance += results[i].count; break;
                case '报备通过': chance.report += results[i].count; break;
                default: break;
            }
        }
        name = Array.from(new Set(name))
        for (let j = 0; j < name.length; j++) {
            let f = 0, a = 0, r = 0
            for (let i = 0; i < results.length; i++) {
                if (results[i].name === name[j]) {
                    switch (results[i].status) {
                        case '待推进': f += results[i].count; break;
                        case '待报备': f += results[i].count; a += results[i].count; break;
                        case '报备通过': f += results[i].count; a += results[i].count; r += results[i].count; break;
                        default: break;
                    }
                }
            }
            find.push(f)
            advance.push(a)
            c_report.push(r)
        }
        let sql = `SELECT u1.name, COUNT(DISTINCT t.tid) as count
                    FROM talent t
                        LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE status != '已失效' GROUP BY tid) ts0 ON ts0.tid = t.tid
                        LEFT JOIN talent_schedule ts ON ts.tsid = ts0.tsid
                        LEFT JOIN middleman m1 ON m1.mid = ts.m_id_1
                        LEFT JOIN middleman m2 ON m2.mid = ts.m_id_2
                        LEFT JOIN user u0 ON u0.uid = ts.u_id_0
                        LEFT JOIN talent_model tm ON tm.tid = t.tid AND tm.status != '已失效'
                        LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                        LEFT JOIN talent_model_schedule tms ON tms.tmsid = tms0.tmsid
                        LEFT JOIN (SELECT * FROM user WHERE status != '失效') u1 ON u1.uid = tms.u_id_1
                        LEFT JOIN (SELECT * FROM user WHERE status != '失效') u2 ON u2.uid = tms.u_id_2
                    WHERE ${power(['u1', 'u2'], params.userInfo)} and t.status != '已失效' and t.status != '报备驳回' and t.status != '已撤销' and t.status != '已拉黑' and t.status != '拉黑待审批' and t.cid = 'undefined'
                    GROUP BY u1.name
                    ORDER BY u1.name`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let talent = 0
            for (let i = 0; i < results.length; i++) {
                talent += results[i].count
                if (results[i].name === name[i]) {
                    t_report.push(results[i].count)
                } else {
                    t_report.push(0)
                }
            }
            let sql = `SELECT u.name, SUM(IF(c.advance_time IS NULL, NOW(), c.advance_time) - c.create_time)/COUNT(*) as advance_diff, 
                            SUM(IF(c.status = '待推进', 0, IF(c.report_time IS NULL, NOW(), c.report_time) - c.create_time))/COUNT(IF(c.status = '待推进', 0, 1)) as report_diff
                        FROM chance c
                            INNER JOIN (SELECT * FROM user WHERE status != '失效') u ON u.uid = c.u_id 
                        WHERE ${power(['u'], params.userInfo)} and c.status != '已失效'
                        GROUP BY u.name`
            db.query(sql, (err, results) => {
                if (err) throw err;
                let a = [], r = []
                for (let i = 0; i < results.length; i++) {
                    a.push({
                        value: (results[i].advance_diff / 1000000 / 3600 / 24).toFixed(2),
                        name: results[i].name
                    })
                    r.push({
                        value: (results[i].report_diff / 1000000 / 3600 / 24).toFixed(2),
                        name: results[i].name
                    })
                }
                res.send({ code: 200, data: { count: { chance, talent }, operate: { name: Array.from(new Set(name)), find, advance, c_report, t_report }, diff: { advance: a, report: r } }, msg: '' })
            })
        })
    })
})

// 各平台达人占比
router.post('/getPlatformTalent', (req, res) => {
    let params = req.body
    let start_time = params.filtersDate.length === 2 ? params.filtersDate[0] : ''
    let end_time = params.filtersDate.length === 2 ? params.filtersDate[1] : '2000000000000'
    let sql = `SELECT tm.platform, COUNT(DISTINCT tm.tid) as sum
                FROM talent_model tm
                    LEFT JOIN talent t ON t.tid = tm.tid and t.status != '已失效' and t.status != '报备驳回' and t.status != '已撤销' and t.status != '已拉黑'
                    LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' and create_time >= '${start_time}' and create_time < '${end_time}' GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                    LEFT JOIN talent_model_schedule tms1 ON tms1.tmsid = tms0.tmsid
                    LEFT JOIN (SELECT * FROM user WHERE status != '失效') u ON u.uid = tms1.u_id_1 OR u.uid = tms1.u_id_2
                WHERE ${power(['u'], params.userInfo)} and tm.status != '已失效'
                GROUP BY tm.platform
                ORDER BY sum DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let r = []
        for (let i = 0; i < results.length; i++) {
            r.push({
                value: results[i].sum,
                name: results[i].platform
            })
        }
        res.send({ code: 200, data: r, msg: '' })
    })
})

// 各个层级达人占比
router.post('/getClassTalent', (req, res) => {
    let params = req.body
    let start_time = params.filtersDate.length === 2 ? params.filtersDate[0] : ''
    let end_time = params.filtersDate.length === 2 ? params.filtersDate[1] : '2000000000000'
    let sql = `SELECT t.type, COUNT(DISTINCT t.tid) as sum
                FROM talent t
                    LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE status != '已失效' and create_time >= '${start_time}' and create_time < '${end_time}' GROUP BY tid) ts0 ON ts0.tid = t.tid
                    LEFT JOIN talent_schedule ts1 ON ts1.tsid = ts0.tsid
                    LEFT JOIN talent_model tm ON tm.tid = t.tid
                    LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' and create_time >= '${start_time}' and create_time < '${end_time}' GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                    LEFT JOIN talent_model_schedule tms1 ON tms1.tmsid = tms0.tmsid
                    LEFT JOIN user u1 ON u1.uid = tms1.u_id_1 
                    LEFT JOIN user u2 ON u2.uid = tms1.u_id_2
                WHERE ${power(['u1', 'u2'], params.userInfo)} and t.status != '已失效' and t.status != '报备驳回' and t.status != '已撤销' and t.status != '已拉黑'
                GROUP BY t.type
                ORDER BY sum DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let r = []
        for (let i = 0; i < results.length; i++) {
            r.push({
                value: results[i].sum,
                name: results[i].type
            })
        }
        res.send({ code: 200, data: r, msg: '' })
    })
})

// 线上达人类型占比
router.post('/getTypeTalent', (req, res) => {
    let params = req.body
    let start_time = params.filtersDate.length === 2 ? params.filtersDate[0] : ''
    let end_time = params.filtersDate.length === 2 ? params.filtersDate[1] : '2000000000000'
    let sql = `SELECT tm.account_type, COUNT(DISTINCT t.tid) as sum
                FROM talent_model tm 
                    LEFT JOIN talent t ON t.tid = tm.tid and t.status != '已失效' and t.status != '报备驳回' and t.status != '已撤销' and t.status != '已拉黑'
                    LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' and create_time >= '${start_time}' and create_time < '${end_time}' GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                    LEFT JOIN talent_model_schedule tms1 ON tms1.tmsid = tms0.tmsid
                    INNER JOIN (SELECT * FROM user WHERE status != '失效') u ON u.uid = tms1.u_id_1 OR u.uid = tms1.u_id_2
                WHERE ${power(['u'], params.userInfo)} and tm.model = '线上平台'
                GROUP BY tm.account_type
                ORDER BY sum DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let r = []
        for (let i = 0; i < results.length; i++) {
            r.push({
                value: results[i].sum,
                name: results[i].account_type
            })
        }
        res.send({ code: 200, data: r, msg: '' })
    })
})

// 各省份达人占比
router.post('/getProvinceTalent', (req, res) => {
    let params = req.body
    let sql = `SELECT t.province, COUNT(DISTINCT t.tid) as sum
                FROM talent t
                    LEFT JOIN talent_schedule ts ON ts.tid = t.tid
                WHERE t.status != '已失效' and t.status != '报备驳回' and t.status != '已撤销' and t.status != '已拉黑'
                    and ts.status != '已失效'
                    and ts.operate = '达人报备' 
                    and ts.examine_result = '通过'
                GROUP BY t.province
                ORDER BY province DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let r = []
        for (let i = 0; i < results.length; i++) {
            r.push({
                value: results[i].sum,
                name: results[i].province
            })
        }
        let sql = `SELECT t.province, COUNT(DISTINCT t.tid) as sum
                    FROM talent t
                        LEFT JOIN talent_schedule ts ON ts.tid = t.tid
                    WHERE t.status = '合作中'
                        and ts.status != '已失效'
                        and ts.operate = '达人报备' 
                        and ts.examine_result = '通过'
                    GROUP BY t.province
                    ORDER BY sum DESC
                    LIMIT 1`
        db.query(sql, (err, max) => {
            if (err) throw err;
            res.send({ code: 200, data: { data: r, max: max.length > 0 ? max[0].sum : 0 }, msg: '' })
        })
    })
})

// 
router.post('/getBISaleman', (req, res) => {
    let params = req.body
    let start_time = params.filtersDate.length === 2 ? dayjs(params.filtersDate[0]).format('YYYY-MM') : ''
    let sql = `SELECT bi_saleman.* 
                FROM bi_saleman 
                    LEFT JOIN user u ON u.name = bi_saleman.name 
                WHERE ((${power(['u'], params.userInfo)}) ${params.userInfo.uid === 'MJN00025' ? `or u.name IS NULL` : ''})and goal IS NOT NULL and month = '${start_time}'
                ORDER BY CASE bi_saleman.name
                    WHEN '合计' THEN 1
                    WHEN '自然流量' THEN 2
                    ELSE 3
                END ASC, goal DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, msg: '' })
    })
})

// 添加
router.post('/addGoal', (req, res) => {
    let params = req.body
    let sql = `UPDATE bi_saleman SET goal = '${params.goal}' WHERE name = '${params.name}' and month = '${dayjs(params.month).format('YYYY-MM')}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `添加成功` })
    })
})

module.exports = router