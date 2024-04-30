import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Modal, Popconfirm, message, Select } from 'antd';
import { PauseCircleTwoTone, PlusOutlined, CloseCircleTwoTone } from '@ant-design/icons';
import { companyType } from '../baseData/base'

function SetList() {
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')

    // 表格：格式 
    const columns = [
        { title: '编号', dataIndex: 'id', key: 'id' },
        name === '公司' ? { title: '类型', dataIndex: 'type', key: 'type' } : {},
        name === '店铺' ? { title: '平台', dataIndex: 'platform', key: 'platform' } : {},
        { title: name, dataIndex: 'name', key: 'name' },
        name === '店铺' ? { title: '公司', dataIndex: 'company', key: 'company' } : {},
        { 
            title: '状态', 
            dataIndex: 'status', 
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status === '正常' ? <PauseCircleTwoTone twoToneColor="#4ec990" /> : <CloseCircleTwoTone twoToneColor="#f81d22" />}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => {
                        form.setFieldsValue(record);
                        setType('edit');
                        setIsShow(true);
                    }}>修改信息</a>
                    {record.status === '正常' ? <Popconfirm
                        title="确认要禁用吗"
                        okText="禁用"
                        cancelText="取消"
                        onConfirm={() => { deleteAPI({ id: record.id, name: record.name }); }}
                    >
                        <a>禁用</a>
                    </Popconfirm> : <Popconfirm
                        title="确认要恢复正常吗"
                        okText="恢复"
                        cancelText="取消"
                        onConfirm={() => { recoverAPI({ id: record.id, name: record.name }); }}
                    >
                        <a>恢复正常</a>
                    </Popconfirm>}
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
            pageSize: 10,
            showTotal: ((total) => {
                return `共 ${total} 条`;
            }),
        }
    });
    const getListAPI = (type) => {
        setLoading(true);
        request({
            method: 'post',
            url: ['company', 'store'].indexOf(type) > -1 ? `/base/get${type[0].toUpperCase() + type.slice(1)}s` : `/base/getBaseSets`,
            data: {
                type,
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
            } else {
                message.error(res.msg)
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
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }
    // 查询、清空筛选
    const [filterForm] = Form.useForm()
    // 用户：添加、修改、删除
    const [isShow, setIsShow] = useState(false)
    const [type, setType] = useState('')
    const [form] = Form.useForm()
    const addAPI = (payload) => {
        request({
            method: 'post',
            url: ['company', 'store'].indexOf(url) > -1 ? `/base/add${url[0].toUpperCase() + url.slice(1)}` : `/base/addBaseSet`,
            data: {
                type: url,
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
                    setIsShow(false);
                    form.resetFields();
                    getListAPI(url);
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const editAPI = (payload) => {
        request({
            method: 'post',
            url: ['company', 'store'].indexOf(url) > -1 ? `/base/edit${url[0].toUpperCase() + url.slice(1)}` : `/base/editBaseSet`,
            data: {
                type: url,
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
                    getListAPI(url);
                    form.resetFields();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const deleteAPI = (payload) => {
        request({
            method: 'post',
            url: ['company', 'store'].indexOf(url) > -1 ? `/base/delete${url[0].toUpperCase() + url.slice(1)}` : `/base/deleteBaseSet`,
            data: {
                type: url,
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
                    getListAPI(url);
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const recoverAPI = (payload) => {
        request({
            method: 'post',
            url: ['company', 'store'].indexOf(url) > -1 ? `/base/recover${url[0].toUpperCase() + url.slice(1)}` : `/base/recoverBaseSet`,
            data: {
                type: url,
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
                    getListAPI(url);
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    // 获取下拉框
    const [baseSets, setBaseSets] = useState('')
    const getBaseSetItems = (payload) => {
        request({
            method: 'post',
            url: `/base/getBaseSetItems`,
            data: {
                type: payload
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setBaseSets(res.data.data)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const [companys, setCompanys] = useState('')
    const getCompanyItems = () => {
        request({
            method: 'post',
            url: `/base/getCompanyItems`,
            data: {}
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setCompanys(res.data.data)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    };

    useEffect(() => {
        if (localStorage.getItem('uid') && localStorage.getItem('uid') === null) {
            navigate('/login')
            message.error('账号错误，请重新登录')
        }
        let url = window.location.href.split('/')[5]
        setUrl(url)
        switch (url || '') {
            case 'project': setName('项目'); break;
            case 'company': setName('公司'); break;
            case 'platform': setName('平台'); break;
            case 'store': setName('店铺'); break;
            case 'liveroom': setName('直播间'); break;
            case 'liaison': setName('联系人类型'); break;
            case 'account': setName('达人账号类型'); break;
            default: break;
        }
        setTableParams({
            filters: {},
            pagination: {
                current: 1,
                pageSize: 10,
                showTotal: ((total) => {
                    return `共 ${total} 条`;
                }),
            }
        })
    }, [JSON.stringify(window.location.href)])

    useEffect(() => {
        getListAPI(window.location.href.split('/')[5] || '');
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title={`${name}列表`}
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setType('add'); setIsShow(true); }}>添加新{name}</Button>}
            >
                <Form
                    layout="inline"
                    form={filterForm}
                    wrapperCol={{ style: { width: '120px', marginBottom: '20px' } }}
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
                    {name === '公司' ? <Form.Item label='类型' name='type'><Input /></Form.Item> : null}
                    {name === '店铺' ? <Form.Item label='平台' name='platform'><Input /></Form.Item> : null}
                    <Form.Item label={name} name='name'><Input /></Form.Item>
                    {name === '店铺' ? <Form.Item label='公司' name='company'><Input /></Form.Item> : null}
                    <Form.Item>
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
                <Table
                    style={{ margin: '20px auto' }}
                    rowKey={(data) => data.id}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <Modal
                title={type === 'add' ? `添加新${name}` : `修改${name}信息`}
                open={isShow}
                maskClosable={false}
                onOk={() => { form.submit(); }}
                onCancel={() => { setIsShow(false); form.resetFields(); }}
            >
                <Form form={form} onFinish={(values) => { type === 'add' ? addAPI(values) : editAPI(values) }}>
                    {type === 'add' ? null : <Form.Item label="编号" name='id' rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" disabled={true} />
                    </Form.Item>}
                    {name === '公司' ? <Form.Item label='类型' name='type' rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={companyType} />
                    </Form.Item> : null}
                    {name === '店铺' ? <Form.Item label='平台' name='platform' rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={baseSets} onClick={() => { getBaseSetItems('platform'); }} />
                    </Form.Item> : null}
                    <Form.Item label={name} name='name' rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    {name === '店铺' ? <>
                        <Form.Item label='公司' name='company' rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" options={companys} onClick={() => { getCompanyItems(); }} />
                        </Form.Item>
                        <Form.Item label='归属项目' name='project' rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" options={baseSets} onClick={() => { getBaseSetItems('project'); }} />
                        </Form.Item>
                    </> : null}
                </Form>
            </Modal>
        </Fragment>
    )
}

export default SetList