const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 获取达人列表
router.post('/getChanceList', (req, res) => {
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
  let sql = `SELECT tid, t.pids, t.ta_name, t.taID, lt.lt_id, lt.type, liaison_name, liaison_vx, search_pic, advance_pic, group_name, t.ts_id, ts.status, t.create_time, t.advance_time FROM talent t LEFT JOIN user u on u.uid = t.uid LEFT JOIN talentstatus ts on t.ts_id = ts.ts_id LEFT JOIN liaisontype lt on t.lt_id = lt.lt_id ${where} order by tid`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let sql = `SELECT tid, t.pids, t.ta_name, t.taID, lt.lt_id, lt.type, liaison_name, liaison_vx, search_pic, advance_pic, group_name, t.ts_id, if(ts.status = '未报备', '已推进', ts.status) as status, t.create_time, t.advance_time FROM talent t LEFT JOIN user u on u.uid = t.uid LEFT JOIN talentstatus ts on t.ts_id = ts.ts_id LEFT JOIN liaisontype lt on t.lt_id = lt.lt_id 
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
router.post('/searchSameChance', (req, res) => {
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
  let sql = `SELECT td.taID, td.ta_name, u.name, p.platform FROM talentline tl LEFT JOIN talentdetail td on td.tdid = tl.tdid LEFT JOIN talent t on t.tid = td.tid LEFT JOIN user u on u.uid = tl.uid LEFT JOIN platform p on p.pid = td.pid WHERE tl.end_date IS NULL and (td.ta_name in (${ta_name}) or td.taID in (${taID})) and t.tid != '${params.tid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let sql = `SELECT DISTINCT tid, substring_index(substring_index( ta_name, ',', topic.help_topic_id + 1 ), ',',- 1 ) as ta_name, substring_index(substring_index( taID, ',', topic2.help_topic_id + 1 ), ',',- 1 ) as taID, u.name FROM talent JOIN mysql.help_topic topic ON topic.help_topic_id < ( length( ta_name ) - length( REPLACE ( ta_name, ',', '' ) ) + 1 ) JOIN mysql.help_topic topic2 ON topic2.help_topic_id < ( length( taID ) - length( REPLACE ( taID, ',', '' ) ) + 1 ) JOIN user u ON u.uid = talent.uid HAVING (ta_name in (${ta_name}) or taID in (${taID})) and tid != '${params.tid}'`
    db.query(sql, (err, r) => {
      if (err) throw err;
      if (results.length != 0 || r.length != 0) {
        res.send({ code: 201, data: { cooperation: results, Unreported: r }, msg: `重复 账号名/ID` })
      } else {
        res.send({ code: 200, data: {}, msg: `无重复 账号名/ID` })
      }
    })
  })
})

// 添加新达人
router.post('/addChance', (req, res) => {
  let time = new Date()
  let currentDate = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
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
    let search_pic = params.search_pic.replace('/public', '')
    let sql = `INSERT INTO talent(tid, pids, ta_name, taID, search_pic, uid, ts_id, create_time) VALUES('${tid}', '${pids}', '${ta_name}', '${taID}', '${search_pic}', '${params.uid}', '1', '${currentDate}')`
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.send({ code: 200, data: {}, msg: `${params.ta_name} 添加成功` })
    })
  })
})

// 修改
router.post('/editChance', (req, res) => {
  let params = req.body
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
  let sql = ''
  if (params.ts_id == 1) {
    sql = `UPDATE talent set pids = '${pids}', ta_name = '${ta_name}', taID = '${taID}' WHERE tid = '${params.tid}'`
  } else {
    sql = `UPDATE talent set pids = '${pids}', ta_name = '${ta_name}', taID = '${taID}', lt_id = '${params.lt_id}', liaison_name = '${params.liaison_name}', liaison_vx = '${params.liaison_vx}', group_name = '${params.group_name}' WHERE tid = '${params.tid}'`
  }
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: `修改成功` })
  })
})

// 推进达人
router.post('/advanceChance', (req, res) => {
  let time = new Date()
  let currentDate = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
  let params = req.body
  let advance_pic = params.advance_pic.replace('/public', '')
  let sql = `UPDATE talent set lt_id = '${params.lt_id}', liaison_name = '${params.liaison_name}', liaison_vx = '${params.liaison_vx}', group_name = '${params.group_name}', advance_pic = '${advance_pic}', advance_time = '${currentDate}', ts_id = 2 WHERE tid = '${params.tid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: `${params.tid} 推进成功` })
  })
})

module.exports = router