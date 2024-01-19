const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');
const ddurls = require('../config/commentDD')
const sendRobot = require('../api/ddrobot')

// 获取额外结佣列表
router.post('/getExtraList', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `WHERE status != '失效' and status != '测试'`
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
                    SELECT e.eid, e.month, e.area, e.tid, e.tmids, e.rules, e.history_other_info, e.status, e.create_uid, t.name as talent_name, COUNT(tm.tmid) as model_sum, 
                        GROUP_CONCAT(tm.model, '_', tm.platform, '_', tm.shop, '_', IF(tm.account_name IS NULL, IF(tm.group_name IS NULL, tm.provide_name, tm.group_name), account_name)) as models
                    FROM extra e
                        LEFT JOIN talent t ON t.tid = e.tid
                        LEFT JOIN talent_model tm ON e.tmids LIKE CONCAT('%', tm.tmid, '%')
                    GROUP BY e.eid, e.month, e.area, e.tid, e.tmids, e.rules, e.history_other_info, e.status, e.create_uid, talent_name
                ) z 
                ${whereFilter} 
                ORDER BY z.month DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let s = sql + ` LIMIT ${pageSize} OFFSET ${current * pageSize}`
        db.query(s, (err, r) => {
            if (err) throw err;
            res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })
    })
})

// 添加额外结佣
router.post('/addExtra', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = 'SELECT * FROM extra'
    db.query(sql, (err, results) => {
        if (err) throw err;
        let eid = 'E' + `${results.length + 1}`.padStart(7, '0')
        let sql = `INSERT INTO extra VALUES('${eid}', '${params.month}', '${params.area}', '${params.tid}', '${params.tmids}', '${params.rules}', null, '生效中', '${params.userInfo.uid}', '${time}')`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `SELECT name FROM talent WHERE tid = '${params.tid}'`
            db.query(sql, (err, results_t) => {
                if (err) throw err;
                let sql = `SELECT phone FROM user WHERE uid = '${params.userInfo.e_id}'`
                db.query(sql, (err, results_e) => {
                    if (err) throw err;
                    sendRobot(params.userInfo.position === '管理员' ? ddurls.finance : ddurls.report, `申请额外结佣`, `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：额外结佣 \n\n ### 达人昵称：${results_t[0].name} \n\n ### 审批人员：@${results_e[0].phone}`, `http://1.15.89.163:5173`, [results_e[0].phone], false)
                    res.send({ code: 200, data: [], msg: `添加成功` })
                })
            })
        })
    })
})

// 修改额外结佣信息
router.post('/editExtra', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `UPDATE extra SET`
    for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
        if (Object.keys(params)[i] !== 'userInfo' && Object.keys(params)[i] !== 'eid') {
            sql += Object.values(params)[i] !== null && Object.values(params)[i] !== '' ? ` ${Object.keys(params)[i]} = '${Object.values(params)[i]}',` : ` ${Object.keys(params)[i]} = null,`
        }
    }
    sql = sql.substring(0, sql.length - 1)
    sql += ` WHERE eid = '${params.eid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `修改成功` })
    })
})

module.exports = router