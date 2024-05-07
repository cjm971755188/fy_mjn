const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../config/db')
const sendRobot = require('../api/ddrobot')
const { power, filter, isNull } = require('../function/power')

// 获取商机列表
router.post('/getChanceList', (req, res) => {
    let params = req.body
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT SQL_CALC_FOUND_ROWS * 
                FROM (
                    SELECT c.cid, c.models, c.group_name, c.provide_name, c.custom_name, c.platforms, c.account_names, c.search_pic, c.liaison_type, c.liaison_name, c.liaison_v, c.liaison_phone, c.crowd_name, c.advance_pic, c.note, c.refund_note, c.delay_note, 
                            IF(15 - DATEDIFF(NOW(), FROM_UNIXTIME(LEFT(c.advance_time, 10))) < 0 && (c.status = '待报备' || c.status = '报备驳回'), '已过期', c.status) as status, c.create_time, c.advance_time, c.report_time, c.u_id, u.name as u_name, 
                            15 - DATEDIFF(NOW(), FROM_UNIXTIME(LEFT(c.advance_time, 10))) as days, ts1.examine_note, c.advance_days
                    FROM chance c 
                        LEFT JOIN user u ON u.uid = c.u_id
                        LEFT JOIN (SELECT cid, MAX(tid) as tid FROM talent WHERE status = '已失效' GROUP BY cid) t ON t.cid = c.cid
                        LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule WHERE operate = '达人报备' and examine_result = '驳回' GROUP BY tid) ts0 ON ts0.tid = t.tid
                        LEFT JOIN talent_schedule ts1 ON ts1.tsid = ts0.tsid
                        ${power(['u'], params.userInfo)}
                ) z 
                ${filter('chance', params.filters)} and z.status != '报备通过'
                ORDER BY z.cid DESC
                LIMIT ${pageSize} OFFSET ${current * pageSize}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT FOUND_ROWS() as count`
        db.query(sql, (err, count) => {
            if (err) throw err;
            let sql = `SELECT COUNT(*) as count FROM chance c WHERE c.status LIKE '%待审批' and c.status != '报备待审批'`
            db.query(sql, (err, wait) => {
                if (err) throw err;
                res.send({ code: 200, data: results, pagination: { ...params.pagination, total: count[0].count }, wait_sum: wait[0].count, msg: `` })
            })
        })
    })
})

// 查询重复商机
router.post('/searchSameChance', (req, res) => {
    let params = req.body
    let names = Array.from(new Set([].concat(params.account_names ? params.account_names : []).concat(params.group_name ? params.group_name : []).concat(params.provide_name ? params.provide_name : []).concat(params.custom_name ? params.custom_name : [])))
    let r = [], r_name = '', sql = ''
    for (let i = 0; i < names.length; i++) {
        sql = `(SELECT tm.tmid, t.name, tm.model, tm.platform, tm.account_id, tm.account_name, u.name as u_name, t.status, '' as note
                    FROM talent_model tm
                        INNER JOIN talent t ON t.tid = tm.tid and t.status != '报备驳回' and t.status != '已撤销' and t.status != '已失效' and t.tid != '${params.tid}'
                        LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule WHERE status != '已失效' GROUP BY tmid) tms0 ON tms0.tmid = tm.tmid
                        LEFT JOIN talent_model_schedule tms1 ON tms1.tmsid = tms0.tmsid
                        LEFT JOIN user u ON u.uid = tms1.u_id_1
                    WHERE	(t.name LIKE '%${names[i]}%' or tm.account_name LIKE '%${names[i]}%')
                        and tm.status != '已失效' ${params.type === 'edit' ? `and tm.tmid != '${params.tmid}'` : ''})
                UNION
                (SELECT	b.tbid, b.name, '', '', '', '', '', b.status, ''
                FROM talent_black b
                WHERE b.name LIKE '%${names[i]}%'
                    and b.status != '失效')
                UNION
                (SELECT	c.cid, '', c.models, c.platforms, '', CONCAT(IF(c.account_names IS NULL, '', c.account_names), ',', IF(c.group_name IS NULL, '', c.group_name), ',', IF(c.provide_name IS NULL, '', c.provide_name), ',', IF(c.custom_name IS NULL, '', c.custom_name)), u.name as u_name, c.status, ''
                    FROM chance c
                        LEFT JOIN user u ON u.uid = c.u_id
                    WHERE (c.account_names LIKE '%${names[i]}%' or c.group_name LIKE '%${names[i]}%' or c.provide_name LIKE '%${names[i]}%' or c.custom_name LIKE '%${names[i]}%')
                        and IF(c.advance_time IS NULL, -1, 15 - DATEDIFF(NOW(), FROM_UNIXTIME(LEFT(c.advance_time, 10)))) >= 0
                        and c.status != '待推进' 
                        and c.status != '已失效' 
                        and c.status != '推进驳回'
                        and c.status != '报备通过'
                        and c.cid != '${params.cid}')`
        db.query(sql, (err, results) => {
            if (err) throw err;
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
        let cid = 'C' + `${results[0].sum + 1}`.padStart(7, '0')
        let sql = `INSERT INTO chance VALUES('${cid}', ${isNull(params.models, 'join')}, ${isNull(params.group_name, 'normal')}, ${isNull(params.provide_name, 'normal')}, ${isNull(params.custom_name, 'normal')}, ${isNull(params.platforms, 'join')}, 
                    ${isNull(params.account_names, 'join')}, '${params.search_pic}', '${params.liaison_type}', '${params.liaison_name}', '${params.liaison_v}', ${isNull(params.liaison_phone, 'normal')}, null, null, 0, null, null, null, '待推进', 
                    '${params.userInfo.up_uid === 'null' || params.userInfo.up_uid === null ? params.userInfo.uid : params.userInfo.up_uid}', ${dayjs().valueOf()}, null, null)`
        db.query(sql, (err, results) => {
            if (err) throw err;
            res.send({ code: 200, data: [], msg: `添加成功` })
        })
    })
})

// 修改商机
router.post('/editChance', (req, res) => {
    let params = req.body
    let sql = 'UPDATE chance SET'
    for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
        if (['userInfo', 'cid', 'type', 'operate'].indexOf(Object.keys(params)[i]) > -1) {
            continue
        } else if (['models', 'platforms', 'account_names'].indexOf(Object.keys(params)[i]) > -1) {
            sql += ` ${Object.keys(params)[i]} = ` + isNull(Object.values(params)[i], 'join') + ','
        } else {
            sql += ` ${Object.keys(params)[i]} = ` + isNull(Object.values(params)[i], 'normal') + ','
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
    let sql = `UPDATE chance 
                SET crowd_name = '${params.crowd_name}', status = IF(advance_time IS NULL, '推进待审批', '延期推进待审批'), advance_pic = '${params.advance_pic}', advance_time = ${dayjs().valueOf()}, delay_note = ${isNull(params.delay_note, 'normal')} 
                WHERE cid = '${params.cid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT * FROM user WHERE uid = 'MJN00025'`
        db.query(sql, (err, results_e) => {
            if (err) throw err;
            sendRobot(
                results_e[0].secret,
                results_e[0].url,
                {
                    "msgtype": "markdown",
                    "markdown": {
                        "title": `${params.names} ${params.operate}`,
                        "text": `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：${params.operate} \n\n ### 达人昵称：${params.names} \n\n ### 审批人员：@${results_e[0].phone} \n> 
                            ##### 网址：http://1.15.89.163:5173`
                    },
                    "at": {
                        "atMobiles": [results_e[0].phone],
                        "isAtAll": false
                    }
                }
            )
            res.send({ code: 200, data: [], msg: `推进成功，等待审批` })
        })
    })
})

