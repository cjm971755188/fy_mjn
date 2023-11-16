const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 达人详情
router.post('/getDetail', (req, res) => {
    let params = req.body
    let sql = `SELECT t.tid as '达人编号', t.talent_name as '达人昵称', t.year_deal as '年成交额', t.talent_lavel as '类别', 
                c.liaison_type as '联系人类型', c.liaison_name as '联系人姓名', c.liaison_v as '联系人微信', c.liaison_phone as '联系人电话', 
                t.mid_1 as '一级中间人编号', m1.type as '一级中间人类型', m1.name as '一级中间人昵称', t.m_point_1 as '一级中间人提成点', m1.liaison_name as '一级中间人联系姓名', m1.liaison_v as '一级中间人联系微信', m1.liaison_phone as '一级中间人联系电话', m1.pay_way as '一级中间人付款方式', m1.can_piao as '一级中间人能否开票', m1.piao_type as '一级中间人票型', m1.shui_point as '一级中间人税点', m1.pay_name as '一级中间人付款姓名', m1.pay_bank as '一级中间人付款开户行', m1.pay_account as '一级中间人付款账号', 
                t.mid_2 as '二级中间人编号', m2.type as '二级中间人类型', m2.name as '二级中间人昵称', t.m_point_2 as '二级中间人提成点', m2.liaison_name as '二级中间人联系姓名', m2.liaison_v as '二级中间人联系微信', m2.liaison_phone as '二级中间人联系电话', m2.pay_way as '二级中间人付款方式', m2.can_piao as '二级中间人能否开票', m2.piao_type as '二级中间人票型', m2.shui_point as '二级中间人税点', m2.pay_name as '二级中间人付款姓名', m2.pay_bank as '二级中间人付款开户行', m2.pay_account as '二级中间人付款账号', 
                t.yearpay_point as '年框返点', t.yearpay_day as '年框付款周期', t.yearpay_file as '年框合同' FROM talent t LEFT JOIN chance c ON c.cid = t.cid LEFT JOIN middleman m1 ON t.mid_1 = m1.mid LEFT JOIN middleman m2 ON t.mid_2 = m2.mid WHERE t.tid = '${params.tid}'`
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
                } else if (i >= 36 && i <= 40) {
                    year.push(element)
                } else {
                    base.push(element)
                }
            }
            i++
        }
        let sql = `SELECT  t.tdid as '达人合作编号', t.detail_status as '状态', t.model as '模式', t.platform as '店铺', u1.name as '主商务', t.u_point_1 as '主商务提成点', u2.name as '副商务', t.u_point_2 as '副商务提成点', 
                    t.account_id as '账号ID', t.account_name as '账号名称', t.account_type as '账号类型', t.account_models as '销售模式', t.keyword as '关键字（前后缀）', t.people_count as '平时带货人数', t.fe_proportion as '女粉占比', t.age_cuts as '粉丝主购年龄段', t.main_province as '主要地区', t.price_cut as '客单价', t.commission as '常规品线上佣金比例', 
                    t.discount_normal as '常规品折扣', t.discount_welfare as '福利品折扣', t.discount_bao as '爆品折扣', t.discount_note as '社群团购折扣备注', 
                    t.discount_buyout as '买断折扣', t.discount_back as '含退货折扣', t.discount_label as '供货折扣备注'
                    FROM talentdetail t LEFT JOIN user u1 ON u1.uid = t.uid_1 LEFT JOIN user u2 ON u2.uid = t.uid_2 WHERE t.tid = '${params.tid}'`
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
                        if (k <= 7) {
                            model.push(element)
                        }
                        if (results[j]['模式'] === '社群团购') {
                            if ((k >= 19 && k <= 22)) {
                                model.push(element)
                            }
                        } else if (results[j]['模式'] === '供货') {
                            if ((k >= 23 && k <= 25)) {
                                model.push(element)
                            }
                        } else {
                            if (k >= 8 && k <= 18) {
                                model.push(element)
                            }
                        }
                    }
                    k++
                }
                models.push(model)
            }
            res.send({ code: 200, data: { base, liaison, middle1, middle2, year, models, line: {} }, msg: '' })
        })
    })
})

module.exports = router