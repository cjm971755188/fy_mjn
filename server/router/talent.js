const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');

// 获取达人列表
router.post('/getTalentList', (req, res) => {
    let params = req.body
    let where = `where u1.status != '2' and t.talent_status = '合作中'`
    // 权限筛选
    if (params.userInfo.position != '管理员') {
        if (params.userInfo.company != '总公司') {
            where += ` and u1.company = '${params.userInfo.company}'`
        }
        if (params.userInfo.department != '总裁办') {
            where += ` and u1.department = '${params.userInfo.department}'`
        }
        if (params.userInfo.position != '主管') {
            where += ` and u1.uid = '${params.userInfo.uid}'`
        }
    }
    // 条件筛选
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            where += ` and t.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            where += ` and t.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    // 分页
    let current = 0
    let pageSize = 10
    if (params.pagination.current) {
        current = params.pagination.current
    }
    if (params.pagination.pageSize) {
        pageSize = params.pagination.pageSize
    }
    let sql = `SELECT t.*, tl.yearpay_status, GROUP_CONCAT(DISTINCT td.model) as models, CONCAT(if(GROUP_CONCAT(DISTINCT u1.name) is null, '', GROUP_CONCAT(DISTINCT u1.name)), ',', if(GROUP_CONCAT(DISTINCT u2.name) is null, '', GROUP_CONCAT(DISTINCT u2.name))) as u_names, 
                    CONCAT(if(GROUP_CONCAT(DISTINCT m1.name) is null, '', GROUP_CONCAT(DISTINCT m1.name)), ',', if(GROUP_CONCAT(DISTINCT m2.name) is null, '', GROUP_CONCAT(DISTINCT m2.name))) as m_names
                FROM talentline tl
                    INNER JOIN (SELECT MAX(date_line) as date FROM talentline GROUP BY tdid) tl2 on tl2.date = tl.date_line 
                    LEFT JOIN user u1 on u1.uid = tl.uid_1 
                    LEFT JOIN user u2 on u2.uid = tl.uid_2 
                    LEFT JOIN middleman m1 on m1.mid = tl.mid_1 
                    LEFT JOIN middleman m2 on m2.mid = tl.mid_2 
                    LEFT JOIN talentdetail td on td.tdid = tl.tdid 
                    LEFT JOIN talent t ON t.tid = td.tid
                ${where} 
                GROUP BY t.tid, t.cid, t.talent_name, t.year_deal, t.talent_lavel, tl.yearpay_status`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT t.*, tl.yearpay_status, GROUP_CONCAT(DISTINCT td.model) as models, CONCAT(if(GROUP_CONCAT(DISTINCT u1.name) is null, '', GROUP_CONCAT(DISTINCT u1.name)), ',', if(GROUP_CONCAT(DISTINCT u2.name) is null, '', GROUP_CONCAT(DISTINCT u2.name))) as u_names, 
                        CONCAT(if(GROUP_CONCAT(DISTINCT m1.name) is null, '', GROUP_CONCAT(DISTINCT m1.name)), ',', if(GROUP_CONCAT(DISTINCT m2.name) is null, '', GROUP_CONCAT(DISTINCT m2.name))) as m_names
                    FROM talentline tl
                        INNER JOIN (SELECT MAX(date_line) as date FROM talentline GROUP BY tdid) tl2 on tl2.date = tl.date_line 
                        LEFT JOIN user u1 on u1.uid = tl.uid_1 
                        LEFT JOIN user u2 on u2.uid = tl.uid_2 
                        LEFT JOIN middleman m1 on m1.mid = tl.mid_1 
                        LEFT JOIN middleman m2 on m2.mid = tl.mid_2 
                        LEFT JOIN talentdetail td on td.tdid = tl.tdid 
                        LEFT JOIN talent t ON t.tid = td.tid
                    ${where} 
                    GROUP BY t.tid, t.cid, t.talent_name, t.year_deal, t.talent_lavel, tl.yearpay_status
                    limit ${pageSize} offset ${current * pageSize}`
        db.query(sql, (err, r) => {
            if (err) throw err;
            res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })

    })
})

// 达人详情
router.post('/getDetail', (req, res) => {
    let params = req.body
    let sql = `SELECT	a.tid as '达人编号', a.talent_name as '达人昵称', a.year_deal as '年成交额', a.talent_lavel as '类别', 
                    a.liaison_type as '联系人类型', a.liaison_name as '联系人姓名', a.liaison_v as '联系人微信', a.liaison_phone as '联系人电话', 
                    a.mid_1 as '一级中间人编号', m1.type as '一级中间人类型', m1.name as '一级中间人昵称', a.m_point_1 as '一级中间人提成点', m1.liaison_name as '一级中间人联系姓名', m1.liaison_v as '一级中间人联系微信', m1.liaison_phone as '一级中间人联系电话', m1.pay_way as '一级中间人付款方式', m1.can_piao as '一级中间人能否开票', m1.piao_type as '一级中间人票型', m1.shui_point as '一级中间人税点', m1.pay_name as '一级中间人付款姓名', m1.pay_bank as '一级中间人付款开户行', m1.pay_account as '一级中间人付款账号', 
                    a.mid_2 as '二级中间人编号', m2.type as '二级中间人类型', m2.name as '二级中间人昵称', a.m_point_2 as '二级中间人提成点', m2.liaison_name as '二级中间人联系姓名', m2.liaison_v as '二级中间人联系微信', m2.liaison_phone as '二级中间人联系电话', m2.pay_way as '二级中间人付款方式', m2.can_piao as '二级中间人能否开票', m2.piao_type as '二级中间人票型', m2.shui_point as '二级中间人税点', m2.pay_name as '二级中间人付款姓名', m2.pay_bank as '二级中间人付款开户行', m2.pay_account as '二级中间人付款账号', 
                    a.yearpay_start as '年框生效日期', a.yearpay_cycle as '年框付款周期', a.yearpay_point as '年框返点', a.yearpay_file as '年框合同', a.yearpay_status as '年框状态'
                FROM (
                    SELECT DISTINCT t.*, c.liaison_type, c.liaison_name, c.liaison_v, c.liaison_phone, tl.mid_1, tl.m_point_1, tl.m_note_1, tl.mid_2, tl.m_point_2, tl.m_note_2, tl.yearpay_status, tl.yearpay_start, tl.yearpay_cycle, tl.yearpay_point, tl.yearpay_file
                    FROM talent t 
                        LEFT JOIN chance c ON t.cid = c.cid 
                        LEFT JOIN talentdetail td ON t.tid = td.tid 
                        LEFT JOIN talentline tl ON td.tdid = tl.tdid 
                    WHERE t.tid = '${params.tid}' and t.talent_status != '2'
                    LIMIT 1
                ) a
                    LEFT JOIN middleman m1 ON a.mid_1 = m1.mid 
                    LEFT JOIN middleman m2 ON a.mid_2 = m2.mid`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let base = [], year = [], liaison = [], middle1 = [], middle2 = [], i = 0
        for (const key in results[0]) {
            if (Object.hasOwnProperty.call(results[0], key)) {
                const element = {
                    key: i,
                    label: key.replace('联系人', '').replace('一级中间人', '').replace('二级中间人', '').replace('年框', ''),
                    children: results[0][key]
                };
                if (i >= 4 && i <= 7) {
                    liaison.push(element)
                } else if (i >= 8 && i <= 21) {
                    if (i === 14 || i === 21) {
                        element.span = 2
                    }
                    if (i === 15) {
                        element.children = element.children ? '对公' : '对私'
                    }
                    if (i === 16) {
                        element.children = element.children ? '能' : '不能'
                    }
                    if (i === 17) {

                        element.children = element.children ? '专票' : element.children === false ? '普票' : null
                    }
                    middle1.push(element)
                } else if (i >= 22 && i <= 35) {
                    if (i === 28 || i === 35) {
                        element.span = 2
                    }
                    if (i === 29) {
                        element.children = element.children ? '对公' : '对私'
                    }
                    if (i === 30) {
                        element.children = element.children ? '能' : '不能'
                    }
                    if (i === 31) {
                        element.children = element.children ? '专票' : element.children === false ? '普票' : null
                    }
                    middle2.push(element)
                } else if (i >= 36 && i <= 41) {
                    year.push(element)
                } else {
                    base.push(element)
                }
            }
            i++
        }
        let sql = `SELECT  td.tdid as '达人合作编号', td.model as '模式', td.platform_shop as '平台店铺', 
                        td.account_id as '账号ID', td.account_name as '账号名称', td.account_type as '账号类型', td.account_models as '销售模式', td.keyword as '关键字（前后缀）', td.people_count as '平时带货人数', td.fe_proportion as '女粉占比', td.age_cuts as '粉丝主购年龄段', td.main_province as '主要地区', td.price_cut as '客单价', tl.commission_normal as '常规品线上佣金', tl.commission_welfare as '福利品线上佣金', tl.commission_bao as '爆品线上佣金', tl.commission_note as '佣金备注', 
                        tl.discount_normal as '常规品折扣', tl.discount_welfare as '福利品折扣', tl.discount_bao as '爆品折扣', tl.discount_note as '社群团购折扣备注', 
                        tl.discount_buyout as '买断折扣', tl.discount_back as '含退货折扣', tl.discount_label as '供货折扣备注',
                        u1.name as '主商务', tl.u_point_1 as '主商务提成点', u2.name as '副商务', tl.u_point_2 as '副商务提成点'
                    FROM talentdetail td 
                        LEFT JOIN talentline tl ON td.tdid = tl.tdid 
                        INNER JOIN (SELECT DISTINCT MAX(date_line) as date FROM talentline GROUP BY tdid) tl2 ON tl2.date = tl.date_line
                        LEFT JOIN user u1 ON u1.uid = tl.uid_1 
                        LEFT JOIN user u2 ON u2.uid = tl.uid_2 
                    WHERE td.tid = '${params.tid}'`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let models = []
            for (let j = 0; j < results.length; j++) {
                let model = [], k = 0
                for (const key in results[j]) {
                    if (Object.hasOwnProperty.call(results[j], key)) {
                        const element = {
                            key: k,
                            label: key.replace('社群团购', '').replace('供货团购', ''),
                            children: results[j][key]
                        };
                        if (k <= 2 || k >= 24) {
                            model.push(element)
                        }
                        if (k === 2 || k === 23) {
                            element.span = 2
                        }
                        if (k === 12) {
                            element.span = 3
                        }
                        if (results[j]['模式'] === '社群团购') {
                            if ((k >= 17 && k <= 20)) {
                                model.push(element)
                            }
                        } else if (results[j]['模式'] === '供货') {
                            if ((k >= 21 && k <= 23)) {
                                model.push(element)
                            }
                        } else {
                            if (k >= 3 && k <= 16) {
                                model.push(element)
                            }
                        }
                    }
                    k++
                }
                models.push(model)
            }
            let sql = `SELECT	group_concat(tl.tlid) as tlids, u.name, tl.type, tl.note, t.talent_name, tl.date_line as date
                        FROM	talentline tl 
                            LEFT JOIN talentdetail td ON tl.tdid = td.tdid
                            LEFT JOIN talent t ON t.tid = td.tid
                            LEFT JOIN user u ON tl.uid = u.uid
                        WHERE	t.cid = '${params.cid}'
                        GROUP BY u.name, tl.type, tl.note, t.talent_name, tl.date_line
                        ORDER BY tl.date_line`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: { base, liaison, middle1, middle2, year, models, line: results }, msg: '' })
            })
        })
    })
})

// 获取提点详情
router.post('/getLinePoint', (req, res) => {
    let params = req.body
    let tlids = ''
    for (let i = 0; i < params.tlids.split(',').length; i++) {
        tlids += `'${params.tlids.split(',')[i]}',`
    }
    tlids = tlids.substring(0, tlids.length - 1)
    let sql = `SELECT IF(td.account_name IS NULL, CONCAT(td.model, '_', td.platform_shop), CONCAT(td.model, '_', td.platform_shop, '_', td.account_name)) as title, tl.commission_note, tl.discount_note, tl.discount_label, tl.u_note, tl.m_note_1, tl.m_note_2, 
                    CONCAT('常规品(', tl.commission_normal, '%)'), CONCAT('福利品(', tl.commission_welfare, '%)'), CONCAT('爆品(', tl.commission_bao, '%)'), CONCAT('常规品(', tl.discount_normal, '折)'), CONCAT('福利品(', tl.discount_welfare, '折)'), CONCAT('爆品(', tl.discount_bao, '折)'), 
                    CONCAT('买断品(', tl.discount_buyout, '折)'), CONCAT('含退货品(', tl.discount_back, '折)'), 
                    CONCAT(u1.name, '(', tl.u_point_1, '%)'), CONCAT(u2.name, '(', tl.u_point_2, '%)'), CONCAT('①', m1.name, '[', tl.m_point_1, '%]'), CONCAT('②', m2.name, '[', tl.m_point_2, '%]')
                FROM talentline tl 
                    LEFT JOIN talentdetail td ON tl.tdid = td.tdid 
                    LEFT JOIN user u1 ON tl.uid_1 = u1.uid 
                    LEFT JOIN user u2 ON tl.uid_2 = u2.uid 
                    LEFT JOIN middleman m1 ON tl.mid_1 = m1.mid 
                    LEFT JOIN middleman m2 ON tl.mid_2 = m2.mid 
                WHERE tlid in (${tlids})`
    db.query(sql, (err, results) => {
        if (err) throw err;
        for (let i = 0; i < results.length; i++) {
            const element = results[i]
            let tags = []
            for (let j = 0; j < Object.getOwnPropertyNames(results[i]).length; j++) {
                if (Object.keys(results[i])[j].match('CONCAT') && Object.values(results[i])[j] !== null) {
                    tags.push(Object.values(results[i])[j])
                }
            }
            element.tags = tags
        }
        res.send({ code: 200, data: results, msg: '' })
    })
})

// 添加/续约年框
router.post('/addTalentYear', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT DISTINCT tl.* 
                FROM talentline tl 
                    LEFT JOIN talentdetail td ON td.tdid = tl.tdid 
                    LEFT JOIN talent t ON t.tid = td.tid 
                    INNER JOIN (SELECT tdid, MAX(date_line) as date FROM talentline GROUP BY tdid) tl2 ON tl2.date = tl.date_line
                WHERE t.tid = '${params.tid}' and t.talent_status = '合作中'`
    db.query(sql, (err, results_l) => {
        if (err) throw err;
        let sql = `SELECT * FROM talentline`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let count = results.length
            let sql = 'INSERT INTO talentline values'
            for (let i = 0; i < results_l.length; i++) {
                const element = results_l[i];
                element.tlid = 'TL' + `${count + i + 1}`.padStart(5, '0')
                element.uid = params.userInfo.uid
                element.type = params.type,
                element.note = null,
                element.date_line = time
                let s = '('
                for (let j = 0; j < Object.getOwnPropertyNames(element).length; j++) {
                    if (Object.keys(element)[j] === 'yearpay_status') {
                        s += `'${dayjs(params.yearpay_start).add(1, "year") < dayjs() ? '已失效' : '待审批'}',`
                    } else if (Object.keys(element)[j] === 'yearpay_start') {
                        s += `'${params.yearpay_start}',`
                    } else if (Object.keys(element)[j] === 'yearpay_cycle') {
                        s += `'${params.yearpay_cycle}',`
                    } else if (Object.keys(element)[j] === 'yearpay_point') {
                        s += `'${params.yearpay_point}',`
                    } else if (Object.keys(element)[j] === 'yearpay_file') {
                        s += `'${params.yearpay_file}',`
                    } else {
                        s += Object.values(element)[j] !== null ? `'${Object.values(element)[j]}',` : `null,`
                    }
                }
                s = s.substring(0, s.length - 1)
                sql += (s + '),')
            }
            sql = sql.substring(0, sql.length - 1)
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: {}, msg: `` })
            })
        })
    })
})

