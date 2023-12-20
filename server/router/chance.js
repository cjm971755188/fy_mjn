const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../config/db')
const ddurls = require('../config/commentDD')
const sendRobot = require('../api/ddrobot')
const BASE_URL = require('../config/config')

// 获取商机列表
router.post('/getChanceList', (req, res) => {
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
    let whereFilter = `where c.status != '已失效'`
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
    let names = []
    if (params.type === 'arr') {
        names = Array.from(new Set([].concat(params.talent_name ? params.talent_name : []).concat(params.account_ids ? params.account_ids : []).concat(params.account_names ? params.account_names : []).concat(params.group_name ? params.group_name : []).concat(params.provide_name ? params.provide_name : [])))
    } else {
        names = Array.from(new Set([].concat(params.account_id ? params.account_id : []).concat(params.account_name ? params.account_name : []).concat(params.group_name ? params.group_name : []).concat(params.provide_name ? params.provide_name : [])))
    }
    let r = [], r_name = ''
    for (let i = 0; i < names.length; i++) {
        let sql = `(SELECT	c.cid, '' as name, c.models, c.platforms, c.account_ids, c.account_names, c.group_name, c.provide_name, u.name as u_name, c.status
                    FROM	chance c
                        LEFT JOIN user u ON u.uid = c.u_id
                    WHERE	(c.account_ids LIKE '%${names[i]}%' OR c.account_names LIKE '%${names[i]}%' OR c.group_name LIKE '%${names[i]}%' OR c.provide_name LIKE '%${names[i]}%')
                        and c.status != '报备通过' and c.cid != '${params.cid}')
                    UNION
                    (SELECT tm.tmid, t.name, tm.model, tm.platform, tm.account_id, tm.account_name, tm.group_name, tm.provide_name, u.name as u_name, tm.status
                    FROM talent_model tm
                        LEFT JOIN talent t ON t.tid = tm.tid
                        LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                        LEFT JOIN talent_model_schedule tms1 ON tms1.tmsid = tms0.tmsid
                        LEFT JOIN user u ON u.uid = tms1.u_id_1
                    WHERE   (t.name LIKE '%${names[i]}%' OR tm.account_id LIKE '%${names[i]}%' OR tm.account_name LIKE '%${names[i]}%' OR tm.group_name LIKE '%${names[i]}%' OR tm.provide_name LIKE '%${names[i]}%')
                        and tm.status != '已失效')`
        db.query(sql, (err, results) => {
            if (err) throw err;
            console.log('results: ', results);
            if (results.length !== 0) {
                for (let j = 0; j < results.length; j++) {
                    r.push(results[j])
                }
                r_name += names[i]
            }
            if (i + 1 === names.length) {
                if (r.length !== 0) {
                    res.send({ code: 201, data: r, samename: r_name, msg: `${r_name} 重复` })
                } else {
                    res.send({ code: 200, data: [], msg: `无重复` })
                }
            }
        })
    }
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
            res.send({ code: 200, data: [], msg: `添加成功` })
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
        res.send({ code: 200, data: [], msg: `修改成功` })
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
        res.send({ code: 200, data: [], msg: `${params.cid} 推进成功` })
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
        res.send({ code: 200, data: [], msg: `修改成功` })
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
            res.send({ code: 201, data: [], msg: `重复 达人昵称` })
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
                let sql = `INSERT INTO talent values('${tid}', '${params.cid}', '${params.talent_name}', '${params.province}', '${params.year_deal}', '${params.liaison_type}', '${params.liaison_name}', '${params.liaison_v}', '${params.liaison_phone}', '${params.crowd_name}', null, null, null, null, null, null, '报备待审批', '${params.userInfo.uid}', '${time}')`
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
                                            let model_files = params.accounts[i].model_files ? `'${JSON.stringify(params.accounts[i].model_files)}'` : null
                                            sql_d += `('${tmid}', '${tid}', '线上平台', '${params.accounts[i].platform}', '${params.accounts[i].shop}', '${params.accounts[i].account_id}', '${params.accounts[i].account_name}', null, null, '${params.accounts[i].account_type}', '${params.accounts[i].account_models}', ${keyword}, '${params.accounts[i].people_count}', '${params.accounts[i].fe_proportion}', '${params.accounts[i].age_cuts}', '${params.accounts[i].main_province}', '${params.accounts[i].price_cut}', ${model_files}, '待审批', '${params.userInfo.uid}', '${time}'),`
                                            sql_l += `('${tmsid}', '${tmid}', '${params.accounts[i].commission_normal}', '${params.accounts[i].commission_welfare}', '${params.accounts[i].commission_bao}', '${params.accounts[i].commission_note}', null, null, null, null, null, null, null, '${params.userInfo.uid}', '${params.accounts[i].u_point_1}', ${u_id_2}, ${u_point_2}, null, null, ${u_note}, null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
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
                                        let model_files = params.group_model_files ? `'${JSON.stringify(params.model_files)}'` : null
                                        sql_d += `('${tmid}', '${tid}', '社群团购', '聚水潭', '${params.group_shop}', null, null, '${params.group_name}', null, null, null, null, null, null, null, null, null, ${model_files}, '待审批', '${params.userInfo.uid}', '${time}'),`
                                        sql_l += `('${tmsid}', '${tmid}', null, null, null, null, '${params.discount_normal}', '${params.discount_welfare}', '${params.discount_bao}', '${params.discount_note}', null, null, null, '${params.userInfo.uid}', '${params.group_u_point_1}', ${u_id_2}, ${u_point_2}, null, null, ${u_note}, null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
                                        count_d += 1
                                        count_l += 1
                                    }
                                    if (params.provide_shop) {
                                        let tmid = 'TM' + `${count_d + 1}`.padStart(7, '0')
                                        let tmsid = 'TMS' + `${count_l + 1}`.padStart(7, '0')
                                        let u_id_2 = params.provide_u_id_2 ? `'${params.provide_u_id_2}'` : null
                                        let u_point_2 = params.provide_u_point_2 ? `'${params.provide_u_point_2}'` : null
                                        let u_note = params.provide_u_note ? `'${params.provide_u_note}'` : null
                                        let model_files = params.provide_model_files ? `'${JSON.stringify(params.model_files)}'` : null
                                        sql_d += `('${tmid}', '${tid}', '供货', '聚水潭', '${params.provide_shop}', null, null, null, '${params.provide_name}', null, null, null, null, null, null, null, null, ${model_files}, '待审批', '${params.userInfo.uid}', '${time}'),`
                                        sql_l += `('${tmsid}', '${tmid}', null, null, null, null, null, null, null, null, '${params.discount_buyout}', '${params.discount_back}', '${params.discount_label}', '${params.userInfo.uid}', '${params.provide_u_point_1}', ${u_id_2}, ${u_point_2}, null, null, ${u_note}, null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', '${params.userInfo.e_id}', null, null, null, '待审批'),`
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
                                                    res.send({ code: 200, data: [], msg: `报备成功` })
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