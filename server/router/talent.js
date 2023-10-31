const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 获取达人列表
router.post('/getTalentList', (req, res) => {
  let params = req.body
  // 条件筛选
  let where = `where t.ts_id != 0`
  for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
    if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
      where += ` and u.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
    } else {
      where += ` and u.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
    }
  }
  // 权限筛选
  if (params.ids.ut_id == 'UT003') {
    where += ` and uid = '${params.ids.uid}'`
  } else if (params.ids.uc_id != 'UC001') {
    where += ` and u.uc_id = '${params.ids.uc_id}'`
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
  let sql = `SELECT tid, pic, t.name, liaison_type, liaison_name, liaison_vx, search_pic, advance_pic, group_name, t.ts_id, ts.status FROM talent t LEFT JOIN user u on u.uid = t.uid LEFT JOIN talentStatus ts on t.ts_id = ts.ts_id ${where} order by tid`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let sql = `SELECT tid, pic, t.name, liaison_type, liaison_name, liaison_vx, search_pic, advance_pic, group_name, t.ts_id, ts.status FROM talent t LEFT JOIN user u on u.uid = t.uid LEFT JOIN talentStatus ts on t.ts_id = ts.ts_id 
              ${where} 
              order by tid
              limit ${pageSize} 
              offset ${current * pageSize}`
    db.query(sql, (err, r) => {
      if (err) throw err;
      res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: '' })
    })
  })
})

// 查询重复达人
router.post('/searchSameTalent', (req, res) => {
  let params = req.body
  let sql = `SELECT t.name, t.pic, u.name as u_name, GROUP_CONCAT(p.platform) as platform FROM talent t LEFT JOIN user u on u.uid = t.uid LEFT JOIN talentdetail td on td.tid = t.tid LEFT JOIN platform p on p.pid = td.pid WHERE t.name LIKE '%${params.name}%' GROUP BY t.name, t.pic, u.name`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0) {
      res.send({ code: 201, data: results, msg: `与该达人相似昵称已存在 ${results.length} 个` })
    } else {
      res.send({ code: 200, data: {}, msg: `这是一位新达人` })
    }
  })
})

// 添加新达人
router.post('/addTalent', (req, res) => {
  let time = new Date()
  let params = req.body
  let sql = `SELECT * FROM talent where name = '${params.name}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0) {
      res.send({ code: 201, data: {}, msg: `达人昵称 ${params.name} 重复` })
    } else {
      let sql = `SELECT count(*) as sum FROM talent`
      db.query(sql, (err, results) => {
        if (err) throw err;
        let tid = 'T' + `${results[0].sum + 1}`.padStart(6, '0')
        let pids = ''
        for (let i = 0; i < params.pids.length; i++) {
          pids += params.pids[i] + ','
        }
        pids = pids.substring(0, pids.length - 1)
        let pic = params.pic.replace('/public', '')
        let searchPic = params.searchPic.replace('/public', '')
        let sql = `INSERT INTO talent(tid, pids, pic, search_pic, name, uid, ts_id, create_time) VALUES('${tid}', '${pids}', '${pic}', '${searchPic}', '${params.name}', '${params.uid}', '1', '${time.toLocaleString()}')`
        db.query(sql, (err, results) => {
          if (err) throw err;
          res.send({ code: 200, data: {}, msg: `${params.name} 添加成功` })
        })
      })
    }
  })
})

module.exports = router