// 年框审批
router.post('/checkYear', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT DISTINCT tl.* 
                FROM talentline tl 
                    INNER JOIN (SELECT MAX(date_line) as date FROM talentline WHERE type LIKE '%年框' and type NOT LIKE '%驳回' GROUP BY tdid) tl2 on tl2.date = tl.date_line 
                    LEFT JOIN talentdetail td on td.tdid = tl.tdid 
                LEFT JOIN talent t ON t.tid = td.tid
                WHERE t.tid = '${params.tid}' `
    db.query(sql, (err, results_l) => {
        if (err) throw err;
        let sql = `SELECT * FROM talentline`
        db.query(sql, (err, results) => {
            if (err) throw err;
            let count = results.length
            let sql = 'INSERT INTO talentline values'
            for (let i = 0; i < results_l.length; i++) {
                const element = results_l[i];
                element.tlid = 'TL' + `${count + i + 1}`.padStart(5, '0')
                element.uid = params.userInfo.uid
                element.type = params.type ? '年框审批通过' : '年框审批驳回'
                element.note = params.note
                element.date_line = time
                let s = '('
                for (let j = 0; j < Object.getOwnPropertyNames(element).length; j++) {
                    if (Object.keys(element)[j] === 'yearpay_status') {
                        s += `'${params.type ? '生效中' : '暂无'}',`
                    } else if (Object.keys(element)[j] === 'yearpay_start') {
                        s += `'${params.type ? Object.values(element)[j] : 'null'}',`
                    } else if (Object.keys(element)[j] === 'yearpay_cycle') {
                        s += `'${params.type ? Object.values(element)[j] : 'null'}',`
                    } else if (Object.keys(element)[j] === 'yearpay_point') {
                        s += `'${params.type ? Object.values(element)[j] : 'null'}',`
                    } else if (Object.keys(element)[j] === 'yearpay_file') {
                        s += `'${params.type ? Object.values(element)[j] : 'null'}',`
                    } else {
                        s += Object.values(element)[j] !== null ? `'${Object.values(element)[j]}',` : `null,`
                    }
                }
                s = s.substring(0, s.length - 1)
                sql += (s + '),')
            }
            sql = sql.substring(0, sql.length - 1)
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: {}, msg: `` })
            })
        })
    })
})

module.exports = router