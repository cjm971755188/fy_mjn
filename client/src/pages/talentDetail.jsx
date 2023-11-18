import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import request from '../service/request'
import dayjs from 'dayjs';
import { Card, Input, Timeline, Button, Tag, List, Modal, Form, Descriptions, Tooltip, Row, Col, message, Space, DatePicker, Select, InputNumber, Image } from 'antd';
import { AuditOutlined, MessageOutlined, GlobalOutlined, CrownOutlined, SettingOutlined, PlusOutlined, AimOutlined } from '@ant-design/icons';
import { yearCycleType } from '../baseData/talent'
import UpLoadImg from '../components/UpLoadImg'

const { TextArea } = Input;

function TalentDetail() {
    let location = useLocation();
    const { cid, tid, type } = location.state;
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
    // 获取详情
    const [detailData, setDetailData] = useState({})
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
                            {element.type === '报备审批通过' ? itemKey !== i ? <a onClick={() => {
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
                            }}>查看结算规则</a> : <a onClick={() => {
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
                                        title={<span>{`${item.title}`}</span>}
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
                                                    <Tooltip key={key} title={`备注：${item.u_note}`}>
                                                        <Tag style={{ margin: '5px' }} color="gold">{tag}</Tag>
                                                    </Tooltip>
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

    const navigate = useNavigate()
    const checkChance = (type, note) => {
        request({
            method: 'post',
            url: '/chance/checkChance',
            data: {
                cid: cid,
                tid: tid,
                type: type,
                note: type ? null: note,
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

    // 驳回
    const [isShowRefund, setIsShowRefund] = useState(false)
    const [form] = Form.useForm()
    const [refundType, setRefundType] = useState(false)

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
    const checkYear = (type, note) => {
        request({
            method: 'post',
            url: '/talent/checkYear',
            data: {
                cid: cid,
                tid: tid,
                type: type,
                note: type ? null: note,
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

    useEffect(() => {
        getTalentDetail();
    }, [tid])
    return (
        <Fragment>
            <Row gutter={24}>
                <Col span={18}>
                    <Card title={<Space><CrownOutlined /><span>基础信息</span></Space>} style={{ marginBottom: '20px' }} extra={type === 'check' ?
                        <Space>
                            <Button type="primary" onClick={() => { checkChance(true, ''); }}>通过</Button>
                            <Button type="primary" danger onClick={() => { setRefundType('talent'); setIsShowRefund(true); }}>驳回</Button>
                        </Space> : null}>
                        <Descriptions column={4} items={detailData.base} />
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
                        <Descriptions column={4} items={detailData.year && getYearItem()} />
                    </Card>
                    <Card title={<Space><MessageOutlined /><span>联络信息</span></Space>} style={{ marginBottom: '20px' }}>
                        <Descriptions title="联系人" column={4} items={detailData.liaison} />
                        {detailData.middle1 && detailData.middle1[0].children === null ?
                            <Descriptions title="无一级中间人" /> : <Descriptions title="一级中间人" column={4} items={detailData.middle1} />}
                        {detailData.middle2 && detailData.middle2[0].children === null ?
                            <Descriptions title="无二级中间人" /> : <Descriptions title="二级中间人" column={4} items={detailData.middle2} />}
                    </Card>
                    <Card title={<Space><GlobalOutlined /><span>合作模式 ----- {detailData.models && detailData.models.length} 个</span></Space>}>
                        {detailData.models && detailData.models.map((model, index) => {
                            return (
                                <Card
                                    key={index}
                                    title={`${model[1].children} - ${model[2].children}`}
                                    style={{ marginBottom: '20px' }}
                                >
                                    <Descriptions column={4} items={model[1].children === '线上平台' ? model.slice(3, 21) : model[1].children === '社群团购' ? model.slice(3, 11) : model[1].children === '供货' ? model.slice(3, 10) : model} />
                                </Card>

                            )
                        })}
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title={<Space><SettingOutlined /><span>历史时间线</span></Space>}>
                        <Timeline items={getTimeItems()} />
                    </Card>
                </Col>
            </Row>
            <Modal title="驳回理由填写" open={isShowRefund} onOk={() => { 
                if (refundType === 'talent') {
                    checkChance(false, form.getFieldValue('note')); 
                } else if (refundType === 'year') {
                    checkYear(false, form.getFieldValue('note')); 
                } else {
                    message.error('refund error')
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
        </Fragment>
    )
}

export default TalentDetail