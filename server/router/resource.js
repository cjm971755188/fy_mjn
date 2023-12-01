const express = require('express');
const router = express.Router();
const db = require('../config/db')
const BASE_URL = require('../config/config')
const dayjs = require('dayjs');

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
        if (params.userInfo.department === '商务') {
            whereUser += ` and uid = '${params.userInfo.uid}'`
        }
    }
    // 条件筛选
    let whereFilter = `where r.status != '已失效' and r.url LIKE '%年框%'`
    for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
        if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
            whereFilter += ` and r.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
        } else {
            whereFilter += ` and r.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
        }
    }
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT r.rid, r.url, t.name, r.status, r.create_time
                FROM resource r 
                    INNER JOIN (SELECT * FROM user ${whereUser}) u ON u.uid = r.create_uid
                    LEFT JOIN talent t ON t.tid = SUBSTRING_INDEX(SUBSTRING_INDEX(r.url, '_', 3), '_', -1)
                ${whereFilter}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let r = []
        for (let i = 0; i < results.length; i++) {
            r.push({
                ...results[i],
                filename: results[i].url.split('_')[3],
                tid: results[i].url.split('_')[2]
            })
        }
        res.send({ code: 200, data: r.slice(current * pageSize, (current + 1) * pageSize), pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

module.exports = router