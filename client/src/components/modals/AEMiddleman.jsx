import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Select, Radio, InputNumber, message } from 'antd';
import { middleType } from '../../baseData/talent'

function AEMiddleman(props) {
    const { isShow, type, form } = props;

    const [payWay, setPayWay] = useState()
    const [canPiao, setCanPiao] = useState()
    const [piaoType, setPiaoType] = useState()

    // 重置
    const reset = () => {
        setPayWay(false);
        setCanPiao(false);
        setPiaoType(false);
    }

    useEffect(() => {
        setPayWay(form.getFieldValue('pay_way'))
        setCanPiao(form.getFieldValue('can_piao'))
        setPiaoType(form.getFieldValue('piao_type'))
    }, [isShow])
    return (
        <Modal
            title={type === 'add' ? '添加新中间人' : '修改中间人信息'}
            open={isShow}
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); reset(); }}
        >
            <Form form={form} onFinish={(values) => {
                if (values.pay_bank === '支付宝') {
                    props.onOK(values);
                    reset();
                } else if (values.pay_bank && !values.pay_bank.match('银行')) {
                    message.error('请填写正确的银行名称')
                } else if (values.pay_bank && values.pay_bank.split('银行')[1] === '') {
                    message.error('请填写到xx银行xx支行')
                } else {
                    props.onOK(values);
                    reset();
                }
            }}>
                {type === 'edit' ? <Form.Item label="编号" name="mid" rules={[{ required: true, message: '不能为空' }]}>
                    <Input disabled={true} />
                </Form.Item> : null}
                <Form.Item label="类型" name="type" rules={[{ required: true, message: '不能为空' }]}>
                    <Select placeholder="请选择" options={middleType} />
                </Form.Item>
                <Form.Item label="中间人名称" name="name" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="联系人微信" name="liaison_v" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="联系人手机号" name="liaison_phone" rules={[{ len: 11, message: '手机号长度需11位' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号错误' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="付款方式" name="pay_way" rules={[{ required: true, message: '不能为空' }]}>
                    <Radio.Group onChange={(e) => { setPayWay(e.target.value); }} value={payWay}>
                        <Radio value={'对公'}>对公</Radio>
                        <Radio value={'对私'}>对私</Radio>
                        <Radio value={'线上结算'}>线上结算</Radio>
                    </Radio.Group>
                </Form.Item>
                {payWay === '对公' ? <><Form.Item label="能否开票" name="can_piao" rules={[{ required: true, message: '不能为空' }]}>
                    <Radio.Group onChange={(e) => { setCanPiao(e.target.value); }} value={canPiao}>
                        <Radio value={'能'}>能</Radio>
                        <Radio value={'不能'}>不能</Radio>
                    </Radio.Group>
                </Form.Item>
                    {canPiao === '能' ? <><Form.Item label="票型" name="piao_type" rules={[{ required: true, message: '不能为空' }]}>
                        <Radio.Group onChange={(e) => { setPiaoType(e.target.value); }} value={piaoType}>
                            <Radio value={'专票'}>专票</Radio>
                            <Radio value={'普票'}>普票</Radio>
                        </Radio.Group>
                    </Form.Item>
                        <Form.Item label="税点（%）" name="shui_point" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" min={0} max={100} />
                        </Form.Item></> : null}</> : null}
                {payWay === '线上结算' ? null : <><Form.Item label="收款姓名" name="pay_name" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="开户行/“支付宝”" name="pay_bank" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="收款账号" name="pay_account" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item></>}
            </Form>
        </Modal>
    )
}

export default AEMiddleman