const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');
const sendRobot = require('../api/ddrobot')

// 获取拉黑达人列表
router.post('/getTalentBlockList', (req, res) => {
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
    let whereFilter = `where z.status != '已失效'`
    if (params.filtersDate && params.filtersDate.length === 2) {
        whereFilter += ` and z.month >= '${params.filtersDate[0]}' and z.month < '${params.filtersDate[1]}'`
    }
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
                    (SELECT b.bid, b.name, b.note, b.status, b.create_uid, u.name as u_name
                    FROM block b
                        LEFT JOIN user u ON u.uid = b.create_uid)
                    UNION
                    (SELECT t.tid, t.name, ts1.block_note, t.status, ts1.create_uid, u.name as u_name
                    FROM talent t
                        LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE operate = '拉黑达人' GROUP BY tid) ts0 ON ts0.tid = t.tid
                        LEFT JOIN talent_schedule ts1 ON ts1.tsid = ts0.tsid
                        LEFT JOIN user u ON u.uid = ts1.create_uid
                    WHERE (t.status = '已拉黑' or t.status = '拉黑待审批'))
                ) z 
                ${whereFilter} 
                ORDER BY z.bid DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let s = sql + ` LIMIT ${pageSize} OFFSET ${current * pageSize}`
        db.query(s, (err, r) => {
            if (err) throw err;
            res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })
    })
})

// 拉黑达人
router.post('/addBlock', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let note = params.note ? `'${params.note}'` : null
    let sql = 'SELECT * FROM block'
    db.query(sql, (err, results) => {
        if (err) throw err;
        let bid = 'B' + `${results.length + 1}`.padStart(7, '0')
        let sql = `INSERT INTO block VALUES('${bid}', '${params.name}', ${note}, null, null, '待审批', '${params.userInfo.uid}', '${time}')`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `SELECT * FROM user WHERE uid = '${params.userInfo.e_id}'`
            db.query(sql, (err, results_e) => {
                if (err) throw err;
                sendRobot(
                    results_e[0].secret,
                    results_e[0].url,
                    `${params.userInfo.name} 拉黑 ${params.name}`,
                    `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：拉黑达人 \n\n ### 拉黑原因：${note} \n\n ### 达人昵称：${params.name} \n\n ### 审批人员：@${results_e[0].phone}`,
                    `http://1.15.89.163:5173`,
                    [results_e[0].phone],
                    false
                )
                res.send({ code: 200, data: [], msg: `添加成功` })
            })
        })
    })
})

// 修改拉黑达人信息
router.post('/editBlock', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `UPDATE block SET`
    for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
        if (Object.keys(params)[i] !== 'userInfo' && Object.keys(params)[i] !== 'bid') {
            sql += Object.values(params)[i] !== null && Object.values(params)[i] !== '' ? ` ${Object.keys(params)[i]} = '${Object.values(params)[i]}',` : ` ${Object.keys(params)[i]} = null,`
        }
    }
    sql = sql.substring(0, sql.length - 1)
    sql += ` WHERE bid = '${params.bid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `修改成功` })
    })
})

// 审批拉黑达人
router.post('/examBlock', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let note = params.note ? `'${params.note}'` : null
    let sql = `UPDATE block SET status = '${params.exam ? '已拉黑' : '已失效'}', examine_note = ${note} WHERE bid = '${params.bid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT * FROM user WHERE uid = '${params.uid}'`
        db.query(sql, (err, results_u) => {
            if (err) throw err;
            sendRobot(
                results_u[0].secret,
                results_u[0].url,
                `${params.userInfo.name} 拉黑 ${params.name}`,
                `### 申请人员：@${results_u[0].phone} \n\n ### 申请操作：拉黑达人 \n\n ### 达人昵称：${params.name} \n\n ### 审批人员：${params.userInfo.name} \n\n ### 审批结果：${params.exam ? '通过' : '驳回'} ${params.exam ? `` : `\n\n ### 驳回理由：${note}`}`,
                `http://1.15.89.163:5173`,
                [results_u[0].phone],
                false
            )
            res.send({ code: 200, data: [], msg: `审批成功` })
        })
    })
})

module.exports = router