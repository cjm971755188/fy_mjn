import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Select, Radio, InputNumber } from 'antd';
import { middleType } from '../../baseData/talent'

function AEMiddleman(props) {
    const { isShow, type, form } = props;

    const [payWay, setPayWay] = useState()
    const [canPiao, setCanPiao] = useState()
    const [piaoType, setPiaoType] = useState()

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
            onCancel={() => { props.onCancel(); setPayWay(); setCanPiao(); setPiaoType(); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values) }}>
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
                <Form.Item label="联系人电话" name="liaison_phone" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="付款方式" name="pay_way" rules={[{ required: true, message: '不能为空' }]}>
                    <Radio.Group onChange={(e) => { setPayWay(e.target.value); }} value={payWay}>
                        <Radio value={'对公'}>对公</Radio>
                        <Radio value={'对私'}>对私</Radio>
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
                            <InputNumber placeholder="请输入" />
                        </Form.Item></> : null}</> : null}
                <Form.Item label="收款姓名" name="pay_name" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="开户行" name="pay_bank" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="收款账号" name="pay_account" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AEMiddleman