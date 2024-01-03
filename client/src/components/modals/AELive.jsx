import React, { Fragment, useEffect, useState } from "react";
import request from '../../service/request'
import { Form, Input, Modal, DatePicker, Radio, Popover, Select, List, InputNumber, Space } from 'antd';
import { placeType, roomType } from '../../baseData/live'
import dayjs from 'dayjs'

const { TextArea } = Input;

function AELive(props) {
    const { type, isShow, form } = props;

    const [countType, setCountType] = useState(true);
    const [authorsItems, setAuthorsItems] = useState()
    const getAuthorsItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getAnthorItems',
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
                    setAuthorsItems(res.data.data)
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
    const [controlsItems, setControlsItems] = useState()
    const getControlsItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getControlItems',
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
                    setControlsItems(res.data.data)
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
    const [servicesItems, setServicesItems] = useState()
    const getServicesItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getServiceItems',
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
                    setServicesItems(res.data.data)
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
    const [salemansItems, setSalemansItems] = useState()
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

    useEffect(() => {
        form.setFieldValue('count_type', true)
    }, [isShow])
    return (
        <Modal
            width={"40%"}
            title={type === 'add' ? "添加新专场" : "修改专场信息"}
            open={isShow}
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values); }}>
                {type === 'add' ? null : <Form.Item label="编号" name="lid" rules={[{ required: true }]}>
                    <Input disabled={true} />
                </Form.Item>}
                <Form.Item label="达人昵称" name="name" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" disabled={true} />
                </Form.Item>
                <Form.Item label="合作模式" name="tmids" rules={[{ required: true, message: '不能为空' }]}>
                    <Select mode="multiple" allowClear />
                </Form.Item>
                <Form.Item label="场次" name="count_type" rules={[{ required: true, message: '不能为空' }]}>
                    <Radio.Group onChange={(e) => { setCountType(e.target.value); }} value={countType} style={{ marginLeft: '20px' }}>
                        <Radio value={true}>单场</Radio>
                        <Radio value={false}>多场</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="上播时间" name="start_time" rules={[{ required: true, message: '不能为空' }]}>
                    <DatePicker showTime onChange={(value) => {
                        form.setFieldValue('start_time', value)
                        console.log('countType: ', countType);
                        let hour = countType ? value.$H : form.getFieldValue('start_time_2').$H
                        let start = countType ? value : form.getFieldValue('start_time_2')
                        if (hour < 9) {
                            form.setFieldValue('end_time', dayjs(start.add(2, 'day').format('YYYY-MM-DD')).add(3, 'hour'))
                        } else if (hour >= 9 && hour < 15) {
                            form.setFieldValue('end_time', dayjs(start.add(2, 'day').format('YYYY-MM-DD')).add(22, 'hour'))
                        } else {
                            form.setFieldValue('end_time', dayjs(start.add(3, 'day').format('YYYY-MM-DD')).add(3, 'hour'))
                        }
                    }} />
                </Form.Item>
                {countType ? null : <Form.Item label="最后一场上播时间" name="start_time_2" rules={[{ required: true, message: '不能为空' }]}>
                    <DatePicker showTime onChange={(value) => {
                        let hour = countType ? form.getFieldValue('start_time').$H : value.$H
                        let start = countType ? form.getFieldValue('start_time') : value
                        if (hour < 9) {
                            form.setFieldValue('end_time', dayjs(start.add(2, 'day').format('YYYY-MM-DD')).add(3, 'hour'))
                        } else if (hour >= 9 && hour < 15) {
                            form.setFieldValue('end_time', dayjs(start.add(2, 'day').format('YYYY-MM-DD')).add(22, 'hour'))
                        } else {
                            form.setFieldValue('end_time', dayjs(start.add(3, 'day').format('YYYY-MM-DD')).add(3, 'hour'))
                        }
                    }} />
                </Form.Item>}
                <Popover title="下播时间结算规则" content={
                    <List style={{ marginLeft: '10px' }}>
                        <List.Item key={0}>{`前提： 若有多场，则取最后一场的上播时间`}</List.Item>
                        <List.Item key={1}>{`1. 上播时间早于 09:00 ----> 下播时间为 后天的凌晨3点`}</List.Item>
                        <List.Item key={2}>{`2. 上播时间为 09:00 ~ 15:00 ----> 下播时间为 后天的22点`}</List.Item>
                        <List.Item key={3}>{`3. 上播时间晚于 15:00 ----> 下播时间为 大后天的凌晨3点`}</List.Item>
                    </List>}
                >
                    <Form.Item label="下播时间" name="end_time" rules={[{ required: true, message: '不能为空' }]}>
                        <DatePicker showTime disabled={true} onChange={(value) => { form.setFieldValue('end_time', value) }} />
                    </Form.Item>
                </Popover>
                <Form.Item label="省份" name="place" rules={[{ required: true, message: '不能为空' }]}>
                    <Select placeholder="请选择" options={placeType} />
                </Form.Item>
                <Form.Item label="直播间" name="room" rules={[{ required: true, message: '不能为空' }]}>
                    <Select placeholder="请选择" options={roomType} />
                </Form.Item>
                <Form.Item label="主播" name="a_id_1" rules={[{ required: true, message: '不能为空' }]}>
                    <Select placeholder="请选择" options={authorsItems} onFocus={() => { getAuthorsItemsAPI(); }} />
                </Form.Item>
                <Form.Item label="副播" name="a_id_2" rules={[{ required: true, message: '不能为空' }]}>
                    <Select placeholder="请选择" options={authorsItems} onFocus={() => { getAuthorsItemsAPI(); }} />
                </Form.Item>
                <Form.Item label="中控" name="c_id_1" rules={[{ required: true, message: '不能为空' }]}>
                    <Select placeholder="请选择" options={controlsItems} onFocus={() => { getControlsItemsAPI(); }} />
                </Form.Item>
                <Form.Item label="服务商务" name="u_id_3" rules={[{ required: true, message: '不能为空' }]} >
                    <Select placeholder="请选择" options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                </Form.Item>
                <Form.Item label="预估销售额（万）" name="goal" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber placeholder="请输入" min={0} />
                </Form.Item>
                <Form.Item label="实际销售额（万）" name="sales" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber placeholder="请输入" min={0} />
                </Form.Item>
                <Form.Item label="常规品线上佣金比例（%）[例：20]" name="commission_normal_on" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber min={0} max={100} />
                </Form.Item>
                <Form.Item label="福利品线上佣金比例（%）[例：20]" name="commission_welfare_on" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber min={0} max={100} />
                </Form.Item>
                <Form.Item label="爆品线上佣金比例（%）[例：20]" name="commission_bao_on" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber min={0} max={100} />
                </Form.Item>
                <Form.Item label="线上佣金备注" name="commission_note_on">
                    <TextArea />
                </Form.Item>
                <Form.Item label="常规品线下佣金比例（%）[例：20]" name="commission_normal_down" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber min={0} max={100} />
                </Form.Item>
                <Form.Item label="福利品线下佣金比例（%）[例：20]" name="commission_welfare_down" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber min={0} max={100} />
                </Form.Item>
                <Form.Item label="爆品线下佣金比例（%）[例：20]" name="commission_bao_down" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber min={0} max={100} />
                </Form.Item>
                <Form.Item label="线下佣金备注" name="commission_note_down">
                    <TextArea />
                </Form.Item>
                <Space size='large'>
                    <Form.Item label="主商务" name="u_id_1" rules={[{ required: true, message: '不能为空' }]} >
                        <Select style={{ width: 160 }} placeholder="请选择" options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                    </Form.Item>
                    <Form.Item label="主商务提成点（%）[例：0.5]" name="u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber min={0} max={100} />
                    </Form.Item>
                </Space>
                <Space size='large'>
                    <Form.Item label="副商务" name="u_id_2" rules={[{ required: true, message: '不能为空' }]} >
                        <Select style={{ width: 160 }} placeholder="请选择" options={salemansItems} onFocus={() => { getSalemansItemsAPI(); }} />
                    </Form.Item>
                    <Form.Item label="副商务提成点（%）[例：0.5]" name="u_point_2" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber min={0} max={100} />
                    </Form.Item>
                </Space>
                <Form.Item label="商务提成备注" name="u_note">
                    <TextArea />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AELive