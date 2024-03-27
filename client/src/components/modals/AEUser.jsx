import React, { useState, useEffect } from "react";
import request from '../../service/request'
import { Form, Input, Modal, Cascader } from 'antd';
import { combine } from '../../baseData/user'

function AEUser(props) {
    const { type, isShow, form } = props;

    const getSalemanItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getSalemanItems',
            data: {
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    up_uid: localStorage.getItem('up_uid'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    let _combine = combine
                    for (let i = 0; i < _combine.length; i++) {
                        for (let j = 0; j < _combine[i].children.length; j++) {
                            if (_combine[i].children[j].label === '事业部') {
                                for (let k = 0; k < _combine[i].children[j].children.length; k++) {
                                    if (_combine[i].children[j].children[k].label === '助理') {
                                        _combine[i].children[j].children[k]['children'] = res.data.data
                                    }
                                }
                            }
                        }
                    }
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.data.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }

    useEffect(() => {
        getSalemanItemsAPI();
    }, [isShow])
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