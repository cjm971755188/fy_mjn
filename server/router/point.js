const express = require('express');
const router = express.Router();
const db = require('../config/db')
const BASE_URL = require('../config/config')
const dayjs = require('dayjs');

// 获取提点结算规则
router.post('/getPointList', (req, res) => {
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
    // 条件筛选
    let whereFilter = `where z.status != '已失效'`
    if (params.filtersDate && params.filtersDate.length === 2) {
        whereFilter += ` and z.create_time < '${params.filtersDate[0]}'`
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
    let sql = `SELECT z.* 
                FROM (
                    (SELECT	a.*, t.name, tm.model, tm.platform, tm.shop, tm.account_name, ts.m_id_1, m1.name as m_name_1, ts.m_point_1, ts.m_id_2, m2.name as m_name_2, ts.m_point_2, ts.m_note, 
                        t.yearbox_start_date, t.yearbox_cycle, t.yearbox_lavels_base, t.yearbox_lavels, 
                        IF(tms.commission_normal IS NULL, tms.discount_normal, tms.commission_normal) as commission_1,
                        IF(tms.commission_welfare IS NULL, tms.discount_welfare, tms.commission_welfare) as commission_2,
                        IF(tms.commission_bao IS NULL, tms.discount_bao, tms.commission_bao) as commission_3, 
                        discount_buyout as commission_4, 
                        discount_back as commission_5, 
                        IF(tms.commission_note IS NULL, IF(tms.discount_note IS NULL, tms.discount_label, tms.discount_note), tms.commission_note) as commission_note,
                        tms.u_id_1, u1.name as u_name_1, tms.u_point_1, tms.u_id_2, u2.name as u_name_2, tms.u_point_2, tms.u_note, u0.u_id_0, u0.name as u_name_0, IF(u0.u_id_0 IS NULL, null, 0.5) as u_point_0, t.status
                    FROM (
                        (
                            SELECT t.tid, ts.tsid, tm.tmid, MAX(tm.tmsid) as tmsid, ts.create_time, ts.operate
                            FROM talent_schedule ts
                                    LEFT JOIN talent t ON t.tid = ts.tid
                                    LEFT JOIN (
                                            SELECT tm.tid, tm.tmid, tms.tmsid, tms.create_time
                                            FROM talent_model_schedule tms
                                                    LEFT JOIN talent_model tm ON tm.tmid = tms.tmid
                                            WHERE	tms.status = '生效中'
                                    ) tm ON tm.tid = ts.tid
                            WHERE	ts.status = '生效中'
                                    and ts.operate NOT LIKE '达人移交%'
                                    and ts.operate != '达人报备'
                                    and ts.operate NOT LIKE '%联系人%'
                                    and ts.operate NOT LIKE '%年框%'
                                    and ts.create_time >= tm.create_time
                            GROUP BY	t.tid, ts.tsid, ts.create_time, ts.operate, tm.tmid
                        )
                        UNION
                        (
                            SELECT tm.tid, MAX(t.tsid) as tsid, tm.tmid, tms.tmsid, tms.create_time, tms.operate
                            FROM talent_model_schedule tms
                                    LEFT JOIN talent_model tm ON tm.tmid = tms.tmid
                                    LEFT JOIN (
                                            SELECT t.tid, ts.tsid, ts.create_time
                                            FROM talent_schedule ts
                                                    LEFT JOIN talent t ON t.tid = ts.tid
                                            WHERE	ts.status = '生效中'
                                    ) t ON t.tid = tm.tid
                            WHERE	tms.status = '生效中'
                                    and tms.operate NOT LIKE '%基础信息%'
                                    and tms.create_time >= t.create_time
                            GROUP BY	tm.tid, tms.tmsid, tms.create_time, tms.operate
                        ) 
                    ) a
                        LEFT JOIN talent t ON t.tid = a.tid
                        LEFT JOIN talent_schedule ts ON ts.tsid = a.tsid
                        LEFT JOIN middleman m1 ON m1.mid = ts.m_id_1
                        LEFT JOIN middleman m2 ON m2.mid = ts.m_id_2
                        LEFT JOIN talent_model_schedule tms ON tms.tmsid = a.tmsid
                        LEFT JOIN talent_model tm ON tm.tmid = tms.tmid
                        INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = tms.u_id_1
                        LEFT JOIN user u2 ON u2.uid = tms.u_id_2
                        LEFT JOIN (
                                SELECT t.tid, ts.create_time, ts.create_uid as u_id_0, u.name
                                FROM talent_schedule ts
                                        LEFT JOIN talent t ON t.tid = ts.tid
                                        LEFT JOIN user u ON u.uid = ts.create_uid
                                WHERE ts.operate LIKE '达人移交%'
                                        and ts.examine_result = '通过'
                        ) u0 ON u0.tid = t.tid and a.create_time >= u0.create_time
                    )
                    UNION
                    (SELECT	a.*, t.name, tm.model, tm.platform, tm.shop, tm.account_name, ts.m_id_1, m1.name as m_name_1, ts.m_point_1, ts.m_id_2, m2.name as m_name_2, ts.m_point_2, ts.m_note, 
                        t.yearbox_start_date, t.yearbox_cycle, t.yearbox_lavels_base, t.yearbox_lavels, 
                        IF(tms.commission_normal IS NULL, tms.discount_normal, tms.commission_normal) as commission_1,
                        IF(tms.commission_welfare IS NULL, tms.discount_welfare, tms.commission_welfare) as commission_2,
                        IF(tms.commission_bao IS NULL, tms.discount_bao, tms.commission_bao) as commission_3, 
                        discount_buyout as commission_4, 
                        discount_back as commission_5, 
                        IF(tms.commission_note IS NULL, IF(tms.discount_note IS NULL, tms.discount_label, tms.discount_note), tms.commission_note) as commission_note,
                        tms.u_id_1, u1.name as u_name_1, tms.u_point_1, tms.u_id_2, u2.name as u_name_2, tms.u_point_2, tms.u_note, u0.u_id_0, u0.name as u_name_0, IF(u0.u_id_0 IS NULL, null, 0.5) as u_point_0, t.status
                    FROM (
                        (
                            SELECT t.tid, ts.tsid, tm.tmid, MAX(tm.tmsid) as tmsid, ts.create_time, ts.operate
                            FROM talent_schedule ts
                                    LEFT JOIN talent t ON t.tid = ts.tid
                                    LEFT JOIN (
                                            SELECT tm.tid, tm.tmid, tms.tmsid, tms.create_time
                                            FROM talent_model_schedule tms
                                                    LEFT JOIN talent_model tm ON tm.tmid = tms.tmid
                                            WHERE	tms.status = '生效中'
                                    ) tm ON tm.tid = ts.tid
                            WHERE	ts.status = '生效中'
                                    and ts.operate NOT LIKE '达人移交%'
                                    and ts.operate != '达人报备'
                                    and ts.operate NOT LIKE '%联系人%'
                                    and ts.operate NOT LIKE '%年框%'
                                    and ts.create_time >= tm.create_time
                            GROUP BY	t.tid, ts.tsid, ts.create_time, ts.operate, tm.tmid
                        )
                        UNION
                        (
                            SELECT tm.tid, MAX(t.tsid) as tsid, tm.tmid, tms.tmsid, tms.create_time, tms.operate
                            FROM talent_model_schedule tms
                                    LEFT JOIN talent_model tm ON tm.tmid = tms.tmid
                                    LEFT JOIN (
                                            SELECT t.tid, ts.tsid, ts.create_time
                                            FROM talent_schedule ts
                                                    LEFT JOIN talent t ON t.tid = ts.tid
                                            WHERE	ts.status = '生效中'
                                    ) t ON t.tid = tm.tid
                            WHERE	tms.status = '生效中'
                                    and tms.operate NOT LIKE '%基础信息%'
                                    and tms.create_time >= t.create_time
                            GROUP BY	tm.tid, tms.tmsid, tms.create_time, tms.operate
                        ) 
                    ) a
                        LEFT JOIN talent t ON t.tid = a.tid
                        LEFT JOIN talent_schedule ts ON ts.tsid = a.tsid
                        LEFT JOIN middleman m1 ON m1.mid = ts.m_id_1
                        LEFT JOIN middleman m2 ON m2.mid = ts.m_id_2
                        LEFT JOIN talent_model_schedule tms ON tms.tmsid = a.tmsid
                        LEFT JOIN talent_model tm ON tm.tmid = tms.tmid
                        LEFT JOIN user u1 ON u1.uid = tms.u_id_1
                        LEFT JOIN user u2 ON u2.uid = tms.u_id_2
                        INNER JOIN (
                                SELECT t.tid, ts.create_time, ts.create_uid as u_id_0, u.name
                                FROM talent_schedule ts
                                        LEFT JOIN talent t ON t.tid = ts.tid
                                        INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = ts.create_uid
                                WHERE ts.operate LIKE '达人移交%'
                                        and ts.examine_result = '通过'
                        ) u0 ON u0.tid = t.tid and a.create_time >= u0.create_time
                    )
                ) z
                ${whereFilter}
                ORDER BY create_time DESC, model, platform, shop, name, account_name`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let s = sql + ` LIMIT ${pageSize} OFFSET ${current * pageSize}`
        db.query(s, (err, rr) => {
            if (err) throw err;
            let rrr = []
            for (let i = 0; i < rr.length; i++) {
                rrr.push({
                    key: i,
                    ...rr[i]
                })
            }
            res.send({ code: 200, data: rrr, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })
    })
})

// 导出提点结算规则
router.post('/getExportPointList', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where status != '失效'`
    if (params.userInfo.position != '管理员' || params.userInfo.position.match('总裁')) {
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
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            whereFilter += ` and z.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            whereFilter += ` and z.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    let whereDeadline1 = `WHERE status != '已失效'`, whereDeadline2 = `WHERE tms.status != '已失效' and tm.status != '已失效'`
    if (params.filtersDate && params.filtersDate.length === 2) {
        whereDeadline1 += ` and create_time < '${params.filtersDate[0]}'`
    }
    if (params.filtersDate && params.filtersDate.length === 2) {
        whereDeadline2 += ` and tms.create_time < '${params.filtersDate[0]}'`
    }
    let sql = `SELECT z.* 
                FROM (
                    (SELECT	a.*, t.name, tm.model, tm.platform, tm.shop, tm.account_name, ts.m_id_1, m1.name as m_name_1, ts.m_point_1, ts.m_id_2, m2.name as m_name_2, ts.m_point_2, ts.m_note, t.yearbox_cycle, t.yearbox_lavels_base, t.yearbox_lavels, 
                        IF(tms.commission_normal IS NULL, tms.discount_normal, tms.commission_normal) as commission_1,
                        IF(tms.commission_welfare IS NULL, tms.discount_welfare, tms.commission_welfare) as commission_2,
                        IF(tms.commission_bao IS NULL, tms.discount_bao, tms.commission_bao) as commission_3, 
                        discount_buyout as commission_4, 
                        discount_back as commission_5, 
                        IF(tms.commission_note IS NULL, IF(tms.discount_note IS NULL, tms.discount_label, tms.discount_note), tms.commission_note) as commission_note,
                        tms.u_id_1, u1.name as u_name_1, tms.u_point_1, tms.u_id_2, u2.name as u_name_2, tms.u_point_2, tms.u_note, u0.u_id_0, u0.name as u_name_0, IF(u0.u_id_0 IS NULL, null, 0.5) as u_point_0, t.status
                    FROM (
                        SELECT c.tid, c.tsid, b.tmsid, IF(c.create_time > b.create_time, c.create_time, b.create_time) as create_time
                        FROM (
                            SELECT tid, MAX(tsid) as tsid, MAX(create_time) as create_time
                            FROM talent_schedule
                            ${whereDeadline1}
                            GROUP BY tid
                        ) c, (
                            SELECT tm.tid, tm.tmid, MAX(tms.tmsid) as tmsid, MAX(tms.create_time) as create_time
                            FROM talent_model_schedule tms
                                LEFT JOIN talent_model tm ON tm.tmid = tms.tmid
                            ${whereDeadline2}
                            GROUP BY tm.tid, tm.tmid
                        ) b
                        WHERE	c.tid = b.tid
                    ) a
                        LEFT JOIN talent t ON t.tid = a.tid
                        LEFT JOIN talent_schedule ts ON ts.tsid = a.tsid
                        LEFT JOIN middleman m1 ON m1.mid = ts.m_id_1
                        LEFT JOIN middleman m2 ON m2.mid = ts.m_id_2
                        LEFT JOIN talent_model_schedule tms ON tms.tmsid = a.tmsid
                        LEFT JOIN talent_model tm ON tm.tmid = tms.tmid
                        INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = tms.u_id_1
                        LEFT JOIN user u2 ON u2.uid = tms.u_id_2
                        LEFT JOIN (
                                SELECT t.tid, ts.create_time, ts.create_uid as u_id_0, u.name
                                FROM talent_schedule ts
                                        LEFT JOIN talent t ON t.tid = ts.tid
                                        LEFT JOIN user u ON u.uid = ts.create_uid
                                WHERE ts.operate LIKE '达人移交%'
                                        and ts.examine_result = '通过'
                        ) u0 ON u0.tid = t.tid and a.create_time >= u0.create_time
                    )
                ) z
                ${whereFilter}
                ORDER BY create_time DESC, model, platform, shop, name, account_name`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, msg: `` })
    })
})

// 获取达人昵称匹配规则
router.post('/getKeywordList', (req, res) => {
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
    // 条件筛选
    let whereFilter = `where z.status != '已失效'`
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
                (SELECT tm.tid, tm.tmid, tm.model, tm.platform, tm.shop, t.name, tm.keyword, t.status 
                FROM talent_model tm
                    LEFT JOIN talent t ON t.tid = tm.tid
                    LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                    LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid
                    INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = tms0.u_id_1
                    LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                WHERE tm.status != '已失效' and tm.keyword is not null)
                UNION
                (SELECT tm.tid, tm.tmid, tm.model, tm.platform, tm.shop, t.name, tm.account_name, t.status 
                    FROM talent_model tm
                        LEFT JOIN talent t ON t.tid = tm.tid
                        LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                        LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid
                        INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = tms0.u_id_1
                        LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                    WHERE tm.status != '已失效')
                ) z
                ${whereFilter}
                ORDER BY model, platform, shop, name`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let s = sql + ` LIMIT ${pageSize} OFFSET ${current * pageSize}`
        db.query(s, (err, rr) => {
            if (err) throw err;
            res.send({ code: 200, data: rr, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })
    })
})

// 导出达人昵称匹配规则
router.post('/getExportKeywordList', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where status != '失效'`
    if (params.userInfo.position != '管理员' || params.userInfo.position.match('总裁')) {
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
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            whereFilter += ` and z.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            whereFilter += ` and z.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    let sql = `SELECT z.* FROM (
                (SELECT tm.tid, tm.tmid, tm.model, tm.platform, tm.shop, t.name, tm.keyword, t.status 
                FROM talent_model tm
                    LEFT JOIN talent t ON t.tid = tm.tid
                    LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                    LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid
                    INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = tms0.u_id_1
                    LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                WHERE tm.status != '已失效' and tm.keyword is not null)
                UNION
                (SELECT tm.tid, tm.tmid, tm.model, tm.platform, tm.shop, t.name, tm.account_name, t.status 
                    FROM talent_model tm
                        LEFT JOIN talent t ON t.tid = tm.tid
                        LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                        LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid
                        INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = tms0.u_id_1
                        LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                    WHERE tm.status != '已失效')
                ) z
                ${whereFilter}
                ORDER BY model, platform, shop, name`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, msg: `` })
    })
})

module.exports = router