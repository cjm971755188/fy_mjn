const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');

// 达人管理-日常统计
router.post('/getTalentStatistics', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where status != '失效'`
    if (params.userInfo.position !== '管理员' && params.userInfo.position !== '总裁') {
        if (params.userInfo.position === '副总') {
            whereUser += ` and department = '${params.userInfo.department}'`
        }
        if (params.userInfo.department === '主管') {
            whereUser += ` and department = '${params.userInfo.department}' and company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
        }
    }
    let whereFilter = ``
    let start_time = params.filtersDate.length === 2 ? params.filtersDate[0] : ''
    let end_time = params.filtersDate.length === 2 ? params.filtersDate[1] : '2000000000000'
    let sql = `SELECT COUNT(DISTINCT IF(c.create_time >= '${start_time}' and c.create_time < '${end_time}', c.cid, null)) as find, 
                    COUNT(DISTINCT IF(c.status != '待推进' and c.advance_time >= '${start_time}' and c.advance_time < '${end_time}', c.cid, null)) as advance, 
                    COUNT(DISTINCT IF(c.status != '待推进' and c.status != '待报备' and c.report_time >= '${start_time}' and c.report_time < '${end_time}', c.cid, null)) as report, 
                    COUNT(DISTINCT IF(c.status = '待审批' and c.report_time >= '${start_time}' and c.report_time < '${end_time}', c.cid, null)) as wait, 
                    COUNT(DISTINCT IF(c.status = '报备通过' and c.report_time >= '${start_time}' and c.report_time < '${end_time}', c.cid, null)) as yes, 
                    COUNT(DISTINCT IF(c.status = '报备驳回' and c.report_time >= '${start_time}' and c.report_time < '${end_time}', c.cid, null)) as no 
                FROM chance c
                    INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = c.u_id`
    db.query(sql, (err, chance) => {
        if (err) throw err;
        let sql = `SELECT COUNT(DISTINCT IF(t.cid = 'undefined', t.tid, null)) as history, 
                        COUNT(DISTINCT IF(t.cid = 'undefined' and t.status != '已失效' and t.status like '%待审批', t.tid, null)) as history_wait,
                        COUNT(DISTINCT IF(t.status != '已失效', t.tid, null)) as cooperate,
                        COUNT(DISTINCT IF(t.status != '已失效' and t.status like '%待审批', t.tid, null)) as cooperate_wait
                    FROM talent t
                        INNER JOIN talent_schedule ts ON ts.tid = t.tid and ts.operate = '达人报备' and ts.examine_result = '通过' and ts.examine_time >= '${start_time}' and ts.examine_time < '${end_time}'
                        LEFT JOIN talent_model tm ON tm.tid = t.tid
                        LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                        LEFT JOIN talent_model_schedule tms1 ON tms1.tmsid = tms0.tmsid
                        INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = tms1.u_id_1 OR u.uid = tms1.u_id_2`
        db.query(sql, (err, talent) => {
            if (err) throw err;
            res.send({
                code: 200, data: {
                    chance: { find: chance[0].find, advance: chance[0].advance, report: chance[0].report, wait: chance[0].wait, yes: chance[0].yes, no: chance[0].no },
                    talent: { history: talent[0].history, cooperate: talent[0].cooperate, history_wait: talent[0].history_wait, cooperate_wait: talent[0].cooperate_wait }
                }, msg: ''
            })
        })
    })
})

