const express = require('express');
const router = express.Router();
fs = require("fs");

// 上传图片
router.post('/uploadimg', (req, res) => {
    let oldName = req.files[0].filename;//获取名字
    let originalname = req.files[0].originalname;//originnalname其实就是你上传时候文件起的名字
    //给新名字加上原来的后缀
    let newName = req.files[0].originalname;
    fs.renameSync('./public/img/' + oldName, './public/img/' + newName);//改图片的名字注意此处一定是一个路径，而不是只有文件名
    res.send({
        err: 0,
        url: "http://1.15.89.163:3000/public/img/" +
            newName
    });
})

module.exports = router
