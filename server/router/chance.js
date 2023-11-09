const express = require('express');
const router = express.Router();
const db = require('../config/db')

// 获取商机列表
router.post('/getChanceList', (req, res) => {
  let params = req.body
  let where = `where c.status in ('未推进', '已推进', '报备待审批', '报备失败') and c.uid = '${params.userInfo.uid}'`
  // 权限筛选
  if (params.userInfo.position != '管理员') {
    if (params.userInfo.company != '总公司') {
      where += ` and c.company = '${params.userInfo.company}'`
    }
    if (params.userInfo.department != '总裁办') {
      where += ` and c.department = '${params.userInfo.department}'`
    }
  }
  // 条件筛选
  for (let i = 0; i < Object.getOwnPropertyNames(params.filters).length; i++) {
    if (Object.keys(params.filters)[i].split('_')[1] == 'id') {
      where += ` and c.${Object.keys(params.filters)[i]} = '${Object.values(params.filters)[i]}'`
    } else {
      where += ` and c.${Object.keys(params.filters)[i]} like '%${Object.values(params.filters)[i]}%'`
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
  let sql = `SELECT * FROM chance c ${where} order by c.cid`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let sql = `SELECT c.cid, c.platforms, c.account_ids, c.account_names, c.search_pic, c.liaison_type, c.liaison_name, c.liaison_v, c.liaison_phone, c.group_name, c.advance_pic, u.name, c.status, c.create_time, c.advance_time FROM chance c LEFT JOIN user u on u.uid = c.uid ${where} order by cid desc limit ${pageSize} offset ${current * pageSize}`
    db.query(sql, (err, r) => {
      if (err) throw err;
      res.send({ code: 200, data: r, pagination: { ...params.pagination, total: results.length }, msg: '' })
    })
  })
})

// 查询重复商机
router.post('/searchSameChance', (req, res) => {
  let params = req.body
  let account_ids = ''
  for (let i = 0; i < params.account_ids.length; i++) {
    account_ids += `'${params.account_ids[i]}',`
  }
  account_ids = account_ids.substring(0, account_ids.length - 1)
  let account_names = ''
  for (let i = 0; i < params.account_names.length; i++) {
    account_names += `'${params.account_names[i]}',`
  }
  account_names = account_names.substring(0, account_names.length - 1)
  let sql = `SELECT DISTINCT t.talent_name, u1.name, u2.name, t.platform FROM talentline tl LEFT JOIN talent t ON t.tid = tl.tid LEFT JOIN user u1 ON u1.uid = tl.uid_1 LEFT JOIN user u2 ON u2.uid = tl.uid_2 WHERE tl.end_date IS NULL and (t.account_id in (${account_ids}) or t.account_name in (${account_names}))`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let sql = `SELECT	a.cid, a.name, GROUP_CONCAT(DISTINCT account_names) as account_names, GROUP_CONCAT(DISTINCT account_ids) as account_ids FROM	(SELECT DISTINCT cid, u.name, substring_index(substring_index( account_names, ',', topic.help_topic_id + 1 ), ',',- 1 ) as account_names, substring_index(substring_index( account_ids, ',', topic2.help_topic_id + 1 ), ',',- 1 ) as account_ids FROM chance LEFT JOIN mysql.help_topic topic ON topic.help_topic_id < ( length( account_names ) - length( REPLACE ( account_names, ',', '' ) ) + 1 ) LEFT JOIN mysql.help_topic topic2 ON topic2.help_topic_id < ( length( account_ids ) - length( REPLACE ( account_ids, ',', '' ) ) + 1 ) LEFT JOIN user u ON u.uid = chance.uid HAVING (account_names in (${account_names}) or account_ids in (${account_ids})) and cid != '${params.cid}' )	a GROUP BY	a.cid, a.name`
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

// 添加新商机
router.post('/addChance', (req, res) => {
  let time = new Date()
  let currentDate = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
  let params = req.body
  let sql = `SELECT count(*) as sum FROM chance`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let cid = 'C' + `${results[0].sum + 1}`.padStart(6, '0')
    let platforms = params.platforms.join()
    let account_ids = params.account_ids.join()
    let account_names = params.account_names.join()
    let search_pic = params.search_pic.replace('/public', '')
    let sql = `INSERT INTO chance(cid, platforms, account_names, account_ids, search_pic, uid, status, create_time) VALUES('${cid}', '${platforms}', '${account_names}', '${account_ids}', '${search_pic}', '${params.uid}', '未推进', '${currentDate}')`
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.send({ code: 200, data: {}, msg: `添加成功` })
    })
  })
})

