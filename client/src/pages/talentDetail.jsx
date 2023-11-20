import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import request from '../service/request'
import dayjs from 'dayjs';
import { Card, Input, Timeline, Button, Tag, List, Modal, Form, Descriptions, Tooltip, Row, Col, message, Space, DatePicker, Select, InputNumber, Image, Popconfirm } from 'antd';
import { AuditOutlined, MessageOutlined, GlobalOutlined, CrownOutlined, SettingOutlined, EditOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { yearCycleType, liaisonType } from '../baseData/talent'
import UpLoadImg from '../components/UpLoadImg'

const { TextArea } = Input;

function TalentDetail() {
    let location = useLocation();
    const navigate = useNavigate()
    const { cid, tid, type } = location.state;
    // 获取详情
    const [detailData, setDetailData] = useState({})
    const getTalentDetail = () => {
        request({
            method: 'post',
            url: '/talent/getDetail',
            data: {
                cid: cid,
                tid: tid,
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
                    setDetailData(res.data.data)
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
    // 时间线
    const [itemKey, setItemKey] = useState(19980426)
    const [pointTags, setPointTags] = useState([])
    const getTimeItems = () => {
        let items = []
        if (detailData.line) {
            for (let i = 0; i < detailData.line.length; i++) {
                const element = detailData.line[i];
                let item = {
                    color: element.type.match('通过') ? 'green' : element.type.match('驳回') ? 'red' : '#1677ff',
                    children: <div>
                        <Space>
                            <span>{`【${dayjs(Number(element.date)).format('YYYY-MM-DD')}】 ${element.name}---${element.type}${element.note === null ? '' : `---备注：${element.note}`}`}</span>
                            {element.type.match('审批通过') || element.type.match('修改') || element.type.match('删除') ? itemKey !== i ? <a onClick={() => {
                                if (element.type.match('报备')) {
                                    request({
                                        method: 'post',
                                        url: '/talent/getLinePoint',
                                        data: {
                                            tlids: element.tlids,
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
                                                setPointTags(res.data.data)
                                                setItemKey(i)
                                            } else {
                                                message.error(res.data.msg)
                                            }
                                        } else {
                                            message.error(res.data.msg)
                                        }
                                    }).catch((err) => {
                                        console.error(err)
                                    })
                                } else if (element.type.match('年框')) {
                                    request({
                                        method: 'post',
                                        url: '/talent/getYearPoint',
                                        data: {
                                            tlids: element.tlids,
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
                                                setPointTags(res.data.data)
                                                setItemKey(i)
                                            } else {
                                                message.error(res.data.msg)
                                            }
                                        } else {
                                            message.error(res.data.msg)
                                        }
                                    }).catch((err) => {
                                        console.error(err)
                                    })
                                } else if (element.type.match('修改') || element.type.match('删除')) {
                                    request({
                                        method: 'post',
                                        url: '/talent/getOriInfo',
                                        data: {
                                            tlids: element.tlids,
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
                                                setPointTags(res.data.data)
                                                setItemKey(i)
                                            } else {
                                                message.error(res.data.msg)
                                            }
                                        } else {
                                            message.error(res.data.msg)
                                        }
                                    }).catch((err) => {
                                        console.error(err)
                                    })
                                } else {

                                }
                            }}>查看</a> : <a onClick={() => {
                                setPointTags([])
                                setItemKey(19980426)
                            }}>隐藏</a> : null}
                        </Space>
                        {itemKey !== i ? null : <List
                            itemLayout="horizontal"
                            dataSource={pointTags}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.title ? <span>{`● ${item.title}`}</span> : null}
                                        description={item.tags.map((tag, key) => {
                                            if (tag.match('品')) {
                                                return (
                                                    <Tooltip key={key} title={`备注：${item.title.match('线上') ? item.commission_note : item.title.match('社群团购') ? item.discount_note : item.discount_label}`}>
                                                        <Tag style={{ margin: '5px' }} color="volcano">{tag}</Tag>
                                                    </Tooltip>
                                                )
                                            } else if (tag.match(']')) {
                                                return (
                                                    <Tooltip key={key} title={`备注：${tag.match('①') ? item.m_note_1 : item.m_note_2}`}>
                                                        <Tag style={{ margin: '5px' }} color="gold">{tag}</Tag>
                                                    </Tooltip>
                                                )
                                            } else {
                                                return (
                                                    item.u_note ? <Tooltip key={key} title={`备注：${item.u_note}`}>
                                                        <Tag style={{ margin: '5px' }} color="gold">{tag}</Tag>
                                                    </Tooltip> : <Tag key={key} style={{ margin: '5px' }} color="gold">{tag}</Tag>
                                                )
                                            }
                                        })}
                                    />
                                </List.Item>
                            )}
                        />}
                    </div>
                }
                items.push(item)
            }
            items.push({ color: 'gray', children: '' })
        }
        return items
    }
    const getYearItem = () => {
        let items = []
        for (let i = 0; i < detailData.year.length; i++) {
            const item = detailData.year[i];
            if (item.label === '生效日期') {
                item.children = item.children === null ? null : dayjs(Number(item.children)).format('YYYY-MM-DD')
            }
            if (item.label === '合同') {
                item.children = <Image width={50} src={item.children} />
            }
            if (item.label === '状态') {
                continue
            } else {
                items.push(item)
            }
        }
        return items
    }
    const yearStatus = detailData.year && detailData.year[4].children
    const getBaseItem = () => {
        let items = []
        for (let i = 0; i < detailData.base.length; i++) {
            const item = detailData.base[i];
            if (item.label === '达人状态') {
                continue
            } else {
                items.push(item)
            }
        }
        return items
    }

    // 报备审批
    const checkChance = (type, note) => {
        request({
            method: 'post',
            url: '/talent/checkChance',
            data: {
                cid: cid,
                tid: tid,
                type: type,
                note: type ? null : note,
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
                    navigate(-1)
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

    // 添加年框
    const [isShowYear, setIsShowYear] = useState(false)
    const [yearType, setYearType] = useState('add')
    const [formYear] = Form.useForm()
    const addYear = (note) => {
        request({
            method: 'post',
            url: '/talent/addTalentYear',
            data: {
                tid: tid,
                type: yearType === 'add' ? '新增年框' : yearType === 'continue' ? '续约年框' : '删除年框',
                note: note,
                ...formYear.getFieldsValue(),
                yearpay_start: dayjs(formYear.getFieldValue('yearpay_start')).valueOf(),
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
                    setIsShowYear(false)
                    getTalentDetail()
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
    // 年框审批
    const checkYear = (type, note) => {
        request({
            method: 'post',
            url: '/talent/checkYear',
            data: {
                cid: cid,
                tid: tid,
                type: type,
                note: type ? null : note,
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
                    getTalentDetail()
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

    // 修改信息
    const [isShowEdit, setIsShowEdit] = useState(false)
    const [formEdit] = Form.useForm()
    const [editType, setEditType] = useState('')
    const [editOri, setEditOri] = useState({})
    const editDetail = () => {
        let length = Object.keys(formEdit.getFieldsValue()).length, x = 0, ori = {}, neww = {}
        for (let i = 0; i < Object.getOwnPropertyNames(editOri).length; i++) {
            let o = Object.values(editOri)[i]
            for (let j = 0; j < Object.getOwnPropertyNames(formEdit.getFieldsValue()).length; j++) {
                let n = Object.values(formEdit.getFieldsValue())[j]
                if (i === j && o === n) {
                    x++
                } else if (i === j && o !== n) {
                    ori[Object.keys(editOri)[i]] = Object.values(editOri)[i],
                        neww[Object.keys(formEdit.getFieldsValue())[j]] = Object.values(formEdit.getFieldsValue())[j]
                }
            }
        }
        if (x === length && length != 0) {
            message.error('未修改信息')
        } else {
            request({
                method: 'post',
                url: '/talent/editDetail',
                data: {
                    cid: cid,
                    tid, tid,
                    editType: editType,
                    ori: editType === '修改联系人' ? JSON.stringify(ori) : JSON.stringify(editOri),
                    new: editType.match('删除') ? null : Object.keys(neww).length === 0 ? formEdit.getFieldsValue() : neww,
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
                        getTalentDetail()
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
    }
    const [middlemans1, setMiddlemans1] = useState(false)
    const [middlemans2, setMiddlemans2] = useState(false)
    const searchMiddleman1 = (value) => {
        request({
            method: 'post',
            url: '/middleman/searchMiddlemans',
            data: {
                value: value,
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
                    setMiddlemans1(res.data.data)
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
    const searchMiddleman2 = (value) => {
        request({
            method: 'post',
            url: '/middleman/searchMiddlemans',
            data: {
                value: value,
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
                    setMiddlemans2(res.data.data)
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
    const filterOption = (input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    // 修改提点审批
    const checkPoint = (type, note) => {
        request({
            method: 'post',
            url: '/talent/checkPoint',
            data: {
                cid: cid,
                tid: tid,
                type: type,
                note: type ? null : note,
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
                    navigate(-1)
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

    // 驳回理由
    const [isShowRefund, setIsShowRefund] = useState(false)
    const [form] = Form.useForm()
    const [refundType, setRefundType] = useState(false)

    useEffect(() => {
        getTalentDetail();
    }, [tid])
    return (
        <Fragment>
            <Row gutter={24}>
                <Col span={18}>
                    <Card
                        title={
                            <Space>
                                <CrownOutlined /><span>基础信息</span>
                                {detailData.base && <Tag color={detailData.base[3].children.match('待审批') ? "gold" : detailData.base[3].children === '合作中' ? "green" : ""}>{detailData.base[3].children}</Tag>}
                            </Space>}
                        style={{ marginBottom: '20px' }}
                        extra={type.match('check') ?
                            <Space>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        if (type === 'report_check') {
                                            checkChance(true, '');
                                        } else if (type === 'point_check') {
                                            checkPoint(true, '');
                                        }
                                    }}
                                >通过</Button>
                                <Button
                                    type="primary"
                                    danger
                                    onClick={() => {
                                        if (type === 'report_check') {
                                            setRefundType('talent');
                                            setIsShowRefund(true);
                                        } else if (type === 'point_check') {
                                            setRefundType('point');
                                            setIsShowRefund(true);
                                        }
                                    }}
                                >驳回</Button>
                            </Space> : null}>
                        <Descriptions column={5} items={detailData.base && getBaseItem()} />
                    </Card>
                    <Card
                        title={<Space>
                            <AuditOutlined /><span>年框信息</span>
                            <Tag color={yearStatus === '待审批' ? "gold" : yearStatus === '生效中' ? "green" : yearStatus === '已失效' ? "red" : ""}>{yearStatus}</Tag>
                        </Space>}
                        style={{ marginBottom: '20px' }}
                        extra={
                            detailData.year && (
                                localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ? (
                                    detailData.year[4].children === '待审批' ? <Space>
                                        <Button type="primary" onClick={() => { checkYear(true, ''); }}>通过</Button>
                                        <Button type="primary" danger onClick={() => { setRefundType('year'); setIsShowRefund(true); }}>驳回</Button>
                                    </Space> : null
                                ) : (
                                    detailData.year[4].children === '暂无' ? <Button type="primary" onClick={() => { setIsShowYear(true); setYearType('add'); }}>新增</Button> :
                                        detailData.year[4].children === '已失效' ? <Button type="primary" onClick={() => { setIsShowYear(true); setYearType('continue'); }}>续约</Button> : null
                                ))
                        }>
                        <Descriptions column={5} items={detailData.year && getYearItem()} />
                    </Card>
                    <Card
                        title={<Space><MessageOutlined /><span>联络信息</span></Space>}
                        style={{ marginBottom: '20px' }}
                    >
                        <Descriptions title={<Space>
                            <span>联系人</span>
                            {(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null : <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    let ori_values = {
                                        '类型': detailData.liaison[0].children,
                                        '姓名': detailData.liaison[1].children,
                                        '微信': detailData.liaison[2].children,
                                        '手机号': detailData.liaison[3].children,
                                        '沟通群': detailData.liaison[4].children
                                    }
                                    let values = {
                                        liaison_type: detailData.liaison[0].children,
                                        liaison_name: detailData.liaison[1].children,
                                        liaison_v: detailData.liaison[2].children,
                                        liaison_phone: detailData.liaison[3].children,
                                        crowd_name: detailData.liaison[4].children
                                    }
                                    setEditType('修改联系人')
                                    setIsShowEdit(true);
                                    setEditOri(ori_values)
                                    formEdit.setFieldsValue(values)
                                }}
                            >修改</Button>}
                        </Space>} column={5} items={detailData.liaison} />
                        {detailData.middle1 && detailData.middle1[0].children === null ?
                            <Descriptions
                                title={<Space>
                                    <span>无一级中间人</span>
                                    {(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null : <Button
                                        type="text"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            setEditType('添加一级中间人');
                                            setIsShowEdit(true);
                                            setEditOri({})
                                            formEdit.resetFields()
                                        }}
                                    >添加</Button>}
                                </Space>}
                            /> : <Descriptions
                                title={<Space>
                                    <span>一级中间人</span>
                                    {(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null : <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            let ori_values = {
                                                '编码': detailData.middle1[0].children,
                                                '类型': detailData.middle1[1].children,
                                                '名称': detailData.middle1[2].children,
                                                '提点': detailData.middle1[3].children,
                                                '备注': detailData.middle1[4].children
                                            }
                                            let values = {
                                                mid_1: detailData.middle1[0].children,
                                                m_type_1: detailData.middle1[1].children,
                                                m_name_1: detailData.middle1[2].children,
                                                m_point_1: detailData.middle1[3].children,
                                                m_note_1: detailData.middle1[4].children
                                            }
                                            setEditType('修改一级中间人');
                                            setIsShowEdit(true);
                                            setEditOri(ori_values)
                                            formEdit.setFieldsValue(values)
                                        }}
                                    >修改</Button>}
                                    {(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null :
                                        <Popconfirm
                                            title="删除一级中间人"
                                            description={`确认删除 ${detailData.middle1 && detailData.middle1[2].children} 吗?`}
                                            onConfirm={() => { editDetail(); }}
                                            okText="删除"
                                            cancelText="取消"
                                        >
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusOutlined />}
                                                onClick={() => {
                                                    let ori_values = {
                                                        '编码': detailData.middle1[0].children,
                                                        '类型': detailData.middle1[1].children,
                                                        '名称': detailData.middle1[2].children,
                                                        '提点': detailData.middle1[3].children,
                                                        '备注': detailData.middle1[4].children
                                                    }
                                                    setEditType('删除一级中间人');
                                                    setEditOri(ori_values);
                                                    formEdit.resetFields();
                                                }}
                                            >删除</Button>
                                        </Popconfirm>}
                                </Space>}
                                column={5}
                                items={detailData.middle1}
                            />}
                        {detailData.middle2 && detailData.middle2[0].children === null ?
                            <Descriptions
                                title={<Space>
                                    <span>无二级中间人</span>
                                    {(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null : <Button
                                        type="text"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            setEditType('添加二级中间人');
                                            setIsShowEdit(true);
                                            setEditOri({})
                                            formEdit.resetFields()
                                        }}
                                    >添加</Button>}
                                </Space>}
                            /> : <Descriptions
                                title={<Space>
                                    <span>二级中间人</span>
                                    {(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null : <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            let ori_values = {
                                                '编码': detailData.middle2[0].children,
                                                '类型': detailData.middle2[1].children,
                                                '名称': detailData.middle2[2].children,
                                                '提点': detailData.middle2[3].children,
                                                '备注': detailData.middle2[4].children
                                            }
                                            let values = {
                                                mid_2: detailData.middle2[0].children,
                                                m_type_2: detailData.middle2[1].children,
                                                m_name_2: detailData.middle2[2].children,
                                                m_point_2: detailData.middle2[3].children,
                                                m_note_2: detailData.middle2[4].children
                                            }
                                            setEditType('修改二级中间人');
                                            setIsShowEdit(true);
                                            setEditOri(ori_values)
                                            formEdit.setFieldsValue(values)
                                        }}
                                    >修改</Button>}
                                    {(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null :
                                        <Popconfirm
                                            title="删除二级中间人"
                                            description={`确认删除 ${detailData.middle2 && detailData.middle2[2].children} 吗?`}
                                            onConfirm={() => { editDetail(); }}
                                            okText="删除"
                                            cancelText="取消"
                                        >
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusOutlined />}
                                                onClick={() => {
                                                    let ori_values = {
                                                        '编码': detailData.middle2[0].children,
                                                        '类型': detailData.middle2[1].children,
                                                        '名称': detailData.middle2[2].children,
                                                        '提点': detailData.middle2[3].children,
                                                        '备注': detailData.middle2[4].children
                                                    }
                                                    setEditType('删除二级中间人');
                                                    setEditOri(ori_values);
                                                    formEdit.resetFields();
                                                }}
                                            >删除</Button>
                                        </Popconfirm>}
                                </Space>}
                                column={5}
                                items={detailData.middle2}
                            />}
                    </Card>
                    <Card
                        title={<Space>
                            <GlobalOutlined /><span>合作模式 ----- {detailData.models && detailData.models.length} 个</span>
                        </Space>}
                    >
                        {detailData.models && detailData.models.map((model, index) => {
                            return (
                                <Card
                                    key={index}
                                    title={`${model[1].children} - ${model[2].children}`}
                                    style={{ marginBottom: '20px' }}
                                >
                                    <Descriptions column={5} items={model[1].children === '线上平台' ? model.slice(3, 22) : model[1].children === '社群团购' ? model.slice(3, 12) : model[1].children === '供货' ? model.slice(3, 11) : model} />
                                </Card>
                            )
                        })}
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        title={<Space>
                            <SettingOutlined /><span>历史时间线</span>
                        </Space>}
                    >
                        <Timeline items={getTimeItems()} />
                    </Card>
                </Col>
            </Row>
            <Modal title="驳回理由填写" open={isShowRefund} onOk={() => {
                if (refundType === 'talent') {
                    checkChance(false, form.getFieldValue('note'));
                } else if (refundType === 'year') {
                    checkYear(false, form.getFieldValue('note'));
                } else if (refundType === 'point') {
                    checkPoint(false, form.getFieldValue('note'));
                }
            }} onCancel={() => { setIsShowRefund(false); }}>
                <Form form={form}>
                    <Form.Item label="驳回理由" name="note" rules={[{ required: true, message: '不能为空' }]}>
                        <TextArea placeholder="请输入" />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title={yearType === 'add' ? '新增年框' : yearType === 'continue' ? '续约年框' : '删除年框'} open={isShowYear} onOk={() => { addYear(); formYear.resetFields(); }} onCancel={() => { formYear.resetFields(); setIsShowYear(false); }}>
                <Form form={formYear}>
                    <Form.Item label="生效日期" name="yearpay_start" rules={[{ required: true, message: '不能为空' }]}>
                        <DatePicker onChange={(value) => { formYear.setFieldValue('yearpay_start') }} />
                    </Form.Item>
                    <Form.Item label="付款周期" name="yearpay_cycle" rules={[{ required: true, message: '不能为空' }]}>
                        <Select options={yearCycleType} />
                    </Form.Item>
                    <Form.Item label="返点（%）" name="yearpay_point" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber />
                    </Form.Item>
                    <Form.Item label="签约合同" name="yearpay_file" rules={[{ required: true, message: '不能为空' }]}>
                        <UpLoadImg title="上传合同图片" name="add_yearpay_file" setPicUrl={(value) => { formYear.setFieldValue('yearpay_file', value) }} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="修改信息"
                open={isShowEdit}
                onOk={() => {
                    editDetail();
                    formEdit.resetFields();
                    setIsShowEdit(false);
                }}
                onCancel={() => {
                    formEdit.resetFields();
                    setIsShowEdit(false);
                }}
            >
                <Form form={formEdit}>
                    {editType.match('联系人') ? <><Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '不能为空' }]}>
                        <Select
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择"
                            onChange={(value) => {
                                form.setFieldValue('liaison_type', value)
                            }}
                            options={liaisonType}
                        />
                    </Form.Item>
                        <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="联系人微信" name="liaison_v" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="联系人电话（选填）" name="liaison_phone">
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="沟通群名" name="crowd_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                    </> : editType.match('一级中间人') ? <><Space size='large'>
                        <Form.Item label="一级中间人" name="mid_1" rules={[{ required: true, message: '不能为空' }]}>
                            <Select showSearch placeholder="请输入" options={middlemans1} filterOption={filterOption} onChange={(value) => { searchMiddleman1(value) }} onSearch={(value) => { searchMiddleman1(value) }} />
                        </Form.Item>
                        <Form.Item label="一级中间人提成点（%）" name="m_point_1" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber />
                        </Form.Item>
                    </Space>
                        <Form.Item label="一级中间人提成备注" name="m_note_1">
                            <TextArea />
                        </Form.Item>
                    </> : editType.match('二级中间人') ? <><Space size='large'>
                        <Form.Item label="二级中间人" name="mid_2" rules={[{ required: true, message: '不能为空' }]}>
                            <Select showSearch placeholder="请输入" options={middlemans2} filterOption={filterOption} onChange={(value) => { searchMiddleman2(value) }} onSearch={(value) => { searchMiddleman2(value) }} />
                        </Form.Item>
                        <Form.Item label="二级中间人提成点（%）" name="m_point_2" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber />
                        </Form.Item>
                    </Space>
                        <Form.Item label="二级中间人提成备注" name="m_note_2">
                            <TextArea />
                        </Form.Item></> : null}
                </Form>
            </Modal>
        </Fragment>
    )
}

export default TalentDetail