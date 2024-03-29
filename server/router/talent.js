const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');
const sendRobot = require('../api/ddrobot')

// 获取达人列表
router.post('/getTalentList', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = ``
    if (params.userInfo.department === '事业部') {
        if (params.userInfo.position === '副总' || (params.userInfo.company === '总公司' && params.userInfo.position === '助理')) {
            whereUser += `WHERE u0.department = '${params.userInfo.department}' or u1.department = '${params.userInfo.department}' or u2.department = '${params.userInfo.department}' `
        }
        if (params.userInfo.position === '主管') {
            whereUser += `WHERE (u0.department = '${params.userInfo.department}' and u0.company = '${params.userInfo.company}') or (u1.department = '${params.userInfo.department}' and u1.company = '${params.userInfo.company}') or (u2.department = '${params.userInfo.department}' and u2.company = '${params.userInfo.company}') `
        }
        if (params.userInfo.position === '商务') {
            whereUser += `WHERE u0.uid = '${params.userInfo.uid}' or u1.uid = '${params.userInfo.uid}' or u2.uid = '${params.userInfo.uid}' `
        }
        if (params.userInfo.company !== '总公司' && params.userInfo.position === '助理') {
            whereUser += `WHERE u0.uid = '${params.userInfo.up_uid}' or u1.uid = '${params.userInfo.up_uid}' or u2.uid = '${params.userInfo.up_uid}' `
        }
    }
    // 条件筛选
    let whereFilter = `where z.status != '已失效' and z.status != '已拉黑' and z.status != '拉黑待审批'`
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            whereFilter += ` and z.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            if (Object.keys(params.filters)[i] === 'name') {
                whereFilter += ` and (z.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%' or z.account_name like '%${Object.values(params.filters)[i]}%')`
            } else {
                whereFilter += ` and z.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
            }
        }
    }
    // 排序
    let order = params.sorter.sort ? params.sorter.sort : 'tid'
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT z.*
                FROM (
                    SELECT t.tid, t.cid, t.name, GROUP_CONCAT(DISTINCT tm.model) as models, GROUP_CONCAT(DISTINCT tm.platform) as platforms, t.year_deal, t.type,
                        GROUP_CONCAT(DISTINCT tms1.u_id_1) as u_id_1, GROUP_CONCAT(DISTINCT u1.name) as u_name_1, GROUP_CONCAT(DISTINCT tms1.u_point_1) as u_point_1,
                        GROUP_CONCAT(DISTINCT tms1.u_id_2) as u_id_2, GROUP_CONCAT(DISTINCT u2.name) as u_name_2, GROUP_CONCAT(DISTINCT tms1.u_point_2) as u_point_2,
                        GROUP_CONCAT(DISTINCT ts1.u_id_0) as u_id_0, GROUP_CONCAT(DISTINCT u0.name) as u_name_0, GROUP_CONCAT(DISTINCT ts1.u_point_0) as u_point_0,
                        CONCAT(GROUP_CONCAT(DISTINCT u1.name), IF(GROUP_CONCAT(DISTINCT u2.name) IS NULL, '', GROUP_CONCAT(DISTINCT u2.name)), IF(GROUP_CONCAT(DISTINCT u0.name) IS NULL, '', GROUP_CONCAT(DISTINCT u0.name))) as u_names, 
                        GROUP_CONCAT(DISTINCT tms1.u_note) as u_note, GROUP_CONCAT(DISTINCT tms1.gmv_belong) as gmv_belong,
                        GROUP_CONCAT(DISTINCT ts1.m_id_1) as m_id_1, GROUP_CONCAT(DISTINCT m1.name) as m_name_1, GROUP_CONCAT(DISTINCT ts1.m_point_1) as m_point_1,
                        GROUP_CONCAT(DISTINCT ts1.m_id_2) as m_id_2, GROUP_CONCAT(DISTINCT m2.name) as m_name_2, GROUP_CONCAT(DISTINCT ts1.m_point_2) as m_point_2,
                        CONCAT(IF(GROUP_CONCAT(DISTINCT m1.name) IS NULL, '', GROUP_CONCAT(DISTINCT m1.name)), IF(GROUP_CONCAT(DISTINCT m2.name) IS NULL, '', GROUP_CONCAT(DISTINCT m2.name))) as m_names,
                        IF(ts1.yearbox_start_date IS NULL, '暂无', '生效中') as yearbox_status, ts1.yearbox_start_date, ts1.yearbox_cycle, ts1.yearbox_lavels_base, ts1.yearbox_lavels,
                        GROUP_CONCAT(DISTINCT IF(tm.model_files IS NULL, '暂无', '生效中')) as model_status, t.status, COUNT(DISTINCT l.lid) as live_count, SUM(l.sales) as live_sum, GROUP_CONCAT(DISTINCT tm.account_type) as account_type,
                        GROUP_CONCAT(DISTINCT tm.account_models) as account_models, GROUP_CONCAT(DISTINCT tm.account_name) as account_name
                    FROM talent t
                        LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE status != '已失效' or operate = '达人报备' GROUP BY tid) ts0 ON ts0.tid = t.tid
                        LEFT JOIN talent_schedule ts1 ON ts1.tsid = ts0.tsid
                        LEFT JOIN middleman m1 ON m1.mid = ts1.m_id_1
                        LEFT JOIN middleman m2 ON m2.mid = ts1.m_id_2
                        LEFT JOIN user u0 ON u0.uid = ts1.u_id_0
                        LEFT JOIN talent_model tm ON tm.tid = t.tid
                        LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' or operate = '达人报备' GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                        LEFT JOIN talent_model_schedule tms1 ON tms1.tmsid = tms0.tmsid
                        LEFT JOIN user u1 ON u1.uid = tms1.u_id_1
                        LEFT JOIN user u2 ON u2.uid = tms1.u_id_2
                        LEFT JOIN live l ON l.tid = t.tid and l.tmids LIKE CONCAT('%', tm.tmid, '%')
                    ${whereUser}
                    GROUP BY t.tid, t.cid, t.name, t.year_deal, t.type, yearbox_status, ts1.yearbox_start_date, ts1.yearbox_cycle, ts1.yearbox_lavels_base, ts1.yearbox_lavels, t.status
                ) z
                ${whereFilter}
                ORDER BY z.${order} DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let wait_sum = 0
        for (let i = 0; i < results.length; i++) {
            if (results[i].status.match('待审批')) {
                wait_sum += 1
            }
        }
        let s = sql + ` LIMIT ${pageSize} OFFSET ${current * pageSize}`
        db.query(s, (err, r) => {
            if (err) throw err;
            res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, wait_sum, msg: `` })
        })
    })
})

// 达人详情
router.post('/getTalentDetail', (req, res) => {
    let params = req.body
    let sql = `SELECT t.*, ts.*, c.search_pic, c.advance_pic
                FROM talent t
                    LEFT JOIN (
                        SELECT ts0.tid, ts0.tsid, ts0.m_id_1, m1.type as m_type_1, m1.name as m_name_1, ts0.m_type_1 as m_paytype_1, ts0.m_point_1, ts0.m_id_2, m2.type as m_type_2, m2.name as m_name_2, ts0.m_type_2 as m_paytype_2, ts0.m_point_2, 
                            ts0.u_id_0, u0.name as u_name_0, ts0.u_point_0, ts0.m_note_1, ts0.m_note_2, ts0.yearbox_start_date, ts0.yearbox_cycle, ts0.yearbox_type, ts0.yearbox_lavels_base, ts0.yearbox_lavels, ts0.yearbox_files, ts0.yearbox_note
                        FROM talent_schedule ts0
                            INNER JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE status != '已失效' GROUP BY tid) ts1 ON ts1.tsid = ts0.tsid
                            LEFT JOIN middleman m1 ON m1.mid = ts0.m_id_1
                            LEFT JOIN middleman m2 ON m2.mid = ts0.m_id_2
                            LEFT JOIN user u0 ON u0.uid = ts0.u_id_0
                    ) ts ON ts.tid = t.tid
                    LEFT JOIN chance c ON c.cid = t.cid
                WHERE t.tid = '${params.tid}'`
    db.query(sql, (err, results_base) => {
        if (err) throw err;
        let sql = `SELECT tm.*, tms0.commission_normal, tms0.commission_welfare, tms0.commission_bao, tms0.commission_note, tms0.discount_buyout, tms0.discount_back, tms0.discount_label, 
                        tms0.u_id_1, u1.name as u_name_1, tms0.u_point_1, tms0.u_id_2, u2.name as u_name_2, tms0.u_point_2, tms0.u_note, tms0.gmv_belong
                    FROM talent_model tm
                        LEFT JOIN talent_model_schedule tms0 ON tms0.tmid = tm.tmid
                        INNER JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmsid = tms0.tmsid
                        LEFT JOIN user u1 ON u1.uid = tms0.u_id_1
                        LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                    WHERE tm.tid = '${params.tid}'
                    ORDER BY tm.tmid DESC`
        db.query(sql, (err, results_models) => {
            if (err) throw err;
            let sql = `(SELECT ts.tsid, ts.history_other_info, ts.create_time, ts.create_uid, ts.status, u1.name as u_name_1, ts.operate, ts.examine_time, ts.examine_uid, u2.name as u_name_2, if(ts.examine_result is null, '', ts.examine_result) as examine_result, ts.examine_note
                        FROM talent_schedule ts
                            LEFT JOIN user u1 ON u1.uid = ts.create_uid
                            LEFT JOIN user u2 ON u2.uid = ts.examine_uid
                        WHERE ts.tid = '${params.tid}')
                        UNION ALL
                        (SELECT tms.tmsid, tms.history_other_info, tms.create_time, tms.create_uid, tms.status, u1.name, tms.operate, tms.examine_time, tms.examine_uid, u2.name, tms.examine_result, tms.examine_note
                        FROM talent_model_schedule tms
                            LEFT JOIN talent_model tm ON tms.tmid = tm.tmid
                            LEFT JOIN user u1 ON u1.uid = tms.create_uid
                            LEFT JOIN user u2 ON u2.uid = tms.examine_uid
                        WHERE tms.operate != '达人报备' and tms.operate NOT LIKE '达人移交%' and tm.tid = '${params.tid}')
                        ORDER BY create_time`
            db.query(sql, (err, results_schedule) => {
                if (err) throw err;
                let sql = `SELECT u.name
                            FROM talent_model_schedule tms
                                LEFT JOIN talent_model tm ON tm.tmid = tms.tmid
                                LEFT JOIN user u ON u.uid = tms.create_uid
                            WHERE tm.tid = '${params.tid}'
                                and tms.operate LIKE '达人移交%'
                                and (tms.examine_result = '通过' or tms.status = '待审批')`
                db.query(sql, (err, results_original) => {
                    if (err) throw err;
                    if (results_original.length === 0) {
                        original = null
                    } else {
                        original = results_original[0].name
                    }
                    res.send({ code: 200, data: { ...results_base[0], models: results_models, schedule: results_schedule, original }, msg: '' })
                })
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
            let sql = `INSERT INTO talent_schedule VALUES('${tsid}', '${params.tid}',`
            for (const key in results[0]) {
                let isAdd = true
                if (Object.hasOwnProperty.call(results[0], key)) {
                    if (isAdd && key === 'tsid') {
                        isAdd = false
                        continue
                    } else if (isAdd && key === 'tid') {
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
                    } else if (params.operate.match('联系人') || params.operate.match('基础信息') || params.operate.match('年框资料')) {
                        for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                            if (isAdd && Object.keys(params.new)[i] === key) {
                                isAdd = false
                                if (key === 'yearbox_files') {
                                    sql += Object.values(params.new)[i] === null ? ` null,` : ` '${Object.values(params.new)[i].replace('/public', '')}',`
                                } else {
                                    sql += Object.values(params.new)[i] === null ? ` null,` : ` '${Object.values(params.new)[i]}',`
                                }
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
                    } else if (params.operate.match('中间人') || params.operate.match('年框') || params.operate === '拉黑达人' || params.operate === '拉黑释放') {
                        for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                            if (isAdd && Object.keys(params.new)[i] === key) {
                                isAdd = false
                                if (key.match('pic')) {
                                    sql += Object.values(params.new)[i] === null ? ` null,` : ` '${Object.values(params.new)[i].replace('/public', '')}',`
                                } else {
                                    sql += Object.values(params.new)[i] === null ? ` null,` : ` '${Object.values(params.new)[i]}',`
                                }
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
                if (params.operate === '修改联系人' || params.operate === '修改基础信息') {
                    let sql = 'UPDATE talent SET'
                    for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                        if (Object.keys(params.new)[i] !== 'tid') {
                            sql += Object.values(params.new)[i] !== null && Object.values(params.new)[i] !== '' ? ` ${Object.keys(params.new)[i]} = '${Object.values(params.new)[i]}',` : ` ${Object.keys(params.new)[i]} = null,`
                        }
                    }
                    sql = sql.substring(0, sql.length - 1)
                    sql += ` WHERE tid = '${params.tid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        res.send({ code: 200, data: [], msg: `${params.operate}成功` })
                    })
                } else if (params.operate.match('年框资料')) {
                    res.send({ code: 200, data: [], msg: `${params.operate}成功` })
                } else if (params.operate.match('中间人') || params.operate.match('年框') || params.operate === '拉黑达人' || params.operate === '拉黑释放') {
                    let sql = `UPDATE talent set status = '${params.operate.match('中间人') ? '中间人待审批' : params.operate === '拉黑达人' ? '拉黑待审批' : params.operate === '拉黑释放' ? '拉黑释放待审批' : '年框待审批'}' WHERE tid = '${params.tid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `SELECT * FROM talent WHERE tid = '${params.tid}'`
                        db.query(sql, (err, results_t) => {
                            if (err) throw err;
                            let sql = `SELECT * FROM user WHERE uid = '${params.userInfo.e_id}'`
                            db.query(sql, (err, results_e) => {
                                if (err) throw err;
                                sendRobot(
                                    results_e[0].secret,
                                    results_e[0].url,
                                    `${results_t[0].name} ${params.operate}`,
                                    `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：${params.operate} \n\n ### 达人昵称：${results_t[0].name} \n\n ### 审批人员：@${results_e[0].phone}`,
                                    `http://1.15.89.163:5173`,
                                    [results_e[0].phone],
                                    false
                                )
                                res.send({ code: 200, data: [], msg: `${params.operate}成功` })
                            })
                        })
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
    let sql = `SELECT t.name, ts.operate, t.cid
                FROM talent t
                    INNER JOIN (SELECT tid, operate FROM talent_schedule WHERE status = '待审批') ts ON ts.tid = t.tid 
                WHERE t.tid = '${params.tid}'`
    db.query(sql, (err, results_t) => {
        if (err) throw err;
        let sql = `UPDATE talent_schedule 
                    SET examine_time = '${time}', examine_uid = '${params.userInfo.uid}', examine_result = '${params.exam ? '通过' : '驳回'}', examine_note = ${note}, status = '${params.exam ? '生效中' : '已失效'}' 
                    WHERE tid = '${params.tid}' and status = '待审批'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `UPDATE talent SET status = IF(status = '拉黑待审批', '${params.exam ? '已拉黑' : '合作中'}', 
                            IF(cid = 'undefined', '${params.exam || params.status !== '报备待审批' ? '合作中' : '报备驳回'}', '${params.exam || params.status !== '报备待审批' ? '合作中' : '已失效'}'))
                        WHERE tid = '${params.tid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                if (params.status === '报备待审批' || params.status === '拉黑待审批') {
                    let sql = `UPDATE talent_model_schedule tms, talent_model tm
                                SET tms.examine_time = '${time}', tms.examine_uid = '${params.userInfo.uid}', tms.examine_result = '${params.exam ? '通过' : '驳回'}', tms.examine_note = ${note}, tms.status = '${params.exam ? '生效中' : '已失效'}' 
                                WHERE tms.tmid = tm.tmid and tm.tid = '${params.tid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `UPDATE talent_model SET status = '${params.exam ? '合作中' : '已失效'}' WHERE tid = '${params.tid}'`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
                            let t = params.exam ? `'${time}'` : `null`
                            let sql = `UPDATE chance c, talent t SET c.status = '${params.exam ? '报备通过' : '报备驳回'}', c.report_time = ${t} WHERE c.cid = t.cid and t.tid = '${params.tid}'`
                            db.query(sql, (err, results) => {
                                if (err) throw err;
                                let sql = `SELECT * FROM user WHERE uid = '${params.uid}'`
                                db.query(sql, (err, results_u) => {
                                    if (err) throw err;
                                    sendRobot(
                                        results_u[0].secret,
                                        results_u[0].url,
                                        `${results_t[0].name} ${results_t[0].operate} 审批${params.exam ? '通过' : '驳回'}`,
                                        `### 申请人员：@${results_u[0].phone} \n\n ### 申请操作：${results_t[0].operate} \n\n ### 达人昵称：${results_t[0].name} \n\n ### 审批人员：${params.userInfo.name} \n\n ### 审批结果：${params.exam ? '通过' : '驳回'} ${params.exam ? `` : `\n\n ### 驳回理由：${note}`}`,
                                        `http://1.15.89.163:5173`,
                                        [results_u[0].phone],
                                        false
                                    )
                                    res.send({ code: 200, data: [], msg: `` })
                                })
                            })
                        })
                    })
                } else {
                    let sql = `SELECT * FROM user WHERE uid = '${params.uid}'`
                    db.query(sql, (err, results_u) => {
                        if (err) throw err;
                        sendRobot(
                            results_u[0].secret,
                            results_u[0].url,
                            `${results_t[0].name} ${results_t[0].operate} 审批${params.exam ? '通过' : '驳回'}`,
                            `### 申请人员：@${results_u[0].phone} \n\n ### 申请操作：${results_t[0].operate} \n\n ### 达人昵称：${results_t[0].name} \n\n ### 审批人员：${params.userInfo.name} \n\n ### 审批结果：${params.exam ? '通过' : '驳回'} ${params.exam ? `` : `\n\n ### 驳回理由：${note}`}`,
                            `http://1.15.89.163:5173`,
                            [results_u[0].phone],
                            false
                        )
                        res.send({ code: 200, data: [], msg: `` })
                    })
                }
            })
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
                    let shop_name = params.accounts[i].shop_name ? `'${params.accounts[i].shop_name}'` : null
                    let keyword = params.accounts[i].keyword ? `'${params.accounts[i].keyword}'` : null
                    let commission_note = params.accounts[i].commission_note ? `'${params.accounts[i].commission_note}'` : null
                    let u_id_2 = params.accounts[i].u_id_2 ? params.accounts[i].u_id_2.value ? `'${params.accounts[i].u_id_2.value}'` : `'${params.accounts[i].u_id_2}'` : null
                    let u_point_2 = params.accounts[i].u_point_2 ? params.accounts[i].u_point_2.value ? `'${params.accounts[i].u_point_2.value}'` : `'${params.accounts[i].u_point_2}'` : null
                    let u_note = params.accounts[i].u_note ? `'${params.accounts[i].u_note}'` : null
                    let model_files = params.accounts[i].model_files ? `'${JSON.stringify(params.accounts[i].model_files)}'` : null
                    sql_d += `('${tmid}', '${params.tid}', '线上平台', '${params.accounts[i].platform}', '${params.accounts[i].shop_type}', ${shop_name}, '${params.accounts[i].account_id}', '${params.accounts[i].account_name}', '${params.accounts[i].account_type}', '${params.accounts[i].account_models}', ${keyword}, '${params.accounts[i].people_count}', '${params.accounts[i].fe_proportion}', '${params.accounts[i].age_cuts}', '${params.accounts[i].main_province}', '${params.accounts[i].price_cut}', ${model_files}, '待审批'),`
                    sql_l += `('${tmsid}', '${tmid}', '${params.accounts[i].commission_normal}', '${params.accounts[i].commission_welfare}', '${params.accounts[i].commission_bao}', ${commission_note}, null, null, null, '${params.accounts[i].u_id_1}', '${params.accounts[i].u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, '${params.accounts[i].gmv_belong}', null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
                }
                count_d += params.accounts.length
                count_l += params.accounts.length
            }
            if (params.group_shop) {
                let tmid = 'TM' + `${count_d + 1}`.padStart(7, '0')
                let tmsid = 'TMS' + `${count_l + 1}`.padStart(7, '0')
                let commission_note = params.commission_note ? `'${params.commission_note}'` : null
                let u_id_2 = params.group_u_id_2 ? params.group_u_id_2.value ? `'${params.group_u_id_2.value}'` : `'${params.group_u_id_2}'` : null
                let u_point_2 = params.group_u_point_2 ? params.group_u_point_2.value ? `'${params.group_u_point_2.value}'` : `'${params.group_u_point_2}'` : null
                let u_note = params.group_u_note ? `'${params.group_u_note}'` : null
                let model_files = params.group_model_files ? `'${JSON.stringify(params.model_files)}'` : null
                sql_d += `('${tmid}', '${params.tid}', '社群团购', '聚水潭', null, '${params.group_shop}', null, '${params.group_name}', null, null, null, null, null, null, null, null, ${model_files}, '待审批'),`
                sql_l += `('${tmsid}', '${tmid}', '${params.commission_normal}', '${params.commission_welfare}', '${params.commission_bao}', ${commission_note}, null, null, null, '${params.group_u_id_1}', '${params.group_u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, '${params.group_gmv_belong}', null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
                count_d += 1
                count_l += 1
            }
            if (params.provide_shop) {
                let tmid = 'TM' + `${count_d + 1}`.padStart(7, '0')
                let tmsid = 'TMS' + `${count_l + 1}`.padStart(7, '0')
                let discount_label = params.discount_label ? `'${params.discount_label}'` : null
                let u_id_2 = params.provide_u_id_2 ? params.provide_u_id_2.value ? `'${params.provide_u_id_2.value}'` : `'${params.provide_u_id_2}'` : null
                let u_point_2 = params.provide_u_point_2 ? params.provide_u_point_2.value ? `'${params.provide_u_point_2.value}'` : `'${params.provide_u_point_2}'` : null
                let u_note = params.provide_u_note ? `'${params.provide_u_note}'` : null
                let model_files = params.provide_model_files ? `'${JSON.stringify(params.model_files)}'` : null
                sql_d += `('${tmid}', '${params.tid}', '供货', '聚水潭', null, '${params.provide_shop}', null, '${params.provide_name}', null, null, null, null, null, null, null, null, ${model_files}, '待审批'),`
                sql_l += `('${tmsid}', '${tmid}', null, null, null, null, '${params.discount_buyout}', '${params.discount_back}', ${discount_label}, '${params.provide_u_id_1}', '${params.provide_u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, '${params.provide_gmv_belong}', null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
                count_d += 1
                count_l += 1
            }
            if (sql_d === 'INSERT INTO talent_model values') {
                res.send({ code: 201, data: [], msg: `请输入正确的合作模式信息` })
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
                        let sql = `SELECT * FROM user WHERE uid = '${params.userInfo.e_id}'`
                        db.query(sql, (err, results_e) => {
                            if (err) throw err;
                            sendRobot(
                                results_e[0].secret,
                                results_e[0].url,
                                `${params.talent_name} ${params.operate}`,
                                `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：${params.operate} \n\n ### 达人昵称：${params.talent_name} \n\n ### 审批人员：@${results_e[0].phone}`,
                                `http://1.15.89.163:5173`,
                                [results_e[0].phone],
                                false
                            )
                            res.send({ code: 200, data: [], msg: `新合作报备成功` })
                        })
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
                    } else if (params.operate.match('基础信息') || params.operate.match('合作协议')) {
                        if (isAdd && key === 'history_other_info') {
                            isAdd = false
                            sql += params.ori === null ? ' null, ' : ` '${params.ori}',`
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
                    } else if (params.operate.match('佣金提点') || params.operate.match('综合')) {
                        for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                            if (isAdd && Object.keys(params.new)[i] === key) {
                                isAdd = false
                                sql += Object.values(params.new)[i] === null ? ` null,` : ` '${Object.values(params.new)[i]}',`
                            }
                        }
                        if (isAdd && key === 'history_other_info') {
                            isAdd = false
                            sql += params.ori === null ? ' null, ' : ` '${params.ori}',`
                        } else if (isAdd && key === 'need_examine') {
                            isAdd = false
                            sql += ` '需要审批',`
                        } else if (isAdd && key === 'examine_uid') {
                            isAdd = false
                            sql += ` '${params.userInfo.e_id}',`
                        } else if (isAdd && (key === 'u_id_2' || key === 'u_point_2' || key === 'examine_time' || key === 'examine_result' || key === 'examine_note')) {
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
                if (params.operate.match('基础信息') || params.operate.match('合作协议')) {
                    let sql = 'UPDATE talent_model SET'
                    for (let i = 0; i < Object.getOwnPropertyNames(params.new).length; i++) {
                        if (Object.keys(params.new)[i] === 'model_files') {
                            sql += Object.values(params.new)[i] !== null ? ` ${Object.keys(params.new)[i]} = '${Object.values(params.new)[i].replace('/pubilc', '')}',` : ` ${Object.keys(params.new)[i]} = null,`
                        } else if (Object.keys(params.new)[i] !== 'tmid' && !Object.keys(params.new)[i].match('commission_') && !Object.keys(params.new)[i].match('discount_') && !Object.keys(params.new)[i].match('u_')) {
                            sql += Object.values(params.new)[i] !== null ? ` ${Object.keys(params.new)[i]} = '${Object.values(params.new)[i]}',` : ` ${Object.keys(params.new)[i]} = null,`
                        }
                    }
                    sql = sql.substring(0, sql.length - 1)
                    sql += ` WHERE tmid = '${params.new.tmid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        res.send({ code: 200, data: [], msg: `${params.operate}成功` })
                    })
                } else if (params.operate.match('佣金提点')) {
                    let sql = `UPDATE talent_model set status = '待审批' WHERE tmid = '${params.new.tmid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `UPDATE talent set status = '合作变更待审批' WHERE tid = '${params.tid}'`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
                            let sql = `SELECT * FROM talent WHERE tid = '${params.tid}'`
                            db.query(sql, (err, results_t) => {
                                if (err) throw err;
                                let sql = `SELECT * FROM user WHERE uid = '${params.userInfo.e_id}'`
                                db.query(sql, (err, results_e) => {
                                    if (err) throw err;
                                    sendRobot(
                                        results_e[0].secret,
                                        results_e[0].url,
                                        `${results_t[0].name} ${params.operate}`,
                                        `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：${params.operate} \n\n ### 达人昵称：${results_t[0].name} \n\n ### 审批人员：@${results_e[0].phone}`,
                                        `http://1.15.89.163:5173`,
                                        [results_e[0].phone],
                                        false
                                    )
                                    res.send({ code: 200, data: [], msg: `${params.operate}成功` })
                                })
                            })
                        })
                    })
                } else if (params.operate.match('综合')) {
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
                        let sql = `UPDATE talent_model set status = '待审批' WHERE tmid = '${params.new.tmid}'`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
                            let sql = `UPDATE talent set status = '合作变更待审批' WHERE tid = '${params.tid}'`
                            db.query(sql, (err, results) => {
                                if (err) throw err;
                                let sql = `SELECT * FROM talent WHERE tid = '${params.tid}'`
                                db.query(sql, (err, results_t) => {
                                    if (err) throw err;
                                    let sql = `SELECT * FROM user WHERE uid = '${params.userInfo.e_id}'`
                                    db.query(sql, (err, results_e) => {
                                        if (err) throw err;
                                        sendRobot(
                                            results_e[0].secret,
                                            results_e[0].url,
                                            `${results_t[0].name} ${params.operate}`,
                                            `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：${params.operate} \n\n ### 达人昵称：${results_t[0].name} \n\n ### 审批人员：@${results_e[0].phone}`,
                                            `http://1.15.89.163:5173`,
                                            [results_e[0].phone],
                                            false
                                        )
                                        res.send({ code: 200, data: [], msg: `${params.operate}成功` })
                                    })
                                })
                            })
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
    let sql = `SELECT t.name, tms.operate
                    FROM talent_model tm 
                        LEFT JOIN talent t ON t.tid = tm.tid
                        INNER JOIN (SELECT tmid, operate FROM talent_model_schedule WHERE status = '待审批') tms ON tms.tmid = tm.tmid  
                    WHERE tm.tmid in (${tmids})`
    db.query(sql, (err, results_t) => {
        if (err) throw err;
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
                    let sql = `SELECT * FROM user WHERE uid = '${params.uid}'`
                    db.query(sql, (err, results_u) => {
                        if (err) throw err;
                        sendRobot(
                            results_u[0].secret,
                            results_u[0].url,
                            `${results_t[0].name} ${results_t[0].operate} 审批${params.exam ? '通过' : '驳回'}`,
                            `### 申请人员：@${results_u[0].phone} \n\n ### 申请操作：${results_t[0].operate} \n\n ### 达人昵称：${results_t[0].name} \n\n ### 审批人员：${params.userInfo.name} \n\n ### 审批结果：${params.exam ? '通过' : '驳回'} ${params.exam ? `` : `\n\n ### 驳回理由：${note}`}`,
                            `http://1.15.89.163:5173`,
                            [results_u[0].phone],
                            false
                        )
                        res.send({ code: 200, data: [], msg: `` })
                    })
                })
            })
        })
    })
})

