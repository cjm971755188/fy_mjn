import React, { useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Modal, Button, Select, Radio, InputNumber, Tooltip, message } from 'antd';
import { FacebookFilled, PlusOutlined } from '@ant-design/icons';
import { middleType } from '../baseData/talent'

function MiddlemanList() {
    let columns = [
        { title: '编号', dataIndex: 'mid', key: 'mid' },
        { title: '类型', dataIndex: 'type', key: 'type' },
        { title: '名称', dataIndex: 'name', key: 'name' },
        {
            title: '联系人信息',
            dataIndex: 'liaison_name',
            key: 'liaison_name',
            render: (_, record) => (
                <Tooltip title={() => {
                    return (
                        <div>
                            <div>姓名：{record.liaison_name}</div>
                            <div>微信：{record.liaison_v}</div>
                            <div>电话：{record.liaison_phone}</div>
                        </div>
                    )
                }}>
                    <span>{record.liaison_name}</span>
                </Tooltip>
            )
        },
        { title: '付款类型', dataIndex: 'pay_way', key: 'pay_way' },
        { title: '能否开票', dataIndex: 'can_piao', key: 'can_piao' },
        { title: '票型', dataIndex: 'piao_type', key: 'piao_type' },
        { title: '税点', dataIndex: 'shui_point', key: 'shui_point' },
        {
            title: '付款信息',
            dataIndex: 'pay_account',
            key: 'pay_account',
            render: (_, record) => (
                <Tooltip title={() => {
                    return (
                        <div>
                            <div>姓名：{record.pay_name}</div>
                            <div>开户行：{record.pay_bank}</div>
                            <div>账号：{record.pay_account}</div>
                        </div>
                    )
                }}>
                    <span>{record.pay_account}</span>
                </Tooltip>
            )
        },
        { title: '创建人', dataIndex: 'u_name', key: 'u_name' },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    <a onClick={() => {
                        setToGongOrSi(record.pay_way)
                        setCanPiao(record.can_piao)
                        setPiaoType(record.piao_type)
                        setFormType('edit');
                        setIsShow(true);
                        form.setFieldsValue(record)
                    }}>修改信息</a>
                </Space>
            )
        }
    ]
    if (localStorage.getItem('position') === '商务') {
        columns = columns.filter(item => item.title !== '商务')
    }

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
            url: '/middleman/getMiddlemanList',
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

    // 添加新中间人
    const [isShow, setIsShow] = useState(false)
    const [formType, setFormType] = useState('add')
    const [form] = Form.useForm()
    const [toGongOrSi, setToGongOrSi] = useState(false)
    const [canPiao, setCanPiao] = useState(false)
    const [piaoType, setPiaoType] = useState(false)

    // 查询、清空筛选
    const [selectForm] = Form.useForm()

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card title="中间人列表" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setFormType('add'); setIsShow(true); }}>添加新中间人</Button>}>
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
                    <Form.Item label='编号' name='mid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='类型' name='type'>
                        <Select style={{ width: 160 }} options={middleType} />
                    </Form.Item>
                    <Form.Item label='名称' name='name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='联系人姓名' name='liaison_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='付款账号' name='pay_account' style={{ marginBottom: '20px' }}><Input /></Form.Item>
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
                    rowKey={(data) => data.mid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <Modal
                title={formType === 'add' ? '添加新中间人' : '修改中间人信息'}
                open={isShow}
                maskClosable={false}
                onOk={() => { form.submit(); }}
                onCancel={() => { setIsShow(false); form.resetFields(); setToGongOrSi(false); setCanPiao(false); setPiaoType(false) }}
            >
                <Form
                    form={form}
                    onFinish={(values) => {
                        if (formType === 'add') {
                            request({
                                method: 'post',
                                url: '/middleman/addMiddleman',
                                data: {
                                    ...values,
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
                                        setIsShow(false)
                                        setToGongOrSi(false)
                                        setCanPiao(false)
                                        setPiaoType(false)
                                        fetchData()
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
                        } else if (formType === 'edit') {
                            request({
                                method: 'post',
                                url: '/middleman/editMiddleman',
                                data: {
                                    ...values,
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
                                        setIsShow(false)
                                        setToGongOrSi(false)
                                        setCanPiao(false)
                                        setPiaoType(false)
                                        fetchData()
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
                    }}
                >
                    {formType === 'edit' ? <Form.Item label="编号" name="mid" rules={[{ required: true, message: '不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item> : null}
                    <Form.Item label="类型" name="type" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={middleType} />
                    </Form.Item>
                    <Form.Item label="中间人名称" name="name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="联系人微信" name="liaison_v" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="联系人电话" name="liaison_phone" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="付款方式" name="pay_way" rules={[{ required: true, message: '不能为空' }]}>
                        <Radio.Group onChange={(e) => { setToGongOrSi(e.target.value); }} value={toGongOrSi}>
                            <Radio value={'对公'}>对公</Radio>
                            <Radio value={'对私'}>对私</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {toGongOrSi === '对公' ? <><Form.Item label="能否开票" name="can_piao" rules={[{ required: true, message: '不能为空' }]}>
                        <Radio.Group onChange={(e) => { setCanPiao(e.target.value); }} value={canPiao}>
                            <Radio value={'能'}>能</Radio>
                            <Radio value={'不能'}>不能</Radio>
                        </Radio.Group>
                    </Form.Item>
                        {canPiao === '能' ? <><Form.Item label="票型" name="piao_type" rules={[{ required: true, message: '不能为空' }]}>
                            <Radio.Group onChange={(e) => { setPiaoType(e.target.value); }} value={piaoType}>
                                <Radio value={'专票'}>专票</Radio>
                                <Radio value={'普票'}>普票</Radio>
                            </Radio.Group>
                        </Form.Item>
                            <Form.Item label="税点（%）" name="shui_point" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber placeholder="请输入" />
                            </Form.Item></> : null}</> : null}
                    <Form.Item label="收款姓名" name="pay_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="开户行" name="pay_bank" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="收款账号" name="pay_account" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default MiddlemanList