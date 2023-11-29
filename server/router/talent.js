const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');

// 获取达人列表
router.post('/getTalentList', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where status != '失效'`
    if (params.userInfo.position != '管理员' || params.userInfo.position.match('总裁')) {
        if (params.userInfo.position === '副总') {
            whereUser += ` and department = '${params.userInfo.department}'`
        }
        if (params.userInfo.department != '主管') {
            whereUser += ` and department = '${params.userInfo.department}' and company = '${params.userInfo.company}'`
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
    // 其他筛选
    let whereTM = `WHERE tm.status != '已失效'`
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT * FROM (
                SELECT t.*, tm.models,  CONCAT(ts.m_id_1, ',', ts.m_id_2) as m_ids, ts.m_name_1, ts.m_name_2, CONCAT(ts.m_name_1, ',', ts.m_name_2) as m_names, 
                    CONCAT(tm.u_id_1, ',', tm.u_id_2) as u_ids, CONCAT(tm.u_name_1, ',', tm.u_name_2) as u_names, tm.u_name_1, tm.u_name_2
                FROM talent t
                    LEFT JOIN (
                        SELECT ts0.tid, IF(m1.mid IS NULL, '', m1.mid) as m_id_1, IF(m2.mid IS NULL, '', m2.mid) as m_id_2, IF(m1.name IS NULL, '', m1.name) as m_name_1, IF(m2.name IS NULL, '', m2.name) as m_name_2
                        FROM talent_schedule ts0
                            INNER JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE status != '已失效' GROUP BY tid) ts1 ON ts1.tsid = ts0.tsid
                            LEFT JOIN middleman m1 ON m1.mid = ts0.m_id_1
                            LEFT JOIN middleman m2 ON m2.mid = ts0.m_id_2
                    ) ts ON ts.tid = t.tid
                    INNER JOIN (
                        SELECT tm.tid, GROUP_CONCAT(DISTINCT tm.model) as models, GROUP_CONCAT(DISTINCT tms.u_id_1) as u_id_1, GROUP_CONCAT(DISTINCT tms.u_id_2) as u_id_2, 
                            GROUP_CONCAT(DISTINCT tms.u_name_1) as u_name_1, GROUP_CONCAT(DISTINCT tms.u_name_2) as u_name_2
                        FROM talent_model tm
                            INNER JOIN (
                                SELECT tms0.tmid, IF(u1.uid IS NULL, '', u1.uid) as u_id_1, IF(u2.uid IS NULL, '', u2.uid) as u_id_2, IF(u1.name IS NULL, '', u1.name) as u_name_1, IF(u2.name IS NULL, '', u2.name) as u_name_2
                                FROM talent_model_schedule tms0
                                    INNER JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmsid = tms0.tmsid
                                    INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = tms0.u_id_1
                                    LEFT JOIN (SELECT * FROM user ${whereUser}) u2 ON u2.uid = tms0.u_id_2
                            ) tms ON tms.tmid = tm.tmid
                        ${whereTM}
                        GROUP BY tm.tid
                    ) tm ON tm.tid = t.tid
                ) z ${whereFilter}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results.slice(current * pageSize, (current + 1) * pageSize), pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

// 达人详情
router.post('/getTalentDetail', (req, res) => {
    let params = req.body
    let sql = `SELECT t.*, ts.*
                FROM talent t
                    LEFT JOIN (
                            SELECT ts0.tid, ts0.tsid, ts0.yearbox_start_date, ts0.yearbox_point, ts0.yearbox_cycle, ts0.yearbox_pic, 
                                ts0.m_id_1, m1.type as m_type_1, m1.name as m_name_1, ts0.m_point_1, ts0.m_id_2, m2.type as m_type_2, m2.name as m_name_2, ts0.m_point_2, ts0.m_note
                            FROM talent_schedule ts0
                                INNER JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE status != '已失效' GROUP BY tid) ts1 ON ts1.tsid = ts0.tsid
                                LEFT JOIN middleman m1 ON m1.mid = ts0.m_id_1
                                LEFT JOIN middleman m2 ON m2.mid = ts0.m_id_2
                    ) ts ON ts.tid = t.tid
                WHERE t.tid = '${params.tid}'`
    db.query(sql, (err, results_base) => {
        if (err) throw err;
        let sql = `SELECT tm.*, tms0.commission_normal, tms0.commission_welfare, tms0.commission_bao, tms0.commission_note, tms0.discount_normal, tms0.discount_welfare, tms0.discount_bao, tms0.discount_note, tms0.discount_buyout, tms0.discount_back, tms0.discount_label, 
                        tms0.u_id_1, u1.name as u_name_1, tms0.u_point_1, tms0.u_id_2, u2.name as u_name_2, tms0.u_point_2, tms0.u_note
                    FROM talent_model tm
                        LEFT JOIN talent_model_schedule tms0 ON tms0.tmid = tm.tmid
                        INNER JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmsid = tms0.tmsid
                        LEFT JOIN user u1 ON u1.uid = tms0.u_id_1
                        LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                    WHERE tm.tid = '${params.tid}'
                    ORDER BY tm.tmid DESC`
        db.query(sql, (err, results_models) => {
            if (err) throw err;
            let sql = `SELECT ts.tsid, ts.create_time, ts.create_uid, ts.status, u1.name as u_name_1, ts.operate, ts.examine_time, ts.examine_uid, u2.name as u_name_2, if(ts.examine_result is null, '', ts.examine_result) as examine_result, ts.examine_note
                        FROM talent_schedule ts
                            LEFT JOIN user u1 ON u1.uid = ts.create_uid
                            LEFT JOIN user u2 ON u2.uid = ts.examine_uid
                        UNION ALL
                        SELECT tms.tmsid, tms.create_time, tms.create_uid, tms.status, u1.name, tms.operate, tms.examine_time, tms.examine_uid, u2.name, tms.examine_result, tms.examine_note
                        FROM talent_model_schedule tms
                            LEFT JOIN user u1 ON u1.uid = tms.create_uid
                            LEFT JOIN user u2 ON u2.uid = tms.examine_uid
                        WHERE tms.operate != '达人报备'
                        ORDER BY create_time`
            db.query(sql, (err, results_schedule) => {
                if (err) throw err;
                res.send({ code: 200, data: { ...results_base[0], models: results_models, schedule: results_schedule }, msg: '' })
            })
        })
    })
})

// 修改达人信息
router.post('/editTalent', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT * FROM talent_schedule`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let tsid = 'TS' + `${results.length + 1}`.padStart(7, '0')
        let sql = `SELECT ts0.*
                        FROM talent_schedule ts0 
                            INNER JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE status = '生效中' GROUP BY tid) ts1 ON ts1.tsid = ts0.tsid
                        WHERE ts0.tid = '${params.tid}'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `INSERT INTO talent_schedule VALUES('${tsid}',`
            for (const key in results[0]) {
                let isAdd = true
                if (Object.hasOwnProperty.call(results[0], key)) {
                    if (isAdd && key === 'tsid') {
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
                    } else if (params.operate.match('联系人')) {
                        if (isAdd && key === 'history_other_info') {
                            isAdd = false
                            sql += ` '${params.ori}',`
                        } else if (isAdd && key === 'need_examine') {
                            isAdd = false
                            sql += ` '无需审批',`
                        } else if (isAdd && (key === 'examine_uid' || key === 'examine_time' || key === 'examine_result' || key === 'examine_note')) {
                            isAdd = false
                            sql += ` null,`
                        } else if (isAdd) {
                            isAdd = false
                            sql += results[0][key] === null ? ` null,` : ` '${results[0][key]}',`
                        }
                    } else if (params.operate.match('年框') || params.operate.match('中间人')) {
                        for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                            if (isAdd && Object.keys(params.new)[i] === key) {
                                isAdd = false
                                sql += Object.values(params.new)[i] === null ? ` null,` : ` '${Object.values(params.new)[i].replace('/public', '')}',`
                            }
                        }
                        if (isAdd && key === 'need_examine') {
                            isAdd = false
                            sql += ` '需要审批',`
                        } else if (isAdd && key === 'examine_uid') {
                            isAdd = false
                            sql += ` '${params.userInfo.e_id}',`
                        } else if (isAdd && (key === 'examine_time' || key === 'examine_result' || key === 'examine_note')) {
                            isAdd = false
                            sql += ` null,`
                        } else if (isAdd && key === 'status') {
                            isAdd = false
                            sql += ` '待审批',`
                        } else if (isAdd) {
                            sql += results[0][key] === null ? ` null,` : ` '${results[0][key]}',`
                        }
                    }
                }
            }
            sql = sql.substring(0, sql.length - 1)
            sql += `)`
            db.query(sql, (err, results) => {
                if (err) throw err;
                if (params.operate === '修改联系人') {
                    let sql = 'UPDATE talent SET'
                    for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                        if (Object.keys(params.new)[i] !== 'tid') {
                            sql += Object.values(params.new)[i] !== null ? ` ${Object.keys(params.new)[i]} = '${Object.values(params.new)[i]}',` : ` ${Object.keys(params.new)[i]} = null,`
                        }
                    }
                    sql = sql.substring(0, sql.length - 1)
                    sql += ` WHERE tid = '${params.tid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        res.send({ code: 200, data: {}, msg: `${params.operate}成功` })
                    })
                } else if (params.operate.match('年框')) {
                    let sql = `UPDATE talent set status = '年框待审批', yearbox_status = '待审批' WHERE tid = '${params.tid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        res.send({ code: 200, data: {}, msg: `${params.operate}成功` })
                    })
                } else if (params.operate.match('中间人')) {
                    let sql = `UPDATE talent set status = '中间人待审批' WHERE tid = '${params.tid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        res.send({ code: 200, data: {}, msg: `${params.operate}成功` })
                    })
                }
            })
        })
    })
})

