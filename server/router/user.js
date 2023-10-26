const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 登录
router.post('/login', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM user where uid = '${params.username}'`
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
  // 条件筛选
  let where = `where uid != '${params.ids.uid}' and uid != 'MJN000' and status != 2` // 去除 自己 + 管理员 + 已删除 
  for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
    console.log(Object.keys(params.filters)[i].split('_'));
    if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
      where += ` and user.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
    } else {
      where += ` and user.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
    }
  }
  // 权限筛选
  if (params.ids.ut_id != '0') {
    if (params.ids.uc_id != '1') {
      where += ` and user.uc_id = '${params.ids.uc_id}'`
    }
    if (params.ids.ud_id != '1') {
      where += ` and user.ud_id = '${params.ids.ud_id}'`
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
  let sql = `SELECT	uid, name, uc.uc_id, uc.company, ud.ud_id, ud.department, ut.ut_id, ut.type, status
              FROM	user
                LEFT JOIN usercompany uc on uc.uc_id = user.uc_id
                LEFT JOIN userdepartment ud on ud.ud_id = user.ud_id
                LEFT JOIN usertype ut on ut.ut_id = user.ut_id
              ${where}
              order by uid`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let sql = `SELECT	uid, name, uc.uc_id, uc.company, ud.ud_id, ud.department, ut.ut_id, ut.type, status
              FROM	user
                LEFT JOIN usercompany uc on uc.uc_id = user.uc_id
                LEFT JOIN userdepartment ud on ud.ud_id = user.ud_id
                LEFT JOIN usertype ut on ut.ut_id = user.ut_id
              ${where}
              order by uid
              limit ${pageSize} 
              offset ${current * pageSize}`
    db.query(sql, (err, r) => {
      if (err) throw err;
      res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: '' })
    })
  })
})

// 添加新用户
router.post('/addUser', (req, res) => {
  let time = new Date()
  let params = req.body
  if (params.ut_id == '1' && params.ud_id != '1') {
    res.send({ code: 201, data: {}, msg: `总裁 职位仅可添加在 总经办 部门` })
  } else if (params.ut_id == '2' && params.ud_id == '1') {
    res.send({ code: 201, data: {}, msg: `主管 职位不可添加在 总经办 部门` })
  } else if (params.ut_id == '3' && params.ud_id == '2' && params.uc_id == '1') {
    res.send({ code: 201, data: {}, msg: `事业部 普通员工 不可添加在 总公司 ，请选择 公司（办公地点）` })
  } else {
    let sql = `SELECT * FROM user where uc_id = '${params.uc_id}' and ud_id = '${params.ud_id}' and ut_id = '${params.ut_id}' and ut_id <= '2'`
    db.query(sql, (err, results) => {
      if (err) throw err;
      if (results.length != 0) {
        if (results[0].ut_id == '1') {
          res.send({ code: 201, data: {}, msg: `该公司已存在 ${results.length} 名 总裁` })
        }
        if (results[0].ut_id == '2') {
          res.send({ code: 201, data: {}, msg: `该部门已存在 ${results.length} 名 主管` })
        }
      } else {
        let sql = `SELECT * FROM user where name = '${params.name}'`
        db.query(sql, (err, results) => {
          if (err) throw err;
          if (results.length != 0) {
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
              let uid = 'MJN' + `${results[0].sum}`.padStart(3, '0')
              let sql = `INSERT INTO user values('${uid}', '${params.name}', '${params.uc_id}', '${params.ud_id}', '${params.ut_id}','123456', '${time.toLocaleString()}', '1')`
              db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: {}, msg: `${params.name} 添加成功` })
              })
            })
          }
        })
      }
    })
  }
})

// 修改用户信息
router.post('/editUser', (req, res) => {
  let params = req.body
  if (params.type == '1' && params.department != '1') {
    res.send({ code: 201, data: {}, msg: `总裁 职位仅可添加在 总经办 部门` })
  } else if (params.type == '2' && params.department == '1') {
    res.send({ code: 201, data: {}, msg: `主管 职位不可添加在 总经办 部门` })
  } else if (params.type == '3' && params.department == '2' && params.company == '1') {
    res.send({ code: 201, data: {}, msg: `事业部 普通员工 不可添加在 总公司 ，请选择 公司（办公地点）` })
  } else {
    let sql = `SELECT * FROM user LEFT JOIN usercompany uc on uc.uc_id = user.uc_id LEFT JOIN userdepartment ud on ud.ud_id = user.ud_id LEFT JOIN usertype ut on ut.ut_id = user.ut_id
                where (user.uc_id = '${params.company}' or uc.company = '${params.company}') 
                  and (user.ud_id = '${params.department}' or ud.department = '${params.department}') 
                  and (user.ut_id = '${params.type}' or ut.type = '${params.type}') 
                  and user.ut_id <= '2'`
    db.query(sql, (err, results) => {
      if (err) throw err;
      if (results.length != 0) {
        if (results[0].ut_id == '1') {
          res.send({ code: 201, data: {}, msg: `该公司已存在 ${results.length} 名 总裁` })
        }
        if (results[0].ut_id == '2') {
          res.send({ code: 201, data: {}, msg: `该部门已存在 ${results.length} 名 主管` })
        }
      } else {
        let sql = `UPDATE user, usercompany uc, userdepartment ud, usertype ut
                    set name = '${params.name}', user.uc_id = uc.uc_id, user.ud_id = ud.ud_id, user.ut_id = ut.ut_id
                    where (uc.uc_id = '${params.company}' or uc.company = '${params.company}') 
                      and (ud.ud_id = '${params.department}' or ud.department = '${params.department}') 
                      and (ut.ut_id = '${params.type}' or ut.type = '${params.type}') 
                      and uid = '${params.uid}'`
        db.query(sql, (err, results) => {
          if (err) throw err;
          res.send({ code: 200, data: {}, msg: `修改成功` })
        })
      }
    })
  }
})

// 修改用户状态
router.post('/editUserStatus', (req, res) => {
  let params = req.body
  let s = '0'
  if (params.checked) { s = '1' }
  let sql = `UPDATE user set status = ${s} where uid = '${params.uid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: '修改成功' })
  })
})

