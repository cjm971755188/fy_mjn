import React, { useEffect, useState } from "react";
import request from '../../service/request'
import { Card, Space, Form, Input, Modal, Button, Image, List, Select, message } from 'antd';
import { model, platform } from '../../baseData/talent'
import people from '../../assets/people.jpg'
import UpLoadImg from '../UpLoadImg'

function AEChance(props) {
    const { type, isShow, form } = props;

    const [isShowPlatform, setIsShowPlatform] = useState(false)
    const [isShowGroup, setIsShowGroup] = useState(false)
    const [isShowProvide, setIsShowProvide] = useState(false)
    const [isShowSearch, setIsShowSearch] = useState(false)
    const [sameList, setSameList] = useState([])
    const [samename, setSameName] = useState('')
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
                    setSameName(res.data.samename)
                    message.error(res.data.msg)
                } else {
                    if (type === 'search') {
                        setIsShowSearch(false)
                        setSameList([])
                        setSameName('')
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
        setIsShowSearch(false);
        setSameList([]);
        setSameList('');
    }

    useEffect(() => {
        console.log(form.getFieldsValue());
        setIsShowPlatform(type !== 'advance' && form.getFieldValue('models') && form.getFieldValue('models').join(',').match('线上平台') ? true : false)
        setIsShowGroup(type !== 'advance' && form.getFieldValue('models') && form.getFieldValue('models').join(',').match('社群团购') ? true : false)
        setIsShowProvide(type !== 'advance' && form.getFieldValue('models') && form.getFieldValue('models').join(',').match('供货') ? true : false)
    }, [isShow])
    return (
        <Modal
            title={type == 'add' ? '添加商机' : type == 'edit' ? '修改商机' : type == 'advance' ? '推进商机' : ''}
            open={isShow}
            width='40%'
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); reset(); }}
        >
            <Form
                form={form}
                onFinish={(values) => {
                    let payload = {
                        cid: type == 'add' ? '' : form.getFieldValue('cid'),
                        type: 'chance',
                        ...values,
                        search_pic: values.search_pic.replace('/public', '')
                    }
                    searchSameChanceAPI('finish', payload)
                }}
            >
                {type == 'add' ? null : <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '不能为空' }]}>
                    <Input disabled={true} />
                </Form.Item>}
                {type == 'add' || type == 'edit' ? <Form.Item label="模式" name="models" rules={[{ required: true, message: '不能为空' }]}>
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
                    <Form.Item label="平台" name="platforms" rules={[{ required: true, message: '不能为空' }]}>
                        <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="请选择" options={platform} />
                    </Form.Item>
                    <Form.Item label="账号ID" name="account_ids" rules={[{ required: true, message: '不能为空' }]}>
                        <Select mode="tags" allowClear placeholder="请输入" onChange={(value) => { form.setFieldValue('account_ids', value) }} options={[]} />
                    </Form.Item>
                    <Form.Item label="达人账号" name="account_names" rules={[{ required: true, message: '不能为空' }]}>
                        <Select mode="tags" allowClear placeholder="请输入" onChange={(value) => { form.setFieldValue('account_names', value) }} options={[]} />
                    </Form.Item>
                </Card> : null}
                {isShowGroup ? <Card title="社群团购" style={{ marginBottom: "20px" }}>
                    <Form.Item label="达人名称" name="group_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" disabled={type === 'report' ? true : false} />
                    </Form.Item>
                </Card> : null}
                {isShowProvide ? <Card title="供货" style={{ marginBottom: "20px" }}>
                    <Form.Item label="达人名称" name="provide_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" disabled={type === 'report' ? true : false} />
                    </Form.Item>
                </Card> : null}
                <Form.Item label="相同线上达人">
                    <Button onClick={() => {
                        if ((form.getFieldValue('account_ids') && form.getFieldValue('account_ids').length > 0) ||
                            (form.getFieldValue('group_name') && form.getFieldValue('group_name').length > 0) || (form.getFieldValue('provide_name') && form.getFieldValue('provide_name').length > 0)) {
                            let payload = {
                                cid: type == 'add' ? '' : form.getFieldValue('cid'),
                                type: 'chance',
                                account_ids: form.getFieldValue('account_ids'),
                                group_name: form.getFieldValue('group_name'),
                                provide_name: form.getFieldValue('provide_name')
                            }
                            searchSameChanceAPI('search', payload)
                        } else {
                            setIsShowSearch(false)
                            setSameList([])
                            setSameName('')
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
                                    title={<Space size={'large'}><span>{`编号: ${item.cid}`}</span><span>{`状态: ${item.status}`}</span><span>{`商务: ${item.u_name}`}</span></Space>}
                                    description={<Space size={'large'}><span>{`模式: ${item.models}`}</span>{item.models === '线上平台' ? <span>{`平台: ${item.platforms}`}</span> : null}<span>{`重复名称/ID: ${samename}`}</span></Space>}
                                />
                            </List.Item>
                        )}
                    /> : null}
                </Form.Item>}
                <Form.Item label="寻找证明" name="search_pic" rules={[{ required: true, message: '不能为空' }]} >
                    <UpLoadImg title="上传寻找证明" name="寻找商机" defaultUrl={form.getFieldValue('search_pic')} setPicUrl={(value) => { form.setFieldValue('search_pic', value) }} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AEChance