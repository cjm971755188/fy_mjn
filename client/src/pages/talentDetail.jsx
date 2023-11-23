import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import request from '../service/request'
import dayjs from 'dayjs';
import { Card, Input, Timeline, Button, Tag, List, Modal, Form, Descriptions, Tooltip, Row, Col, message, Space, DatePicker, Select, InputNumber, Image, Popconfirm, Radio } from 'antd';
import { AuditOutlined, MessageOutlined, GlobalOutlined, CrownOutlined, SettingOutlined, EditOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { yearCycleType, liaisonType, platform, accountType, accountModelType, ageCut, priceCut } from '../baseData/talent'
import UpLoadImg from '../components/UpLoadImg'
import people from '../assets/people.jpg'

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
                            {!element.type.match('审批') && !(element.type.match('新') && element.type.match('已通过')) ? itemKey !== i ? <a onClick={() => {
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
                                } else {
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
    const checkTalent = (_type, _note) => {
        request({
            method: 'post',
            url: '/talent/checkTalent',
            data: {
                cid: cid,
                tid: tid,
                type: _type,
                checkType: type,
                note: _type ? null : _note,
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

    // 新增年框
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

    // 修改信息
    const [isShowEdit, setIsShowEdit] = useState(false)
    const [formEdit] = Form.useForm()
    const [editType, setEditType] = useState('')
    const [editOri, setEditOri] = useState()
    const editDetail = () => {
        let formInfo = editType.match('修改') && editType.match('模式') ? form.getFieldsValue() : formEdit.getFieldsValue()
        console.log('formInfo: ', formInfo);
        if (editType.match('线上')) {
            formInfo.account_models = formInfo.account_models.join(',')
            formInfo.age_cuts = formInfo.age_cuts.join(',')
        }
        let length = Object.keys(formInfo).length, x = 0, y = 0, ori = {}, neww = {}
        for (let i = 0; i < Object.getOwnPropertyNames(editOri).length; i++) {
            let o = Object.values(editOri)[i]
            for (let j = 0; j < Object.getOwnPropertyNames(formInfo).length; j++) {
                let n = Object.values(formInfo)[j]
                if (i === j && o === n) {
                    x++
                } else if (i === j && o !== n) {
                    ori[Object.keys(editOri)[i]] = Object.values(editOri)[i]
                    neww[Object.keys(formInfo)[j]] = Object.values(formInfo)[j]
                    if (Object.keys(formInfo)[j].split('_')[0] === 'u' || Object.keys(formInfo)[j].split('_')[0] === 'm' || Object.keys(formInfo)[j].split('_')[0] === 'commission' || Object.keys(formInfo)[j].split('_')[0] === 'discount') {
                        y++
                    }
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
                    tid: tid,
                    tdid: editType.match('修改') && editType.match('模式') ? form.getFieldValue('tdid') : null,
                    baseOrPoint: y === 0 ? 'base' : 'point',
                    editType: editType,
                    ori: editType === '修改联系人' ? JSON.stringify(ori) : Object.keys(editOri).length === 0 ? null : JSON.stringify(editOri),
                    new: editType.match('删除') ? null : Object.keys(neww).length === 0 ? formInfo : neww,
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
                        form.resetFields();
                        setIsShowEdit(false)
                        setIsShowModel(false)
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
    const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    // 驳回理由
    const [isShowRefund, setIsShowRefund] = useState(false)
    const [formRefund] = Form.useForm()

    // 添加、修改合作模式
    const [isShowModel, setIsShowModel] = useState(false)
    const [form] = Form.useForm()
    const [isShowSearch, setIsShowSearch] = useState(false)
    const [searchList, setSearchList] = useState({})
    const searchSame = () => {
        request({
            method: 'post',
            url: '/chance/searchSameChance',
            data: {
                type: 'single',
                account_name: form.getFieldValue('account_name'),
                account_id: form.getFieldValue('account_id')
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code != 200) {
                    setIsShowSearch(true)
                    setSearchList(res.data.data)
                    message.error(res.data.msg)
                } else {
                    setIsShowSearch(false)
                    setSearchList({})
                    message.success(res.data.msg)
                }
            } else {
                message.error(res.data.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const [isShowKeyword, setIsShowKeyword] = useState(false)
    const [hasFuSaleman, setHasFuSaleman] = useState(false)
    const addTalent = () => {
        request({
            method: 'post',
            url: '/talent/addTalent',
            data: {
                tid: tid,
                accounts: [{ ...form.getFieldsValue() }],
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
                    setIsShowModel(false);
                    getTalentDetail();
                    form.resetFields(); setIsShowSearch(false); setSearchList({}); setIsShowPlatform(false); setIsShowGroup(false); setHasFuSaleman(false);
                }
            } else {
                message.error(res.data.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const [salemans, setSalemans] = useState()
    const getSalemans = () => {
        request({
            method: 'post',
            url: '/user/getSalemans',
            data: {
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
                    setSalemans(res.data.data)
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
                <Col span={16}>
                    <Card title={<Space><CrownOutlined /><span>基础信息</span>
                        {detailData.base && <Tag color={detailData.base[3].children.match('待审批') ? "gold" : detailData.base[3].children === '合作中' ? "green" : ""}>{detailData.base[3].children}</Tag>}
                    </Space>}
                        style={{ marginBottom: '20px' }}
                        extra={type !== 'look' ?
                            <Space>
                                <Button type="primary" onClick={() => { checkTalent(true, null); }}>通过</Button>
                                <Button type="primary" danger onClick={() => { setIsShowRefund(true); }}>驳回</Button>
                            </Space> : null}>
                        <Descriptions column={5} items={detailData.base && getBaseItem()} />
                    </Card>
                    <Card title={<Space><AuditOutlined /><span>年框信息</span>
                        <Tag color={yearStatus === '待审批' ? "gold" : yearStatus === '生效中' ? "green" : yearStatus === '已失效' ? "red" : ""}>{yearStatus}</Tag>
                    </Space>}
                        style={{ marginBottom: '20px' }}
                        extra={
                            detailData.year && (localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ? null :
                                detailData.year[4].children === '暂无' ? <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowYear(true); setYearType('add'); }}>新增</Button> :
                                    detailData.year[4].children === '已失效' ? <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowYear(true); setYearType('continue'); }}>续约</Button> : null
                            )
                        }>
                        <Descriptions column={5} items={detailData.year && getYearItem()} />
                    </Card>
                    <Card title={<Space><MessageOutlined /><span>联络信息</span></Space>} style={{ marginBottom: '20px' }}>
                        <Descriptions title="联系人" column={5} items={detailData.liaison}
                            extra={(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null :
                                <Button
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
                                >修改</Button>} />
                        {detailData.middle1 && detailData.middle1[0].children === null ?
                            <Descriptions title="无一级中间人"
                                extra={(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null :
                                    <Button
                                        type="text"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            setEditType('新增一级中间人');
                                            setIsShowEdit(true);
                                            setEditOri({})
                                            formEdit.resetFields()
                                        }}
                                    >新增</Button>}
                            /> : <Descriptions title="一级中间人" column={5} items={detailData.middle1}
                                extra={<>{(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null :
                                    <Button
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
                                                m_id_1: detailData.middle1[0].children,
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
                                        </Popconfirm>}</>}
                            />}
                        {detailData.middle2 && detailData.middle2[0].children === null ?
                            <Descriptions title="无二级中间人"
                                extra={(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null :
                                    <Button
                                        type="text"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            setEditType('新增二级中间人');
                                            setIsShowEdit(true);
                                            setEditOri({})
                                            formEdit.resetFields()
                                        }}
                                    >新增</Button>}
                            /> : <Descriptions title="二级中间人" column={5} items={detailData.middle2}
                                extra={<>{(localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员') || (detailData.base && detailData.base[3].children.match('待审批')) ? null :
                                    <Button
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
                                                m_id_2: detailData.middle2[0].children,
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
                                        </Popconfirm>}</>}
                            />}
                    </Card>
                    <Card title={<Space><GlobalOutlined /><span>合作模式 ----- {detailData.models && detailData.models.length} 个</span></Space>}
                        extra={localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ? null : <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowModel(true); setEditType('新增线上模式'); }}>新增线上平台</Button>}
                    >
                        {detailData.models && detailData.models.map((model, index) => {
                            let mm = []
                            for (let i = 0; i < model.length; i++) {
                                if (model[i].label === '主商务编码' || model[i].label === '副商务编码') {
                                    continue
                                }
                                mm.push(model[i])
                            }
                            return (
                                <Card
                                    key={index}
                                    title={<span>{model[1].children} - {model[2].children}</span>}
                                    style={{ marginBottom: '20px' }}
                                    extra={localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ? null :
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={() => {
                                                let ori_values = {}
                                                for (let i = 0; i < model.length; i++) {
                                                    if (model[i].children !== null) {
                                                        ori_values[model[i].label] = model[i].children
                                                    }
                                                }
                                                setEditOri(ori_values)
                                                if (model[1].children === '线上平台') {
                                                    let account_models = model[6].children.split(',')
                                                    let age_cuts = model[10].children.split(',')
                                                    form.setFieldValue('tdid', model[0].children)
                                                    form.setFieldValue('model', model[1].children)
                                                    form.setFieldValue('platform_shop', model[2].children)
                                                    form.setFieldValue('account_id', model[3].children)
                                                    form.setFieldValue('account_name', model[4].children)
                                                    form.setFieldValue('account_type', model[5].children)
                                                    form.setFieldValue('account_models', account_models)
                                                    form.setFieldValue('keyword', model[7].children)
                                                    form.setFieldValue('people_count', model[8].children)
                                                    form.setFieldValue('fe_proportion', model[9].children)
                                                    form.setFieldValue('age_cuts', age_cuts)
                                                    form.setFieldValue('main_province', model[11].children)
                                                    form.setFieldValue('price_cut', model[12].children)
                                                    form.setFieldValue('commission_normal', model[13].children)
                                                    form.setFieldValue('commission_welfare', model[14].children)
                                                    form.setFieldValue('commission_bao', model[15].children)
                                                    form.setFieldValue('commission_note', model[16].children)
                                                    form.setFieldValue('u_id_1', model[17].children)
                                                    form.setFieldValue('u_name_1', model[18].children)
                                                    form.setFieldValue('u_point_1', model[19].children)
                                                    form.setFieldValue('u_id_2', model[20].children)
                                                    form.setFieldValue('u_name_2', model[21].children)
                                                    form.setFieldValue('u_point_2', model[22].children)
                                                    form.setFieldValue('u_note', model[23].children)
                                                    setEditType('修改线上模式');
                                                } else if (model[1].children === '社群团购') {
                                                    form.setFieldValue('tdid', model[0].children)
                                                    form.setFieldValue('model', model[1].children)
                                                    form.setFieldValue('platform_shop', model[2].children)
                                                    form.setFieldValue('discount_normal', model[3].children)
                                                    form.setFieldValue('discount_welfare', model[4].children)
                                                    form.setFieldValue('discount_bao', model[5].children)
                                                    form.setFieldValue('discount_note', model[6].children)
                                                    form.setFieldValue('u_id_1', model[7].children)
                                                    form.setFieldValue('u_name_1', model[8].children)
                                                    form.setFieldValue('u_point_1', model[9].children)
                                                    form.setFieldValue('u_id_2', model[10].children)
                                                    form.setFieldValue('u_name_2', model[11].children)
                                                    form.setFieldValue('u_point_2', model[12].children)
                                                    form.setFieldValue('u_note', model[13].children)
                                                    setEditType('修改社群团购模式');
                                                } else if (model[1].children === '供货') {
                                                    form.setFieldValue('tdid', model[0].children)
                                                    form.setFieldValue('model', model[1].children)
                                                    form.setFieldValue('platform_shop', model[2].children)
                                                    form.setFieldValue('discount_buyout', model[3].children)
                                                    form.setFieldValue('discount_back', model[4].children)
                                                    form.setFieldValue('discount_label', model[5].children)
                                                    form.setFieldValue('u_id_1', model[6].children)
                                                    form.setFieldValue('u_name_1', model[7].children)
                                                    form.setFieldValue('u_point_1', model[8].children)
                                                    form.setFieldValue('u_id_2', model[9].children)
                                                    form.setFieldValue('u_name_2', model[10].children)
                                                    form.setFieldValue('u_point_2', model[11].children)
                                                    form.setFieldValue('u_note', model[12].children)
                                                    setEditType('修改供货模式');
                                                }
                                                setIsShowModel(true);
                                            }}
                                        >修改</Button>}
                                >
                                    <Descriptions column={5} items={model[1].children === '线上平台' ? mm.slice(3, 22) : model[1].children === '社群团购' ? mm.slice(3, 12) : model[1].children === '供货' ? mm.slice(3, 11) : mm} />
                                </Card>
                            )
                        })}
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={<Space><SettingOutlined /><span>历史时间线</span></Space>}>
                        <Timeline items={getTimeItems()} />
                    </Card>
                </Col>
            </Row>
            <Modal title="驳回理由填写" open={isShowRefund}
                onOk={() => { checkTalent(false, formRefund.getFieldValue('note')); setIsShowRefund(false); }}
                onCancel={() => { setIsShowRefund(false); }}>
                <Form form={formRefund}>
                    <Form.Item label="驳回理由" name="note" rules={[{ required: true, message: '不能为空' }]}>
                        <TextArea placeholder="请输入" />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title={yearType === 'add' ? '新增年框' : yearType === 'continue' ? '续约年框' : '删除年框'} open={isShowYear}
                onOk={() => { addYear(); formYear.resetFields(); }}
                onCancel={() => { formYear.resetFields(); setIsShowYear(false); }}>
                <Form form={formYear}>
                    <Form.Item label="生效日期" name="yearpay_start" rules={[{ required: true, message: '不能为空' }]}>
                        <DatePicker onChange={(value) => { formYear.setFieldValue('yearpay_start', value) }} />
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
            <Modal title="修改联系人" open={isShowEdit}
                onOk={() => { editDetail(); formEdit.resetFields(); setIsShowEdit(false); }}
                onCancel={() => { formEdit.resetFields(); setIsShowEdit(false); }}>
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
                        <Form.Item label="一级中间人" name="m_id_1" rules={[{ required: true, message: '不能为空' }]}>
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
                        <Form.Item label="二级中间人" name="m_id_2" rules={[{ required: true, message: '不能为空' }]}>
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
            <Modal title={editType === '新增线上模式' ? "新增线上账号" : editType === '修改线上模式' ? '修改线上账号' : editType === '修改社群团购模式' ? '修改社群团购模式' : '修改供货模式'} open={isShowModel}
                onOk={() => { form.submit(); }}
                onCancel={() => { setIsShowModel(false); form.resetFields(); }}>
                <Form
                    form={form}
                    onFinish={(values) => {
                        if (editType === '新增线上模式') {
                            addTalent(values)
                        } else {
                            editDetail()
                        }
                    }}
                >
                    {editType === '新增线上模式' || editType === '修改线上模式' ? <><Form.Item label="编号" name="tdid" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" disabled={editType === '修改线上模式' ? true : false} />
                    </Form.Item>
                        <Form.Item label="模式" name="model" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" disabled={editType === '修改线上模式' ? true : false} />
                        </Form.Item>
                        <Form.Item label="平台" name="platform_shop" rules={[{ required: true, message: '不能为空' }]}>
                            <Select
                                placeholder="请选择"
                                options={platform}
                                disabled={editType === '修改线上模式' ? true : false}
                                onChange={(value) => {
                                    form.setFieldValue('platform', value)
                                    if (value !== '闯货' && value !== '抖音' && value !== '快手' && value !== '视频号' && value !== '视频号服务商') {
                                        setIsShowKeyword(true)
                                    }
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="账号ID" name="account_id" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" disabled={editType === '修改线上模式' ? true : false} />
                        </Form.Item>
                        <Form.Item label="账号名称" name="account_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" disabled={editType === '修改线上模式' ? true : false} />
                        </Form.Item>
                        {editType === '修改线上模式' ? null : <Form.Item label="相同线上达人">
                            <Button onClick={() => {
                                if ((form.getFieldValue('account_name') && form.getFieldValue('account_name').length > 0) || (form.getFieldValue('account_id') && form.getFieldValue('account_id').length > 0)) {
                                    searchSame()
                                } else {
                                    setIsShowSearch(false)
                                    setSearchList({})
                                    message.error('未填写达人账号名/ID, 无法查询')
                                }
                            }}>查询</Button>
                        </Form.Item>}
                        {isShowSearch && <Form.Item label="">
                            {searchList.length > 0 ? <List
                                itemLayout="horizontal"
                                bordered
                                dataSource={searchList}
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Image width={50} src={people} preview={false} />}
                                            title={<Space size={'large'}><span>{`编号: ${item.tdid}`}</span><span>{`商务: ${item.name}`}</span></Space>}
                                            description={<Space size={'large'}><span>{`平台: ${item.platform_shop}`}</span><span>{`账号ID: ${item.account_id}`}</span><span>{`账号名称: ${item.account_name}`}</span></Space>}
                                        />
                                    </List.Item>
                                )}
                            /> : null}
                        </Form.Item>}
                        <Form.Item label="账号类型" name="account_type" rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('account_type', value) }} options={accountType} />
                        </Form.Item>
                        <Form.Item label="合作方式" name="account_models" rules={[{ required: true, message: '不能为空' }]}>
                            <Select mode="multiple" allowClear placeholder="请选择" onChange={(value) => { form.setFieldValue('account_models', value) }} options={accountModelType} />
                        </Form.Item>
                        {isShowKeyword ? <Form.Item label="关键字（前后缀）" name="keyword" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item> : null}
                        <Form.Item label="平时带货在线（人）" name="people_count" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber />
                        </Form.Item>
                        <Form.Item label="女粉比例（%）" name="fe_proportion" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber />
                        </Form.Item>
                        <Form.Item label="粉丝购买主力年龄段（岁）" name="age_cuts" rules={[{ required: true, message: '不能为空' }]}>
                            <Select mode="multiple" allowClear options={ageCut} />
                        </Form.Item>
                        <Form.Item label="粉丝地域分布（省份）" name="main_province" rules={[{ required: true, message: '不能为空' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="平均客单价（元）" name="price_cut" rules={[{ required: true, message: '不能为空' }]}>
                            <Select options={priceCut} />
                        </Form.Item>
                        <Form.Item label="常规品线上佣金比例（%）" name="commission_normal" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber />
                        </Form.Item>
                        <Form.Item label="福利品线上佣金比例（%）" name="commission_welfare" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber />
                        </Form.Item>
                        <Form.Item label="爆品线上佣金比例（%）" name="commission_bao" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber />
                        </Form.Item>
                        <Form.Item label="佣金备注" name="commission_note">
                            <TextArea />
                        </Form.Item></> : null}
                    {editType === '修改社群团购模式' ? <Card title="社群团购" style={{ marginBottom: "20px" }}>
                        <Form.Item label="聚水潭店铺名" name="platform_shop">
                            <Input placeholder="请输入" disabled={true} />
                        </Form.Item>
                        <Form.Item label="常规品折扣（折）" name="discount_normal" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="福利品折扣（折）" name="discount_welfare" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="爆品折扣（折）" name="discount_bao" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="折扣备注" name="discount_note">
                            <TextArea placeholder="请输入" />
                        </Form.Item>
                    </Card> : null}
                    {editType === '修改供货模式' ? <Card title="供货" style={{ marginBottom: "20px" }}>
                        <Form.Item label="聚水潭店铺名" name="platform_shop">
                            <Input placeholder="请输入" disabled={true} />
                        </Form.Item>
                        <Form.Item label="买断折扣（折）" name="discount_buyout" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="含退货率折扣（折）" name="discount_back" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="折扣备注" name="discount_label">
                            <TextArea placeholder="请输入" />
                        </Form.Item>
                    </Card> : null}
                    <Form.Item label="主商务编号" name="u_id_1" >
                        <Input defaultValue={localStorage.getItem('uid')} disabled={true} />
                    </Form.Item>
                    <Form.Item label="主商务" name="u_name_1" >
                        <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                    </Form.Item>
                    <Form.Item label="主商务提成点（%）" name="u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber />
                    </Form.Item>
                    <Form.Item label="是否有副商务">
                        <Radio.Group onChange={(e) => { setHasFuSaleman(e.target.value); }} value={hasFuSaleman} style={{ marginLeft: '20px' }}>
                            <Radio value={false}>无副商务</Radio>
                            <Radio value={true}>有副商务</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {hasFuSaleman ? <>
                        <Form.Item label="副商务" name="u_id_2" rules={[{ required: true, message: '不能为空' }]}>
                            <Select style={{ width: 160 }} options={salemans} onFocus={() => { getSalemans(); }} />
                        </Form.Item>
                        <Form.Item label="副商务提成点（%）" name="u_point_2" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber />
                        </Form.Item>
                    </> : null}
                    <Form.Item label="商务提成备注" name="u_note">
                        <TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}

export default TalentDetail