// 修改
router.post('/editChance', (req, res) => {
  let params = req.body
  let platforms = params.platforms.join()
  let account_ids = params.account_ids.join()
  let account_names = params.account_names.join()
  let sql = ''
  if (params.status === '未推进') {
    sql = `UPDATE chance set platforms = '${platforms}', account_names = '${account_names}', account_ids = '${account_ids}' WHERE cid = '${params.cid}'`
  } else {
    sql = `UPDATE chance set platforms = '${platforms}', account_names = '${account_names}', account_ids = '${account_ids}', liaison_type = '${params.liaison_type}', liaison_name = '${params.liaison_name}', liaison_v = '${params.liaison_v}', liaison_phone = '${params.liaison_phone}', group_name = '${params.group_name}' WHERE cid = '${params.cid}'`
  }
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: `修改成功` })
  })
})

// 推进商机
router.post('/advanceChance', (req, res) => {
  let time = new Date()
  let currentDate = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
  let params = req.body
  let advance_pic = params.advance_pic.replace('/public', '')
  let sql = `UPDATE chance set liaison_type = '${params.liaison_type}', liaison_name = '${params.liaison_name}', liaison_v = '${params.liaison_v}', liaison_phone = '${params.liaison_phone}', group_name = '${params.group_name}', advance_pic = '${advance_pic}', advance_time = '${currentDate}', status = '已推进' WHERE cid = '${params.cid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: `${params.tid} 推进成功` })
  })
})

// 商机统计分析
router.post('/getChanceAnalysis', (req, res) => {
  let params = req.body
  let where = `where u.status != '2'`
  // 权限筛选
  if (params.userInfo.position != '管理员') {
    if (params.userInfo.company != '总公司') {
      where += ` and c.company = '${params.userInfo.company}'`
    }
    if (params.userInfo.department != '总裁办') {
      where += ` and c.department = '${params.userInfo.department}'`
    }
  }
  let time = new Date()
  let yestoday = time.getFullYear() + "-" + `${time.getMonth() + 1}`.padStart(2, '0') + "-" + `${time.getDate() - 1}`.padStart(2, '0') + " 00:00:00"
  let today = time.getFullYear() + "-" + `${time.getMonth() + 1}`.padStart(2, '0') + "-" + `${time.getDate()}`.padStart(2, '0') + " 00:00:00"
  let month = time.getFullYear() + "-" + `${time.getMonth() + 1}`.padStart(2, '0') + "-01 00:00:00"
  let lastmonth = time.getFullYear() + "-" + `${time.getMonth() + 1}`.padStart(2, '0') + "-01 00:00:00"
  let year = time.getFullYear() + "-01-01 00:00:00"
  let lastyear = time.getFullYear() + "-01-01 00:00:00"
  let searchLastDate = `1`
  let searchNowDate = `1`
  let advanceLastDate = `1`
  let advanceNowDate = `1`
  if (params.type === '今日') {
    searchNowDate = `c.create_time >= '${today}'`
    searchLastDate = `c.create_time >= '${yestoday}' and c.create_time < '${today}'`
    advanceNowDate = `c.advance_time >= '${today}'`
    advanceLastDate = `c.advance_time >= '${yestoday}' and c.advance_time < '${today}'`
  } else if (params.type === '本月') {
    searchNowDate = `c.create_time >= '${month}'`
    searchLastDate = `c.create_time >= '${lastmonth}' and c.create_time < '${month}'`
    advanceNowDate = `c.advance_time >= '${month}'`
    advanceLastDate = `c.advance_time >= '${lastmonth}' and c.advance_time < '${month}'`
  } else if (params.type === '今年') {
    searchNowDate = `c.create_time >= '${year}'`
    searchLastDate = `c.create_time >= '${lastyear}' and c.create_time < '${year}'`
    advanceNowDate = `c.advance_time >= '${year}'`
    advanceLastDate = `c.advance_time >= '${lastyear}' and c.advance_time < '${year}'`
  } else if (params.type === '全部') {
    where = ``
  } else {
    res.send({ code: 200, data: {}, msg: `时间选择错误` })
  }
  let sql = `SELECT	a.searchNow, ((a.searchNow - a.searchLast) / a.searchLast * 100) as searchYOY, a.advanceNow, ((a.advanceNow - a.advanceLast) / a.advanceLast * 100) as advanceYOY, (a.advanceNow / a.searchNow) * 100 as probabilityNow, (a.advanceNow / a.searchNow) * 100 - (a.advanceLast / a.searchLast) * 100 as probabilityYOY FROM	(SELECT SUM(IF(${searchLastDate}, 1, 0)) as searchLast, SUM(IF(${searchNowDate}, 1, 0)) as searchNow, SUM(IF(${advanceLastDate}, 1, 0)) as advanceLast, SUM(IF(${advanceNowDate}, 1, 0)) as advanceNow FROM chance c LEFT JOIN user u on u.uid = c.uid ${where} )	a`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: { sum: {...results[0]} }, msg: `` })
  })
})

module.exports = router