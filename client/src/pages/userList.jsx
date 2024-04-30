import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Select, Popconfirm, message, Modal, Cascader } from 'antd';
import { PlusOutlined, PauseCircleTwoTone } from '@ant-design/icons';
import { company, department, position, combine } from '../baseData/user'

function UserList() {
    // 操作权限
    const editPower = localStorage.getItem('position') === '管理员' || localStorage.getItem('position') === '总裁' || localStorage.getItem('position') === '副总' ? true : false

    // 表格：格式
    const columns = [
        { title: '编号', dataIndex: 'uid', key: 'uid' },
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '手机号', dataIndex: 'phone', key: 'phone' },
        { title: '公司', dataIndex: 'company', key: 'company' },
        { title: '部门', dataIndex: 'department', key: 'department' },
        { title: '职位', dataIndex: 'position', key: 'position' },
        { title: '上级商务', dataIndex: 'up_name', key: 'up_name' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size={'middle'}><PauseCircleTwoTone twoToneColor="#4ec9b0" /><span>{record.status}</span></Space>
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
            } else {
                message.error(res.msg)
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
                    setIsShow(false);
                    form.resetFields();
                    getUserListAPI();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
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
                    setIsShow(false)
                    getUserListAPI();
                    form.resetFields();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
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
                    getUserListAPI();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    // 获取下拉框
    const getSalemanItems = () => {
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
                message.error(res.msg)
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
                <Form
                    layout="inline"
                    form={filterForm}
                    wrapperCol={{ style: { width: '120px', marginBottom: '20px' } }}
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
                    <Form.Item label='编号' name='uid'><Input /></Form.Item>
                    <Form.Item label='姓名' name='name'><Input /></Form.Item>
                    <Form.Item label='手机号' name='phone'><Input /></Form.Item>
                    <Form.Item label='公司' name='company'><Select options={company} /></Form.Item>
                    <Form.Item label='部门' name='department'><Select options={department} /></Form.Item>
                    <Form.Item label='职位' name='position'><Select options={position} /></Form.Item>
                    <Form.Item>
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
            <Modal
                title={type === 'add' ? "添加新用户" : "修改用户信息"}
                open={isShow}
                maskClosable={false}
                onOk={() => { form.submit(); }}
                onCancel={() => { setIsShow(false); form.resetFields(); }}
            >
                <Form form={form} onFinish={(values) => { type === 'add' ? addUserAPI(values) : editUserAPI(values) }}>
                    {type === 'add' ? null : <Form.Item label="编号" name="uid" rules={[{ required: true }]}>
                        <Input disabled={true} />
                    </Form.Item>}
                    <Form.Item label="姓名" name="name" rules={[{ required: true, message: '不能为空' }, {
                        validator: (_, value) => {
                            const regex = /[^a-zA-Z0-9]/;
                            if (regex.test(value) && !['-', '_', '（', '）', '(', ')'].indexOf(value)) {
                                return Promise.reject(new Error('请不要输入特殊字符！'));
                            }
                            return Promise.resolve();
                        }
                    }]}>
                        <Input placeholder="请输入" maxLength={10} />
                    </Form.Item>
                    <Form.Item label="手机号（钉钉）" name="phone" rules={[{ required: true, message: '不能为空' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号错误' }]}>
                        <Input placeholder="请输入" maxLength={11} />
                    </Form.Item>
                    <Form.Item label="岗位" name="combine" rules={[{ required: true, message: '不能为空' }]}>
                        <Cascader placeholder="请选择" options={combine} onClick={() => { getSalemanItems(); }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}

export default UserList