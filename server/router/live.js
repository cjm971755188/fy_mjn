const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');

// 获取专场列表
router.post('/getLiveList', (req, res) => {
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
        whereFilter += ` and z.start_time >= '${params.filtersDate[0]}' and z.start_time < '${params.filtersDate[1]}'`
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
                    SELECT l.*, t.name, GROUP_CONCAT(DISTINCT tm.model, '_', tm.platform, '_', tm.shop, '_', IF(tm.account_name IS NULL, IF(tm.group_name IS NULL, tm.provide_name, tm.group_name), account_name)) as models,
                        u1.name as a_name_1, u2.name as a_name_2, u3.name as c_name_1, u4.name as u_name_3, u5.name as u_name_1, u6.name as u_name_2
                    FROM live l
                        LEFT JOIN talent t ON t.tid = l.tid
                        LEFT JOIN talent_model tm ON l.tmids LIKE CONCAT('%', tm.tmid, '%')
                        LEFT JOIN user u1 ON u1.uid = l.a_id_1
                        LEFT JOIN user u2 ON u2.uid = l.a_id_2
                        LEFT JOIN user u3 ON u3.uid = l.c_id_1
                        LEFT JOIN user u4 ON u4.uid = l.u_id_3
                        INNER JOIN (SELECT * FROM user ${whereUser}) u5 ON u5.uid = l.u_id_1
                        LEFT JOIN user u6 ON u6.uid = l.u_id_2
                    GROUP BY l.lid, l.tid, l.tmids, l.count_type, l.start_time, l.end_time, l.place, l.room, l.a_id_1, l.a_id_2, l.c_id_1, l.u_id_3, l.goal, l.sales, l.commission_normal_on, l.commission_welfare_on, l.commission_bao_on, 
                        l.commission_note_on, l.commission_normal_down, l.commission_welfare_down, l.commission_bao_down, l.commission_note_down, l.u_id_1, l.u_point_1, l.u_id_2, l.u_point_2, l.u_note, t.name, 
                        a_name_1, a_name_2, c_name_1, u_name_3, u_name_1, u_name_2
                ) z
                ${whereFilter}
                ORDER BY z.start_time DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let s = sql + ` LIMIT ${pageSize} OFFSET ${current * pageSize}`
        db.query(s, (err, r) => {
            if (err) throw err;
            res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })
    })
})

// 添加专场
router.post('/addLive', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT * FROM live`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let lid = 'L' + `${results.length + 1}`.padStart(7, '0')
        let start_time_2 = params.start_time_2 ? `'${params.start_time_2}'` : null
        let a_id_2 = params.a_id_2 ? `'${params.a_id_2}'` : null
        let u_id_3 = params.u_id_3 ? `'${params.u_id_3}'` : null
        let commission_note_on = params.commission_note_on ? `'${params.commission_note_on}'` : null
        let commission_note_down = params.commission_note_down ? `'${params.commission_note_down}'` : null
        let u_id_2 = params.u_id_2 ? `'${params.u_id_2}'` : null
        let u_point_2 = params.u_point_2 ? `'${params.u_point_2}'` : null
        let u_note = params.u_note ? `'${params.u_note}'` : null
        let sql = `INSERT INTO live VALUES('${lid}', '${params.tid}', '${params.tmids}', '${params.count_type}', '${params.start_time}', ${start_time_2}, '${params.end_time_0}', '${params.end_time}', '${params.place}', '${params.room}', '${params.a_id_1}', ${a_id_2}, '${params.c_id_1}', ${u_id_3}, 
                    '${params.goal}', '${params.sales}', '${params.commission_normal_on}', '${params.commission_welfare_on}', '${params.commission_bao_on}', ${commission_note_on}, '${params.commission_normal_down}', '${params.commission_welfare_down}', 
                    '${params.commission_bao_down}', ${commission_note_down}, '${params.u_id_1}', '${params.u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, null, '生效中', '${params.userInfo.uid}', '${time}')`
        db.query(sql, (err, results) => {
            if (err) throw err;
            res.send({ code: 200, data: [], msg: '添加成功' })
        })
    })
})

// 修改专场信息
router.post('/editLive', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `UPDATE live SET`
    for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
        if (Object.keys(params)[i] !== 'userInfo' && Object.keys(params)[i] !== 'lid') {
            sql += Object.values(params)[i] !== null && Object.values(params)[i] !== '' ? ` ${Object.keys(params)[i]} = '${Object.values(params)[i]}',` : ` ${Object.keys(params)[i]} = null,`
        }
    }
    sql = sql.substring(0, sql.length - 1)
    sql += ` WHERE lid = '${params.lid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `修改成功` })
    })
})

module.exports = router