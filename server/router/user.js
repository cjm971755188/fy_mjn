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
      res.send({ code: 201, data: {}, msg: '用户名错误' })
    } else if (params.password != results[0].password) {
      res.send({ code: 201, data: {}, msg: '密码错误' })
    } else if (results[0].status == '0') {
      res.send({ code: 201, data: {}, msg: '该用户已被禁用' })
    } else {
      res.send({ code: 200, data: results[0], msg: '登录成功' })
    }
  })
})

// 获取用户列表
router.post('/getUserList', (req, res) => {
  let params = req.body
  let current = 0
  let pageSize = 10
  if (params.pagination.current) {
    current = params.pagination.current
  }
  if (params.pagination.pageSize) {
    pageSize = params.pagination.pageSize
  }
  let filters = `where up_id > ${params.up_id} and status != 2`
  for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
    filters = filters + ` and ${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
  }
  let sql = `SELECT count(*) as sum FROM user ${filters} ORDER BY u_id`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results[0].sum < current * pageSize) {
      let sql = `SELECT u_id, name, if(status = 0, '禁用', '正常') as status, (SELECT up.position from userposition up WHERE up.up_id = user.up_id) as position FROM user ${filters} ORDER BY u_id limit ${pageSize} offset ${(current - 1) * pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results[0].sum }, msg: '获取用户列表成功' })
      })
    } else {
      let sql = `SELECT u_id, name, if(status = 0, '禁用', '正常') as status, (SELECT up.position from userposition up WHERE up.up_id = user.up_id) as position FROM user ${filters} ORDER BY u_id limit ${pageSize} offset ${current * pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results[0].sum }, msg: '获取用户列表成功' })
      })
    }
  })
})

// 添加新用户
router.post('/addUser', (req, res) => {
  let time = new Date()
  let params = req.body
  let sql = `SELECT * FROM user where name = '${params.name}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0 ) {
      if (results[0].status != '2') {
        res.send({ code: 201, data: {}, msg: `${params.name} 已存在` })
      } else {
        let sql = `UPDATE user set status = '1', create_time = '${time.toLocaleString()}' where name = '${params.name}'`
        db.query(sql, (err, results) => {
          if (err) throw err;
          res.send({ code: 200, data: {}, msg: `${params.name} 重启成功` })
        })
      }
    } else {
      let sql = `SELECT count(*) as sum FROM user `
      db.query(sql, (err, results) => {
        if (err) throw err;
        let u_id = 'MJN' + `${results[0].sum}`.padStart(3, '0')
        let sql = `INSERT INTO user values('${u_id}', '${params.name}', '${params.up_id}', '123456', '${time.toLocaleString()}', '1')`
        db.query(sql, (err, results) => {
          if (err) throw err;
          res.send({ code: 200, data: {}, msg: `${params.name} 添加成功` })
        })
      })
    }
  })
})

// 修改用户信息
router.post('/editUser', (req, res) => {
  let params = req.body
  let sql = `UPDATE user set name = '${params.name}', up_id = '${params.position}' where u_id = '${params.u_id}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: `${params.name} 修改信息成功` })
  })
})

// 修改用户状态
router.post('/editUserStatus', (req, res) => {
  let params = req.body
  let s = '0'
  if (params.checked) { s = '1' }
  let sql = `UPDATE user set status = ${s} where u_id = '${params.u_id}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: '修改用户状态成功' })
  })
})

// 删除用户信息
router.post('/deleteUser', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM talent where u_id = '${params.u_id}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0) {
      res.send({ code: 201, data: {}, msg: `${params.name} 仍有 ${results.length} 位达人，不可删除` })
    } else {
      let sql = `UPDATE user set status = '2' where u_id = '${params.u_id}'`
      db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: {}, msg: `${params.name} 删除成功` })
      })
    }
  })
})

// 获取所有职位
router.post('/getAllPosition', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM userposition where up_id > ${params.up_id} ORDER BY up_id`
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
  let current = 0
  let pageSize = 10
  if (params.pagination.pageSize) {
    pageSize = params.pagination.pageSize
  }
  if (params.pagination.current) {
    current = params.pagination.current
  }
  let sql = `SELECT count(*) as sum FROM userposition where up_id != 0 ORDER BY up_id`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results[0].sum < current * pageSize) {
      let sql = `SELECT * FROM userposition where up_id != 0 ORDER BY up_id limit ${pageSize} offset ${(current - 1) * pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results[0].sum }, msg: '获取职位列表成功' })
      })
    } else {
      let sql = `SELECT * FROM userposition where up_id != 0 ORDER BY up_id limit ${pageSize} offset ${current * pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results[0].sum }, msg: '获取职位列表成功' })
      })
    }
  })
})

module.exports = router