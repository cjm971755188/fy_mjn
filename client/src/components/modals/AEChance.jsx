import React, { useState } from "react";
import request from '../../service/request'
import { Space, Form, Input, Modal, Button, Image, List, Select, message, Popover, Alert, Checkbox } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { modelType } from '../../baseData/talent'
import people from '../../assets/people.jpg'
import UpLoadImg from '../UpLoadImg'

const { TextArea } = Input;

function AEChance(props) {
    const { type, isShow, form } = props;

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
                    setIsShowSearch(true);
                    setSameList(res.data.data);
                    message.error(res.data.msg);
                } else {
                    if (type === 'search') {
                        setIsShowSearch(false);
                        setSameList([]);
                        message.success(res.data.msg);
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
    const [baseSets, setBaseSets] = useState([])
    const getBaseSetItems = (type) => {
        request({
            method: 'post',
            url: '/base/getBaseSetItems',
            data: {
                type
            }
        }).then((res) => {
            if (res.status === 200) {
                if (res.data.code === 200) {
                    setBaseSets(res.data.data)
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
        setSameList([]);
        setBaseSets([]);
    }

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
                        searchSameChanceAPI('finish', {
                            ...values,
                            type: 'chance',
                            search_pic: values.search_pic ? values.search_pic.join().replace('/public', '') : null
                        })
                    } else if (type === '修改联系人') {
                        props.onOK(values);
                        reset();
                    } else {
                        props.onOK({
                            ...values,
                            advance_pic: values.advance_pic ? values.advance_pic.join().replace('/public', '') : null
                        });
                        reset();
                    }
                }}
            >
                {type === '添加商机' ? <Alert message={<span>此阶段多商务可以 <b>同时报备</b> 同一个达人</span>} type="info" showIcon style={{ margin: '20px 0' }} /> :
                    type.match('推进商机') ? <Alert message={<span>此阶段遵循公司规定，给予商机 <b>15</b> 天保护机制</span>} type="info" showIcon style={{ margin: '20px 0' }} /> : null}
                {['添加商机', '修改联系人'].indexOf(type) > -1 ? null : <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '不能为空' }]}>
                    <Input disabled={true} />
                </Form.Item>}
                {!type.match('推进商机') ? <>
                    {type === '修改联系人' ? <Form.Item label="达人编号" name="tid" rules={[{ required: true, message: '不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item> : <>
                        <Form.Item label="模式" name="models" rules={[{ required: true, message: '不能为空' }]}>
                            <Checkbox.Group options={modelType} />
                        </Form.Item>
                        <Form.Item label="平台" name="platforms" rules={[{ required: true, message: '不能为空' }]}>
                            <Select mode="multiple" placeholder="请选择" options={baseSets} onClick={() => { getBaseSetItems('platform'); }} />
                        </Form.Item>
                        <Form.Item label="达人账号" name="account_names" rules={[{ required: true, message: '不能为空' }]}>
                            <Select mode="tags" allowClear placeholder="请输入" />
                        </Form.Item>
                    </>}
                    <Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={baseSets} onClick={() => { getBaseSetItems('liaison'); }} />
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
                    {type === '修改联系人' ? null : <Form.Item
                        label={<Popover title="证明方向" content={
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
                    </Form.Item>}
                </> : null}
                {['添加商机', '修改商机_待推进', '修改商机_推进驳回'].indexOf(type) > -1 ? null : <>
                    <Form.Item label="沟通群名称" name="crowd_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    {type === '延期推进商机' ? <Form.Item label="延期理由" name="delay_note" rules={[{ required: true, message: '不能为空' }]}>
                        <TextArea placeholder="请输入" maxLength={255} />
                    </Form.Item> : null}
                    {type === '修改联系人' ? null : <Form.Item
                        label={<Popover title="证明方向" content={
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
                    </Form.Item>}
                </>}
                {type.match('推进商机') || type === '修改联系人' ? null : <>
                    <Form.Item label="达人查重">
                        <Button onClick={() => {
                            if (form.getFieldValue('account_names') && form.getFieldValue('account_names').length > 0) {
                                searchSameChanceAPI('search', {
                                    cid: type === '添加商机' ? '' : form.getFieldValue('cid'),
                                    type: 'chance',
                                    account_names: form.getFieldValue('account_names')
                                });
                            } else {
                                setIsShowSearch(false);
                                setSameList([]);
                                message.error('未填写达人账号名/ID, 无法查询');
                            }
                        }}>查询</Button>
                    </Form.Item>
                    {isShowSearch && <Form.Item>
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
                                            <><span>{`模式: ${item.model}`}</span>{item.model === '线上平台' ? <span>{`平台: ${item.baseSets}`}</span> : null}<span>{`重复名称/ID: ${item.account_name}`}</span></>}</Space>}
                                    />
                                </List.Item>
                            )}
                        /> : null}
                    </Form.Item>}
                </>}
            </Form>
        </Modal>
    )
}

export default AEChance