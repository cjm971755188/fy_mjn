import React, { useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Modal, Button, Select, Switch, Popconfirm, Cascader, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { company, department, position, combine } from '../baseData/user'

function UserList() {
    const columns = [
        { title: '编号', dataIndex: 'uid', key: 'uid' },
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '手机号', dataIndex: 'phone', key: 'phone' },
        { title: '公司', dataIndex: 'company', key: 'company' },
        { title: '部门', dataIndex: 'department', key: 'department' },
        { title: '职位', dataIndex: 'position', key: 'position' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Switch
                    defaultChecked={() => {
                        if (record.status == '1') {
                            return true
                        } else {
                            return false
                        }
                    }}
                    onChange={(checked) => {
                        request({
                            method: 'post',
                            url: '/user/editUserStatus',
                            data: {
                                uid: record.uid,
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
                        let combine = [ record.company, record.department, record.position ]
                        editForm.setFieldsValue({
                            ...record,
                            combine
                        })
                        setIsShowEdit(true)
                    }}>修改信息</a>
                    <Popconfirm
                        title="确认要删除该用户吗"
                        onConfirm={() => {
                            request({
                                method: 'post',
                                url: '/user/deleteUser',
                                data: {
                                    uid: record.uid,
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
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const fetchData = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/user/getUserList',
            data: {
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                },
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

    // 添加新用户
    const [isShowAdd, setIsShowAdd] = useState(false)
    const [addForm] = Form.useForm()

    // 修改用户信息
    const [isShowEdit, setIsShowEdit] = useState(false)
    const [editForm] = Form.useForm()

    // 查询、清空筛选
    const [selectForm] = Form.useForm()

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
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='编号' name='uid' style={{marginBottom: '20px'}}><Input /></Form.Item>
                    <Form.Item label='姓名' name='name' style={{marginBottom: '20px'}}><Input /></Form.Item>
                    <Form.Item label='手机号' name='phone' style={{marginBottom: '20px'}}><Input /></Form.Item>
                    <Form.Item label='公司' name='company' style={{marginBottom: '20px'}}>
                        <Select style={{ width: 160 }} options={company} />
                    </Form.Item>
                    <Form.Item label='部门' name='department' style={{marginBottom: '20px'}}>
                        <Select style={{ width: 160 }} options={department} />
                    </Form.Item>
                    <Form.Item label='职位' name='position' style={{marginBottom: '20px'}}>
                        <Select style={{ width: 160 }} options={position} />
                    </Form.Item>
                    <Form.Item>
                        <Space size={'middle'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                selectForm.resetFields();
                                setTableParams({
                                    ...tableParams,
                                    filters: {}
                                })
                            }}>清空筛选</Button>
                        </Space>
                    </Form.Item>
                </Form>
                <Table
                    style={{ margin: '20px auto' }}
                    rowKey={(data) => data.uid}
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
                    onFinish={(values) => {
                        request({
                            method: 'post',
                            url: '/user/addUser',
                            data: values
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
                    <Form.Item label="姓名" name="name" rules={[ { required: true, message: '不能为空' } ]}>
                        <Input placeholder="请输入新用户姓名" />
                    </Form.Item>
                    <Form.Item label="手机号（钉钉）" name="phone" rules={[ { required: true, message: '不能为空' } ]}>
                        <Input placeholder="请输入新用户手机号" />
                    </Form.Item>
                    <Form.Item label="岗位" name="combine" rules={[ { required: true, message: '不能为空' } ]}>
                        <Cascader options={combine} placeholder="请选择该用户岗位" />
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
                    onFinish={(values) => {
                        request({
                            method: 'post',
                            url: '/user/editUser',
                            data: values
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
                    <Form.Item label="编号" name="uid" rules={[{ required: true }]}>
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="姓名" name="name" rules={[ { required: true, message: '姓名不能为空' } ]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="手机号" name="phone" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="岗位" name="combine" rules={[ { required: true, message: '岗位不能为空' } ]}>
                        <Cascader options={combine} placeholder="请选择该用户岗位" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default UserList