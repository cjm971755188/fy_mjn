const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../config/db')
const BASE_URL = require('../config/config')

// 系统设定：基础设定
router.post('/getBaseSets', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_set WHERE type = '${params.type}'
                ${params.filters ? params.filters.name ? `and name LIKE '%${params.filters.name}%'` : '' : ''}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

router.post('/addBaseSet', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_set WHERE name = '${params.name}' and type = '${params.type}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            if (results[0].status === '正常') {
                res.send({ code: 201, data: [], msg: `项目名字重复` })
            } else {
                let sql = `UPDATE base_set SET status = '正常' WHERE name = '${params.name}' and type = '${params.type}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `添加成功` })
                })
            }
        } else {
            let sql = `INSERT INTO base_set(type, name, status) VALUES('${params.type}', '${params.name}', '正常')`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `添加成功` })
            })
        }
    })
})

router.post('/editBaseSet', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_set WHERE name = '${params.name}' and id != '${params.id}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `项目名字重复` })
        } else {
            let sql = `UPDATE base_set SET name = '${params.name}' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

router.post('/deleteBaseSet', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_store WHERE ${params.type} = '${params.name}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `还有店铺绑定，无法删除` })
        } else {
            let sql = `UPDATE base_set SET status = '失效' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `禁用成功` })
            })
        }
    })
})

router.post('/recoverBaseSet', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_set SET status = '正常' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `恢复成功` })
    })
})

router.post('/getBaseSetItems', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_set WHERE status != '失效' and type = '${params.type}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let r = []
        for (let i = 0; i < results.length; i++) {
            r.push({
                label: results[i].name,
                value: results[i].name,
                status: results[i].status
            })
        }
        res.send({ code: 200, data: r, msg: `` })
    })
})

// 系统设定：公司
router.post('/getCompanys', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_company 
                ${params.filters ? params.filters.name ? `and name LIKE '%${params.filters.name}%'` : '' : ''}
                ${params.filters ? params.filters.type ? `and type LIKE '%${params.filters.type}%'` : '' : ''}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

router.post('/addCompany', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_company WHERE name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            if (results[0].status === '正常') {
                res.send({ code: 201, data: [], msg: `公司名字重复` })
            } else {
                let sql = `UPDATE base_company SET status = '正常' WHERE name = '${params.name}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `添加成功` })
                })
            }
        } else {
            let sql = `INSERT INTO base_company(name, type, status) VALUES('${params.name}', '${params.type}', '正常')`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `添加成功` })
            })
        }
    })
})

router.post('/editCompany', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_company WHERE name = '${params.name}' and id != '${params.id}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `公司名字重复` })
        } else {
            let sql = `UPDATE base_company SET name = '${params.name}', type = '${params.type}' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

router.post('/deleteCompany', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_store WHERE company = '${params.name}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `还有店铺绑定该公司，无法删除` })
        } else {
            let sql = `UPDATE base_company SET status = '失效' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `删除成功` })
            })
        }
    })
})

router.post('/recoverCompany', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_company SET status = '正常' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `恢复成功` })
    })
})

router.post('/getCompanyItems', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_company WHERE status != '失效'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let r = []
        for (let i = 0; i < results.length; i++) {
            r.push({
                label: results[i].name,
                value: results[i].name,
                status: results[i].status
            })
        }
        res.send({ code: 200, data: r, msg: `` })
    })
})

// 系统设定：店铺
router.post('/getStores', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_store 
                ${params.filters ? params.filters.platform ? `and platform LIKE '%${params.filters.platform}%'` : '' : ''}
                ${params.filters ? params.filters.name ? `and name LIKE '%${params.filters.name}%'` : '' : ''}
                ${params.filters ? params.filters.company ? `and company LIKE '%${params.filters.company}%'` : '' : ''}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

router.post('/addStore', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_store WHERE platform = '${params.platform}' and name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            if (results[0].status === '正常') {
                res.send({ code: 201, data: [], msg: `店铺名字重复` })
            } else {
                let sql = `UPDATE base_store SET status = '正常' WHERE platform = '${params.platform}' and name = '${params.name}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `添加成功` })
                })
            }
        } else {
            let sql = `INSERT INTO base_store(platform, name, company, status) VALUES('${params.platform}', '${params.name}', '${params.company}', '正常')`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `添加成功` })
            })
        }
    })
})

router.post('/editStore', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_store WHERE platform = '${params.platform}' and name = '${params.name}' and id != '${params.id}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `店铺名字重复` })
        } else {
            let sql = `UPDATE base_store SET platform = '${params.platform}', name = '${params.name}', company = '${params.company}' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

router.post('/recoverStore', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_store SET status = '正常' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `恢复成功` })
    })
})

router.post('/deleteStore', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_store SET status = '失效' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `删除成功` })
    })
})

module.exports = router