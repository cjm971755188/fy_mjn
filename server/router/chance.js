const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../config/db')
const getTime = require('../myFun/getAnalysisTime')
const sendRobot = require('../myFun/ddrobot')

// 获取商机列表
router.post('/getChanceList', (req, res) => {
  let params = req.body
  let where = `where c.status in ('未推进', '已推进', '报备待审批', '报备驳回', '报备通过')`
  // 权限筛选
  if (params.userInfo.position != '管理员') {
    if (params.userInfo.company != '总公司') {
      where += ` and u.company = '${params.userInfo.company}'`
    }
    if (params.userInfo.department != '总裁办') {
      where += ` and u.department = '${params.userInfo.department}'`
    }
    if (params.userInfo.position != '主管') {
      where += ` and u.uid = '${params.userInfo.uid}'`
    }
  }
  // 条件筛选
  if (params.filtersDate && params.filtersDate.length === 2) {
    where += ` and c.create_time >= '${params.filtersDate[0]} 00:00:00' and c.create_time < '${params.filtersDate[1]} 00:00:00'`
  }
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
  let sql = `SELECT * FROM chance c LEFT JOIN user u ON u.uid = c.uid ${where} order by c.cid`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let sql = `SELECT c.cid, t.tid, c.models, c.group_name, c.provide_name, c.platforms, c.account_ids, c.account_names, c.search_pic, c.liaison_type, c.liaison_name, c.liaison_v, c.liaison_phone, c.crowd_name, c.advance_pic, u.name, c.status, c.create_time, c.advance_time 
                FROM chance c 
                LEFT JOIN user u on u.uid = c.uid 
                LEFT JOIN (SELECT cid, MAX(tid) as tid FROM talent GROUP BY cid) t on t.cid = c.cid 
                ${where} order by cid desc limit ${pageSize} offset ${current * pageSize}`
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
  let sql = `SELECT a.cid, a.name, a.account_names, a.account_ids, a.status FROM ( SELECT DISTINCT cid, u.name, account_names, account_ids, chance.status, substring_index(substring_index( account_names, ',', topic.help_topic_id + 1 ), ',',- 1 ) as names, substring_index(substring_index( account_ids, ',', topic2.help_topic_id + 1 ), ',',- 1 ) as ids FROM chance LEFT JOIN mysql.help_topic topic ON topic.help_topic_id < ( length( account_names ) - length( REPLACE ( account_names, ',', '' ) ) + 1 ) LEFT JOIN mysql.help_topic topic2 ON topic2.help_topic_id < ( length( account_ids ) - length( REPLACE ( account_ids, ',', '' ) ) + 1 ) LEFT JOIN user u ON u.uid = chance.uid WHERE chance.status != '报备通过' HAVING (names in (${account_names}) or ids in (${account_ids})) and cid != '${params.cid}' ) a GROUP BY a.cid, a.name`
  db.query(sql, (err, results) => {
    if (err) throw err;
    if (results.length != 0) {
      res.send({ code: 201, data: results, msg: `重复 账号名/ID` })
    } else {
      res.send({ code: 200, data: {}, msg: `无重复 账号名/ID` })
    }
  })
})

// 添加新商机
router.post('/addChance', (req, res) => {
  let params = req.body
  let sql = `SELECT count(*) as sum FROM chance`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let cid = 'C' + `${results[0].sum + 1}`.padStart(5, '0')
    let models = `'${params.models.join()}'`
    let group_name = params.group_name ? `'${params.group_name}'` : null
    let provide_name = params.provide_name ? `'${params.provide_name}'` : null
    let platforms = params.platforms ? `'${params.platforms.join()}'` : null
    let account_ids = params.account_ids ? `'${params.account_ids.join()}'` : null
    let account_names = params.account_names ? `'${params.account_names.join()}'` : null
    let search_pic = params.search_pic.replace('/public', '')
    let sql = `INSERT INTO chance(cid, models, group_name, provide_name, platforms, account_names, account_ids, search_pic, uid, status, create_time) VALUES('${cid}', ${models}, ${group_name}, ${provide_name}, ${platforms}, ${account_names}, ${account_ids}, '${search_pic}', '${params.uid}', '未推进', ${dayjs().valueOf()})`
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.send({ code: 200, data: {}, msg: `添加成功` })
    })
  })
})

