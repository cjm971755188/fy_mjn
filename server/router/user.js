const express = require('express');
const router = express.Router();
const db = require('../config/db')

router.post('/login', (req, res) => {
  let params = req.body
  let sql = `SELECT * FROM user where phone = '${params.phone}' ORDER BY uid`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      res.send({ code: 200, data: {}, msg: '该账号不存在！' })
    } else {
      res.send({ code: 200, data: { }, msg: ''})
    }
  })
})

module.exports = router