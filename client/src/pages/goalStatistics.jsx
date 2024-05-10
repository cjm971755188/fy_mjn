import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Col, Card, Space, Form, Row, Button, Modal, message, Select, InputNumber, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MyDateSelect from '../components/MyDateSelect'
import MyECharts from '../components/MyECharts'
import dayjs from 'dayjs'

function BaseList() {
    // 操作权限
    const editPower = (localStorage.getItem('department') === '事业部' && localStorage.getItem('company') === '总公司') || localStorage.getItem('position') === '管理员' || localStorage.getItem('position') === '总裁' ? true : false

    // 表格：获取数据、分页
    const [tableParams, setTableParams] = useState({
        filtersDate: [dayjs(), dayjs()],
        filters: {}
    });
    const [BISalemanOption, setBISalemanOption] = useState([]);
    const [BISalemanLoading, setBISalemanLoading] = useState(false);
    const getBISalemanAPI = () => {
        setBISalemanLoading(true)
        request({
            method: 'post',
            url: '/statistics/getBISaleman',
            data: {
                filtersDate: tableParams.filtersDate,
                filters: tableParams.filters,
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
                    setBISalemanOption(res.data.data)
                    setBISalemanLoading(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    // 查询、清空筛选
    const [filterForm] = Form.useForm()
    const [dateSelect, setDateSelect] = useState()
    // 用户：添加、修改、通知、删除、恢复
    const [isShow, setIsShow] = useState(false)
    const [type, setType] = useState('')
    const [form] = Form.useForm()
    const addAPI = (payload) => {
        request({
            method: 'post',
            url: `/statistics/addGoal`,
            data: {
                ...payload
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setIsShow(false);
                    form.resetFields();
                    getBISalemanAPI();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const editAPI = (payload) => {
        request({
            method: 'post',
            url: `/base/editGoal`,
            data: {
                ...payload
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setIsShow(false)
                    form.resetFields();
                    getBISalemanAPI();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    // 获取下拉框
    const [users, setUsers] = useState()
    const getUserItems = (type) => {
        request({
            method: 'post',
            url: '/user/getUserItems',
            data: {
                type,
                month: form.getFieldValue('month')
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setUsers(res.data.data)
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
        getBISalemanAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title={`商务月目标`}
                extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.setFieldValue('month', dayjs()); setType('add'); setIsShow(true); }}>添加新目标</Button> : null}
            >
                <Form
                    layout="inline"
                    form={filterForm}
                    wrapperCol={{ style: { marginBottom: '20px' } }}
                    onFinish={(values) => {
                        setTableParams({
                            filtersDate: dateSelect,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='日期选择' name='date'>
                        <MyDateSelect selectType="month" setDate={(value) => { setDateSelect(value); }} />
                    </Form.Item>
                    <Form.Item>
                        <Space size={'large'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                filterForm.resetFields();
                                setDateSelect([]);
                                setTableParams({
                                    filtersDate: [dayjs(), dayjs()],
                                    filters: {}
                                })
                            }}>清空筛选</Button>
                        </Space>
                    </Form.Item>
                </Form>
                {!BISalemanLoading ? <Row gutter={24}>
                    {BISalemanOption && BISalemanOption.map((item, key) => {
                        let proportion = (item.act / 100 / item.goal).toFixed(2)
                        return <Col span={['合计', '自然流量'].indexOf(item.name) > -1? 12 : 6} key={key} style={{ marginBottom: '20px' }}>
                            <Card><MyECharts width={'100%'} height={250} option={{
                                title: {
                                    show: true,
                                    text: `${item.name}： ${(item.act / 10000).toFixed(0)} / ${item.goal} = ${proportion}%`
                                },
                                tooltip: {
                                    formatter: '{a} <br/>{b} : {c} 万'
                                },
                                grid: {
                                    left: '5%',
                                    right: '5%'
                                },
                                series: [
                                    {
                                        type: 'gauge',
                                        center: ['50%', '70%'],
                                        radius: '100%',
                                        startAngle: 180,
                                        endAngle: 0,
                                        min: 0,
                                        max: item.goal,
                                        splitNumber: 2,
                                        itemStyle: {
                                            color: proportion < 33 ? '#f81d22' : proportion < 66 ? '#ee9900' : '#4ec990',
                                            shadowColor: proportion < 33 ? 'rgba(248, 29, 34, 0.45)' : proportion < 66 ? 'rgba(239, 165, 31, 0.45)' : 'rgba(99, 207, 157, 0.45)',
                                            shadowBlur: 10,
                                            shadowOffsetX: 2,
                                            shadowOffsetY: 2
                                        },
                                        progress: {
                                            show: true,
                                            roundCap: true,
                                            width: 18
                                        },
                                        pointer: {
                                            icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
                                            length: '40%',
                                            width: 16,
                                            offsetCenter: [0, '5%']
                                        },
                                        axisLine: {
                                            roundCap: true,
                                            lineStyle: {
                                                width: 18
                                            }
                                        },
                                        axisTick: {
                                            splitNumber: 2,
                                            lineStyle: {
                                                width: 2,
                                                color: 'auto'
                                            }
                                        },
                                        splitLine: {
                                            length: 12,
                                            lineStyle: {
                                                width: 3,
                                                color: 'auto'
                                            }
                                        },
                                        axisLabel: {
                                            distance: 30,
                                            color: 'auto',
                                            fontSize: 20
                                        },
                                        title: {
                                            show: false
                                        },
                                        detail: {
                                            width: '60%',
                                            lineHeight: 40,
                                            height: 40,
                                            offsetCenter: [0, '35%'],
                                            valueAnimation: true,
                                            formatter: function (value) {
                                                return '{value|' + value.toFixed(0) + '}{unit|万元}';
                                            },
                                            rich: {
                                                value: {
                                                    fontSize: 40,
                                                    fontWeight: 'bolder',
                                                    color: '#777'
                                                },
                                                unit: {
                                                    fontSize: 20,
                                                    color: '#777',
                                                    padding: [0, 0, -10, 10]
                                                }
                                            }
                                        },
                                        data: [
                                            {
                                                value: item.act / 10000
                                            }
                                        ]
                                    }
                                ]
                            }} /></Card>
                        </Col>
                    })}
                </Row> : null}
            </Card>
            <Modal
                title={type === 'add' ? `添加新目标` : `修改目标信息`}
                open={isShow}
                maskClosable={false}
                onOk={() => { form.submit(); }}
                onCancel={() => { setIsShow(false); form.resetFields(); }}
            >
                <Form form={form} onFinish={(values) => { type === 'add' ? addAPI(values) : editAPI(values) }}>
                    <Form.Item label='月份' name='month' rules={[{ required: true, message: '不能为空' }]}>
                        <DatePicker picker="month" />
                    </Form.Item>
                    <Form.Item label='名称' name='name' rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={users} onClick={() => { getUserItems('bi_saleman'); }} />
                    </Form.Item>
                    <Form.Item label='月销售额目标（万）' name='goal' rules={[{ required: true, message: '不能为空' }]}>
                        <InputNumber placeholder="请输入" min={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}

export default BaseList