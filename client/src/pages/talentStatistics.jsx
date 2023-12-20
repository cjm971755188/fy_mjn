import React, { Fragment, useState } from "react";
import { Row, Col, Statistic, Card, Form, Space, Button, Alert } from "antd";
import MyDateSelect from '../components/MyDateSelect'

function TalentStatistics() {
    // 表格：获取数据、分页
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
    const [dateSelect, setDateSelect] = useState()
    return (
        <Fragment>
            <Alert type="error" showIcon message="等待确认后开发" />
            <Row>
                <Form
                    layout="inline"
                    form={filterForm}
                    onFinish={(values) => { }}
                >
                    <Form.Item label='日期选择' name='date' style={{ marginBottom: '20px' }}>
                        <MyDateSelect selectType="date,week,month,quarter,year" setDate={(value) => { setDateSelect(value); }} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: '20px' }}>
                        <Space size={'large'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                filterForm.resetFields();
                                setTableParams({
                                    ...tableParams,
                                    filtersDate: [],
                                    filters: {}
                                })
                            }}>清空筛选</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Row>
            <Row gutter={24}>
                <Col span={6}>
                    <Card title="寻找商机">
                        <Statistic value={1128} suffix="个" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="推进商机">
                        <Statistic value={1128} suffix="个" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="报备达人">
                        <Statistic value={1128} suffix="个" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="移交达人">
                        <Statistic value={1128} suffix="个" />
                    </Card>
                </Col>
            </Row>
            <Row gutter={24} style={{ marginTop: '20px' }}>
                <Col span={12}>
                    <Card title="各商务商机统计">
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="各商务达人统计">
                    </Card>
                </Col>
            </Row>
            <Row gutter={24} style={{ marginTop: '20px' }}>
            <Col span={8}>
                    <Card title="各省份达人数量地图">
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="各平台达人占比">
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="达人是否销售数量占比">
                    </Card>
                </Col>
            </Row>
        </Fragment>
    )
}

export default TalentStatistics