import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import request from '../service/request'
import dayjs from 'dayjs';
import { Card, Input, Timeline, Button, Tag, Modal, Form, Descriptions, Row, Col, message, Space, Select, InputNumber, Image, Popconfirm, List } from 'antd';
import { AuditOutlined, MessageOutlined, GlobalOutlined, CrownOutlined, SettingOutlined, EditOutlined, PlusOutlined, MinusOutlined, UnorderedListOutlined, EyeOutlined } from '@ant-design/icons';
import { middlemanPayType, talentType } from '../baseData/talent'
import { descriptionsItems } from '../baseData/talentDetail'
import { province } from '../baseData/province'
import AELiaison from '../components/modals/AELiaison'
import AEYear from '../components/modals/AEYear'
import AEFile from '../components/modals/AEFile'
import AETalentModel from '../components/modals/AETalentModel'

const { TextArea } = Input;

function TalentDetail() {
    // 路由
    let location = useLocation();
    const navigate = useNavigate();
    const { tid } = location.state;

    // 操作权限
    const editPower = (localStorage.getItem('department') === '事业部' && localStorage.getItem('position') !== '副总' && localStorage.getItem('position') !== '助理') || localStorage.getItem('position') === '管理员' ? true : false
    const examPower = localStorage.getItem('position') === '副总' || localStorage.getItem('position') === '总裁' || localStorage.getItem('position') === '管理员' ? true : false

    // 获取详情
    const [detailData, setDetailData] = useState({
        status: '',
        yearbox_start_date: null,
        schedule: [],
        models: [],
        original: ''
    })
    const getTalentDetailAPI = () => {
        request({
            method: 'post',
            url: '/talent/getTalentDetail',
            data: {
                tid,
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
                        children: Object.keys(detailData)[i].match('pic') ? Object.values(detailData)[i] ?
                            Object.values(detailData)[i].split(',').map((pic, index) => {
                                return <Image key={index} width={50} height={50} src={pic} />
                            }) : '暂无' : Object.values(detailData)[i]
                    }
                    if ([0, 2, 3, 4, 66, 67, 68].indexOf(descriptionsItems[j].key) !== -1) {
                        items.push(description)
                    }
                }
            }
        }
        items.push({
            key: 5,
            label: "原商务",
            children: detailData.u_id_0 === null ? '无' : `${detailData.u_name_0}(${detailData.u_point_0}%)`
        })
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
                    if (detailData.yearbox_start_date !== null && descriptionsItems[j].key === 16) {
                        let items = JSON.parse(Object.values(detailData)[i])
                        description.children = <List style={{ marginLeft: '10px' }}>
                            {detailData.yearbox_lavels_base !== null ? <List.Item key={0} style={{ paddingTop: 0 }}>0：每个专场基础提点 {detailData.yearbox_lavels_base}% 【一专场一付】</List.Item> : null}
                            {items && items.map((item, index) => {
                                return (
                                    <List.Item key={index + 1} style={{ paddingTop: 0 }}>{index + 1}：每{detailData.yearbox_cycle.slice(0, 2)}成交额达到 {item[`y_lavel_${index + 1}`]}万，提点 {item[`y_point_${index + 1}`]}%</List.Item>
                                )
                            })}
                        </List>
                    }
                    if (descriptionsItems[j].key === 16) {
                        description.span = 2
                    }
                    if (descriptionsItems[j].key === 70) {
                        description.span = 5
                    }
                    if ([15, 16, 17, 18, 70].indexOf(descriptionsItems[j].key) !== -1) {
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
                    if ([19, 20, 21, 22, 27].indexOf(descriptionsItems[j].key) !== -1) {
                        items.push(description)
                    }
                }
            }
        }
        return items
    }
    const [isShowM1PayItems, setIsShowM1PayItems] = useState(false)
    const [m1PayItems, setM1PayItems] = useState()
    const [isShowM2PayItems, setIsShowM2PayItems] = useState(false)
    const [m2PayItems, setM2PayItems] = useState()
    const getMiddlemanInfoAPI = (type, mid) => {
        request({
            method: 'post',
            url: '/middleman/getMiddlemanInfo',
            data: {
                mid,
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
                    let items = []
                    for (let i = 0; i < descriptionsItems.length; i++) {
                        for (let j = 0; j < res.data.data.length; j++) {
                            if (descriptionsItems[i].value === res.data.data[j].label) {
                                const item = {
                                    key: res.data.data[j].key,
                                    label: descriptionsItems[i].label,
                                    children: res.data.data[j].children
                                }
                                if (descriptionsItems[i].label === '税点(%)') {
                                    item.span = 2
                                }
                                items.push(item)
                            }
                        }
                    }
                    if (type === 1) {
                        setM1PayItems(items)
                    } else {
                        setM2PayItems(items)
                    }
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
                    if ([23, 24, 25, 26, 69].indexOf(descriptionsItems[j].key) !== -1) {
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
                        if ((descriptionsItems[j].key >= 42 && descriptionsItems[j].key <= 45) || descriptionsItems[j].key === 64) {
                            items.push(description)
                        }
                    } else if (data.model === '供货') {
                        if ((descriptionsItems[j].key >= 46 && descriptionsItems[j].key <= 48) || descriptionsItems[j].key === 65) {
                            if (descriptionsItems[j].key === 48) {
                                description.span = 2
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
    const getHistoryTags = (data) => {
        let items = []
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                for (let j = 0; j < descriptionsItems.length; j++) {
                    if (key === descriptionsItems[j].value) {
                        items.push(`${descriptionsItems[j].label}(${data[key]})`)
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
                    color: element.examine_result ? (element.examine_result.match('通过') ? 'green' : element.examine_result.match('驳回') ? 'red' : '#1677ff') : '#1677ff',
                    children: <Fragment>
                        <Row>{`【${dayjs(Number(element.create_time)).format('YYYY-MM-DD')}】 ${element.u_name_1} ${element.operate}`}{element.examine_uid === null ? null : element.examine_time === null ? `-----@${element.u_name_2} 审批` : null}</Row>
                        <Row>{element.examine_time === null ? null : `【${dayjs(Number(element.examine_time)).format('YYYY-MM-DD')}】 ${element.u_name_2} 审批${element.examine_result}`}{element.examine_note === null ? null : `(${element.examine_note})`}</Row>
                        <Row> {element.examine_result && element.examine_result.match('驳回') ? null : getHistoryTags(JSON.parse(element.history_other_info)).map((info, index) => { return <Tag key={index}>{info}</Tag> })}</Row>
                    </Fragment>
                }
                items.push(item)
            }
            items.push({ color: 'gray', children: '' })
        }
        return items
    }

    // 修改基础信息
    const [isShowBase, setIsShowBase] = useState(false)
    const [formBase] = Form.useForm()
    const filterOption = (input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    // 新增、续约年框
    const [isShowYear, setIsShowYear] = useState(false)
    const [yearType, setYearType] = useState()
    const [formYear] = Form.useForm()
    // 修改联系人
    const [isShowLiaison, setIsShowLiaison] = useState(false)
    const [formLiaison] = Form.useForm()
    const [editOri, setEditOri] = useState()
    // 新增、修改、删除中间人
    const [isShowMiddle, setIsShowMiddle] = useState(false)
    const [formMiddle] = Form.useForm()
    const [middleType, setMiddleType] = useState()
    const [middlemansItems, setMiddlemansItems] = useState()
    const getmiddlemansItemsAPI = () => {
        request({
            method: 'post',
            url: '/middleman/getmiddlemansItems',
            data: {
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
                    setMiddlemansItems(res.data.data)
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
                tid,
                operate,
                ori,
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
                    if (operate.match('年框')) {
                        setIsShowYear(false);
                        formYear.resetFields();
                    } else if (operate.match('联系人')) {
                        setIsShowLiaison(false);
                        formLiaison.resetFields();
                    } else if (operate.match('中间人')) {
                        setIsShowMiddle(false);
                        formMiddle.resetFields();
                    } else if (operate.match('基础信息')) {
                        setIsShowBase(false);
                        formBase.resetFields();
                    }
                    getTalentDetailAPI()
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
    // 添加、修改合作模式
    const [isShowModel, setIsShowModel] = useState(false)
    const [formModel] = Form.useForm()
    const [modelType, setTypeModel] = useState()
    const addTalentModelAPI = (payload) => {
        request({
            method: 'post',
            url: '/talent/addTalentModel',
            data: {
                tid,
                cid: null,
                modelType,
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
                    setIsShowModel(false);
                    setTypeModel();
                    getTalentDetailAPI();
                    formModel.resetFields();
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
    const editTalentModelAPI = (operate, ori, payload) => {
        request({
            method: 'post',
            url: '/talent/editTalentModel',
            data: {
                tid,
                operate,
                ori,
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
                    setIsShowModel(false);
                    formModel.resetFields();
                    setTypeModel()
                    getTalentDetailAPI()
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
    // 新增、修改、查看文件
    const [isShowFile, setIsShowFile] = useState(false)
    const [fileType, setFileType] = useState('')
    const [idSelect, setIdSelect] = useState('')
    // 审批
    const [isShowRefund, setIsShowRefund] = useState(false)
    const [formRefund] = Form.useForm()
    const examTalentAPI = (exam, note) => {
        request({
            method: 'post',
            url: '/talent/examTalent',
            data: {
                tid,
                status: detailData.status,
                exam,
                note: exam ? null : note,
                uid: detailData.models[0].u_id_1,
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
                    navigate('/admin/talent/talent_list')
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
    const examTalentModelAPI = (tmids, exam, note) => {
        request({
            method: 'post',
            url: '/talent/examTalentModel',
            data: {
                tid,
                tmids,
                status: detailData.status,
                exam,
                note: exam ? null : note,
                uid: detailData.models[0].u_id_1,
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
                    navigate('/admin/talent/talent_list')
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
        getTalentDetailAPI();
    }, [tid])
    return (
        <Fragment>
            <Row gutter={24}>
                <Col span={18}>
                    <Card title={<Space><CrownOutlined /><span>基础信息</span><Tag color={detailData.status.match('待审批') ? 'gold' : detailData.status.match('合作中') ? 'green' : 'grey'}>{detailData.status}</Tag></Space>}
                        style={{ marginBottom: '20px' }}
                        extra={(detailData.status.match('待审批')) ? (examPower ?
                            <Space>
                                <Button type="primary" onClick={() => {
                                    if (detailData.status.match('移交')) {
                                        let ids = []
                                        for (let i = 0; i < detailData.models.length; i++) {
                                            if (detailData.models[i].status === '待审批') {
                                                ids.push(detailData.models[i].tmid);
                                            }
                                        }
                                        examTalentModelAPI(ids, true, null)
                                        examTalentAPI(true, null);
                                    } else if (detailData.status.match('合作')) {
                                        let ids = []
                                        for (let i = 0; i < detailData.models.length; i++) {
                                            if (detailData.models[i].status === '待审批') {
                                                ids.push(detailData.models[i].tmid);
                                            }
                                        }
                                        examTalentModelAPI(ids, true, null)
                                    } else {
                                        examTalentAPI(true, null);
                                    }
                                }}>通过</Button>
                                <Button type="primary" danger onClick={() => { setIsShowRefund(true); }}>驳回</Button>
                            </Space> : null) : (editPower ? <Button type="text" icon={<EditOutlined />} onClick={() => {
                                let ori = {}
                                for (const key in detailData) {
                                    if (Object.hasOwnProperty.call(detailData, key)) {
                                        if (key === 'province' || key === 'year_deal' || key === 'type') {
                                            ori[key] = detailData[key]
                                        }
                                    }
                                }
                                setEditOri(ori)
                                formBase.setFieldsValue({
                                    tid: tid,
                                    ...ori
                                })
                                setIsShowBase(true);
                            }}>修改</Button> : null)}
                    >
                        <Descriptions column={5} items={getBaseItems()} />
                    </Card>
                    <Card title={<Space><AuditOutlined /><span>年框信息</span>
                        <Tag color={detailData.yearbox_start_date === null ? '' : dayjs(Number(detailData.yearbox_start_date)).add(1, 'year') < dayjs() ? 'red' : detailData.status === '年框待审批' ? 'gold' : 'green'}>
                            {detailData.yearbox_start_date === null ? '暂无' : dayjs(Number(detailData.yearbox_start_date)).add(1, 'year') < dayjs() ? '已失效' : detailData.status === '年框待审批' ? '待审批' : '生效中'}
                        </Tag>
                    </Space>}
                        style={{ marginBottom: '20px' }}
                        extra={detailData.status.match('待审批') ? null : <>
                            {editPower && (detailData.yearbox_start_date === null ? <Button type="text" icon={<PlusOutlined />} onClick={() => { formYear.setFieldValue('tid', tid); setIsShowYear(true); setYearType('新增年框'); }}>新增年框</Button> :
                                dayjs(Number(detailData.yearbox_start_date)).add(1, 'year') < dayjs() ?
                                    <Button type="text" icon={<PlusOutlined />} onClick={() => { formYear.setFieldValue('tid', tid); setIsShowYear(true); setYearType('新增年框'); }}>新增年框</Button> :
                                    <Button type="text" icon={<EditOutlined />} onClick={() => {
                                        formYear.setFieldValue('tid', tid);
                                        formYear.setFieldValue('yearbox_start_date', dayjs(Number(detailData.yearbox_start_date)));
                                        formYear.setFieldValue('yearbox_cycle', {
                                            label: detailData.yearbox_cycle,
                                            value: detailData.yearbox_cycle
                                        });
                                        formYear.setFieldValue('yearbox_type', {
                                            label: detailData.yearbox_type,
                                            value: detailData.yearbox_type
                                        });
                                        formYear.setFieldValue('yearbox_lavels_base', detailData.yearbox_lavels_base);
                                        formYear.setFieldValue('yearbox_lavels', JSON.parse(detailData.yearbox_lavels));
                                        formYear.setFieldValue('yearbox_note', detailData.yearbox_note);
                                        setEditOri({
                                            yearbox_start_date: detailData.yearbox_start_date,
                                            yearbox_cycle: detailData.yearbox_cycle,
                                            yearbox_type: detailData.yearbox_type,
                                            yearbox_lavels_base: detailData.yearbox_lavels_base,
                                            yearbox_lavels: detailData.yearbox_lavels,
                                            yearbox_note: detailData.yearbox_note,
                                        })
                                        setIsShowYear(true);
                                        setYearType('修改年框');
                                    }}
                                    >修改年框</Button>)}
                            {detailData.yearbox_start_date === null ? null :
                                editPower && detailData.yearbox_files === null ? <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowFile(true); setFileType('年框资料'); setIdSelect(tid); }}>新增年框资料</Button> :
                                    <Button type="text" icon={<EyeOutlined />} onClick={() => { setIsShowFile(true); setFileType('年框资料'); setIdSelect(tid); }}>查看年框资料</Button>}
                        </>}
                    >
                        <Descriptions column={5} items={getYearItems()} />
                    </Card>
                    <Card title={<Space><MessageOutlined /><span>联络信息</span></Space>} style={{ marginBottom: '20px' }}>
                        <Descriptions title="联系人" column={5} items={getLiaisonItems()}
                            extra={(detailData.status.match('待审批')) ? null : editPower ? <Button type="text" icon={<EditOutlined />} onClick={() => {
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
                            }}>修改</Button> : null}
                        />
                        {detailData.m_id_1 === null ? <Descriptions title="无一级中间人"
                            extra={(detailData.status.match('待审批')) ? null : editPower ? <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowMiddle(true); setMiddleType('新增一级中间人'); }}>新增</Button> : null}
                        /> : <Descriptions title="一级中间人" column={5} items={getMiddleman1Items()}
                            extra={<>
                                {!isShowM1PayItems ? <Button type="text" icon={<UnorderedListOutlined />} onClick={() => {
                                    getMiddlemanInfoAPI(1, detailData.m_id_1)
                                    setIsShowM1PayItems(true)
                                }}>查看付款账号</Button> : null}
                                {(detailData.status.match('待审批')) ? null : editPower ? <Button type="text" icon={<EditOutlined />} onClick={() => {
                                    setEditOri({
                                        m_id_1: detailData.m_id_1,
                                        m_type_1: detailData.m_paytype_1,
                                        m_point_1: detailData.m_point_1,
                                        m_note_1: detailData.m_note_1,
                                    })
                                    formMiddle.setFieldsValue({
                                        m_id: {
                                            value: detailData.m_id_1,
                                            label: detailData.m_name_1
                                        },
                                        m_type: {
                                            value: detailData.m_paytype_1,
                                            label: detailData.m_paytype_1
                                        },
                                        m_point: detailData.m_point_1,
                                        m_note: detailData.m_note_1
                                    })
                                    setIsShowMiddle(true);
                                    setMiddleType('修改一级中间人');
                                }}>修改</Button> : null}
                                {(detailData.status.match('待审批')) ? null : editPower ?
                                    <Popconfirm
                                        title="删除一级中间人"
                                        description={`确认删除 ${detailData.m_name_1} 吗?`}
                                        onConfirm={() => {
                                            editTalentAPI('删除一级中间人', JSON.stringify({
                                                m_id_1: detailData.m_id_1,
                                                m_name_1: detailData.m_name_1,
                                                m_paytype_1: detailData.m_paytype_1,
                                                m_point_1: detailData.m_point_1,
                                                m_note_1: detailData.m_note_1
                                            }), {
                                                m_id_1: null,
                                                m_type_1: null,
                                                m_point_1: null,
                                                m_note_1: null
                                            });
                                        }}
                                        okText="删除"
                                        cancelText="取消"
                                    >
                                        <Button type="text" danger icon={<MinusOutlined />}>删除</Button>
                                    </Popconfirm> : null}
                            </>}
                        />}
                        {isShowM1PayItems ? <Descriptions column={5} items={m1PayItems}></Descriptions> : null}
                        {detailData.m_id_2 === null ? <Descriptions title="无二级中间人"
                            extra={(detailData.status.match('待审批')) ? null : editPower ? <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowMiddle(true); setMiddleType('新增二级中间人'); }}>新增</Button> : null}
                        /> : <Descriptions title="二级中间人" column={5} items={getMiddleman2Items()}
                            extra={<>
                                {!isShowM2PayItems ? <Button type="text" icon={<UnorderedListOutlined />} onClick={() => {
                                    getMiddlemanInfoAPI(2, detailData.m_id_2)
                                    setIsShowM2PayItems(true)
                                }}>查看付款账号</Button> : null}
                                {(detailData.status.match('待审批')) ? null : editPower ? <Button type="text" icon={<EditOutlined />} onClick={() => {
                                    setEditOri({
                                        m_id_2: detailData.m_id_2,
                                        m_type_2: detailData.m_paytype_2,
                                        m_point_2: detailData.m_point_2,
                                        m_note_2: detailData.m_note_2
                                    })
                                    formMiddle.setFieldsValue({
                                        m_id: {
                                            value: detailData.m_id_2,
                                            label: detailData.m_name_2
                                        },
                                        m_type: {
                                            value: detailData.m_paytype_2,
                                            label: detailData.m_paytype_2
                                        },
                                        m_point: detailData.m_point_2,
                                        m_note: detailData.m_note_2
                                    })
                                    setIsShowMiddle(true);
                                    setMiddleType('修改二级中间人');
                                }}>修改</Button> : null}
                                {(detailData.status.match('待审批')) ? null : editPower ?
                                    <Popconfirm
                                        title="删除二级中间人"
                                        description={`确认删除 ${detailData.m_name_2} 吗?`}
                                        onConfirm={() => {
                                            editTalentAPI('删除二级中间人', JSON.stringify({
                                                m_id_2: detailData.m_id_2,
                                                m_name_2: detailData.m_name_2,
                                                m_paytype_2: detailData.m_paytype_2,
                                                m_point_2: detailData.m_point_2,
                                                m_note_2: detailData.m_note_2
                                            }), {
                                                m_id_2: null,
                                                m_type_2: null,
                                                m_point_2: null,
                                                m_note_2: null
                                            });
                                        }}
                                        okText="删除"
                                        cancelText="取消"
                                    >
                                        <Button type="text" danger icon={<MinusOutlined />}>删除</Button>
                                    </Popconfirm> : null}
                            </>}
                        />}
                        {isShowM2PayItems ? <Descriptions column={5} items={m2PayItems}></Descriptions> : null}
                    </Card>
                    <Card title={<Space><GlobalOutlined /><span>合作模式 ----- {detailData.models && detailData.models.length} 个</span></Space>}
                        extra={detailData.status.match('待审批') ? null : editPower ? <Space>
                            <Button type="text" icon={<PlusOutlined />} onClick={() => {
                                formModel.setFieldValue('u_id_1', {
                                    label: localStorage.getItem('name'),
                                    value: localStorage.getItem('uid')
                                })
                                setIsShowModel(true);
                                setTypeModel('新增线上平台');
                            }}>新增线上平台</Button>
                            <Button type="text" icon={<PlusOutlined />} onClick={() => {
                                formModel.setFieldValue('u_id_1', {
                                    label: localStorage.getItem('name'),
                                    value: localStorage.getItem('uid')
                                })
                                setIsShowModel(true);
                                setTypeModel('新增社群团购');
                            }}>新增社群团购</Button>
                            <Button type="text" icon={<PlusOutlined />} onClick={() => {
                                formModel.setFieldValue('u_id_1', {
                                    label: localStorage.getItem('name'),
                                    value: localStorage.getItem('uid')
                                })
                                setIsShowModel(true);
                                setTypeModel('新增供货');
                            }}>新增供货</Button>
                        </Space> : null}
                    >
                        {detailData.models && detailData.models.map((model, index) => {
                            return (
                                <Card
                                    key={index}
                                    title={<Space><span>{model.model}__{model.platform}__{model.shop_type === '专属店铺' || model.shop_type === null ? model.shop_name : model.shop_type}</span>
                                        <Tag color={model.status === '待审批' ? "gold" : model.status === '合作中' ? "green" : model.status === '已失效' ? "red" : ""}>{model.status}</Tag>
                                    </Space>}
                                    style={{ marginBottom: '20px' }}
                                    extra={detailData.status.match('待审批') ? null : editPower ? <><Button type="text" icon={<EditOutlined />} onClick={() => {
                                        let f = { ...model, tmid: model.tmid }
                                        for (const key in model) {
                                            if (Object.hasOwnProperty.call(model, key)) {
                                                if (key === 'u_id_1') {
                                                    f[key] = {
                                                        label: model.u_name_1,
                                                        value: model[key]
                                                    }
                                                } else if (model[key] !== null && key === 'u_id_2') {
                                                    f[key] = {
                                                        label: model.u_name_2,
                                                        value: model[key]
                                                    }
                                                } else if (model[key] !== null && (key === 'account_models' || key === 'age_cuts' || key === 'keyword' || key === 'main_province')) {
                                                    f[key] = model[key].split(',')
                                                } else if ((key.match('discount') || key.match('commission') || key.match('u_') || key.match('shop'))) {
                                                    f[key] = model[key]
                                                } else if (model[key] !== null && ['create_time', 'create_uid', 'model', 'platform', 'shop_type', 'shop_name', 'status', 'tid'].indexOf(key) !== -1) {
                                                    delete f[key]
                                                } else if (key === 'model_files') {
                                                    delete f[key]
                                                }
                                            }
                                        }
                                        formModel.setFieldsValue(f)
                                        setEditOri(f)
                                        setIsShowModel(true);
                                        setTypeModel(`修改${model.model}`);
                                    }}>修改</Button>
                                        {model.model_files === null ? <Button type="text" icon={<PlusOutlined />} onClick={() => { setIsShowFile(true); setFileType('合作协议'); setIdSelect(model.tmid); }}>新增合作协议</Button> :
                                            <Button type="text" icon={<EyeOutlined />} onClick={() => { setIsShowFile(true); setFileType('合作协议'); setIdSelect(model.tmid); }}>查看合作协议</Button>}</> :
                                        model.model_files === null ? null : <Button type="text" icon={<EyeOutlined />} onClick={() => { setIsShowFile(true); setFileType('合作协议'); setIdSelect(model.tmid); }}>查看合作协议</Button>}
                                >
                                    <Descriptions column={5} items={getModelsItems(model)} />
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

            <Modal title="驳回理由填写" open={isShowRefund}
                onOk={() => {
                    if (detailData.status.match('合作')) {
                        let ids = []
                        for (let i = 0; i < detailData.models.length; i++) {
                            if (detailData.models[i].status === '待审批') {
                                ids.push(detailData.models[i].tmid);
                            }
                        }
                        examTalentModelAPI(ids, false, formRefund.getFieldValue('note'))
                    } else {
                        examTalentAPI(false, formRefund.getFieldValue('note'));
                    }
                    setIsShowRefund(false);
                }}
                onCancel={() => { setIsShowRefund(false); }}
            >
                <Form form={formRefund}>
                    <Form.Item label="驳回理由" name="note" rules={[{ required: true, message: '不能为空' }]}>
                        <TextArea placeholder="请输入" />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title="修改基础信息" open={isShowBase}
                onOk={() => {
                    let ori = editOri
                    let payload = formBase.getFieldsValue()
                    let z = {}
                    for (const key in ori) {
                        if (Object.hasOwnProperty.call(ori, key)) {
                            for (const k in payload) {
                                if (Object.hasOwnProperty.call(payload, k)) {
                                    if (key === k && ori[key] !== payload[k]) {
                                        z[key] = ori[key]
                                    }
                                }
                            }
                        }
                    }
                    editTalentAPI("修改基础信息", Object.keys(z).length === 0 ? null : JSON.stringify(z), payload);
                }}
                onCancel={() => { formBase.resetFields(); setIsShowBase(false); }}>
                <Form form={formBase}>
                    <Form.Item label="达人所在省份" name="province" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={province} showSearch filterOption={filterOption} />
                    </Form.Item>
                    <Form.Item label="预估慕江南年销售额（万）" name="year_deal" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber placeholder="请输入" min={0} />
                    </Form.Item>
                    <Form.Item label="达人层级" name="type" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={talentType} />
                    </Form.Item>
                </Form>
            </Modal>
            <AEYear
                isShow={isShowYear}
                type={yearType}
                form={formYear}
                onOK={(values) => {
                    let ori = editOri
                    let payload = {
                        ...values,
                        yearbox_type: values.yearbox_type.value ? values.yearbox_type.value : values.yearbox_type,
                        yearbox_cycle: values.yearbox_cycle.value ? values.yearbox_cycle.value : values.yearbox_cycle,
                        yearbox_lavels: values.yearbox_lavels ? JSON.stringify(values.yearbox_lavels) : null,
                        yearbox_start_date: `${dayjs(values.yearbox_start_date).valueOf()}`
                    }
                    let z = {}
                    for (const key in ori) {
                        if (Object.hasOwnProperty.call(ori, key)) {
                            for (const k in payload) {
                                if (Object.hasOwnProperty.call(payload, k)) {
                                    if (key === k && ori[key] !== payload[k]) {
                                        if (key === 'yearbox_lavels' && JSON.parse(ori[key]) !== null) {
                                            let x = ''
                                            for (let i = 0; i < JSON.parse(ori[key]).length; i++) {
                                                x += `(${Object.values(JSON.parse(ori[key])[i]).join('w, ')}%)`
                                            }
                                            z[key] = x
                                        } else {
                                            z[key] = ori[key]
                                        }
                                    }
                                }
                            }
                        }
                    }
                    editTalentAPI(yearType, Object.keys(z).length === 0 ? null : JSON.stringify(z), payload);
                }}
                onCancel={() => { formYear.resetFields(); setIsShowYear(false); }}
            />
            <AELiaison
                isShow={isShowLiaison}
                type={'edit_talent'}
                form={formLiaison}
                onOK={(values) => {
                    let ori = editOri
                    let payload = values
                    let z = {}
                    for (const key in ori) {
                        if (Object.hasOwnProperty.call(ori, key)) {
                            for (const k in payload) {
                                if (Object.hasOwnProperty.call(payload, k)) {
                                    if (key === k && ori[key] !== payload[k]) {
                                        z[key] = ori[key]
                                    }
                                }
                            }
                        }
                    }
                    editTalentAPI('修改联系人', Object.keys(z).length === 0 ? null : JSON.stringify(z), payload);
                }}
                onCancel={() => { setIsShowLiaison(false); formLiaison.resetFields(); }}
            />
            <Modal title={middleType} open={isShowMiddle}
                onOk={() => {
                    let ori = editOri
                    let payload = {}
                    if (middleType.match('一级')) {
                        payload = {
                            m_id_1: formMiddle.getFieldValue('m_id').value ? formMiddle.getFieldValue('m_id').value : formMiddle.getFieldValue('m_id'),
                            m_type_1: formMiddle.getFieldValue('m_type').value ? formMiddle.getFieldValue('m_type').value : formMiddle.getFieldValue('m_type'),
                            m_point_1: formMiddle.getFieldValue('m_point'),
                            m_note_1: formMiddle.getFieldValue('m_note')
                        }
                    } else {
                        payload = {
                            m_id_2: formMiddle.getFieldValue('m_id').value ? formMiddle.getFieldValue('m_id').value : formMiddle.getFieldValue('m_id'),
                            m_type_2: formMiddle.getFieldValue('m_type').value ? formMiddle.getFieldValue('m_type').value : formMiddle.getFieldValue('m_type'),
                            m_point_2: formMiddle.getFieldValue('m_point'),
                            m_note_2: formMiddle.getFieldValue('m_note')
                        }
                    }
                    let z = {}
                    for (const key in ori) {
                        if (Object.hasOwnProperty.call(ori, key)) {
                            for (const k in payload) {
                                if (Object.hasOwnProperty.call(payload, k)) {
                                    if (key === k && ori[key] !== payload[k]) {
                                        z[key] = ori[key]
                                    }
                                }
                            }
                        }
                    }
                    editTalentAPI(middleType, Object.keys(z).length === 0 ? null : JSON.stringify(z), payload);
                }}
                onCancel={() => { formMiddle.resetFields(); setIsShowMiddle(false); }}>
                <Form form={formMiddle}>
                    <Form.Item label="昵称" name="m_id" rules={[{ required: true, message: '不能为空' }]}>
                        <Select options={middlemansItems} onFocus={() => { getmiddlemansItemsAPI(); }} />
                    </Form.Item>
                    <Form.Item label="付款类型" name="m_type" rules={[{ required: true, message: '不能为空' }]}>
                        <Select options={middlemanPayType} />
                    </Form.Item>
                    <Form.Item label="提点（%）" name="m_point" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber />
                    </Form.Item>
                    <Form.Item label="备注" name="m_note">
                        <TextArea maxLength={500} />
                    </Form.Item>
                </Form>
            </Modal>
            <AETalentModel
                isShow={isShowModel}
                type={modelType}
                form={formModel}
                onOK={(values) => {
                    let ori = null
                    if (editOri) {
                        ori = editOri
                        ori.u_id_1 = editOri.u_id_1 ? editOri.u_id_1.value || editOri.u_id_1.value === null ? editOri.u_id_1.value : editOri.u_id_1 : null
                        ori.u_id_2 = editOri.u_id_2 ? editOri.u_id_2.value || editOri.u_id_2.value === null ? editOri.u_id_2.value : editOri.u_id_2 : null
                        ori.u_point_1 = editOri.u_point_1 ? editOri.u_point_1.value || editOri.u_point_1.value === null ? editOri.u_point_1.value : editOri.u_point_1 : null
                        ori.u_point_2 = editOri.u_point_2 ? editOri.u_point_2.value || editOri.u_point_2.value === null ? editOri.u_point_2.value : editOri.u_point_2 : null
                        if (ori.account_models) {
                            ori.account_models = editOri.account_models.join()
                        }
                        if (ori.age_cuts) {
                            ori.age_cuts = editOri.age_cuts.join()
                        }
                        if (ori.keyword) {
                            ori.keyword = editOri.keyword.join()
                        }
                        if (ori.main_province) {
                            ori.main_province = editOri.main_province.join()
                        }
                        delete ori.u_name_1
                        delete ori.u_name_2
                    }
                    let o = {}
                    for (const key in ori) {
                        if (Object.hasOwnProperty.call(ori, key)) {
                            if (ori[key] === null && key !== 'u_id_2' && key !== 'u_point_2' && key !== 'u_note' && key !== 'commission_note' && key !== 'discount_note') {
                                continue
                            } else if (key.match('shop')) {
                                continue
                            } else {
                                o[key] = ori[key]
                            }
                        }
                    }
                    let payload = values
                    payload.u_id_1 = values.u_id_1 ? values.u_id_1.value || values.u_id_1.value === null ? values.u_id_1.value : values.u_id_1 : null
                    payload.u_id_2 = values.u_id_2 ? values.u_id_2.value || values.u_id_2.value === null ? values.u_id_2.value : values.u_id_2 : null
                    payload.u_point_1 = values.u_point_1 ? values.u_point_1.value || values.u_point_1.value === null ? values.u_point_1.value : values.u_point_1 : null
                    payload.u_point_2 = values.u_point_2 ? values.u_point_2.value || values.u_point_2.value === null ? values.u_point_2.value : values.u_point_2 : null
                    if (payload.account_models) {
                        payload.account_models = values.account_models.join()
                    }
                    if (payload.age_cuts) {
                        payload.age_cuts = values.age_cuts.join()
                    }
                    if (payload.keyword) {
                        payload.keyword = values.keyword.join()
                    }
                    if (payload.main_province) {
                        payload.main_province = values.main_province.join()
                    }
                    let z = {}, type = ''
                    for (const key in o) {
                        if (Object.hasOwnProperty.call(o, key)) {
                            for (const k in payload) {
                                if (Object.hasOwnProperty.call(payload, k)) {
                                    if (key === k && o[key] !== payload[k]) {
                                        z[key] = o[key]
                                        if ((key.match('u_') || key.match('discount_') || key.match('commission_'))) {
                                            type = type.match('综合信息') ? type : type.match('基础信息') ? '综合信息' : '佣金提点'
                                        } else {
                                            type = type.match('综合信息') ? type : type.match('佣金提点') ? '综合信息' : '基础信息'
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (o !== null && Object.keys(o).length !== Object.keys(payload).length) {
                        type = type.match('综合信息') ? type : type.match('基础信息') ? '综合信息' : '佣金提点'
                    }
                    let operate = modelType + type
                    if (modelType.match('新增')) {
                        addTalentModelAPI(values)
                    } else if (Object.keys(z).length === 0) {
                        if (type.match('基础信息')) {
                            formModel.resetFields();
                            setIsShowModel(false);
                            message.info('未修改任何信息');
                        } else {
                            z.u_id_2 = payload.u_id_2 ? payload.u_id_2 : o.u_id_2
                            z.u_point_2 = payload.u_point_2 ? payload.u_point_2 : o.u_point_2
                            editTalentModelAPI(operate, JSON.stringify(z), payload)
                        }
                    } else {
                        editTalentModelAPI(operate, JSON.stringify(z), payload)
                    }
                }}
                onCancel={() => { setIsShowModel(false); formModel.resetFields(); setTypeModel(''); }}
            />
            <AEFile
                id={idSelect}
                type={fileType}
                isShow={isShowFile}
                onOK={() => { getTalentDetailAPI(); setIsShowFile(false); }}
                onCancel={() => { getTalentDetailAPI(); setIsShowFile(false); }}
            />
        </Fragment >
    )
}

export default TalentDetail