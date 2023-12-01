import React, { Fragment, useEffect, useState } from "react";
import { NavLink } from 'react-router-dom'
import request from '../service/request'
import { Card, Table, Space, Form, Input, Popover, Button, Select, List, message, Alert, Modal } from 'antd';
import { PauseCircleTwoTone, ClockCircleTwoTone, StopTwoTone } from '@ant-design/icons';
import { model, yearBoxType, talentStatus } from '../baseData/talent'

function TalentList() {
    // 操作权限
    const userShowPower = localStorage.getItem('position') === '商务' ? true : false
    const examinePower = localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'tid', key: 'tid' },
        { title: '达人名称', dataIndex: 'name', key: 'name' },
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
        { title: '预估慕江南年GMV', dataIndex: 'year_deal', key: 'year_deal' },
        {
            title: '年框状态',
            dataIndex: 'yearbox_status',
            key: 'yearbox_status',
            render: (_, record) => (
                <Space size="small">
                    {record.yearbox_status === '待审批' ? <ClockCircleTwoTone twoToneColor="#ee9900" /> :
                        record.yearbox_status === '生效中' ? <PauseCircleTwoTone twoToneColor="#4ec990" /> : 
                            record.yearbox_status === '暂无' ? <StopTwoTone twoToneColor="#999999" /> : null}
                    <span>{record.yearbox_status}</span>
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
                    {examinePower && record.status.match('待审批') ? <NavLink to='/admin/talent/talent_list/talent_detail' state={{ tid: record.tid }}>审批</NavLink> :
                        <NavLink to='/admin/talent/talent_list/talent_detail' state={{ tid: record.tid }}>查看详情</NavLink>}
                    {record.status === '合作中' ? <a onClick={() => { setClickTid(record.tid); setIsShowGive(true); }}>移交</a> : null}
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
    // 移交
    const [isShowGive, setIsShowGive] = useState()
    const [formGive] = Form.useForm()
    const [clickTid, setClickTid] = useState()
    const giveTalnetAPI = () => {
        request({
            method: 'post',
            url: '/talent/giveTalent',
            data: {
                tid: clickTid,
                newTid: formGive.getFieldValue('u_id'),
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
                    setClickTid();
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
                    <Form.Item label='合作模式' name='models'>
                        <Select style={{ width: 160 }} options={model} />
                    </Form.Item>
                    {userShowPower ? null : <Form.Item label='商务' name='u_ids' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                    </Form.Item>}
                    <Form.Item label='年框状态' name='yearbox_status'>
                        <Select style={{ width: 160 }} options={yearBoxType} />
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
            <Modal title="移交达人" open={isShowGive} onOk={() => { giveTalnetAPI(); }} onCancel={() => { setIsShowGive(false); }}>
                <Form form={formGive}>
                    <Form.Item label="承接商务" name="u_id" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}

export default TalentList