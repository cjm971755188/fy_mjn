const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');
const sendRobot = require('../api/ddrobot')
const { power, filter } = require('../function/power')

// 获取拉黑达人列表
router.post('/getTalentBlackList', (req, res) => {
    let params = req.body
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT SQL_CALC_FOUND_ROWS z.* 
                FROM (
                    (SELECT b.bid, b.name, bs1.reason as reason_b, bs1.create_uid as u_id_b, u1.name as u_name_b, bs3.reason as reason_r, bs3.create_uid as u_id_r, u2.name as u_name_r, b.status
                    FROM black b
                        LEFT JOIN (SELECT bid, MAX(bsid) as bsid FROM black_schedule WHERE operate != '拉黑释放' and status != '已失效' GROUP BY bid) bs0 ON bs0.bid = b.bid
                        LEFT JOIN black_schedule bs1 ON bs1.bsid = bs0.bsid
                        LEFT JOIN user u1 ON u1.uid = bs1.create_uid
                        LEFT JOIN (SELECT bid, MAX(bsid) as bsid FROM black_schedule WHERE operate = '拉黑释放' and status != '已失效' GROUP BY bid) bs2 ON bs2.bid = b.bid
                        LEFT JOIN black_schedule bs3 ON bs3.bsid = bs2.bsid
                        LEFT JOIN user u2 ON u2.uid = bs3.create_uid
                    ${power(['u1', 'u2'], params.userInfo)} and b.status != '已失效')
                    UNION
                    (SELECT t.tid, t.name, ts1.black_note as reason_b, ts1.create_uid as u_id_b, u1.name as u_name_b, ts3.black_note as reason_r, ts3.create_uid as u_id_r, u2.name as u_name_r, t.status
                    FROM talent t
                        LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE operate != '拉黑释放' and status != '已失效' GROUP BY tid) ts0 ON ts0.tid = t.tid
                        LEFT JOIN talent_schedule ts1 ON ts1.tsid = ts0.tsid
                        LEFT JOIN user u1 ON u1.uid = ts1.create_uid
                        LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE operate = '拉黑释放' and status != '已失效' GROUP BY tid) ts2 ON ts2.tid = t.tid
                        LEFT JOIN talent_schedule ts3 ON ts3.tsid = ts2.tsid
                        LEFT JOIN user u2 ON u2.uid = ts3.create_uid
                    ${power(['u1', 'u2'], params.userInfo)} and (t.status = '已拉黑' or t.status = '拉黑待审批' or t.status = '释放待审批'))
                ) z 
                ${filter('chance', params.filters)}
                ORDER BY z.bid DESC
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

// 拉黑达人
router.post('/addBlack', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let reason = params.reason ? `'${params.reason}'` : null
    let sql = 'SELECT * FROM black'
    db.query(sql, (err, results) => {
        if (err) throw err;
        let bid = 'B' + `${results.length + 1}`.padStart(7, '0')
        let sql = `INSERT INTO black VALUES('${bid}', '${params.name}', '拉黑待审批')`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = 'SELECT * FROM black_schedule'
            db.query(sql, (err, results) => {
                if (err) throw err;
                let bsid = 'BS' + `${results.length + 1}`.padStart(7, '0')
                let sql = `INSERT INTO black_schedule VALUES('${bsid}', '${bid}', ${reason}, null, '${params.userInfo.uid}', ${time}, '拉黑达人', '需要审批', 'MJN00027', null, null, null, '待审批')`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    let sql = `SELECT * FROM user WHERE uid = 'MJN00027'`
                    db.query(sql, (err, results_e) => {
                        if (err) throw err;
                        sendRobot(
                            results_e[0].secret,
                            results_e[0].url,
                            `${params.userInfo.name} 拉黑 ${params.name}`,
                            `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：拉黑达人 \n\n ### 拉黑原因：${params.reason || ''} \n\n ### 达人昵称：${params.name} \n\n ### 审批人员：@${results_e[0].phone}`,
                            `http://1.15.89.163:5173`,
                            [results_e[0].phone],
                            false
                        )
                        res.send({ code: 200, data: [], msg: `拉黑成功` })
                    })
                })
            })
        })
    })
})

