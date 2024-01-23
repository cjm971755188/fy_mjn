import React, { Fragment, useEffect, useState } from "react";
import { NavLink } from 'react-router-dom'
import request from '../service/request'
import { Card, Table, Space, Form, Input, Popover, Button, Select, List, message, Alert, Modal, Popconfirm } from 'antd';
import { PauseCircleTwoTone, ClockCircleTwoTone, StopTwoTone, PlusOutlined, CloseCircleTwoTone, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { model, uPoint0, talentStatus, yearboxStatus, modelStatus, talentType } from '../baseData/talent'
import AETalent from '../components/modals/AETalent'
import AELive from '../components/modals/AELive'
import dayjs from 'dayjs'
import FileSaver from 'file-saver'

const { TextArea } = Input;

function TalentList() {
    // 操作权限
    const editPower = localStorage.getItem('position') === '商务' || localStorage.getItem('position') === '管理员' ? true : false
    const examPower = localStorage.getItem('position') === '副总' || localStorage.getItem('position') === '总裁' || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'tid', key: 'tid' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        { title: '合作模式', dataIndex: 'models', key: 'models' },
        {
            title: '年度预估GMV',
            dataIndex: 'year_deal',
            key: 'year_deal',
            render: (_, record) => (<span>{record.year_deal} 万</span>)
        },
        {
            title: '层级',
            dataIndex: 'type',
            key: 'type',
            render: (_, record) => (<span>{record.type} 类</span>)
        },
        {
            title: '商务',
            dataIndex: 'u_names',
            key: 'u_names',
            render: (_, record) => (
                <Popover title="商务信息" content={
                    <List>
                        <List.Item>主商务：{record.u_name_1}</List.Item>
                        <List.Item>副商务：{record.u_name_2}</List.Item>
                        <List.Item>原商务：{record.u_name_0}</List.Item>
                    </List>}
                >
                    <span>{record.u_names}</span>
                </Popover>
            )
        },
        {
            title: '中间人',
            dataIndex: 'm_names',
            key: 'm_names',
            render: (_, record) => (
                <Popover title="中间人信息" content={
                    <List>
                        <List.Item>一级中间人：{record.m_name_1}</List.Item>
                        <List.Item>二级中间人：{record.m_name_2}</List.Item>
                    </List>}
                >
                    <span>{record.m_names}</span>
                </Popover>
            )
        },
        {
            title: '年框状态',
            dataIndex: 'yearbox_status',
            key: 'yearbox_status',
            render: (_, record) => (
                <Popover title="提点备注" content={
                    <List style={{ marginLeft: '10px' }}>
                        {record.yearbox_start_date !== null ? <List.Item key={9999}>生效时间：{dayjs(Number(record.yearbox_start_date)).format('YYYY-MM-DD')}</List.Item> : null}
                        {record.yearbox_lavels_base !== null ? <List.Item key={0}>0：每个专场基础提点 {record.yearbox_lavels_base}% 【一专场一付】</List.Item> : null}
                        {JSON.parse(record.yearbox_lavels) && JSON.parse(record.yearbox_lavels).length > 0 && JSON.parse(record.yearbox_lavels).map((item, index) => {
                            return (
                                <List.Item key={index + 1}>{index + 1}：每{record.yearbox_cycle.slice(0, 2)}成交额达到 {item[`y_lavel_${index + 1}`]}万，提点 {item[`y_point_${index + 1}`]}%</List.Item>
                            )
                        })}
                    </List>
                }>
                    <Space size="small">
                        {record.yearbox_start_date === null ? <StopTwoTone twoToneColor="#999999" /> :
                            dayjs(Number(record.yearbox_start_date)).add(1, 'year') < dayjs() ? <CloseCircleTwoTone twoToneColor="#f81d22" /> :
                                record.status === '年框待审批' ? <ClockCircleTwoTone twoToneColor="#ee9900" /> : <PauseCircleTwoTone twoToneColor="#4ec990" />}
                        <span>{record.yearbox_start_date === null ? '暂无' : dayjs(Number(record.yearbox_start_date)).add(1, 'year') < dayjs() ? '已失效' : record.status === '年框待审批' ? '待审批' : '生效中'}</span>
                    </Space>
                </Popover>
            )
        },
        {
            title: '合作协议状态',
            dataIndex: 'model_status',
            key: 'model_status',
            render: (_, record) => (
                <Space size="small">
                    {record.model_status === '暂无' ? <StopTwoTone twoToneColor="#999999" /> : <PauseCircleTwoTone twoToneColor="#4ec990" />}
                    <span>{record.model_status}</span>
                </Space>
            )
        },
        {
            title: '达人状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status.match('待审批') ? <ClockCircleTwoTone twoToneColor="#ee9900" /> :
                        record.status.match('报备驳回') ? <CloseCircleTwoTone twoToneColor="#f81d22" /> :
                            record.status.match('已撤销') ? <CloseCircleTwoTone twoToneColor="#f81d22" /> :
                                record.status === '合作中' ? <PauseCircleTwoTone twoToneColor="#4ec990" /> : null}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '合作专场',
            dataIndex: 'live',
            key: 'live',
            render: (_, record) => (
                <span>{record.live_count} 场（{record.live_sum ? record.live_sum : 0} 万）</span>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    {examPower && record.status.match('待审批') ? <NavLink to='/admin/talent/talent_list/talent_detail' state={{ tid: record.tid }}>审批</NavLink> :
                        record.status === '报备驳回' || record.status === '已撤销' ? null : <NavLink to='/admin/talent/talent_list/talent_detail' state={{ tid: record.tid }}>查看详情</NavLink>}
                    {editPower && record.status === '报备待审批' ? <Popconfirm
                        title="确认要撤销该申请吗"
                        okText="撤销"
                        cancelText="取消"
                        onConfirm={() => {
                            revokeReportAPI({ tid: record.tid });
                        }}
                    >
                        <a>撤销</a>
                    </Popconfirm> : null}
                    {editPower && record.status === '合作中' ? <><a onClick={() => {
                        setClickTid(record.tid);
                        setIsShowGive(true);
                    }}>移交</a>
                        <a onClick={() => {
                            setLiveType('add');
                            setIsShowLive(true);
                            liveForm.setFieldValue('name', record.name);
                            liveForm.setFieldValue('tid', record.tid);
                        }}>添加专场</a></> : null}
                    {record.status === '报备驳回' ? <><a onClick={() => { getRefundReasonAPI({ tid: record.tid }); }}>查看驳回备注</a>
                        <a onClick={() => { setClickTid(record.tid); getReportInfoAPI({ tid: record.tid }); }}>重新报备</a></> : null}
                    {record.status === '已撤销' ? <a onClick={() => { setClickTid(record.tid); getReportInfoAPI({ tid: record.tid }); }}>重新报备</a> : null}
                </Space>
            )
        }
    ]
    // 表格：获取数据、分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filters: {},
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const getTalentListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/talent/getTalentList',
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
    const [salemansItems, setSalemansItems] = useState()
    const getSalemansItemsAPI = () => {
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
    const [middlemansItems, setMiddlemansItems] = useState()
    const getmiddlemansItemsAPI = () => {
        request({
            method: 'post',
            url: '/middleman/getmiddlemansItems',
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
                    setMiddlemansItems(res.data.data)
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
    const addHistoryTalentAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/reportChance',
            data: {
                ...payload,
                operate: '达人报备',
                clickTid,
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
                    setClickTid('');
                    getTalentListAPI();
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
    // 移交
    const [isShowGive, setIsShowGive] = useState()
    const [formGive] = Form.useForm()
    const [clickTid, setClickTid] = useState('')
    const giveTalentAPI = () => {
        request({
            method: 'post',
            url: '/talent/giveTalent',
            data: {
                tid: clickTid,
                newUid: formGive.getFieldValue('u_id'),
                uPoint0: formGive.getFieldValue('u_point'),
                operate: '达人移交',
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
                    setIsShowGive(false);
                    formGive.resetFields();
                    setClickTid('');
                    getTalentListAPI();
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
    // 专场
    const [liveType, setLiveType] = useState('')
    const [isShowLive, setIsShowLive] = useState(false)
    const [liveForm] = Form.useForm()
    const addLiveAPI = (payload) => {
        request({
            method: 'post',
            url: '/live/addLive',
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
                    setIsShowLive(false);
                    setLiveType('');
                    getTalentListAPI();
                    liveForm.resetFields();
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
            url: '/talent/getRefundReasonT',
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
    // 撤销报备
    const revokeReportAPI = (payload) => {
        request({
            method: 'post',
            url: '/talent/revokeReport',
            data: {
                tid: payload.tid,
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
                    getTalentListAPI();
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    // 获取上次报备信息
    const getReportInfoAPI = (payload) => {
        request({
            method: 'post',
            url: '/talent/getReportInfo',
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
                        accounts
                    });
                    setIsShow(true);
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
    // 导出
    let exportColumns = [
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        { title: '层级', dataIndex: 'type', key: 'type' },
        { title: '专场销售额(万)', dataIndex: 'live_sum', key: 'live_sum' },
        { title: '商务', dataIndex: 'u_names', key: 'u_names' }
    ]
    const getExportTalentListAPI = () => {
        request({
            method: 'post',
            url: '/talent/getExportTalentList',
            data: {
                filters: tableParams.filters,
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
                    exportTabel(res.data.data);
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const exportTabel = (exportData) => {
        let blobData = '\uFEFF' // 字节顺序标记 使用了BOM或者utf-16？
        blobData += `${exportColumns.map(item => item.title).join(',')} \n`
        exportData.forEach(item => {
            const itemData = []
            exportColumns.forEach(ele => {
                let val = item[ele.dataIndex] || null
                if ((+val).toString() === val) { // 判断当前值是否为纯数字
                    val = `\t${val.toString()}` // 纯数字加一个制表符，正常文件中不显示，但是会让excel不再特殊处理纯数字字符串
                }
                if (ele.dataIndex === 'create_time') { // 判断当前值是否为日期
                    val = `\t${dayjs(Number(val)).format('YYYY-MM-DD HH:mm:ss')}`
                }
                itemData.push(val)
            })
            blobData += `${itemData}\n`
        })
        const blob = new Blob([blobData], {
            // type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet’, // xlsx
            type: 'application/vnd.ms-excel;charset=utf-8', // xls
        });
        FileSaver.saveAs(blob, `CRM系统达人导出-${+new Date()}.xls`);
    }

    useEffect(() => {
        if (localStorage.getItem('uid') && localStorage.getItem('uid') === null) {
            navigate('/login')
            message.error('账号错误，请重新登录')
        }
        getTalentListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="达人列表" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true); setType('history'); }}>添加历史达人</Button> :
                <Button type="primary" icon={<VerticalAlignBottomOutlined />} onClick={() => { getExportTalentListAPI(); }}>导出（层级专场）</Button>}>
                <Form
                    layout="inline"
                    form={filterForm}
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            pagination: {current: 1, pageSize: 10},
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='编号' name='tid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='达人名称' name='name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='合作模式' name='models'>
                        <Select style={{ width: 160 }} options={model} />
                    </Form.Item>
                    <Form.Item label='达人层级' name='type'>
                        <Select style={{ width: 160 }} options={talentType} />
                    </Form.Item>
                    {editPower ? null : <Form.Item label='商务' name='u_ids' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                    </Form.Item>}
                    <Form.Item label='中间人' name='m_ids' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={middlemansItems} onFocus={() => { getmiddlemansItemsAPI(); }} />
                    </Form.Item>
                    <Form.Item label='年框状态' name='yearbox_status'>
                        <Select style={{ width: 160 }} options={yearboxStatus} />
                    </Form.Item>
                    <Form.Item label='合作协议状态' name='model_status'>
                        <Select style={{ width: 160 }} options={modelStatus} />
                    </Form.Item>
                    <Form.Item label='达人状态' name='status'>
                        <Select style={{ width: 160 }} options={talentStatus} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: '20px' }}>
                        <Space size={'large'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                filterForm.resetFields();
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
                    rowKey={(data) => data.tid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <AETalent
                isShow={isShow}
                type={type}
                form={form}
                onOK={(values) => { addHistoryTalentAPI(values); }}
                onCancel={() => { setIsShow(false); form.resetFields(); setType(''); setClickTid(''); }}
            />
            <Modal title="移交达人" open={isShowGive} onOk={() => { giveTalentAPI(); }} onCancel={() => { setIsShowGive(false); }}>
                <Form form={formGive}>
                    <Form.Item label="承接商务" name="u_id" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                    </Form.Item>
                    <Form.Item label="原商务（自己）提点（%）" name="u_point" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={uPoint0} />
                    </Form.Item>
                </Form>
            </Modal>
            <AELive
                isShow={isShowLive}
                type={liveType}
                form={liveForm}
                onOK={(values) => {
                    let tmids = []
                    for (let i = 0; i < values.tmids.length; i++) {
                        tmids.push(values.tmids[i] ? values.tmids[i].value || values.tmids[i].value === null ? values.tmids[i].value : values.tmids[i] : null)
                    }
                    let payload = {
                        ...values,
                        tid: values.tid ? values.tid.value || values.tid.value === null ? values.tid.value : values.tid : null,
                        start_time: dayjs(values.start_time).valueOf(),
                        start_time_2: dayjs(values.start_time_2).valueOf(),
                        end_time_0: dayjs(values.end_time_0).valueOf(),
                        end_time: dayjs(values.end_time).valueOf(),
                        tmids: tmids.join(),
                        a_id_1: values.a_id_1 ? values.a_id_1.value || values.a_id_1.value === null ? values.a_id_1.value : values.a_id_1 : null,
                        a_id_2: values.a_id_2 ? values.a_id_2.value || values.a_id_2.value === null ? values.a_id_2.value : values.a_id_2 : null,
                        c_id_1: values.c_id_1 ? values.c_id_1.value || values.c_id_1.value === null ? values.c_id_1.value : values.c_id_1 : null,
                        s_id_1: values.s_id_1 ? values.s_id_1.value || values.s_id_1.value === null ? values.s_id_1.value : values.s_id_1 : null,
                        u_id_3: values.u_id_3 ? values.u_id_3.value || values.u_id_3.value === null ? values.u_id_3.value : values.u_id_3 : null,
                        u_id_1: values.u_id_1 ? values.u_id_1.value || values.u_id_1.value === null ? values.u_id_1.value : values.u_id_1 : null,
                        u_id_2: values.u_id_2 ? values.u_id_2.value || values.u_id_2.value === null ? values.u_id_2.value : values.u_id_2 : null
                    }
                    addLiveAPI(payload)
                }}
                onCancel={() => { setIsShowLive(false); liveForm.resetFields(); setLiveType(''); }}
            />
            <Modal title="报备驳回备注" open={isShowCheckNo} onOk={() => { setIsShowCheckNo(false); }} onCancel={() => { setIsShowCheckNo(false); }}>
                <TextArea placeholder="请输入" value={checkNoReason} disabled={true} />
            </Modal>
        </Fragment>
    )
}

export default TalentList