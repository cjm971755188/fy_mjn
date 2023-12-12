import React, { Fragment, useEffect, useState } from "react";
import request from '../../service/request'
import { Card, Space, Form, Input, Modal, Button, Select, Radio, InputNumber, message, List, Image } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { accountType, accountModelType, ageCut, priceCut, liaisonType, shop, platform, model } from '../../baseData/talent'
import { province } from '../../baseData/province'
import people from '../../assets/people.jpg'
import AEMiddleman from './AEMiddleman'

const { TextArea } = Input;

function AETalent(props) {
    const { type, isShow, form } = props;

    const [isShowPlatform, setIsShowPlatform] = useState(false)
    const [isShowGroup, setIsShowGroup] = useState(false)
    const [isShowProvide, setIsShowProvide] = useState(false)
    const [isShowKeyword, setIsShowKeyword] = useState(false)
    const [isShowSearch, setIsShowSearch] = useState(false)
    const [searchList, setSearchList] = useState({})
    const searchSameChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/searchSameChance',
            data: payload
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
    const [hasFuSaleman, setHasFuSaleman] = useState(false)
    const [hasFirstMiddle, setHasFirstMiddle] = useState(false)
    const [hasSecondMiddle, setHasSecondMiddle] = useState(false)
    const [hasGroupFuSaleman, setGroupHasFuSaleman] = useState(false)
    const [hasProvideFuSaleman, setProvideHasFuSaleman] = useState(false)
    const [middlemans1, setMiddlemans1] = useState(false)
    const [middlemans2, setMiddlemans2] = useState(false)
    const [salemansItems, setSalemansItems] = useState(false)
    const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
    const searchMiddlemansAPI = (count, value) => {
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
                    if (count === 1) {
                        setMiddlemans1(res.data.data)
                    } else {
                        setMiddlemans2(res.data.data)
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
    const getSalemansItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getSalemanItems',
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
                    setSalemansItems(res.data.data)
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

    useEffect(() => {
        setIsShowPlatform(form.getFieldValue('models') && form.getFieldValue('models').join(',').match('线上平台') ? true : false)
        setIsShowGroup(form.getFieldValue('models') && form.getFieldValue('models').join(',').match('社群团购') ? true : false)
        setIsShowProvide(form.getFieldValue('models') && form.getFieldValue('models').join(',').match('供货') ? true : false)
    }, [isShow])
    return (
        <Fragment>
            <Modal
                title={type == 'report' ? '达人报备' : type == 'history' ? '历史达人报备' : type}
                open={isShow}
                width='40%'
                maskClosable={false}
                onOk={() => { form.submit(); }}
                onCancel={() => { props.onCancel(); }}
            >
                <Form form={form} onFinish={(values) => {
                    let payload = {}
                    if (type === 'report') {
                        payload = {
                            cid: 'history',
                            ...values,
                            liaison_type: form.getFieldValue('liaison_type'),
                            liaison_name: form.getFieldValue('liaison_name'),
                            liaison_v: form.getFieldValue('liaison_v'),
                            liaison_phone: form.getFieldValue('liaison_phone'),
                            crowd_name: form.getFieldValue('crowd_name')
                        }
                    } else {
                        payload = values
                    }
                    props.onOK(payload);
                }}>
                    {type == 'report' || type == 'history' ? <>
                        {type == 'history' ? null : <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '不能为空' }]}>
                            <Input disabled={true} />
                        </Form.Item>}
                        <Form.Item label="达人昵称" name="talent_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入达人昵称（公司内部、唯一、比较简单好记）" />
                        </Form.Item>
                        <Form.Item label="达人所在省份" name="province" rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" options={province} />
                        </Form.Item>
                        <Form.Item label="预估慕江南年销售额（万）" name="year_deal" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        {type == 'history' ? <><Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '不能为空' }]}>
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
                        <Form.Item label="联系人电话（选填）" name="liaison_phone">
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="沟通群名称" name="crowd_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item></> : null}
                        <Form.Item label="若中间人暂未添加">
                            <Button onClick={() => { setIsShowMid(true); setTypeMid('add'); }}>添加</Button>
                        </Form.Item>
                        <Form.Item label="是否有中间人">
                            <Radio.Group onChange={(e) => { setHasFirstMiddle(e.target.value); if (!e.target.value) { setMiddlemans1([]) } }} value={hasFirstMiddle} style={{ marginLeft: '20px' }}>
                                <Radio value={false}>无一级中间人</Radio>
                                <Radio value={true}>有一级中间人</Radio>
                            </Radio.Group>
                            <Radio.Group onChange={(e) => { setHasSecondMiddle(e.target.value); if (!e.target.value) { setMiddlemans2([]) } }} value={hasSecondMiddle} style={{ marginLeft: '20px' }}>
                                <Radio value={false}>无二级中间人</Radio>
                                <Radio value={true}>有二级中间人</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {hasFirstMiddle ? <><Space size='large'>
                            <Form.Item label="一级中间人" name="m_id_1" rules={[{ required: true, message: '不能为空' }]}>
                                <Select showSearch placeholder="请输入" options={middlemans1} filterOption={filterOption} onChange={(value) => { searchMiddlemansAPI(1, value) }} onSearch={(value) => { searchMiddlemansAPI(1, value) }} />
                            </Form.Item>
                            <Form.Item label="一级中间人提成点（%）" name="m_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space></> : null}
                        {hasSecondMiddle ? <><Space size='large'>
                            <Form.Item label="二级中间人" name="m_id_2" rules={[{ required: true, message: '不能为空' }]}>
                                <Select showSearch placeholder="请输入" options={middlemans2} filterOption={filterOption} onChange={(value) => { searchMiddlemansAPI(2, value) }} onSearch={(value) => { searchMiddlemansAPI(2, value) }} />
                            </Form.Item>
                            <Form.Item label="二级中间人提成点（%）" name="m_point_2" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space></> : null}
                        {hasFirstMiddle || hasSecondMiddle ? <Form.Item label="中间人提成备注" name="m_note">
                            <TextArea />
                        </Form.Item> : null}
                    </> : null}
                    {type == 'history' ? <Form.Item label="模式" name="models" rules={[{ required: true, message: '不能为空' }]}>
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
                            }}
                        />
                    </Form.Item> : null}
                    {isShowPlatform ? <Card title="线上平台" style={{ marginBottom: "20px" }}>
                        <Form.List name="accounts">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card key={key} title={`第 ${name + 1} 个账号`} extra={<MinusCircleOutlined onClick={() => remove(name)} />} style={{ marginBottom: '20px' }}>
                                            <Form.Item label="平台" {...restField} name={[name, "platform"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select
                                                    placeholder="请选择"
                                                    options={type === 'report' ? form.getFieldValue('platformList') : platform}
                                                    onChange={(value) => {
                                                        form.setFieldValue('platform', value)
                                                        if (value !== '闯货' && value !== '抖音' && value !== '快手' && value !== '视频号' && value !== '视频号服务商') {
                                                            setIsShowKeyword(true)
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                            <Form.Item label="店铺" {...restField} name={[name, "shop"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('shop', value) }} options={shop} />
                                            </Form.Item>
                                            <Form.Item label="账号ID" {...restField} name={[name, "account_id"]} rules={[{ required: true, message: '不能为空' }]}>
                                                {type === 'report' ? <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('account_id', value) }} options={form.getFieldValue('accountIdList')} /> :
                                                    <Input placeholder="请输入" onChange={(e) => { form.setFieldValue('account_id', e.target.value) }} />}
                                            </Form.Item>
                                            <Form.Item label="账号名称" {...restField} name={[name, "account_name"]} rules={[{ required: true, message: '不能为空' }]}>
                                                {type === 'report' ? <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('account_name', value) }} options={form.getFieldValue('accountNameList')} /> : <Input placeholder="请输入" />}
                                            </Form.Item>
                                            {type === 'report' ? null : <><Form.Item label="相同线上达人">
                                                <Button onClick={() => {
                                                    if ((form.getFieldValue('account_name') && form.getFieldValue('account_name') !== '') || (form.getFieldValue('account_id') && form.getFieldValue('account_id') !== '')) {
                                                        let payload = {
                                                            type: 'single',
                                                            account_name: form.getFieldValue('account_name') ? form.getFieldValue('account_name') : null,
                                                            account_id: form.getFieldValue('account_id') ? form.getFieldValue('account_id') : null
                                                        }
                                                        searchSameChanceAPI(payload)
                                                    } else {
                                                        setIsShowSearch(false)
                                                        setSearchList({})
                                                        message.error('未填写达人账号名/ID, 无法查询')
                                                    }
                                                }}>查询</Button>
                                            </Form.Item>
                                                {isShowSearch && <Form.Item label="">
                                                    {searchList.length > 0 ? <List
                                                        itemLayout="horizontal"
                                                        bordered
                                                        dataSource={searchList}
                                                        renderItem={(item, index) => (
                                                            <List.Item>
                                                                <List.Item.Meta
                                                                    avatar={<Image width={50} src={people} preview={false} />}
                                                                    title={<Space size={'large'}><span>{`达人编号: ${item.tid}`}</span><span>{`主商务: ${item.u_name_1}`}</span></Space>}
                                                                    description={<Space size={'large'}><span>{`平台: ${item.platform}`}</span><span>{`账号ID: ${item.account_id}`}</span><span>{`账号名称: ${item.account_name}`}</span></Space>}
                                                                />
                                                            </List.Item>
                                                        )}
                                                    /> : null}
                                                </Form.Item>}</>}
                                            <Form.Item label="账号类型" {...restField} name={[name, "account_type"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('account_type', value) }} options={accountType} />
                                            </Form.Item>
                                            <Form.Item label="合作方式" {...restField} name={[name, "account_models"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select mode="multiple" allowClear placeholder="请选择" onChange={(value) => { form.setFieldValue('account_models', value) }} options={accountModelType} />
                                            </Form.Item>
                                            {isShowKeyword ? <Form.Item label="关键字（前后缀）" {...restField} name={[name, "keyword"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Input placeholder="请输入" />
                                            </Form.Item> : null}
                                            <Form.Item label="平时带货在线（人）" {...restField} name={[name, "people_count"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="女粉比例（%）" {...restField} name={[name, "fe_proportion"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="粉丝地域分布（省份）" {...restField} name={[name, "main_province"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Input />
                                            </Form.Item>
                                            <Form.Item label="粉丝购买主力年龄段（岁）" {...restField} name={[name, "age_cuts"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select mode="multiple" allowClear options={ageCut} />
                                            </Form.Item>
                                            <Form.Item label="平均客单价（元）" {...restField} name={[name, "price_cut"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select options={priceCut} />
                                            </Form.Item>
                                            <Form.Item label="常规品线上佣金比例（%）" {...restField} name={[name, "commission_normal"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="福利品线上佣金比例（%）" {...restField} name={[name, "commission_welfare"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="爆品线上佣金比例（%）" {...restField} name={[name, "commission_bao"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="佣金备注" {...restField} name={[name, "commission_note"]}>
                                                <TextArea />
                                            </Form.Item>
                                            <Space size='large'>
                                                <Form.Item label="主商务" {...restField} name={[name, "u_id_1"]} >
                                                    <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                                                </Form.Item>
                                                <Form.Item label="主商务提成点（%）" {...restField} name={[name, "u_point_1"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space>
                                            <Form.Item label="是否有副商务">
                                                <Radio.Group onChange={(e) => { setHasFuSaleman(e.target.value); }} value={hasFuSaleman} style={{ marginLeft: '20px' }}>
                                                    <Radio value={false}>无副商务</Radio>
                                                    <Radio value={true}>有副商务</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                            {hasFuSaleman ? <Space size='large'>
                                                <Form.Item label="副商务" {...restField} name={[name, "u_id_2"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                                                </Form.Item>
                                                <Form.Item label="副商务提成点（%）" {...restField} name={[name, "u_point_2"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space> : null}
                                            <Form.Item label="商务提成备注" {...restField} name={[name, "u_note"]}>
                                                <TextArea />
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
                        <Form.Item label="聚水潭店铺名" name="group_shop">
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="常规品佣金（%）(例：20)" name="discount_normal" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="福利品佣金（%）(例：20)" name="discount_welfare" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="爆品佣金（%）(例：20)" name="discount_bao" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="佣金备注" name="discount_note">
                            <TextArea placeholder="请输入" />
                        </Form.Item>
                        <Space size='large'>
                            <Form.Item label="主商务" name="group_u_id_1" >
                                <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                            </Form.Item>
                            <Form.Item label="主商务提成点（%）" name="group_u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space>
                        <Form.Item label="是否有副商务">
                            <Radio.Group onChange={(e) => { setGroupHasFuSaleman(e.target.value); }} value={hasGroupFuSaleman} style={{ marginLeft: '20px' }}>
                                <Radio value={false}>无副商务</Radio>
                                <Radio value={true}>有副商务</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {hasGroupFuSaleman ? <Space size='large'>
                            <Form.Item label="副商务" name={"group_u_id_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="副商务提成点（%）" name={"group_u_point_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <InputNumber />
                            </Form.Item>
                        </Space> : null}
                        <Form.Item label="商务提成备注" name="group_u_note">
                            <TextArea />
                        </Form.Item>
                    </Card> : null}
                    {isShowProvide ? <Card title="供货" style={{ marginBottom: "20px" }}>
                        <Form.Item label="聚水潭店铺名" name="provide_shop">
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="买断折扣（折）(例：7.5)" name="discount_buyout" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="含退货率折扣（折）(例：7.5)" name="discount_back" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="折扣备注" name="discount_label">
                            <TextArea placeholder="请输入" />
                        </Form.Item>
                        <Space size='large'>
                            <Form.Item label="主商务" name="provide_u_id_1" >
                                <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                            </Form.Item>
                            <Form.Item label="主商务提成点（%）" name="provide_u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space>
                        <Form.Item label="是否有副商务">
                            <Radio.Group onChange={(e) => { setProvideHasFuSaleman(e.target.value); }} value={hasProvideFuSaleman} style={{ marginLeft: '20px' }}>
                                <Radio value={false}>无副商务</Radio>
                                <Radio value={true}>有副商务</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {hasProvideFuSaleman ? <Space size='large'>
                            <Form.Item label="副商务" name={"provide_u_id_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                            </Form.Item>
                            <Form.Item label="副商务提成点（%）" name={"provide_u_point_2"} rules={[{ required: true, message: '不能为空' }]} >
                                <InputNumber />
                            </Form.Item>
                        </Space> : null}
                        <Form.Item label="商务提成备注" name="provide_u_note">
                            <TextArea />
                        </Form.Item>
                    </Card> : null}
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