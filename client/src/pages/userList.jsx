import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import request from '../service/request'

const columns = [
    {
        title: '编号',
        dataIndex: 'u_id',
        key: 'u_id',
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
    }
]

function UserList() {
    const [isShow, setIsShow] = useState(false)
    const [addForm] = Form.useForm()
    const [selectForm] = Form.useForm()

    // 传入数据，分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filters: {},
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const fetchData = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/user/getUserList',
            data: {
                filters: tableParams.filters,
                pagination: {
                    current: tableParams.pagination.current - 1,
                    pageSize: tableParams.pagination.pageSize,
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                setData(res.data.data)
                setLoading(false)
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: res.data.pagination.total,
                    },
                })
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });

        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }

    // 获取所有职位
    const [positionData, setPositionData] = useState();
    const [loadingSelect, setLoadingSelect] = useState(false);
    const getPositionData = () => {
        setLoadingSelect(true)
        request({
            method: 'post',
            url: '/user/getAllPosition',
            data: {}
        }).then((res) => {
            console.log('res.data.data: ', res.data.data);
            if (res.status == 200) {
                setPositionData(res.data.data)
                setLoadingSelect(false)
            }
        }).catch((err) => {
            console.error(err)
        })
    };

    // 查询、清空筛选
    const onFinish = (values) => {
        setTableParams({
            ...tableParams,
            filters: values
        })
    };

    const onReset = () => {
        selectForm.resetFields();
        setTableParams({
            ...tableParams,
            filters: {}
        })
    };

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card
                title="职位列表"
                extra={
                    <div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true) }}>
                            添加新用户
                        </Button>
                    </div>
                }
            >
                <Form
                    layout="inline"
                    form={selectForm}
                    onFinish={onFinish}
                >
                    <Form.Item label='编号' name='u_id'><Input /></Form.Item>
                    <Form.Item label='姓名' name='name'><Input /></Form.Item>
                    <Form.Item label='职位' name='up_id'>
                        <Select
                            style={{ width: 160 }}
                            loading={loadingSelect}
                            options={positionData}
                            onFocus={getPositionData}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space size={'middle'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={onReset}>清空筛选</Button>
                        </Space>
                        
                    </Form.Item>
                </Form>
                <Table
                    style={{ margin: '20px auto' }}
                    rowKey={(data) => data.u_id}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
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