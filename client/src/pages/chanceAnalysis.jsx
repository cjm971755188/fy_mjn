import React, { useState, useEffect, Fragment } from "react";
import { Card, Row, Col, Segmented, Statistic, message, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import MyECharts from "../components/MyECharts"
import request from '../service/request'

function ChanceAnalysis() {
    const [type, setType] = useState('今天');

    // 获取头部数据
    const [loadingTop, setLoadingTop] = useState(false);
    const [topData, setTopData] = useState({});
    const getTopData = () => {
        setLoadingTop(true)
        request({
            method: 'post',
            url: '/chance/getChanceAnalysisTop',
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
                    setLoadingTop(false)
                    console.log('res.data.data: ', res.data.data);
                    setTopData(res.data.data)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    }

    // 获取商务对比
    const [loadingSaleman, setLoadingSaleman] = useState(false);
    const [salemanData, setSalemanData] = useState({});
    const getSalemanData = () => {
        setLoadingSaleman(true)
        request({
            method: 'post',
            url: '/chance/getChanceAnalysisSaleman',
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
                    setLoadingSaleman(false)
                    setSalemanData(res.data.data)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    }

    // 获取平台对比
    const [loadingPlatform, setLoadingPlatform] = useState(false);
    const [platformData, setPlatformData] = useState({});
    const getPlatformData = () => {
        setLoadingPlatform(true)
        request({
            method: 'post',
            url: '/chance/getChanceAnalysisPlatform',
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
                    setLoadingPlatform(false)
                    setPlatformData(res.data.data)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    }

    const salemanOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            }
        },
        toolbox: {
            feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                restore: { show: false },
                saveAsImage: { show: true }
            }
        },
        legend: {
            data: ['商机寻找', '商机推进', '推进成功率']
        },
        xAxis: [
            {
                type: 'category',
                data: salemanData.name,
                axisPointer: {
                    type: 'shadow'
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '商机寻找&推进',
                min: 0,
                max: 50,
                interval: 10,
                axisLabel: {
                    formatter: '{value} 个'
                }
            },
            {
                type: 'value',
                name: '推进成功率',
                min: 0,
                max: 1,
                interval: 0.2,
                axisLabel: {
                    formatter: '{value} %'
                }
            }
        ],
        series: [
            {
                name: '商机寻找',
                type: 'bar',
                tooltip: {
                    valueFormatter: function (value) {
                        return value + ' 个';
                    }
                },
                data: salemanData.search
            },
            {
                name: '商机推进',
                type: 'bar',
                tooltip: {
                    valueFormatter: function (value) {
                        return value + ' 个';
                    }
                },
                data: salemanData.advance
            },
            {
                name: '推进成功率',
                type: 'line',
                yAxisIndex: 1,
                tooltip: {
                    valueFormatter: function (value) {
                        return value + ' %';
                    }
                },
                data: salemanData.probability
            }
        ]
    };

    const platformOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            }
        },
        toolbox: {
            feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                restore: { show: false },
                saveAsImage: { show: true }
            }
        },
        legend: {
            data: ['商机寻找', '商机推进', '推进成功率']
        },
        xAxis: [
            {
                type: 'category',
                data: platformData.platform,
                axisPointer: {
                    type: 'shadow'
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '商机寻找&推进',
                min: 0,
                max: 50,
                interval: 10,
                axisLabel: {
                    formatter: '{value} 个'
                }
            },
            {
                type: 'value',
                name: '推进成功率',
                min: 0,
                max: 1,
                interval: 0.2,
                axisLabel: {
                    formatter: '{value} %'
                }
            }
        ],
        series: [
            {
                name: '商机寻找',
                type: 'bar',
                tooltip: {
                    valueFormatter: function (value) {
                        return value + ' 个';
                    }
                },
                data: platformData.search
            },
            {
                name: '商机推进',
                type: 'bar',
                tooltip: {
                    valueFormatter: function (value) {
                        return value + ' 个';
                    }
                },
                data: platformData.advance
            },
            {
                name: '推进成功率',
                type: 'line',
                yAxisIndex: 1,
                tooltip: {
                    valueFormatter: function (value) {
                        return value + ' %';
                    }
                },
                data: platformData.probability
            }
        ]
    };

    useEffect(() => {
        getTopData();
        getSalemanData();
        getPlatformData();
    }, [JSON.stringify(type)])
    return (
        <Fragment>
            <Segmented options={['今天', '本月', '今年', '全部']} style={{ marginBottom: '20px' }} onChange={(value) => { setType(value) }} />
            <Row gutter={24}>
                <Col span={6}>
                    <Card title="商机寻找">
                        <Space size="large">
                            <Statistic value={topData.searchNow ? topData.searchNow : 0} suffix="个" loading={loadingTop} />
                            {type == '全部' || topData.searchYOY == null ? null : <Statistic
                                value={topData.searchYOY}
                                precision={2}
                                valueStyle={{
                                    color: topData.searchYOY == 0 ? '#8c8c8c' : topData.searchYOY > 0 ? '#3f8600' : '#cf1322',
                                }}
                                prefix={topData.searchYOY == 0 ? <MinusOutlined /> : topData.searchYOY > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                suffix="%"
                                loading={loadingTop}
                            />}
                        </Space>
                    </Card>
                </Col><Col span={6}>
                    <Card title="寻找目标完成率">
                        <Space size="large">
                            <Statistic value={topData.searchReachNow ? topData.searchReachNow : 0} suffix="%" loading={loadingTop} />
                            {type == '全部' || topData.searchReachYOY == null ? null : <Statistic
                                value={topData.searchReachYOY}
                                precision={2}
                                valueStyle={{
                                    color: topData.searchReachYOY == 0 ? '#8c8c8c' : topData.searchReachYOY > 0 ? '#3f8600' : '#cf1322',
                                }}
                                prefix={topData.searchReachYOY == 0 ? <MinusOutlined /> : topData.searchReachYOY > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                suffix="%"
                                loading={loadingTop}
                            />}
                        </Space>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="商机推进">
                        <Space size="large">
                            <Statistic value={topData.advanceNow ? topData.advanceNow : 0} suffix="个" loading={loadingTop} />
                            {type == '全部' || topData.advanceYOY == null ? null : <Statistic
                                value={topData.advanceYOY}
                                precision={2}
                                valueStyle={{
                                    color: topData.advanceYOY == 0 ? '#8c8c8c' : topData.advanceYOY > 0 ? '#3f8600' : '#cf1322',
                                }}
                                prefix={topData.advanceYOY == 0 ? <MinusOutlined /> : topData.advanceYOY > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                suffix="%"
                                loading={loadingTop}
                            />}
                        </Space>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="推进成功率">
                        <Space size="large">
                            <Statistic value={topData.probabilityNow ? topData.probabilityNow : 0} suffix="%" loading={loadingTop} />
                            {type == '全部' || topData.probabilityYOY == null ? null : <Statistic
                                value={topData.probabilityYOY}
                                precision={2}
                                valueStyle={{
                                    color: topData.probabilityYOY == 0 ? '#8c8c8c' : topData.probabilityYOY > 0 ? '#3f8600' : '#cf1322',
                                }}
                                prefix={topData.probabilityYOY == 0 ? <MinusOutlined /> : topData.probabilityYOY > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                suffix="%"
                                loading={loadingTop}
                            />}
                        </Space>
                    </Card>
                </Col>
            </Row>
            <Row gutter={24} style={{ marginTop: '20px' }}>
                <Col span={12}>
                    <Card title="各商务对比">
                        <MyECharts option={salemanOption} height={600} loading={loadingSaleman} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="各平台对比">
                        <MyECharts option={platformOption} height={600} loading={loadingPlatform} />
                    </Card>
                </Col>
            </Row>
        </Fragment>
    )
}

export default ChanceAnalysis