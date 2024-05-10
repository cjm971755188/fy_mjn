const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../config/db')
const sendRobot = require('../api/ddrobot')
const upload = require('../api/ddupload')
const { power, filter, isNull } = require('../function/power')

// 基础设定
router.post('/getBaseSets', (req, res) => {
    let params = req.body
    // 分页
    let current = params.pagination.current ? params.pagination.current : 0
    let pageSize = params.pagination.pageSize ? params.pagination.pageSize : 10
    let sql = `SELECT SQL_CALC_FOUND_ROWS z.* 
                FROM base_${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `${params.type} z` : 'set z'} 
                WHERE ${filter('normal', params.filters)} ${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `` : `and z.type = '${params.type}'`}
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

router.post('/addBaseSet', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `${params.type}` : 'set'} WHERE name = '${params.name}' ${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `` : `and type = '${params.type}'`}`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            if (results[0].status === '正常') {
                res.send({ code: 201, data: [], msg: `名字重复` })
            } else {
                let sql = `UPDATE base_${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `${params.type}` : 'set'} 
                            SET status = '正常' WHERE name = '${params.name}' ${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `` : `and type = '${params.type}'`}`
                db.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send({ code: 200, data: [], msg: `添加成功` })
                })
            }
        } else {
            let sql = `INSERT INTO base_${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `${params.type}` : 'set'}`
            let keys = '(', values = '('
            for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
                keys += ` ${Object.keys(params)[i]},`
                values += ` '${Object.values(params)[i]}',`
            }
            keys += ['notice'].indexOf(params.type) > -1 ? ` create_time, status)` : ` status)`
            values += ['notice'].indexOf(params.type) > -1 ? ` '${dayjs().valueOf()}', '未通知')` : ` '正常')`
            sql += `${keys} VALUES${values}`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `添加成功` })
            })
        }
    })
})

router.post('/editBaseSet', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `${params.type}` : 'set'} WHERE name = '${params.name}' and id != '${params.id}'`
    db.query(sql, (err, results) => {
        if (results.length !== 0) {
            res.send({ code: 201, data: [], msg: `名字重复` })
        } else {
            let sql = `UPDATE base_${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `${params.type}` : 'set'} SET`
            for (let i = 0; i < Object.getOwnPropertyNames(params).length; i++) {
                if (['id', 'type'].indexOf(Object.keys(params)[i]) <= -1) {
                    if (Object.values(params)[i] === null) {
                        sql += ` ${Object.keys(params)[i]} = null,`
                    } else {
                        sql += ` ${Object.keys(params)[i]} = '${Object.values(params)[i]}',`
                    }
                }
            }
            if (params.type === 'notice') {
                sql += ` status = '未通知',`
            }
            sql = sql.substring(0, sql.length - 1)
            sql += ` WHERE id = '${params.id}'`
            db.query(sql, (err, results) => {
                if (err) throw err;
                res.send({ code: 200, data: [], msg: `修改成功` })
            })
        }
    })
})

router.post('/noticeBaseSet', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_notice SET status = '已通知' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        sendRobot(
            'SECb23cc6f521ff9c1274bf6b6a63d4647ccc06f2112cceced309c9885be3de54d0',
            '15a18c533b456a8e6dc8e75a9cb22b26ce25d25cc088ed86873426d11fe73d18',
            {
                "msgtype": "markdown",
                "markdown": {
                    "title": `【通知】${params.name}`,
                    "text": `## 【通知】${params.name} \n ##### 发布人：${params.userInfo.name} \t 发布时间：${dayjs().format('YYYY-MM-DD')} \n ${params.value.replace(/(\r\n|\r|\n)/g, '$1  \n')}`
                },
                "at": {
                    "atMobiles": [],
                    "isAtAll": true
                }
            }
        )
        /* 'SECb23cc6f521ff9c1274bf6b6a63d4647ccc06f2112cceced309c9885be3de54d0',
                '15a18c533b456a8e6dc8e75a9cb22b26ce25d25cc088ed86873426d11fe73d18', */
        /* for (let i = 0; i < params.files.split(',').length; i++) {

            sendRobot(
                'SECabb6bc222acb11b8f768c0ea848b64c9f5222b9833b666e20c8478a8922c34ea',
                '26784eee12f7b6895f97022a6edf3e8fcfc8ed25676d5096815e5e99d6246567',
                {
                    "msgtype": "file",
                    "file": {
                        "media_id": `${params.files.split(',')[i]}`
                    }
                }
            )
        } */
        res.send({ code: 200, data: [], msg: `通知成功` })
    })
})

router.post('/deleteBaseSet', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `${params.type}` : 'set'} SET status = '失效' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `禁用成功` })
    })
})

router.post('/recoverBaseSet', (req, res) => {
    let params = req.body
    let sql = `UPDATE base_${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `${params.type}` : 'set'} SET status = '正常' WHERE id = '${params.id}'`
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: `恢复成功` })
    })
})

router.post('/getBaseSetItems', (req, res) => {
    let params = req.body
    let sql = `SELECT * FROM base_${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `${params.type}` : 'set'} WHERE status != '失效' ${['company', 'store', 'notice'].indexOf(params.type) > -1 ? `` : `and type = '${params.type}'`}`
    db.query(sql, (err, results) => {
        if (err) throw err;
        let r = []
        for (let i = 0; i < results.length; i++) {
            r.push({
                label: results[i].name,
                value: results[i].name
            })
        }
        res.send({ code: 200, data: r, msg: `` })
    })
})

module.exports = router