// 达人管理-各商务商机操作
router.post('/getSalemansChanceOprate', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where u.status != '失效' and u.department = '事业部' and u.position != '副总'`
    if (params.userInfo.position !== '管理员' && params.userInfo.position !== '总裁') {
        if (params.userInfo.position === '副总') {
            whereUser += ` and u.department = '${params.userInfo.department}'`
        }
        if (params.userInfo.department === '主管') {
            whereUser += ` and u.department = '${params.userInfo.department}' and u.company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and u.uid = '${params.userInfo.uid}'`
        }
    }
    let whereFilter = ``
    let start_time = params.filtersDate.length === 2 ? params.filtersDate[0] : ''
    let end_time = params.filtersDate.length === 2 ? params.filtersDate[1] : '2000000000000'
    let sql = `SELECT a.uid, a.name, a.find, a.advance, b.c_report, b.t_report
                FROM (
                    SELECT u.uid, u.name, SUM(IF(c.create_time >= '${start_time}' and c.create_time < '${end_time}', 1, 0)) as find, 
                        SUM(IF(c.advance_time >= '${start_time}' and c.advance_time < '${end_time}', 1, 0)) as advance
                    FROM user u
                        LEFT JOIN chance c ON u.uid = c.u_id
                    ${whereUser}
                    GROUP BY u.uid, u.name
                ) a, (
                    SELECT u.uid, u.name, SUM(IF(ts.create_time >= '${start_time}' and ts.create_time < '${end_time}' and t.cid != 'undefined', 1, 0)) as c_report, 
                        SUM(IF(ts.create_time >= '${start_time}' and ts.create_time < '${end_time}' and t.cid = 'undefined', 1, 0)) as t_report
                    FROM user u
                        LEFT JOIN talent_schedule ts ON ts.create_uid = u.uid and ts.operate = '达人报备' and ts.examine_result = '通过'
                        LEFT JOIN talent t ON t.tid = ts.tid 
                    ${whereUser}
                    GROUP BY u.uid, u.name
                ) b
                WHERE a.uid = b.uid
                ORDER BY uid`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let name = [], find = [], advance = [], c_report = [], t_report = []
        for (let i = 0; i < results.length; i++) {
            name.push(results[i].name)
            find.push(results[i].find)
            advance.push(results[i].advance)
            c_report.push(results[i].c_report)
            t_report.push(results[i].t_report)
        }
        res.send({ code: 200, data: { name, find, advance, c_report, t_report }, msg: '' })
    })
})

// 达人管理-推进报备平均时长
router.post('/getAdReTimeDiff', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where u.status != '失效' and u.department = '事业部' and u.position != '副总'`
    if (params.userInfo.position !== '管理员' && params.userInfo.position !== '总裁') {
        if (params.userInfo.position === '副总') {
            whereUser += ` and u.department = '${params.userInfo.department}'`
        }
        if (params.userInfo.department === '主管') {
            whereUser += ` and u.department = '${params.userInfo.department}' and u.company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and u.uid = '${params.userInfo.uid}'`
        }
    }
    let whereFilter = ``
    let start_time = params.filtersDate.length === 2 ? params.filtersDate[0] : ''
    let end_time = params.filtersDate.length === 2 ? params.filtersDate[1] : '2000000000000'
    let sql = `SELECT u.uid, u.name, SUM(c.advance_time - c.create_time)/COUNT(*) as diff
                FROM user u
                    LEFT JOIN chance c ON c.u_id = u.uid
                ${whereUser} 
                    and c.advance_time IS NOT NULL
                    and c.advance_time >= '${start_time}'
                    and c.advance_time < '${end_time}'
                GROUP BY u.uid, u.name
                ORDER BY diff DESC`
    db.query(sql, (err, advance) => {
        if (err) throw err;
        let a = []
        for (let i = 0; i < advance.length; i++) {
            a.push({
                value: (advance[i].diff / 1000 / 3600).toFixed(2),
                name: advance[i].name
            })
        }
        let sql = `SELECT u.uid, u.name, SUM(c.advance_time - c.create_time)/COUNT(*) as diff
                    FROM user u
                        LEFT JOIN chance c ON c.u_id = u.uid
                    ${whereUser} 
                        and c.report_time IS NOT NULL
                        and c.report_time >= '${start_time}'
                        and c.report_time < '${end_time}'
                    GROUP BY u.uid, u.name
                    ORDER BY diff DESC`
        db.query(sql, (err, report) => {
            if (err) throw err;
            let r = []
            for (let i = 0; i < report.length; i++) {
                r.push({
                    value: (report[i].diff / 1000 / 3600).toFixed(2),
                    name: report[i].name
                })
            }
            res.send({ code: 200, data: { advance: a, report: r }, msg: '' })
        })
    })
})

// 达人管理-各平台达人占比
router.post('/getPlatformTalent', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where status != '失效' and department = '事业部' and position != '副总'`
    if (params.userInfo.position !== '管理员' && params.userInfo.position !== '总裁') {
        if (params.userInfo.position === '副总') {
            whereUser += ` and department = '${params.userInfo.department}'`
        }
        if (params.userInfo.department === '主管') {
            whereUser += ` and department = '${params.userInfo.department}' and company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
        }
    }
    let whereFilter = ``
    let start_time = params.filtersDate.length === 2 ? params.filtersDate[0] : ''
    let end_time = params.filtersDate.length === 2 ? params.filtersDate[1] : '2000000000000'
    let sql = `SELECT tm.platform, COUNT(DISTINCT tm.tid) as sum
                FROM talent_model tm
                    LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' and create_time >= '${start_time}' and create_time < '${end_time}' GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                    LEFT JOIN talent_model_schedule tms1 ON tms1.tmsid = tms0.tmsid
                    INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = tms1.u_id_1 OR u.uid = tms1.u_id_2
                WHERE tm.status != '已失效'
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

// 达人管理-各省份达人占比
router.post('/getProvinceTalent', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where u.status != '失效' and u.department = '事业部' and u.position != '副总'`
    if (params.userInfo.position !== '管理员' && params.userInfo.position !== '总裁') {
        if (params.userInfo.position === '副总') {
            whereUser += ` and u.department = '${params.userInfo.department}'`
        }
        if (params.userInfo.department === '主管') {
            whereUser += ` and u.department = '${params.userInfo.department}' and u.company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and u.uid = '${params.userInfo.uid}'`
        }
    }
    let whereFilter = ``
    let start_time = params.filtersDate.length === 2 ? params.filtersDate[0] : ''
    let end_time = params.filtersDate.length === 2 ? params.filtersDate[1] : '2000000000000'
    let sql = `SELECT t.province, COUNT(DISTINCT t.tid) as sum
                FROM talent t
                    LEFT JOIN talent_schedule ts ON ts.tid = t.tid
                WHERE t.status != '已失效'
                    and ts.status != '已失效'
                    and ts.operate = '达人报备' 
                    and ts.examine_result = '通过' 
                    and ts.create_time >= '${start_time}'
                    and ts.create_time < '${end_time}'
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
                    WHERE t.status != '已失效'
                        and ts.status != '已失效'
                        and ts.operate = '达人报备' 
                        and ts.examine_result = '通过' 
                        and ts.create_time >= '${start_time}'
                        and ts.create_time < '${end_time}'
                    GROUP BY t.province
                    ORDER BY sum DESC
                    LIMIT 1`
        db.query(sql, (err, max) => {
            if (err) throw err;
            res.send({ code: 200, data: { data: r, max: max.length > 0 ? max[0].sum : 0 }, msg: '' })
        })
    })
})

module.exports = router