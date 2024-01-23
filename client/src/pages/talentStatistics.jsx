import React, { Fragment, useState, useEffect } from "react";
import request from '../service/request'
import { Row, Col, Statistic, Card, Form, Space, Button, Popover, Empty } from "antd";
import MyDateSelect from '../components/MyDateSelect'
import MyECharts from '../components/MyECharts'

function TalentStatistics() {
    // 表格：获取数据、分页
    const [tableParams, setTableParams] = useState({
        filters: {},
        filtersDate: [],
    });
    const [countData, setCountData] = useState({ chance: {}, talent: {} });
    const [countLoading, setCountLoading] = useState(false);
    const getTalentStatisticsAPI = () => {
        setCountLoading(true)
        request({
            method: 'post',
            url: '/statistics/getTalentStatistics',
            data: {
                filtersDate: tableParams.filtersDate,
                filters: tableParams.filters,
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
    const [salemansChanceOprateOption, setSalemansChanceOprateOption] = useState({ name: [] });
    const [salemansChanceOprateLoading, setSalemansChanceOprateLoading] = useState(false);
    const getSalemansChanceOprateAPI = () => {
        setSalemansChanceOprateLoading(true)
        request({
            method: 'post',
            url: '/statistics/getSalemansChanceOprate',
            data: {
                filtersDate: tableParams.filtersDate,
                filters: tableParams.filters,
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
                    setSalemansChanceOprateOption(res.data.data)
                    setSalemansChanceOprateLoading(false)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const [adReTimeDiffOption, setAdReTimeDiffOption] = useState({ advance: [], report: [] });
    const [adReTimeDiffLoading, setAdReTimeDiffLoading] = useState(false);
    const getAdReTimeDiffAPI = () => {
        setAdReTimeDiffLoading(true)
        request({
            method: 'post',
            url: '/statistics/getAdReTimeDiff',
            data: {
                filtersDate: tableParams.filtersDate,
                filters: tableParams.filters,
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
                    setAdReTimeDiffOption(res.data.data)
                    setAdReTimeDiffLoading(false)
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
                filters: tableParams.filters,
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
    const [typeTalentOption, setTypeTalentOption] = useState([]);
    const [typeTalentLoading, setTypeTalentLoading] = useState(false);
    const getTypeTalentAPI = () => {
        setTypeTalentLoading(true)
        request({
            method: 'post',
            url: '/statistics/getTypeTalent',
            data: {
                filtersDate: tableParams.filtersDate,
                filters: tableParams.filters,
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
                filters: tableParams.filters,
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
        if (localStorage.getItem('uid') && localStorage.getItem('uid') === null) {
            navigate('/login')
            message.error('账号错误，请重新登录')
        }
        getTalentStatisticsAPI();
        getSalemansChanceOprateAPI();
        getAdReTimeDiffAPI();
        getPlatformTalentAPI();
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
                            <Col span={8}><Statistic title="寻找" value={countData.chance.find || 0} suffix="个" /></Col>
                            <Col span={8}><Statistic title="推进" value={countData.chance.advance || 0} suffix="个" /></Col>
                            <Col span={8}>
                                <Popover content={
                                    <Row gutter={24} style={{ width: '600px', textAlign: 'center' }}>
                                        <Col span={8}><Statistic title="待审批" value={countData.chance.wait || 0} suffix="个" /></Col>
                                        <Col span={8}><Statistic title="通过" value={countData.chance.yes || 0} suffix="个" /></Col>
                                        <Col span={8}><Statistic title="驳回" value={countData.chance.no || 0} suffix="个" /></Col>
                                    </Row>}
                                >
                                    <Statistic title="报备" value={countData.chance.report || 0} suffix="个" />
                                </Popover>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="已合作达人 - 数量汇总">
                        <Row gutter={24} style={{ textAlign: 'center' }}>
                            <Col span={12}>
                                <Popover content={
                                    <Row gutter={24} style={{ width: '200px', textAlign: 'center' }}>
                                        <Col span={24}><Statistic title="待审批" value={countData.talent.history_wait || 0} suffix="个" /></Col>
                                    </Row>}
                                >
                                    <Statistic title="历史达人登记" value={countData.talent.history || 0} suffix="个" />
                                </Popover>
                            </Col>
                            <Col span={12}>
                                <Popover content={
                                    <Row gutter={24} style={{ width: '200px', textAlign: 'center' }}>
                                        <Col span={24}><Statistic title="待审批" value={countData.talent.cooperate_wait || 0} suffix="个" /></Col>
                                    </Row>}
                                >
                                    <Statistic title="合作中" value={countData.talent.cooperate || 0} suffix="个" />
                                </Popover>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row> : null}
            <Row gutter={24} style={{ marginTop: '20px' }}>
                <Col span={18}>
                    <Card title="各商务商机操作汇总">
                        {!salemansChanceOprateLoading ? salemansChanceOprateOption.name.length !== 0 ? <MyECharts height={625} option={{
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
                                    data: salemansChanceOprateOption.name,
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
                                    data: salemansChanceOprateOption.find
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
                                    data: salemansChanceOprateOption.advance
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
                                    data: salemansChanceOprateOption.c_report
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
                                    data: salemansChanceOprateOption.t_report
                                }
                            ]
                        }} /> : <Empty imageStyle={{ height: '250px' }} /> : null}
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="商机跟进平均用时">
                        {!adReTimeDiffLoading ? adReTimeDiffOption.advance.length !== 0 ? <MyECharts height={250} option={{
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
                                    name: '平均用时（小时）',
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
                                    data: adReTimeDiffOption.advance
                                }
                            ]
                        }} /> : <Empty imageStyle={{ height: '220px' }} /> : null}
                    </Card>
                    <Card title="商机跟进平均用时" style={{ marginTop: '20px' }}>
                        {!adReTimeDiffLoading ? adReTimeDiffOption.report.length !== 0 ? <MyECharts height={250} option={{
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
                                    name: '平均用时（小时）',
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
                                    data: adReTimeDiffOption.report
                                }
                            ]
                        }} /> : <Empty imageStyle={{ height: '220px' }} /> : null}
                    </Card>
                </Col>
            </Row>
            <Row gutter={24} style={{ marginTop: '20px' }}>
                <Col span={6}>
                    <Card title="达人合作平台比例">
                        {!platformTalentLoading ? platformTalentOption.length !== 0 ? <MyECharts height={250} option={{
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
                </Col>
                <Col span={6}>
                    <Card title="达人层级比例">
                        {!typeTalentLoading ? typeTalentOption.length !== 0 ? <MyECharts height={250} option={{
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
                        }} /> : <Empty imageStyle={{ height: '250px' }} /> : null}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="各省份达人数量地图">
                        {!provinceTalentLoading ? provinceTalentOption.data.length !== 0 ? <MyECharts height={625} option={{
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
                                /* formatter: '{b} <br />达人数量: {c} 个' // 自定义提示框的显示格式，{b} 代表区域名称，{c} 代表数据值 */
                            },
                            grid: {
                                left: '5%',
                                right: '5%'
                            },
                            series: [
                                {
                                    data: provinceTalentOption.data,
                                    geoIndex: 0,  //将空气质量的数据和第0个geo配置关联在一起
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