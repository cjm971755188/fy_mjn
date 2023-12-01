const express = require('express');
const router = express.Router();
const path = require('path')
fs = require("fs");

// 下载文件
router.get('/download', (req, res) => {
    try {
        //获取文件路径e
        let filePath = path.join(__dirname.replace('router', ''), '../../public/' + req.query.url)
        res.download(filePath)
    } catch (e) {
        console.log(e)
        res.json({
            code: 2000
        })
    }
})


module.exports = router