// 审批达人信息
router.post('/examTalent', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let note = params.note === null ? null : `'${params.note}'`
    let sql = `UPDATE talent_schedule 
                SET examine_time = '${time}', examine_uid = '${params.userInfo.uid}', examine_result = '${params.exam ? '通过' : '驳回'}', examine_note = ${note}, status = '${params.exam ? '生效中' : '已失效'}' 
                WHERE tsid = '${params.tsid}' and status = '待审批'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `UPDATE talent SET status = '${params.exam || params.status !== '报备待审批' ? '合作中' : '已失效'}' WHERE tid = '${params.tid}'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            if (params.status === '报备待审批') {
                let sql = `UPDATE talent_model_schedule tms, talent_model tm
                            SET tms.examine_time = '${time}', tms.examine_uid = '${params.userInfo.uid}', tms.examine_result = '${params.exam ? '通过' : '驳回'}', tms.examine_note = ${note}, tms.status = '${params.exam ? '生效中' : '已失效'}' 
                            WHERE tms.tmid = tm.tmid and tm.tid = '${params.tid}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    let sql = `UPDATE talent_model SET status = '${params.exam ? '合作中' : '已失效'}' WHERE tid = '${params.tid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `UPDATE chance c, talent t SET c.status = '${params.exam ? '报备通过' : '报备驳回'}' WHERE c.cid = t.cid and t.tid = '${params.tid}'`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
                            res.send({ code: 200, data: {}, msg: `` })
                        })
                    })
                })
            } else if (params.status === '年框待审批') {
                let sql = `UPDATE talent SET yearbox_status = '${params.exam ? '生效中' : '暂无'}' WHERE tid = '${params.tid}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: {}, msg: `` })
                })
            } else if (params.status === '中间人待审批') {
                res.send({ code: 200, data: {}, msg: `` })
            }
        })
    })
})

// 报备新合作模式
router.post('/addTalentModel', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT * FROM talent_model`
    db.query(sql, (err, results_d) => {
        if (err) throw err;
        let sql = `SELECT * FROM talent_model_schedule`
        db.query(sql, (err, results_l) => {
            if (err) throw err;
            let sql_d = `INSERT INTO talent_model values`
            let sql_l = `INSERT INTO talent_model_schedule values`
            let count_d = results_d.length
            let count_l = results_l.length
            if (params.accounts) {
                for (let i = 0; i < params.accounts.length; i++) {
                    let tmid = 'TM' + `${count_d + i + 1}`.padStart(7, '0')
                    let tmsid = 'TMS' + `${count_l + i + 1}`.padStart(7, '0')
                    let keyword = params.accounts[i].keyword ? `'${params.accounts[i].keyword}'` : null
                    let u_id_2 = params.accounts[i].u_id_2 ? `'${params.accounts[i].u_id_2}'` : null
                    let u_point_2 = params.accounts[i].u_point_2 ? `'${params.accounts[i].u_point_2}'` : null
                    let u_note = params.accounts[i].u_note ? `'${params.accounts[i].u_note}'` : null
                    sql_d += `('${tmid}', '${params.tid}', '线上平台', '${params.accounts[i].platform}', '${params.accounts[i].shop}', '${params.accounts[i].account_id}', '${params.accounts[i].account_name}', '${params.accounts[i].account_type}', '${params.accounts[i].account_models}', ${keyword}, '${params.accounts[i].people_count}', '${params.accounts[i].fe_proportion}', '${params.accounts[i].age_cuts}', '${params.accounts[i].main_province}', '${params.accounts[i].price_cut}', '待审批', '${params.userInfo.uid}', '${time}'),`
                    sql_l += `('${tmsid}', '${tmid}', '${params.accounts[i].commission_normal}', '${params.accounts[i].commission_welfare}', '${params.accounts[i].commission_bao}', '${params.accounts[i].commission_note}', null, null, null, null, null, null, null, '${params.userInfo.uid}', '${params.accounts[i].u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, null, '${params.userInfo.uid}', '${time}', '新合作报备', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
                }
                count_d += params.accounts.length
                count_l += params.accounts.length
            }
            if (params.group_shop) {
                let tmid = 'TM' + `${count_d + 1}`.padStart(7, '0')
                let tmsid = 'TMS' + `${count_l + 1}`.padStart(7, '0')
                let u_id_2 = params.group_u_id_2 ? `'${params.group_u_id_2}'` : null
                let u_point_2 = params.group_u_point_2 ? `'${params.group_u_point_2}'` : null
                let u_note = params.group_u_note ? `'${params.group_u_note}'` : null
                sql_d += `('${tmid}', '${params.tid}', '社群团购', '聚水潭', '${params.group_shop}', null, null, null, null, null, null, null, null, null, null, '待审批', '${params.userInfo.uid}', '${time}'),`
                sql_l += `('${tmsid}', '${tmid}', null, null, null, null, '${params.discount_normal}', '${params.discount_welfare}', '${params.discount_bao}', '${params.discount_note}', null, null, null, '${params.userInfo.uid}', '${params.group_u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, null, '${params.userInfo.uid}', '${time}', '新合作报备', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
                count_d += 1
                count_l += 1
            }
            if (params.provide_shop) {
                let tmid = 'TM' + `${count_d + 1}`.padStart(7, '0')
                let tmsid = 'TMS' + `${count_l + 1}`.padStart(7, '0')
                let u_id_2 = params.provide_u_id_2 ? `'${params.provide_u_id_2}'` : null
                let u_point_2 = params.provide_u_point_2 ? `'${params.provide_u_point_2}'` : null
                let u_note = params.provide_u_note ? `'${params.provide_u_note}'` : null
                sql_d += `('${tmid}', '${params.tid}', '供货', '聚水潭', '${params.provide_shop}', null, null, null, null, null, null, null, null, null, null, '待审批', '${params.userInfo.uid}', '${time}'),`
                sql_l += `('${tmsid}', '${tmid}', null, null, null, null, null, null, null, null, '${params.discount_buyout}', '${params.discount_back}', '${params.discount_label}', '${params.userInfo.uid}', '${params.provide_u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, null, '${params.userInfo.uid}', '${time}', '新合作报备', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
                count_d += 1
                count_l += 1
            }
            sql_d = sql_d.substring(0, sql_d.length - 1)
            sql_l = sql_l.substring(0, sql_l.length - 1)
            db.query(sql_d, (err, results) => {
                if (err) throw err;
                db.query(sql_l, (err, results) => {
                    if (err) throw err;
                    let sql = `UPDATE talent SET status = '新合作待审批' WHERE tid = '${params.tid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        res.send({ code: 200, data: {}, msg: `添加成功` })
                    })
                })
            })
        })
    })
})

