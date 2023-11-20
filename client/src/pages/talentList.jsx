import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom'
import request from '../service/request'
import { Card, Table, Space, Form, Input, Modal, Button, Select, Radio, InputNumber, Tooltip, message } from 'antd';
import { PauseCircleTwoTone, CloseCircleTwoTone, ClockCircleTwoTone, CheckCircleTwoTone } from '@ant-design/icons';
import { middleType } from '../baseData/talent'

function TalentList() {
    let columns = [
        { title: '编号', dataIndex: 'tid', key: 'tid' },
        { title: '达人名称', dataIndex: 'talent_name', key: 'talent_name' },
        { title: '年成交额', dataIndex: 'year_deal', key: 'year_deal' },
        { title: '类别', dataIndex: 'talent_lavel', key: 'talent_lavel' },
        { title: '年框', dataIndex: 'yearpay_status', key: 'yearpay_status' },
        { title: '合作模式', dataIndex: 'models', key: 'models' },
        { title: '商务', dataIndex: 'u_names', key: 'u_names' },
        { title: '中间人', dataIndex: 'm_names', key: 'm_names' },
        {
            title: '状态',
            dataIndex: 'talent_status',
            key: 'talent_status',
            render: (_, record) => (
                <Space size="small">
                    {record.talent_status === '报备待审批' ? <ClockCircleTwoTone twoToneColor="#ee9900" /> :
                        record.talent_status === '合作中' ? <PauseCircleTwoTone twoToneColor="#4ec990" /> : <ClockCircleTwoTone twoToneColor="#ee9900" />}
                    <span>{record.talent_status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    {(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') && record.talent_status.match('待审批') ? 
                    <NavLink to='/admin/talent/talent_list/talent_detail' state={{ cid: record.cid, tid: record.tid, type: 'point_check' }}>审批</NavLink> : null}
                    <NavLink to='/admin/talent/talent_list/talent_detail' state={{ cid: record.cid, tid: record.tid, type: 'look' }}>查看详情</NavLink>
                </Space>
            )
        }
    ]

    // 传入数据，分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filters: {},
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const fetchData = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/talent/getTalentList',
            data: {
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                },
                filters: tableParams.filters,
                pagination: {
                    current: tableParams.pagination.current - 1,
                    pageSize: tableParams.pagination.pageSize,
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
    const [selectForm] = Form.useForm()

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card title="达人列表">
                <Form
                    layout="inline"
                    form={selectForm}
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='编号' name='tid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='达人名称' name='talent_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='年成交额' name='year_deal'>
                        <Select style={{ width: 160 }} options={middleType} />
                    </Form.Item>
                    <Form.Item label='类别' name='talent_lavel'>
                        <Select style={{ width: 160 }} options={middleType} />
                    </Form.Item>
                    <Form.Item label='年框状态' name='yearpay_status'>
                        <Select style={{ width: 160 }} options={middleType} />
                    </Form.Item>
                    <Form.Item label='合作模式' name='models'>
                        <Select style={{ width: 160 }} options={middleType} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: '20px' }}>
                        <Space size={'large'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                selectForm.resetFields();
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
                    rowKey={(data) => data.tid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    )
}

export default TalentList