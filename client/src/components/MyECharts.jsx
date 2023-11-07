import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Card } from 'antd';
import * as echarts from 'echarts';

function MyECharts(props) {
    const { option, chartsClassName, row, col, height } = props;

    const chartRef = useRef(null);

    useLayoutEffect(() => {
        const chart = chartRef.current && echarts.init(chartRef.current);
        chart && chart.setOption(option);
    }, [option]);

    //创建一个resize事件
    const echartsResize = () => {
        echarts.init(chartRef.current).resize();
    }

    //监听echartsResize函数，实现图表自适应
    window.addEventListener('resize', echartsResize);

    //页面卸载，销毁监听
    useEffect(() => {
        return () => {
            window.removeEventListener('resize', echartsResize);
        }
    }, [])

    return (
        <Card title={chartsClassName}>
            <div className={chartsClassName} ref={chartRef} style={{ width: '100%', height: height }} />
        </Card>
    )
}
export default MyECharts;