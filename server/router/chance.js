const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../config/db')
const ddurls = require('../config/commentDD')
const sendRobot = require('../api/ddrobot')

// 获取商机列表
router.post('/getChanceList', (req, res) => {
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
        if (params.userInfo.position === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
        }
    }
    // 条件筛选
    let whereFilter = `where c.status != '报备通过'`
    if (params.filtersDate && params.filtersDate.length === 2) {
        whereFilter += ` and c.create_time >= '${params.filtersDate[0]}' and c.create_time < '${params.filtersDate[1]}'`
    }
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            whereFilter += ` and c.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            whereFilter += ` and c.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT c.*, u.name 
                FROM chance c 
                    INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = c.u_id
                ${whereFilter}
                ORDER BY c.cid DESC`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let s = sql + ` LIMIT ${pageSize} OFFSET ${current * pageSize}`
        db.query(s, (err, r) => {
            if (err) throw err;
            res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })
    })
})

// 查询重复商机
router.post('/searchSameChance', (req, res) => {
    let params = req.body
    let sql = ''
    if (params.type === 'arr') {
        let account_ids = ''
        for (let i = 0; i < params.account_ids.length; i++) {
            account_ids += `'${params.account_ids[i]}',`
        }
        account_ids = account_ids.substring(0, account_ids.length - 1)
        let account_names = ''
        for (let i = 0; i < params.account_names.length; i++) {
            account_names += `'${params.account_names[i]}',`
        }
        account_names = account_names.substring(0, account_names.length - 1)
        sql = `SELECT a.cid, a.name, a.platforms, a.account_names, a.account_ids, a.status 
                FROM ( 
                    SELECT DISTINCT cid, u.name, platforms, account_names, account_ids, c.status, substring_index(substring_index( account_names, ',', topic.help_topic_id + 1 ), ',',- 1 ) as names, 
                        substring_index(substring_index( account_ids, ',', topic2.help_topic_id + 1 ), ',',- 1 ) as ids 
                    FROM chance c
                        LEFT JOIN mysql.help_topic topic ON topic.help_topic_id < ( length( account_names ) - length( REPLACE ( account_names, ',', '' ) ) + 1 ) 
                        LEFT JOIN mysql.help_topic topic2 ON topic2.help_topic_id < ( length( account_ids ) - length( REPLACE ( account_ids, ',', '' ) ) + 1 ) 
                        LEFT JOIN user u ON u.uid = c.u_id 
                    HAVING (names in (${account_names}) or ids in (${account_ids})) and cid != '${params.cid}' 
                    ) a 
                GROUP BY a.cid, a.name`
    } else {
        let where = 'WHERE '
        if (params.account_id !== null && params.account_name !== null) {
            where += `(tm.account_id = '${params.account_id}' or tm.account_name = '${params.account_name}')`
        } else if (params.account_id === null) {
            where += `(tm.account_name = '${params.account_name}')`
        } else {
            where += `(tm.account_id = '${params.account_id}')`
        }
        sql = `SELECT tm.tid, u1.name as u_name_1, u2.name as u_name_2, tm.platform, tm.shop, tm.account_id, tm.account_name 
                FROM talent_model tm
                    LEFT JOIN talent_model_schedule tms0 ON tms0.tmid = tm.tmid
                    INNER JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms1 ON tms1.tmsid = tms0.tmsid
                    LEFT JOIN user u1 ON u1.uid = tms0.u_id_1
                    LEFT JOIN user u2 ON u2.uid = tms0.u_id_2
                ${where}`
    }
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length != 0) {
            res.send({ code: 201, data: results, msg: `账号名/ID重复` })
        } else {
            res.send({ code: 200, data: {}, msg: `无重复` })
        }
    })
})

// 添加新商机
router.post('/addChance', (req, res) => {
    let params = req.body
    let sql = `SELECT count(*) as sum FROM chance`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let cid = 'C' + `${results[0].sum + 1}`.padStart(5, '0')
        let models = `'${params.models.join()}'`
        let group_name = params.group_name ? `'${params.group_name}'` : null
        let provide_name = params.provide_name ? `'${params.provide_name}'` : null
        let platforms = params.platforms ? `'${params.platforms.join()}'` : null
        let account_ids = params.account_ids ? `'${params.account_ids.join()}'` : null
        let account_names = params.account_names ? `'${params.account_names.join()}'` : null
        let search_pic = params.search_pic.replace('/public', '')
        let sql = `INSERT INTO chance VALUES('${cid}', ${models}, ${group_name}, ${provide_name}, ${platforms}, ${account_ids}, ${account_names}, '${search_pic}', null, null, null, null, null, null, '待推进', '${params.userInfo.uid}', ${dayjs().valueOf()}, null)`
        db.query(sql, (err, results) => {
            if (err) throw err;
            res.send({ code: 200, data: {}, msg: `添加成功` })
        })
    })
})

// 修改
router.post('/editChance', (req, res) => {
    let params = req.body
    params.models = params.models ? params.models.join() : null
    params.platforms = params.platforms ? params.platforms.join() : null
    params.account_ids = params.account_ids ? params.account_ids.join() : null
    params.account_names = params.account_names ? params.account_names.join() : null
    params.group_name = params.group_name ? params.group_name : null
    params.provide_name = params.provide_name ? params.provide_name : null
    let sql = 'UPDATE chance SET'
    for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
        if (Object.keys(params)[i] !== 'userInfo' && Object.keys(params)[i] !== 'cid') {
            sql += Object.values(params)[i] !== null ? ` ${Object.keys(params)[i]} = '${Object.values(params)[i]}',` : ` ${Object.keys(params)[i]} = null,`
        }
    }
    sql = sql.substring(0, sql.length - 1)
    sql += ` WHERE cid = '${params.cid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: {}, msg: `修改成功` })
    })
})

