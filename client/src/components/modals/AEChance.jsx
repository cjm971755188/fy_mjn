import React, { useEffect, useState } from "react";
import request from '../../service/request'
import { Card, Space, Form, Input, Modal, Button, Image, List, Select, message } from 'antd';
import { model, platform, liaisonType } from '../../baseData/talent'
import people from '../../assets/people.jpg'
import UpLoadImg from '../UpLoadImg'

function AEChance(props) {
    const { type, isShow, form } = props;

    const [isShowPlatform, setIsShowPlatform] = useState(false)
    const [isShowGroup, setIsShowGroup] = useState(false)
    const [isShowProvide, setIsShowProvide] = useState(false)
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

    useEffect(() => {
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
            onCancel={() => { props.onCancel(); setIsShowSearch(false); setSearchList({}); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values); }}>
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
                    <Form.Item label="相同线上达人" name="pic">
                        <Button onClick={() => {
                            if ((form.getFieldValue('account_names') && form.getFieldValue('account_names').length > 0) || (form.getFieldValue('account_ids') && form.getFieldValue('account_ids').length > 0)) {
                                let payload = {
                                    type: 'arr',
                                    cid: type == 'add' ? '' : form.getFieldValue('cid'),
                                    account_names: form.getFieldValue('account_names'),
                                    account_ids: form.getFieldValue('account_ids')
                                }
                                searchSameChanceAPI(payload)
                            } else {
                                setIsShowSearch(false)
                                setSearchList({})
                                message.error('未填写达人账号名/ID, 无法查询')
                            }
                        }}>查询</Button>
                    </Form.Item>
                    {isShowSearch && <Form.Item label="" name="pic">
                        {searchList.length > 0 ? <List
                            itemLayout="horizontal"
                            bordered
                            dataSource={searchList}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Image width={50} src={people} preview={false} />}
                                        title={<Space size={'large'}><span>{`商机编号: ${item.cid}`}</span><span>{`状态: ${item.status}`}</span><span>{`商务: ${item.name}`}</span></Space>}
                                        description={<Space size={'large'}><span>{`平台: ${item.platforms}`}</span><span>{`账号ID: ${item.account_ids}`}</span><span>{`账号名称: ${item.account_names}`}</span></Space>}
                                    />
                                </List.Item>
                            )}
                        /> : null}
                    </Form.Item>}
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
                {type == 'add' ? <Form.Item label="寻找证明" name="search_pic" rules={[{ required: true, message: '不能为空' }]} >
                    <UpLoadImg title="上传寻找证明" name="addSearchPic" setPicUrl={(value) => { form.setFieldValue('search_pic', value) }} />
                </Form.Item> : null}
            </Form>
        </Modal>
    )
}

export default AEChance