const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 获取达人列表
router.post('/getTalentPreparationList', (req, res) => {
  let params = req.body
  // 条件筛选
  let where = `where t.ts_id < 5 and t.ts_id != 0`
  for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
    if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
      where += ` and t.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
    } else {
      where += ` and t.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
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
  let sql = `SELECT tid, t.ta_name, t.taID, lt.lt_id, lt.type, liaison_name, liaison_vx, search_pic, advance_pic, group_name, t.ts_id, ts.status FROM talent t LEFT JOIN user u on u.uid = t.uid LEFT JOIN talentstatus ts on t.ts_id = ts.ts_id LEFT JOIN liaisontype lt on t.lt_id = lt.lt_id ${where} order by tid`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let sql = `SELECT tid, t.ta_name, t.taID, lt.lt_id, lt.type, liaison_name, liaison_vx, search_pic, advance_pic, group_name, t.ts_id, if(ts.status = '未报备', '已推进', ts.status) as status FROM talent t LEFT JOIN user u on u.uid = t.uid LEFT JOIN talentstatus ts on t.ts_id = ts.ts_id LEFT JOIN liaisontype lt on t.lt_id = lt.lt_id 
              ${where} 
              order by tid desc 
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
  let taID = ''
  if (params.taID && params.taID.length > 0) {
    for (let i = 0; i < params.taID.length; i++) {
      taID += `'${params.taID[i]}',`
    }
    taID = taID.substring(0, taID.length - 1)
  } else {
    taID = `''`
  }
  let ta_name = ''
  if (params.ta_name && params.ta_name.length > 0) {
    for (let i = 0; i < params.ta_name.length; i++) {
      ta_name += `'${params.ta_name[i]}',`
    }
    ta_name = ta_name.substring(0, ta_name.length - 1)
  } else {
    ta_name = `''`
  }
  let sql = `SELECT td.taID, td.ta_name, u.name, p.platform FROM talentline tl LEFT JOIN talentdetail td on td.tdid = tl.tdid LEFT JOIN user u on u.uid = tl.uid LEFT JOIN platform p on p.pid = td.pid WHERE tl.end_date IS NULL and (td.ta_name in (${ta_name}) or td.taID in (${taID}))`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0) {
      res.send({ code: 201, data: results, msg: `找到 ${results.length} 个相同账号名/ID` })
    } else {
      res.send({ code: 200, data: {}, msg: `这是一个新达人账号名/ID` })
    }
  })
})

// 添加新达人
router.post('/addTalent', (req, res) => {
  let time = new Date()
  let params = req.body
  let sql = `SELECT count(*) as sum FROM talent`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let tid = 'T' + `${results[0].sum + 1}`.padStart(6, '0')
    let pids = ''
    for (let i = 0; i < params.pids.length; i++) {
      pids += params.pids[i] + ','
    }
    pids = pids.substring(0, pids.length - 1)
    let taID = ''
    for (let i = 0; i < params.taID.length; i++) {
      taID += params.taID[i] + ','
    }
    taID = taID.substring(0, taID.length - 1)
    let ta_name = ''
    for (let i = 0; i < params.ta_name.length; i++) {
      ta_name += params.ta_name[i] + ','
    }
    ta_name = ta_name.substring(0, ta_name.length - 1)
    let searchPic = params.searchPic.replace('/public', '')
    let sql = `INSERT INTO talent(tid, pids, ta_name, taID, search_pic, uid, ts_id, create_time) VALUES('${tid}', '${pids}', '${ta_name}', '${taID}', '${searchPic}', '${params.uid}', '1', '${time.toLocaleString()}')`
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.send({ code: 200, data: {}, msg: `${params.ta_name} 添加成功` })
    })
  })
})

// 推进达人
router.post('/advanceTalent', (req, res) => {
  let time = new Date()
  let params = req.body
  let advance_pic = params.advance_pic.replace('/public', '')
  let sql = `UPDATE talent set lt_id = '${params.lt_id}', liaison_name = '${params.liaison_name}', liaison_vx = '${params.liaison_vx}', group_name = '${params.group_name}', advance_pic = '${advance_pic}', advance_time = '${time.toLocaleString()}', ts_id = 2 WHERE tid = '${params.tid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: `${params.tid} 推进成功` })
  })
})

module.exports = router