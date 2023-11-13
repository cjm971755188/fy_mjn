const express = require('express');
const router = express.Router();
const db = require('../config/db')
const sendRobot = require('../myFun/ddrobot')

// 登录
router.post('/login', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM user where uid = '${params.uid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length == 0) {
      res.send({ code: 201, data: {}, msg: '用户名错误' })
    } else if (params.password != results[0].password) {
      res.send({ code: 201, data: {}, msg: '密码错误' })
    } else if (results[0].status == '0') {
      res.send({ code: 201, data: {}, msg: '该用户已被禁用' })
    } else {
      /* sendRobot(`${results[0].name} 登录成功`) */
      res.send({ code: 200, data: results[0], msg: '登录成功' })
    }
  })
})

// 修改密码
router.post('/editPassword', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM user where uid = '${params.uid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length == 0) {
      res.send({ code: 201, data: {}, msg: '用户名错误' })
    } else if (params.password != results[0].password) {
      res.send({ code: 201, data: {}, msg: '密码错误' })
    } else if (params.password2 != params.password3) {
      res.send({ code: 201, data: {}, msg: '两次密码输入不一致' })
    } else if (params.password == params.password2) {
      res.send({ code: 201, data: {}, msg: '新密码与原密码相同' })
    } else {
      let sql = `UPDATE user SET password = ${params.password2} where uid = '${params.uid}'`
      db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: {}, msg: '修改成功' })
      })
    }
  })
})

// 获取用户列表
router.post('/getUserList', (req, res) => {
  let params = req.body
  // 去除 自己 + 管理员 + 已删除
  let where = `where uid != '${params.userInfo.uid}' and uid != 'MJN000' and status != 2`
  // 权限筛选
  if (params.userInfo.position != '管理员') {
    if (params.userInfo.company != '总公司') {
      where += ` and company = '${params.userInfo.company}'`
    }
    if (params.userInfo.department != '总裁办') {
      where += ` and department = '${params.userInfo.department}'`
    }
  }
  // 条件筛选
  for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
    if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
      where += ` and ${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
    } else {
      where += ` and ${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
    }
  }
  // 分页
  let current = 0
  let pageSize = 10
  if (params.pagination.current) {
    current = params.pagination.current
  }
  if (params.pagination.pageSize) {
    pageSize = params.pagination.pageSize
  }
  let sql = `SELECT	* FROM	user ${where} order by uid`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let sql = `SELECT	uid, name, company, department, position, status FROM	user ${where} order by uid limit ${pageSize} offSET ${current * pageSize}`
    db.query(sql, (err, r) => {
      if (err) throw err;
      res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: '' })
    })
  })
})

// 添加新用户
router.post('/addUser', (req, res) => {
  let time = new Date()
  let currentDate = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
  let params = req.body
  let sql = `SELECT * FROM user where company = '${params.combine[0]}' and department = '${params.combine[1]}' and position = '${params.combine[2]}' and position in ('总裁', '副总', '主管')`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0) {
      if (results[0].position == '总裁') {
        res.send({ code: 201, data: {}, msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 总裁` })
      }
      if (results[0].position == '副总') {
        res.send({ code: 201, data: {}, msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 副总` })
      }
      if (results[0].position == '主管') {
        res.send({ code: 201, data: {}, msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 主管` })
      }
    } else {
      let sql = `SELECT * FROM user where name = '${params.name}'`
      db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length != 0) {
          if (results[0].status != '2') {
            res.send({ code: 201, data: {}, msg: `${params.name} 已存在` })
          } else {
            let sql = `UPDATE user SET status = '1', create_time = '${currentDate}' where name = '${params.name}'`
            db.query(sql, (err, results) => {
              if (err) throw err;
              res.send({ code: 200, data: {}, msg: `${params.name} 重启成功` })
            })
          }
        } else {
          let sql = `SELECT count(*) as sum FROM user `
          db.query(sql, (err, results) => {
            if (err) throw err;
            let uid = 'MJN' + `${results[0].sum}`.padStart(3, '0')
            let sql = `INSERT INTO user values('${uid}', '${params.name}', '123456', '${params.combine[0]}', '${params.combine[1]}', '${params.combine[2]}', '1', '${currentDate}')`
            db.query(sql, (err, results) => {
              if (err) throw err;
              res.send({ code: 200, data: {}, msg: `${params.name} 添加成功` })
            })
          })
        }
      })
    }
  })
})

// 修改用户信息
router.post('/editUser', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM user where uid != '${params.uid}' and company = '${params.combine[0]}' and department = '${params.combine[1]}' and position = '${params.combine[2]}' and position in ('总裁', '副总', '主管')`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0) {
      if (results[0].position == '总裁') {
        res.send({ code: 201, data: {}, msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 总裁` })
      }
      if (results[0].position == '副总') {
        res.send({ code: 201, data: {}, msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 副总` })
      }
      if (results[0].position == '主管') {
        res.send({ code: 201, data: {}, msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 主管` })
      }
    } else {
      let sql = `UPDATE user SET name = '${params.name}', company = '${params.combine[0]}', department = '${params.combine[1]}', position = '${params.combine[2]}' WHERE uid = '${params.uid}'`
      db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: {}, msg: `修改成功` })
      })
    }
  })
})

// 修改用户状态
router.post('/editUserStatus', (req, res) => {
  let params = req.body
  let s = '0'
  if (params.checked) { s = '1' }
  let msg = '已禁用'
  if (params.checked) { msg = '已重启' }
  let sql = `UPDATE user SET status = ${s} where uid = '${params.uid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: `${params.uid} ${msg}` })
  })
})

// 删除用户信息
router.post('/deleteUser', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM talent where uid_1 = '${params.uid}' or uid_2 = '${params.uid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0) {
      res.send({ code: 201, data: {}, msg: `${params.name} 仍有 ${results.length} 位达人，不可删除` })
    } else {
      let sql = `UPDATE user SET status = '2' where uid = '${params.uid}'`
      db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: {}, msg: `删除成功` })
      })
    }
  })
})

// 获取所有商务
router.post('/getSalemans', (req, res) => {
  let params = req.body
  // 去除 自己 + 管理员 + 已删除
  let where = `where status != 2`
  // 权限筛选
  if (params.userInfo.position != '管理员') {
    if (params.userInfo.company != '总公司') {
      where += ` and company = '${params.userInfo.company}'`
    }
    if (params.userInfo.department != '总裁办') {
      where += ` and department = '${params.userInfo.department}'`
    }
  }
  let sql = `SELECT * FROM user ${where}`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let salemans = []
    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      salemans.push({
        label: element.name,
        value: element.uid
      })
    }
    res.send({ code: 200, data: salemans, msg: `` })
  })
})

module.exports = router