// 移交达人
router.post('/giveTalent', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT * FROM talent_model_schedule`
    db.query(sql, (err, results_l) => {
        if (err) throw err;
        let sql = `SELECT name FROM user WHERE uid = '${params.newUid}'`
        db.query(sql, (err, results_u) => {
            if (err) throw err;
            let sql = `SELECT tms0.*
                    FROM talent_model_schedule tms0 
                        INNER JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status = '生效中' GROUP BY tmid) tms1 ON tms1.tmsid = tms0.tmsid
                        LEFT JOIN talent_model tm ON tm.tmid = tms0.tmid
                    WHERE tm.tid = '${params.tid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                let sql = `INSERT INTO talent_model_schedule VALUES`
                for (let i = 0; i < results.length; i++) {
                    let tmsid = 'TMS' + `${results_l.length + i + 1}`.padStart(7, '0')
                    let s = `('${tmsid}',`
                    for (const key in results[i]) {
                        let isAdd = true
                        if (Object.hasOwnProperty.call(results[i], key)) {
                            if (isAdd && key === 'tmsid') {
                                isAdd = false
                                continue
                            } else if (isAdd && key === 'u_id_1') {
                                isAdd = false
                                s += ` '${params.newUid}',`
                            } else if (isAdd && key === 'u_point_1') {
                                isAdd = false
                                s += ` '0.5',`
                            } else if (isAdd && key === 'create_uid') {
                                isAdd = false
                                s += ` '${params.userInfo.uid}',`
                            } else if (isAdd && key === 'create_time') {
                                isAdd = false
                                s += ` '${time}',`
                            } else if (isAdd && key === 'operate') {
                                isAdd = false
                                s += ` '${params.operate}给${results_u[0].name}',`
                            } else if (isAdd && key === 'need_examine') {
                                isAdd = false
                                s += ` '需要审批',`
                            } else if (isAdd && key === 'examine_uid') {
                                isAdd = false
                                s += ` '${params.userInfo.e_id}',`
                            } else if (isAdd && (key === 'history_other_info' || key === 'u_id_2' || key === 'u_point_2' || key === 'examine_time' || key === 'examine_result' || key === 'examine_note')) {
                                isAdd = false
                                s += ` null,`
                            } else if (isAdd && key === 'status') {
                                isAdd = false
                                s += ` '待审批',`
                            } else if (isAdd) {
                                s += results[i][key] === null ? ` null,` : ` '${results[i][key]}',`
                            }
                        }
                    }
                    s = s.substring(0, s.length - 1)
                    sql += s + `),`
                }
                sql = sql.substring(0, sql.length - 1)
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    let sql = `UPDATE talent_model set status = '待审批' WHERE tid = '${params.tid}'`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `UPDATE talent set status = '移交待审批' WHERE tid = '${params.tid}'`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
                            let sql2 = `SELECT * FROM talent_schedule`
                            db.query(sql2, (err, results) => {
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
                                            } else if (isAdd && key === 'u_id_0') {
                                                isAdd = false
                                                sql += ` '${params.u_id_0}',`
                                            } else if (isAdd && key === 'u_point_0') {
                                                isAdd = false
                                                sql += ` '${params.uPoint0}',`
                                            } else if (isAdd && key === 'create_uid') {
                                                isAdd = false
                                                sql += ` '${params.userInfo.uid}',`
                                            } else if (isAdd && key === 'create_time') {
                                                isAdd = false
                                                sql += ` '${time}',`
                                            } else if (isAdd && key === 'operate') {
                                                isAdd = false
                                                sql += ` '${params.operate}给${results_u[0].name}',`
                                            } else if (isAdd && key === 'need_examine') {
                                                isAdd = false
                                                sql += ` '需要审批',`
                                            } else if (isAdd && key === 'examine_uid') {
                                                isAdd = false
                                                sql += ` '${params.userInfo.e_id}',`
                                            } else if (isAdd && (key === 'history_other_info' || key === 'examine_time' || key === 'examine_result' || key === 'examine_note')) {
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
                                    sql = sql.substring(0, sql.length - 1)
                                    sql += `)`
                                    db.query(sql, (err, results) => {
                                        if (err) throw err;
                                        let sql = `SELECT * FROM talent WHERE tid = '${params.tid}'`
                                        db.query(sql, (err, results_t) => {
                                            if (err) throw err;
                                            let sql = `SELECT * FROM user WHERE uid = '${params.userInfo.e_id}'`
                                            db.query(sql, (err, results_e) => {
                                                if (err) throw err;
                                                sendRobot(
                                                    results_e[0].secret,
                                                    results_e[0].url,
                                                    `${results_t[0].name} ${params.operate}`,
                                                    `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：${params.operate} \n\n ### 达人昵称：${results_t[0].name} \n\n ### 审批人员：@${results_e[0].phone}`,
                                                    `http://1.15.89.163:5173`,
                                                    [results_e[0].phone],
                                                    false
                                                )
                                                res.send({ code: 200, data: [], msg: `${params.operate}成功` })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})

// 搜索达人
router.post('/getTalentItems', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where status != '失效' and status != '测试'`
    if (params.userInfo.department === '事业部') {
        if (params.userInfo.position === '副总' || (params.userInfo.company === '总公司' && params.userInfo.position === '助理')) {
            whereUser += ` and department = '${params.userInfo.department}'`
        }
        if (params.userInfo.position === '主管') {
            whereUser += ` and department = '${params.userInfo.department}' and company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
        }
        if (params.userInfo.company !== '总公司' && params.userInfo.position === '助理') {
            whereUser += ` and uid = '${params.userInfo.up_uid}'`
        }
    }
    let sql = `SELECT DISTINCT t.tid, t.name
                FROM talent t
                    INNER JOIN (
                        SELECT tm.tid
                        FROM talent_model tm
                            INNER JOIN (
                                SELECT tms0.tmid, IF(u1.uid IS NULL, '', u1.uid) as u_id_1, IF(u1.name IS NULL, '', u1.name) as u_name_1, IF(u2.uid IS NULL, '', u2.uid) as u_id_2, IF(u2.name IS NULL, '', u2.name) as u_name_2
                                FROM talent_model_schedule tms0
                                    INNER JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmsid = tms0.tmsid
                                    INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = tms0.u_id_1
                                    LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                            ) tms ON tms.tmid = tm.tmid
                        WHERE tm.status != '已失效'
                    ) tm ON tm.tid = t.tid
                WHERE t.status != '已失效' and t.status != '报备驳回' and t.status != '已撤销' and t.status != '已拉黑'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let talents = []
        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            talents.push({
                label: element.name,
                value: element.tid
            })
        }
        res.send({ code: 200, data: talents, msg: `` })
    })
})

// 获取合作模式下拉框
router.post('/getModelItems', (req, res) => {
    let params = req.body
    let sql = `SELECT tmid, CONCAT(model, '_', platform, '_', IF(shop_type IS NULL, '', shop_type), IF(shop_name IS NULL, '', shop_name), '_', account_name) as model FROM talent_model WHERE tid = '${params.tid}' and model != '供货' and status = '合作中'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let models = []
        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            models.push({
                label: element.model,
                value: element.tmid
            })
        }
        res.send({ code: 200, data: models, msg: `` })
    })
})

