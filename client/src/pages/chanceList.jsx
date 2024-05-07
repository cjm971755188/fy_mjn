import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Image, List, Select, Popover, message, Popconfirm, Tooltip, Alert } from 'antd';
import { PlusOutlined, CloseCircleTwoTone, ClockCircleTwoTone, PlayCircleTwoTone, RightCircleTwoTone, EditOutlined } from '@ant-design/icons';
import { chanceStatus, model } from '../baseData/talent'
import AEChance from '../components/modals/AEChance'
import AETalent from '../components/modals/AETalent'
import AENote from '../components/modals/AENote'
import dayjs from 'dayjs'

function ChanceList() {
    // 操作权限
    const editPower = (localStorage.getItem('department') === '事业部' && localStorage.getItem('company') !== '总公司') || localStorage.getItem('position') === '管理员' ? true : false
    const examPower = (localStorage.getItem('department') === '事业部' && localStorage.getItem('company') === '总公司') || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
    let columns = [
        { title: '商机编号', dataIndex: 'cid', key: 'cid' },
        { title: '模式', dataIndex: 'models', key: 'models' },
        { title: '关联平台', dataIndex: 'platforms', key: 'platforms' },
        {
            title: '达人名称',
            dataIndex: 'liaison_name',
            key: 'liaison_name',
            render: (_, record) => {
                let liaison_name = new Set().add(record.account_names).add(record.group_name).add(record.provide_name).add(record.custom_name)
                return (
                    <Popover title="名称" content={
                        <List>
                            <List.Item>线上平台：{record.account_names}</List.Item>
                            <List.Item>社群团购：{record.group_name}</List.Item>
                            <List.Item>供货：{record.provide_name}</List.Item>
                            <List.Item>定制：{record.custom_name}</List.Item>
                        </List>}
                    >
                        <span>{[...liaison_name].filter(item => item !== null).join(',')}</span>
                    </Popover>
                )
            }
        },
        {
            title: '联系人',
            dataIndex: 'liaison_name',
            key: 'liaison_name',
            width: 100,
            render: (_, record) => (
                <Popover title="联系人信息" content={
                    <List>
                        <List.Item>类型：{record.liaison_type}</List.Item>
                        <List.Item>姓名：{record.liaison_name}</List.Item>
                        <List.Item>微信：{record.liaison_v}</List.Item>
                        <List.Item>手机号：{record.liaison_phone}</List.Item>
                        <List.Item>沟通群：{record.crowd_name}</List.Item>
                    </List>}
                >
                    <span>{record.liaison_name}</span>
                </Popover>
            )
        },
        {
            title: '寻找证明',
            dataIndex: 'search_pic',
            key: 'search_pic',
            render: (_, record) => (
                <Popover title="寻找时间" content={dayjs(Number(record.create_time)).format('YYYY-MM-DD')}>
                    {record.search_pic && record.search_pic.split(',').map((pic, index) => {
                        return <Image key={index} width={50} height={50} src={pic} />
                    })}
                </Popover>
            )
        },
        {
            title: '推进证明',
            dataIndex: 'advance_pic',
            key: 'advance_pic',
            render: (_, record) => (
                <Popover title="推进时间" content={dayjs(Number(record.advance_time)).format('YYYY-MM-DD')}>
                    {record.advance_pic && record.advance_pic.split(',').map((pic, index) => {
                        return <Image key={index} width={50} height={50} src={pic} />
                    })}
                </Popover>
            )
        },
        {
            title: '保护期',
            dataIndex: 'days',
            key: 'days',
            width: 80,
            render: (_, record) => (
                <Popover title="累计给予保护天数" content={`${record.advance_days} 天`}>
                    {!record.days ? null : record.days <= 0 ? <span style={{ color: 'red' }}><b>已过期{-record.days} 天</b></span> : <span style={{ color: 'green' }}><b>{record.days} 天</b></span>}
                </Popover>

            )
        },
        {
            title: '备注',
            dataIndex: 'note',
            key: 'note',
            width: 150,
            render: (_, record) => (
                <Tooltip title={record.note}>
                    <div
                        style={{
                            width: '150px',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            if (editPower && record.status !== '报备通过') {
                                setClickCid(record.cid);
                                setIsShowNote(true);
                                setNoteType('备注');
                                setNote(record.note);
                            }
                        }}
                    >
                        {editPower && record.status !== '报备通过' ? <EditOutlined /> : null} {record.note}
                    </div>
                </Tooltip>
            )
        },
        { title: '商务', dataIndex: 'u_name', key: 'u_name', width: 80 },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 160,
            render: (_, record) => (
                <Space size="small">
                    {record.status === '待推进' ? <PlayCircleTwoTone twoToneColor="#008dff" /> :
                        record.status === '待报备' ? <RightCircleTwoTone twoToneColor="#c41d7f" /> :
                            record.status.match('待审批') ? <ClockCircleTwoTone twoToneColor="#ee9900" /> :
                                record.status.match('驳回') || record.status === '已过期' ? <CloseCircleTwoTone twoToneColor="#f81d22" /> : null}
                    <Popover title="理由" content={record.examine_note || record.refund_note || record.delay_note}>
                        <span>{record.status}</span>
                    </Popover>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    {editPower && ['待推进', '待报备', '已过期', '推进驳回', '报备驳回'].indexOf(record.status) > -1 ? <a onClick={() => {
                        let r = {
                            ...record,
                            models: record.models.split(','),
                            account_names: record.account_names.split(','),
                            search_pic: record.search_pic.split(','),
                            advance_pic: record.advance_pic === null ? [] : record.advance_pic.split(',')
                        }
                        form.setFieldsValue(r)
                        if (record.models.match('线上平台')) {
                            form.setFieldsValue({
                                ...r,
                                platforms: record.platforms === null ? null : record.platforms.split(','),
                                account_names: record.account_names === null ? null : record.account_names.split(',')
                            })
                        }
                        setType(`修改商机_${record.status}`);
                        setIsShow(true);
                    }}>修改信息</a> : null}
                    {editPower && ['待推进', '推进驳回', '已过期'].indexOf(record.status) > -1 && record.liaison_name !== null ? <a onClick={() => {
                        let r = {
                            ...record,
                            delay_note: '',
                            models: record.models.split(','),
                            search_pic: record.search_pic.split(','),
                            advance_pic: record.advance_pic === null ? [] : record.advance_pic.split(',')
                        }
                        form.setFieldsValue(r)
                        if (record.models.match('线上平台')) {
                            form.setFieldsValue({
                                ...r,
                                platforms: record.platforms === null ? null : record.platforms.split(','),
                                account_names: record.account_names === null ? null : record.account_names.split(',')
                            })
                        }
                        setClickName([...new Set().add(record.account_names).add(record.group_name).add(record.provide_name).add(record.custom_name)].filter(item => item !== null).join(','))
                        setType(record.status === '已过期' ? '延期推进商机' : '推进商机');
                        setIsShow(true);
                    }}>{record.status === '已过期' ? '延期推进' : '推进'}</a> : null}
                    {examPower && record.status.match('推进待审批') ? <><Popconfirm
                        title="审批商机"
                        description="确定要通过该商机推进吗？"
                        onConfirm={() => {
                            examChanceAPI({
                                cid: record.cid,
                                uid: record.u_id,
                                names: [...new Set().add(record.account_names).add(record.group_name).add(record.provide_name).add(record.custom_name)].filter(item => item !== null).join(','),
                                exam: true
                            })
                        }}
                        onCancel={() => { }}
                        okText="通过"
                        cancelText="取消"
                    >
                        <a style={{ color: 'green' }}>通过</a>
                    </Popconfirm><a style={{ color: 'red' }} onClick={() => { setClickCid(record.cid); setNoteType('驳回理由'); setIsShowNote(true); }}>驳回</a></> : null}
                    {editPower && record.status === '待报备' ? <a onClick={() => {
                        form.setFieldsValue({
                            ...record,
                            models: record.models.split(',')
                        })
                        setType('达人报备');
                        setIsShowReport(true);
                    }}>报备</a> : null}
                    {editPower && record.status === '报备驳回' ? <a onClick={() => { setClickCid(record.cid); getReportInfoAPI({ cid: record.cid }); }}>重新报备</a> : null}
                    {editPower && !record.status.match('待审批') && record.status !== '报备通过' ? <Popconfirm
                        title="清除商机"
                        description="确定要清除该商机吗？【若想恢复，需联系管理员】"
                        onConfirm={() => { clearChanceAPI({ cid: record.cid }); }}
                        onCancel={() => { }}
                        okText="清除"
                        cancelText="取消"
                    >
                        <a style={{ color: 'red' }}>清除</a>
                    </Popconfirm> : null}
                </Space>
            )
        }
    ]
    // 表格：获取数据、分页
    const [data, setData] = useState();
    const [waitSum, setWaitSum] = useState();
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
    const getChanceListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/chance/getChanceList',
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
                    setWaitSum(res.data.wait_sum)
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
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }
    // 查询、清空筛选
    const [filterForm] = Form.useForm()

    // 添加、修改、推进、报备、审批、清除
    const [type, setType] = useState('')
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()
    const [clickName, setClickName] = useState('')
    const [isShowNote, setIsShowNote] = useState(false)
    const [noteType, setNoteType] = useState()
    const [note, setNote] = useState()
    const [isShowReport, setIsShowReport] = useState(false)
    const addChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/addChance',
            data: {
                ...payload,
                operate: type, 
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
                operate: type, 
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
    const advanceChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/advanceChance',
            data: {
                ...payload,
                operate: type, 
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
    const reportChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/reportChance',
            data: {
                ...payload,
                operate: type,
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
    const examChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/examChance',
            data: {
                ...payload,
                operate: type, 
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
                    getChanceListAPI();
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
    const clearChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/clearChance',
            data: {
                ...payload,
                operate: type, 
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
                    getChanceListAPI();
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
    // 获取上次报备信息
    const [clickCid, setClickCid] = useState('')
    const getReportInfoAPI = (payload) => {
        request({
            method: 'post',
            url: '/talent/getReportInfo',
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
                    let models = [], accounts = [], group_name = null, group_shop = null, group_u_point_1 = null, group_u_id_2 = null, group_u_point_2 = null,
                        provide_name = null, provide_shop = null, provide_u_point_1 = null, provide_u_id_2 = null, provide_u_point_2 = null,
                        commission_normal = null, commission_welfare = null, commission_bao = null, commission_note = null, discount_buyout = null, discount_back = null, discount_label = null
                    for (let i = 0; i < res.data.data.length; i++) {
                        models.push(res.data.data[i].model)
                        if (res.data.data[i].model === '线上平台') {
                            accounts.push({
                                ...res.data.data[i],
                                account_models: res.data.data[i].account_models.split(','),
                                keyword: res.data.data[i].keyword.split(','),
                                main_province: res.data.data[i].main_province.split(','),
                                age_cuts: res.data.data[i].age_cuts.split(','),
                                u_id_1: res.data.data[i].u_name_1,
                                u_id_2: res.data.data[i].u_id_2 === null ? null : {
                                    value: res.data.data[i].u_id_2,
                                    label: res.data.data[i].u_name_2,
                                },
                            })
                        } else if (res.data.data[i].model === '社群团购') {
                            group_name = res.data.data[i].name
                            group_shop = res.data.data[i].shop
                            commission_normal = res.data.data[i].commission_normal
                            commission_welfare = res.data.data[i].commission_welfare
                            commission_bao = res.data.data[i].commission_bao
                            commission_note = res.data.data[i].commission_note
                            group_u_point_1 = res.data.data[i].u_point_1
                            group_u_id_2 = {
                                value: res.data.data[i].u_id_2,
                                label: res.data.data[i].u_name_2,
                            }
                            group_u_point_2 = res.data.data[i].u_point_2
                        } else if (res.data.data[i].model === '供货') {
                            provide_name = res.data.data[i].name
                            provide_shop = res.data.data[i].shop
                            discount_buyout = res.data.data[i].discount_buyout
                            discount_back = res.data.data[i].discount_back
                            discount_label = res.data.data[i].discount_label
                            provide_u_point_1 = res.data.data[i].u_point_1
                            provide_u_id_2 = {
                                value: res.data.data[i].u_id_2,
                                label: res.data.data[i].u_name_2,
                            }
                            provide_u_point_2 = res.data.data[i].u_point_2
                        }
                    }
                    form.setFieldsValue({
                        ...res.data.data[0],
                        talent_name: res.data.data[0].name,
                        talent_type: res.data.data[0].type,
                        m_id_1: {
                            value: res.data.data[0].m_id_1,
                            label: res.data.data[0].m_name_1,
                        },
                        m_id_2: {
                            value: res.data.data[0].m_id_2,
                            label: res.data.data[0].m_name_2,
                        },
                        u_id_0: {
                            value: res.data.data[0].u_id_0,
                            label: res.data.data[0].u_name_0,
                        },
                        group_name,
                        group_shop,
                        group_u_point_1,
                        group_u_id_2,
                        group_u_point_2,
                        commission_normal,
                        commission_welfare,
                        commission_bao,
                        commission_note,
                        provide_name,
                        provide_shop,
                        provide_u_point_1,
                        provide_u_id_2,
                        provide_u_point_2,
                        discount_buyout,
                        discount_back,
                        discount_label,
                        models,
                        accounts,
                        report_pic: res.data.data[0].report_pic.split(',')
                    });
                    setIsShowReport(true);
                    setType('reReport');
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
    // 下拉框
    const [baseSets, setBaseSets] = useState([])
    const getBaseSetItems = (type) => {
        request({
            method: 'post',
            url: '/base/getBaseSetItems',
            data: {
                type
            }
        }).then((res) => {
            if (res.status === 200) {
                if (res.data.code === 200) {
                    setBaseSets(res.data.data)
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
    const [users, setUsers] = useState()
    const getUserItems = (type) => {
        request({
            method: 'post',
            url: '/user/getUserItems',
            data: {
                type
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setUsers(res.data.data)
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
            <Card title="商机列表" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true); setType('添加商机'); }}>添加新商机</Button> : null}>
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
                    <Form.Item label='商机编号' name='cid'><Input /></Form.Item>
                    <Form.Item label='模式' name='models'> <Select options={model} /></Form.Item>
                    <Form.Item label='平台' name='platforms'><Select options={baseSets} onFocus={() => { getBaseSetItems('platform'); }} /></Form.Item>
                    <Form.Item label='达人名' name='account_names'><Input /></Form.Item>
                    <Form.Item label='联系人' name='liaison_name'><Input /></Form.Item>
                    <Form.Item label='商务' name='u_id'><Select options={users} onFocus={() => { getUserItems('saleman'); }} /></Form.Item>
                    <Form.Item label='状态' name='status'><Select options={chanceStatus} /></Form.Item>
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
                {examPower && waitSum !== 0 ? <Alert message={`还有 ${waitSum} 个达人未审批完毕`} type="warning" showIcon closable /> : null}
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
                onOK={(values) => { type === '添加商机' ? addChanceAPI(values) : type.match('修改商机') ? editChanceAPI(values) : type.match('推进商机') ? advanceChanceAPI({ ...values, names: clickName }) : null }}
                onCancel={() => { setIsShow(false); form.resetFields(); setType(''); }}
            />
            <AETalent
                isShow={isShowReport}
                type={type}
                form={form}
                onOK={(values) => { reportChanceAPI({ cid: clickCid, ...values }); }}
                onCancel={() => { setIsShowReport(false); form.resetFields(); setType(''); }}
            />
            <AENote
                title={noteType}
                isShow={isShowNote}
                value={note}
                onOk={(values) => {
                    if (noteType === '备注') {
                        editChanceAPI({ cid: clickCid, note: values }); 
                        setIsShowNote(false); setNote(); setNoteType();
                    } else if (noteType === '驳回理由') {
                        examChanceAPI({ cid: clickCid, names: clickName, exam: false, refund_note: values });
                        setIsShowNote(false); setNote(); setNoteType();
                    }
                }}
                onCancel={() => { setIsShowNote(false); setNote(); setNoteType(); }}
            />
        </Fragment >
    )
}

export default ChanceList