// 推进商机
router.post('/advanceChance', (req, res) => {
    let params = req.body
    params.advance_pic = params.advance_pic.replace('/public', '')
    let sql = 'UPDATE chance SET'
    for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
        if (Object.keys(params)[i] !== 'userInfo' && Object.keys(params)[i] !== 'cid') {
            sql += Object.values(params)[i] !== null ? ` ${Object.keys(params)[i]} = '${Object.values(params)[i]}',` : ` ${Object.keys(params)[i]} = null,`
        }
    }
    sql += ` advance_time = ${dayjs().valueOf()}, status = '待报备' WHERE cid = '${params.cid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: {}, msg: `${params.cid} 推进成功` })
    })
})

// 修改联系人
router.post('/editLiaison', (req, res) => {
    let params = req.body
    let sql = 'UPDATE chance SET'
    for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
        if (Object.keys(params)[i] !== 'userInfo' && Object.keys(params)[i] !== 'cid') {
            sql += Object.values(params)[i] !== null ? ` ${Object.keys(params)[i]} = '${Object.values(params)[i]}',` : ` ${Object.keys(params)[i]} = null,`
        }
    }
    sql = sql.substring(0, sql.length - 1)
    sql += ` WHERE cid = '${params.cid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: {}, msg: `修改成功` })
    })
})

