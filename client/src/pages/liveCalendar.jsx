import React, { Fragment, useEffect, useState } from "react";
import { Card, Input, Badge, Calendar, Button, Alert, Form, Row, Col, message, Space, Select, InputNumber, Image, Popconfirm, List, Timeline } from 'antd';
import { UserOutlined, HomeOutlined, CarOutlined, AimOutlined, FireOutlined, SoundOutlined, SmileOutlined, DesktopOutlined, CrownOutlined } from '@ant-design/icons';
import { weeks } from "../baseData/province"

function LiveCalendar() {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filters: {},
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    // 查询、清空筛选
    const [filterForm] = Form.useForm()

    const testData = {
        month: 12,
        sumCount: 2,
        sumGMV: 500,
        days: [
            {
                day: 28,
                week: 1,
                month: 11,
                sumGMV: 150,
                items: []
            },
            {
                day: 29,
                week: 2,
                month: 11,
                sumGMV: 150,
                items: []
            },
            {
                day: 30,
                week: 3,
                month: 11,
                sumGMV: 150,
                items: []
            },
            {
                day: 31,
                week: 4,
                month: 11,
                sumGMV: 150,
                items: []
            },
            {
                day: 1,
                week: 5,
                month: 12,
                sumGMV: 600,
                items: [
                    {
                        color: 'purple',
                        children: <Fragment>
                            <Row>【09:00 - 22:00】李点点-200w</Row>
                            <Row><Space><AimOutlined />深圳<HomeOutlined />深圳直播间</Space></Row>
                            <Space><CrownOutlined />湘湘<DesktopOutlined />柴启扬<SmileOutlined />吴淋丽</Space>
                        </Fragment>
                    },
                    {
                        color: 'green',
                        children: <Fragment>
                            <Row>【18:00 - 24:00】透透糖-200w</Row>
                            <Row><Space><AimOutlined />深圳<HomeOutlined />深圳直播间</Space></Row>
                            <Space><CrownOutlined />胡莹<DesktopOutlined />柴启扬</Space>
                        </Fragment>
                    },
                    {
                        color: 'blue',
                        children: <Fragment>
                            <Row>【18:00 - 24:00】冬姐-200w</Row>
                            <Row><Space><AimOutlined />杭州<HomeOutlined />1号直播间（四楼）</Space></Row>
                            <Space><CrownOutlined />杨雯婷<DesktopOutlined />柴启扬</Space>
                        </Fragment>
                    }
                ]
            },
            {
                day: 2,
                week: 6,
                month: 12,
                sumGMV: 150,
                items: [
                    { color: 'grey', children: '123' }
                ]
            },
            {
                day: 3,
                week: 7,
                month: 12,
                sumGMV: 150,
                items: [
                    { color: 'grey', children: '123' }
                ]
            },
            {
                day: 4,
                week: 1,
                month: 12,
                sumGMV: 150,
                items: [
                    { color: 'grey', children: '123' }
                ]
            },
        ]
    }
    return (
        <Fragment>
            <Card title="排班日历">
                <Card.Grid hoverable={false} style={{ width: `100%` }}>
                    <Form layout="inline" form={filterForm}
                        onFinish={(values) => {
                            setTableParams({
                                ...tableParams,
                                filters: values
                            })
                        }}
                    >
                        <Form.Item label='编号' name='uid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                        <Form.Item label='达人昵称' name='company' style={{ marginBottom: '20px' }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label='地点' name='company' style={{ marginBottom: '20px' }}>
                            <Select style={{ width: 160 }} />
                        </Form.Item>
                        <Form.Item label='直播间' name='company' style={{ marginBottom: '20px' }}>
                            <Select style={{ width: 160 }} />
                        </Form.Item>
                        <Form.Item label='主播' name='company' style={{ marginBottom: '20px' }}>
                            <Select style={{ width: 160 }} />
                        </Form.Item>
                        <Form.Item label='中控' name='department' style={{ marginBottom: '20px' }}>
                            <Select style={{ width: 160 }} />
                        </Form.Item>
                        <Form.Item label='主商务' name='position' style={{ marginBottom: '20px' }}>
                            <Select style={{ width: 160 }} />
                        </Form.Item>
                        <Form.Item label='服务商务' name='position' style={{ marginBottom: '20px' }}>
                            <Select style={{ width: 160 }} />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: '20px' }}>
                            <Space size={'middle'}>
                                <Button type="primary" htmlType="submit">查询</Button>
                                <Button type="primary" onClick={() => {
                                    filterForm.resetFields();
                                    setTableParams({
                                        ...tableParams,
                                        filters: {}
                                    })
                                }}>清空筛选</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card.Grid>

                {weeks.map((week, index) => {
                    return (
                        <Card.Grid key={index} hoverable={false} style={{ width: `${100 / 7}%`, padding: '10px', textAlign: 'center' }}>
                            <h2>{week.label}</h2>
                        </Card.Grid>
                    )
                })}
                {testData.days.map((items, key) => {
                    return (
                        weeks.map((week, index) => {
                            if (items.week === week.value) {
                                return (
                                    <Card.Grid key={key} hoverable={items.month === 12 ? true : false} style={{ width: `${100 / 7}%`, padding: '5px' }}>
                                        <h2 style={items.month === 12 ? null : { color: '#eeeeee' }}>{items.day}</h2>
                                        {items.month === 12 ? <Alert message={`总计：${items.items.length} 场，${items.sumGMV}W 销售额`} type={items.items.length > 2 ? "error" : items.items.length > 0 ? "success" : "info"} /> : null}
                                        <Timeline style={{ marginTop: '20px' }} items={items.items} />
                                    </Card.Grid>
                                )
                            }
                        })
                    )
                })}
            </Card>
        </Fragment>
    )
}

export default LiveCalendar