// 修改达人模式信息
router.post('/editTalentModel', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT * FROM talent_model_schedule`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let tmsid = 'TMS' + `${results.length + 1}`.padStart(7, '0')
        let sql = `SELECT tms0.*
                    FROM talent_model_schedule tms0 
                        INNER JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status = '生效中' GROUP BY tmid) tms1 ON tms1.tmsid = tms0.tmsid
                    WHERE tms0.tmid = '${params.new.tmid}'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `INSERT INTO talent_model_schedule VALUES('${tmsid}',`
            for (const key in results[0]) {
                let isAdd = true
                if (Object.hasOwnProperty.call(results[0], key)) {
                    if (isAdd && key === 'tmsid') {
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
                    } else if (params.operate.match('基础信息')) {
                        if (isAdd && key === 'history_other_info') {
                            isAdd = false
                            sql += ` '${params.ori}',`
                        } else if (isAdd && key === 'need_examine') {
                            isAdd = false
                            sql += ` '无需审批',`
                        } else if (isAdd && (key === 'examine_uid' || key === 'examine_time' || key === 'examine_result' || key === 'examine_note')) {
                            isAdd = false
                            sql += ` null,`
                        } else if (isAdd) {
                            isAdd = false
                            sql += results[0][key] === null ? ` null,` : ` '${results[0][key]}',`
                        }
                    } else if (params.operate.match('佣金提点')) {
                        for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                            if (isAdd && Object.keys(params.new)[i] === key) {
                                isAdd = false
                                sql += Object.values(params.new)[i] === null ? ` null,` : ` '${Object.values(params.new)[i]}',`
                            }
                        }
                        if (isAdd && key === 'need_examine') {
                            isAdd = false
                            sql += ` '需要审批',`
                        } else if (isAdd && key === 'examine_uid') {
                            isAdd = false
                            sql += ` '${params.userInfo.e_id}',`
                        } else if (isAdd && (key === 'history_other_info' || key === 'u_id_2' || key === 'u_point_2' || key === 'examine_time' || key === 'examine_result' || key === 'examine_note')) {
                            isAdd = false
                            sql += ` null,`
                        } else if (isAdd && key === 'status') {
                            isAdd = false
                            sql += ` '待审批',`
                        } else if (isAdd) {
                            sql += results[0][key] === null ? ` null,` : ` '${results[0][key]}',`
                        }
                    }
                }
            }
            sql = sql.substring(0, sql.length - 1)
            sql += `)`
            db.query(sql, (err, results) => {
                if (err) throw err;
                if (params.operate.match('基础信息')) {
                    let sql = 'UPDATE talent_model SET'
                    for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                        if (Object.keys(params.new)[i] !== 'tmid' && !Object.keys(params.new)[i].match('commission_') && !Object.keys(params.new)[i].match('discount_') && !Object.keys(params.new)[i].match('u_')) {
                            sql += Object.values(params.new)[i] !== null ? ` ${Object.keys(params.new)[i]} = '${Object.values(params.new)[i]}',` : ` ${Object.keys(params.new)[i]} = null,`
                        }
                    }
                    sql = sql.substring(0, sql.length - 1)
                    sql += ` WHERE tmid = '${params.new.tmid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        res.send({ code: 200, data: {}, msg: `${params.operate}成功` })
                    })
                } else if (params.operate.match('佣金提点')) {
                    let sql = `UPDATE talent_model set status = '待审批' WHERE tmid = '${params.new.tmid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `UPDATE talent set status = '合作变更待审批' WHERE tid = '${params.tid}'`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
                            res.send({ code: 200, data: {}, msg: `${params.operate}成功` })
                        })
                    })
                }
            })
        })
    })
})

