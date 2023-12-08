/** 
 * nodejs版本：v12.22.12
 * npm install node-fetch crypto
 */

/** fetch导出对象 */
let fetch;
/** 
 * package.json 确保安装:node-fetch库
 * 由于 笔者自身node版本为v12,且系统框架限制,采用 import then 方式加载
 * v14以上高版本,可直接 import
 */
import("node-fetch")
    .then((module) => {
        fetch = module.default;
    })
    .catch((err) => {
        console.info(err);
    });

/** package.json 确保安装:crypto库 */
const crypto = require('crypto');


/** 聚水潭配置 */
const jstConfig = {
    // 聚水潭测试环境,参见沙箱说明URL:https://openweb.jushuitan.com/doc?docId=110
    // app_key app_secret access_token
    app_key: "3b7f3c2bb4d84c3690d57eef06a194bf",
    app_secret: "2719e6c7fc844b45857e1fb7f0920281",
    access_token: "521287ceb5b24ab0ad60f70bee94d41a",
    // 正式环境	https://openapi.jushuitan.com/open/shops/query
    // 测试环境	https://dev-api.jushuitan.com/open/shops/query
    //jstURL: "https://openapi.jushuitan.com",
    jstURL: "https://openapi.jushuitan.com",
};


/************************************************************************
 * 聚水潭 通用 api 签名函数
 ************************************************************************/
function CommonSign(apiParams, app_secret) {
    /** 通用 md5 签名函数 */
    const shasum = crypto.createHash('md5');
    if (apiParams == null || !(apiParams instanceof Object)) {
        return "";
    }

    /** 获取 apiParms中的key 去除 sign key,并排序 */
    let sortedKeys = Object.keys(apiParams).filter((item) => item !== "sign").sort();
    /** 排序后字符串 */
    let sortedParamStr = "";
    // 拼接字符串参数
    sortedKeys.forEach(function (key, index, ary) {
        let keyValue = apiParams[key];
        if (keyValue instanceof Object) keyValue = JSON.stringify(keyValue);
        if (key != "sign" && keyValue != null && keyValue != "") {
            sortedParamStr += `${key}${keyValue}`;
        }
    });
    /** 拼接加密字符串 */
    let paraStr = app_secret + sortedParamStr;

    // https://openweb.jushuitan.com/doc?docId=140&name=API%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7
    console.info(`待加密字符串,可与官网测试工具对比：`, paraStr);

    shasum.update(paraStr);
    let sign = apiParams.sign = shasum.digest('hex');
    return sign;
}


async function CallJSTAPI(apiPath, bizParam) {
    /** api参数拼接 */
    const apiParams = {
        // access_token	String	必填 通过code获取的access_token
        access_token: jstConfig.access_token,
        // app_key	String	必填 POP分配给应用的app_key
        app_key: jstConfig.app_key,
        // timestamp	Long	必填 UNIX时间戳，单位秒，需要与聚水潭服务器时间差值在10分钟内
        timestamp: Math.floor(new Date().getTime() / 1000), //当前时间戳
        // charset	String	必填 字符编码（固定值：utf-8）
        charset: "UTF-8",
        // version	String	必填 版本号，固定传2
        version: "2",
        // 签名字符串
        sign: "",
        // 业务参数
        biz: bizParam,
    }
    // 刷新token
    /* const apiParams = {
        app_key: jstConfig.app_key,
        timestamp: Math.floor(new Date().getTime() / 1000), //当前时间戳
        grant_type: "refresh_token",
        charset: "UTF-8",
        refresh_token: "fb02ef5b7b604126996cb3bcbb0a02bd",
        scope: "all",
        sign: ""
    } */
    /* // 新获取token
    const apiParams = {
        app_key: jstConfig.app_key,
        timestamp: Math.floor(new Date().getTime() / 1000), //当前时间戳
        grant_type: "authorization_code",
        charset: "UTF-8",
        code: "4xFIOC",
        sign: ""
    } */
    /** apiURL */
    const apiUrl = `${jstConfig.jstURL}/${apiPath}`;
    CommonSign(apiParams, jstConfig.app_secret);

    try {

        console.info(`POST url:`, apiUrl);// 非调试时,可注释
        console.info(`请求参数JSON:`, JSON.stringify(apiParams));

        // URLSearchParams 转字符串时,会自动做 urlEncode
        const params = new URLSearchParams();
        for (let key in apiParams) {
            let keyValue = apiParams[key];
            if (keyValue instanceof Object) keyValue = JSON.stringify(keyValue);
            params.append(key, keyValue);
        }

        console.info(`x-www-form-urlencoded参数:`, params.toString());

        /** 发送请求 */
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            }
        });
        /** 返回结果 */
        const jsonReponse = await response.json();
        console.info(`聚水潭回复:`, JSON.stringify(jsonReponse));

    } catch (error) {
        console.info(error.message, error.stack);
    }

}

exports.CallJSTAPI = CallJSTAPI;
