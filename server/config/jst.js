// 类型定义
const orderStatus = [
    { value: "WaitPay", label: "待付款" },
    { value: "WaitFConfirm", label: "等待财务审核" },
    { value: "Delivering", label: "发货中" },
    { value: "WaitOuterSent", label: "等待外仓发货" },
    { value: "Sent", label: "已发货" },
    { value: "OuterSent", label: "外仓发货" },
    { value: "Merged", label: "被合并" },
    { value: "Cancelled", label: "用户取消订单" },
    { value: "Replaced", label: "被替换（明细）" },
    { value: "Split", label: "被拆分" },
    { value: "Delete", label: "删除" },
    { value: "Lock", label: "锁定" },
    { value: "SentCancelled", label: "发货后取消" },
    { value: "Question", label: "异常" },
    { value: "WaitConfirm", label: "已付款待审核" }
]

const refundStatus = [
    { value: "none", label: "未申请" },
    { value: "waiting", label: "退款中" },
    { value: "success", label: "退款成功" },
    { value: "closed", label: "退款关闭" }
]

const skuType = [
    { value: "normal", label: "普通商品" },
    { value: "combine", label: "组合装商品" },
    { value: "no_deliver", label: "不发货" }
]

// 去除字符串中的表情
function filterNicknameWithEmoj(nickname){
    var regStr = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
    var nickname_filter="";
    //regStr.test(nickname)会一次成功一次失败，待排查是否和regStr写法有关
    if(regStr.test(nickname)){
        nickname_filter = nickname.replace(regStr,"");
        nickname_filter = removeBlank(nickname_filter);
        return nickname_filter;
    }
    return nickname;
}
 
function removeBlank(str){
    str = str.trim();
    var ret = "";
    for(var i = 0; i < str.length; i++){
        if(str[i] != ' '){
            ret+=str[i];
        }
    }
    return ret;
}

module.exports = { orderStatus, refundStatus, skuType, filterNicknameWithEmoj }