// 修改信息
router.post('/editBlack', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT * FROM black_schedule`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let bsid = 'BS' + `${results.length + 1}`.padStart(7, '0')
        let sql = `SELECT bs0.*
                        FROM black_schedule bs0 
                            INNER JOIN (SELECT bid, MAX(bsid) as bsid FROM black_schedule WHERE status = '生效中' GROUP BY bid) bs1 ON bs1.bsid = bs0.bsid
                        WHERE bs0.bid = '${params.bid}'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `INSERT INTO black_schedule VALUES('${bsid}', '${params.bid}',`
            for (const key in results[0]) {
                let isAdd = true
                if (Object.hasOwnProperty.call(results[0], key)) {
                    if (isAdd && key === 'bsid') {
                        isAdd = false
                        continue
                    } else if (isAdd && key === 'bid') {
                        isAdd = false
                        continue
                    } else if (isAdd && key === 'create_uid') {
                        isAdd = false
                        sql += ` '${params.userInfo.uid}',`
                    } else if (isAdd && key === 'create_time') {
                        isAdd = false
                        sql += ` '${time}',`
                    } else if (isAdd && key === 'operate') {
                        isAdd = false
                        sql += ` '${params.operate}',`
                    } else if (isAdd && key === 'history_other_info') {
                        isAdd = false
                        sql += params.ori === null ? ` null,` : ` '${params.ori}',`
                    } else {
                        for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                            if (isAdd && Object.keys(params.new)[i] === key) {
                                isAdd = false
                                sql += Object.values(params.new)[i] === null ? ` null,` : ` '${Object.values(params.new)[i]}',`
                            }
                        }
                        if (isAdd && key === 'need_examine') {
                            isAdd = false
                            sql += ` '无需审批',`
                        } else if (isAdd && (key === 'examine_uid' || key === 'examine_time' || key === 'examine_result' || key === 'examine_note')) {
                            isAdd = false
                            sql += ` null,`
                        } else if (isAdd) {
                            isAdd = false
                            sql += results[0][key] === null ? ` null,` : ` '${results[0][key]}',`
                        }
                    }
                }
            }
            sql = sql.substring(0, sql.length - 1)
            sql += `)`
            db.query(sql, (err, results) => {
                if (err) throw err;
                if (params.new.name) {
                    let sql = `UPDATE black SET name = '${params.new.name}' WHERE bid = '${params.bid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        res.send({ code: 200, data: [], msg: `${params.operate}成功` })
                    })
                } else {
                    res.send({ code: 200, data: [], msg: `${params.operate}成功` })
                }
            })
        })
    })
})

// 审批拉黑达人
router.post('/examBlack', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let reason = params.reason ? `'${params.reason}'` : null
    let sql = `UPDATE black SET status = '${params.type === '拉黑待审批' ? (params.exam ? '已拉黑' : '已失效') : (params.exam ? '已失效' : '已拉黑')}' WHERE bid = '${params.bid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `UPDATE black_schedule 
                    SET examine_time = '${time}', examine_uid = '${params.userInfo.uid}', examine_result = '${params.exam ? '通过' : '驳回'}', examine_note = ${reason}, status = '${params.exam ? '生效中' : '已失效'}' 
                    WHERE bid = '${params.bid}' and status = '待审批'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `SELECT * FROM black WHERE bid = '${params.bid}'`
            db.query(sql, (err, results_b) => {
                if (err) throw err;
                let sql = `SELECT * FROM user WHERE uid = '${params.uid}'`
                db.query(sql, (err, results_u) => {
                    if (err) throw err;
                    sendRobot(
                        results_u[0].secret,
                        results_u[0].url,
                        `${params.userInfo.name} ${params.type === '拉黑待审批' ? '拉黑' : '释放'} ${results_b[0].name}`,
                        `### 申请人员：@${results_u[0].phone} \n\n ### 申请操作：${params.type === '拉黑待审批' ? '拉黑达人' : '拉黑释放'} \n\n ### 达人昵称：${results_b[0].name} \n\n ### 审批人员：${params.userInfo.name} \n\n ### 审批结果：${params.exam ? '通过' : '驳回'} ${params.exam ? `` : `\n\n ### 驳回理由：${reason}`}`,
                        `http://1.15.89.163:5173`,
                        [results_u[0].phone],
                        false
                    )
                    res.send({ code: 200, data: [], msg: `审批成功` })
                })
            })
        })
    })
})

// 拉黑释放
router.post('/releaseTalent', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let reason = params.reason ? `'${params.reason}'` : null
    let sql = 'SELECT * FROM black_schedule'
    db.query(sql, (err, results) => {
        if (err) throw err;
        let bsid = 'BS' + `${results.length + 1}`.padStart(7, '0')
        let sql = `INSERT INTO black_schedule VALUES('${bsid}', '${params.bid}', ${reason}, null, '${params.userInfo.uid}', ${time}, '拉黑释放', '需要审批', null, null, null, null, '待审批')`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `UPDATE black SET status = '释放待审批' WHERE bid = '${params.bid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                let sql = `SELECT * FROM black WHERE bid = '${params.bid}'`
                db.query(sql, (err, results_b) => {
                    if (err) throw err;
                    let sql = `SELECT * FROM user WHERE uid = 'MJN00027'`
                    db.query(sql, (err, results_e) => {
                        if (err) throw err;
                        sendRobot(
                            results_e[0].secret,
                            results_e[0].url,
                            `${params.userInfo.name} 释放 ${results_b[0].name}`,
                            `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：拉黑释放 \n\n ### 释放原因：${params.reason || ''} \n\n ### 达人昵称：${results_b[0].name} \n\n ### 审批人员：@${results_e[0].phone}`,
                            `http://1.15.89.163:5173`,
                            [results_e[0].phone],
                            false
                        )
                        res.send({ code: 200, data: [], msg: `释放成功` })
                    })
                })
            })
        })
    })
})

// 审批释放达人
router.post('/examRelease', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let note = params.note ? `'${params.note}'` : null
    let sql = `UPDATE black SET status = '${params.exam ? '已失效' : '已拉黑'}', r_exam_note = ${note} WHERE bid = '${params.bid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT * FROM user WHERE uid = '${params.uid}'`
        db.query(sql, (err, results_u) => {
            if (err) throw err;
            sendRobot(
                results_u[0].secret,
                results_u[0].url,
                `${params.userInfo.name} 释放 ${params.name}`,
                `### 申请人员：@${results_u[0].phone} \n\n ### 申请操作：释放达人 \n\n ### 达人昵称：${params.name} \n\n ### 审批人员：${params.userInfo.name} \n\n ### 审批结果：${params.exam ? '通过' : '驳回'} ${params.exam ? `` : `\n\n ### 驳回理由：${note}`}`,
                `http://1.15.89.163:5173`,
                [results_u[0].phone],
                false
            )
            res.send({ code: 200, data: [], msg: `审批成功` })
        })
    })
})

module.exports = router