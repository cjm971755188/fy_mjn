import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Image, List, Select, Avatar, message } from 'antd';
import { PlusOutlined, CheckCircleTwoTone, ClockCircleTwoTone } from '@ant-design/icons';
import request from '../service/request'
import people from '../assets/people.jpg'
import UpLoadImg from '../components/UpLoadImg'

function TalentPreparation() {
    const columns = [
        { title: '编号', dataIndex: 'tid', key: 'tid' },
        { title: '达人账号', dataIndex: 'ta_name', key: 'ta_name' },
        { title: '账号ID', dataIndex: 'taID', key: 'taID' },
        {
            title: '达人寻找证明',
            dataIndex: 'search_pic',
            key: 'search_pic',
            render: (_, record) => (
                <Image width={50} src={record.search_pic} />
            )
        },
        { title: '联系人类型', dataIndex: 'type', key: 'type' },
        { title: '联系人姓名', dataIndex: 'liaison_name', key: 'liaison_name' },
        { title: '联系人微信', dataIndex: 'liaison_vx', key: 'liaison_vx' },
        { title: '沟通群名称', dataIndex: 'group_name', key: 'group_name' },
        {
            title: '达人推进证明',
            dataIndex: 'advance_pic',
            key: 'advance_pic',
            render: (_, record) => (
                <Image width={50} src={record.advance_pic} />
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status == '已推进' ? <CheckCircleTwoTone twoToneColor="#4ec990" /> : <ClockCircleTwoTone twoToneColor="#ffc814" />}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.status == '已推进' ? null : <a onClick={() => {
                        advanceForm.setFieldValue('tid', record.tid)
                        advanceForm.setFieldValue('taID', record.taID)
                        advanceForm.setFieldValue('ta_name', record.ta_name)
                        setIsShowAdvance(true);
                        request({
                            method: 'post',
                            url: '/comment/getLiaisonType',
                            data: {}
                        }).then((res) => {
                            if (res.status == 200) {
                                if (res.data.code == 200) {
                                    setLiaisonTypeData(res.data.data)
                                } else {
                                    message.error(res.data.msg)
                                }
                            } else {
                                message.error(res.data.msg)
                            }
                        }).catch((err) => {
                            console.error(err)
                        })
                    }}>推进</a>}
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
            url: '/talent/getTalentPreparationList',
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

    // 添加新达人
    const [isShowAdd, setIsShowAdd] = useState(false)
    const [addForm] = Form.useForm()
    const [isShowAddSearch, setIsShowAddSearch] = useState(false)
    const [addSearchList, setAddSearchList] = useState([])
    const [platformData, setPlatformData] = useState([])

    // 推进资料填写
    const [isShowAdvance, setIsShowAdvance] = useState(false)
    const [advanceForm] = Form.useForm()
    const [liaisonTypeData, setLiaisonTypeData] = useState([])

    // 查询、清空筛选
    const [selectForm] = Form.useForm()

    // 获取联系人类型
    const [typeData, setTypeData] = useState();
    const [loadingType, setLoadingType] = useState(false);
    const getTypeData = () => {
        setLoadingType(true)
        request({
            method: 'post',
            url: '/comment/getLiaisonType',
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

    // 获取所有达人状态
    const [statusData, setStatusData] = useState();
    const [loadingStatus, setLoadingStatus] = useState(false);
    const getStatusData = () => {
        setLoadingType(true)
        request({
            method: 'post',
            url: '/comment/getTalentStatus',
            data: {}
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setStatusData(res.data.data)
                    setLoadingStatus(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };

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
                    onFinish={(values) => {
                        console.log('onFinish');
                        setTableParams({
                            ...tableParams,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='达人编号' name='tid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='达人账号' name='ta_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='账号ID' name='taID' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='联系人类型' name='lt_id' style={{ marginBottom: '20px' }}>
                        <Select
                            style={{ width: 160 }}
                            loading={loadingType}
                            options={typeData}
                            onFocus={getTypeData}
                        />
                    </Form.Item>
                    <Form.Item label='联系人姓名' name='liaison_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='联系人微信' name='liaison_vx' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='沟通群名称' name='group_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='状态' name='ts_id' style={{ marginBottom: '20px' }}>
                        <Select
                            style={{ width: 160 }}
                            loading={loadingStatus}
                            options={statusData}
                            onFocus={getStatusData}
                        />
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
                    <Form.Item label="达人账号" name="ta_name" rules={[{ required: true, message: '达人账号不能为空' }]}>
                        <Select
                            mode="tags"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请输入新达人账号"
                            onChange={(value) => {
                                addForm.setFieldValue('ta_name', value)
                            }}
                            options={[]}
                        />
                    </Form.Item>
                    <Form.Item label="账号ID" name="taID" rules={[{ required: true, message: '账号ID不能为空' }]}>
                        <Select
                            mode="tags"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请输入新达人的账号ID"
                            onChange={(value) => {
                                addForm.setFieldValue('taID', value)
                            }}
                            options={[]}
                        />
                    </Form.Item>
                    <Form.Item label="相似达人" name="pic">
                        <Button onClick={() => {
                            if ((addForm.getFieldValue('ta_name') && addForm.getFieldValue('ta_name').length > 0) || (addForm.getFieldValue('taID') && addForm.getFieldValue('taID').length > 0)) {
                                request({
                                    method: 'post',
                                    url: '/talent/searchSameTalent',
                                    data: {
                                        ta_name: addForm.getFieldValue('ta_name'),
                                        taID: addForm.getFieldValue('taID')
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
                                message.error('未填写达人账号名/ID, 无法查询')
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
                                        avatar={<Image width={50} src={people} />}
                                        title={<span>{`${item.ta_name}--->${item.name}`}</span>}
                                        description={`当前销售平台：${item.platform}`}
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
                title='推进资料填写'
                open={isShowAdvance}
                maskClosable={false}
                onOk={() => { advanceForm.submit() }}
                onCancel={() => { setIsShowAdvance(false); advanceForm.resetFields() }}
            >
                <Form
                    form={advanceForm}
                    onFinish={(values) => {
                        request({
                            method: 'post',
                            url: '/talent/advanceTalent',
                            data: values
                        }).then((res) => {
                            if (res.status == 200) {
                                if (res.data.code == 200) {
                                    setIsShowAdvance(false)
                                    fetchData()
                                    advanceForm.resetFields()
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
                    <Form.Item label="达人编号" name="tid" rules={[{ required: true, message: '达人编号不能为空' }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="达人账号" name="ta_name" rules={[{ required: true, message: '达人账号不能为空' }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="账号ID" name="taID" rules={[{ required: true, message: '账号ID不能为空' }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="联系人类型" name="lt_id" rules={[{ required: true, message: '联系人类型不能为空' }]}>
                        <Select
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择联系人类型"
                            onChange={(value) => {
                                advanceForm.setFieldValue('pids', value)
                            }}
                            options={liaisonTypeData}
                        />
                    </Form.Item>
                    <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '联系人姓名不能为空' }]}>
                        <Input placeholder="请输入联系人姓名" />
                    </Form.Item>
                    <Form.Item label="联系人微信" name="liaison_vx" rules={[{ required: true, message: '联系人微信不能为空' }]}>
                        <Input placeholder="请输入联系人微信" />
                    </Form.Item>
                    <Form.Item label="沟通群名称" name="group_name" rules={[{ required: true, message: '沟通群名不能为空' }]}>
                        <Input placeholder="请输入沟通群名" />
                    </Form.Item>
                    <Form.Item label="发货盘证明" name="advance_pic" rules={[{ required: true, message: '发货盘证明不能为空' }]} >
                        <UpLoadImg title="发货盘证明" name="advance_pic" setPicUrl={(value) => { advanceForm.setFieldValue('advance_pic', value) }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default TalentPreparation