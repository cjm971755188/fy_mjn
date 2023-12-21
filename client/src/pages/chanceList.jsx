import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Modal, Button, Image, List, Select, Popover, message, Alert } from 'antd';
import { PlusOutlined, CloseCircleTwoTone, ClockCircleTwoTone, PlayCircleTwoTone, RightCircleTwoTone, CheckCircleTwoTone } from '@ant-design/icons';
import { chanceStatus, model } from '../baseData/talent'
import MyDateSelect from '../components/MyDateSelect'
import AEChance from '../components/modals/AEChance'
import AELiaison from '../components/modals/AELiaison'
import AETalent from '../components/modals/AETalent'

const { TextArea } = Input;

function ChanceList() {
    // 操作权限
    const userShowPower = localStorage.getItem('position') === '商务' ? true : false
    const addPower = localStorage.getItem('position') === '商务' ? true : false
    const editPower = localStorage.getItem('position') === '商务' ? true : false
    const advancePower = localStorage.getItem('position') === '商务' ? true : false
    const reportPower = localStorage.getItem('position') === '商务' ? true : false

    // 表格：格式
    let columns = [
        { title: '商机编号', dataIndex: 'cid', key: 'cid' },
        { title: '模式', dataIndex: 'models', key: 'models' },
        { title: '线上名', dataIndex: 'account_names', key: 'account_names' },
        { title: '团购名', dataIndex: 'group_name', key: 'group_name' },
        { title: '供货名', dataIndex: 'provide_name', key: 'provide_name' },
        { title: '寻找证明', dataIndex: 'search_pic', key: 'search_pic', render: (_, record) => (<Image width={50} src={record.search_pic} />) },
        {
            title: '联系人',
            dataIndex: 'liaison_name',
            key: 'liaison_name',
            render: (_, record) => (
                <Popover title="联系人信息" content={
                    <List>
                        <List.Item>姓名：{record.liaison_type}</List.Item>
                        <List.Item>微信：{record.liaison_name}</List.Item>
                        <List.Item>微信：{record.liaison_v}</List.Item>
                        <List.Item>手机号：{record.liaison_phone}</List.Item>
                        <List.Item>沟通群：{record.crowd_name}</List.Item>
                    </List>}
                >
                    <span>{record.liaison_name}</span>
                </Popover>
            )
        },
        { title: '推进证明', dataIndex: 'advance_pic', key: 'advance_pic', render: (_, record) => (<Image width={50} src={record.advance_pic} />) },
        { title: '商务', dataIndex: 'name', key: 'name' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status === '待推进' ? <PlayCircleTwoTone twoToneColor="#ee9900" /> :
                        record.status === '待报备' ? <RightCircleTwoTone twoToneColor="#ee9900" /> :
                            record.status === '待审批' ? <ClockCircleTwoTone twoToneColor="#ee9900" /> :
                                record.status === '报备驳回' ? <CloseCircleTwoTone twoToneColor="#f81d22" /> : 
                                    record.status === '报备通过' ? <CheckCircleTwoTone twoToneColor="#4ec9b0" /> : null}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    {editPower && record.status === '待推进' ? <a onClick={() => {
                        let models = record.models.split(',')
                        form.setFieldsValue({
                            ...record,
                            models
                        })
                        if (record.models.match('线上平台')) {
                            let platforms = record.platforms === null ? null : record.platforms.split(',')
                            let account_names = record.account_names === null ? null : record.account_names.split(',')
                            let account_ids = record.account_ids === null ? null : record.account_ids.split(',')
                            form.setFieldsValue({
                                ...record,
                                models,
                                platforms,
                                account_names,
                                account_ids
                            })
                        }
                        setType('edit');
                        setIsShow(true)
                    }}>修改模式</a> : null}
                    {advancePower && record.status === '待推进' ? <a onClick={() => {
                        let models = record.models.split(',')
                        setType('advance');
                        form.setFieldsValue({
                            ...record,
                            models
                        })
                        setIsShowLiaison(true)
                    }}>推进</a> : null}
                    {editPower && record.status === '待报备' ? <a onClick={() => {
                        form.setFieldsValue(record)
                        setType('edit_chance');
                        setIsShowLiaison(true)
                    }}>修改联系人</a> : null}
                    {reportPower && (record.status === '待报备' || record.status === '报备驳回') ? <a onClick={() => {
                        let models = record.models.split(',')
                        let platformList = []
                        let accountIdList = []
                        let accountNameList = []
                        if (record.models.match('线上平台')) {
                            for (let i = 0; i < record.platforms.split(',').length; i++) {
                                const element = record.platforms.split(',')[i];
                                platformList.push({ label: element, value: element })
                            }
                            for (let i = 0; i < record.account_ids.split(',').length; i++) {
                                const element = record.account_ids.split(',')[i];
                                accountIdList.push({ label: element, value: element })
                            }
                            for (let i = 0; i < record.account_names.split(',').length; i++) {
                                const element = record.account_names.split(',')[i];
                                accountNameList.push({ label: element, value: element })
                            }
                        }
                        form.setFieldsValue({
                            ...record,
                            models,
                            platformList,
                            accountIdList,
                            accountNameList,
                            liaison_type: record.liaison_type,
                            liaison_name: record.liaison_name,
                            liaison_v: record.liaison_v,
                            liaison_phone: record.liaison_phone,
                            crowd_name: record.crowd_name
                        })
                        setType('report');
                        setIsShowReport(true);
                    }}>报备</a> : null}
                    {record.status === '报备驳回' ? <a onClick={() => { 
                        let payload = {
                            cid: record.cid
                        }
                        getRefundReasonAPI(payload); 
                    }}>查看驳回备注</a> : null}
                </Space>
            )
        }
    ]
    columns = userShowPower ? columns.filter(item => item.title !== '商务') : columns
    // 表格：获取数据、分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filtersDate: [],
        filters: {},
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const getChanceListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/chance/getChanceList',
            data: {
                filtersDate: tableParams.filtersDate,
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
            pagination,
            filters,
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }
    // 查询、清空筛选
    const [filterForm] = Form.useForm()
    const [dateSelect, setDateSelect] = useState()
    const [salemansItems, setSalemansItems] = useState()
    const getSalemanItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getSalemanItems',
            data: {
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
                    setSalemansItems(res.data.data)
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

    // 添加、修改、推进、报备
    const [type, setType] = useState('')
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()
    const addChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/addChance',
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
                    setType('');
                    getChanceListAPI();
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
    const editChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/editChance',
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
                    setType('');
                    getChanceListAPI();
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
    const [isShowLiaison, setIsShowLiaison] = useState(false)
    const advanceChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/advanceChance',
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
                    setIsShowLiaison(false);
                    setType('');
                    getChanceListAPI();
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
    const editLiaisonAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/editLiaison',
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
                    setIsShowLiaison(false);
                    setType('');
                    getChanceListAPI();
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
    const [isShowReport, setIsShowReport] = useState(false)
    const reportChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/reportChance',
            data: {
                ...payload,
                operate: '达人报备',
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
                    setIsShowReport(false);
                    setType('');
                    getChanceListAPI();
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
    // 查看驳回理由
    const [checkNoReason, setCheckNoReason] = useState('')
    const [isShowCheckNo, setIsShowCheckNo] = useState(false)
    const getRefundReasonAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/getRefundReason',
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
                    setCheckNoReason(res.data.data)
                    setIsShowCheckNo(true);
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

    useEffect(() => {
        getChanceListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="商机列表" extra={addPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true); setType('add'); }}>添加新商机</Button> : null}>
                <Form
                    layout="inline"
                    form={filterForm}
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            filtersDate: dateSelect,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='日期选择' name='date' style={{ marginBottom: '20px' }}>
                        <MyDateSelect selectType="date,week,month,quarter.year" setDate={(value) => { setDateSelect(value); }} />
                    </Form.Item>
                    <Form.Item label='商机编号' name='cid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='模式' name='models' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={model} />
                    </Form.Item>
                    <Form.Item label='线上名' name='account_names' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='团购名' name='group_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='供货名' name='provide_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='联系人' name='liaison_name'><Input /></Form.Item>
                    {userShowPower ? null : <Form.Item label='商务' name='u_id' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemanItemsAPI(); }} />
                    </Form.Item>}
                    <Form.Item label='状态' name='status' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={chanceStatus} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: '20px' }}>
                        <Space size={'large'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                filterForm.resetFields();
                                setDateSelect([]);
                                setTableParams({
                                    ...tableParams,
                                    filtersDate: [],
                                    filters: {}
                                })
                            }}>清空筛选</Button>
                        </Space>
                    </Form.Item>
                </Form>
                <Alert message={`总计：${tableParams.pagination.total} 条数据`} type="info" showIcon />
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
            <AEChance
                isShow={isShow}
                type={type}
                form={form}
                onOK={(values) => { type === 'add' ? addChanceAPI(values) : type === 'edit' ? editChanceAPI(values) : advanceChanceAPI(values) }}
                onCancel={() => { setIsShow(false); form.resetFields(); setType(''); }}
            />
            <AELiaison
                isShow={isShowLiaison}
                type={type}
                form={form}
                onOK={(values) => { type === 'advance' ? advanceChanceAPI(values) : editLiaisonAPI(values) }}
                onCancel={() => { setIsShowLiaison(false); form.resetFields(); setType(''); }}
            />
            <AETalent
                isShow={isShowReport}
                type={type}
                form={form}
                onOK={(values) => { reportChanceAPI(values); }}
                onCancel={() => { setIsShowReport(false); form.resetFields(); setType(''); }}
            />
            <Modal title="报备驳回备注" open={isShowCheckNo} onOk={() => { setIsShowCheckNo(false); }} onCancel={() => { setIsShowCheckNo(false); }}>
                <TextArea placeholder="请输入" value={checkNoReason} disabled={true} />
            </Modal>
        </Fragment >
    )
}

export default ChanceList