import React, { useEffect, useLayoutEffect, useRef } from 'react';
import * as echarts from 'echarts';
import chinaMap from '../assets/chinaMap.json'

function MyECharts(props) {
    const { option, width, height } = props;

    const chartRef = useRef(null);

    useLayoutEffect(() => {
        const chart = chartRef.current && echarts.init(chartRef.current);
        echarts.registerMap('chinaMap', { geoJSON: chinaMap })
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
        <div ref={chartRef} style={{ padding: 0, width: width, height: height }} />
    )
}
export default MyECharts;