// 审批新合作模式
router.post('/examTalentModel', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let tmids = ''
    for (let i = 0; i < params.tmids.length; i++) {
        tmids += `'${params.tmids[i]}',`
    }
    tmids = tmids.substring(0, tmids.length - 1)
    let note = params.note === null ? null : `'${params.note}'`
    let sql = `UPDATE talent_model_schedule 
                SET examine_time = '${time}', examine_uid = '${params.userInfo.uid}', examine_result = '${params.exam ? '通过' : '驳回'}', examine_note = ${note}, status = '${params.exam ? '生效中' : '已失效'}' 
                WHERE tmid in (${tmids}) and status = '待审批'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `UPDATE talent_model SET status = '${params.exam || params.status !== '新合作待审批' ? '合作中' : '已失效'}' WHERE tmid in (${tmids}) and status = '待审批'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `UPDATE talent SET status = '合作中' WHERE tid = '${params.tid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: {}, msg: `` })
            })
        })
    })
})

// 获取审批驳回理由
router.post('/getRefundReason', (req, res) => {
    let params = req.body
    if (params.type === 'ts') {
        let sql = `SELECT examine_note
                    FROM talent_schedule ts0
                        LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE status = '已失效' GROUP BY tid) ts1 ON ts1.tsid = ts0.tsid`
        db.query(sql, (err, results) => {
            if (err) throw err;
            res.send({ code: 200, data: results[0].examine_note, msg: `` })
        })
    } else {

    }
})

module.exports = router