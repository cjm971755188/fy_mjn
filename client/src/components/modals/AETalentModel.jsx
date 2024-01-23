import React, { useEffect, useState } from "react";
import request from '../../service/request'
import { Card, Space, Form, Input, Modal, Button, Select, Radio, InputNumber, message, List, Image } from 'antd';
import { accountType, accountModelType, ageCut, priceCut, shop, platform } from '../../baseData/talent'
import { province } from '../../baseData/province'
import people from '../../assets/people.jpg'

const { TextArea } = Input;

function AETalentModel(props) {
    const { type, isShow, form } = props;

    const [isShowPlatform, setIsShowPlatform] = useState(false)
    const [isShowGroup, setIsShowGroup] = useState(false)
    const [isShowProvide, setIsShowProvide] = useState(false)
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
                            props.onOK(values);
                            reset();
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
    const [hasFuSaleman, setHasFuSaleman] = useState(false)
    const [salemanAssistantsItems, setSalemanAssistantsItems] = useState(false)
    const getSalemanAssistantsItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getSalemanAssistantItems',
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

    // 重置
    const reset = () => {
        setIsShowPlatform(false);
        setIsShowGroup(false);
        setIsShowProvide(false);
        setIsShowSearch(false);
        setSameList([]);
        setHasFuSaleman(false);
        setSalemanAssistantsItems();
    }

    useEffect(() => {
        setIsShowPlatform(type && type.match('线上平台') ? true : false)
        setIsShowGroup(type && type.match('社群团购') ? true : false)
        setIsShowProvide(type && type.match('供货') ? true : false)
        setHasFuSaleman(form.getFieldValue('u_id_2') && form.getFieldValue('u_id_2') !== null ? true : false)
    }, [isShow])
    return (
        <Modal
            title={type}
            open={isShow}
            width='40%'
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); reset(); }}
        >
            <Form form={form} onFinish={(values) => {
                if (type.match('新增')) {
                    searchSameChanceAPI('finish', null, {
                        ...values,
                        type: type === '新增线上平台' ? 'model_1' : type === '新增社群团购' ? 'model_2' : 'model_3'
                    })
                } else {
                    props.onOK(values);
                    reset();
                }
            }}>
                {type && type.match('新增') ? null : <Form.Item label="合作模式编码" name="tmid" rules={[{ required: true, message: '不能为空' }]}>
                    <Input disabled={true} />
                </Form.Item>}
                {isShowPlatform ? <Card title="线上平台" style={{ marginBottom: "20px" }}>
                    {type && type.match('修改') ? null : <><Form.Item label="平台" name="platform" rules={[{ required: true, message: '不能为空' }]}>
                        <Select
                            placeholder="请选择"
                            options={platform}
                            onChange={(value) => {
                                form.setFieldValue('platform', value)
                                if (value !== '闯货' && value !== '抖音' && value !== '快手' && value !== '视频号' && value !== '视频号服务商') {
                                    setIsShowKeyword(true)
                                }
                            }}
                        />
                    </Form.Item>
                        <Form.Item label="店铺" name="shop" rules={[{ required: true, message: '不能为空' }]}>
                            <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('shop', value) }} options={shop} />
                        </Form.Item></>}
                    <Form.Item label="账号ID" name="account_id" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" onChange={(e) => { form.setFieldValue('account_id', e.target.value) }} disabled={type && type.match('修改') ? true : false} />
                    </Form.Item>
                    <Form.Item label="账号名称" name="account_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" disabled={type && type.match('修改') ? true : false} />
                    </Form.Item>
                    <Form.Item label="账号类型" name="account_type" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('account_type', value) }} options={accountType} />
                    </Form.Item>
                    <Form.Item label="合作方式" name="account_models" rules={[{ required: true, message: '不能为空' }]}>
                        <Select mode="multiple" allowClear placeholder="请选择" onChange={(value) => { form.setFieldValue('account_models', value) }} options={accountModelType} />
                    </Form.Item>
                    <Form.Item label="关键字（前后缀）" name="keyword" rules={[{ required: true, message: '不能为空' }]}>
                        <Select mode="tags" allowClear placeholder="请输入" onChange={(value) => { form.setFieldValue('keyword', value) }} options={[]} />
                    </Form.Item>
                    <Form.Item label="平时带货在线（人）[例：1000]" name="people_count" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item label="女粉比例（%）[例：50]" name="fe_proportion" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber min={0} max={100} />
                    </Form.Item>
                    <Form.Item label="粉丝地域分布（省份）" name="main_province" rules={[{ required: true, message: '不能为空' }]}>
                        <Select mode="multiple" allowClear placeholder="请选择" onChange={(value) => { form.setFieldValue('main_province', value) }} options={province} />
                    </Form.Item>
                    <Form.Item label="粉丝购买主力年龄段（岁）" name="age_cuts" rules={[{ required: true, message: '不能为空' }]}>
                        <Select mode="multiple" allowClear options={ageCut} />
                    </Form.Item>
                    <Form.Item label="平均客单价（元）" name="price_cut" rules={[{ required: true, message: '不能为空' }]}>
                        <Select options={priceCut} />
                    </Form.Item>
                    <Form.Item label="常规品线上佣金比例（%）[例：20]" name="commission_normal" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber min={0} max={100} />
                    </Form.Item>
                    <Form.Item label="福利品线上佣金比例（%）[例：20]" name="commission_welfare" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber min={0} max={100} />
                    </Form.Item>
                    <Form.Item label="爆品线上佣金比例（%）[例：20]" name="commission_bao" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber min={0} max={100} />
                    </Form.Item>
                    <Form.Item label="佣金备注" name="commission_note">
                        <TextArea />
                    </Form.Item>
                    <Space size='large'>
                        <Form.Item label="主商务" name="u_id_1" >
                            <Select disabled={true} />
                        </Form.Item>
                        <Form.Item label="主商务提成点（%）[例：0.5]" name="u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                    </Space>
                    <Form.Item label="是否有副商务">
                        <Radio.Group onChange={(e) => { setHasFuSaleman(e.target.value); }} value={hasFuSaleman} style={{ marginLeft: '20px' }}>
                            <Radio value={false}>无副商务</Radio>
                            <Radio value={true}>有副商务</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {hasFuSaleman ? <Space size='large'>
                        <Form.Item label="副商务" name="u_id_2" rules={[{ required: true, message: '不能为空' }]}>
                            <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} onChange={(value) => { form.setFieldValue('u_id_2', value) }} />
                        </Form.Item>
                        <Form.Item label="副商务提成点（%）[例：0.5]" name="u_point_2" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                    </Space> : null}
                    <Form.Item label="商务提成备注" name="u_note">
                        <TextArea />
                    </Form.Item>
                </Card> : null}
                {isShowGroup ? <Card title="社群团购" style={{ marginBottom: "20px" }}>
                    <Form.Item label="达人名称" name="group_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="聚水潭店铺名" name="shop" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="常规品佣金（%）[例：20]" name="commission_normal" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber placeholder="请输入" min={0} max={100} />
                    </Form.Item>
                    <Form.Item label="福利品佣金（%）[例：20]" name="commission_welfare" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber placeholder="请输入" min={0} max={100} />
                    </Form.Item>
                    <Form.Item label="爆品佣金（%）[例：20]" name="commission_bao" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber placeholder="请输入" min={0} max={100} />
                    </Form.Item>
                    <Form.Item label="佣金备注" name="commission_note">
                        <TextArea placeholder="请输入" />
                    </Form.Item>
                    <Space size='large'>
                        <Form.Item label="主商务" name="u_id_1" >
                            <Select disabled={true} />
                        </Form.Item>
                        <Form.Item label="主商务提成点（%）[例：0.5]" name="u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                    </Space>
                    <Form.Item label="是否有副商务">
                        <Radio.Group onChange={(e) => { setHasFuSaleman(e.target.value); }} value={hasFuSaleman} style={{ marginLeft: '20px' }}>
                            <Radio value={false}>无副商务</Radio>
                            <Radio value={true}>有副商务</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {hasFuSaleman ? <Space size='large'>
                        <Form.Item label="副商务" name="u_id_2" rules={[{ required: true, message: '不能为空' }]} >
                            <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} onChange={(value) => { form.setFieldValue('u_id_2', value) }} />
                        </Form.Item>
                        <Form.Item label="副商务提成点（%）[例：0.5]" name="u_point_2" rules={[{ required: true, message: '不能为空' }]} >
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                    </Space> : null}
                    <Form.Item label="商务提成备注" name="u_note">
                        <TextArea />
                    </Form.Item>
                </Card> : null}
                {isShowProvide ? <Card title="供货" style={{ marginBottom: "20px" }}>
                    <Form.Item label="达人名称" name="provide_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="聚水潭店铺名" name="shop" rules={[{ required: true, message: '不能为空' }]}>
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
                        <Form.Item label="主商务" name="u_id_1" >
                            <Select disabled={true} />
                        </Form.Item>
                        <Form.Item label="主商务提成点（%）[例：0.5]" name="u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                    </Space>
                    <Form.Item label="是否有副商务">
                        <Radio.Group onChange={(e) => { setHasFuSaleman(e.target.value); }} value={hasFuSaleman} style={{ marginLeft: '20px' }}>
                            <Radio value={false}>无副商务</Radio>
                            <Radio value={true}>有副商务</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {hasFuSaleman ? <Space size='large'>
                        <Form.Item label="副商务" name="u_id_2" rules={[{ required: true, message: '不能为空' }]} >
                            <Select style={{ width: 160 }} options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(); }} onChange={(value) => { form.setFieldValue('u_id_2', value) }} />
                        </Form.Item>
                        <Form.Item label="副商务提成点（%）[例：0.5]" name="u_point_2" rules={[{ required: true, message: '不能为空' }]} >
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                    </Space> : null}
                    <Form.Item label="商务提成备注" name="u_note">
                        <TextArea />
                    </Form.Item>
                </Card> : null}
                {type && type.match('修改') ? null : <><Form.Item label="相同线上达人">
                    <Button onClick={() => {
                        if ((form.getFieldValue('account_id') && form.getFieldValue('account_id') !== null) ||
                            (form.getFieldValue('group_name') && form.getFieldValue('group_name') !== null) || (form.getFieldValue('provide_name') && form.getFieldValue('provide_name') !== null)) {
                            let payload = {
                                type: type === '新增线上平台' ? 'model_1' : type === '新增社群团购' ? 'model_2' : 'model_3',
                                cid: type == 'add' ? '' : form.getFieldValue('cid'),
                                talent_name: form.getFieldValue('talent_name'),
                                account_id: form.getFieldValue('account_id'),
                                group_name: form.getFieldValue('group_name'),
                                provide_name: form.getFieldValue('provide_name')
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
                                        title={<Space size={'large'}><span>{`编号: ${item.tmid}`}</span><span>{`状态: ${item.status}`}</span><span>{`商务: ${item.u_name}`}</span></Space>}
                                        description={<Space size={'large'}><span>{`模式: ${item.model}`}</span>{item.model === '线上平台' ? <span>{`平台: ${item.platform}`}</span> : null}
                                            <span>{`重复名称/ID: ${item.account_name || item.group_name || item.provide_name}`}</span></Space>}
                                    />
                                </List.Item>
                            )}
                        /> : null}
                    </Form.Item>}</>}
            </Form>
        </Modal >
    )
}

export default AETalentModel