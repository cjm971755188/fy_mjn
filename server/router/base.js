const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../config/db')
const BASE_URL = require('../config/config')

// 系统设定：公司
router.post('/getCompanys', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_company WHERE status != '失效' 
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

router.post('/getCompanysItems', (req, res) => {
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

// 系统设定：平台
router.post('/getPlatforms', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_platform WHERE status != '失效' ${params.filters ? params.filters.name ? `and name LIKE '%${params.filters.name}%'` : '' : ''}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

router.post('/addPlatform', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_platform WHERE name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            if (results[0].status === '正常') {
                res.send({ code: 201, data: [], msg: `平台名字重复` })
            } else {
                let sql = `UPDATE base_platform SET status = '正常' WHERE name = '${params.name}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `添加成功` })
                })
            }
        } else {
            let sql = `INSERT INTO base_platform(name, status) VALUES('${params.name}', '正常')`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `添加成功` })
            })
        }
    })
})

router.post('/editPlatform', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_platform WHERE name = '${params.name}' and id != '${params.id}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `平台名字重复` })
        } else {
            let sql = `UPDATE base_platform SET name = '${params.name}' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

router.post('/deletePlatform', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_store WHERE platform = '${params.name}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `还有店铺绑定该平台，无法删除` })
        } else {
            let sql = `UPDATE base_platform SET status = '失效' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `删除成功` })
            })
        }
    })
})

router.post('/getPlatformsItems', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_platform WHERE status != '失效'`
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
    let sql = `SELECT * FROM base_store WHERE status != '失效' 
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

router.post('/deleteStore', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_store SET status = '失效' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `删除成功` })
    })
})

// 系统设定：直播间
router.post('/getLiverooms', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_liveroom WHERE status != '失效' ${params.filters ? params.filters.name ? `and name LIKE '%${params.filters.name}%'` : '' : ''}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

router.post('/addLiveroom', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_liveroom WHERE name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            if (results[0].status === '正常') {
                res.send({ code: 201, data: [], msg: `直播间名字重复` })
            } else {
                let sql = `UPDATE base_liveroom SET status = '正常' WHERE name = '${params.name}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `添加成功` })
                })
            }
        } else {
            let sql = `INSERT INTO base_liveroom(name, status) VALUES('${params.name}', '正常')`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `添加成功` })
            })
        }
    })
})

router.post('/editLiveroom', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_liveroom WHERE name = '${params.name}' and id != '${params.id}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `直播间名字重复` })
        } else {
            let sql = `UPDATE base_liveroom SET name = '${params.name}' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

router.post('/deleteLiveroom', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_liveroom SET status = '失效' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `删除成功` })
    })
})

router.post('/getLiveroomsItems', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_liveroom WHERE status != '失效'`
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

// 系统设定：联系人类型
router.post('/getLiaisons', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_liaison WHERE status != '失效' ${params.filters ? params.filters.name ? `and name LIKE '%${params.filters.name}%'` : '' : ''}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

router.post('/addLiaison', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_liaison WHERE name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            if (results[0].status === '正常') {
                res.send({ code: 201, data: [], msg: `联系人类型名字重复` })
            } else {
                let sql = `UPDATE base_liaison SET status = '正常' WHERE name = '${params.name}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `添加成功` })
                })
            }
        } else {
            let sql = `INSERT INTO base_liaison(name, status) VALUES('${params.name}', '正常')`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `添加成功` })
            })
        }
    })
})

router.post('/editLiaison', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_liaison WHERE name = '${params.name}' and id != '${params.id}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `联系人类型名字重复` })
        } else {
            let sql = `UPDATE base_liaison SET name = '${params.name}' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

router.post('/deleteLiaison', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_liaison SET status = '失效' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `删除成功` })
    })
})

router.post('/getLiaisonsItems', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_liaison WHERE status != '失效'`
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

// 系统设定：达人账号类型
router.post('/getAccounts', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_account WHERE status != '失效' ${params.filters ? params.filters.name ? `and name LIKE '%${params.filters.name}%'` : '' : ''}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: results, pagination: { ...params.pagination, total: results.length }, msg: `` })
    })
})

router.post('/addAccount', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_account WHERE name = '${params.name}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            if (results[0].status === '正常') {
                res.send({ code: 201, data: [], msg: `达人账号类型名字重复` })
            } else {
                let sql = `UPDATE base_account SET status = '正常' WHERE name = '${params.name}'`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `添加成功` })
                })
            }
        } else {
            let sql = `INSERT INTO base_account(name, status) VALUES('${params.name}', '正常')`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `添加成功` })
            })
        }
    })
})

router.post('/editAccount', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_account WHERE name = '${params.name}' and id != '${params.id}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `达人账号类型名字重复` })
        } else {
            let sql = `UPDATE base_account SET name = '${params.name}' WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

router.post('/deleteAccount', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_account SET status = '失效' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `删除成功` })
    })
})

router.post('/getAccountsItems', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_account WHERE status != '失效'`
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

module.exports = router
