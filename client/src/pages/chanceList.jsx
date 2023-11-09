import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Image, List, Select, Typography, message } from 'antd';
import { PlusOutlined, CheckCircleTwoTone, ClockCircleTwoTone, MinusCircleOutlined } from '@ant-design/icons';
import request from '../service/request'
import people from '../assets/people.jpg'
import UpLoadImg from '../components/UpLoadImg'
import { chanceStatus, platform, liaisonType } from '../baseData/talent'

function ChanceList() {
    const columns = [
        { title: '商机编号', dataIndex: 'cid', key: 'cid' },
        { title: '平台', dataIndex: 'platforms', key: 'platforms' },
        { title: '达人账号ID', dataIndex: 'account_ids', key: 'account_ids' },
        { title: '达人账号', dataIndex: 'account_names', key: 'account_names' },
        {
            title: '寻找证明',
            dataIndex: 'search_pic',
            key: 'search_pic',
            render: (_, record) => (
                <Image width={50} src={record.search_pic} />
            )
        },
        { title: '联系人类型', dataIndex: 'liaison_type', key: 'liaison_type' },
        { title: '联系人姓名', dataIndex: 'liaison_name', key: 'liaison_name' },
        { title: '联系人微信', dataIndex: 'liaison_v', key: 'liaison_v' },
        { title: '联系人电话', dataIndex: 'liaison_phone', key: 'liaison_phone' },
        { title: '沟通群', dataIndex: 'group_name', key: 'group_name' },
        {
            title: '推进证明',
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
                    {record.status === '已推进' ? <CheckCircleTwoTone twoToneColor="#4ec990" /> : <ClockCircleTwoTone twoToneColor="#ffc814" />}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => {
                        let platforms = record.platforms.split(',')
                        let account_names = record.account_names.split(',')
                        let account_ids = record.account_ids.split(',')
                        editForm.setFieldsValue({
                            ...record,
                            platforms,
                            account_names,
                            account_ids
                        })
                        setIsShowEdit(true)
                    }}>修改信息</a>
                    {record.status === '已推进' ? <a onClick={() => {
                        /* console.log('record: ', record);
                        reportForm.setFieldsValue({
                            ...record,
                            pid: "",
                            account_ids: "",
                            account_names: ""
                        })
                        setIsShowReport(true) */
                    }}>报备审批</a> : <a onClick={() => {
                        advanceForm.setFieldsValue(record)
                        setIsShowAdvance(true)
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
            url: '/chance/getChanceList',
            data: {
                userInfo: {
                    uid: localStorage.getItem('uid'),
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

    // 添加
    const [isShowAdd, setIsShowAdd] = useState(false)
    const [addForm] = Form.useForm()
    const [isShowAddSearch, setIsShowAddSearch] = useState(false)
    const [addSearchList, setAddSearchList] = useState([])

    // 修改信息
    const [isShowEdit, setIsShowEdit] = useState(false)
    const [editForm] = Form.useForm()
    const [isShowEditSearch, setIsShowEditSearch] = useState(false)
    const [editSearchList, setEditSearchList] = useState([])

    // 推进
    const [isShowAdvance, setIsShowAdvance] = useState(false)
    const [advanceForm] = Form.useForm()

    // 报备
    const [isShowReport, setIsShowReport] = useState(false)
    const [reportForm] = Form.useForm()
    const [platformReportData, setPlatformReportData] = useState();
    const [accountReportData, setAccountReportData] = useState();
    const [idReportData, setIdReportData] = useState();

    // 查询、清空筛选
    const [selectForm] = Form.useForm()

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card title="商机推进列表" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShowAdd(true) }}>添加新商机</Button>}>
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
                    <Form.Item label='商机编号' name='cid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='达人账号' name='account_names' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='账号ID' name='account_ids' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='联系人类型' name='liaison_type' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={liaisonType} />
                    </Form.Item>
                    <Form.Item label='联系人姓名' name='liaison_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='联系人微信' name='liaison_v' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='联系人电话' name='liaison_phone' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='沟通群' name='group_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='状态' name='status' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={chanceStatus} />
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
                    rowKey={(data) => data.cid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <Modal
                title='添加新商机'
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
                            url: '/chance/addChance',
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
                    <Form.Item label="平台" name="platforms" rules={[{ required: true, message: '平台不能为空' }]}>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择新商机合作平台"
                            onChange={(value) => {
                                addForm.setFieldValue('platforms', value)
                            }}
                            options={platform}
                        />
                    </Form.Item>
                    <Form.Item label="账号ID" name="account_ids" rules={[{ required: true, message: '账号ID不能为空' }]}>
                        <Select
                            mode="tags"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请输入新达人的账号ID"
                            onChange={(value) => {
                                addForm.setFieldValue('account_ids', value)
                            }}
                            options={[]}
                        />
                    </Form.Item>
                    <Form.Item label="达人账号" name="account_names" rules={[{ required: true, message: '达人账号不能为空' }]}>
                        <Select
                            mode="tags"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请输入新达人账号"
                            onChange={(value) => {
                                addForm.setFieldValue('account_names', value)
                            }}
                            options={[]}
                        />
                    </Form.Item>
                    <Form.Item label="相同达人" name="pic">
                        <Button onClick={() => {
                            if ((addForm.getFieldValue('account_names') && addForm.getFieldValue('account_names').length > 0) || (addForm.getFieldValue('account_ids') && addForm.getFieldValue('account_ids').length > 0)) {
                                request({
                                    method: 'post',
                                    url: '/chance/searchSameChance',
                                    data: {
                                        account_names: addForm.getFieldValue('account_names'),
                                        account_ids: addForm.getFieldValue('account_ids'),
                                        cid: ''
                                    }
                                }).then((res) => {
                                    if (res.status == 200) {
                                        if (res.data.code != 200) {
                                            setIsShowAddSearch(true)
                                            setAddSearchList(res.data.data)
                                            message.error(res.data.msg)
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
                        {addSearchList.Unreported.length > 0 ? <List
                            itemLayout="horizontal"
                            bordered
                            style={{ margin: '20px 0' }}
                            header="未合作"
                            dataSource={addSearchList.Unreported}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Image width={50} src={people} preview={false} />}
                                        title={<Space size={'large'}><div>{`账号名: ${item.account_names}`}</div><div>{`账号ID: ${item.account_ids}`}</div></Space>}
                                        description={<span>{`商务: ${item.name}`}</span>}
                                    />
                                </List.Item>
                            )}
                        /> : null}
                        {addSearchList.cooperation.length > 0 ? <List
                            itemLayout="horizontal"
                            bordered
                            style={{ margin: '20px 0' }}
                            header="已合作"
                            dataSource={addSearchList.cooperation}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Image width={50} src={people} preview={false} />}
                                        title={<Space size={'large'}><div>{`账号名: ${item.account_names}`}</div><div>{`账号ID: ${item.account_ids}`}</div></Space>}
                                        description={<Space size={'large'}><div>{`平台: ${item.platform}`}</div><div>{`商务: ${item.name}`}</div></Space>}
                                    />
                                </List.Item>
                            )}
                        /> : null}
                    </Form.Item>}
                    <Form.Item label="寻找证明" name="search_pic" rules={[{ required: true, message: '寻找证明不能为空' }]} >
                        <UpLoadImg title="上传寻找证明" name="addSearchPic" setPicUrl={(value) => { addForm.setFieldValue('search_pic', value) }} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title='修改信息'
                open={isShowEdit}
                maskClosable={false}
                onOk={() => { editForm.submit() }}
                onCancel={() => { setIsShowEdit(false); editForm.resetFields(); setIsShowEditSearch(false); setEditSearchList([]) }}
            >
                <Form
                    form={editForm}
                    onFinish={(values) => {
                        request({
                            method: 'post',
                            url: '/chance/editChance',
                            data: {
                                ...values,
                                status: editForm.getFieldValue('status')
                            }
                        }).then((res) => {
                            if (res.status == 200) {
                                if (res.data.code == 200) {
                                    setIsShowEdit(false)
                                    fetchData()
                                    editForm.resetFields()
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
                    <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '商机编号不能为空' }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="平台" name="platforms" rules={[{ required: true, message: '平台不能为空' }]}>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择新商机合作平台"
                            onChange={(value) => {
                                editForm.setFieldValue('platforms', value)
                            }}
                            options={platform}
                        />
                    </Form.Item>
                    <Form.Item label="账号ID" name="account_ids" rules={[{ required: true, message: '账号ID不能为空' }]}>
                        <Select
                            mode="tags"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请输入新达人的账号ID"
                            onChange={(value) => {
                                editForm.setFieldValue('account_ids', value)
                            }}
                            options={[]}
                        />
                    </Form.Item>
                    <Form.Item label="达人账号" name="account_names" rules={[{ required: true, message: '达人账号不能为空' }]}>
                        <Select
                            mode="tags"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请输入新达人账号"
                            onChange={(value) => {
                                editForm.setFieldValue('account_names', value)
                            }}
                            options={[]}
                        />
                    </Form.Item>
                    <Form.Item label="相同达人" name="pic">
                        <Button onClick={() => {
                            if ((editForm.getFieldValue('account_names') && editForm.getFieldValue('account_names').length > 0) || (editForm.getFieldValue('account_ids') && editForm.getFieldValue('account_ids').length > 0)) {
                                request({
                                    method: 'post',
                                    url: '/chance/searchSameChance',
                                    data: {
                                        account_names: editForm.getFieldValue('account_names'),
                                        account_ids: editForm.getFieldValue('account_ids'),
                                        cid: editForm.getFieldValue('cid')
                                    }
                                }).then((res) => {
                                    if (res.status == 200) {
                                        if (res.data.code != 200) {
                                            setIsShowEditSearch(true)
                                            setEditSearchList(res.data.data)
                                            message.error(res.data.msg)
                                        } else {
                                            setIsShowEditSearch(false)
                                            setEditSearchList([])
                                            message.success(res.data.msg)
                                        }
                                    } else {
                                        message.error(res.data.msg)
                                    }
                                }).catch((err) => {
                                    console.error(err)
                                })
                            } else {
                                setIsShowEditSearch(false)
                                setEditSearchList([])
                                message.error('未填写达人账号名/ID, 无法查询')
                            }
                        }}>查询</Button>
                    </Form.Item>
                    {isShowEditSearch && <Form.Item label="" name="pic">
                        {editSearchList.Unreported.length > 0 ? <List
                            itemLayout="horizontal"
                            bordered
                            style={{ margin: '20px 0' }}
                            header="未合作"
                            dataSource={editSearchList.Unreported}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Image width={50} src={people} preview={false} />}
                                        title={<Space size={'large'}><div>{`账号名: ${item.account_names}`}</div><div>{`账号ID: ${item.account_ids}`}</div></Space>}
                                        description={<span>{`商务: ${item.name}`}</span>}
                                    />
                                </List.Item>
                            )}
                        /> : null}
                        {editSearchList.cooperation.length > 0 ? <List
                            itemLayout="horizontal"
                            bordered
                            style={{ margin: '20px 0' }}
                            header="已合作"
                            dataSource={editSearchList.cooperation}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Image width={50} src={people} preview={false} />}
                                        title={<Space size={'large'}><div>{`账号名: ${item.account_names}`}</div><div>{`账号ID: ${item.account_ids}`}</div></Space>}
                                        description={<Space size={'large'}><div>{`平台: ${item.platform}`}</div><div>{`商务: ${item.name}`}</div></Space>}
                                    />
                                </List.Item>
                            )}
                        /> : null}
                    </Form.Item>}
                    {editForm.getFieldValue('status') == '已推进' ? <><Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '联系人类型不能为空' }]}>
                        <Select
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择联系人类型"
                            onChange={(value) => {
                                advanceForm.setFieldValue('platforms', value)
                            }}
                            options={liaisonType}
                        />
                    </Form.Item>
                        <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '联系人姓名不能为空' }]}>
                            <Input placeholder="请输入联系人姓名" />
                        </Form.Item>
                        <Form.Item label="联系人微信" name="liaison_v" rules={[{ required: true, message: '联系人微信不能为空' }]}>
                            <Input placeholder="请输入联系人微信" />
                        </Form.Item>
                        <Form.Item label="联系人电话" name="liaison_phone">
                            <Input placeholder="请输入联系人电话" />
                        </Form.Item>
                        <Form.Item label="沟通群名称" name="group_name" rules={[{ required: true, message: '沟通群名不能为空' }]}>
                            <Input placeholder="请输入沟通群名" />
                        </Form.Item></> : null}
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
                            url: '/chance/advanceChance',
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
                    <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '达人编号不能为空' }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="账号ID" name="account_ids" rules={[{ required: true, message: '账号ID不能为空' }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="达人账号" name="account_names" rules={[{ required: true, message: '达人账号不能为空' }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '联系人类型不能为空' }]}>
                        <Select
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择联系人类型"
                            onChange={(value) => {
                                advanceForm.setFieldValue('platforms', value)
                            }}
                            options={liaisonType}
                        />
                    </Form.Item>
                    <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '联系人姓名不能为空' }]}>
                        <Input placeholder="请输入联系人姓名" />
                    </Form.Item>
                    <Form.Item label="联系人微信" name="liaison_v" rules={[{ required: true, message: '联系人微信不能为空' }]}>
                        <Input placeholder="请输入联系人微信" />
                    </Form.Item>
                    <Form.Item label="联系人电话（选填）" name="liaison_phone">
                        <Input placeholder="请输入联系人电话" />
                    </Form.Item>
                    <Form.Item label="沟通群名称" name="group_name" rules={[{ required: true, message: '沟通群名不能为空' }]}>
                        <Input placeholder="请输入沟通群名" />
                    </Form.Item>
                    <Form.Item label="发货盘证明" name="advance_pic" rules={[{ required: true, message: '发货盘证明不能为空' }]} >
                        <UpLoadImg title="发货盘证明" name="advance_pic" setPicUrl={(value) => { advanceForm.setFieldValue('advance_pic', value) }} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                width="60%"
                title='报备审批资料填写'
                open={isShowReport}
                maskClosable={false}
                onOk={() => { reportForm.submit() }}
                onCancel={() => { setIsShowReport(false); reportForm.resetFields() }}
            >
                <Form
                    
                    form={reportForm}
                    onFinish={(values) => {
                        request({
                            method: 'post',
                            url: '/chance/reportChance',
                            data: values
                        }).then((res) => {
                            if (res.status == 200) {
                                if (res.data.code == 200) {
                                    setIsShowReport(false)
                                    fetchData()
                                    reportForm.resetFields()
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
                    <Form.Item label="达人昵称" name="talent_nickname" rules={[{ required: true, message: '达人昵称不能为空' }]}>
                        <Input placeholder="请输入该达人的昵称（唯一、方便的简单叫法）" />
                    </Form.Item>
                    <Form.List layout="inline" name="talent">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space
                                        key={key}
                                        style={{
                                            display: 'flex',
                                            marginBottom: 8,
                                        }}
                                        align="baseline"
                                    >
                                        <Form.Item {...restField} label="平台" name={[name, 'pid']} rules={[{ required: true, message: '平台不能为空' }]}>
                                            <Select
                                                placeholder="请选择报备的平台"
                                                onChange={(value) => {
                                                    reportForm.setFieldValue('pid', value)
                                                }}
                                                options={platformReportData}
                                            />
                                        </Form.Item>
                                        <Form.Item {...restField} label="账号ID" name={[name, 'account_ids']} rules={[{ required: true, message: '账号ID不能为空' }]}>
                                            <Select
                                                placeholder="请选择报备的账号ID"
                                                onChange={(value) => {
                                                    reportForm.setFieldValue('account_ids', value)
                                                }}
                                                options={idReportData}
                                            />
                                        </Form.Item>
                                        <Form.Item {...restField} label="账号名称" name={[name, 'account_names']} rules={[{ required: true, message: '账号名称不能为空' }]}>
                                            <Select
                                                placeholder="请选择报备的账号名称"
                                                onChange={(value) => {
                                                    reportForm.setFieldValue('account_names', value)
                                                }}
                                                options={accountReportData}
                                            />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        添加合作模式
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    )
}

export default ChanceList