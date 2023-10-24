import React, { useState } from "react";
import { Card, Table, Form, Input, Modal, message } from 'antd';

const columns = [
    {
        title: '编号',
        dataIndex: 'key',
        key: 'key',
    },
    {
        title: '职位名称',
        dataIndex: 'position',
        key: 'position',
    }
]

const data = [
    {
        key: '1',
        position: '老板'
    }
]

function UserList() {
    const [isShow, setIsShow] = useState(false)
    const [addForm] = Form.useForm()

    return (
        <div>
            <Card
                title="职位列表"
            /*
            extra={
                <div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true) }}>
                        添加新职位
                    </Button>
                </div>
            }
            <Form layout="inline">
                <Form.Item label='职位'>
                    <Input />
                </Form.Item>
                <Button type="primary" icon={<SearchOutlined />}>
                    搜索
                </Button>
            </Form>
            */
            >
                <Table columns={columns} dataSource={data} style={{ margin: '20px auto' }} />
            </Card>
            <Modal
                title='添加新职位'
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
                        label="职位名称"
                        name="nickname"
                        rules={[
                            {
                                required: true,
                                message: '职位名称不能为空！',
                            },
                        ]}
                    >
                        <Input placeholder="请输入职位名称" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default UserList