// 审批商机
router.post('/examChance', (req, res) => {
    let params = req.body
    let sql = ''
    if (params.exam) {
        sql = `UPDATE chance SET advance_days = advance_days + 15, status = '待报备' WHERE cid = '${params.cid}'`
    } else {
        sql = `UPDATE chance SET crowd_name = null, advance_pic = null, refund_note = ${isNull(params.note, 'normal')}, status = '推进驳回', advance_time = null WHERE cid = '${params.cid}'`
    }
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT u.* FROM chance c LEFT JOIN user u ON c.u_id = u.uid WHERE c.cid = '${params.cid}'`
        db.query(sql, (err, results_u) => {
            if (err) throw err;
            sendRobot(
                results_u[0].secret,
                results_u[0].url,
                {
                    "msgtype": "markdown",
                    "markdown": {
                        "title": `${params.names} 推进商机 审批${params.exam ? '通过' : '驳回'}`,
                        "text": `### 申请人员：@${results_u[0].phone} \n\n ### 申请操作：推进商机 \n\n ### 达人昵称：${params.names} \n\n ### 审批人员：${params.userInfo.name} \n\n ### 审批结果：${params.exam ? '通过' : '驳回'} ${params.exam ? `` : `\n\n ### 驳回理由：${isNull(params.note, 'normal')}`} \n> ##### 网址：http://1.15.89.163:5173`
                    },
                    "at": {
                        "atMobiles": [results_u[0].phone],
                        "isAtAll": false
                    }
                }
            )
            res.send({ code: 200, data: [], msg: `` })
        })
    })
})

