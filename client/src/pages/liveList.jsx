import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Select, Popover, List, message, Alert } from 'antd';
import { PlusOutlined, TransactionOutlined } from '@ant-design/icons';
import MyDateSelect from '../components/MyDateSelect'
import AELive from '../components/modals/AELive'
import { placeType, roomType } from '../baseData/live'
import dayjs from 'dayjs'

function LiveList() {
    // 操作权限
    const editPower = (localStorage.getItem('department') === '事业部' && localStorage.getItem('position') !== '副总' && localStorage.getItem('position') !== '助理') || localStorage.getItem('position') === '管理员' ? true : false
    const userShowPower = localStorage.getItem('position') === '商务' ? true : false

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'lid', key: 'lid' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        {
            title: '上播时间',
            dataIndex: 'start_time',
            key: 'start_time',
            render: (_, record) => (
                <span>{dayjs(Number(record.start_time)).format('YYYY-MM-DD HH:mm:ss')}</span>
            )
        },
        {
            title: '下播时间',
            dataIndex: 'end_time_0',
            key: 'end_time_0',
            render: (_, record) => (
                <span>{dayjs(Number(record.end_time_0)).format('YYYY-MM-DD HH:mm:ss')}</span>
            )
        },
        { title: '省份', dataIndex: 'place', key: 'place' },
        { title: '直播间', dataIndex: 'room', key: 'room' },
        { title: '主播', dataIndex: 'a_name_1', key: 'a_name_1' },
        { title: '副播', dataIndex: 'a_name_2', key: 'a_name_2' },
        { title: '中控', dataIndex: 'c_name_1', key: 'c_name_1' },
        { title: '服务商务', dataIndex: 'u_name_3', key: 'u_name_3' },
        {
            title: '专场GMV',
            dataIndex: 'sales',
            key: 'sales',
            render: (_, record) => (
                <Popover title="专场目标达成信息" content={
                    <List>
                        <List.Item>目标：{record.goal} 万</List.Item>
                        <List.Item>达成率：{(record.sales/record.goal*100).toFixed(0)} %</List.Item>
                    </List>}
                >
                    <span>{record.sales} 万</span>
                </Popover>
            )
        },
        {
            title: '商务归属',
            dataIndex: 'u_name',
            key: 'u_name',
            render: (_, record) => (
                <Popover title="商务信息" content={
                    <List>
                        <List.Item>主商务：{record.u_name_1}（{record.u_point_1}%）</List.Item>
                        <List.Item>副商务：{record.u_name_2}{record.u_name_2 ? `（${record.u_point_2}%）` : null}</List.Item>
                    </List>}
                >
                    <span>{record.u_name_1}, {record.u_name_2}</span>
                </Popover>
            )
        },
        {
            title: '佣金',
            dataIndex: 'commission',
            key: 'commission',
            render: (_, record) => (
                <Popover title="佣金信息" content={
                    <List>
                        <List.Item>线上：常规品（{record.commission_normal_on}%）福利品（{record.commission_welfare_on}%）爆品（{record.commission_bao_on}%）</List.Item>
                        <List.Item>线上佣金备注：{record.commission_note_on}</List.Item>
                        <List.Item>线下：常规品（{record.commission_normal_down}%）福利品（{record.commission_welfare_down}%）爆品（{record.commission_bao_down}%）</List.Item>
                        <List.Item>线下佣金备注：{record.commission_note_down}</List.Item>
                    </List>}
                >
                    <TransactionOutlined />
                </Popover>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                editPower ? <Space size="large">
                    <a onClick={() => {
                        setEditOri(record);
                        setType('edit');
                        setIsShow(true);
                        let tmids = []
                        for (let i = 0; i < record.tmids.split(',').length; i++) {
                            for (let j = 0; j < record.models.split(',').length; j++) {
                                if (i === j) {
                                    tmids.push({
                                        value: record.tmids.split(',')[i],
                                        label: record.models.split(',')[j]
                                    })
                                }
                            }
                        }
                        let r = {
                            ...record,
                            tid: {
                                value: record.tid,
                                label: record.name
                            },
                            tmids,
                            start_time: dayjs(Number(record.start_time)),
                            start_time_2: dayjs(Number(record.start_time_2)),
                            end_time_0: dayjs(Number(record.end_time_0)),
                            end_time: dayjs(Number(record.end_time)),
                            a_id_1: {
                                value: record.a_id_1,
                                label: record.a_name_1
                            },
                            a_id_2: {
                                value: record.a_id_2,
                                label: record.a_name_2
                            },
                            c_id_1: {
                                value: record.c_id_1,
                                label: record.c_name_1
                            },
                            s_id_1: {
                                value: record.s_id_1,
                                label: record.s_name_1
                            },
                            u_id_1: {
                                value: record.u_id_1,
                                label: record.u_name_1
                            },
                            u_id_2: {
                                value: record.u_id_2,
                                label: record.u_name_2
                            },
                            u_id_3: {
                                value: record.u_id_3,
                                label: record.u_name_3
                            }
                        }
                        form.setFieldsValue(r)
                    }}>修改信息</a>
                </Space> : null
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
            pageSize: 10,
            showTotal: ((total) => {
                return `共 ${total} 条`;
            }),
        }
    });
    const getLiveListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/live/getLiveList',
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
    const [dateSelect, setDateSelect] = useState()
    const [talentsItmes, setTalentsItmes] = useState([]);
    const searchTalentAPI = (value) => {
        request({
            method: 'post',
            url: '/talent/getTalentItems',
            data: {
                value,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setTalentsItmes(res.data.data)
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
    const filterOption = (input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    const [authorsItems, setAuthorsItems] = useState()
    const getAuthorsItemsAPI = (type) => {
        request({
            method: 'post',
            url: '/user/getAnthorItems',
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
                    if (type) {
                        setAuthorsItems(res.data.data)
                    } else {
                        let items = [
                            { label: null, value: null },
                            ...res.data.data
                        ]
                        setAuthorsItems(items)
                    }
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
    const [controlsItems, setControlsItems] = useState()
    const getControlsItemsAPI = (type) => {
        request({
            method: 'post',
            url: '/user/getControlItems',
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
                    if (type) {
                        setControlsItems(res.data.data)
                    } else {
                        let items = [
                            { label: null, value: null },
                            ...res.data.data
                        ]
                        setControlsItems(items)
                    }
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
    const [salemansItems, setSalemansItems] = useState()
    const getSalemansItemsAPI = (type) => {
        request({
            method: 'post',
            url: '/user/getSalemanItems',
            data: {
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    if (type) {
                        setSalemansItems(res.data.data)
                    } else {
                        let items = [
                            { label: null, value: null },
                            ...res.data.data
                        ]
                        setSalemansItems(items)
                    }
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
    const [salemanAssistantsItems, setSalemanAssistantsItems] = useState()
    const getSalemanAssistantsItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getSalemanAssistantItems',
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
                    setSalemanAssistantsItems(res.data.data)
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
    const [type, setType] = useState('')
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()
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
                    setIsShow(false);
                    setType('');
                    getLiveListAPI();
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
    const [editOri, setEditOri] = useState(false)
    const editLiveAPI = (payload) => {
        request({
            method: 'post',
            url: '/live/editLive',
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
                    getLiveListAPI();
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

    useEffect(() => {
        if (localStorage.getItem('uid') && localStorage.getItem('uid') === null) {
            navigate('/login')
            message.error('账号错误，请重新登录')
        }
        getLiveListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="专场列表" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setType('add_0'); setIsShow(true); }}>添加新专场</Button> : null}>
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
                            filtersDate: dateSelect,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='日期选择' name='date' style={{ marginBottom: '20px' }}>
                        <MyDateSelect selectType="date,week,month,quarter.year" setDate={(value) => { setDateSelect(value); }} />
                    </Form.Item>
                    <Form.Item label='编号' name='lid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='达人昵称' name='tid'>
                        <Select
                            style={{ width: 160 }}
                            showSearch
                            placeholder="请输入"
                            disabled={type === 'add' ? true : false}
                            onSearch={(value) => { searchTalentAPI(value); }}
                            filterOption={filterOption}
                            options={talentsItmes}
                            optionFilterProp="children"
                        />
                    </Form.Item>
                    <Form.Item label='省份' name='place' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={placeType} />
                    </Form.Item>
                    <Form.Item label='直播间' name='room' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={roomType} />
                    </Form.Item>
                    <Form.Item label='主播' name='a_id_1' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={authorsItems} onFocus={() => { getAuthorsItemsAPI(true); }} />
                    </Form.Item>
                    <Form.Item label='副播' name='a_id_2' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={authorsItems} onFocus={() => { getAuthorsItemsAPI(true); }} />
                    </Form.Item>
                    <Form.Item label='中控' name='c_id_1' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={controlsItems} onFocus={() => { getControlsItemsAPI(true); }} />
                    </Form.Item>
                    <Form.Item label='服务商务' name='u_id_3' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemansItemsAPI(true); }} />
                    </Form.Item>
                    <Form.Item label='主商务' name='u_id_1' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                    </Form.Item>
                    <Form.Item label='副商务' name='u_id_2' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
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
                <Table
                    style={{ margin: '20px auto' }}
                    rowKey={(data) => data.lid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <AELive
                isShow={isShow}
                type={type}
                form={form}
                onOK={(values) => {
                    let tmids = [], lid = editOri.lid
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
                    if (type === 'add_0') {
                        addLiveAPI(payload)
                    } else {
                        let ori = editOri
                        delete ori.create_time
                        delete ori.create_uid
                        delete ori.status
                        delete ori.lid
                        delete ori.a_name_1
                        delete ori.a_name_2
                        delete ori.c_name_1
                        delete ori.s_name_1
                        delete ori.u_name_1
                        delete ori.u_name_2
                        delete ori.u_name_3
                        ori["history_other_info"] = ori["history_other_info"] ? ori["history_other_info"] : ''
                        payload["history_other_info"] = form.getFieldValue('history_other_info') ? form.getFieldValue('history_other_info') : ''
                        let z = {}, y = {}
                        for (const o in ori) {
                            if (Object.hasOwnProperty.call(ori, o)) {
                                for (const v in payload) {
                                    if (Object.hasOwnProperty.call(payload, v)) {
                                        if (o === v && ori[o] !== payload[v]) {
                                            z[o] = ori[o]
                                            y[o] = payload[v]
                                        }
                                    }
                                }
                            }
                        }
                        if (Object.keys(z).length !== 0) {
                            z['userInfo'] = `${localStorage.getItem('name')}_${dayjs().valueOf()}`
                        }
                        if (`${ori["history_other_info"]}*${JSON.stringify(z)}`.length > 1024) {
                            message.error('字段存储空间不足，请联系开发人员')
                        } else {
                            editLiveAPI({
                                ...y,
                                lid,
                                history_other_info: `${ori["history_other_info"]}*${JSON.stringify(z)}`
                            });
                        }
                    }
                }}
                onCancel={() => { setIsShow(false); form.resetFields(); setType(''); }}
            />
        </Fragment>
    )
}

export default LiveList