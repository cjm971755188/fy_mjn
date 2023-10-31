const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 获取所有公司
router.post('/getUserCompany', (req, res) => {
    let params = req.body
    let sql = ''
    if (params.ut_id == 'UT000') {
        sql = `SELECT * FROM userCompany ORDER BY uc_id`
    } else {
        sql = `SELECT * FROM userCompany where uc_id >= '${params.uc_id}' ORDER BY uc_id`
    }
    db.query(sql, (err, results) => {
        if (err) throw err;
        data = []
        for (let i = 0; i < results.length; i++) {
            data.push({
                label: results[i].company,
                value: results[i].uc_id
            })
        }
        res.send({ code: 200, data: data, msg: '' })
    })
})

// 获取所有部门
router.post('/getUserDepartment', (req, res) => {
    let params = req.body
    let sql = ''
    if (params.ut_id == 'UT000') {
        sql = `SELECT * FROM userDepartment ORDER BY ud_id`
    } else {
        sql = `SELECT * FROM userDepartment where ud_id >= '${params.ud_id}' ORDER BY ud_id`
    }
    db.query(sql, (err, results) => {
        if (err) throw err;
        data = []
        for (let i = 0; i < results.length; i++) {
            data.push({
                label: results[i].department,
                value: results[i].ud_id
            })
        }
        res.send({ code: 200, data: data, msg: '' })
    })
})

// 获取所有职位
router.post('/getUserType', (req, res) => {
    let params = req.body
    let sql = ''
    if (params.ut_id == 'UT000') {
        sql = `SELECT * FROM userType ORDER BY ut_id`
    } else if (params.uc_id == 'UC001') {
        sql = `SELECT * FROM userType where ut_id >= '${params.ut_id}' ORDER BY ut_id`
    } else {
        sql = `SELECT * FROM userType where ut_id > '${params.ut_id}' ORDER BY ut_id`
    }
    db.query(sql, (err, results) => {
        if (err) throw err;
        data = []
        for (let i = 0; i < results.length; i++) {
            data.push({
                label: results[i].type,
                value: results[i].ut_id
            })
        }
        res.send({ code: 200, data: data, msg: '' })
    })
})

// 获取所有平台
router.post('/getPlatform', (req, res) => {
    let params = req.body
    let sql = 'SELECT * FROM platform'
    db.query(sql, (err, results) => {
        if (err) throw err;
        data = []
        for (let i = 0; i < results.length; i++) {
            data.push({
                label: results[i].platform,
                value: results[i].pid
            })
        }
        res.send({ code: 200, data: data, msg: '' })
    })
})

module.exports = router