// 报备商机
router.post('/reportChance', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT * FROM talent WHERE name LIKE '%${params.talent_name}%' and status != '已失效' and status != '报备驳回' and status != '已撤销'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `重复 达人昵称` })
        } else {
            let sql = 'SELECT * FROM user LIMIT 1'
            if (params.clickTid !== '') {
                sql = `UPDATE talent SET status = '已失效' WHERE tid = '${params.clickTid}'`
            }
            db.query(sql, (err, results) => {
                if (err) throw err;
                let liaison_phone = params.liaison_phone ? `'${params.liaison_phone}'` : null
                let m_id_1 = params.m_id_1 ? params.m_id_1.value ? `'${params.m_id_1.value}'` : `'${params.m_id_1}'` : null
                let m_type_1 = params.m_type_1 ? params.m_type_1.value ? `'${params.m_type_1.value}'` : `'${params.m_type_1}'` : null
                let m_point_1 = params.m_point_1 ? params.m_point_1.value ? `'${params.m_point_1.value}'` : `'${params.m_point_1}'` : null
                let m_note_1 = params.m_note_1 ? `'${params.m_note_1}'` : null
                let m_id_2 = params.m_id_2 ? params.m_id_2.value ? `'${params.m_id_2.value}'` : `'${params.m_id_2}'` : null
                let m_type_2 = params.m_type_2 ? params.m_type_2.value ? `'${params.m_type_2.value}'` : `'${params.m_type_2}'` : null
                let m_point_2 = params.m_point_2 ? params.m_point_2.value ? `'${params.m_point_2.value}'` : `'${params.m_point_2}'` : null
                let m_note_2 = params.m_note_2 ? `'${params.m_note_2}'` : null
                let u_id_0 = params.u_id_0 ? params.u_id_0.value ? `'${params.u_id_0.value}'` : `'${params.u_id_0}'` : null
                let u_point_0 = params.u_point_0 ? params.u_point_0.value ? `'${params.u_point_0.value}'` : `'${params.u_point_0}'` : null
                let sql = `SELECT * FROM talent`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    let tid = 'T' + `${results.length + 1}`.padStart(7, '0')
                    let sql = `INSERT INTO talent values('${tid}', '${params.cid}', '${params.talent_name}', '${params.province}', '${params.year_deal}', '${params.talent_type}', '${params.liaison_type}', '${params.liaison_name}', '${params.liaison_v}', ${liaison_phone}, '${params.crowd_name}', '${params.report_pic}', '报备待审批')`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        let sql = `SELECT * FROM talent_schedule`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
                            let tsid = 'TS' + `${results.length + 1}`.padStart(7, '0')
                            let sql = `INSERT INTO talent_schedule values('${tsid}', '${tid}', ${m_id_1}, ${m_type_1}, ${m_point_1}, ${m_note_1}, ${m_id_2}, ${m_type_2}, ${m_point_2}, ${m_note_2}, null, null, null, null, null, null, null, null, null, ${u_id_0}, ${u_point_0}, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', 'MJN00027', null, null, null, '待审批')`
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
                                                let shop_name = params.accounts[i].shop_name ? `'${params.accounts[i].shop_name}'` : null
                                                let keyword = params.accounts[i].keyword ? `'${params.accounts[i].keyword}'` : null
                                                let commission_note = params.accounts[i].commission_note ? `'${params.accounts[i].commission_note}'` : null
                                                let u_id_2 = params.accounts[i].u_id_2 ? params.accounts[i].u_id_2.value ? `'${params.accounts[i].u_id_2.value}'` : `'${params.accounts[i].u_id_2}'` : null
                                                let u_point_2 = params.accounts[i].u_point_2 ? params.accounts[i].u_point_2.value ? `'${params.accounts[i].u_point_2.value}'` : `'${params.accounts[i].u_point_2}'` : null
                                                let u_note = params.accounts[i].u_note ? `'${params.accounts[i].u_note}'` : null
                                                let model_files = params.accounts[i].model_files ? `'${JSON.stringify(params.accounts[i].model_files)}'` : null
                                                sql_d += `('${tmid}', '${tid}', '线上平台', '${params.accounts[i].platform}', '${params.accounts[i].shop_type}', ${shop_name}, '${params.accounts[i].account_id}', '${params.accounts[i].account_name}', '${params.accounts[i].account_type}', '${params.accounts[i].account_models}', ${keyword}, '${params.accounts[i].people_count}', '${params.accounts[i].fe_proportion}', '${params.accounts[i].age_cuts}', '${params.accounts[i].main_province}', '${params.accounts[i].price_cut}', ${model_files}, '待审批'),`
                                                sql_l += `('${tmsid}', '${tmid}', '${params.accounts[i].commission_normal}', '${params.accounts[i].commission_welfare}', '${params.accounts[i].commission_bao}', ${commission_note}, null, null, null, null, null, null, null, null, null, '${params.accounts[i].u_id_1}', '${params.accounts[i].u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, '${params.accounts[i].gmv_belong}', null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', 'MJN00027', null, null, null, '待审批'),`
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
                                            sql_d += `('${tmid}', '${tid}', '社群团购', '聚水潭', null, '${params.group_shop}', null, '${params.group_name}', null, null, null, null, null, null, null, null, ${model_files}, '待审批'),`
                                            sql_l += `('${tmsid}', '${tmid}', '${params.commission_normal}', '${params.commission_welfare}', '${params.commission_bao}', ${commission_note}, null, null, null, null, null, null, null, null, null, '${params.group_u_id_1}', '${params.group_u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, '${params.group_gmv_belong}', null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', 'MJN00027', null, null, null, '待审批'),`
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
                                            sql_d += `('${tmid}', '${tid}', '供货', '聚水潭', null, '${params.provide_shop}', null, '${params.provide_name}', null, null, null, null, null, null, null, null, ${model_files}, '待审批'),`
                                            sql_l += `('${tmsid}', '${tmid}', null, null, null, null, '${params.discount_buyout}', '${params.discount_back}', ${discount_label}, null, null, null, null, null, null, '${params.provide_u_id_1}', '${params.provide_u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, '${params.provide_gmv_belong}', null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', 'MJN00027', null, null, null, '待审批'),`
                                            count_d += 1
                                            count_l += 1
                                        }
                                        if (params.custom_shop) {
                                            let tmid = 'TM' + `${count_d + 1}`.padStart(7, '0')
                                            let tmsid = 'TMS' + `${count_l + 1}`.padStart(7, '0')
                                            let deposit = params.deposit ? `'${params.deposit}'` : null
                                            let tail = params.tail ? `'${params.tail}'` : null
                                            let u_id_2 = params.custom_u_id_2 ? params.custom_u_id_2.value ? `'${params.custom_u_id_2.value}'` : `'${params.custom_u_id_2}'` : null
                                            let u_point_2 = params.custom_u_point_2 ? params.custom_u_point_2.value ? `'${params.custom_u_point_2.value}'` : `'${params.custom_u_point_2}'` : null
                                            let u_note = params.custom_u_note ? `'${params.custom_u_note}'` : null
                                            let model_files = params.custom_model_files ? `'${JSON.stringify(params.model_files)}'` : null
                                            sql_d += `('${tmid}', '${tid}', '定制', '聚水潭', null, '${params.custom_shop}', null, '${params.custom_name}', null, null, null, null, null, null, null, null, ${model_files}, '待审批'),`
                                            sql_l += `('${tmsid}', '${tmid}', null, null, null, null, null, null, null, '${params.profit_point}', '${params.tax_point}', '${params.has_package}', '${params.pay_type}', ${deposit}, ${tail}, '${params.custom_u_id_1}', '${params.custom_u_point_1}', ${u_id_2}, ${u_point_2}, ${u_note}, '${params.custom_gmv_belong}', null, '${params.userInfo.uid}', '${time}', '${params.operate}', '需要审批', 'MJN00027', null, null, null, '待审批'),`
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
                                                let sql = `UPDATE chance SET status = '报备待审批' WHERE cid = '${params.cid}'`
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
                                                                    "title": `${params.talent_name} ${params.operate}`,
                                                                    "text": `### 申请人员：${params.userInfo.name} \n\n ### 申请操作：${params.operate} \n\n ### 达人昵称：${params.talent_name} \n\n ### 审批人员：@${results_e[0].phone} \n> ##### 网址：http://1.15.89.163:5173`
                                                                },
                                                                "at": {
                                                                    "atMobiles": [results_e[0].phone],
                                                                    "isAtAll": false
                                                                }
                                                            }
                                                        )
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
            })
        }
    })
})

// 清除商机
router.post('/clearChance', (req, res) => {
    let params = req.body
    let sql = `UPDATE chance SET status = '已失效' WHERE cid = '${params.cid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `清除成功` })
    })
})

module.exports = router