const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 登录
router.post('/login', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM user where u_id = '${params.username}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length == 0) {
      res.send({ code: 200, data: {}, msg: '用户名错误' })
    } else {
      if (params.password != results[0].password) {
        res.send({ code: 200, data: {}, msg: '密码错误' })
      } else {
        res.send({ code: 200, data: results[0], msg: '登录成功' })
      }
    }
  })
})


// 获取用户列表
router.post('/getUserList', (req, res) => {
  let params = req.body
  let filters = `where u_id != 'MJN000'`
  for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
    filters = filters + ` and ${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
  }
  let sql = `SELECT count(*) as sum FROM user ${filters} ORDER BY u_id`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results[0].sum < params.pagination.current*params.pagination.pageSize) {
      let sql = `SELECT u_id, name, (SELECT up.position from userposition up WHERE up.up_id = user.up_id) as position FROM user ${filters} ORDER BY u_id limit ${params.pagination.pageSize} offset ${(params.pagination.current-1)*params.pagination.pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: {...params.pagination, total: results[0].sum}, msg: '获取用户列表成功' })
      })
    } else {
      let sql = `SELECT u_id, name, (SELECT up.position from userposition up WHERE up.up_id = user.up_id) as position FROM user ${filters} ORDER BY u_id limit ${params.pagination.pageSize} offset ${params.pagination.current*params.pagination.pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: {...params.pagination, total: results[0].sum}, msg: '获取用户列表成功' })
      })
    }
  })
})

// 获取所有
router.post('/getAllPosition', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM userposition where up_id != 0 ORDER BY up_id`
  db.query(sql, (err, results) => {
    if (err) throw err;
    data = []
    for (let i = 0; i < results.length; i++) {
      data.push({
        label: results[i].position,
        value: results[i].up_id
      })
    }
    res.send({ code: 200, data: data, msg: '获取所有职位成功' })
  })
})

// 获取职位列表
router.post('/getPositionList', (req, res) => {
  let params = req.body
  let sql = `SELECT count(*) as sum FROM userposition where up_id != 0 ORDER BY up_id`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results[0].sum < params.pagination.current*params.pagination.pageSize) {
      let sql = `SELECT * FROM userposition where up_id != 0 ORDER BY up_id limit ${params.pagination.pageSize} offset ${(params.pagination.current-1)*params.pagination.pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: {...params.pagination, total: results[0].sum}, msg: '获取职位列表成功' })
      })
    } else {
      let sql = `SELECT * FROM userposition where up_id != 0 ORDER BY up_id limit ${params.pagination.pageSize} offset ${params.pagination.current*params.pagination.pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: {...params.pagination, total: results[0].sum}, msg: '获取职位列表成功' })
      })
    }
  })
})

module.exports = router