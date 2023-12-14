import React from "react";
import { Form, Input, Modal, Select } from 'antd';
import { liaisonType } from '../../baseData/talent'
import UpLoadImg from '../UpLoadImg'

function AELiaison(props) {
    const { type, isShow, form } = props;

    return (
        <Modal
            title={type === 'advance' ? '推进商机' : type.match('edit') ? '修改联系人' : ''}
            open={isShow}
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values); }}>
                {type !== 'edit_talent' ? <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '不能为空' }]}>
                    <Input disabled={true} />
                </Form.Item> : null}
                {type === 'edit_talent' ? <Form.Item label="达人编号" name="tid" rules={[{ required: true, message: '不能为空' }]}>
                    <Input disabled={true} />
                </Form.Item> : null}
                <Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '不能为空' }]}>
                    <Select
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="请选择"
                        onChange={(value) => { form.setFieldValue('liaison_type', value) }}
                        options={liaisonType}
                    />
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
                <Form.Item label="沟通群名称" name="crowd_name" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                {type == 'advance' ? <Form.Item label="发货盘证明" name="advance_pic" rules={[{ required: true, message: '不能为空' }]} >
                    <UpLoadImg title="发货盘证明" name="推进商机" setPicUrl={(value) => { form.setFieldValue('advance_pic', value) }} />
                </Form.Item> : null}
            </Form>
        </Modal>
    )
}

export default AELiaison