const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require("fs");
const db = require('../config/db')
const BASE_URL = require('../config/config')

// 上传文件
router.post('/upload', (req, res) => {
    let r = []
    for (let i = 0; i < req.files.length; i++) {
        let oldName = Buffer.from(req.files[i].filename, "latin1").toString("utf8");
        let originalname = Buffer.from(req.files[i].fieldname + '_' + req.files[i].originalname, "latin1").toString("utf8");
        fs.renameSync('./public/' + oldName, './public/' + originalname, function (err) {
            if (err) console.log('改名失败', err)
        })
        r.push({
            err: 0,
            url: `${BASE_URL}/public/` + originalname
        })
    }
    res.send(r);
})

// 下载文件
router.get('/download', (req, res) => {
    //获取文件路径e
    let filePath = path.join(__dirname, '../public/' + req.query.url)
    res.download(filePath)
})

// 删除文件
router.post('/delete', (req, res) => {
    let parmas = req.body
    let url = 'public/' + parmas.url
    fs.unlink(url, (error) => {
        if (error) {
            throw error;
        } else {
            console.log('文件删除成功...');
        }
    })
})

// 获取文件列表
router.post('/getFiles', (req, res) => {
    let params = req.body
    let sql = ''
    if (params.type.match('年框')) {
        sql = `SELECT ts1.yearbox_files as files 
                FROM talent t
                    LEFT JOIN (SELECT tid, MAX(tsid) as tsid FROM talent_schedule GROUP BY tid) ts0 ON ts0.tid = t.tid 
                    LEFT JOIN talent_schedule ts1 ON ts1.tsid = ts0.tsid
                WHERE t.tid = '${params.id}'`
    } else {
        sql = `SELECT model_files as files FROM talent_model WHERE tmid = '${params.id}'`
    }
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length === 0 || results[0].files === null) {
            res.send({ code: 200, data: [], msg: `` })
        } else {
            res.send({ code: 200, data: JSON.parse(results[0].files), msg: `` })
        }
    })
})

module.exports = router
