import React, { Fragment, useState, useEffect } from "react";
import request from '../service/request'
import { Row, Col, Statistic, Card, Form, Space, Button, Empty } from "antd";
import MyDateSelect from '../components/MyDateSelect'
import MyECharts from '../components/MyECharts'

function TalentStatistics() {
    // 表格：获取数据、分页
    const [tableParams, setTableParams] = useState({
        filtersDate: [],
    });
    const [countData, setCountData] = useState({ count: { chance: {}, talent: 0 }, operate: { name: [], find: [], advance: [], c_report: [], t_report: [] }, diff: { advance: [], report: [] } });
    const [countLoading, setCountLoading] = useState(false);
    const getCount = () => {
        setCountLoading(true)
        request({
            method: 'post',
            url: '/statistics/getCount',
            data: {
                filtersDate: tableParams.filtersDate,
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
                    setCountData(res.data.data)
                    setCountLoading(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const [platformTalentOption, setPlatformTalentOption] = useState([]);
    const [platformTalentLoading, setPlatformTalentLoading] = useState(false);
    const getPlatformTalentAPI = () => {
        setPlatformTalentLoading(true)
        request({
            method: 'post',
            url: '/statistics/getPlatformTalent',
            data: {
                filtersDate: tableParams.filtersDate,
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
                    setPlatformTalentOption(res.data.data)
                    setPlatformTalentLoading(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const [classTalentOption, setClassTalentOption] = useState([]);
    const [classTalentLoading, setClassTalentLoading] = useState(false);
    const getClassTalentAPI = () => {
        setClassTalentLoading(true)
        request({
            method: 'post',
            url: '/statistics/getClassTalent',
            data: {
                filtersDate: tableParams.filtersDate,
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
                    setClassTalentOption(res.data.data)
                    setClassTalentLoading(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const [typeTalentOption, setTypeTalentOption] = useState([]);
    const [typeTalentLoading, setTypeTalentLoading] = useState(false);
    const getTypeTalentAPI = () => {
        setTypeTalentLoading(true)
        request({
            method: 'post',
            url: '/statistics/getTypeTalent',
            data: {
                filtersDate: tableParams.filtersDate,
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
                    setTypeTalentOption(res.data.data)
                    setTypeTalentLoading(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const [provinceTalentOption, setProvinceTalentOption] = useState({ data: [], max: 0 });
    const [provinceTalentLoading, setProvinceTalentLoading] = useState(false);
    const getProvinceTalentAPI = () => {
        setProvinceTalentLoading(true)
        request({
            method: 'post',
            url: '/statistics/getProvinceTalent',
            data: {
                filtersDate: tableParams.filtersDate,
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
                    setProvinceTalentOption(res.data.data)
                    setProvinceTalentLoading(false)
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

    useEffect(() => {
        getCount();
        getPlatformTalentAPI();
        getClassTalentAPI();
        getTypeTalentAPI();
        getProvinceTalentAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Row>
                <Form
                    layout="inline"
                    form={filterForm}
                    onFinish={(values) => {
                        setTableParams({
                            filtersDate: dateSelect,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='日期选择' name='date' style={{ marginBottom: '20px' }}>
                        <MyDateSelect selectType="date,week,month,quarter,year" setDate={(value) => { setDateSelect(value); }} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: '20px' }}>
                        <Space size={'large'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                filterForm.resetFields();
                                setDateSelect([]);
                                setTableParams({
                                    filtersDate: [],
                                    filters: {}
                                })
                            }}>清空筛选</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Row>
            {!countLoading ? <Row gutter={24}>
                <Col span={12}>
                    <Card title="新商机 - 数量汇总">
                        <Row gutter={24} style={{ textAlign: 'center' }}>
                            <Col span={8}><Statistic title="寻找" value={countData.count.chance.find + countData.count.chance.advance + countData.count.chance.report || 0} suffix="个" /></Col>
                            <Col span={8}><Statistic title="推进" value={countData.count.chance.advance + countData.count.chance.report || 0} suffix="个" /></Col>
                            <Col span={8}><Statistic title="报备" value={countData.count.chance.report || 0} suffix="个" /></Col>
                        </Row>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="已合作达人 - 数量汇总">
                        <Row gutter={24} style={{ textAlign: 'center' }}>
                            <Col span={12}><Statistic title="历史达人登记" value={countData.count.talent || 0} suffix="个" /></Col>
                            <Col span={12}><Statistic title="合作中" value={countData.count.talent + countData.count.chance.report || 0} suffix="个" /></Col>
                        </Row>
                    </Card>
                </Col>
            </Row> : null}
            <Row gutter={24} style={{ marginTop: '20px' }}>
                <Col span={18}>
                    <Card title="各商务商机操作汇总">
                        {!countLoading ? countData.operate.name.length !== 0 ? <MyECharts width={'100%'} height={625} option={{
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'shadow'
                                }
                            },
                            legend: {},
                            grid: {
                                left: '5%',
                                right: '5%'
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    data: countData.operate.name,
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value'
                                }
                            ],
                            series: [
                                {
                                    name: '商机寻找',
                                    type: 'bar',
                                    label: {
                                        show: true
                                    },
                                    emphasis: {
                                        focus: 'series'
                                    },
                                    data: countData.operate.find
                                },
                                {
                                    name: '商机推进',
                                    type: 'bar',
                                    label: {
                                        show: true
                                    },
                                    emphasis: {
                                        focus: 'series'
                                    },
                                    data: countData.operate.advance
                                },
                                {
                                    name: '商机报备',
                                    type: 'bar',
                                    label: {
                                        show: true
                                    },
                                    emphasis: {
                                        focus: 'series'
                                    },
                                    data: countData.operate.c_report
                                },
                                {
                                    name: '历史达人录入',
                                    type: 'bar',
                                    label: {
                                        show: true
                                    },
                                    emphasis: {
                                        focus: 'series'
                                    },
                                    data: countData.operate.t_report
                                }
                            ]
                        }} /> : <Empty imageStyle={{ height: '250px' }} /> : null}
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="商机推进平均用时">
                        {!countLoading ? countData.diff.advance.length !== 0 ? <MyECharts width={'100%'} height={250} option={{
                            tooltip: {
                                trigger: 'item'
                            },
                            legend: {},
                            grid: {
                                left: '5%',
                                right: '5%'
                            },
                            series: [
                                {
                                    name: '平均用时（天）',
                                    type: 'pie',
                                    radius: ['40%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: 28,
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: countData.diff.advance
                                }
                            ]
                        }} /> : <Empty imageStyle={{ height: '220px' }} /> : null}
                    </Card>
                    <Card title="商机报备平均用时" style={{ marginTop: '20px' }}>
                        {!countLoading ? countData.diff.report.length !== 0 ? <MyECharts width={'100%'} height={250} option={{
                            tooltip: {
                                trigger: 'item'
                            },
                            legend: {},
                            grid: {
                                left: '5%',
                                right: '5%'
                            },
                            series: [
                                {
                                    name: '平均用时（天）',
                                    type: 'pie',
                                    radius: ['40%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: 28,
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: countData.diff.report
                                }
                            ]
                        }} /> : <Empty imageStyle={{ height: '220px' }} /> : null}
                    </Card>
                </Col>
            </Row>
            <Row gutter={24} style={{ marginTop: '20px' }}>
                <Col span={6}>
                    <Card title="达人合作平台比例">
                        {!platformTalentLoading ? platformTalentOption.length !== 0 ? <MyECharts width={'100%'} height={250} option={{
                            tooltip: {
                                trigger: 'item'
                            },
                            legend: {},
                            grid: {
                                left: '5%',
                                right: '5%'
                            },
                            series: [
                                {
                                    name: '达人合作模式',
                                    type: 'pie',
                                    radius: ['40%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: 28,
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: platformTalentOption
                                }
                            ]
                        }} /> : <Empty imageStyle={{ height: '250px' }} /> : null}
                    </Card>
                    <Card title="达人层级比例" style={{ marginTop: '20px' }}>
                        {!classTalentLoading ? classTalentOption.length !== 0 ? <MyECharts width={'100%'} height={250} option={{
                            tooltip: {
                                trigger: 'item'
                            },
                            legend: {},
                            grid: {
                                left: '5%',
                                right: '5%'
                            },
                            series: [
                                {
                                    name: '达人合作模式',
                                    type: 'pie',
                                    radius: ['40%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: 28,
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: classTalentOption
                                }
                            ]
                        }} /> : <Empty imageStyle={{ height: '250px' }} /> : null}
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="线上达人类型比例">
                        {!typeTalentLoading ? typeTalentOption.length !== 0 ? <MyECharts width={'100%'} height={625} option={{
                            tooltip: {
                                trigger: 'item'
                            },
                            legend: {},
                            grid: {
                                left: '5%',
                                right: '5%'
                            },
                            series: [
                                {
                                    name: '达人合作模式',
                                    type: 'pie',
                                    radius: ['40%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        show: false,
                                        position: 'center'
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            fontSize: 28,
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: false
                                    },
                                    data: typeTalentOption
                                }
                            ]
                        }} /> : <Empty imageStyle={{ height: '500px' }} /> : null}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="各省份达人数量地图">
                        {!provinceTalentLoading ? provinceTalentOption.data.length !== 0 ? <MyECharts width={'100%'} height={625} option={{
                            geo: {
                                type: 'map',
                                map: 'chinaMap', //chinaMap需要和registerMap中的第一个参数保持一致
                                roam: true, // 设置允许缩放以及拖动的效果
                                zoom: 1.2, //设置初始化的缩放比例
                                itemStyle: {
                                    normal: {
                                        areaColor: 'white'
                                    },
                                    emphasis: {
                                        areaColor: '#ffdc60',
                                    }
                                }
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: function (params) {
                                    if (params.value) {
                                        return (
                                            params.name +
                                            "<br/>" +
                                            '达人数量' +
                                            " : " +
                                            params.value
                                        );
                                    } else {
                                        return params.name + "<br/>" + '达人数量' + " : " + "0";
                                    }
                                },
                            },
                            grid: {
                                left: '5%',
                                right: '5%'
                            },
                            series: [
                                {
                                    data: provinceTalentOption.data,
                                    geoIndex: 0,
                                    type: 'map',
                                },
                            ],
                            visualMap: {
                                min: 0,
                                max: provinceTalentOption.max,
                                inRange: {
                                    color: ['white', '#f6868a'], //控制颜色渐变的范围
                                },
                            }
                        }} /> : <Empty imageStyle={{ height: '625px' }} /> : null}
                    </Card>
                </Col>
            </Row>
        </Fragment>
    )
}

export default TalentStatistics