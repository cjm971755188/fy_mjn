const express = require('express');
const router = express.Router();
fs = require("fs");
const BASE_URL = require('../config/config')

// 上传文件
router.post('/upload', (req, res) => {
    let r = []
    for (let i = 0; i < req.files.length; i++) {
        let oldName = Buffer.from(req.files[i].filename, "latin1").toString("utf8");
        let originalname = Buffer.from(req.files[i].fieldname + '_' + req.files[i].originalname, "latin1").toString("utf8");
        fs.renameSync(`./public/` + oldName, `./public/` + originalname, function (err) {
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
    try {
        //获取文件路径e
        let filePath = path.join(__dirname, '/../public/' + req.query.url)
        res.download(filePath)
    } catch (e) {
        res.json({ code: 2000 })
    }
})

// 删除文件
router.post('/delete', (req, res) => {
    let parmas = req.body
    fs.unlink(parmas.url, (error) => {
        if(error) {
            throw error;
        } else {
            console.log('文件删除成功...');
        }
    })
})

module.exports = router