// 删除用户信息
router.post('/deleteUser', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM talent where uid = '${params.uid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0) {
      res.send({ code: 201, data: {}, msg: `${params.name} 仍有 ${results.length} 位达人，不可删除` })
    } else {
      let sql = `UPDATE user set status = '2' where uid = '${params.uid}'`
      db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: {}, msg: `删除成功` })
      })
    }
  })
})

// 获取所有公司
router.post('/getAllCompany', (req, res) => {
  let params = req.body
  let sql = ''
  if (params.ut_id == '0') {
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
router.post('/getAllDepartment', (req, res) => {
  let params = req.body
  let sql = ''
  if (params.ut_id == '0') {
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
router.post('/getAllType', (req, res) => {
  let params = req.body
  let sql = ''
  if (params.ut_id == '0') {
    sql = `SELECT * FROM usertype ORDER BY ut_id`
  } else if (params.uc_id == '1') {
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

// 获取职位列表
router.post('/getTypeList', (req, res) => {
  let params = req.body
  let current = 0
  let pageSize = 10
  if (params.pagination.pageSize) {
    pageSize = params.pagination.pageSize
  }
  if (params.pagination.current) {
    current = params.pagination.current
  }
  let sql = `SELECT count(*) as sum FROM usertype where ut_id != 0 ORDER BY ut_id`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results[0].sum < current * pageSize) {
      let sql = `SELECT * FROM usertype where ut_id != 0 ORDER BY ut_id limit ${pageSize} offset ${(current - 1) * pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results[0].sum }, msg: '' })
      })
    } else {
      let sql = `SELECT * FROM usertype where ut_id != 0 ORDER BY ut_id limit ${pageSize} offset ${current * pageSize}`
      db.query(sql, (err, r) => {
        if (err) throw err;
        res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results[0].sum }, msg: '' })
      })
    }
  })
})

module.exports = router