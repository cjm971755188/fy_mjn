import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, message, Alert, Popconfirm } from 'antd';
import { CloseCircleTwoTone, PauseCircleTwoTone } from '@ant-design/icons';

function YearList() {
    // 表格：格式
    const columns = [
        { title: '文件编码', dataIndex: 'rid', key: 'rid' },
        { title: '文件名', dataIndex: 'filename', key: 'filename' },
        { title: '关联达人', dataIndex: 'name', key: 'name' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size={'middle'}>
                    {record.status === '生效中' ? <PauseCircleTwoTone twoToneColor="#4ec9b0" /> : <CloseCircleTwoTone twoToneColor="#f81d22" />}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => { downloadAPI(record.url); }}>下载</a>
                    <Popconfirm
                        title="确认要删除该文件吗"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => {
                            let payload = {
                                rid: record.rid
                            }
                            deleteResourceAPI(payload);
                        }}
                    >
                        <a>删除</a>
                    </Popconfirm>
                </Space>
            ),
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
    const getYearListAPI = () => {
        setLoading(true);
        request({
            method: 'post',
            url: '/resource/getYearList',
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
    
    // 下载、修改状态
    const downloadAPI = (url) => {
        request({
            method: 'get',
            url: '/file/download',
            params: { url },
            responseType: 'blob'
        }).then((res) => {
            if (res.status == 200) {
                const url = window.URL.createObjectURL(
                    new Blob([res.data]),
                );
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', res.config.params.url.split('_')[3]);
                document.body.appendChild(link);
                link.click();
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const deleteResourceAPI = (payload) => {
        request({
            method: 'post',
            url: '/resource/deleteResource',
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
                    getYearListAPI();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    }

    useEffect(() => {
        getYearListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="年框资料列表">
                <Form layout="inline" form={filterForm}
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='文件编码' name='rid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='文件名' name='filename' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='达人昵称' name='name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item style={{ marginBottom: '20px' }}>
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
                <Alert message={`总计：${tableParams.pagination.total} 条数据`} type="info" showIcon />
                <Table
                    style={{ margin: '20px auto' }}
                    rowKey={(data) => data.rid}
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

export default YearList