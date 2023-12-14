import React from "react";
import { Form, Input, Modal, Cascader } from 'antd';
import { combine } from '../../baseData/user'

function AEUser(props) {
    const { type, isShow, form } = props;

    return (
        <Modal
            title={type === 'add' ? "添加新用户" : "修改用户信息"}
            open={isShow}
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values); }}>
                {type === 'add' ? null : <Form.Item label="编号" name="uid" rules={[{ required: true }]}>
                    <Input disabled={true} />
                </Form.Item>}
                <Form.Item label="姓名" name="name" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="手机号（钉钉）" name="phone" rules={[{ required: true, message: '不能为空' }, { len: 11, message: '手机号长度需11位' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号错误' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="岗位" name="combine" rules={[{ required: true, message: '不能为空' }]}>
                    <Cascader options={combine} placeholder="请选择" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AEUser