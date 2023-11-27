import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import request from '../service/request'
import dayjs from 'dayjs';
import { Card, Input, Timeline, Button, Tag, List, Modal, Form, Descriptions, Tooltip, Row, Col, message, Space, DatePicker, Select, InputNumber, Image, Popconfirm, Radio } from 'antd';
import { AuditOutlined, MessageOutlined, GlobalOutlined, CrownOutlined, SettingOutlined, EditOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { yearCycleType, liaisonType, platform, accountType, accountModelType, ageCut, priceCut } from '../baseData/talent'
import { descriptionsItems } from '../baseData/talentDetail'
import UpLoadImg from '../components/UpLoadImg'
import people from '../assets/people.jpg'
import AELiaison from '../components/modals/AELiaison'

const { TextArea } = Input;

function TalentDetail() {
    // 路由
    let location = useLocation();
    const navigate = useNavigate()
    const { tid, type } = location.state;
    // 操作权限
    const examPower = localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ? true : false

    // 获取详情
    const [detailData, setDetailData] = useState({
        status: '',
        yearbox_status: ''
    })
    const getTalentDetailAPI = () => {
        request({
            method: 'post',
            url: '/talent/getTalentDetail',
            data: {
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
    const getBaseItems = () => {
        let items = []
        for (let i = 0; i < Object.getOwnPropertyNames(detailData).length; i++) {
            for (let j = 0; j < descriptionsItems.length; j++) {
                if (Object.keys(detailData)[i] === descriptionsItems[j].value) {
                    const description = {
                        key: i,
                        label: descriptionsItems[j].label,
                        children: Object.values(detailData)[i]
                    }
                    if ([0, 2, 3, 4].indexOf(descriptionsItems[j].key) !== -1) {
                        items.push(description)
                    }
                }
            }
        }
        return items
    }
    const getYearItems = () => {
        let items = []
        for (let i = 0; i < Object.getOwnPropertyNames(detailData).length; i++) {
            for (let j = 0; j < descriptionsItems.length; j++) {
                if (Object.keys(detailData)[i] === descriptionsItems[j].value) {
                    const description = {
                        key: i,
                        label: descriptionsItems[j].label,
                        children: Object.values(detailData)[i]
                    }
                    if (description.label === '生效日期') {
                        description.children = description.children === null ? null : dayjs(Number(description.children)).format('YYYY-MM-DD')
                    }
                    if (description.label === '合同') {
                        description.children = <Image width={50} src={description.children} />
                    }
                    if ([15, 16, 17, 18].indexOf(descriptionsItems[j].key) !== -1) {
                        items.push(description)
                    }
                }
            }
        }
        return items
    }
    const getLiaisonItems = () => {
        let items = []
        for (let i = 0; i < Object.getOwnPropertyNames(detailData).length; i++) {
            for (let j = 0; j < descriptionsItems.length; j++) {
                if (Object.keys(detailData)[i] === descriptionsItems[j].value) {
                    const description = {
                        key: i,
                        label: descriptionsItems[j].label,
                        children: Object.values(detailData)[i]
                    }
                    if ([5, 6, 7, 8, 9].indexOf(descriptionsItems[j].key) !== -1) {
                        items.push(description)
                    }
                }
            }
        }
        return items
    }
    const getMiddleman1Items = () => {
        let items = []
        for (let i = 0; i < Object.getOwnPropertyNames(detailData).length; i++) {
            for (let j = 0; j < descriptionsItems.length; j++) {
                if (Object.keys(detailData)[i] === descriptionsItems[j].value) {
                    const description = {
                        key: i,
                        label: descriptionsItems[j].label,
                        children: Object.values(detailData)[i]
                    }
                    if (description.label === '提点') {
                        description.span = 2
                    }
                    if (description.label === '提点备注') {
                        description.span = 5
                    }
                    if ([19, 20, 21, 22, 27].indexOf(descriptionsItems[j].key) !== -1) {
                        items.push(description)
                    }
                }
            }
        }
        return items
    }
    const getMiddleman2Items = () => {
        let items = []
        for (let i = 0; i < Object.getOwnPropertyNames(detailData).length; i++) {
            for (let j = 0; j < descriptionsItems.length; j++) {
                if (Object.keys(detailData)[i] === descriptionsItems[j].value) {
                    const description = {
                        key: i,
                        label: descriptionsItems[j].label,
                        children: Object.values(detailData)[i]
                    }
                    if (description.label === '提点') {
                        description.span = 2
                    }
                    if (description.label === '提点备注') {
                        description.span = 5
                    }
                    if ([23, 24, 25, 26, 27].indexOf(descriptionsItems[j].key) !== -1) {
                        items.push(description)
                    }
                }
            }
        }
        return items
    }
    const getModelsItems = (data) => {
        let items = []
        for (let i = 0; i < Object.getOwnPropertyNames(data).length; i++) {
            for (let j = 0; j < descriptionsItems.length; j++) {
                if (Object.keys(data)[i] === descriptionsItems[j].value) {
                    const description = {
                        key: i,
                        label: descriptionsItems[j].label,
                        children: Object.values(data)[i]
                    }
                    if (data.model === '线上平台') {
                        if (descriptionsItems[j].key >= 28 && descriptionsItems[j].key <= 41) {
                            if (descriptionsItems[j].key === 41) {
                                description.span = 2
                            }
                            items.push(description)
                        }
                    } else if (data.model === '社群团购') {
                        if (descriptionsItems[j].key >= 42 && descriptionsItems[j].key <= 45) {
                            if (descriptionsItems[j].key === 45) {
                                description.span = 2
                            }
                            items.push(description)
                        }
                    } else if (data.model === '供货') {
                        if (descriptionsItems[j].key >= 46 && descriptionsItems[j].key <= 48) {
                            if (descriptionsItems[j].key === 48) {
                                description.span = 3
                            }
                            items.push(description)
                        }
                    }
                    if ([50, 51, 53, 54, 55].indexOf(descriptionsItems[j].key) !== -1) {
                        items.push(description)
                    }
                }
            }
        }
        return items
    }
    const getTimeItems = () => {
        let items = []
        if (detailData.schedule) {
            for (let i = 0; i < detailData.schedule.length; i++) {
                const element = detailData.schedule[i];
                let item = {
                    color: element.examine_result.match('通过') ? 'green' : element.examine_result.match('驳回') ? 'red' : '#1677ff',
                    children: <div>
                        <Space>
                            <Row>{`【${dayjs(Number(element.create_time)).format('YYYY-MM-DD')}】 ${element.u_name_1} ${element.operate}`}{element.examine_uid === null ? null : element.examine_time === null ? `-----@${element.u_name_2} 审批` : null}</Row>
                            {/* {!element.operate.match('审批') ? itemKey !== i ? <a onClick={() => {
                                
                            }}>查看</a> : <a onClick={() => {
                                setPointTags([])
                                setItemKey(19980426)
                            }}>隐藏</a> : null} */}
                        </Space>
                        <Row>{element.examine_time === null ? null : `【${dayjs(Number(element.examine_time)).format('YYYY-MM-DD')}】 ${element.u_name_2} 审批${element.examine_result}`}{element.examine_note === null ? null : `备注：${element.examine_note}`}</Row>
                        {/* {itemKey !== i ? null : <List
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
                        />} */}
                    </div>
                }
                items.push(item)
            }
            items.push({ color: 'gray', children: '' })
        }
        return items
    }

    // 时间线
    const [itemKey, setItemKey] = useState(19980426)
    const [pointTags, setPointTags] = useState([])

    // 新增年框
    const [isShowYear, setIsShowYear] = useState(false)
    const [yearType, setYearType] = useState()
    const [formYear] = Form.useForm()
    const editYearAPI = (operate, payload) => {
        request({
            method: 'post',
            url: '/talent/editTalent',
            data: {
                tid,
                operate,
                ori: null,
                new: payload,
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
                    setIsShowYear(false)
                    getTalentDetailAPI()
                    formYear.resetFields()
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
    // 修改联系人
    const [isShowLiaison, setIsShowLiaison] = useState(false)
    const [formLiaison] = Form.useForm()
    const [editOri, setEditOri] = useState()
    const editLiaisonAPI = (operate, payload) => {
        request({
            method: 'post',
            url: '/talent/editTalent',
            data: {
                tid,
                operate,
                ori: JSON.stringify(editOri),
                new: payload,
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
                    setIsShowLiaison(false);
                    getTalentDetailAPI();
                    formLiaison.resetFields();
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
    // 新增、修改、删除中间人
    const [isShowMiddle, setIsShowMiddle] = useState(false)
    const [formMiddle] = Form.useForm()
    const [middleType, setMiddleType] = useState()
    const [middlemans, setMiddlemans] = useState()
    const searchMiddlemansAPI = (value) => {
        request({
            method: 'post',
            url: '/middleman/searchMiddlemans',
            data: {
                value,
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
                    setMiddlemans(res.data.data)
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
    const editMiddleAPI = (operate, payload) => {
        request({
            method: 'post',
            url: '/talent/editTalent',
            data: {
                tid,
                operate,
                ori: null,
                new: payload,
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
                    setIsShowMiddle(false);
                    getTalentDetailAPI();
                    formMiddle.resetFields();
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
    // 各类审批
    const [isShowRefund, setIsShowRefund] = useState(false)
    const [formRefund] = Form.useForm()
    const examTalentAPI = (exam, note) => {
        request({
            method: 'post',
            url: '/talent/examTalent',
            data: {
                tid, tid,
                tsid: detailData.tsid,
                status: detailData.status,
                exam,
                note: exam ? null : note,
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
                        getTalentDetailAPI()
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
                    getTalentDetailAPI();
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
        getTalentDetailAPI();
    }, [tid])
    return (
        <Fragment>
            <Row gutter={24}>
                <Col span={16}>
                    <Card title={<Space><CrownOutlined /><span>基础信息</span>
                        <Tag color={detailData.status && (detailData.status.match('待审批') ? 'gold' : detailData.status.match('合作中') ? 'green' : 'grey')}>{detailData.status && detailData.status}</Tag>
                    </Space>}
                        style={{ marginBottom: '20px' }}
                        extra={examPower && detailData.status.match('待审批') ?
                            <Space>
                                <Button type="primary" onClick={() => { examTalentAPI(true, null); }}>通过</Button>
                                <Button type="primary" danger onClick={() => { setIsShowRefund(true); }}>驳回</Button>
                            </Space> : null}
                    >
                        <Descriptions column={5} items={getBaseItems()} />
                    </Card>
                    <Card title={<Space><AuditOutlined /><span>年框信息</span>
                        <Tag color={detailData.yearbox_status === '待审批' ? "gold" : detailData.yearbox_status === '生效中' ? "green" : detailData.yearbox_status === '已失效' ? "red" : ""}>{detailData.yearbox_status}</Tag>
                    </Space>}
                        style={{ marginBottom: '20px' }}
                        extra={examPower ? null :
                            detailData.yearbox_status === '暂无' ? <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowYear(true); setYearType('新增年框'); }}>新增</Button> :
                                detailData.yearbox_status === '已失效' ? <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowYear(true); setYearType('续约年框'); }}>续约</Button> : null
                        }
                    >
                        <Descriptions column={5} items={getYearItems()} />
                    </Card>
                    <Card title={<Space><MessageOutlined /><span>联络信息</span></Space>} style={{ marginBottom: '20px' }}>
                        <Descriptions title="联系人" column={5} items={getLiaisonItems()}
                            extra={examPower || (detailData.status.match('待审批')) ? null : <Button type="text" icon={<EditOutlined />} onClick={() => {
                                let ori = {}
                                for (const key in detailData) {
                                    if (Object.hasOwnProperty.call(detailData, key)) {
                                        if (key.match('liaison') || key === 'crowd_name') {
                                            ori[key] = detailData[key]
                                        }
                                    }
                                }
                                setEditOri(ori)
                                formLiaison.setFieldsValue({ tid: tid, ...ori })
                                setIsShowLiaison(true);
                            }}>修改</Button>}
                        />
                        {detailData.m_id_1 === null ? <Descriptions title="无一级中间人"
                            extra={examPower || (detailData.status.match('待审批')) ? null : <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowMiddle(true); setMiddleType('新增一级中间人'); }}>新增</Button>}
                        /> : <Descriptions title="一级中间人" column={5} items={getMiddleman1Items()}
                            extra={<>
                                {examPower || (detailData.status.match('待审批')) ? null : <Button type="text" icon={<EditOutlined />} onClick={() => {
                                    formMiddle.setFieldsValue({
                                        m_id: {
                                            value: detailData.m_id_1,
                                            label: detailData.m_name_1
                                        },
                                        m_point: detailData.m_point_1
                                    })
                                    setIsShowMiddle(true);
                                    setMiddleType('修改一级中间人');
                                }}>修改</Button>}
                                {examPower || (detailData.status.match('待审批')) ? null :
                                    <Popconfirm
                                        title="删除一级中间人"
                                        description={`确认删除 ${detailData.m_name_1} 吗?`}
                                        onConfirm={() => {
                                            editMiddleAPI('删除一级中间人', {
                                                m_id_1: null,
                                                m_point_1: null
                                            });
                                        }}
                                        okText="删除"
                                        cancelText="取消"
                                    >
                                        <Button type="text" danger icon={<MinusOutlined />}>删除</Button>
                                    </Popconfirm>}
                            </>}
                        />}
                        {detailData.m_id_2 === null ? <Descriptions title="无二级中间人"
                            extra={examPower || (detailData.status.match('待审批')) ? null : <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowMiddle(true); setMiddleType('新增二级中间人'); }}>新增</Button>}
                        /> : <Descriptions title="二级中间人" column={5} items={getMiddleman2Items()}
                            extra={<>
                                {examPower || (detailData.status.match('待审批')) ? null : <Button type="text" icon={<EditOutlined />} onClick={() => {
                                    formMiddle.setFieldsValue({
                                        m_id: {
                                            value: detailData.m_id_2,
                                            label: detailData.m_name_2
                                        },
                                        m_point: detailData.m_point_2
                                    })
                                    setIsShowMiddle(true);
                                    setMiddleType('修改二级中间人');
                                }}>修改</Button>}
                                {examPower || (detailData.status.match('待审批')) ? null :
                                    <Popconfirm
                                        title="删除二级中间人"
                                        description={`确认删除 ${detailData.m_name_2} 吗?`}
                                        onConfirm={() => {
                                            editMiddleAPI('删除二级中间人', {
                                                m_id_2: null,
                                                m_point_2: null
                                            });
                                        }}
                                        okText="删除"
                                        cancelText="取消"
                                    >
                                        <Button type="text" danger icon={<MinusOutlined />}>删除</Button>
                                    </Popconfirm>}
                            </>}
                        />}
                    </Card>
                    <Card title={<Space><GlobalOutlined /><span>合作模式 ----- {detailData.models && detailData.models.length} 个</span></Space>}
                    /* extra={localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ? null : 
                    <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowModel(true); setEditType('新增线上模式'); }}>新增线上平台</Button>} */
                    >
                        {detailData.models && detailData.models.map((model, index) => {
                            return (
                                <Card
                                    key={index}
                                    title={<span>{model.model}__{model.platform}__{model.shop}</span>}
                                    style={{ marginBottom: '20px' }}
                                /* extra={localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ? null :
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setIsShowModel(true);
                                        }}
                                    >修改</Button>
                                } */
                                >
                                    <Descriptions column={5} items={getModelsItems(model)} />
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
                onOk={() => { examTalentAPI(false, formRefund.getFieldValue('note')); setIsShowRefund(false); }}
                onCancel={() => { setIsShowRefund(false); }}
            >
                <Form form={formRefund}>
                    <Form.Item label="驳回理由" name="note" rules={[{ required: true, message: '不能为空' }]}>
                        <TextArea placeholder="请输入" />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title={yearType} open={isShowYear}
                onOk={() => {
                    editYearAPI(yearType, {
                        ...formYear.getFieldsValue(),
                        yearbox_start_date: dayjs(formYear.getFieldValue('yearbox_start_date')).valueOf()
                    });
                }}
                onCancel={() => { formYear.resetFields(); setIsShowYear(false); }}>
                <Form form={formYear}>
                    <Form.Item label="生效日期" name="yearbox_start_date" rules={[{ required: true, message: '不能为空' }]}>
                        <DatePicker onChange={(value) => { formYear.setFieldValue('yearbox_start_date', value) }} />
                    </Form.Item>
                    <Form.Item label="付款周期" name="yearbox_cycle" rules={[{ required: true, message: '不能为空' }]}>
                        <Select options={yearCycleType} />
                    </Form.Item>
                    <Form.Item label="返点（%）" name="yearbox_point" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber />
                    </Form.Item>
                    <Form.Item label="签约合同" name="yearbox_pic" rules={[{ required: true, message: '不能为空' }]}>
                        <UpLoadImg title="上传合同图片" name="add_yearbox_pic" setPicUrl={(value) => { formYear.setFieldValue('yearbox_pic', value) }} />
                    </Form.Item>
                </Form>
            </Modal>
            <AELiaison
                isShow={isShowLiaison}
                type={'edit_talent'}
                form={formLiaison}
                onOK={(values) => { editLiaisonAPI('修改联系人', values); }}
                onCancel={() => { setIsShowLiaison(false); formLiaison.resetFields(); setType(''); }}
            />
            <Modal title={middleType} open={isShowMiddle}
                onOk={() => {
                    let payload = {}
                    if (middleType.match('一级')) {
                        payload = {
                            m_id_1: formMiddle.getFieldValue('m_id'),
                            m_point_1: formMiddle.getFieldValue('m_point')
                        }
                    } else {
                        payload = {
                            m_id_2: formMiddle.getFieldValue('m_id'),
                            m_point_2: formMiddle.getFieldValue('m_point')
                        }
                    }
                    editMiddleAPI(middleType, payload);
                }}
                onCancel={() => { formMiddle.resetFields(); setIsShowMiddle(false); }}>
                <Form form={formMiddle}>
                    <Form.Item label="昵称" name="m_id" rules={[{ required: true, message: '不能为空' }]}>
                        <Select showSearch placeholder="请输入" options={middlemans} filterOption={filterOption} onChange={(value) => { searchMiddlemansAPI(value) }} onSearch={(value) => { searchMiddlemansAPI(value) }} />
                    </Form.Item>
                    <Form.Item label="提点（%）" name="m_point" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber />
                    </Form.Item>
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