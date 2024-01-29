import React, { useEffect, useState } from "react";
import request from '../../service/request'
import { Form, Input, Modal, DatePicker, Radio, Popover, Select, List, InputNumber, Space } from 'antd';
import { placeType, roomType } from '../../baseData/live'
import dayjs from 'dayjs'

const { TextArea } = Input;

function AELive(props) {
    const { type, isShow, form } = props;

    const [talentsItmes, setTalentsItmes] = useState([]);
    const getTalentItemsAPI = () => {
        request({
            method: 'post',
            url: '/talent/getTalentItems',
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
                    setTalentsItmes(res.data.data)
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
    const [countType, setCountType] = useState(true);
    const [modelsItems, setModelsItems] = useState()
    const getModelsItemsAPI = () => {
        request({
            method: 'post',
            url: '/talent/getModelItems',
            data: {
                tid: form.getFieldValue('tid').value ? form.getFieldValue('tid').value : form.getFieldValue('tid'),
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
                    setModelsItems(res.data.data)
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
    const [authorsItems, setAuthorsItems] = useState()
    const getAuthorsItemsAPI = (type) => {
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
                    if (type) {
                        setAuthorsItems(res.data.data)
                    } else {
                        let items = [
                            { label: null, value: null },
                            ...res.data.data
                        ]
                        setAuthorsItems(items)
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
    const [controlsItems, setControlsItems] = useState()
    const getControlsItemsAPI = (type) => {
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
                    if (type) {
                        setControlsItems(res.data.data)
                    } else {
                        let items = [
                            { label: null, value: null },
                            ...res.data.data
                        ]
                        setControlsItems(items)
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
    const [salemansItems, setSalemansItems] = useState()
    const getSalemansItemsAPI = (type) => {
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
                    if (type) {
                        setSalemansItems(res.data.data)
                    } else {
                        let items = [
                            { label: null, value: null },
                            ...res.data.data
                        ]
                        setSalemansItems(items)
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
    const [salemanAssistantsItems, setSalemanAssistantsItems] = useState()
    const getSalemanAssistantsItemsAPI = (type) => {
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
                    if (type) {
                        setSalemanAssistantsItems(res.data.data)
                    } else {
                        let items = [
                            { label: null, value: null },
                            ...res.data.data
                        ]
                        setSalemanAssistantsItems(items)
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
    const getCommissionsAPI = (value) => {
        if (value.length === 0) {
            form.setFieldValue('commission_normal_on', null);
            form.setFieldValue('commission_welfare_on', null);
            form.setFieldValue('commission_bao_on', null);
            form.setFieldValue('commission_note_on', null);
            form.setFieldValue('commission_normal_down', null);
            form.setFieldValue('commission_welfare_down', null);
            form.setFieldValue('commission_bao_down', null);
            form.setFieldValue('commission_note_down', null);
            form.setFieldValue('u_id_1', null);
            form.setFieldValue('u_point_1', null);
            form.setFieldValue('u_id_2', null);
            form.setFieldValue('u_point_2', null);
        } else {
            request({
                method: 'post',
                url: '/talent/getCommissions',
                data: {
                    tmid: value[value.length - 1],
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
                        form.setFieldValue('commission_normal_on', res.data.data.commission_normal);
                        form.setFieldValue('commission_welfare_on', res.data.data.commission_welfare);
                        form.setFieldValue('commission_bao_on', res.data.data.commission_bao);
                        form.setFieldValue('commission_note_on', res.data.data.commission_note);
                        form.setFieldValue('commission_normal_down', 0);
                        form.setFieldValue('commission_welfare_down', 0);
                        form.setFieldValue('commission_bao_down', 0);
                        form.setFieldValue('commission_note_down', null);
                        form.setFieldValue('u_id_1', {
                            value: res.data.data.u_id_1,
                            label: res.data.data.u_name_1
                        });
                        form.setFieldValue('u_point_1', res.data.data.u_point_1);
                        form.setFieldValue('u_id_2', {
                            value: res.data.data.u_id_2,
                            label: res.data.data.u_name_2
                        });
                        form.setFieldValue('u_point_2', res.data.data.u_point_2);
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
        console.log('e: ', value[value.length - 1]);

    }

    useEffect(() => {
        setCountType(type.match('add') ? "单场" : form.getFieldValue('count_type'))
    }, [isShow])
    return (
        <Modal
            width={"40%"}
            title={type.match('add') ? "添加新专场" : "修改专场信息"}
            open={isShow}
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values); }}>
                <Form.Item label="达人昵称" name="tid" rules={[{ required: true, message: '不能为空' }]}>
                    <Select
                        showSearch
                        placeholder="请输入"
                        disabled={type === 'add_0' ? false : true}
                        onFocus={() => { getTalentItemsAPI(); }}
                        filterOption={filterOption}
                        options={talentsItmes}
                        optionFilterProp="children"
                    />
                </Form.Item>
                <Form.Item label="合作模式" name="tmids" rules={[{ required: true, message: '不能为空' }]}>
                    <Select mode="multiple" allowClear options={modelsItems} onFocus={() => { getModelsItemsAPI(); }} onChange={(value) => { getCommissionsAPI(value) }} />
                </Form.Item>
                <Form.Item label="场次" name="count_type" rules={[{ required: true, message: '不能为空' }]}>
                    <Radio.Group onChange={(e) => { setCountType(e.target.value); }} value={countType} style={{ marginLeft: '20px' }}>
                        <Radio value={'单场'}>单场</Radio>
                        <Radio value={'多场'}>多场</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="上播时间" name="start_time" rules={[{ required: true, message: '不能为空' }]}>
                    <DatePicker showTime onChange={(value) => {
                        form.setFieldValue('start_time', value)
                        if (countType === '单场') {
                            if (value.$H < 9) {
                                form.setFieldValue('end_time', dayjs(value.add(2, 'day').format('YYYY-MM-DD')).add(3, 'hour'))
                            } else if (value.$H >= 9 && value.$H < 15) {
                                form.setFieldValue('end_time', dayjs(value.add(2, 'day').format('YYYY-MM-DD')).add(22, 'hour'))
                            } else {
                                form.setFieldValue('end_time', dayjs(value.add(3, 'day').format('YYYY-MM-DD')).add(3, 'hour'))
                            }
                        }
                    }} />
                </Form.Item>
                {countType === '单场' ? null : <Form.Item label="最后一场上播时间" name="start_time_2" rules={[{ required: true, message: '不能为空' }]}>
                    <DatePicker showTime onChange={(value) => {
                        if (value.$H < 9) {
                            form.setFieldValue('end_time', dayjs(value.add(2, 'day').format('YYYY-MM-DD')).add(3, 'hour'))
                        } else if (value.$H >= 9 && value.$H < 15) {
                            form.setFieldValue('end_time', dayjs(value.add(2, 'day').format('YYYY-MM-DD')).add(22, 'hour'))
                        } else {
                            form.setFieldValue('end_time', dayjs(value.add(3, 'day').format('YYYY-MM-DD')).add(3, 'hour'))
                        }
                    }} />
                </Form.Item>}
                <Form.Item label="最终下播时间" name="end_time_0" rules={[{ required: true, message: '不能为空' }]}>
                    <DatePicker showTime onChange={(value) => { form.setFieldValue('end_time_0', value) }} />
                </Form.Item>
                <Popover title="核算规则" content={
                    <List style={{ marginLeft: '10px' }}>
                        <List.Item>{`前提： 若有多场，则取最后一场的上播时间`}</List.Item>
                        <List.Item>{`1. 上播时间早于 09:00 ----> 下播时间为 后天的凌晨3点`}</List.Item>
                        <List.Item>{`2. 上播时间为 09:00 ~ 15:00 ----> 下播时间为 后天的22点`}</List.Item>
                        <List.Item>{`3. 上播时间晚于 15:00 ----> 下播时间为 大后天的凌晨3点`}</List.Item>
                    </List>}
                >
                    <Form.Item label="核算结束时间" name="end_time" rules={[{ required: true, message: '不能为空' }]}>
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
                    <Select placeholder="请选择" options={authorsItems} onFocus={() => { getAuthorsItemsAPI(true); }} />
                </Form.Item>
                <Form.Item label="副播" name="a_id_2">
                    <Select placeholder="请选择" options={authorsItems} onFocus={() => { getAuthorsItemsAPI(false); }} />
                </Form.Item>
                <Form.Item label="中控" name="c_id_1" rules={[{ required: true, message: '不能为空' }]}>
                    <Select placeholder="请选择" options={controlsItems} onFocus={() => { getControlsItemsAPI(true); }} />
                </Form.Item>
                <Form.Item label="服务商务" name="u_id_3" >
                    <Select placeholder="请选择" options={salemansItems} onFocus={() => { getSalemansItemsAPI(false); }} />
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
                    <TextArea placeholder="请输入" />
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
                    <TextArea placeholder="请输入" />
                </Form.Item>
                <Space size='large'>
                    <Form.Item label="主商务" name="u_id_1" rules={[{ required: true, message: '不能为空' }]} >
                        <Select style={{ width: 160 }} placeholder="请选择" options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(true); }} />
                    </Form.Item>
                    <Form.Item label="主商务提成点（%）[例：0.5]" name="u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber min={0} max={100} />
                    </Form.Item>
                </Space>
                <Space size='large'>
                    <Form.Item label="副商务" name="u_id_2" >
                        <Select style={{ width: 160 }} placeholder="请选择" options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(false); }} />
                    </Form.Item>
                    <Form.Item label="副商务提成点（%）[例：0.5]" name="u_point_2" >
                        <InputNumber min={0} max={100} />
                    </Form.Item>
                </Space>
                <Form.Item label="商务提成备注" name="u_note">
                    <TextArea placeholder="请输入" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AELive