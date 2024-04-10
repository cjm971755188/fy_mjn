import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Modal, message, Tooltip } from 'antd';
import { PlusOutlined, ClockCircleTwoTone, PauseCircleTwoTone } from '@ant-design/icons';
import AEBlock from '../components/modals/AEBlock'
import dayjs from 'dayjs'

const { TextArea } = Input;

function TalentBlockList() {
    // 操作权限
    const editPower = (localStorage.getItem('company') === '总公司' && localStorage.getItem('department') === '事业部') || localStorage.getItem('position') === '管理员' ? true : false
    const examPower = (localStorage.getItem('position') === '副总' && localStorage.getItem('department') === '事业部') || localStorage.getItem('position') === '管理员' ? true : false
    const releasePower = localStorage.getItem('position') === '商务' || localStorage.getItem('position') === '助理' || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'bid', key: 'bid' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        {
            title: '拉黑原因',
            dataIndex: 'reason_b',
            key: 'reason_b',
            render: (_, record) => (
                <Tooltip title={record.reason_b}>
                    <div style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                    >
                        {record.reason_b}
                    </div>
                </Tooltip>
            )
        },
        { title: '拉黑人', dataIndex: 'u_name_b', key: 'u_name_b' },
        {
            title: '释放原因',
            dataIndex: 'reason_r',
            key: 'reason_r',
            render: (_, record) => (
                <Tooltip title={record.reason_r}>
                    <div style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                    >
                        {record.reason_r}
                    </div>
                </Tooltip>
            )
        },
        { title: '释放人', dataIndex: 'u_name_r', key: 'u_name_r' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status && (record.status.match('待审批') ? <ClockCircleTwoTone twoToneColor="#ee9900" /> :
                        record.status === '已拉黑' ? <PauseCircleTwoTone twoToneColor="#4ec990" /> : null)}
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
                            if (record.status.match('拉黑')) {
                                if (record.bid[0] === 'B') {
                                    examBlockAPI(record.bid, record.u_id_b, record.status, true, null);
                                } else {
                                    examTalentAPI(record.bid, record.u_id_b, record.status, true, null);
                                }
                            } else {
                                if (record.bid[0] === 'B') {
                                    examBlockAPI(record.bid, record.u_id_r, record.status, true, null);
                                } else {

                                }
                            }
                        }}>通过</a>
                        <a onClick={() => {
                            setClickBid(record.bid);
                            setClickUid(record.status === '拉黑待审批' ? record.u_id_b : record.u_id_r);
                            setClickStatus(record.status);
                            setReasonType('refund');
                            setIsShowReason(true);
                        }}>驳回</a>
                    </Space> : null}
                    {editPower && !record.status.match('待审批') && record.bid[0] === 'B' ? <a onClick={() => {
                        setClickBid(record.bid);
                        setEditOri({
                            bid: record.bid,
                            name: record.name,
                            reason: record.reason_b
                        });
                        setType('edit');
                        setIsShow(true);
                        form.setFieldsValue({
                            ...record,
                            reason: record.reason_b
                        })
                    }}>修改信息</a> : null}
                    {releasePower && !record.status.match('待审批') ? <a onClick={() => { setClickBid(record.bid); setReasonType('release'); setIsShowReason(true); }}>申请释放</a> : null}
                </Space>
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
    const getTalentBlockListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/block/getTalentBlockList',
            data: {
                filters: tableParams.filters,
                pagination: {
                    current: tableParams.pagination.current - 1,
                    pageSize: tableParams.pagination.pageSize,
                },
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    up_uid: localStorage.getItem('up_uid'),
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

    // 添加新达人黑名单
    const [type, setType] = useState('add')
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()
    const addBlockAPI = (payload) => {
        request({
            method: 'post',
            url: '/block/addBlock',
            data: {
                ...payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    up_uid: localStorage.getItem('up_uid'),
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
                    setIsShow(false)
                    getTalentBlockListAPI()
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
    const editBlockAPI = (operate, ori, payload) => {
        request({
            method: 'post',
            url: '/block/editBlock',
            data: {
                bid: clickBid,
                operate,
                ori,
                new: payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    up_uid: localStorage.getItem('up_uid'),
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
                    setIsShow(false)
                    getTalentBlockListAPI()
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
    // 释放
    const releaseTalentAPI = (bid, reason) => {
        request({
            method: 'post',
            url: '/block/releaseTalent',
            data: {
                bid,
                reason,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    up_uid: localStorage.getItem('up_uid'),
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
                    setIsShowReason(false);
                    setReason();
                    setClickBid();
                    setClickUid();
                    getTalentBlockListAPI();
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
                tid: clickBid,
                operate,
                ori,
                new: payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    up_uid: localStorage.getItem('up_uid'),
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
                    setIsShowReason(false);
                    setReason();
                    setClickBid();
                    setClickUid();
                    getTalentBlockListAPI();
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
    // 审批
    const [isShowReason, setIsShowReason] = useState(false)
    const [reasonType, setReasonType] = useState()
    const [reason, setReason] = useState()
    const [clickBid, setClickBid] = useState()
    const [clickUid, setClickUid] = useState()
    const [clickStatus, setClickStatus] = useState()
    const examBlockAPI = (bid, uid, type, exam, reason) => {
        request({
            method: 'post',
            url: '/block/examBlock',
            data: {
                bid,
                exam,
                reason,
                uid,
                type,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    up_uid: localStorage.getItem('up_uid'),
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
                    setIsShowReason(false);
                    setReason();
                    setClickBid();
                    setClickUid();
                    getTalentBlockListAPI();
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
    const examTalentAPI = (tid, uid, status, exam, note) => {
        request({
            method: 'post',
            url: '/talent/examTalent',
            data: {
                tid,
                status,
                exam,
                note: exam ? null : note,
                uid,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    up_uid: localStorage.getItem('up_uid'),
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
                    setIsShowReason(false);
                    setReason();
                    setClickBid();
                    setClickUid();
                    getTalentBlockListAPI();
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
        if (localStorage.getItem('uid') && localStorage.getItem('uid') === null) {
            navigate('/login')
            message.error('账号错误，请重新登录')
        }
        getTalentBlockListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="达人黑名单" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setType('add'); setIsShow(true); }}>拉黑新达人</Button> : null}>
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
                    <Form.Item label='编号' name='bid' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='达人昵称' name='name' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
                    <Form.Item label='拉黑人' name='u_name' style={{ margin: '0 10px 10px 0' }}><Input style={{ width: 120 }} /></Form.Item>
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
                    rowKey={(data) => data.bid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            <AEBlock
                isShow={isShow}
                type={type}
                form={form}
                onOK={(values) => {
                    if (type === 'add') {
                        addBlockAPI(values);
                    } else {
                        let ori = editOri
                        let z = {}, y = {}
                        for (const o in ori) {
                            if (Object.hasOwnProperty.call(ori, o)) {
                                for (const v in values) {
                                    if (Object.hasOwnProperty.call(values, v)) {
                                        if (o === v && ori[o] !== values[v]) {
                                            z[o] = ori[o]
                                            y[o] = values[o]
                                        }
                                    }
                                }
                            }
                        }
                        editBlockAPI('修改信息', JSON.stringify(z), y);
                    }
                }}
                onCancel={() => { setIsShow(false); form.resetFields(); }}
            />
            <Modal title={reasonType && reasonType === 'refund' ? "驳回原因" : "释放原因"} open={isShowReason} onOk={() => {
                if (reasonType === 'refund') {
                    if (clickBid[0] === 'B') {
                        examBlockAPI(clickBid, clickUid, clickStatus, false, reason);
                    } else {
                        examTalentAPI(clickBid, clickUid, clickStatus, false, reason);
                    }
                } else if (reasonType === 'release') {
                    if (!reason || reason === '') {
                        message.error('请输入释放原因')
                    } else {
                        if (clickBid[0] === 'B') {
                            releaseTalentAPI(clickBid, reason);
                        } else {
                            editTalentAPI('拉黑释放', null, { block_note: reason });
                        }
                    }
                }
            }} onCancel={() => { setIsShowReason(false); setReason(''); }}>
                <TextArea placeholder="请输入" maxLength={255} value={reason} onChange={(e) => { setReason(e.target.value); }} />
            </Modal>
        </Fragment>
    )
}

export default TalentBlockList