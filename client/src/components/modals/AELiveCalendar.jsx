import React, { useEffect, useState } from "react";
import request from '../../service/request'
import { Form, Input, Modal, Button, Checkbox, DatePicker, Select, Radio, InputNumber, Space, Card, Row, Popover } from 'antd';
import { PlusOutlined, MinusCircleTwoTone, InfoCircleOutlined } from '@ant-design/icons';
import { accountModelType, ageCut, priceCut, shop_type, model, middlemanPayType, talentType, gmvBelong, customPayType } from '../../baseData/talent'
import { placeType } from '../../baseData/live'
import { province } from '../../baseData/base'
import dayjs from 'dayjs'

const { TextArea } = Input;
const { RangePicker } = DatePicker;

function AELiveCalendar(props) {
    const { type, isShow, form } = props;

    const [talentsItmes, setTalentsItmes] = useState([]);
    const getTalentItemsAPI = () => {
        request({
            method: 'post',
            url: '/talent/getTalentItems',
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
    const [talentPlatforms, setTalentPlatformsItems] = useState([])
    const getTalentPlatformAPI = (tid) => {
        request({
            method: 'post',
            url: '/talent/getTalentPlatformItems',
            data: {
                tid,
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
                    setTalentPlatformsItems(res.data.data)
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
    const [platforms, setPlatforms] = useState([])
    const getPlatformItems = () => {
        request({
            method: 'post',
            url: '/base/getPlatformItems',
            data: []
        }).then((res) => {
            if (res.status === 200) {
                if (res.data.code === 200) {
                    setPlatforms(res.data.data)
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
    const [liverooms, setLiverooms] = useState('')
    const getLiveroomItems = () => {
        request({
            method: 'post',
            url: `/base/getLiveroomItems`,
            data: {}
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setLiverooms(res.data.data)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const [modelsItems, setModelsItems] = useState([])
    const getModelsItemsAPI = () => {
        request({
            method: 'post',
            url: '/talent/getModelItems',
            data: {
                tid: form.getFieldValue('tid').value ? form.getFieldValue('tid').value : form.getFieldValue('tid'),
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
    const [authorsItems, setAuthorsItems] = useState([])
    const getAuthorsItemsAPI = (type) => {
        request({
            method: 'post',
            url: '/user/getAnthorItems',
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
    const [controlsItems, setControlsItems] = useState([])
    const getControlsItemsAPI = (type) => {
        request({
            method: 'post',
            url: '/user/getControlItems',
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
    const [salemansItems, setSalemansItems] = useState([])
    const getSalemansItemsAPI = (type) => {
        request({
            method: 'post',
            url: '/user/getSalemanItems',
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
    const [salemanAssistantsItems, setSalemanAssistantsItems] = useState([])
    const getSalemanAssistantsItemsAPI = (type) => {
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
            /* form.setFieldValue('commission_normal', null);
            form.setFieldValue('commission_welfare', null);
            form.setFieldValue('commission_bao', null);
            form.setFieldValue('commission_note', null);
            form.setFieldValue('commission_normal_down', null);
            form.setFieldValue('commission_welfare_down', null);
            form.setFieldValue('commission_bao_down', null);
            form.setFieldValue('commission_note_down', null);
            form.setFieldValue('u_id_1', null);
            form.setFieldValue('u_point_1', null);
            form.setFieldValue('u_id_2', null);
            form.setFieldValue('u_point_2', null);
            form.setFieldValue('u_note', null); */
        } else {
            request({
                method: 'post',
                url: '/talent/getCommissions',
                data: {
                    tmid: value[value.length - 1],
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
                        form.setFieldsValue({
                            ...res.data.data,
                            age_cuts: res.data.data.age_cuts.split(','),
                            main_province: res.data.data.main_province.split(','),
                            u_id_1: {
                                value: res.data.data.u_id_1,
                                label: res.data.data.u_name_1
                            },
                            u_id_2: {
                                value: res.data.data.u_id_2,
                                label: res.data.data.u_name_2
                            }
                        });
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
    }

    useEffect(() => {
        getAuthorsItemsAPI(true);
        getControlsItemsAPI(true);
        getSalemansItemsAPI(true);
        getLiveroomItems();
    }, [isShow])
    return (
        <Modal
            width={"60%"}
            title={type}
            open={isShow}
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); setTalentPlatformsItems([]); setModelsItems([]); }}
        >
            <Form
                form={form}
                onFinish={(values) => {
                    console.log('submit: ', values);
                    /* props.onOK(values); */
                }}
            >
                <Form.Item label="达人昵称" name="tid" rules={[{ required: true, message: '不能为空' }]}>
                    <Select
                        showSearch
                        placeholder="请输入"
                        disabled={type === '添加新专场' ? false : true}
                        onFocus={() => { getTalentItemsAPI(); }}
                        onChange={(value) => { getTalentPlatformAPI(value); getModelsItemsAPI(); }}
                        filterOption={filterOption}
                        options={talentsItmes}
                        optionFilterProp="children"
                    />
                </Form.Item>
                {modelsItems.length === 0 ? null : <Form.Item label="合作模式" name="tmids" rules={[{ required: true, message: '不能为空' }]}>
                    <Checkbox.Group options={modelsItems} onChange={(values) => { getCommissionsAPI(values); }} />
                </Form.Item>}
                {talentPlatforms.map((item, index) => {
                    return (
                        <Form.Item label={`${item.label}`} name={`shop_${index}`} rules={[{ required: true, message: '不能为空' }]} key={index}>
                            <Checkbox.Group options={item.shops} />
                        </Form.Item>
                    )
                })}
                <Form.List name="dates">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Row key={key}>
                                    <Space size={"large"}>
                                        <Form.Item label={`时间段-${key + 1}`} {...restField} name={[name, "times"]} rules={[{ required: true, message: '不能为空' }]}>
                                            <RangePicker showTime />
                                        </Form.Item>
                                        <Form.Item label={`类型`} {...restField} name={[name, "time_type"]} rules={[{ required: true, message: '不能为空' }]}>
                                            <Radio.Group>
                                                <Radio key={0} value={"纯播"}>纯播</Radio>
                                                <Radio key={1} value={"预热"}>预热</Radio>
                                                <Radio key={2} value={"带货"}>带货</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                        <Form.Item>
                                            {type.match('修改') ? null : <MinusCircleTwoTone twoToneColor="#f74b4f" onClick={() => { remove(name); }} />}
                                        </Form.Item>
                                    </Space>
                                </Row>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    新增时间段
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                <Form.Item label="预估GMV（万）" name="goal" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                    <InputNumber placeholder="请输入" min={0} />
                </Form.Item>
                <Form.Item label="地点" name="place" rules={[{ required: true, message: '不能为空' }]}>
                    <Radio.Group>{placeType.map((item, index) => { return <Radio key={index} value={item.value}>{item.label}</Radio> })}</Radio.Group>
                </Form.Item>
                {liverooms.length === 0 ? null : <Form.Item label="直播间" name="room" rules={[{ required: true, message: '不能为空' }]}>
                    <Radio.Group>{liverooms.map((item, index) => { return <Radio key={index} value={item.value}>{item.label}</Radio> })}</Radio.Group>
                </Form.Item>}
                {type === '添加新专场' ? null : <><Form.Item label="主播" name="a_id_1" rules={[{ required: true, message: '不能为空' }]}>
                    <Radio.Group>{authorsItems.map((item, index) => { return <Radio key={index} value={item.value}>{item.label}</Radio> })}</Radio.Group>
                </Form.Item>
                    <Form.Item label="副播" name="a_id_2">
                        <Radio.Group>{[...authorsItems].map((item, index) => { return <Radio key={index} value={item.value}>{item.label}</Radio> })}</Radio.Group>
                    </Form.Item>
                    <Form.Item label="中控" name="c_id_1" rules={[{ required: true, message: '不能为空' }]}>
                        <Radio.Group>{controlsItems.map((item, index) => { return <Radio key={index} value={item.value}>{item.label}</Radio> })}</Radio.Group>
                    </Form.Item></>}
                <Form.Item label={<Popover title="定义" content={"仅服务一场专场，一般为异地商务，非固定"}> <span><InfoCircleOutlined /> 服务商务</span></Popover>} name="u_id_3">
                    <Radio.Group>{salemansItems.map((item, index) => { return <Radio key={index} value={item.value}>{item.label}</Radio> })}</Radio.Group>
                </Form.Item>

                {modelsItems.length === 0 ? null : <>
                    <Card title="达人账号信息核对" style={{ marginBottom: '20px' }}>
                        <Form.List name="fans">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key}>
                                            <Space size={"large"}>
                                                <Form.Item label={`平台-${key + 1}`} {...restField} name={[name, "platforms"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <Select style={{ width: 120 }} placeholder="请选择" options={platforms} onFocus={() => { getPlatformItems(); }} />
                                                </Form.Item>
                                                <Form.Item label={`粉丝量（万）`} {...restField} name={[name, "fans_count"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber placeholder="请输入" min={0} />
                                                </Form.Item>
                                                <Form.Item>
                                                    {type.match('修改') ? null : <MinusCircleTwoTone twoToneColor="#f74b4f" onClick={() => { remove(name); }} />}
                                                </Form.Item>
                                            </Space>
                                        </Row>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            新增平台粉丝量
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Row>
                            <Space size={"large"}>
                                <Form.Item label="平时带货人数" name="people_count" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                    <InputNumber min={0} />
                                </Form.Item>
                                <Form.Item label="直播平均在线" name="avg" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                    <InputNumber min={0} />
                                </Form.Item>
                                <Form.Item label="直播峰值在线" name="max" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                    <InputNumber min={0} />
                                </Form.Item>
                            </Space>
                        </Row>
                        <Row>
                            <Space size={"large"}>
                                <Form.Item label="女粉占比（%）" name="fe_proportion" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                    <InputNumber placeholder="请输入" min={0} max={100} />
                                </Form.Item>
                                <Form.Item label="专场平均客单价（元）" name="price_cut" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                    <Select placeholder="请选择" options={priceCut} />
                                </Form.Item>
                                <Form.Item label="粉丝年龄段" name="age_cuts" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                    <Select mode="multiple" allowClear placeholder="请选择" options={ageCut} />
                                </Form.Item>
                            </Space>
                        </Row>
                        <Form.Item label="粉丝分布区域" name="main_province" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                            <Select mode="multiple" allowClear placeholder="请选择" showSearch filterOption={filterOption} options={province} />
                        </Form.Item>
                    </Card>
                    <Card title="佣金提点核对（单位：%）" style={{ marginBottom: '20px' }}>
                        <Row>
                            <Space size={"large"}>
                                <Form.Item label="常规品 --> 线上" name="commission_normal" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                    <InputNumber min={0} max={100} />
                                </Form.Item>
                                <Form.Item label="线下" name="commission_normal_down" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }} initialValue={0}>
                                    <InputNumber min={0} max={100} />
                                </Form.Item>
                            </Space>
                        </Row>
                        <Row>
                            <Space size={"large"}>
                                <Form.Item label="福利品 --> 线上" name="commission_welfare" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                    <InputNumber min={0} max={100} />
                                </Form.Item>
                                <Form.Item label="线下" name="commission_welfare_down" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }} initialValue={0}>
                                    <InputNumber min={0} max={100} />
                                </Form.Item>
                            </Space>
                        </Row>
                        <Row>
                            <Space size={"large"}>
                                <Form.Item label="爆品 --> 线上" name="commission_bao" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                    <InputNumber min={0} max={100} />
                                </Form.Item>
                                <Form.Item label="线下" name="commission_bao_down" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }} initialValue={0}>
                                    <InputNumber min={0} max={100} />
                                </Form.Item>
                            </Space>
                        </Row>
                        <Row>
                            <Space size={"large"}>
                                <Form.Item label="特殊活动额外佣金[例：不投流、不满赠……] --> 线上" name="commission_other" labelCol={{ span: '100%' }}>
                                    <InputNumber min={0} max={100} />
                                </Form.Item>
                                <Form.Item label="线下" name="commission_other_down" labelCol={{ span: '100%' }}>
                                    <InputNumber min={0} max={100} />
                                </Form.Item>
                            </Space>
                        </Row>
                        <Form.Item label="佣金备注" name="commission_note" labelCol={{ span: '100%' }}>
                            <TextArea placeholder="请输入" maxLength={255} />
                        </Form.Item>
                        <Space size='large'>
                            <Form.Item label="主商务" name="u_id_1" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                <Select style={{ width: 160 }} placeholder="请选择" options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(true); }} />
                            </Form.Item>
                            <Form.Item label="主商务提点" name="u_point_1" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Space>
                        <Space size='large'>
                            <Form.Item label="副商务" name="u_id_2" style={{ marginLeft: '10px' }} labelCol={{ span: '100%' }}>
                                <Select style={{ width: 160 }} placeholder="请选择" options={salemanAssistantsItems} onFocus={() => { getSalemanAssistantsItemsAPI(false); }} />
                            </Form.Item>
                            <Form.Item label="副商务提点" name="u_point_2" labelCol={{ span: '100%' }}>
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Space>
                        <Form.Item label="提点备注" name="u_note" labelCol={{ span: '100%' }}>
                            <TextArea placeholder="请输入" maxLength={255} />
                        </Form.Item>
                    </Card></>}
                <Form.Item label="预热情况" name="preheat" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                    <Radio.Group>
                        <Radio key={0} value={"已预热"}>已预热</Radio>
                        <Radio key={1} value={"未预热"}>未预热</Radio>
                    </Radio.Group>
                </Form.Item>
                <Row>
                    <Space size={"large"}>
                        <Form.Item label="上场专场日期" name="last_date" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="上场专场品牌" name="last_brand" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="上场专场GMV" name="last_gmv" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                    </Space>
                </Row>
                <Row>
                    <Space size={"large"}>
                        <Form.Item label="出镜达人身高" name="height" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="出镜达人体重" name="weight" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                        <Form.Item label="出镜达人带货经验" name="experience" rules={[{ required: true, message: '不能为空' }]} labelCol={{ span: '100%' }}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                    </Space>
                </Row>
                <Form.Item label="专场备注" name="note">
                    <TextArea placeholder="请输入" maxLength={255} />
                </Form.Item>
            </Form>
        </Modal >
    )
}

export default AELiveCalendar