import React, { useEffect, useState } from "react";
import { Card, Space, Form, Input, Modal, Button, Image, List, Select, message } from 'antd';
import { model, platform, liaisonType } from '../../baseData/talent'
import people from '../../assets/people.jpg'
import UpLoadImg from '../UpLoadImg'

function AEAChance(props) {
    const { type, isShow, form } = props;

    return (
        <Modal
            title={type == 'advance' ? '推进商机' : type == 'edit' ? '修改联系人' : ''}
            open={isShow}
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values); }}>
                {type == 'advance' ? <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '不能为空' }]}>
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
                <Form.Item label="联系人电话（选填）" name="liaison_phone">
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="沟通群名称" name="crowd_name" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                {type == 'advance' ? <Form.Item label="发货盘证明" name="advance_pic" rules={[{ required: true, message: '不能为空' }]} >
                    <UpLoadImg title="发货盘证明" name="advance_pic" setPicUrl={(value) => { form.setFieldValue('advance_pic', value) }} />
                </Form.Item> : null}
            </Form>
        </Modal>
    )
}

export default AEAChance