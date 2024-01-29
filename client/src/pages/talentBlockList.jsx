import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Modal, message, Tooltip } from 'antd';
import { PlusOutlined, ClockCircleTwoTone, CloseCircleTwoTone, PauseCircleTwoTone } from '@ant-design/icons';
import AEBlock from '../components/modals/AEBlock'
import dayjs from 'dayjs'

const { TextArea } = Input;

function TalentBlockList() {
    // 操作权限
    const editPower = (localStorage.getItem('company') === '总公司' && localStorage.getItem('department') === '事业部') || localStorage.getItem('position') === '管理员' ? true : false
    const examPower = (localStorage.getItem('position') === '副总' && localStorage.getItem('department') === '事业部') || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：格式
    let columns = [
        { title: '编号', dataIndex: 'bid', key: 'bid' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        {
            title: '拉黑原因',
            dataIndex: 'note',
            key: 'note',
            render: (_, record) => (
                <Tooltip title={record.note}>
                    <div style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                    >
                        {record.note}
                    </div>
                </Tooltip>
            )
        },
        { title: '拉黑人', dataIndex: 'u_name', key: 'u_name' },
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
                examPower && record.status.match('待审批') ? <Space size="large">
                    <a onClick={() => {
                        if (record.bid[0] === 'B') {
                            examBlockAPI(record.bid, record.name, record.create_uid, true, null);
                        } else {
                            examTalentAPI(record.bid, record.create_uid, true, null);
                        }
                    }}>通过</a>
                    <a onClick={() => {
                        setClickBid(record.bid);
                        setClickName(record.name);
                        setClickUid(record.create_uid);
                        setIsShowRefund(true);
                    }}>驳回</a>
                </Space> : editPower ? <Space size="large">
                    <a onClick={() => {
                        setEditOri(record);
                        setType('edit');
                        setIsShow(true);
                        form.setFieldsValue(record)
                    }}>修改信息</a>
                </Space> : null
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
    const editBlockAPI = (payload) => {
        request({
            method: 'post',
            url: '/block/editBlock',
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
    // 审批
    const [isShowRefund, setIsShowRefund] = useState(false)
    const [refundReason, setRefundReason] = useState()
    const [clickBid, setClickBid] = useState()
    const [clickName, setClickName] = useState()
    const [clickUid, setClickUid] = useState()
    const examBlockAPI = (bid, name, uid, exam, note) => {
        request({
            method: 'post',
            url: '/block/examBlock',
            data: {
                bid,
                name,
                exam,
                note,
                uid,
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
                    setIsShowRefund(false);
                    setRefundReason();
                    setClickBid();
                    setClickName();
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
    const examTalentAPI = (tid, uid, exam, note) => {
        request({
            method: 'post',
            url: '/talent/examTalent',
            data: {
                tid,
                exam,
                note: exam ? null : note,
                uid,
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
                    setIsShowRefund(false);
                    setRefundReason();
                    setClickBid();
                    setClickName();
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
                    <Form.Item label='编号' name='bid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='达人昵称' name='name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='拉黑人' name='u_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
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
                        delete ori.create_time
                        delete ori.status
                        delete ori.u_id
                        delete ori.u_name
                        values["history_other_info"] = form.getFieldValue('history_other_info')
                        let z = {}
                        for (const o in ori) {
                            if (Object.hasOwnProperty.call(ori, o)) {
                                for (const v in values) {
                                    if (Object.hasOwnProperty.call(values, v)) {
                                        if (o === v && ori[o] !== values[v]) {
                                            z[o] = ori[o]
                                        }
                                    }
                                }
                            }
                        }
                        if (Object.keys(z).length !== 0) {
                            z['userInfo'] = `${localStorage.getItem('name')}_${dayjs().valueOf()}`
                        }
                        if (`${ori["history_other_info"]}*${JSON.stringify(z)}`.length > 1024) {
                            message.error('字段存储空间不足，请联系开发人员')
                        } else {
                            editBlockAPI({
                                ...values,
                                history_other_info: `${ori["history_other_info"]}*${JSON.stringify(z)}`
                            });
                        }
                    }
                }}
                onCancel={() => { setIsShow(false); form.resetFields(); }}
            />
            <Modal title="驳回原因" open={isShowRefund} onOk={() => {
                if (clickBid[0] === 'B') {
                    examBlockAPI(clickBid, clickName, clickUid, false, refundReason);
                } else {
                    examTalentAPI(clickBid, clickUid, false, refundReason);
                }
            }} onCancel={() => { setIsShowRefund(false); setRefundReason(''); }}>
                <TextArea placeholder="请输入" value={refundReason} onChange={(e) => { setRefundReason(e.target.value); }} />
            </Modal>
        </Fragment>
    )
}

export default TalentBlockList