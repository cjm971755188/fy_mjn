import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Image, Popconfirm, List, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import request from '../service/request'
import people from '../assets/people.jpg'
import UpLoadImg from '../components/UpLoadImg'

function TalentPreparation() {
    const columns = [
        { title: '编号', dataIndex: 'tid', key: 'tid' },
        {
            title: '头像',
            dataIndex: 'pic',
            key: 'pic',
            render: (_, record) => (
                <Image width={50} src={record.pic} fallback={people} />
            ),
        },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        {
            title: '达人寻找证明',
            dataIndex: 'search_pic',
            key: 'search_pic',
            render: (_, record) => (
                <Image width={30} src={record.search_pic} />
            ),
        },
        { title: '联系人', dataIndex: 'liaison_name', key: 'liaison_name' },
        { title: '群名', dataIndex: 'group_name', key: 'group_name' },
        {
            title: '达人推进证明',
            dataIndex: 'advance_pic',
            key: 'advance_pic',
            render: (_, record) => (
                <Image width={30} src={record.advance_pic} />
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status'
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => {
                        message.success('推进')
                    }}>推进</a>
                    <a onClick={() => {
                        editForm.setFieldsValue(record),
                            setIsShowEdit(true)
                    }}>修改信息</a>
                    <Popconfirm
                        title="确认要删除该达人吗"
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
            )
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
            url: '/talent/getTalentList',
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
    const [isShowAddSearch, setIsShowAddSearch] = useState(false)
    const [addSearchList, setAddSearchList] = useState([])

    // 修改用户信息
    const [isShowEdit, setIsShowEdit] = useState(false)
    const [editForm] = Form.useForm()

    // 获取所有平台 + 多选框
    const [platformData, setPlatformData] = useState([])

    // 查询、清空筛选
    const [selectForm] = Form.useForm()

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card
                title="商机推进列表"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setIsShowAdd(true);
                            request({
                                method: 'post',
                                url: '/comment/getPlatform',
                                data: {}
                            }).then((res) => {
                                if (res.status == 200) {
                                    if (res.data.code == 200) {
                                        setPlatformData(res.data.data)
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
                        添加新达人
                    </Button>
                }
            >
                <Form
                    layout="inline"
                    form={selectForm}
                    onFinish={() => {
                        setTableParams({
                            ...tableParams,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='编号' name='uid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='姓名' name='name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
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
                    rowKey={(data) => data.tid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <Modal
                title='添加新达人'
                open={isShowAdd}
                maskClosable={false}
                onOk={() => { addForm.submit() }}
                onCancel={() => { setIsShowAdd(false); addForm.resetFields(); setIsShowAddSearch(false); setAddSearchList([]) }}
            >
                <Form
                    form={addForm}
                    onFinish={(values) => {
                        request({
                            method: 'post',
                            url: '/talent/addTalent',
                            data: {
                                ...values,
                                uid: localStorage.getItem('uid')
                            }
                        }).then((res) => {
                            if (res.status == 200) {
                                if (res.data.code == 200) {
                                    setIsShowAdd(false)
                                    fetchData()
                                    addForm.resetFields()
                                    setAddSearchList([])
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
                    <Form.Item label="平台" name="pids" rules={[{ required: true, message: '平台不能为空' }]}>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择新达人合作平台"
                            onChange={(value) => {
                                addForm.setFieldValue('pids', value)
                            }}
                            options={platformData}
                        />
                    </Form.Item>
                    <Form.Item label="头像" name="pic" rules={[{ required: true, message: '头像不能为空' }]}>
                        <UpLoadImg title="上传头像" name="addPic" setPicUrl={(value) => { addForm.setFieldValue('pic', value) }} />
                    </Form.Item>
                    <Form.Item label="达人昵称" name="name" rules={[{ required: true, message: '达人昵称不能为空' }]}>
                        <Input placeholder="请输入新达人昵称" />
                    </Form.Item>
                    <Form.Item label="相似达人" name="pic">
                        <Button onClick={() => {
                            if (addForm.getFieldValue('name')) {
                                request({
                                    method: 'post',
                                    url: '/talent/searchSameTalent',
                                    data: {
                                        name: addForm.getFieldValue('name')
                                    }
                                }).then((res) => {
                                    if (res.status == 200) {
                                        if (res.data.code != 200) {
                                            setIsShowAddSearch(true)
                                            setAddSearchList(res.data.data)
                                            message.info(res.data.msg)
                                        } else {
                                            setIsShowAddSearch(false)
                                            setAddSearchList([])
                                            message.success(res.data.msg)
                                        }
                                    } else {
                                        message.error(res.data.msg)
                                    }
                                }).catch((err) => {
                                    console.error(err)
                                })
                            } else {
                                setIsShowAddSearch(false)
                                setAddSearchList([])
                                message.error('未填写昵称，无法查询')
                            }
                        }}>查询</Button>
                    </Form.Item>
                    {isShowAddSearch && <Form.Item label="" name="pic">
                        <List
                            itemLayout="horizontal"
                            dataSource={addSearchList}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Image width={50} src={item.pic} fallback={people} preview={false} />}
                                        title={<span>{`${item.name}->${item.u_name}`}</span>}
                                        description={`销售平台：${item.platform}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Form.Item>}
                    <Form.Item label="达人寻找证明" name="searchPic" rules={[{ required: true, message: '达人寻找证明不能为空' }]} >
                        <UpLoadImg title="上传寻找证明" name="addSearchPic" setPicUrl={(value) => { addForm.setFieldValue('searchPic', value) }} />
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
                    <Form.Item label="姓名" name="name" rules={[{ required: true, message: '姓名不能为空' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default TalentPreparation