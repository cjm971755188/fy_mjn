import React, { useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Select, Popover, List, message, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { middleType } from '../baseData/talent'
import AEMiddleman from '../components/modals/AEMiddleman'
import dayjs from 'dayjs'

function MiddlemanList() {
    // 操作权限
    const editPower = (localStorage.getItem('department') === '事业部' && localStorage.getItem('company') !== '总公司') || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'mid', key: 'mid' },
        { title: '类型', dataIndex: 'type', key: 'type' },
        { title: '名称', dataIndex: 'name', key: 'name' },
        {
            title: '联系人信息',
            dataIndex: 'liaison_name',
            key: 'liaison_name',
            render: (_, record) => (
                <Popover title="联系人信息" content={
                    <List>
                        <List.Item>姓名：{record.liaison_name}</List.Item>
                        <List.Item>微信：{record.liaison_v}</List.Item>
                        <List.Item>手机号：{record.liaison_phone}</List.Item>
                    </List>}
                >
                    <span>{record.liaison_name}</span>
                </Popover>
            )
        },
        { title: '付款类型', dataIndex: 'pay_way', key: 'pay_way' },
        { title: '能否开票', dataIndex: 'can_piao', key: 'can_piao' },
        { title: '票型', dataIndex: 'piao_type', key: 'piao_type' },
        { title: '税点', dataIndex: 'shui_point', key: 'shui_point' },
        {
            title: '付款信息',
            dataIndex: 'pay_name',
            key: 'pay_name',
            render: (_, record) => (
                <Popover title="付款信息" content={
                    <List>
                        <List.Item>付款姓名：{record.pay_name}</List.Item>
                        <List.Item>开户行：{record.pay_bank}</List.Item>
                        <List.Item>账号：{record.pay_account}</List.Item>
                    </List>}
                >
                    <span>{record.pay_name}</span>
                </Popover>
            )
        },
        { title: '商务', dataIndex: 'u_name', key: 'u_name' },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                editPower ? <Space size="large">
                    <a onClick={() => {
                        setEditOri(record);
                        setType('edit');
                        setIsShow(true);
                        form.setFieldsValue(record)
                    }}>修改信息</a>
                </Space> : null
            )
        }
    ]
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
    const getMiddlemanListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/middleman/getMiddlemanList',
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

    // 添加新中间人
    const [type, setType] = useState('add')
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()
    const addMiddlemanAPI = (payload) => {
        request({
            method: 'post',
            url: '/middleman/addMiddleman',
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
                    setIsShow(false)
                    getMiddlemanListAPI()
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
    const editMiddlemanAPI = (payload) => {
        request({
            method: 'post',
            url: '/middleman/editMiddleman',
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
                    setIsShow(false)
                    getMiddlemanListAPI()
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
    // 下拉框
    const [users, setUser] = useState()
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
                    setUser(res.data.data)
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
        getMiddlemanListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card title="中间人列表" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setType('add'); setIsShow(true); }}>添加新中间人</Button> : null}>
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
                    <Form.Item label='编号' name='mid' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='类型' name='type'>
                        <Select style={{ width: 120 }} options={middleType} />
                    </Form.Item>
                    <Form.Item label='名称' name='name' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='联系人姓名' name='liaison_name' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='付款姓名' name='pay_name' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='商务' name='u_id' style={{ margin: '0 10px 10px 0' }}>
                        <Select style={{ width: 120 }} options={users} onFocus={() => { getUserItems('saleman'); }} />
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
                <Table
                    style={{ margin: '20px auto' }}
                    rowKey={(data) => data.mid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <AEMiddleman
                isShow={isShow}
                type={type}
                form={form}
                onOK={(values) => { 
                    if (type === 'add') {
                        addMiddlemanAPI(values);
                    } else {
                        let ori = editOri
                        delete ori.create_time
                        delete ori.status
                        delete ori.u_id
                        delete ori.u_name
                        values["history_other_info"] = form.getFieldValue('history_other_info')
                        let z = {}
                        for (const o in ori) {
                            if (Object.hasOwnProperty.call(ori, o)) {
                                for (const v in values) {
                                    if (Object.hasOwnProperty.call(values, v)) {
                                        if (o === v && ori[o] !== values[v]) {
                                            z[o] = ori[o]
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
                            editMiddlemanAPI({
                                ...values,
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

export default MiddlemanList