// 修改
router.post('/editChance', (req, res) => {
  let params = req.body
  let models = `'${params.models.join()}'`
  let group_name = params.group_name ? `'${params.group_name}'` : null
  let provide_name = params.provide_name ? `'${params.provide_name}'` : null
  let platforms = params.platforms ? `'${params.platforms.join()}'` : null
  let account_ids = params.account_ids ? `'${params.account_ids.join()}'` : null
  let account_names = params.account_names ? `'${params.account_names.join()}'` : null
  let sql = ''
  if (params.status === '未推进') {
    sql = `UPDATE chance set models = ${models}, group_name = ${group_name}, provide_name = ${provide_name}, platforms = ${platforms}, account_names = ${account_names}, account_ids = ${account_ids} WHERE cid = '${params.cid}'`
  } else {
    sql = `UPDATE chance set models = ${models}, group_name = ${group_name}, provide_name = ${provide_name}, platforms = ${platforms}, account_names = ${account_names}, account_ids = ${account_ids}, liaison_type = '${params.liaison_type}', liaison_name = '${params.liaison_name}', liaison_v = '${params.liaison_v}', liaison_phone = '${params.liaison_phone}', crowd_name = '${params.crowd_name}' WHERE cid = '${params.cid}'`
  }
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: `修改成功` })
  })
})

// 推进商机
router.post('/advanceChance', (req, res) => {
  let params = req.body
  let advance_pic = params.advance_pic.replace('/public', '')
  let sql = `UPDATE chance set liaison_type = '${params.liaison_type}', liaison_name = '${params.liaison_name}', liaison_v = '${params.liaison_v}', liaison_phone = '${params.liaison_phone}', crowd_name = '${params.crowd_name}', advance_pic = '${advance_pic}', advance_time = ${dayjs().valueOf()}, status = '已推进' WHERE cid = '${params.cid}'`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: {}, msg: `${params.cid} 推进成功` })
  })
})

