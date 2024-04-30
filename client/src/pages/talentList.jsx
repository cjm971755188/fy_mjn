import React, { Fragment, useEffect, useState } from "react";
import { NavLink } from 'react-router-dom'
import request from '../service/request'
import { Card, Table, Space, Form, Input, Popover, Button, Select, List, message, Alert, Modal, Popconfirm, Divider, Row } from 'antd';
import { PauseCircleTwoTone, ClockCircleTwoTone, StopTwoTone, PlusOutlined, CloseCircleTwoTone, VerticalAlignBottomOutlined, FireTwoTone, ClockCircleOutlined, QuestionCircleTwoTone } from '@ant-design/icons';
import { model, uPoint0, talentStatus, yearboxStatus, talentType, accountModelType, saleStatus, stagnateLavel } from '../baseData/talent'
import AETalent from '../components/modals/AETalent'
import dayjs from 'dayjs'
import FileSaver from 'file-saver'
import MyECharts from '../components/MyECharts'

const { TextArea } = Input;

function TalentList() {
    // 操作权限
    const editPower = (localStorage.getItem('department') === '事业部' && localStorage.getItem('company') !== '总公司') || localStorage.getItem('position') === '管理员' ? true : false
    const examPower = localStorage.getItem('position') === '副总' || localStorage.getItem('position') === '总裁' || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'tid', key: 'tid' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        { title: '账号类型', dataIndex: 'account_type', key: 'account_type', width: 130 },
        { title: '模式', dataIndex: 'models', key: 'models', width: 90 },
        { title: '平台', dataIndex: 'platforms', key: 'platforms', width: 80 },
        { title: '销售模式', dataIndex: 'account_models', key: 'account_models', width: 130 },
        {
            title: '年度预估GMV',
            dataIndex: 'year_deal',
            key: 'year_deal',
            width: 90,
            render: (_, record) => (<span>{record.year_deal} 万</span>)
        },
        {
            title: '层级',
            dataIndex: 'type',
            key: 'type',
            width: 60,
            render: (_, record) => (<span>{record.type} 类</span>)
        },
        {
            title: '商务',
            dataIndex: 'u_name',
            key: 'u_name',
            width: 80,
            render: (_, record) => {
                let u_name = new Set().add(record.u_name_1).add(record.u_name_2).add(record.u_name_0)
                return (
                    <Popover title="商务信息" content={
                        <List>
                            <List.Item>主商务：{record.u_name_1 ? `${record.u_name_1}(${record.u_point_1}%)` : null}</List.Item>
                            <List.Item>副商务：{record.u_name_2 ? `${record.u_name_2}(${record.u_point_2}%)` : null}</List.Item>
                            <List.Item>原商务：{record.u_name_0 ? `${record.u_name_0}(${record.u_point_0}%)` : null}</List.Item>
                            <List.Item>提点备注：{record.u_note}</List.Item>
                            <List.Item>业绩归属类型：{record.gmv_belong}</List.Item>
                        </List>}
                    >
                        <span>{[...u_name].filter(item => item !== null).join(',')}</span>
                    </Popover>
                )
            }
        },
        {
            title: '中间人',
            dataIndex: 'm_name',
            key: 'm_name',
            width: 120,
            render: (_, record) => {
                let m_name = new Set().add(record.m_name_1).add(record.m_name_2)
                return (
                    <Popover title="中间人信息" content={
                        <List>
                            <List.Item>一级中间人：{record.m_name_1 ? `${record.m_name_1}(${record.m_point_1}%)` : null}</List.Item>
                            <List.Item>二级中间人：{record.m_name_2 ? `${record.m_name_2}(${record.m_point_2}%)` : null}</List.Item>
                        </List>}
                    >
                        <span>{[...m_name].filter(item => item !== null).join(',')}</span>
                    </Popover>
                )
            }
        },
        {
            title: '年框状态',
            dataIndex: 'yearbox_status',
            key: 'yearbox_status',
            width: 120,
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
            title: '达人状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
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
            title: '销售状态',
            dataIndex: 'sale_type',
            key: 'sale_type',
            width: 120,
            render: (_, record) => (
                <Popover title="销售情况（2022年起）" content={<>
                    <List split={false}>
                        <List.Item>销售时间【{dayjs(record.lastsale * 1000).diff(dayjs(record.startsale * 1000), 'day')}天】{record.sale_type === null ? null : `：${dayjs(record.startsale * 1000).format('YYYY-MM-DD')} ~ ${dayjs(record.lastsale * 1000).format('YYYY-MM-DD')}`}</List.Item>
                        <List.Item>总销售：{record.sale_type === null ? '0 元' : `${(record.price || 0).toLocaleString("en")} 元 【成交 ${(record.done / record.price * 100).toFixed(2)}%, 发货退货 ${(record.eback / record.price * 100).toFixed(2)}%, 未发货退货 ${(record.noeback / record.price * 100).toFixed(2)}%, 在途 ${(record.wait / record.price * 100).toFixed(2)}%】`}</List.Item>
                        <List.Item>日播：{record.sale_type === null ? '0 元' : `${(record.daily_price || 0).toLocaleString("en")} 元 【成交 ${record.daily_price === 0 ? 0 : (record.daily_done / record.daily_price * 100).toFixed(2)}%, 发货退货 ${record.daily_price === 0 ? 0 : (record.daily_eback / record.daily_price * 100).toFixed(2)}%, 
                            未发货退货 ${record.daily_price === 0 ? 0 : (record.daily_noeback / record.daily_price * 100).toFixed(2)}%, 在途 ${record.daily_price === 0 ? 0 : (record.daily_wait / record.daily_price * 100).toFixed(2)}%】`}</List.Item>
                        <List.Item>专场：{record.sale_type === null ? '0 元' : `${(record.live_price || 0).toLocaleString("en")} 元 【成交 ${record.live_price === 0 ? 0 : (record.live_done / record.live_price * 100).toFixed(2)}%, 发货退货 ${record.live_price === 0 ? 0 : (record.live_eback / record.live_price * 100).toFixed(2)}%, 
                            未发货退货 ${record.live_price === 0 ? 0 : (record.live_noeback / record.live_price * 100).toFixed(2)}%, 在途 ${record.live_price === 0 ? 0 : (record.live_wait / record.live_price * 100).toFixed(2)}%】`}</List.Item>
                    </List>
                    {record.sale_type === null ? null : <>
                        <Divider />
                        <Row>2024年总销售：{record.sale_type === null ? '0 元' : `${(record.year_price || 0).toLocaleString("en")} 元`}</Row>
                        <Card style={{ marginTop: '20px' }}>
                            <MyECharts width='800px' height={400} option={{
                                tooltip: {
                                    trigger: 'item'
                                },
                                legend: {},
                                grid: {
                                    left: '10%',
                                    right: '10%',
                                    top: '10%',
                                    button: '5%'
                                },
                                xAxis: {
                                    type: 'category',
                                    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                                },
                                yAxis: {
                                    type: 'value'
                                },
                                series: [
                                    {
                                        name: '销售额',
                                        type: 'line',
                                        data: [record.Jan, record.Feb, record.Mar, record.Apr],
                                    }
                                ]
                            }} />
                        </Card>
                    </>}
                </>}
                >
                    <span style={{ color: `${record.sale_type === '停滞' ? '#ee9900' : record.sale_type === '即将过期' ? '#c41d7f' : record.sale_type === '已过期' ? '#f81d22' : null}` }}>
                        {record.sale_type === '在售' ? <FireTwoTone twoToneColor="#4ec990" /> : record.sale_type === '停滞' ? <QuestionCircleTwoTone twoToneColor="#ee9900" /> :
                            record.sale_type === '即将过期' ? <ClockCircleTwoTone twoToneColor="#c41d7f" /> : record.sale_type === '已过期' ? <ClockCircleOutlined twoToneColor="#f81d22" /> : <StopTwoTone twoToneColor="#999999" />}
                        {record.sale_type === '停滞' ? ' ' + record.sale_type + record.days + '天' : record.sale_type === '即将过期' ? ' 停滞' + record.days + '天' + record.sale_type :
                            record.sale_type === '已过期' ? ' 停滞' + record.days + '天' + record.sale_type : ` ${record.sale_type}`}</span>
                </Popover>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    {examPower && record.status.match('待审批') ? <NavLink to='/admin/talent/talent_list/talent_detail' state={{ tid: record.tid }}>审批</NavLink> :
                        record.status === '报备驳回' || record.status === '已撤销' ? null :
                            <NavLink to='/admin/talent/talent_list/talent_detail' state={{ tid: record.tid, tableParams: { ...tableParams, pagination: { ...tableParams.pagination, showTotal: null } } }}>查看详情</NavLink>}
                    {editPower && record.status.match('待审批') ? <Popconfirm
                        title="确认要撤销该申请吗"
                        okText="撤销"
                        cancelText="取消"
                        onConfirm={() => {
                            if (record.status === '报备待审批') {
                                revokeReport({ tid: record.tid });
                            } else {
                                revokeOthers({ tid: record.tid });
                            }
                        }}
                    >
                        <a>撤销</a>
                    </Popconfirm> : null}
                    {editPower && record.status === '合作中' ? <a onClick={() => {
                        setClickTid(record.tid);
                        setIsShowGive(true);
                    }}>移交</a> : null}
                    {record.status === '报备驳回' ? <><a onClick={() => { getRefundReasonAPI({ tid: record.tid }); }}>查看驳回备注</a>
                        <a onClick={() => { setClickCid(record.cid); setClickTid(record.tid); getReportInfo({ tid: record.tid }); }}>重新报备</a></> : null}
                    {record.status === '已撤销' ? <a onClick={() => { setClickCid(record.cid); setClickTid(record.tid); getReportInfo({ tid: record.tid }); }}>重新报备</a> : null}
                    {editPower && record.status === '合作中' ? <a style={{ color: 'red' }} onClick={() => { setClickTid(record.tid); setIsShowBlock(true); }}>拉黑</a> : null}
                </Space>
            )
        }
    ]
    // 表格：获取数据、分页
    const [data, setData] = useState();
    const [waitSum, setWaitSum] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filtersDate: [],
        filters: {},
        sorter: '',
        pagination: {
            current: 1,
            pageSize: 10,
            showTotal: ((total) => {
                return `共 ${total} 条`;
            }),
        }
    });
    const getTalentListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/talent/getTalentList',
            data: {
                filtersDate: tableParams.filtersDate,
                filters: tableParams.filters,
                sorter: tableParams.sorter,
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
                    let d = res.data.data
                    for (let i = 0; i < res.data.data.length; i++) {
                        d[i].account_models = res.data.data[i].account_models ? [...new Set(res.data.data[i].account_models.split(','))].sort().join() : null
                    }
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
            filtersDate: tableParams.filtersDate,
            sorter: tableParams.sorter,
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }
    // 查询、清空筛选
    const [filterForm] = Form.useForm()
    const [sortForm] = Form.useForm()

    // 添加
    const [type, setType] = useState('')
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()
    const [clickCid, setClickCid] = useState('')
    const addHistoryTalent = (payload) => {
        request({
            method: 'post',
            url: '/chance/reportChance',
            data: {
                cid: clickCid,
                ...payload,
                operate: '达人报备',
                clickTid,
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
    const giveTalent = () => {
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
    // 撤销
    const revokeReport = (payload) => {
        request({
            method: 'post',
            url: '/talent/revokeReport',
            data: {
                tid: payload.tid,
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
                    getTalentListAPI();
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const revokeOthers = (payload) => {
        request({
            method: 'post',
            url: '/talent/revokeOthers',
            data: {
                tid: payload.tid,
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
    const getReportInfo = (payload) => {
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
                    let models = [], accounts = [], group_name = null, group_shop = null, group_u_id_1 = null, group_u_point_1 = null, group_u_id_2 = null, group_u_point_2 = null,
                        provide_name = null, provide_shop = null, provide_u_id_1 = null, provide_u_point_1 = null, provide_u_id_2 = null, provide_u_point_2 = null,
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
                                u_id_1: res.data.data[i].u_id_1,
                                u_id_2: res.data.data[i].u_id_2 === null ? null : {
                                    value: res.data.data[i].u_id_2,
                                    label: res.data.data[i].u_name_2,
                                },
                            })
                        } else if (res.data.data[i].model === '社群团购') {
                            group_name = res.data.data[i].name
                            group_shop = res.data.data[i].shop_name
                            commission_normal = res.data.data[i].commission_normal
                            commission_welfare = res.data.data[i].commission_welfare
                            commission_bao = res.data.data[i].commission_bao
                            commission_note = res.data.data[i].commission_note
                            group_u_id_1 = {
                                value: res.data.data[i].u_id_1,
                                label: res.data.data[i].u_name_1,
                            }
                            group_u_point_1 = res.data.data[i].u_point_1
                            group_u_id_2 = {
                                value: res.data.data[i].u_id_2,
                                label: res.data.data[i].u_name_2,
                            }
                            group_u_point_2 = res.data.data[i].u_point_2
                        } else if (res.data.data[i].model === '供货') {
                            provide_name = res.data.data[i].name
                            provide_shop = res.data.data[i].shop_name
                            discount_buyout = res.data.data[i].discount_buyout
                            discount_back = res.data.data[i].discount_back
                            discount_label = res.data.data[i].discount_label
                            provide_u_id_1 = {
                                value: res.data.data[i].u_id_1,
                                label: res.data.data[i].u_name_1,
                            }
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
                        group_u_id_1,
                        group_u_point_1,
                        group_u_id_2,
                        group_u_point_2,
                        commission_normal,
                        commission_welfare,
                        commission_bao,
                        commission_note,
                        provide_name,
                        provide_shop,
                        provide_u_id_1,
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
        { title: '平台', dataIndex: 'platforms', key: 'platforms' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        { title: '账号类型', dataIndex: 'account_type', key: 'account_type' },
        { title: '层级', dataIndex: 'type', key: 'type' },
        { title: '销售状态', dataIndex: 'sale_type', key: 'sale_type' },
        { title: '停滞天数', dataIndex: 'days', key: 'days' },
        { title: '总销售额', dataIndex: 'price', key: 'price' },
        { title: '成交额', dataIndex: 'done', key: 'done' },
        { title: '日播销售额', dataIndex: 'daily_price', key: 'daily_price' },
        { title: '日播成交额', dataIndex: 'daily_done', key: 'daily_done' },
        { title: '专场销售额', dataIndex: 'live_price', key: 'live_price' },
        { title: '专场成交额', dataIndex: 'live_done', key: 'live_done' },
        { title: '主商务', dataIndex: 'u_name_1', key: 'u_name_1' },
        { title: '副商务', dataIndex: 'u_name_2', key: 'u_name_2' },
        { title: '原商务', dataIndex: 'u_name_0', key: 'u_name_0' }
    ]
    const getExportTalentList = () => {
        request({
            method: 'post',
            url: '/talent/getExportTalentList',
            data: {
                filters: tableParams.filters,
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
                let val = item[ele.dataIndex] === null ? null : item[ele.dataIndex].toString().replace(',', '/').replace(',', '/').replace(',', '/').replace(',', '/')
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
    // 拉黑达人
    const [isShowBlock, setIsShowBlock] = useState(false)
    const [blockReason, setBlockReason] = useState()
    const editTalentAPI = (operate, ori, payload) => {
        request({
            method: 'post',
            url: '/talent/editTalent',
            data: {
                tid: clickTid,
                operate,
                ori,
                new: payload,
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
                    setIsShowBlock(false);
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

    // 获取下拉框
    const [baseSets, setBaseSets] = useState([])
    const getBaseSetItems = (payload) => {
        request({
            method: 'post',
            url: '/base/getBaseSetItems',
            data: {
                type: payload
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
    const [salemans, setSalemans] = useState()
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
                    setSalemans(res.data.data)
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
        if (localStorage.getItem('uid') && localStorage.getItem('uid') === null) {
            navigate('/login')
            message.error('账号错误，请重新登录')
        }
        getTalentListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="达人列表" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true); setType('history'); }}>添加历史达人</Button> :
                <Button type="primary" icon={<VerticalAlignBottomOutlined />} onClick={() => { getExportTalentList(); }}>导出</Button>}>
                <Form
                    layout="inline"
                    form={filterForm}
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
                    <Form.Item label='达人名称' name='name' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='账号类型' name='account_type' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={baseSets} onClick={() => { getBaseSetItems('account'); }} />
                    </Form.Item>
                    <Form.Item label='合作模式' name='models' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={model} />
                    </Form.Item>
                    <Form.Item label='平台' name='platforms' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={baseSets} onFocus={() => { getBaseSetItems('platform'); }} />
                    </Form.Item>
                    <Form.Item label='销售模式' name='account_models' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={accountModelType} />
                    </Form.Item>
                    <Form.Item label='达人层级' name='type' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={talentType} />
                    </Form.Item>
                    <Form.Item label='商务' name='u_names' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='原商务' name='u_name_0' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='中间人' name='m_names' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='年框状态' name='yearbox_status' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={yearboxStatus} />
                    </Form.Item>
                    <Form.Item label='达人状态' name='status' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={talentStatus} />
                    </Form.Item>
                    <Form.Item label='销售状态' name='sale_type' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={saleStatus} />
                    </Form.Item>
                    <Form.Item label='停滞层级' name='stagnate_lavel' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={stagnateLavel} />
                    </Form.Item>
                    <Form.Item style={{ margin: '0 10px 10px 0' }}>
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
                <Form
                    layout="inline"
                    form={sortForm}
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            sorter: values
                        })
                    }}
                >
                    <Form.Item label='排列顺序' name='sort' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={[{ key: 0, label: '年度预估GMV', value: 'year_deal' }, { key: 1, label: '当年销售额', value: 'year_price' }, { key: 2, label: '停滞天数', value: 'days' }]} />
                    </Form.Item>
                    <Form.Item style={{ margin: '0 10px 10px 0' }}>
                        <Space size={'large'}>
                            <Button type="primary" htmlType="submit">排序</Button>
                            <Button type="primary" onClick={() => {
                                sortForm.resetFields();
                                setTableParams({
                                    ...tableParams,
                                    sorter: {}
                                })
                            }}>清空排序</Button>
                        </Space>
                    </Form.Item>
                </Form>
                {examPower && waitSum !== 0 ? <Alert message={`还有 ${waitSum} 个达人未审批完毕`} type="warning" showIcon closable /> : null}
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
                onOK={(values) => { addHistoryTalent(values); }}
                onCancel={() => { setIsShow(false); form.resetFields(); setType(''); setClickTid(''); }}
            />
            <Modal title="移交达人" open={isShowGive} onOk={() => { giveTalent(); }} onCancel={() => { setIsShowGive(false); }}>
                <Form form={formGive}>
                    <Form.Item label="承接商务" name="u_id" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={salemans} onFocus={() => { getSalemanItems(); }} />
                    </Form.Item>
                    <Form.Item label="原商务（自己）提点（%）" name="u_point" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={uPoint0} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title="报备驳回备注" open={isShowCheckNo} onOk={() => { setIsShowCheckNo(false); }} onCancel={() => { setIsShowCheckNo(false); }}>
                <TextArea placeholder="请输入" value={checkNoReason} disabled={true} />
            </Modal>
            <Modal title="拉黑原因" open={isShowBlock} onOk={() => { editTalentAPI('拉黑达人', null, { block_note: blockReason }); setBlockReason(); }} onCancel={() => { setIsShowBlock(false); setBlockReason(); }}>
                <TextArea placeholder="请输入" value={blockReason} onChange={(e) => { setBlockReason(e.target.value); }} />
            </Modal>
        </Fragment>
    )
}

export default TalentList