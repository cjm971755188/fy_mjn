import React, { useState } from "react";
import { Card, Button, Table, Tag, Space, Form, Input, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const columns = [
    {
        title: '序号',
        dataIndex: 'key',
        key: 'key',
    },
    {
        title: '头像',
        dataIndex: 'pic',
        key: 'pic',
    },
    {
        title: '达人昵称',
        dataIndex: 'nickname',
        key: 'nickname',
    },
    {
        title: '类型',
        dataIndex: 'account_type',
        key: 'account_type',
    },
    {
        title: '主攻',
        dataIndex: 'attack',
        key: 'attack',
    },
    {
        title: '分类',
        dataIndex: 'class',
        key: 'class',
    },
    {
        title: '中间方',
        dataIndex: 'middleman',
        key: 'middleman',
    },
    {
        title: '年框',
        dataIndex: 'yearBox',
        key: 'yearBox',
    },
    {
        title: '操作',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <a>查看详情</a>
                <a>移交</a>
                <a>删除</a>
            </Space>
        ),
    },
]

const data = [
    {
        key: '1',
        pic: '',
        nickname: '点点',
        account_type: '服饰/衣帽',
        attack: '专场',
        class: 'A类',
        middleman: '爱逛',
        yearBox: '是',
        tags: ['nice', 'developer'],
    }
]

function TalentList() {
    const [isShow, setIsShow] = useState(false)
    const [addForm] = Form.useForm()
    return (
        <div>
            <Card
                title="达人列表"
                extra={
                    <div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true) }}>
                            添加新达人
                        </Button>
                    </div>
                }
            >
                <Form layout="inline">
                    <Form.Item label='达人昵称'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='类型'>
                        <Input />
                    </Form.Item>
                    <Button type="primary" icon={<SearchOutlined />}>
                        搜索
                    </Button>
                </Form>
                <Table columns={columns} dataSource={data} style={{ margin: '20px auto' }} />
            </Card>
            <Modal
                title='添加新达人'
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
                        label="达人昵称"
                        name="nickname"
                        rules={[
                            {
                                required: true,
                                message: '达人昵称不能为空！',
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

export default TalentList