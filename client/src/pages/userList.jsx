import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Select, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import request from '../service/request'

function UserList() {
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
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Switch
                    defaultChecked={() => {
                        if (record.status == '正常') {
                            return true
                        } else {
                            return false
                        }
                    }}
                    onChange={(checked, e) => {
                        request({
                            method: 'post',
                            url: '/user/editUserStatus',
                            data: {
                                u_id: record.u_id,
                                checked: checked
                            }
                        }).then((res) => {
                            if (res.status == 200) {
                                if (res.data.code == 200) {
                                    fetchData();
                                    message.success(res.data.msg)
                                } else {
                                    message.error(res.data.msg)
                                }
                            }
                        }).catch((err) => {
                            console.error(err)
                        })
                    }}
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => {
                        editForm.setFieldsValue(record)
                        setIsShowEdit(true)
                    }}>修改</a>
                    <Popconfirm
                        title="确认要删除改用户吗"
                        onConfirm={() => {
                            request({
                                method: 'post',
                                url: '/user/deleteUser',
                                data: {
                                    u_id: record.u_id,
                                    name: record.name,
                                }
                            }).then((res) => {
                                if (res.status == 200) {
                                    if (res.data.code == 200) {
                                        fetchData();
                                        message.success(res.data.msg)
                                    } else {
                                        message.error(res.data.msg)
                                    }
                                }
                            }).catch((err) => {
                                console.error(err)
                            })
                        }}
                        onCancel={() => { }}
                        okText="删除"
                        cancelText="取消"
                    >
                        <a onClick={() => { }}>删除</a>
                    </Popconfirm>
                </Space>
            ),
        }
    ]

    // 传入数据，分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filters: {},
        pagination: {}
    });
    const fetchData = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/user/getUserList',
            data: {
                up_id: localStorage.getItem('up_id'),
                filters: tableParams.filters,
                pagination: {
                    current: tableParams.pagination.current - 1,
                    pageSize: tableParams.pagination.pageSize,
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setData(res.data.data)
                    setLoading(false)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: res.data.pagination.total,
                        },
                })
                } else {
                    message.error(res.data.msg)
                }
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
            data: {
                up_id: localStorage.getItem('up_id')
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setPositionData(res.data.data)
                    setLoadingSelect(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };

    // 查询、清空筛选
    const [selectForm] = Form.useForm()
    const onFinish = (values) => {
        setTableParams({
            ...tableParams,
            filters: values
        })
    };

    const onResetSelect = () => {
        selectForm.resetFields();
        setTableParams({
            ...tableParams,
            filters: {}
        })
    };

    // 添加新用户
    const [isShowAdd, setIsShowAdd] = useState(false)
    const [addForm] = Form.useForm()

    // 修改用户信息
    const [isShowEdit, setIsShowEdit] = useState(false)
    const [editForm] = Form.useForm()

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card
                title="用户列表"
                extra={
                    <div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShowAdd(true) }}>
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
                            <Button type="primary" onClick={onResetSelect}>清空筛选</Button>
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
                title='添加新用户'
                open={isShowAdd}
                maskClosable={false}
                onOk={() => { addForm.submit() }}
                onCancel={() => setIsShowAdd(false)}
            >
                <Form
                    form={addForm}
                    onFinish={(n) => {
                        request({
                            method: 'post',
                            url: '/user/addUser',
                            data: n
                        }).then((res) => {
                            if (res.status == 200) {
                                if (res.data.code == 200) {
                                    setIsShowAdd(false)
                                    addForm.resetFields();
                                    fetchData();
                                    message.success(res.data.msg)
                                } else {
                                    message.error(res.data.msg)
                                }
                            } else {
                                message.error(res.data.msg)
                            }
                        }).catch((err) => {
                            console.error(err)
                        })
                    }}
                >
                    <Form.Item
                        label="姓名"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: '姓名不能为空',
                            },
                        ]}
                    >
                        <Input placeholder="请输入新用户姓名" />
                    </Form.Item>
                    <Form.Item
                        label="职位"
                        name="up_id"
                        rules={[
                            {
                                required: true,
                                message: '职位不能为空！',
                            },
                        ]}
                    >
                        <Select
                            loading={loadingSelect}
                            options={positionData}
                            onFocus={getPositionData}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title='修改用户信息'
                open={isShowEdit}
                maskClosable={false}
                onOk={() => { editForm.submit() }}
                onCancel={() => { setIsShowEdit(false) }}
            >
                <Form
                    form={editForm}
                    onFinish={(n) => {
                        request({
                            method: 'post',
                            url: '/user/editUser',
                            data: n
                        }).then((res) => {
                            if (res.status == 200) {
                                if (res.data.code == 200) {
                                    setIsShowEdit(false)
                                    editForm.resetFields();
                                    fetchData();
                                    message.success(res.data.msg)
                                } else {
                                    message.error(res.data.msg)
                                }
                            } else {
                                message.error(res.data.msg)
                            }
                        }).catch((err) => {
                            console.error(err)
                        })
                    }}
                >
                    <Form.Item
                        label="编号"
                        name="u_id"
                        rules={[{ required: true }]}
                    >
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item
                        label="姓名"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: '姓名不能为空',
                            },
                        ]}
                    >
                        <Input placeholder="请输入新用户姓名" />
                    </Form.Item>
                    <Form.Item
                        label="职位"
                        name="position"
                        rules={[
                            {
                                required: true,
                                message: '职位不能为空！',
                            },
                        ]}
                    >
                        <Select
                            loading={loadingSelect}
                            options={positionData}
                            onFocus={getPositionData}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default UserList