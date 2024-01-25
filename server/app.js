const express = require('express');
const cors = require('cors')
const multer = require("multer");
const app = express();
const path = require('path');
const CallJSTAPI = require('./api/jst')
const sendRobot = require('./api/ddrobot')
let schedule = require('node-schedule');

app.use(cors())
// 监听端口
app.listen('3000', () => {
    console.log('Server started')
})

// 创建连接, 连接数据库
const db = require('./config/db')
db.connect((err) => {
    if (err) throw err;
    console.log('Mysql connected')
})

// body-parser解析json
const bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

// 跨域
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type,cookie");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,post");
    res.header("X-Powered-By", ' 3.2.1')
    //这段仅仅为了方便返回json而已
    res.header("Content-Type", "application/json;charset=utf-8");
    if (req.method == 'OPTIONS') {
        //让options请求快速返回
        res.sendStatus(200);
    } else {
        next();
    }
});

// 上传图片
let objMulter = multer({ dest: path.join(__dirname, './public/') });
//实例化multer，传递的参数对象，dest表示上传文件的存储路径
app.use(objMulter.any());//any表示任意类型的文件
// app.use(objMulter.image())//仅允许上传图片类型
app.use(express.static(path.join(__dirname, './public/')));//将静态资源托管，这样才能在浏览器上直接访问预览图片或则html页面
//此处我写了模块化，你们也可以不用模块化，直接在这里写get,post请求也可以
const file = require('./router/file')
app.use('/file', file)

// 引入路由
const statisticsRouter = require('./router/statistics')
app.use('/statistics', statisticsRouter)
const chanceRouter = require('./router/chance')
app.use('/chance', chanceRouter)
const talentRouter = require('./router/talent')
app.use('/talent', talentRouter)
const blackRouter = require('./router/black')
app.use('/black', blackRouter)
const liveRouter = require('./router/live')
app.use('/live', liveRouter)
const pointRouter = require('./router/point')
app.use('/point', pointRouter)
const middlemanRouter = require('./router/middleman')
app.use('/middleman', middlemanRouter)
const extraRouter = require('./router/extra')
app.use('/extra', extraRouter)
const userRouter = require('./router/user')
app.use('/user', userRouter)

// 定义规则
let rule = new schedule.RecurrenceRule();
// rule.date = [1]; // 每月1号 
// rule.dayOfWeek = [1,3,5]; // 每周一、周三、周五 
rule.hour = 0; rule.minute = 0; rule.second = 0; // 每天0点执行
// rule.second = [0,10,20,30,40,50]; // 隔十秒
// rule.minute = [0,20,40]; // 每小时的0分钟，20分钟，40分钟执行
// 启动任务
let job = schedule.scheduleJob(rule, () => {
    /* let sql = `UPDATE chance SET status = '已过期' where `
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ code: 200, data: [], msg: '修改成功' })
    }) */
});
// 取消任务
job.cancel();

/* sendRobot(ddurls.report, `标题`, `![]('http://1.15.89.163:3000/public/people.jpg') \n@17764585713`, `http://1.15.89.163:5173/admin/talent/talent_list`, ["17764585713"], false) */

/* // 钉钉token
const axios = require('axios');
const appInfo = require('./config/ddToken');
axios.get('https://oapi.dingtalk.com/gettoken', { params: appInfo }) //请求外部接口
    .then((res) => {
        console.log(res.data.access_token);
        axios.post(`https://oapi.dingtalk.com/topapi/im/chat/scencegroup/interactivecard/callback/register?access_token=${res.data.access_token}`) //请求外部接口
            .then((res) => {
                console.log(res.data);

            })
            .catch((error) => {
                console.error(error)
            })
    })
    .catch((error) => {
        console.error(error)
    }) */