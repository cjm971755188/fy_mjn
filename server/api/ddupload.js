const request = require('request');//加载此模块失败请使用在本目录下使用nmp i request控制台命令
const crypto = require('crypto');

const upload = (_secret, _url, _data) => {
    let secret = _secret//签名，如果有的话
    let url = `https://oapi.dingtalk.com/media/upload?access_token=${_url}`//钉钉机器人的链接，当你创建是便会看到
    let data = _data
    let time = Date.now();//当前时间
    let stringToSign = time + "\n" + secret;
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

module.exports = upload