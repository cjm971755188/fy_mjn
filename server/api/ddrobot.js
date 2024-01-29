const request = require('request');//加载此模块失败请使用在本目录下使用nmp i request控制台命令
const crypto = require('crypto');

const sendRobot = (_secret, _url, title, msg, link, at, isAtAll) => {
    let secret = _secret//签名，如果有的话
    let url = `https://oapi.dingtalk.com/robot/send?access_token=${_url}`//钉钉机器人的链接，当你创建是便会看到
    let data = {
        "msgtype": "markdown",
        "markdown": {
            "title": `${title}`,
            "text": `${msg} \n> ###### 网址：${link}`
            // ![]('http://1.15.89.163:3000/public/people.jpg') 加图片
        },
        "at": {
            "atMobiles": at,//要@的人的电话号码，可以有多个
            "isAtAll": isAtAll//是否@全体成员
        }
    }
    let time = Date.now();//当前时间
    let stringToSign = time + "\n" + secret;
    console.log('secret: ', secret);
    console.log('stringToSign: ', stringToSign);
    let base = crypto.createHmac('sha256', secret).update(stringToSign).digest('base64');
    let sign = encodeURIComponent(base)//签名
    url = url + `&timestamp=${time}&sign=${sign}`;
    /* console.log(url) */

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