const express = require('express');
const router = express.Router();
const db = require('../config/db')
const { power, filter } = require('../function/power')
const dayjs = require('dayjs');

// 登录
router.post('/login', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM user where phone = '${params.phone}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length == 0) {
            res.send({ code: 201, data: [], msg: '无该用户' })
        } else if (params.password != results[0].password) {
            res.send({ code: 201, data: [], msg: '密码错误' })
        } else if (results[0].status == '失效') {
            res.send({ code: 201, data: [], msg: '该用户已失效' })
        } else {
            let sql = ''
            if (results[0].department === '事业部' && results[0].position !== '副总') {
                sql = `SELECT * FROM user where uid = 'MJN00025'`
            } else {
                sql = `SELECT * FROM user where uid = 'MJN00000'`
            }
            db.query(sql, (err, r) => {
                if (err) throw err;
                res.send({ code: 200, data: { ...results[0], e_id: r[0].uid }, msg: '登录成功' })
            })
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
            res.send({ code: 201, data: [], msg: '无该用户' })
        } else if (results[0].status == '失效') {
            res.send({ code: 201, data: [], msg: '该用户已失效' })
        } else if (params.password != results[0].password) {
            res.send({ code: 201, data: [], msg: '原密码错误' })
        } else if (params.password2 != params.password3) {
            res.send({ code: 201, data: [], msg: '两次密码输入不一致' })
        } else if (params.password == params.password2) {
            res.send({ code: 201, data: [], msg: '新密码与原密码不能相同' })
        } else {
            let sql = `UPDATE user SET password = '${params.password2}' where uid = '${params.uid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: '修改成功' })
            })
        }
    })
})

// 获取用户列表
router.post('/getUserList', (req, res) => {
    let params = req.body
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT SQL_CALC_FOUND_ROWS z.*
                FROM (
                    SELECT u.uid, u.name, u.phone, u.company, u.department, u.position, u.up_uid, u1.name as up_name, u.status 
                    FROM user u 
                        LEFT JOIN user u1 ON u1.uid = u.up_uid 
                    ${power(['u'], params.userInfo)} and u.uid != '${params.userInfo.uid}'
                ) z
                ${filter('normal', params.filters)}
                LIMIT ${pageSize} OFFSET ${current * pageSize}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let sql = `SELECT FOUND_ROWS() as count`
        db.query(sql, (err, count) => {
            if (err) throw err;
            res.send({ code: 200, data: results, pagination: { ...params.pagination, total: count[0].count }, msg: `` })
        })
    })
})

// 添加新用户
router.post('/addUser', (req, res) => {
    let time = dayjs().valueOf()
    let params = req.body
    let sql = `SELECT * FROM user where status != '失效' and company = '${params.combine[0]}' and department = '${params.combine[1]}' and position = '${params.combine[2]}' and position in ('总裁', '副总', '主管')`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length != 0) {
            if (results[0].position == '总裁') {
                res.send({ code: 201, data: [], msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 总裁` })
            }
            if (results[0].position == '副总') {
                res.send({ code: 201, data: [], msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 副总` })
            }
            if (results[0].position == '主管') {
                res.send({ code: 201, data: [], msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 主管` })
            }
        } else {
            let sql = `SELECT * FROM user where phone = '${params.phone}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                if (results.length != 0) {
                    if (results[0].status != '失效') {
                        res.send({ code: 201, data: [], msg: `${params.phone} 手机号已存在，添加失败` })
                    } else {
                        let sql = `UPDATE user SET status = '正常', create_uid = '${params.userInfo.uid}', create_time = '${dayjs().valueOf()}' where phone = '${params.phone}'`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
                            res.send({ code: 200, data: [], msg: `${params.name} 重启成功` })
                        })
                    }
                } else {
                    let sql = `SELECT count(*) as sum FROM user`
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        let uid = 'MJN' + `${results[0].sum}`.padStart(5, '0')
                        let up_uid = params.combine[3] ? `'${params.combine[3]}'` : null
                        let sql = `INSERT INTO user values('${uid}', '${params.name}', '${params.phone}', '123456', '${params.combine[0]}', '${params.combine[1]}', '${params.combine[2]}', ${up_uid}, null, null, '正常', '${params.userInfo.uid}', '${time}')`
                        db.query(sql, (err, results) => {
                            if (err) throw err;
                            res.send({ code: 200, data: [], msg: `${params.name} 添加成功` })
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
                res.send({ code: 201, data: [], msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 总裁` })
            }
            if (results[0].position == '副总') {
                res.send({ code: 201, data: [], msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 副总` })
            }
            if (results[0].position == '主管') {
                res.send({ code: 201, data: [], msg: `${params.combine[0]} ${params.combine[1]} 已存在 ${results.length} 名 主管` })
            }
        } else {
            let sql = `UPDATE user SET name = '${params.name}', company = '${params.combine[0]}', department = '${params.combine[1]}', position = '${params.combine[2]}', up_uid = '${params.combine[3]}' where uid = '${params.uid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

// 删除用户
router.post('/deleteUser', (req, res) => {
    let params = req.body
    let sql = `SELECT t.tid, t.name, tms0.u_id_1, tms0.u_id_2, t.status
                FROM talent t  
                    LEFT JOIN talent_model tm ON tm.tid = t.tid
                    LEFT JOIN (SELECT tmid, MAX(tmsid) as tmsid FROM talent_model_schedule GROUP BY tmid) tms1 ON tms1.tmid = tm.tmid
                    LEFT JOIN talent_model_schedule tms0 ON tms0.tmsid = tms1.tmsid
                where t.status != '已失效'
                    and (tms0.u_id_1 = '${params.uid}' OR tms0.u_id_2 = '${params.uid}')`
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `${params.name} 仍有 ${results.length} 位有效达人，不可删除` })
        } else {
            let sql = `UPDATE user SET status = '失效' where uid = '${params.uid}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `${params.name} 删除成功` })
            })
        }
    })
})

// 获取用户下拉框
router.post('/getUserItems', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM user where status != '失效'`
    if (params.type === 'saleman') {    // 商务
        sql += ` and department = '事业部' and position != '助理' and position != '副总'`
    } else if (params.type === 'salemanAssistant') {    // 商务+助理
        sql += ` and department = '事业部' and position != '副总'`
    } else if (params.type === 'author') {  // 主播
        sql += ` and department = '直播部' and position != '中控'`
    } else if (params.type === 'control') {  // 中控
        sql += ` and position = '中控'`
    } 
    db.query(sql, (err, results) => {
        if (err) throw err;
        let r = []
        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            r.push({
                label: element.name,
                value: element.uid
            })
        }
        res.send({ code: 200, data: r, msg: `` })
    })
})

module.exports = router