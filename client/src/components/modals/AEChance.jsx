import React, { useEffect, useState } from "react";
import request from '../../service/request'
import { Card, Space, Form, Input, Modal, Button, Image, List, Select, message, Popover, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { model, platform, liaisonType } from '../../baseData/talent'
import people from '../../assets/people.jpg'
import UpLoadImg from '../UpLoadImg'

const { TextArea } = Input;

function AEChance(props) {
    const { type, isShow, form } = props;

    const [isShowPlatform, setIsShowPlatform] = useState(false)
    const [isShowGroup, setIsShowGroup] = useState(false)
    const [isShowProvide, setIsShowProvide] = useState(false)
    const [isShowCustom, setIsShowCustom] = useState(false)
    const [isShowSearch, setIsShowSearch] = useState(false)
    const [sameList, setSameList] = useState([])
    const searchSameChanceAPI = (type, payload) => {
        request({
            method: 'post',
            url: '/chance/searchSameChance',
            data: payload
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
                            props.onOK(payload);
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
    // 重置
    const reset = () => {
        setIsShowPlatform(false);
        setIsShowGroup(false);
        setIsShowProvide(false);
        setIsShowCustom(false);
        setIsShowSearch(false);
        setSameList([]);
    }

    useEffect(() => {
        setIsShowPlatform(!type.match('推进商机') && form.getFieldValue('models') && form.getFieldValue('models').join(',').match('线上平台') ? true : false)
        setIsShowGroup(!type.match('推进商机') && form.getFieldValue('models') && form.getFieldValue('models').join(',').match('社群团购') ? true : false)
        setIsShowProvide(!type.match('推进商机') && form.getFieldValue('models') && form.getFieldValue('models').join(',').match('供货') ? true : false)
        setIsShowCustom(!type.match('推进商机') && form.getFieldValue('models') && form.getFieldValue('models').join(',').match('定制') ? true : false)
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
            <Form
                form={form}
                onFinish={(values) => {
                    if (type === '添加商机') {
                        let payload = {
                            cid: '',
                            type: 'chance',
                            ...values,
                            search_pic: values.search_pic ? values.search_pic.join() : null,
                            advance_pic: values.advance_pic ? values.advance_pic.join() : null
                        }
                        searchSameChanceAPI('finish', payload)
                    } else if (type.match('推进商机')) {
                        let payload = {
                            cid: form.getFieldValue('cid'),
                            ...values,
                            advance_pic: values.advance_pic ? values.advance_pic.join() : null,
                            operate: type
                        }
                        props.onOK(payload);
                        reset();
                    } else {
                        let payload = {
                            cid: form.getFieldValue('cid'),
                            ...values,
                            advance_pic: values.advance_pic ? values.advance_pic.join() : null
                        }
                        props.onOK(payload);
                        reset();
                    }
                }}
            >
                {type === '添加商机' ? <Alert message={<span>此阶段多商务可以 <b>同时报备</b> 同一个达人</span>} type="info" showIcon style={{ margin: '20px 0' }} /> :
                    type.match('推进商机') ? <Alert message={<span>此阶段遵循公司规定，给予商机 <b>15</b> 天保护机制</span>} type="info" showIcon style={{ margin: '20px 0' }} /> : null}
                {type.match('推进商机') ? null : <>{type === '添加商机' ? null : <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '不能为空' }]}>
                    <Input disabled={true} />
                </Form.Item>}
                    {type === '添加商机' || type.match('修改商机') ? <Form.Item label="模式" name="models" rules={[{ required: true, message: '不能为空' }]}>
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
                            }}
                        />
                    </Form.Item> : null}
                    {isShowPlatform ? <Card title="线上平台" style={{ marginBottom: "20px" }}>
                        <Form.Item label="平台" name="platforms" rules={[{ required: true, message: '不能为空' }]}>
                            <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="请选择" options={platform} />
                        </Form.Item>
                        <Form.Item label="达人账号" name="account_names" rules={[{ required: true, message: '不能为空' }]}>
                            <Select mode="tags" allowClear placeholder="请输入" onChange={(value) => { form.setFieldValue('account_names', value) }} options={[]} />
                        </Form.Item>
                    </Card> : null}
                    {isShowGroup ? <Card title="社群团购" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="group_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" disabled={type === '报备商机' ? true : false} />
                        </Form.Item>
                    </Card> : null}
                    {isShowProvide ? <Card title="供货" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="provide_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" disabled={type === '报备商机' ? true : false} />
                        </Form.Item>
                    </Card> : null}
                    {isShowCustom ? <Card title="定制" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="custom_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" disabled={type === '报备商机' ? true : false} />
                        </Form.Item>
                    </Card> : null}
                    {type === '修改达人详情' ? <Form.Item label="达人编号" name="tid" rules={[{ required: true, message: '不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item> : null}
                    <Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '不能为空' }]}>
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
                    </Form.Item>
                    <Form.Item label={<Popover title="证明方向" content={
                        <List>
                            <List.Item>1. 商务加达人微信</List.Item>
                            <List.Item>2. 跟达人要有互动证明，不能仅自己说话的截图</List.Item>
                        </List>}
                    >
                        <span><InfoCircleOutlined /> 寻找证明</span>
                    </Popover>}
                        name="search_pic"
                        rules={[{ required: true, message: '不能为空' }]}
                    >
                        <UpLoadImg title="上传" name="寻找商机" setPicUrl={(value) => { form.setFieldValue('search_pic', value) }} />
                    </Form.Item></>}
                {type === '添加商机' || type === '修改商机_待推进' || type === '修改达人详情' ? null : <>
                    {type === '延期推进商机' ? <Form.Item label="延期理由" name="delay_note" rules={[{ required: true, message: '不能为空' }]}>
                        <TextArea placeholder="请输入" maxLength={255} />
                    </Form.Item> : null}
                    <Form.Item label={<Popover title="证明方向" content={
                        <List>
                            <List.Item>1. 拉合作群</List.Item>
                            <List.Item>2. 寄样 或者 来访/拜访 照片证明</List.Item>
                        </List>}
                    >
                        <span><InfoCircleOutlined /> 推进证明</span>
                    </Popover>}
                        name="advance_pic"
                        rules={[{ required: true, message: '不能为空' }]}
                    >
                        <UpLoadImg title="上传" name={type} setPicUrl={(value) => { form.setFieldValue('advance_pic', value) }} />
                    </Form.Item></>}
                {type.match('推进商机') ? null : <><Form.Item label="达人查重">
                    <Button onClick={() => {
                        if ((form.getFieldValue('account_names') && form.getFieldValue('account_names').length > 0) || (form.getFieldValue('group_name') && form.getFieldValue('group_name').length > 0) ||
                            (form.getFieldValue('provide_name') && form.getFieldValue('provide_name').length > 0) || (form.getFieldValue('custom_name') && form.getFieldValue('custom_name').length > 0)) {
                            let payload = {
                                cid: type === '添加商机' ? '' : form.getFieldValue('cid'),
                                type: 'chance',
                                account_names: form.getFieldValue('account_names'),
                                group_name: form.getFieldValue('group_name'),
                                provide_name: form.getFieldValue('provide_name'),
                                custom_name: form.getFieldValue('custom_name')
                            }
                            searchSameChanceAPI('search', payload)
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
                                            <><span>{`模式: ${item.model}`}</span>{item.model === '线上平台' ? <span>{`平台: ${item.platform}`}</span> : null}<span>{`重复名称/ID: ${item.account_name}`}</span></>}</Space>}
                                    />
                                </List.Item>
                            )}
                        /> : null}
                    </Form.Item>}</>}
            </Form>
        </Modal>
    )
}

export default AEChance