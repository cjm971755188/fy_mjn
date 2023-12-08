const express = require('express');
const router = express.Router();
const db = require('../config/db')
const dayjs = require('dayjs');
const jst = require('../api/jst')

// 获取年框文件列表
router.post('/getYearList', (req, res) => {
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
    let whereFilter = `where a.status != '已失效' and a.url LIKE '%年框%'`
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            whereFilter += ` and a.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            whereFilter += ` and a.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT *
                FROM (
                    SELECT r.rid, r.url, SUBSTRING_INDEX(r.url, '_', -1) as filename, t.name, r.status, r.create_time
                    FROM resource r 
                        INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = r.u_id
                        LEFT JOIN talent t ON t.tid = SUBSTRING_INDEX(SUBSTRING_INDEX(r.url, '_', 3), '_', -1)
                ) a
                ${whereFilter}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let s = sql + ` LIMIT ${pageSize} OFFSET ${current * pageSize}`
        db.query(s, (err, rr) => {
            if (err) throw err;
            let r = []
            for (let i = 0; i < rr.length; i++) {
                r.push({
                    ...rr[i],
                    tid: rr[i].url.split('_')[2]
                })
            }
            res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: `` })
        })
    })
})

// 删除年框文件
router.post('/deleteResource', (req, res) => {
    let params = req.body
    let sql = `UPDATE resource SET status = '已失效' where rid = '${params.rid}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: {}, msg: `${params.rid} '已失效'` })
    })
})

// 获取商品列表
router.post('/getProductList', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    // 条件筛选
    let whereFilter = `where status = '生效'`
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            whereFilter += ` and ${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            whereFilter += ` and ${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    jst.CallJSTAPI("open/inventory/query", {
        page_index: current,
        page_size: pageSize,
        names: '羊绒袜(盒装)'
    })
    let sql = `SELECT * FROM product ${whereFilter}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results.slice(current * pageSize, (current + 1) * pageSize), pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

module.exports = router