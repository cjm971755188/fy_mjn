import React, { Fragment, useEffect, useState } from "react";
import { NavLink } from 'react-router-dom'
import request from '../service/request'
import { Card, Table, Space, Form, Input, Popover, Button, Select, List, message, Alert } from 'antd';
import { PauseCircleTwoTone, ClockCircleTwoTone } from '@ant-design/icons';
import { model, yearDealType, yearBoxType } from '../baseData/talent'

function TalentList() {
    // 操作权限
    const userShowPower = localStorage.getItem('position') === '商务' ? true : false
    const addPower = localStorage.getItem('position') === '商务' ? true : false
    const editPower = localStorage.getItem('position') === '商务' ? true : false
    const examinePower = localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'tid', key: 'tid' },
        { title: '达人名称', dataIndex: 'name', key: 'name' },
        { title: '年成交额', dataIndex: 'year_deal', key: 'year_deal' },
        { title: '年框状态', dataIndex: 'yearbox_status', key: 'yearbox_status' },
        { title: '合作模式', dataIndex: 'models', key: 'models' },
        { 
            title: '商务', 
            dataIndex: 'u_names', 
            key: 'u_names',
            render: (_, record) => (
                <Popover title="商务信息" content={
                    <List>
                        <List.Item>主商务：{record.u_name_1}</List.Item>
                        <List.Item>副商务：{record.u_name_2}</List.Item>
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
            title: '达人状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status.match('待审批') ? <ClockCircleTwoTone twoToneColor="#ee9900" /> :
                        record.status === '合作中' ? <PauseCircleTwoTone twoToneColor="#4ec990" /> : null}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    {examinePower && record.status === '报备待审批' ?  <a>审批</a> : null}
                    <NavLink to='/admin/talent/talent_list/talent_detail' state={{ tid: record.tid, type: 'look' }}>查看详情</NavLink>
                </Space>
            )
        }
    ]
    columns = userShowPower ? columns.filter(item => item.title !== '商务') : columns
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

    useEffect(() => {
        getTalentListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="达人列表">
                <Form
                    layout="inline"
                    form={filterForm}
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='编号' name='tid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='达人名称' name='name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='年成交额' name='year_deal'>
                        <Select style={{ width: 160 }} options={yearDealType} />
                    </Form.Item>
                    <Form.Item label='年框状态' name='yearbox_status'>
                        <Select style={{ width: 160 }} options={yearBoxType} />
                    </Form.Item>
                    <Form.Item label='合作模式' name='models'>
                        <Select style={{ width: 160 }} options={model} />
                    </Form.Item>
                    {userShowPower ? null : <Form.Item label='商务' name='u_ids' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemanItemsAPI(); }} />
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
                    rowKey={(data) => data.tid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
        </Fragment>
    )
}

export default TalentList