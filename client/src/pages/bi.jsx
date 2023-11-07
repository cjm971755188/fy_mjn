import React from "react";
import { Row, Col } from 'antd';
import MyECharts from "../components/MyECharts"

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

function BI() {
    return (
        <Row gutter={24}>
            <Col span={8}>
                <MyECharts option={option} chartsClassName="测试" height={300} />
            </Col>
            <Col span={8}>
                <MyECharts option={option} chartsClassName="测试" height={300} />
            </Col>
            <Col span={8}>
                <MyECharts option={option} chartsClassName="测试" height={300} />
            </Col>
        </Row>
    )
}

export default BI