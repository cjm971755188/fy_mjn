const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 达人详情
router.post('/getDetail', (req, res) => {
    let params = req.body
    let ids = []
    let c = []
    let sql = `SELECT t.tid as '线上达人编号', t.cid as '商机编号', t.talent_name as '达人昵称', m1.name as '一级中间人', t.m_point_1 as '一级中间人提成点', m2.name as '二级中间人', t.m_point_2 as '二级中间人提成点', t.platform as '线上平台', t.account_id as '账号ID', t.account_name as '账号名称', t.account_type as '账号类型', t.account_models as '合作模式', t.keyword as '关键字（前后缀）', t.people_count as '平时带货人数', t.fe_proportion as '女粉占比', t.age_cuts as '粉丝消费年龄段', t.main_province as '主要城市', t.price_cut as '客单价', t.commission as '常规品线上佣金比例', u1.name as '主商务', t.u_point_1 as '主商务提成点', u2.name as '副商务', t.u_point_2 as '副商务提成点' FROM talenton t LEFT JOIN user u1 ON u1.uid = t.uid_1 LEFT JOIN user u2 ON u2.uid = t.uid_2 LEFT JOIN middleman m1 ON m1.mid = t.mid_1 LEFT JOIN middleman m2 ON m2.mid = t.mid_2 WHERE t.cid = '${params.cid}' and t.status != '报备驳回'`
    db.query(sql, (err, results) => {
        if (results.length > 0) {
            c = []
        } else {
            ids.push({
                key: 0,
                label: '线上达人编号',
                children: ''
            })
        }
        if (err) throw err;
        let d1 = []
        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            let d = []
            let j = 0
            for (const key in element) {
                if (Object.hasOwnProperty.call(element, key)) {
                    const item = {
                        key: j,
                        label: key,
                        children: element[key] ? element[key] : ''
                    }
                    if (j === 0) {
                        ids.push(item)
                    } else if (j < 7) {
                        c.push(item)
                    } else {
                        d.push(item)
                    }
                    j++
                }
            }
            d1.push(d)
        }
        let sql = `SELECT t.tid as '社群团购达人编号', t.cid as '商机编号', t.talent_name as '达人昵称', m1.name as '一级中间人', t.m_point_1 as '一级中间人提成点', m2.name as '二级中间人', t.m_point_2 as '二级中间人提成点', t.group_name as '达人名称', t.discount_normal as '常规品折扣', t.discount_welfare as '福利品折扣', t.discount_bao as '爆品折扣', t.discount_note as '其他备注', u1.name as '主商务', t.u_point_1 as '主商务提成点', u2.name as '副商务', t.u_point_2 as '副商务提成点' FROM talentgroup t LEFT JOIN user u1 ON u1.uid = t.uid_1 LEFT JOIN user u2 ON u2.uid = t.uid_2 LEFT JOIN middleman m1 ON m1.mid = t.mid_1 LEFT JOIN middleman m2 ON m2.mid = t.mid_2 WHERE t.cid = '${params.cid}' and t.status != '报备驳回'`
        db.query(sql, (err, results) => {
            if (results.length > 0) {
                c = []
            } else {
                ids.push({
                    key: 1,
                    label: '社群团购达人编号',
                    children: ''
                })
            }
            if (err) throw err;
            let d2 = []
            let j = 0
            for (const key in results[0]) {
                if (Object.hasOwnProperty.call(results[0], key)) {
                    const item = {
                        key: j,
                        label: key,
                        children: results[0][key] ? results[0][key] : ''
                    }
                    if (j === 0) {
                        ids.push(item)
                    } else if (j < 7) {
                        c.push(item)
                    } else {
                        d2.push(item)
                    }
                    j++
                }
            }
            let sql = `SELECT t.tid as '供货达人编号', t.cid as '商机编号', t.talent_name as '达人昵称', m1.name as '一级中间人', t.m_point_1 as '一级中间人提成点', m2.name as '二级中间人', t.m_point_2 as '二级中间人提成点', t.provide_name as '达人名称', t.discount_buyout as '买断折扣', t.discount_back as '含退货折扣', t.discount_label as '其他备注', u1.name as '主商务', t.u_point_1 as '主商务提成点', u2.name as '副商务', t.u_point_2 as '副商务提成点' FROM talentprovide t LEFT JOIN user u1 ON u1.uid = t.uid_1 LEFT JOIN user u2 ON u2.uid = t.uid_2 LEFT JOIN middleman m1 ON m1.mid = t.mid_1 LEFT JOIN middleman m2 ON m2.mid = t.mid_2 WHERE t.cid = '${params.cid}' and t.status != '报备驳回'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                if (results.length > 0) {
                    c = []
                } else {
                    ids.push({
                        key: 2,
                        label: '供货达人编号',
                        children: ''
                    })
                }
                let d3 = []
                let j = 0
                for (const key in results[0]) {
                    if (Object.hasOwnProperty.call(results[0], key)) {
                        const item = {
                            key: j,
                            label: key,
                            children: results[0][key] ? results[0][key] : ''
                        }
                        if (j === 0) {
                            ids.push(item)
                        } else if (j < 7) {
                            c.push(item)
                        } else {
                            d3.push(item)
                        }
                        j++
                    }
                }
                let title = []
                let count = 0
                for (let i = 0; i < ids.length; i++) {
                    title.push({
                        ...ids[i],
                        key: count
                    });
                    count++
                }
                for (let j = 0; j < c.length; j++) {
                    title.push({
                        ...c[j],
                        key: count
                    });
                    count++
                }
                res.send({ code: 200, data: { comment: title, online: d1, group: d2, provide: d3 }, msg: '' })
            })
        })
    })
})

// 获取达人列表
router.post('/login', (req, res) => {
    let params = req.body
    /* let sql = `SELECT * FROM user where phone = '${params.phone}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results[0], msg: '登录成功' })
    }) */
})

module.exports = router