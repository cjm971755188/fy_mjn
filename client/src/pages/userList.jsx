import React, { useState } from "react";
import { Card, Button, Table, Tag, Space, Form, Input, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import UpLoadImg from '../components/upLoadImg.jsx'

const columns = [
    {
        title: '编号',
        dataIndex: 'key',
        key: 'key',
    },
    {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '职位',
        dataIndex: 'position',
        key: 'position',
    },
    {
        title: '操作',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <a>删除</a>
            </Space>
        ),
    },
]

const data = [
    {
        key: 'MJN0001',
        name: '周勇飞',
        position: '老板'
    }
]

function UserList() {
    const [isShow, setIsShow] = useState(false)
    const [addForm] = Form.useForm()
    return (
        <div>
            <Card
                title="用户列表"
                extra={
                    <div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true) }}>
                            添加新用户
                        </Button>
                    </div>
                }
            >
                <Form layout="inline">
                    <Form.Item label='编号'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='姓名'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='职位'>
                        <Input />
                    </Form.Item>
                    <Button type="primary" icon={<SearchOutlined />}>
                        搜索
                    </Button>
                </Form>
                <Table columns={columns} dataSource={data} style={{ margin: '20px auto' }} />
            </Card>
            <Modal
                title='添加新用户'
                open={isShow}
                maskClosable={false}
                onOk={() => {
                    addForm.submit()
                }}
                onCancel={() => setIsShow(false)}
            >
                <Form
                    form={addForm}
                    onFinish={(n) => {
                        console.log(n)
                        message.success('success: addForm submit')
                    }}
                >
                    <Form.Item
                        label="姓名"
                        name="nickname"
                        rules={[
                            {
                                required: true,
                                message: '姓名不能为空！',
                            },
                        ]}
                    >
                        <Input placeholder="请输入姓名" />
                    </Form.Item>
                    <Form.Item
                        label="职位"
                        name="nickname"
                        rules={[
                            {
                                required: true,
                                message: '职位不能为空！',
                            },
                        ]}
                    >
                        <Input placeholder="请输入达人昵称（内部统称）" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default UserList