import React, { useState, useEffect, Fragment } from "react";
import { Card, Row, Col, Segmented, Statistic, message, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import MyECharts from "../components/MyECharts"
import request from '../service/request'

const option = {
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            data: [120, 200, 150, 80, 70, 110, 130],
            type: 'bar'
        }
    ]
};

function ChanceAnalysis() {
    const [type, setType] = useState('今日');
    const [analysisData, setAnalysisData] = useState({
        sum: {}
    });

    // 获取数据
    const [loading, setLoading] = useState(false);
    const fetchData = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/chance/getChanceAnalysis',
            data: {
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                },
                type
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setLoading(false)
                    setAnalysisData(res.data.data)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    }

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(type)])
    return (
        <Fragment>
            <Segmented options={['今日', '本月', '今年', '全部']} style={{ margin: '0 0 20px 0' }} onChange={(value) => { setType(value) }} />
            <Row gutter={24}>
                <Col span={4}>
                    <Card title="商机寻找">
                        <Space size="large">
                            <Statistic value={analysisData.sum.searchNow ? analysisData.sum.searchNow : 0} suffix="个" loading={loading} />
                            {type == '全部' || analysisData.sum.searchYOY == null ? null : <Statistic
                                value={analysisData.sum.searchYOY}
                                precision={2}
                                valueStyle={{
                                    color: analysisData.sum.searchYOY == 0 ? '#8c8c8c' : analysisData.sum.searchYOY > 0 ? '#3f8600' : '#cf1322',
                                }}
                                prefix={analysisData.sum.searchYOY == 0 ? <MinusOutlined /> : analysisData.sum.searchYOY > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                suffix="%"
                                loading={loading}
                            />}
                        </Space>
                    </Card>
                </Col>
                <Col span={4}>
                    <Card title="商机推进">
                        <Space size="large">
                            <Statistic value={analysisData.sum.advanceNow ? analysisData.sum.advanceNow : 0} suffix="个" loading={loading} />
                            {type == '全部' || analysisData.sum.advanceYOY == null ? null : <Statistic
                                value={analysisData.sum.advanceYOY}
                                precision={2}
                                valueStyle={{
                                    color: analysisData.sum.advanceYOY == 0 ? '#8c8c8c' : analysisData.sum.advanceYOY > 0 ? '#3f8600' : '#cf1322',
                                }}
                                prefix={analysisData.sum.advanceYOY == 0 ? <MinusOutlined /> : analysisData.sum.advanceYOY > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                suffix="%"
                                loading={loading}
                            />}
                        </Space>
                    </Card>
                </Col>
                <Col span={4}>
                    <Card title="推进成功率">
                        <Space size="large">
                            <Statistic value={analysisData.sum.probabilityNow ? analysisData.sum.probabilityNow : 0} suffix="%" loading={loading} />
                            {type == '全部' || analysisData.sum.probabilityYOY == null ? null : <Statistic
                                value={analysisData.sum.probabilityYOY}
                                precision={2}
                                valueStyle={{
                                    color: analysisData.sum.probabilityYOY == 0 ? '#8c8c8c' : analysisData.sum.probabilityYOY > 0 ? '#3f8600' : '#cf1322',
                                }}
                                prefix={analysisData.sum.probabilityYOY == 0 ? <MinusOutlined /> : analysisData.sum.probabilityYOY > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                suffix="%"
                                loading={loading}
                            />}
                        </Space>
                    </Card>
                </Col>
                <Col span={12}>
                    <MyECharts option={option} chartsClassName="测试" height={300} />
                </Col>
            </Row>
        </Fragment>
    )
}

export default ChanceAnalysis