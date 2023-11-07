const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 获取所有公司
router.post('/getUserCompany', (req, res) => {
    let params = req.body
    let sql = ''
    if (params.ut_id == 'UT000') {
        sql = `SELECT * FROM usercompany ORDER BY uc_id`
    } else {
        sql = `SELECT * FROM usercompany where uc_id >= '${params.uc_id}' ORDER BY uc_id`
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
        sql = `SELECT * FROM userdepartment ORDER BY ud_id`
    } else {
        sql = `SELECT * FROM userdepartment where ud_id >= '${params.ud_id}' ORDER BY ud_id`
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
        sql = `SELECT * FROM usertype ORDER BY ut_id`
    } else if (params.uc_id == 'UC001') {
        sql = `SELECT * FROM usertype where ut_id >= '${params.ut_id}' ORDER BY ut_id`
    } else {
        sql = `SELECT * FROM usertype where ut_id > '${params.ut_id}' ORDER BY ut_id`
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

// 获取所有联系人类型
router.post('/getLiaisonType', (req, res) => {
    let params = req.body
    let sql = 'SELECT * FROM liaisontype'
    db.query(sql, (err, results) => {
        if (err) throw err;
        data = []
        for (let i = 0; i < results.length; i++) {
            data.push({
                label: results[i].type,
                value: results[i].lt_id
            })
        }
        res.send({ code: 200, data: data, msg: '' })
    })
})

// 获取所有达人状态
router.post('/getTalentStatus', (req, res) => {
    let params = req.body
    let sql = 'SELECT * FROM talentstatus'
    db.query(sql, (err, results) => {
        if (err) throw err;
        data = []
        for (let i = 0; i < results.length; i++) {
            data.push({
                label: results[i].status,
                value: results[i].ts_id
            })
        }
        res.send({ code: 200, data: data, msg: '' })
    })
})

module.exports = router