// 获取合作模式默认佣金下拉框
router.post('/getCommissions', (req, res) => {
    let params = req.body
    let sql = `SELECT tms0.*, u1.name as u_name_1, u2.name as u_name_2
                FROM talent_model tm
                    INNER JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                    LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid
                    LEFT JOIN user u1 ON u1.uid = tms0.u_id_1
                    LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                WHERE tm.tmid = '${params.tmid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results[0], msg: `` })
    })
})

// 获取达人审批驳回理由
router.post('/getRefundReasonT', (req, res) => {
    let params = req.body
    let sql = `SELECT ts1.examine_note
                FROM talent t
                    LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE operate = '达人报备' and examine_result = '驳回' GROUP BY tid) ts0 ON ts0.tid = t.tid
                    LEFT JOIN talent_schedule ts1 ON ts1.tsid = ts0.tsid
                WHERE t.tid = '${params.tid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results[0].examine_note, msg: `` })
    })
})

// 获取被驳回达人的信息
router.post('/getReportInfo', (req, res) => {
    let params = req.body
    let where = ``
    if (params.tid) {
        where = `WHERE t.tid = '${params.tid}'`
    } else {
        where = `WHERE c.cid = '${params.cid}'`
    }
    let sql = `SELECT t.*, ts1.*, tm.*, tms1.*, u1.name as u_name_1, u2.name as u_name_2, u0.name as u_name_0, m1.name as m_name_1, m2.name as m_name_2
                FROM talent t
                    LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE operate = '达人报备' and (examine_result = '驳回' or examine_result IS NULL) GROUP BY tid) ts0 ON ts0.tid = t.tid
                    LEFT JOIN talent_schedule ts1 ON ts1.tsid = ts0.tsid
                    LEFT JOIN talent_model tm ON tm.tid = t.tid
                    LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE operate = '达人报备' and (examine_result = '驳回' or examine_result IS NULL) GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                    LEFT JOIN talent_model_schedule tms1 ON tms1.tmsid = tms0.tmsid
                    LEFT JOIN user u1 ON u1.uid = tms1.u_id_1
                    LEFT JOIN user u2 ON u2.uid = tms1.u_id_2
                    LEFT JOIN middleman m1 ON m1.mid = ts1.m_id_1
                    LEFT JOIN middleman m2 ON m2.mid = ts1.m_id_2
                    LEFT JOIN user u0 ON u0.uid = ts1.u_id_0
                    LEFT JOIN chance c ON c.cid = t.cid
                ${where}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, msg: `` })
    })
})

// 导出达人
router.post('/getExportTalentList', (req, res) => {
    let params = req.body
    // 权限筛选
    let whereUser = `where status != '失效' and status != '测试'`
    if (params.userInfo.position != '管理员' || params.userInfo.position.match('总裁')) {
        if (params.userInfo.position === '副总' || (params.userInfo.company === '总公司' && params.userInfo.position === '助理')) {
            whereUser += ` and department = '${params.userInfo.department}'`
        }
        if (params.userInfo.position === '主管') {
            whereUser += ` and department = '${params.userInfo.department}' and company = '${params.userInfo.company}'`
        }
        if (params.userInfo.position === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
        }
        if (params.userInfo.company !== '总公司' && params.userInfo.position === '助理') {
            whereUser += ` and uid = '${params.userInfo.up_uid}'`
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
    let sql = `SELECT * FROM (
                SELECT t.*, tm.models, tm.platforms, CONCAT(ts.m_id_1, ',', ts.m_id_2) as m_ids, ts.m_name_1, ts.m_name_2, CONCAT(ts.m_name_1, ',', ts.m_name_2) as m_names, 
                    IF(ts.yearbox_start_date IS NULL, '暂无', '生效中') as yearbox_status, ts.yearbox_start_date, ts.yearbox_cycle, ts.yearbox_lavels_base, ts.yearbox_lavels, 
                    CONCAT(tm.u_id_1, ',', tm.u_id_2, ',', ts.u_id_0) as u_ids, CONCAT(tm.u_name_1, ',', tm.u_name_2, ',', ts.u_name_0) as u_names, tm.u_name_1, tm.u_name_2, ts.u_name_0, tm.model_status, COUNT(l.lid) as live_count, SUM(l.sales) as live_sum
                FROM talent t
                    LEFT JOIN (
                        SELECT ts0.tid, IF(m1.mid IS NULL, '', m1.mid) as m_id_1, IF(m1.name IS NULL, '', m1.name) as m_name_1, IF(m2.mid IS NULL, '', m2.mid) as m_id_2, IF(m2.name IS NULL, '', m2.name) as m_name_2,
                            IF(ts0.u_id_0 IS NULL, '', ts0.u_id_0) as u_id_0, IF(u0.name IS NULL, '', u0.name) as u_name_0, ts0.yearbox_start_date, ts0.yearbox_cycle, ts0.yearbox_lavels_base, ts0.yearbox_lavels
                        FROM talent_schedule ts0
                            INNER JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule GROUP BY tid) ts1 ON ts1.tsid = ts0.tsid
                            LEFT JOIN middleman m1 ON m1.mid = ts0.m_id_1
                            LEFT JOIN middleman m2 ON m2.mid = ts0.m_id_2
                            LEFT JOIN user u0 ON u0.uid = ts0.u_id_0
                    ) ts ON ts.tid = t.tid
                    INNER JOIN (
                        SELECT tm.tid, GROUP_CONCAT(DISTINCT tm.model) as models, GROUP_CONCAT(DISTINCT tm.platform) as platforms, GROUP_CONCAT(DISTINCT tms.u_id_1) as u_id_1, GROUP_CONCAT(DISTINCT tms.u_name_1) as u_name_1, 
                            GROUP_CONCAT(DISTINCT tms.u_id_2) as u_id_2, GROUP_CONCAT(DISTINCT tms.u_name_2) as u_name_2, GROUP_CONCAT(DISTINCT IF(tm.model_files is null, '暂无', '生效中')) as model_status
                        FROM talent_model tm
                            INNER JOIN (
                                SELECT tms0.tmid, IF(u1.uid IS NULL, '', u1.uid) as u_id_1, IF(u1.name IS NULL, '', u1.name) as u_name_1, IF(u2.uid IS NULL, '', u2.uid) as u_id_2, IF(u2.name IS NULL, '', u2.name) as u_name_2
                                FROM talent_model_schedule tms0
                                    INNER JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule GROUP BY tmid) tms1 ON tms1.tmsid = tms0.tmsid
                                    INNER JOIN (SELECT * FROM user ${whereUser}) u1 ON u1.uid = tms0.u_id_1
                                    LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                            ) tms ON tms.tmid = tm.tmid
                        GROUP BY tm.tid
                    ) tm ON tm.tid = t.tid
                        LEFT JOIN live l ON l.tid = t.tid
                GROUP BY t.cid, t.crowd_name, t.liaison_name, t.liaison_phone, t.liaison_type, t.liaison_v, m_ids, ts.m_name_1, ts.m_name_2, m_names, tm.model_status, tm.models, t.name, t.province, t.status, t.tid, t.type, u_ids, ts.u_name_0, tm.u_name_1, 
                    tm.u_name_2, u_names, t.year_deal, ts.yearbox_cycle, ts.yearbox_lavels, ts.yearbox_lavels_base, ts.yearbox_start_date, tm.platforms
                ) z 
                ${whereFilter}
                ORDER BY z.tid DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, msg: `` })
    })
})

// 撤销报备
router.post('/revokeReport', (req, res) => {
    let params = req.body
    let sql = `UPDATE talent SET status = '已撤销' WHERE tid = '${params.tid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT cid FROM talent WHERE tid = '${params.tid}'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            if (results[0].cid === 'undefined') {
                res.send({ code: 200, data: [], msg: `撤销成功` })
            } else {
                let sql = `UPDATE chance SET status = '待报备' WHERE cid = '${results[0].cid}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `撤销成功` })
                })
            }
        })
    })
})

// 撤销其他
router.post('/revokeOthers', (req, res) => {
    let params = req.body
    let sql = `UPDATE talent SET status = '合作中' WHERE tid = '${params.tid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `UPDATE talent_schedule SET status = '已失效' WHERE tid = '${params.tid}' and status = '待审批'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let sql = `UPDATE talent_model tm, talent_model_schedule tms SET tm.status = IF(tms.operate = '新达人报备', '已失效', '合作中'), tms.status = '已失效' WHERE tm.tid = '${params.tid}' and tm.tmid = tms.tmid and tms.status = '待审批'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `撤销成功` })
            })
        })
    })
})

module.exports = router