// 报备商机
router.post('/reportChance', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT * FROM talent WHERE name = '${params.talent_name}' and status != '已失效'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length !== 0) {
            res.send({ code: 201, data: {}, msg: `重复 达人昵称` })
        } else {
            let m_id_1 = params.m_id_1 ? `'${params.m_id_1}'` : null
            let m_point_1 = params.m_point_1 ? `'${params.m_point_1}'` : null
            let m_id_2 = params.m_id_2 ? `'${params.m_id_2}'` : null
            let m_point_2 = params.m_point_2 ? `'${params.m_point_2}'` : null
            let m_note = params.m_note_2 ? `'${params.m_note_2}'` : null
            let sql = `SELECT * FROM talent`
            db.query(sql, (err, results) => {
                if (err) throw err;
                let tid = 'T' + `${results.length + 1}`.padStart(7, '0')
                let sql = `INSERT INTO talent values('${tid}', '${params.cid}', '${params.talent_name}', '${params.province}', '${params.year_deal}', '${params.liaison_type}', '${params.liaison_name}', '${params.liaison_v}', '${params.liaison_phone}', '${params.crowd_name}', null, null, null, null, null, '报备待审批', '${params.userInfo.uid}', '${time}')`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    let sql = `SELECT * FROM talent_schedule`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        let tsid = 'TS' + `${results.length + 1}`.padStart(7, '0')
                        let sql = `INSERT INTO talent_schedule values('${tsid}', '${tid}', ${m_id_1}, ${m_point_1}, ${m_id_2}, ${m_point_2}, ${m_note}, null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批')`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
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
                                            sql_d += `('${tmid}', '${tid}', '线上平台', '${params.accounts[i].platform}', '${params.accounts[i].shop}', '${params.accounts[i].account_id}', '${params.accounts[i].account_name}', '${params.accounts[i].account_type}', '${params.accounts[i].account_models}', ${keyword}, '${params.accounts[i].people_count}', '${params.accounts[i].fe_proportion}', '${params.accounts[i].age_cuts}', '${params.accounts[i].main_province}', '${params.accounts[i].price_cut}', '待审批', '${params.userInfo.uid}', '${time}'),`
                                            sql_l += `('${tmsid}', '${tmid}', '${params.accounts[i].commission_normal}', '${params.accounts[i].commission_welfare}', '${params.accounts[i].commission_bao}', '${params.accounts[i].commission_note}', null, null, null, null, null, null, null, '${params.userInfo.uid}', '${params.accounts[i].u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
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
                                        sql_d += `('${tmid}', '${tid}', '社群团购', '聚水潭', '${params.group_shop}', null, null, null, null, null, null, null, null, null, null, '待审批', '${params.userInfo.uid}', '${time}'),`
                                        sql_l += `('${tmsid}', '${tmid}', null, null, null, null, '${params.discount_normal}', '${params.discount_welfare}', '${params.discount_bao}', '${params.discount_note}', null, null, null, '${params.userInfo.uid}', '${params.group_u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
                                        count_d += 1
                                        count_l += 1
                                    }
                                    if (params.provide_shop) {
                                        let tmid = 'TM' + `${count_d + 1}`.padStart(7, '0')
                                        let tmsid = 'TMS' + `${count_l + 1}`.padStart(7, '0')
                                        let u_id_2 = params.provide_u_id_2 ? `'${params.provide_u_id_2}'` : null
                                        let u_point_2 = params.provide_u_point_2 ? `'${params.provide_u_point_2}'` : null
                                        let u_note = params.provide_u_note ? `'${params.provide_u_note}'` : null
                                        sql_d += `('${tmid}', '${tid}', '供货', '聚水潭', '${params.provide_shop}', null, null, null, null, null, null, null, null, null, null, '待审批', '${params.userInfo.uid}', '${time}'),`
                                        sql_l += `('${tmsid}', '${tmid}', null, null, null, null, null, null, null, null, '${params.discount_buyout}', '${params.discount_back}', '${params.discount_label}', '${params.userInfo.uid}', '${params.provide_u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
                                        count_d += 1
                                        count_l += 1
                                    }
                                    sql_d = sql_d.substring(0, sql_d.length - 1)
                                    sql_l = sql_l.substring(0, sql_l.length - 1)
                                    db.query(sql_d, (err, results) => {
                                        if (err) throw err;
                                        db.query(sql_l, (err, results) => {
                                            if (err) throw err;
                                            let sql = `UPDATE chance SET status = '待审批' WHERE cid = '${params.cid}'`
                                            db.query(sql, (err, results) => {
                                                if (err) throw err;
                                                let sql = `SELECT phone FROM user WHERE uid = '${params.userInfo.e_id}'`
                                                db.query(sql, (err, results_e) => {
                                                    if (err) throw err;
                                                    sendRobot(ddurls.report, `${params.talent_name} ${params.operate}`, `请尽快审批~ @${results_e[0].phone}`, `http://1.15.89.163:5173`, [results_e[0].phone], false)
                                                    res.send({ code: 200, data: {}, msg: `报备成功` })
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
        }
    })
})

module.exports = router