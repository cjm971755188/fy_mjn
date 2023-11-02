const jstApi = require('../config/CallJSTAPI');
const { orderStatus, refundStatus, skuType, filterNicknameWithEmoj } = require('../config/jst');
const db = require('../config/db');

const getOrders = () => {
    jstApi.CallJSTAPI("/open/orders/single/query", {
        "date_type": 2,
        "modified_begin": "2023-11-02 00:00:00",
        "modified_end": "2023-11-03 00:00:00",
        "page_index": 1,
        "page_size": 50,
        "order_item_flds": ["src_combine_sku_id", "referrer_name", "presale_date"]
    }).then((res) => {
        if (res.code === 0) {
            orders = res.data.orders
            let data = []
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                for (let j = 0; j < order.items.length; j++) {
                    const item = order.items[j];
                    if (['Merged', 'Cancelled', 'Replaced'].indexOf(item.item_status) === -1) {
                        let temp = {
                            "oid": `${item.raw_so_id}_${item.sku_id}`,
                            "innerID": order.o_id,
                            "mergeOrderID": order.merge_so_id == null ? "" : order.merge_so_id,
                            "orderID": item.raw_so_id,
                            "orderDate": order.order_date,
                            "payDate": order.pay_date,
                            "sendDate": order.send_date,
                            "platform": order.shop_site,
                            "store": order.shop_name,
                            "linkName": filterNicknameWithEmoj(item.name),
                            "talent": item.referrer_name,
                            "orderType": order.type,
                            "orderState": item.item_status == null ? order.status == null ? "未发货" : order.status : item.item_status,
                            "refundState": item.refund_status == null ? "未申请" : item.refund_status,
                            "expressCompany": order.logistics_company,
                            "expressID": order.l_id,
                            "productID": item.sku_id,
                            "productPic": item.pic,
                            "productType": item.sku_type,
                            "isPresale": item.is_presale ? "预售" : "现货",
                            "basePrice": item.base_price,
                            "count": item.qty,
                            "price": item.amount,
                            "commissionPoint": null
                        }
                        for (let k = 0; k < orderStatus.length; k++) {
                            const element = orderStatus[k];
                            if (element.value == temp.orderState) {
                                temp.orderState = element.label
                            }
                        }
                        for (let k = 0; k < refundStatus.length; k++) {
                            const element = refundStatus[k];
                            if (element.value == temp.refundState) {
                                temp.refundState = element.label
                            }
                        }
                        for (let k = 0; k < skuType.length; k++) {
                            const element = skuType[k];
                            if (element.value == temp.productType) {
                                temp.productType = element.label
                            }
                        }
                        if (item.item_ext_data) {
                            let item_ext_data = JSON.parse(item.item_ext_data)
                            if (item_ext_data.commission_rate) {
                                temp.commissionPoint = item_ext_data.commission_rate / 1000
                            }
                        }
                        let o = Object.values(temp)
                        data.push(o)
                    }
                }
            }
            if (data.length !== 0) {
                let sql = `REPLACE INTO orders VALUES ?`
                db.query(sql, [data], (err, results) => {
                    if (err) throw err;
                    console.log(`导入 ${data.length} 条数据`);
                });
            }
        } else {
            console.log('error: ', res.msg);
        }
    })
};

module.exports = getOrders