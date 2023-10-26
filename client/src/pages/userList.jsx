import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Select, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import request from '../service/request'

function UserList() {
    const columns = [
        { title: '编号', dataIndex: 'uid', key: 'uid' },
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '公司', dataIndex: 'company', key: 'company' },
        { title: '部门', dataIndex: 'department', key: 'department' },
        { title: '职位', dataIndex: 'type', key: 'type' },
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
                        console.log('record: ', record);
                        editForm.setFieldsValue(record)
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
                ids: {
                    uid: localStorage.getItem('uid'),
                    uc_id: localStorage.getItem('uc_id'),
                    ud_id: localStorage.getItem('ud_id'),
                    ut_id: localStorage.getItem('ut_id')
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

    // 获取所有公司
    const [companyData, setCompanyData] = useState();
    const [loadingCompany, setLoadingCompany] = useState(false);
    const getCompanyData = () => {
        setLoadingCompany(true)
        request({
            method: 'post',
            url: '/user/getAllCompany',
            data: {
                uc_id: localStorage.getItem('uc_id'),
                ut_id: localStorage.getItem('ut_id')
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setCompanyData(res.data.data)
                    setLoadingCompany(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };

    // 获取所有部门
    const [departmentData, setDepartmentData] = useState();
    const [loadingDepartment, setLoadingDepartment] = useState(false);
    const getDepartmentData = () => {
        setLoadingDepartment(true)
        request({
            method: 'post',
            url: '/user/getAllDepartment',
            data: {
                ud_id: localStorage.getItem('ud_id'),
                ut_id: localStorage.getItem('ut_id')
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setDepartmentData(res.data.data)
                    setLoadingDepartment(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };

    // 获取所有职位
    const [typeData, setTypeData] = useState();
    const [loadingType, setLoadingType] = useState(false);
    const getTypeData = () => {
        setLoadingType(true)
        request({
            method: 'post',
            url: '/user/getAllType',
            data: {
                uc_id: localStorage.getItem('uc_id'),
                ut_id: localStorage.getItem('ut_id')
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setTypeData(res.data.data)
                    setLoadingType(false)
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
                    <Form.Item label='编号' name='uid' style={{marginBottom: '20px'}}><Input /></Form.Item>
                    <Form.Item label='姓名' name='name' style={{marginBottom: '20px'}}><Input /></Form.Item>
                    <Form.Item label='公司' name='uc_id' style={{marginBottom: '20px'}}>
                        <Select
                            style={{ width: 160 }}
                            loading={loadingCompany}
                            options={companyData}
                            onFocus={getCompanyData}
                        />
                    </Form.Item>
                    <Form.Item label='部门' name='ud_id' style={{marginBottom: '20px'}}>
                        <Select
                            style={{ width: 160 }}
                            loading={loadingDepartment}
                            options={departmentData}
                            onFocus={getDepartmentData}
                        />
                    </Form.Item>
                    <Form.Item label='职位' name='ut_id' style={{marginBottom: '20px'}}>
                        <Select
                            style={{ width: 160 }}
                            loading={loadingType}
                            options={typeData}
                            onFocus={getTypeData}
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
                    <Form.Item label="姓名" name="name" rules={[ { required: true, message: '姓名不能为空' } ]}>
                        <Input placeholder="请输入新用户姓名" />
                    </Form.Item>
                    <Form.Item label="公司" name="uc_id" rules={[ { required: true, message: '公司不能为空' } ]}>
                        <Select
                            loading={loadingCompany}
                            options={companyData}
                            onFocus={getCompanyData}
                        />
                    </Form.Item>
                    <Form.Item label="部门" name="ud_id" rules={[ { required: true, message: '部门不能为空' } ]}>
                        <Select
                            loading={loadingDepartment}
                            options={departmentData}
                            onFocus={getDepartmentData}
                        />
                    </Form.Item>
                    <Form.Item label="职位" name="ut_id" rules={[ { required: true, message: '职位不能为空' } ]}>
                        <Select
                            loading={loadingType}
                            options={typeData}
                            onFocus={getTypeData}
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
                    onFinish={(values) => {
                        console.log('editUser: ', values);
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
                    <Form.Item label="公司" name="company" rules={[ { required: true, message: '公司不能为空' } ]}>
                        <Select
                            loading={loadingCompany}
                            options={companyData}
                            onFocus={getCompanyData}
                        />
                    </Form.Item>
                    <Form.Item label="部门" name="department" rules={[ { required: true, message: '部门不能为空' } ]}>
                        <Select
                            loading={loadingDepartment}
                            options={departmentData}
                            onFocus={getDepartmentData}
                        />
                    </Form.Item>
                    <Form.Item label="职位" name="type" rules={[ { required: true, message: '职位不能为空' } ]}>
                        <Select
                            loading={loadingType}
                            options={typeData}
                            onFocus={getTypeData}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default UserList