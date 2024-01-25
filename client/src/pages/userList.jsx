import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Select, Popconfirm, message, Alert } from 'antd';
import { PlusOutlined, PauseCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';
import { company, department, position } from '../baseData/user'
import AEUser from '../components/modals/AEUser'

function UserList() {
    // 操作权限
    const editPower = localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
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
                <Space size={'middle'}>
                    {record.status === '正常' ? <PauseCircleTwoTone twoToneColor="#4ec9b0" /> : <ExclamationCircleTwoTone twoToneColor="#f81d22" />}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                editPower ? <Space size="middle">
                    <a onClick={() => {
                        let combine = [record.company, record.department, record.position]
                        form.setFieldsValue({
                            ...record,
                            combine
                        })
                        setType('edit');
                        setIsShow(true);
                    }}>修改信息</a>
                    {record.status === '正常' ? <a onClick={() => {
                        let payload = {
                            uid: record.uid,
                            type: false
                        }
                        editUserStatusAPI(payload);
                    }}>禁用</a> : <a onClick={() => {
                        let payload = {
                            uid: record.uid,
                            type: true
                        }
                        editUserStatusAPI(payload);
                    }}>恢复正常</a>}
                    <Popconfirm
                        title="确认要删除该用户吗"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => {
                            let payload = {
                                uid: record.uid,
                                name: record.name
                            }
                            deleteUserAPI(payload);
                        }}
                    >
                        <a>删除</a>
                    </Popconfirm>
                </Space> : null
            ),
        }
    ]
    // 表格：获取数据、分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filtersDate: [],
        filters: {},
        pagination: {
            current: 1,
            pageSize: 10,
            showTotal: ((total) => {
                return `共 ${total} 条`;
            }),
        }
    });
    const getUserListAPI = () => {
        setLoading(true);
        request({
            method: 'post',
            url: '/user/getUserList',
            data: {
                filters: tableParams.filters,
                pagination: {
                    current: tableParams.pagination.current - 1,
                    pageSize: tableParams.pagination.pageSize,
                },
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    e_id: localStorage.getItem('e_id'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
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
            pagination: {
                ...tableParams.pagination,
                ...pagination
            },
            filters: tableParams.filters,
            filtersDate: tableParams.filtersDate,
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }
    // 查询、清空筛选
    const [filterForm] = Form.useForm()

    // 用户：添加、修改、删除
    const [type, setType] = useState(false)
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()
    const addUserAPI = (payload) => {
        request({
            method: 'post',
            url: '/user/addUser',
            data: {
                ...payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    e_id: localStorage.getItem('e_id'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setIsShow(false);
                    form.resetFields();
                    getUserListAPI();
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
    }
    const editUserAPI = (payload) => {
        request({
            method: 'post',
            url: '/user/editUser',
            data: {
                ...payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    e_id: localStorage.getItem('e_id'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setIsShow(false)
                    getUserListAPI();
                    form.resetFields();
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
    }
    const editUserStatusAPI = (payload) => {
        request({
            method: 'post',
            url: '/user/editUserStatus',
            data: {
                ...payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    e_id: localStorage.getItem('e_id'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    getUserListAPI();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const deleteUserAPI = (payload) => {
        request({
            method: 'post',
            url: '/user/deleteUser',
            data: {
                ...payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    e_id: localStorage.getItem('e_id'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    getUserListAPI();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    }

    useEffect(() => {
        if (localStorage.getItem('uid') && localStorage.getItem('uid') === null) {
            navigate('/login')
            message.error('账号错误，请重新登录')
        }
        getUserListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="用户列表"
                extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setType('add'); setIsShow(true); }}>添加新用户</Button> : null}
            >
                <Form layout="inline" form={filterForm}
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            pagination: {
                                ...tableParams.pagination,
                                current: 1
                            },
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='编号' name='uid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='姓名' name='name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='手机号' name='phone' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='公司' name='company' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={company} />
                    </Form.Item>
                    <Form.Item label='部门' name='department' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={department} />
                    </Form.Item>
                    <Form.Item label='职位' name='position' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={position} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: '20px' }}>
                        <Space size={'middle'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                filterForm.resetFields();
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
            <AEUser
                type={type}
                isShow={isShow}
                form={form}
                onOK={(values) => { type === 'add' ? addUserAPI(values) : editUserAPI(values) }}
                onCancel={() => { setIsShow(false); form.resetFields(); }}
            />
        </Fragment>
    )
}

export default UserList