// 报备达人
router.post('/reportChance', (req, res) => {
  let time = dayjs().valueOf()
  let params = req.body
  let mid_1 = params.mid_1 ? `'${params.mid_1}'` : null
  let m_point_1 = params.m_point_1 ? `'${params.m_point_1}'` : null
  let m_note_1 = params.m_note_1 ? `'${params.m_note_1}'` : null
  let mid_2 = params.mid_2 ? `'${params.mid_2}'` : null
  let m_point_2 = params.m_point_2 ? `'${params.m_point_2}'` : null
  let m_note_2 = params.m_note_2 ? `'${params.m_note_2}'` : null
  let sql = `SELECT * FROM talent`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let tid = 'T' + `${results.length + 1}`.padStart(5, '0')
    let sql = `INSERT INTO talent values('${tid}', '${params.cid}', '${params.talent_name}', '${params.year_deal}', null, '报备待审批')`
    db.query(sql, (err, results) => {
      if (err) throw err;
      let sql = `SELECT * FROM talentdetail`
      db.query(sql, (err, results_d) => {
        if (err) throw err;
        let sql = `SELECT * FROM talentline`
        db.query(sql, (err, results_l) => {
          if (err) throw err;
          let sql_d = `INSERT INTO talentdetail values`
          let sql_l = `INSERT INTO talentline values`
          let count_d = results_d.length
          let count_l = results_l.length
          if (params.accounts) {
            for (let i = 0; i < params.accounts.length; i++) {
              let tdid = 'TD' + `${count_d + i + 1}`.padStart(5, '0')
              let tlid = 'TL' + `${count_l + i + 1}`.padStart(5, '0')
              let keyword = params.accounts[i].keyword ? `'${params.accounts[i].keyword}'` : null
              let uid_2 = params.accounts[i].uid_2 ? `'${params.accounts[i].uid_2}'` : null
              let u_point_2 = params.accounts[i].u_point_2 ? `'${params.accounts[i].u_point_2}'` : null
              let u_note = params.accounts[i].u_note ? `'${params.accounts[i].u_note}'` : null
              sql_d += `('${tdid}', '${tid}', '线上平台', '${params.accounts[i].platform}', '${params.accounts[i].account_id}', '${params.accounts[i].account_name}', '${params.accounts[i].account_type}', '${params.accounts[i].account_models}', ${keyword}, '${params.accounts[i].people_count}', '${params.accounts[i].fe_proportion}', '${params.accounts[i].age_cuts}', '${params.accounts[i].main_province}', '${params.accounts[i].price_cut}', null, null),`
              sql_l += `('${tlid}', '${params.userInfo.uid}', '报备', null, '${tdid}', ${time}, '${params.accounts[i].commission_normal}', '${params.accounts[i].commission_welfare}', '${params.accounts[i].commission_bao}', '${params.accounts[i].commission_note}', null, null, null, null, null, null, null, '${params.userInfo.uid}', '${params.accounts[i].u_point_1}', ${uid_2}, ${u_point_2}, null, null, ${u_note}, ${mid_1}, ${m_point_1}, ${m_note_1}, ${mid_2}, ${m_point_2}, ${m_note_2}, '暂无', null, null, null, null, null),`
            }
            count_d += params.accounts.length
            count_l += params.accounts.length
          }
          if (params.group_name) {
            let tdid = 'TD' + `${count_d + 1}`.padStart(5, '0')
            let tlid = 'TL' + `${count_l + 1}`.padStart(5, '0')
            let uid_2 = params.group_uid_2 ? `'${params.group_uid_2}'` : null
            let u_point_2 = params.group_u_point_2 ? `'${params.group_u_point_2}'` : null
            let group_u_note = params.group_u_note ? `'${params.group_u_note}'` : null
            sql_d += `('${tdid}', '${tid}', '社群团购', '${params.group_shop}', null, null, null, null, null, null, null, null, null, null, '${params.group_name}', null),`
            sql_l += `('${tlid}', '${params.userInfo.uid}', '报备', null, '${tdid}', ${time}, null, null, null, null, '${params.discount_normal}', '${params.discount_welfare}', '${params.discount_bao}', '${params.discount_note}', null, null, null, '${params.userInfo.uid}', '${params.group_u_point_1}', ${uid_2}, ${u_point_2}, null, null, ${group_u_note}, ${mid_1}, ${m_point_1}, ${m_note_1}, ${mid_2}, ${m_point_2}, ${m_note_2}, '暂无', null, null, null, null, null),`
            count_d += 1
            count_l += 1
          }
          if (params.provide_name) {
            let tdid = 'TD' + `${count_d + 1}`.padStart(5, '0')
            let tlid = 'TL' + `${count_l + 1}`.padStart(5, '0')
            let uid_2 = params.provide_uid_2 ? `'${params.provide_uid_2}'` : null
            let u_point_2 = params.provide_u_point_2 ? `'${params.provide_u_point_2}'` : null
            let provide_u_note = params.provide_u_note ? `'${params.provide_u_note}'` : null
            sql_d += `('${tdid}', '${tid}', '供货', '${params.provide_shop}', null, null, null, null, null, null, null, null, null, null, null, '${params.provide_name}'),`
            sql_l += `('${tlid}', '${params.userInfo.uid}', '报备', null, '${tdid}', ${time}, null, null, null, null, null, null, null, null, '${params.discount_buyout}', '${params.discount_back}', '${params.discount_label}', '${params.userInfo.uid}', '${params.provide_u_point_1}', ${uid_2}, ${u_point_2}, null, null, ${provide_u_note}, ${mid_1}, ${m_point_1}, ${m_note_1}, ${mid_2}, ${m_point_2}, ${m_note_2}, '暂无', null, null, null, null, null),`
            count_d += 1
            count_l += 1
          }
          sql_d = sql_d.substring(0, sql_d.length - 1)
          sql_l = sql_l.substring(0, sql_l.length - 1)
          db.query(sql_d, (err, results) => {
            if (err) throw err;
            db.query(sql_l, (err, results) => {
              if (err) throw err;
              let sql = `UPDATE chance SET status = '报备待审批' WHERE cid = '${params.cid}'`
              db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: {}, msg: `` })
              })
            })
          })
        })
      })
    })
  })
})



