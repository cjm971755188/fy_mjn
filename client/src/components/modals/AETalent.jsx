import React, { Fragment, useEffect, useState } from "react";
import request from '../../service/request'
import { Card, Space, Form, Input, Modal, Button, Select, Radio, InputNumber, message, List, Image } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { accountType, accountModelType, ageCut, priceCut, liaisonType, shop_type, platform, model, middlemanPayType, talentType, gmvBelong, customPayType } from '../../baseData/talent'
import { province } from '../../baseData/province'
import people from '../../assets/people.jpg'
import AEMiddleman from './AEMiddleman'

const { TextArea } = Input;

function AETalent(props) {
    const { type, isShow, form } = props;

    const [isShowPlatform, setIsShowPlatform] = useState(false)
    const [isShowGroup, setIsShowGroup] = useState(false)
    const [isShowProvide, setIsShowProvide] = useState(false)
    const [isShowCustom, setIsShowCustom] = useState(false)
    const [isShowSearch, setIsShowSearch] = useState(false)
    const [sameList, setSameList] = useState([])
    const searchSameChanceAPI = (type, payload, values) => {
        request({
            method: 'post',
            url: '/chance/searchSameChance',
            data: type === 'search' ? payload : values
        }).then((res) => {
            if (res.status === 200) {
                if (res.data.code !== 200) {
                    setIsShowSearch(true)
                    setSameList(res.data.data)
                    message.error(res.data.msg)
                } else {
                    if (type === 'search') {
                        setIsShowSearch(false)
                        setSameList([])
                        message.success(res.data.msg)
                    } else if (type === 'finish') {
                        if (res.data.data.length === 0) {
                            let z = 0
                            if (form.getFieldValue('models').join().match('线上平台')) {
                                if (form.getFieldValue('accounts') === undefined) {
                                    message.error('线上平台模式，信息缺失！')
                                    z++
                                }
                            }
                            if (form.getFieldValue('models').join().match('社群团购') && form.getFieldValue('group_name') === undefined) {
                                message.error('社群团购模式，信息缺失！')
                                z++
                            }
                            if (form.getFieldValue('models').join().match('供货') && form.getFieldValue('provide_name') === undefined) {
                                message.error('供货模式，信息缺失！')
                                z++
                            }
                            if (z === 0) {
                                props.onOK(values);
                                reset();
                            }
                        }
                    } else {
                        message.error('异常type，请联系开发者')
                    }
                }
            } else {
                message.error(res.data.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const [hasOnlyShop, setHasOnlyShop] = useState(false)
    const [payType, setPayType] = useState('')
    const [hasFuSaleman, setHasFuSaleman] = useState(false)
    const [hasYuanSaleman, setHasYuanSaleman] = useState(false)
    const [hasFirstMiddle, setHasFirstMiddle] = useState(false)
    const [hasSecondMiddle, setHasSecondMiddle] = useState(false)
    const [hasGroupFuSaleman, setGroupHasFuSaleman] = useState(false)
    const [hasProvideFuSaleman, setProvideHasFuSaleman] = useState(false)
    const [hasCustomFuSaleman, setCustomHasFuSaleman] = useState(false)
    const [salemanAssistantsItems, setSalemanAssistantsItems] = useState()
    const getSalemanAssistantsItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getSalemanAssistantItems',
            data: {
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
                    setSalemanAssistantsItems(res.data.data)
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
    const [middlemansItems, setMiddlemansItems] = useState()
    const getmiddlemansItemsAPI = () => {
        request({
            method: 'post',
            url: '/middleman/getmiddlemansItems',
            data: {
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
    const filterOption = (input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    // 添加新中间人
    const [typeMid, setTypeMid] = useState('add')
    const [isShowMid, setIsShowMid] = useState(false)
    const [formMid] = Form.useForm()
    const addMiddlemanAPI = (payload) => {
        request({
            method: 'post',
            url: '/middleman/addMiddleman',
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
                    setIsShowMid(false)
                    getMiddlemanListAPI()
                    formMid.resetFields()
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
    // 重置
    const reset = () => {
        setIsShowPlatform(false);
        setIsShowGroup(false);
        setIsShowProvide(false);
        setIsShowCustom(false);
        setIsShowSearch(false);
        setSameList([]);
        setPayType('');
        setHasFuSaleman(false);
        setHasYuanSaleman(false);
        setHasFirstMiddle(false);
        setHasSecondMiddle(false);
        setGroupHasFuSaleman(false);
        setProvideHasFuSaleman(false);
        setCustomHasFuSaleman(false);
        setSalemanAssistantsItems();
        setTypeMid('add');
        setIsShowMid(false);
        formMid.resetFields();
    }

    useEffect(() => {
        setIsShowPlatform(form.getFieldValue('models') && form.getFieldValue('models').join(',').match('线上平台') ? true : false)
        setIsShowGroup(form.getFieldValue('models') && form.getFieldValue('models').join(',').match('社群团购') ? true : false)
        setIsShowProvide(form.getFieldValue('models') && form.getFieldValue('models').join(',').match('供货') ? true : false)
        setIsShowCustom(form.getFieldValue('models') && form.getFieldValue('models').join(',').match('定制') ? true : false)
        setPayType(form.getFieldValue('pay_type') && form.getFieldValue('pay_type') === '定金+尾款' ? '定金+尾款' : '')
        setHasFirstMiddle(form.getFieldValue('m_id_1') && form.getFieldValue('m_id_1').value !== null ? true : false)
        setHasSecondMiddle(form.getFieldValue('m_id_2') && form.getFieldValue('m_id_2').value !== null ? true : false)
        setHasYuanSaleman(form.getFieldValue('u_id_0') && form.getFieldValue('u_id_0').value !== null ? true : false)
        setHasFuSaleman(form.getFieldValue('accounts') && form.getFieldValue('accounts')[0] && form.getFieldValue('accounts')[0].u_id_2 && form.getFieldValue('accounts')[0].u_id_2.value !== null ? true : false)
    }, [isShow])
    return (
        <Fragment>
            <Modal
                title={type == 'report' ? '达人报备' : type === 'history' ? '历史达人报备' : type === 'reReport' ? '再次报备' : type}
                open={isShow}
                width='60%'
                maskClosable={false}
                onOk={() => { form.submit(); }}
                onCancel={() => { props.onCancel(); reset(); }}
            >
                <Form form={form} onFinish={(values) => {
                    if (!hasFirstMiddle) {
                        values.m_id_1 = null
                        values.m_type_1 = null
                        values.m_point_1 = null
                    }
                    if (!hasSecondMiddle) {
                        values.m_id_2 = null
                        values.m_type_2 = null
                        values.m_point_2 = null
                    }
                    if (!hasYuanSaleman) {
                        values.u_id_0 = null
                        values.u_type_0 = null
                        values.u_point_0 = null
                    }
                    if (!hasGroupFuSaleman) {
                        values.group_u_id_2 = null
                        values.group_u_type_2 = null
                        values.group_u_point_2 = null
                    }
                    if (!hasProvideFuSaleman) {
                        values.provide_u_id_2 = null
                        values.provide_u_type_2 = null
                        values.provide_u_point_2 = null
                    }
                    if (!hasCustomFuSaleman) {
                        values.custom_u_id_2 = null
                        values.custom_u_type_2 = null
                        values.custom_u_point_2 = null
                    }
                    if (payType !== '定金+尾款') {
                        values.deposit = null
                        values.tail = null
                    }
                    if (values.accounts) {
                        for (let i = 0; i < values.accounts.length; i++) {
                            values.accounts[i].u_id_1 = values.accounts[i].u_id_1 ? values.accounts[i].u_id_1.value || values.accounts[i].u_id_1.value === null ? values.accounts[i].u_id_1.value : values.accounts[i].u_id_1 : null
                            if (!hasFuSaleman) {
                                values.accounts[i].u_id_2 = null
                                values.accounts[i].u_type_2 = null
                                values.accounts[i].u_point_2 = null
                            }
                        }
                    }
                    let payload = {}
                    if (type === 'report') {
                        payload = {
                            cid: 'history',
                            ...values,
                            group_u_id_1: values.group_u_id_1 ? values.group_u_id_1.value || values.group_u_id_1.value === null ? values.group_u_id_1.value : values.group_u_id_1 : null,
                            provide_u_id_1: values.provide_u_id_1 ? values.provide_u_id_1.value || values.provide_u_id_1.value === null ? values.provide_u_id_1.value : values.provide_u_id_1 : null,
                            custom_u_id_1: values.custom_u_id_1 ? values.custom_u_id_1.value || values.custom_u_id_1.value === null ? values.custom_u_id_1.value : values.custom_u_id_1 : null,
                            liaison_type: form.getFieldValue('liaison_type'),
                            liaison_name: form.getFieldValue('liaison_name'),
                            liaison_v: form.getFieldValue('liaison_v'),
                            liaison_phone: form.getFieldValue('liaison_phone'),
                            crowd_name: form.getFieldValue('crowd_name'),
                            type: 'talent'
                        }
                    } else {
                        payload = {
                            ...values,
                            group_u_id_1: values.group_u_id_1 ? values.group_u_id_1.value || values.group_u_id_1.value === null ? values.group_u_id_1.value : values.group_u_id_1 : null,
                            provide_u_id_1: values.provide_u_id_1 ? values.provide_u_id_1.value || values.provide_u_id_1.value === null ? values.provide_u_id_1.value : values.provide_u_id_1 : null,
                            custom_u_id_1: values.custom_u_id_1 ? values.custom_u_id_1.value || values.custom_u_id_1.value === null ? values.custom_u_id_1.value : values.custom_u_id_1 : null,
                            type: type === '新增线上平台' ? 'model_1' : type === '新增社群团购' ? 'model_2' : type === '新增供货' ? 'model_3' : 'talent'
                        }
                    }
                    searchSameChanceAPI('finish', null, payload)
                }}>
                    {type == 'report' || type === 'history' || type === 'reReport' ? <>
                        {type === 'history' || type === 'reReport' ? null : <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '不能为空' }]}>
                            <Input disabled={true} />
                        </Form.Item>}
                        <Form.Item label="达人昵称" name="talent_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入达人昵称（公司内部、唯一、比较简单好记）" />
                        </Form.Item>
                        <Form.Item label="达人所在省份" name="province" rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" options={province} showSearch filterOption={filterOption} />
                        </Form.Item>
                        <Form.Item label="预估慕江南年销售额（万）" name="year_deal" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" min={0} />
                        </Form.Item>
                        <Form.Item label="达人层级" name="talent_type" rules={[{ required: true, message: '不能为空' }]}>
                            <Radio.Group>
                                {talentType.map((item) => {
                                    return <Radio key={item.key} value={item.value}>{item.label}</Radio>
                                })}
                            </Radio.Group>
                        </Form.Item>
                        {type === 'history' || type === 'reReport' ? <><Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '不能为空' }]}>
                            <Select
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="请选择"
                                onChange={(value) => { form.setFieldValue('liaison_type', value) }}
                                options={liaisonType}
                            />
                        </Form.Item>
                            <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '不能为空' }]}>
                                <Input placeholder="请输入" />
                            </Form.Item>
                            <Form.Item label="联系人微信" name="liaison_v" rules={[{ required: true, message: '不能为空' }]}>
                                <Input placeholder="请输入" />
                            </Form.Item>
                            <Form.Item label="联系人手机号" name="liaison_phone" rules={[{ len: 11, message: '手机号长度需11位' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号错误' }]}>
                                <Input placeholder="请输入" />
                            </Form.Item>
                            <Form.Item label="沟通群名称" name="crowd_name" rules={[{ required: true, message: '不能为空' }]}>
                                <Input placeholder="请输入" />
                            </Form.Item></> : null}
                        <Form.Item label="若中间人暂未添加">
                            <Button onClick={() => { setIsShowMid(true); setTypeMid('add'); }}>添加</Button>
                        </Form.Item>
                        <Form.Item label="是否有中间人">
                            <Radio.Group onChange={(e) => { setHasFirstMiddle(e.target.value); }} value={hasFirstMiddle}>
                                <Radio value={false}>无一级中间人</Radio>
                                <Radio value={true}>有一级中间人</Radio>
                            </Radio.Group>
                            <Radio.Group onChange={(e) => { setHasSecondMiddle(e.target.value); }} value={hasSecondMiddle}>
                                <Radio value={false}>无二级中间人</Radio>
                                <Radio value={true}>有二级中间人</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {hasFirstMiddle ? <>
                            <Form.Item label="一级中间人" name="m_id_1" rules={[{ required: true, message: '不能为空' }]}>
                                <Select options={middlemansItems} onFocus={() => { getmiddlemansItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="付款类型" name="m_type_1" rules={[{ required: true, message: '不能为空' }]}>
                                <Select options={middlemanPayType} />
                            </Form.Item>
                            <Form.Item label="提成点（%）[例：0.5]" name="m_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                            <Form.Item label="备注" name="m_note_1">
                                <TextArea maxLength={500} />
                            </Form.Item></> : null}
                        {hasSecondMiddle ? <>
                            <Form.Item label="二级中间人" name="m_id_2" rules={[{ required: true, message: '不能为空' }]}>
                                <Select options={middlemansItems} onFocus={() => { getmiddlemansItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="付款类型" name="m_type_2" rules={[{ required: true, message: '不能为空' }]}>
                                <Select options={middlemanPayType} />
                            </Form.Item>
                            <Form.Item label="提成点（%）[例：0.5]" name="m_point_2" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                            <Form.Item label="备注" name="m_note_2">
                                <TextArea maxLength={500} />
                            </Form.Item></> : null}
                        {type === 'history' || type === 'reReport' ? <><Form.Item label="是否有原商务">
                            <Radio.Group onChange={(e) => { setHasYuanSaleman(e.target.value); }} value={hasYuanSaleman}>
                                <Radio value={false}>无原商务</Radio>
                                <Radio value={true}>有原商务</Radio>
                            </Radio.Group>
                        </Form.Item>
                            {hasYuanSaleman ? <Space size='large'>
                                <Form.Item label="原商务" name="u_id_0" rules={[{ required: true, message: '不能为空' }]}>
                                    <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                                </Form.Item>
                                <Form.Item label="原商务提成点（%）[例：0.5]" name="u_point_0" rules={[{ required: true, message: '不能为空' }]}>
                                    <InputNumber min={0} max={100} />
                                </Form.Item>
                            </Space> : null}</> : null}
                    </> : null}
                    {type === 'history' || type === 'reReport' ? <Form.Item label="模式" name="models" rules={[{ required: true, message: '不能为空' }]}>
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="请选择"
                            options={model}
                            onChange={(value) => {
                                form.setFieldValue('models', value)
                                setIsShowPlatform(value.join(',').match('线上平台') ? true : false)
                                setIsShowGroup(value.join(',').match('社群团购') ? true : false)
                                setIsShowProvide(value.join(',').match('供货') ? true : false)
                                setIsShowCustom(value.join(',').match('定制') ? true : false)
                                if (!value.join(',').match('线上平台')) {
                                    form.setFieldValue('accounts', null)
                                }
                                if (!value.join(',').match('社群团购')) {
                                    form.setFieldValue('group_name', null)
                                }
                                if (!value.join(',').match('供货')) {
                                    form.setFieldValue('provide_name', null)
                                }
                                if (!value.join(',').match('定制')) {
                                    form.setFieldValue('custom_name', null)
                                }
                            }}
                        />
                    </Form.Item> : null}
                    {isShowPlatform ? <Card title="线上平台" style={{ marginBottom: "20px" }}>
                        <Form.List name="accounts">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card key={key} title={`第 ${name + 1} 个账号`} extra={<MinusCircleOutlined onClick={() => { remove(name); setHasOnlyShop(false); setHasFuSaleman(false); }} />} style={{ marginBottom: '20px' }}>
                                            <Form.Item label="平台" {...restField} name={[name, "platform"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select
                                                    placeholder="请选择"
                                                    options={type === 'report' ? form.getFieldValue('platformList') : platform}
                                                    onChange={(value) => { form.setFieldValue('platform', value) }}
                                                />
                                            </Form.Item>
                                            <Form.Item label="店铺类型" {...restField} name={[name, "shop_type"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select
                                                    placeholder="请选择"
                                                    onChange={(value) => {
                                                        form.setFieldValue('shop_type', value);
                                                        if (value === '专属店铺') {
                                                            setHasOnlyShop(true);
                                                        } else {
                                                            setHasOnlyShop(false);
                                                        }
                                                    }}
                                                    options={shop_type}
                                                />
                                            </Form.Item>
                                            {hasOnlyShop ? <Form.Item label="店铺名称" {...restField} name={[name, "shop_name"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Input placeholder="请输入" />
                                            </Form.Item> : null}
                                            <Form.Item label="账号ID" {...restField} name={[name, "account_id"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Input placeholder="请输入" onChange={(e) => { form.setFieldValue('account_id', e.target.value) }} />
                                            </Form.Item>
                                            <Form.Item label="账号名称" {...restField} name={[name, "account_name"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Input placeholder="请输入" />
                                            </Form.Item>
                                            <Form.Item label="账号类型" {...restField} name={[name, "account_type"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('account_type', value) }} options={accountType} />
                                            </Form.Item>
                                            <Form.Item label="合作方式" {...restField} name={[name, "account_models"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select mode="multiple" allowClear placeholder="请选择" onChange={(value) => { form.setFieldValue('account_models', value) }} options={accountModelType} />
                                            </Form.Item>
                                            <Form.Item label="关键字（前后缀）" {...restField} name={[name, "keyword"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select mode="tags" allowClear placeholder="请输入" onChange={(value) => { form.setFieldValue('keyword', value) }} options={[]} />
                                            </Form.Item>
                                            <Form.Item label="平时带货在线（人）[例：1000]" {...restField} name={[name, "people_count"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber placeholder="请输入" min={0} />
                                            </Form.Item>
                                            <Form.Item label="女粉比例（%）[例：50]" {...restField} name={[name, "fe_proportion"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber placeholder="请输入" min={0} max={100} />
                                            </Form.Item>
                                            <Form.Item label="粉丝地域分布（省份）" {...restField} name={[name, "main_province"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select mode="multiple" allowClear placeholder="请选择" showSearch filterOption={filterOption} onChange={(value) => { form.setFieldValue('main_province', value) }} options={province} />
                                            </Form.Item>
                                            <Form.Item label="粉丝购买主力年龄段（岁）" {...restField} name={[name, "age_cuts"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select mode="multiple" allowClear placeholder="请选择" options={ageCut} />
                                            </Form.Item>
                                            <Form.Item label="平均客单价（元）" {...restField} name={[name, "price_cut"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select placeholder="请选择" options={priceCut} />
                                            </Form.Item>
                                            <Form.Item label="常规品线上佣金比例（%）[例：20]" {...restField} name={[name, "commission_normal"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber placeholder="请输入" min={0} max={100} />
                                            </Form.Item>
                                            <Form.Item label="福利品线上佣金比例（%）[例：20]" {...restField} name={[name, "commission_welfare"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber placeholder="请输入" min={0} max={100} />
                                            </Form.Item>
                                            {/* <Space>
                                                <Form.Item label="福利品线上佣金比例（%）[例：20]" {...restField} name={[name, "commission_welfare_min"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber placeholder="请输入" min={0} max={100} />
                                                </Form.Item>
                                                <p> ~ </p>
                                                <Form.Item {...restField} name={[name, "commission_welfare_max"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber placeholder="请输入" min={0} max={100} />
                                                </Form.Item>
                                            </Space> */}
                                            <Form.Item label="爆品线上佣金比例（%）[例：20]" {...restField} name={[name, "commission_bao"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber placeholder="请输入" min={0} max={100} />
                                            </Form.Item>
                                            <Form.Item label="佣金备注" {...restField} name={[name, "commission_note"]}>
                                                <TextArea placeholder="请输入" />
                                            </Form.Item>
                                            <Space size='large'>
                                                <Form.Item label="主商务" {...restField} name={[name, "u_id_1"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                                                </Form.Item>
                                                <Form.Item label="主商务提成点（%）[例：0.5]" {...restField} name={[name, "u_point_1"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber placeholder="请输入" min={0} max={100} />
                                                </Form.Item>
                                            </Space>
                                            <Form.Item label="是否有副商务">
                                                <Radio.Group onChange={(e) => { setHasFuSaleman(e.target.value); }} value={hasFuSaleman}>
                                                    <Radio value={false}>无副商务</Radio>
                                                    <Radio value={true}>有副商务</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                            {hasFuSaleman ? <Space size='large'>
                                                <Form.Item label="副商务" {...restField} name={[name, "u_id_2"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                                                </Form.Item>
                                                <Form.Item label="副商务提成点（%）[例：0.5]" {...restField} name={[name, "u_point_2"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber min={0} max={100} />
                                                </Form.Item>
                                            </Space> : null}
                                            <Form.Item label="商务提成备注" {...restField} name={[name, "u_note"]}>
                                                <TextArea placeholder="请输入" />
                                            </Form.Item>
                                            <Form.Item label="业绩归属" {...restField} name={[name, "gmv_belong"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Radio.Group>
                                                    {gmvBelong.map((item) => {
                                                        return <Radio key={item.key} value={item.value}>{item.label}</Radio>
                                                    })}
                                                </Radio.Group>
                                            </Form.Item>
                                        </Card>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            添加新账号
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Card> : null}
                    {isShowGroup ? <Card title="社群团购" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="group_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="聚水潭店铺名" name="group_shop" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="常规品佣金（%）[例：20]" name="commission_normal" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="福利品线上佣金比例（%）[例：20]" name="commission_welfare" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="爆品佣金（%）[例：20]" name="commission_bao" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="佣金备注" name="commission_note">
                            <TextArea placeholder="请输入" />
                        </Form.Item>
                        <Space size='large'>
                            <Form.Item label="主商务" name="group_u_id_1" rules={[{ required: true, message: '不能为空' }]}>
                                <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="主商务提成点（%）[例：0.5]" name="group_u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber placeholder="请输入" min={0} max={100} />
                            </Form.Item>
                        </Space>
                        <Form.Item label="是否有副商务">
                            <Radio.Group onChange={(e) => { setGroupHasFuSaleman(e.target.value); }} value={hasGroupFuSaleman}>
                                <Radio value={false}>无副商务</Radio>
                                <Radio value={true}>有副商务</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {hasGroupFuSaleman ? <Space size='large'>
                            <Form.Item label="副商务" name={"group_u_id_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="副商务提成点（%）[例：0.5]" name={"group_u_point_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Space> : null}
                        <Form.Item label="商务提成备注" name="group_u_note">
                            <TextArea placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="业绩归属" name="group_gmv_belong" rules={[{ required: true, message: '不能为空' }]}>
                            <Radio.Group>
                                {gmvBelong.map((item) => {
                                    return <Radio key={item.key} value={item.value}>{item.label}</Radio>
                                })}
                            </Radio.Group>
                        </Form.Item>
                    </Card> : null}
                    {isShowProvide ? <Card title="供货" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="provide_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="聚水潭店铺名" name="provide_shop" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="买断折扣（折）[例：7.5]" name="discount_buyout" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" min={0} max={10} />
                        </Form.Item>
                        <Form.Item label="含退货率折扣（折）[例：7.5]" name="discount_back" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" min={0} max={10} />
                        </Form.Item>
                        <Form.Item label="折扣备注" name="discount_label">
                            <TextArea placeholder="请输入" />
                        </Form.Item>
                        <Space size='large'>
                            <Form.Item label="主商务" name="provide_u_id_1" rules={[{ required: true, message: '不能为空' }]}>
                                <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="主商务提成点（%）[例：0.5]" name="provide_u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber placeholder="请输入" min={0} max={100} />
                            </Form.Item>
                        </Space>
                        <Form.Item label="是否有副商务">
                            <Radio.Group onChange={(e) => { setProvideHasFuSaleman(e.target.value); }} value={hasProvideFuSaleman}>
                                <Radio value={false}>无副商务</Radio>
                                <Radio value={true}>有副商务</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {hasProvideFuSaleman ? <Space size='large'>
                            <Form.Item label="副商务" name={"provide_u_id_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="副商务提成点（%）[例：0.5]" name={"provide_u_point_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Space> : null}
                        <Form.Item label="商务提成备注" name="provide_u_note">
                            <TextArea placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="业绩归属" name="provide_gmv_belong" rules={[{ required: true, message: '不能为空' }]}>
                            <Radio.Group>
                                {gmvBelong.map((item) => {
                                    return <Radio key={item.key} value={item.value}>{item.label}</Radio>
                                })}
                            </Radio.Group>
                        </Form.Item>
                    </Card> : null}
                    {isShowCustom ? <Card title="定制" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="custom_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="聚水潭店铺名" name="custom_shop" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="产品利润点（%）[例：10]" name="profit_point" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="税点（%）[例：3]" name="tax_point" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="是否含包装" name="has_package" rules={[{ required: true, message: '不能为空' }]}>
                            <Radio.Group>
                                <Radio value="是">是</Radio>
                                <Radio value="否">否</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label="付款方式" name="pay_type" rules={[{ required: true, message: '不能为空' }]}>
                            <Radio.Group onChange={(e) => { setPayType(e.target.value); }} value={payType}>
                                {customPayType.map((item) => {
                                    return <Radio key={item.key} value={item.value}>{item.label}</Radio>
                                })}
                            </Radio.Group>
                        </Form.Item>
                        {payType === '定金+尾款' ? <Space size='large'>
                            <Form.Item label="定金（%）[例：50]" name="deposit" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber placeholder="请输入" min={0} max={100} />
                            </Form.Item>
                            <Form.Item label="尾款（%）[例：50]" name="tail" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber placeholder="请输入" min={0} max={100} />
                            </Form.Item>
                        </Space> : null}
                        <Space size='large'>
                            <Form.Item label="主商务" name="custom_u_id_1" rules={[{ required: true, message: '不能为空' }]}>
                                <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="主商务提成点（%）[例：0.5]" name="custom_u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber placeholder="请输入" min={0} max={100} />
                            </Form.Item>
                        </Space>
                        <Form.Item label="是否有副商务">
                            <Radio.Group onChange={(e) => { setCustomHasFuSaleman(e.target.value); }} value={hasCustomFuSaleman}>
                                <Radio value={false}>无副商务</Radio>
                                <Radio value={true}>有副商务</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {hasCustomFuSaleman ? <Space size='large'>
                            <Form.Item label="副商务" name={"custom_u_id_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="副商务提成点（%）[例：0.5]" name={"custom_u_point_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Space> : null}
                        <Form.Item label="商务提成备注" name="custom_u_note">
                            <TextArea placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="业绩归属" name="custom_gmv_belong" rules={[{ required: true, message: '不能为空' }]}>
                            <Radio.Group>
                                {gmvBelong.map((item) => {
                                    return <Radio key={item.key} value={item.value}>{item.label}</Radio>
                                })}
                            </Radio.Group>
                        </Form.Item>
                    </Card> : null}
                    {type === 'report' ? null : <><Form.Item label="相同线上达人">
                        <Button onClick={() => {
                            let ids = []
                            if (form.getFieldValue('accounts')) {
                                for (let i = 0; i < form.getFieldValue('accounts').length; i++) {
                                    ids.push(form.getFieldValue('accounts')[i].account_id)
                                }
                            }
                            if ((form.getFieldValue('talent_name') && form.getFieldValue('talent_name') !== null) || (ids.length > 0) || (form.getFieldValue('group_name') && form.getFieldValue('group_name') !== null) ||
                                (form.getFieldValue('provide_name') && form.getFieldValue('provide_name') !== null) || (form.getFieldValue('custom_name') && form.getFieldValue('custom_name') !== null)) {
                                let payload = {
                                    cid: type == 'add' ? '' : form.getFieldValue('cid'),
                                    type: 'talent',
                                    talent_name: form.getFieldValue('talent_name'),
                                    account_ids: ids,
                                    group_name: form.getFieldValue('group_name'),
                                    provide_name: form.getFieldValue('provide_name'),
                                    custom_name: form.getFieldValue('custom_name')
                                }
                                searchSameChanceAPI('search', payload, null)
                            } else {
                                setIsShowSearch(false)
                                setSameList([])
                                message.error('未填写达人账号名/ID, 无法查询')
                            }
                        }}>查询</Button>
                    </Form.Item>
                        {isShowSearch && <Form.Item label="">
                            {sameList.length > 0 ? <List
                                itemLayout="horizontal"
                                bordered
                                dataSource={sameList}
                                renderItem={(item, index) => (
                                    <List.Item key={index}>
                                        <List.Item.Meta
                                            avatar={<Image width={50} src={people} preview={false} />}
                                            title={<Space size={'large'}><span>{`编号: ${item.tmid}`}</span><span>{`状态: ${item.status}`}</span><span>{`${item.status === '已拉黑' ? '拉黑人' : '商务'}: ${item.u_name}`}</span></Space>}
                                            description={<Space size={'large'} style={{ color: `${item.status === '已拉黑' ? 'red' : ''}` }}>{item.status === '已拉黑' ? <><span>{`原因: ${item.note}`}</span><span>{`重复名称/ID: ${item.name}`}</span></> :
                                                <><span>{`昵称: ${item.name}`}</span><span>{`模式: ${item.model}`}</span>{item.model === '线上平台' ? <span>{`平台: ${item.platform}`}</span> : null}<span>{`账号名称: ${item.account_name}`}</span></>}</Space>}
                                        />
                                    </List.Item>
                                )}
                            /> : null}
                        </Form.Item>}</>}
                </Form>
            </Modal >
            <AEMiddleman
                isShow={isShowMid}
                type={typeMid}
                form={formMid}
                onOK={(values) => { typeMid === 'add' ? addMiddlemanAPI(values) : editMiddlemanAPI(values) }}
                onCancel={() => { setIsShowMid(false); formMid.resetFields(); }}
            />
        </Fragment>
    )
}

export default AETalent