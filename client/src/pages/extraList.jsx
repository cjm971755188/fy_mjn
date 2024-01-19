import React, { useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Select, Popover, List, message, Alert } from 'antd';
import { PlusOutlined, ClockCircleTwoTone, CloseCircleTwoTone, PauseCircleTwoTone } from '@ant-design/icons';
import MyDateSelect from '../components/MyDateSelect'
import AEExtra from '../components/modals/AEExtra'
import dayjs from 'dayjs'

function ExtraList() {
    // 操作权限
    const editPower = localStorage.getItem('position') === '商务' || localStorage.getItem('position') === '管理员' ? true : falsetrue

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'eid', key: 'eid' },
        {
            title: '结算月份',
            dataIndex: 'month',
            key: 'month',
            render: (_, record) => (
                <span>{dayjs(Number(record.month)).format('YYYY-MM')}</span>
            )
        },
        { title: '结算区间', dataIndex: 'area', key: 'area' },
        { title: '达人昵称', dataIndex: 'talent_name', key: 'talent_name' },
        {
            title: '合作模式',
            dataIndex: 'rules',
            key: 'rules',
            render: (_, record) => (
                <Popover title="合作模式" content={
                    <List>
                        {record.models && record.models.split(',').map((model, index) => {
                            return (
                                <List.Item key={index}>第 {index + 1} 个：{model}</List.Item>
                            )
                        })}
                    </List>}
                >
                    <span>{record.model_sum} 个</span>
                </Popover>
            )
        },
        {
            title: '结算规则',
            dataIndex: 'rules',
            key: 'rules',
            render: (_, record) => (
                <Popover title="结算规则" content={
                    <List>
                        {JSON.parse(record.rules).map((rule, index) => {
                            return (
                                <List.Item key={index}>第 {index + 1} 条：{rule.type.join('|')}：{rule.point}%</List.Item>
                            )
                        })}
                    </List>}
                >
                    <span>{JSON.parse(record.rules).length} 条</span>
                </Popover>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status === '待审批' ? <ClockCircleTwoTone twoToneColor="#ee9900" /> :
                        record.status === '被驳回' ? <CloseCircleTwoTone twoToneColor="#f81d22" /> :
                            record.status === '生效中' ? <PauseCircleTwoTone twoToneColor="#4ec9b0" /> : null}
                    <span>{record.status}</span>
                </Space>
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
                            tmids.push({
                                label: record.models.split(',')[i],
                                value: record.tmids.split(',')[i]
                            })
                        }
                        form.setFieldsValue({
                            ...record,
                            month: dayjs(Number(record.month)),
                            area: {
                                label: record.area,
                                value: record.area
                            },
                            tid: {
                                label: record.talent_name,
                                value: record.tid
                            },
                            tmids,
                            rules: JSON.parse(record.rules)
                        })
                    }}>修改信息</a>
                </Space> : null
            )
        }
    ]
    columns = editPower ? columns.filter(item => item.title !== '商务') : columns
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
    const getExtraListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/extra/getExtraList',
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

    // 添加新额外结佣
    const [type, setType] = useState('add')
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()
    const addExtraAPI = (payload) => {
        request({
            method: 'post',
            url: '/extra/addExtra',
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
                    setIsShow(false)
                    getExtraListAPI()
                    form.resetFields()
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
    const editExtraAPI = (payload) => {
        request({
            method: 'post',
            url: '/extra/editExtra',
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
                    setIsShow(false)
                    getExtraListAPI()
                    form.resetFields()
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
        getExtraListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card title="额外结佣列表" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setType('add'); setIsShow(true); }}>添加新额外结佣</Button> : null}>
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
                    <Form.Item label='编号' name='mid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='达人昵称' name='talent_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    {editPower ? null : <Form.Item label='商务' name='u_id' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                    </Form.Item>}
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
                    rowKey={(data) => data.eid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <AEExtra
                isShow={isShow}
                type={type}
                form={form}
                onOK={(values) => {
                    let r = []
                    for (let i = 0; i < values.rules.length; i++) {
                        r.push({
                            type: values.rules[i].type,
                            point: values.rules[i].point
                        })
                    }
                    let t = []
                    for (let i = 0; i < values.tmids.length; i++) {
                        t.push(values.tmids[i].value ? values.tmids[i].value : values.tmids[i])
                    }
                    let payload = {
                        ...values,
                        tid: values.tid ? values.tid.value || values.tid.value === null ? values.tid.value : values.tid : null,
                        area: values.area ? values.area.value || values.area.value === null ? values.area.value : values.area : null,
                        month: `${dayjs(values.month).valueOf()}`,
                        tmids: t.join(),
                        rules: JSON.stringify(r)
                    }
                    if (type === 'add') {
                        addExtraAPI(payload);
                    } else {
                        let eid = editOri.eid
                        let ori = editOri
                        delete ori.create_time
                        delete ori.status
                        delete ori.create_uid
                        delete ori.eid
                        delete ori.model_sum
                        delete ori.models
                        delete ori.talent_name
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
                        console.log(`${ori["history_other_info"]}*${JSON.stringify(z)}`.length);
                        if (`${ori["history_other_info"]}*${JSON.stringify(z)}`.length > 1024) {
                            message.error('字段存储空间不足，请联系开发人员')
                        } else {
                            console.log({
                                ...y,
                                eid,
                                history_other_info: `${ori["history_other_info"]}*${JSON.stringify(z)}`
                            });
                            editExtraAPI({
                                ...y,
                                eid,
                                history_other_info: `${ori["history_other_info"]}*${JSON.stringify(z)}`
                            });
                        }
                    }
                }}
                onCancel={() => { setIsShow(false); form.resetFields(); }}
            />
        </div>
    )
}

export default ExtraList