// 商机统计分析top
router.post('/getChanceAnalysisTop', (req, res) => {
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
  let sql = `SELECT	a.searchNow, ((a.searchNow - a.searchLast) / a.searchLast * 100) as searchYOY, (searchNow / 50 * 100) as searchReachNow, (searchNow / 50 * 100 - searchLast / 50 * 100) as searchReachYOY, a.advanceNow, ((a.advanceNow - a.advanceLast) / a.advanceLast * 100) as advanceYOY, (a.advanceNow / a.searchNow) * 100 as probabilityNow, (a.advanceNow / a.searchNow) * 100 - (a.advanceLast / a.searchLast) * 100 as probabilityYOY FROM	(SELECT SUM(IF(${getTime(params.type).searchLastDate}, 1, 0)) as searchLast, SUM(IF(${getTime(params.type).searchNowDate}, 1, 0)) as searchNow, SUM(IF(${getTime(params.type).advanceLastDate}, 1, 0)) as advanceLast, SUM(IF(${getTime(params.type).advanceNowDate}, 1, 0)) as advanceNow FROM chance c LEFT JOIN user u on u.uid = c.uid ${where} )	a`
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send({ code: 200, data: results[0], msg: `` })

  })
})

// 商机统计分析 商务
router.post('/getChanceAnalysisSaleman', (req, res) => {
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
  let sql = `SELECT u.name, SUM(IF(${getTime(params.type).searchNowDate}, 1, 0)) as search, SUM(IF(${getTime(params.type).advanceNowDate}, 1, 0)) as advance, SUM(IF(${getTime(params.type).advanceNowDate}, 1, 0)) / SUM(IF(${getTime(params.type).searchNowDate}, 1, 0)) * 100 as probability FROM chance c LEFT JOIN user u ON u.uid = c.uid ${where} GROUP BY u.name ORDER BY u.name`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let name = []
    let search = []
    let advance = []
    let probability = []
    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      name.push(element.name === null ? '未知' : element.name)
      search.push(element.search === null ? 0 : element.search)
      advance.push(element.advance === null ? 0 : element.advance)
      probability.push(element.probability === null ? 0 : element.probability)
    }
    res.send({ code: 200, data: { name, search, advance, probability }, msg: `` })
  })
})

// 商机统计分析 平台
router.post('/getChanceAnalysisPlatform', (req, res) => {
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
  let sql = `SELECT c.platforms, SUM(IF(${getTime(params.type).searchNowDate}, 1, 0)) as search, SUM(IF(${getTime(params.type).advanceNowDate}, 1, 0)) as advance, SUM(IF(${getTime(params.type).advanceNowDate}, 1, 0)) / SUM(IF(${getTime(params.type).searchNowDate}, 1, 0)) * 100 as probability FROM chance c LEFT JOIN user u ON u.uid = c.uid ${where} GROUP BY c.platforms ORDER BY c.platforms`
  db.query(sql, (err, results) => {
    if (err) throw err;
    let platform = []
    let search = []
    let advance = []
    let probability = []
    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      const ps = results[i].platforms.split(',')
      if (ps.length > 1) {
        for (let j = 0; j < ps.length; j++) {
          const p = ps[j];
          platform.push(p === null ? 0 : p)
          search.push(element.search === null ? 0 : element.search / ps.length)
          advance.push(element.advance === null ? 0 : element.advance / ps.length)
          probability.push(element.probability === null ? 0 : element.probability)
        }
      } else {
        platform.push(element.platforms[0] === null ? 0 : element.platforms[0])
        search.push(element.search === null ? 0 : element.search)
        advance.push(element.advance === null ? 0 : element.advance)
        probability.push(element.probability === null ? 0 : element.probability)
      }
    }
    res.send({ code: 200, data: { platform, search, advance, probability }, msg: `` })
  })
})

module.exports = router