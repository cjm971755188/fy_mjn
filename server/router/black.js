const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');
const sendRobot = require('../api/ddrobot')
const { power, filter, isNull } = require('../function/power')

// 获取拉黑达人列表
router.post('/getTalentBlackList', (req, res) => {
    let params = req.body
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT SQL_CALC_FOUND_ROWS z.* 
                FROM (
                    (SELECT	tb.tbid, tb.name, tb.b_reason, tb.b_uid, u1.name as b_name, tb.b_time, tb.r_reason, tb.r_uid, u2.name as r_name, tb.status
                    FROM talent_black tb
                        LEFT JOIN user u1 ON u1.uid = tb.b_uid
                        LEFT JOIN user u2 ON u2.uid = tb.r_uid
                    WHERE tb.status != '失效')
                    UNION
                    (SELECT t.tid, t.name, ts1.black_note, ts1.create_uid, u1.name, ts1.create_time, ts3.black_note, ts3.create_uid, u2.name, IF(t.status = '已拉黑', '正常', t.status)
                    FROM talent t
                        LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE operate != '拉黑释放' and status != '已失效' GROUP BY tid) ts0 ON ts0.tid = t.tid
                        LEFT JOIN talent_schedule ts1 ON ts1.tsid = ts0.tsid
                        LEFT JOIN user u1 ON u1.uid = ts1.create_uid
                        LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE operate = '拉黑释放' and status != '已失效' GROUP BY tid) ts2 ON ts2.tid = t.tid
                        LEFT JOIN talent_schedule ts3 ON ts3.tsid = ts2.tsid
                        LEFT JOIN user u2 ON u2.uid = ts3.create_uid
                    WHERE t.status = '已拉黑' or t.status = '拉黑待审批' or t.status = '释放待审批')
                ) z 
                ${filter('normal', params.filters)}
                ORDER BY z.b_time DESC
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
    let sql = `INSERT INTO talent_black(name, b_uid, b_reason, b_time, status) VALUES('${params.name}', '${params.userInfo.uid}', ${isNull(params.b_reason, 'normal')}, ${time}, '拉黑待审批')`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT * FROM user WHERE uid = 'MJN00027'`
        db.query(sql, (err, results_e) => {
            if (err) throw err;
            sendRobot(
                results_e[0].secret,
                results_e[0].url,
                {
                    "msgtype": "markdown",
                    "markdown": {
                        "title": `${params.userInfo.name} 拉黑 ${params.name}`,
                        "text": `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：拉黑达人 \n\n ### 拉黑原因：${params.b_reason || '无'} \n\n ### 达人昵称：${params.name} \n\n ### 审批人员：@${results_e[0].phone} \n> ##### 网址：http://1.15.89.163:5173`
                    },
                    "at": {
                        "atMobiles": [results_e[0].phone],
                        "isAtAll": false
                    }
                }
            )
            res.send({ code: 200, data: [], msg: `拉黑成功` })
        })
    })
})

// 修改信息
router.post('/editBlack', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM talent_black WHERE name = '${params.name}' and tbid != '${params.tbid}' and status != '失效'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `达人名字重复` })
        } else {
            let sql = `UPDATE talent_black SET`
            for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
                if (['tbid'].indexOf(Object.keys(params)[i]) <= -1) {
                    sql += ` ${Object.keys(params)[i]} = '${Object.values(params)[i]}',`
                }
            }
            sql = sql.substring(0, sql.length - 1)
            sql += ` WHERE tbid = '${params.tbid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

// 审批拉黑达人
router.post('/examBlack', (req, res) => {
    let params = req.body
    let sql = `UPDATE talent_black SET status = IF(status = '拉黑待审批', '${params.exam ? '正常' : '失效'}', '${params.exam ? '失效' : '正常'}') ${params.reason ? `, examine_note = ${isNull(params.reason, 'normal')}` : ''} WHERE tbid = '${params.tbid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT * FROM talent_black WHERE tbid = '${params.tbid}'`
        db.query(sql, (err, results_b) => {
            if (err) throw err;
            let sql = `SELECT * FROM user WHERE uid = '${params.userInfo.uid}'`
            db.query(sql, (err, results_u) => {
                if (err) throw err;
                sendRobot(
                    results_u[0].secret,
                    results_u[0].url,
                    {
                        "msgtype": "markdown",
                        "markdown": {
                            "title": `${params.userInfo.name} ${params.type} ${results_b[0].name}`,
                            "text": `### 申请人员：@${results_u[0].phone} \n\n ### 申请操作：${params.type} \n\n ### 达人昵称：${results_b[0].name} \n\n ### 审批人员：${params.userInfo.name} \n\n ### 审批结果：${params.exam ? '通过' : '驳回'} ${params.exam ? `` : `\n\n ### 驳回理由：${params.reason || '无'}`} \n> ##### 网址：http://1.15.89.163:5173`
                        },
                        "at": {
                            "atMobiles": [results_u[0].phone],
                            "isAtAll": false
                        }
                    }
                )
                res.send({ code: 200, data: [], msg: `审批成功` })
            })
        })
    })
})

// 拉黑释放
router.post('/recoverBlack', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `UPDATE talent_black SET r_uid = '${params.userInfo.uid}', r_time = '${time}', status = '释放待审批' ${params.r_reason ? `, r_reason = ${isNull(params.r_reason, 'normal')}` : ''} WHERE tbid = '${params.tbid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT * FROM talent_black WHERE tbid = '${params.tbid}'`
        db.query(sql, (err, results_b) => {
            if (err) throw err;
            let sql = `SELECT * FROM user WHERE uid = 'MJN00027'`
            db.query(sql, (err, results_e) => {
                if (err) throw err;
                sendRobot(
                    results_e[0].secret,
                    results_e[0].url,
                    {
                        "msgtype": "markdown",
                        "markdown": {
                            "title": `${params.userInfo.name} 释放 ${results_b[0].name}`,
                            "text": `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：拉黑释放 \n\n ### 释放原因：${params.r_reason || '无'} \n\n ### 达人昵称：${results_b[0].name} \n\n ### 审批人员：@${results_e[0].phone} \n> ##### 网址：http://1.15.89.163:5173`
                        },
                        "at": {
                            "atMobiles": [results_e[0].phone],
                            "isAtAll": false
                        }
                    }
                )
                res.send({ code: 200, data: [], msg: `释放成功` })
            })
        })
    })
})

module.exports = router