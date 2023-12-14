import React, { Fragment, useEffect, useState } from "react";
import { NavLink } from 'react-router-dom'
import request from '../service/request'
import { Card, Table, Space, Form, Input, Popover, Button, Select, List, message, Alert, Modal } from 'antd';
import { PauseCircleTwoTone, ClockCircleTwoTone, StopTwoTone, PlusOutlined } from '@ant-design/icons';
import { model, yearBoxType, talentStatus } from '../baseData/talent'
import AETalent from '../components/modals/AETalent'

function TalentList() {
    // 操作权限
    const editPower = localStorage.getItem('position') === '商务' ? true : false
    const examPower = localStorage.getItem('position') === '副总' || localStorage.getItem('position') === '总裁' || localStorage.getItem('position') === '管理员' ? true : false

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
            dataIndex: 'yearbox_start_date',
            key: 'yearbox_start_date',
            render: (_, record) => (
                <Space size="small">
                    {record.yearbox_start_date === null ? <StopTwoTone twoToneColor="#999999" /> : <PauseCircleTwoTone twoToneColor="#4ec990" />}
                    <span>{record.yearbox_start_date === null ? '暂无' : '生效中'}</span>
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
                    {examPower && record.status.match('待审批') ? <NavLink to='/admin/talent/talent_list/talent_detail' state={{ tid: record.tid }}>审批</NavLink> :
                        <NavLink to='/admin/talent/talent_list/talent_detail' state={{ tid: record.tid }}>查看详情</NavLink>}
                    {editPower && record.status === '合作中' ? <a onClick={() => { 
                        formGive.setFieldValue('hasYear', record.yearbox_start_date === null ? false : true)
                        formGive.setFieldValue('hasMid', record.m_ids === ',' ? false : true)
                        formGive.setFieldValue('mids', record.m_ids)
                        setClickTid(record.tid); 
                        setIsShowGive(true); 
                    }}>移交</a> : null}
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
    const [clickTid, setClickTid] = useState()
    const giveTalentAPI = () => {
        request({
            method: 'post',
            url: '/talent/giveTalent',
            data: {
                tid: clickTid,
                newUid: formGive.getFieldValue('u_id'),
                hasYear: formGive.getFieldValue('hasYear'),
                hasMid: formGive.getFieldValue('hasMid'),
                mids: formGive.getFieldValue('mids'),
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
            <Card title="达人列表" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true); setType('history'); }}>添加历史达人（限时开放到12-20）</Button> : null}>
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
                    {editPower ? null : <Form.Item label='商务' name='u_ids' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                    </Form.Item>}
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
                onCancel={() => { setIsShow(false); form.resetFields(); setType(''); }}
            />
            <Modal title="移交达人" open={isShowGive} onOk={() => { giveTalentAPI(); }} onCancel={() => { setIsShowGive(false); }}>
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