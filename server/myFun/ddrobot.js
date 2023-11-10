const request = require('request');//加载此模块失败请使用在本目录下使用nmp i request控制台命令
const crypto = require('crypto');

const sendRobot = (msg) => {
    let sendData = `慕江南蜉蝣提醒您：${msg}`;//你自己定义的关键字

    let secret = ""//签名，如果有的话
    let url = "https://oapi.dingtalk.com/robot/send?access_token=26784eee12f7b6895f97022a6edf3e8fcfc8ed25676d5096815e5e99d6246567"//钉钉机器人的链接，当你创建是便会看到
    let data = {
        "msgtype": "text",
        "text": {
            "content": sendData//聊天内容，若群机器人设置了自定义关键字，则必须加上关键字
        },
        "at": {
            "atMobiles": [//要@的人的电话号码，可以有多个
                "17764585713"//可以为空
            ],
            "isAtAll": false//是否@全体成员
        }
    }
    let time = Date.now();//当前时间
    let stringToSign = time + "\n" + secret;
    let base = crypto.createHmac('sha256', secret).update(stringToSign).digest('base64');
    let sign = encodeURIComponent(base)//签名
    url = url + `&timestamp=${time}&sign=${sign}`;
    console.log(url)

    request.post(//发送post
        url,
        {
            json: data,
            encoding: "utf-8",
            headers: {
                'Content-Type': 'application/json'
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)//成功返回
            }
        }
    );
}

module.exports = sendRobot