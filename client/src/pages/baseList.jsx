import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Modal, Popconfirm, message, Select, InputNumber, Tooltip, Popover } from 'antd';
import { PauseCircleTwoTone, PlusOutlined, CloseCircleTwoTone } from '@ant-design/icons';
import { companyType } from '../baseData/base'
import UpLoadImg from '../components/UpLoadImg'
import FilePreview from '../components/FilePreview'
import dayjs from 'dayjs'

const { TextArea } = Input;

function BaseList() {
    // 操作权限
    const editPower = (localStorage.getItem('department') === '事业部' && localStorage.getItem('company') === '总公司') || localStorage.getItem('position') === '管理员' || localStorage.getItem('position') === '总裁' ? true : false
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')

    // 表格：格式 
    let columns = [
        { title: `${name}名`, dataIndex: 'name', key: 'name' }
    ]
    if (name === '公司') {
        columns = columns.concat([
            { title: '类型', dataIndex: 'type', key: 'type' },
            { title: '法人', dataIndex: 'person', key: 'person' },
            { title: '提现银行卡', dataIndex: 'card', key: 'card' }
        ])
    } else if (name === '店铺') {
        columns = columns.concat([
            { title: '平台', dataIndex: 'platform', key: 'platform' },
            { title: '店铺ID', dataIndex: 'storeID', key: 'storeID' },
            { title: '保证金', dataIndex: 'margin', key: 'margin' },
            { title: '手机号', dataIndex: 'phone', key: 'phone' },
            { title: '账号', dataIndex: 'username', key: 'username' },
            { title: '密码', dataIndex: 'password', key: 'password' },
            { title: '实名人', dataIndex: 'person', key: 'person' },
            { title: '管理员', dataIndex: 'admin', key: 'admin' },
            { title: '链接', dataIndex: 'link', key: 'link' },
            { title: '公司', dataIndex: 'company', key: 'company' },
            { title: '项目', dataIndex: 'project', key: 'project' }
        ])
    } else if (name === '通知') {
        columns = columns.concat([
            {
                title: '创建日期',
                dataIndex: 'create_time',
                key: 'create_time',
                width: 120,
                render: (_, record) => (
                    <span>{dayjs(Number(record.create_time)).format('YYYY-MM-DD')}</span>
                )
            },
            {
                title: '内容',
                dataIndex: 'value',
                key: 'value',
                width: 500,
                render: (_, record) => (
                    <Popover title={record.name} content={<p style={{ width: '800px', whiteSpace: 'pre-wrap' }}>{record.value}</p>}>
                        <div
                            style={{
                                width: '500px',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer'
                            }}
                        >
                            {record.value}
                        </div>
                    </Popover>
                )

            },
            {
                title: '文件',
                dataIndex: 'files',
                key: 'files',
                width: 160,
                render: (_, record) => (
                    record.files && record.files.split(',').map((file, index) => {
                        return <FilePreview key={index} fileUrl={file} fileType={'excel'} />
                    })
                )
            }
        ])
    }
    columns = columns.concat([
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    {['正常', '已通知'].indexOf(record.status) > -1 ? <PauseCircleTwoTone twoToneColor="#4ec990" /> : <CloseCircleTwoTone twoToneColor="#f81d22" />}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {editPower ? <a onClick={() => { form.setFieldsValue(record.files ? { ...record, files: record.files.split(',') } : record); setType('edit'); setIsShow(true); }}>修改信息</a> : null}
                    {editPower && record.status === '未通知' ? <Popconfirm title="确认要通知吗" okText="通知" cancelText="取消" onConfirm={() => { noticeAPI({ id: record.id, name: record.name, value: record.value, files: record.files }); }}><a>通知</a></Popconfirm> : null}
                    {record.files === null ? null : <a onClick={() => { downloadAPI(record.files); }}>下载</a>}
                    {editPower && record.status === '正常' ? <Popconfirm title="确认要禁用吗" okText="禁用" cancelText="取消" onConfirm={() => { deleteAPI({ id: record.id, name: record.name }); }}><a>禁用</a></Popconfirm> : null}
                    {editPower && record.status === '失效' ? <Popconfirm title="确认要恢复正常吗" okText="恢复" cancelText="取消" onConfirm={() => { recoverAPI({ id: record.id, name: record.name }); }}><a>恢复正常</a></Popconfirm> : null}
                </Space>
            ),
        }
    ])
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
    const getListAPI = (url) => {
        setLoading(true);
        request({
            method: 'post',
            url: `/base/getBaseSets`,
            data: {
                type: url,
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
    // 用户：添加、修改、通知、删除、恢复
    const [isShow, setIsShow] = useState(false)
    const [type, setType] = useState('')
    const [form] = Form.useForm()
    const addAPI = (payload) => {
        request({
            method: 'post',
            url: `/base/addBaseSet`,
            data: {
                type: url,
                ...payload
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
            url: `/base/editBaseSet`,
            data: {
                type: url,
                ...payload
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
    const noticeAPI = (payload) => {
        request({
            method: 'post',
            url: `/base/noticeBaseSet`,
            data: {
                ...payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    name: localStorage.getItem('name')
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
    const deleteAPI = (payload) => {
        request({
            method: 'post',
            url: `/base/deleteBaseSet`,
            data: {
                type: url,
                ...payload
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
            url: `/base/recoverBaseSet`,
            data: {
                type: url,
                ...payload
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
    // 导出
    const downloadAPI = (urls) => {
        for (let i = 0; i < urls.split(',').length; i++) {
            console.log(urls.split(',')[i]);
            request({
                method: 'get',
                url: '/file/download',
                params: { url: urls.split(',')[i].split('/')[3] },
                responseType: 'blob'
            }).then((res) => {
                if (res.status == 200) {
                    const url = window.URL.createObjectURL(
                        new Blob([res.data]),
                    );
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = url;
                    link.setAttribute('download', res.config.params.url.split('_')[3]);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }).catch((err) => {
                console.error(err)
            })
        }
    }
    // 获取下拉框
    const [baseSets, setBaseSets] = useState('')
    const getBaseSetItems = (type) => {
        request({
            method: 'post',
            url: `/base/getBaseSetItems`,
            data: {
                type
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

    useEffect(() => {
        setUrl(window.location.href.split('/')[5])
        switch (window.location.href.split('/')[5] || '') {
            case 'project': setName('项目'); break;
            case 'company': setName('公司'); break;
            case 'platform': setName('平台'); break;
            case 'store': setName('店铺'); break;
            case 'liveroom': setName('直播间'); break;
            case 'liaison': setName('联系人类型'); break;
            case 'account': setName('账号类型'); break;
            case 'notice': setName('通知'); break;
            case 'mechanism': setName('机制'); break;
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
        filterForm.resetFields();
    }, [JSON.stringify(window.location.href)])
    useEffect(() => {
        getListAPI(window.location.href.split('/')[5] || '');
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title={`${name}列表`}
                extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setType('add'); setIsShow(true); }}>添加新{name}</Button> : null}
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
                    <Form.Item label={name} name='name'><Input /></Form.Item>
                    {name === '公司' ? <Form.Item label='类型' name='type'><Input /></Form.Item> : null}
                    {name === '店铺' ? <Form.Item label='平台' name='platform'><Input /></Form.Item> : null}
                    {name === '店铺' ? <Form.Item label='公司' name='company'><Input /></Form.Item> : null}
                    {name === '店铺' ? <Form.Item label='项目' name='project'><Input /></Form.Item> : null}
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
                    <Form.Item label={`${name}名`} name='name' rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" disabled={name === '商务目标' ? true : false} />
                    </Form.Item>

                    {name === '公司' ? <>
                        <Form.Item label='类型' name='type' rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" options={companyType} />
                        </Form.Item>
                        <Form.Item label='法人' name='person' rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请填写" />
                        </Form.Item>
                        <Form.Item label='提现账号' name='card' rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请填写" />
                        </Form.Item>
                    </> : null}

                    {name === '店铺' ? <>
                        <Form.Item label='平台' name='platform' rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" options={baseSets} onClick={() => { getBaseSetItems('platform'); }} />
                        </Form.Item>
                        <Form.Item label='店铺ID' name='storeID' rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请填写" />
                        </Form.Item>
                        <Form.Item label='店铺保证金（万）' name='margin' rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请填写" min={0} />
                        </Form.Item>
                        <Form.Item label="绑定手机号" name="phone" rules={[{ required: true, message: '不能为空' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号错误' }]}>
                            <Input placeholder="请输入" maxLength={11} />
                        </Form.Item>
                        <Form.Item label='主账号' name='username' rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请填写" />
                        </Form.Item>
                        <Form.Item label='主账号密码' name='password' rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请填写" />
                        </Form.Item>
                        <Form.Item label='实名认证人' name='person' rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请填写" />
                        </Form.Item>
                        <Form.Item label='管理员' name='admin' rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请填写" />
                        </Form.Item>
                        <Form.Item label='登录链接' name='link' rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请填写" />
                        </Form.Item>
                        <Form.Item label='营业执照公司' name='company' rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" options={baseSets} onClick={() => { getBaseSetItems('company'); }} />
                        </Form.Item>
                        <Form.Item label='归属项目' name='project' rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" options={baseSets} onClick={() => { getBaseSetItems('project'); }} />
                        </Form.Item>
                    </> : null}

                    {['通知', '机制'].indexOf(name) > -1 ? <>
                        {name === '机制' ? null : <Form.Item label="内容" name='value' rules={[{ required: true, message: '不能为空' }]}>
                            <TextArea placeholder="请输入" maxLength={5000} autoSize={{ minRows: 10, maxRows: 30 }} disabled={type === 'look' ? true : false} />
                        </Form.Item>}
                        <Form.Item label="文件" name='files'>
                            <UpLoadImg type={'历史通知'} setPicUrl={(values) => { form.setFieldValue('files', values) }} disabled={type === 'look' ? true : false} />
                        </Form.Item>
                    </> : null}
                </Form>
            </Modal>
        </Fragment>
    )
}

export default BaseList