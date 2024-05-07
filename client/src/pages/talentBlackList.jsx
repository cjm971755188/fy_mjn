import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Modal, message, Tooltip } from 'antd';
import { PlusOutlined, ClockCircleTwoTone, PauseCircleTwoTone } from '@ant-design/icons';
import AENote from '../components/modals/AENote'

const { TextArea } = Input;

function TalentBlackList() {
    // 操作权限
    const editPower = (localStorage.getItem('company') === '总公司' && localStorage.getItem('department') === '事业部') || localStorage.getItem('position') === '管理员' ? true : false
    const examPower = (localStorage.getItem('position') === '副总' && localStorage.getItem('department') === '事业部') || localStorage.getItem('position') === '管理员' ? true : false
    const recoverPower = localStorage.getItem('position') === '商务' || localStorage.getItem('position') === '助理' || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'tbid', key: 'tbid' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        {
            title: '拉黑原因',
            dataIndex: 'b_reason',
            key: 'b_reason',
            render: (_, record) => (
                <Tooltip title={record.b_reason}>
                    <div style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                    >
                        {record.b_reason}
                    </div>
                </Tooltip>
            )
        },
        { title: '拉黑人', dataIndex: 'b_name', key: 'b_name' },
        {
            title: '释放原因',
            dataIndex: 'r_reason',
            key: 'r_reason',
            render: (_, record) => (
                <Tooltip title={record.r_reason}>
                    <div style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                    >
                        {record.r_reason}
                    </div>
                </Tooltip>
            )
        },
        { title: '释放人', dataIndex: 'r_name', key: 'r_name' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status && (record.status.match('待审批') ? <ClockCircleTwoTone twoToneColor="#ee9900" /> :
                        record.status === '正常' ? <PauseCircleTwoTone twoToneColor="#4ec990" /> : null)}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                record.status && <Space size="large">
                    {examPower && record.status.match('待审批') ? <Space size="large">
                        <a onClick={() => {
                            if (record.tbid[0] === 'T') {
                                examTalentAPI(record.tbid, record.status, true, null);
                            } else {
                                examBlackAPI(record.tbid, '拉黑达人', true, null);
                            }
                        }}>通过</a>
                        <a onClick={() => {
                            setClickTbid(record.tbid);
                            setClickStatus(record.status);
                            setReasonType('驳回原因');
                            setIsShowReason(true);
                        }}>驳回</a>
                    </Space> : null}
                    {editPower && !record.status.match('待审批') && record.tbid[0] !== 'T' ? <a onClick={() => {
                        setType('edit');
                        setIsShow(true);
                        form.setFieldsValue(record);
                    }}>修改信息</a> : null}
                    {recoverPower && !record.status.match('待审批') ? <a onClick={() => { setClickTbid(record.tbid); setClickStatus(record.status); setReasonType('释放原因'); setIsShowReason(true); }}>申请释放</a> : null}
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
            pageSize: 10,
            showTotal: ((total) => {
                return `共 ${total} 条`;
            }),
        }
    });
    const getTalentBlackListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/black/getTalentBlackList',
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
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }
    // 查询、清空筛选
    const [filterForm] = Form.useForm()

    // 添加、修改、释放、审批
    const [type, setType] = useState('add')
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()
    const [isShowReason, setIsShowReason] = useState(false)
    const [reasonType, setReasonType] = useState()
    const [clickTbid, setClickTbid] = useState()
    const [clickStatus, setClickStatus] = useState()
    const addBlackAPI = (payload) => {
        request({
            method: 'post',
            url: '/black/addBlack',
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
                    getTalentBlackListAPI()
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
    const editBlackAPI = (payload) => {
        request({
            method: 'post',
            url: '/black/editBlack',
            data: {
                ...payload
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setIsShow(false)
                    getTalentBlackListAPI()
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
    const recoverBlackAPI = (r_reason) => {
        request({
            method: 'post',
            url: '/black/recoverBlack',
            data: {
                tbid: clickTbid,
                r_reason,
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
                    setIsShowReason(false);
                    setClickTbid();
                    getTalentBlackListAPI();
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
    const examBlackAPI = (tbid, type, exam, reason) => {
        request({
            method: 'post',
            url: '/black/examBlack',
            data: {
                tbid, 
                type,
                exam,
                reason,
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
                    setIsShowReason(false);
                    setClickTbid();
                    setClickStatus();
                    getTalentBlackListAPI();
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
    const editTalentAPI = (operate, ori, payload) => {
        request({
            method: 'post',
            url: '/talent/editTalent',
            data: {
                tid: clickTbid,
                operate,
                ori,
                new: payload,
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
                    setIsShowReason(false);
                    setClickTbid();
                    setClickStatus();
                    getTalentBlackListAPI();
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
    const examTalentAPI = (tid, status, exam, note) => {
        request({
            method: 'post',
            url: '/talent/examTalent',
            data: {
                tid,
                status,
                exam,
                note: exam ? null : note,
                uid: localStorage.getItem('uid'),
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
                    setIsShowReason(false);
                    setClickTbid();
                    setClickStatus();
                    getTalentBlackListAPI();
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
        getTalentBlackListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="达人黑名单" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setType('add'); setIsShow(true); }}>拉黑新达人</Button> : null}>
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
                    <Form.Item label='编号' name='tbid'><Input /></Form.Item>
                    <Form.Item label='达人昵称' name='name'><Input /></Form.Item>
                    <Form.Item label='拉黑人' name='b_name'><Input /></Form.Item>
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
                    rowKey={(data) => data.tbid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <Modal
                title={type === 'add' ? '拉黑新达人' : '修改拉黑信息'}
                open={isShow}
                maskClosable={false}
                onOk={() => { form.submit(); }}
                onCancel={() => { setIsShow(false); form.resetFields(); }}
            >
                <Form form={form} onFinish={(values) => { type === 'add' ? addBlackAPI(values) : editBlackAPI(values) }}>
                    {type === 'edit' ? <Form.Item label="编号" name="tbid" rules={[{ required: true, message: '不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item> : null}
                    <Form.Item label="达人昵称" name="name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="拉黑原因" name="b_reason">
                        <TextArea placeholder="请输入" maxLength={255} />
                    </Form.Item>
                </Form>
            </Modal>
            <AENote
                title={reasonType}
                isShow={isShowReason}
                onOk={(values) => {
                    if (clickStatus === '正常') {
                        if (clickTbid[0] === 'T') {
                            editTalentAPI('拉黑释放', null, values)
                        } else {
                            recoverBlackAPI(values);
                        }
                    } else if (clickStatus.match('待审批')) {
                        if (clickTbid[0] === 'T') {
                            examTalentAPI(clickTbid, '拉黑待审批', false, values)
                        } else {
                            examBlackAPI(clickTbid, clickStatus === '拉黑待审批' ? '拉黑达人' : '释放达人', false, values);
                        }
                    }
                }}
                onCancel={() => { setIsShowReason(false); }}
            />
        </Fragment>
    )
}

export default TalentBlackList