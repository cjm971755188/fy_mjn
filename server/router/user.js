const express = require('express');
const router = express.Router();
const db = require('../config/db')

router.post('/login', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM user where u_id = '${params.username}' and password = '${params.password}' ORDER BY u_id`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      res.send({ code: 200, data: {}, msg: '该用户不存在' })
    } else {
      res.send({ code: 200, data: results[0], msg: '登录成功'})
    }
  })
})

module.exports = router