import React, { useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Select, message, Alert, Tag, Popover, List } from 'antd';
import { VerticalAlignBottomOutlined, PauseCircleTwoTone, StopTwoTone } from '@ant-design/icons';
import { model, platform } from '../baseData/talent'
import dayjs from 'dayjs'
import FileSaver from 'file-saver'
import MyDateSelect from '../components/MyDateSelect'

function PointList() {
    // 操作权限
    const exportPower = localStorage.getItem('department') === '财务部' ? true : false

    // 表格：格式
    let columns = [
        {
            title: '开始时间',
            dataIndex: 'create_time',
            key: 'create_time',
            render: (_, record) => (
                <span>{dayjs(Number(record.create_time)).format('YYYY-MM-DD HH:mm:ss')}</span>
            )
        },
        { title: '模式', dataIndex: 'model', key: 'model' },
        { title: '平台', dataIndex: 'platform', key: 'platform' },
        { title: '店铺', dataIndex: 'shop', key: 'shop' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        {
            title: '变动操作',
            dataIndex: 'operate',
            key: 'operate',
            render: (_, record) => (
                <span>{record.operate.match('达人移交') ? '达人移交' : record.operate}</span>
            )
        },
        {
            title: '佣金折扣',
            dataIndex: 'commission',
            key: 'commission',
            render: (_, record) => (
                <Popover title="佣金详情" content={
                    <List>
                        {record.commission_1 === null ? null : <List.Item>常规品：{record.commission_1}%</List.Item>}
                        {record.commission_2 === null ? null : <List.Item>福利品：{record.commission_2}%</List.Item>}
                        {record.commission_3 === null ? null : <List.Item>爆品：{record.commission_3}%</List.Item>}
                        {record.commission_4 === null ? null : <List.Item>买断品：{record.commission_4}折</List.Item>}
                        {record.commission_5 === null ? null : <List.Item>含退货品：{record.commission_5}折</List.Item>}
                        <List.Item>备注：{record.commission_note}</List.Item>
                    </List>
                }>
                    {record.commission_1 === null ? null : <Tag>{`常规品( ${record.commission_1}% )`}</Tag>}
                    {record.commission_2 === null ? null : <Tag>{`福利品( ${record.commission_2}% )`}</Tag>}
                    {record.commission_3 === null ? null : <Tag>{`爆品( ${record.commission_3}% )`}</Tag>}
                    {record.commission_4 === null ? null : <Tag>{`买断品( ${record.commission_4}折 )`}</Tag>}
                    {record.commission_5 === null ? null : <Tag>{`含退货品( ${record.commission_5}折 )`}</Tag>}
                </Popover>
            )
        },
        {
            title: '中间人',
            dataIndex: 'middleman',
            key: 'middleman',
            render: (_, record) => (
                <Popover title="提点备注" content={
                    <List>
                        {record.m_name_1 === null ? null : <List.Item>一级中间人：{record.m_name_1}</List.Item>}
                        {record.m_name_1 === null ? null : <List.Item>一级中间人提点：{record.m_point_1}%</List.Item>}
                        {record.m_name_2 === null ? null : <List.Item>二级中间人：{record.m_name_2}</List.Item>}
                        {record.m_name_2 === null ? null : <List.Item>二级中间人提点：{record.m_point_2}%</List.Item>}
                        <List.Item>备注：{record.m_note}</List.Item>
                    </List>
                }>
                    {record.m_name_1 === null ? null : <Tag>{`${record.m_name_1}( ${record.m_point_1}% )`}</Tag>}
                    {record.m_name_2 === null ? null : <Tag>{`${record.m_name_2}( ${record.m_point_2}% )`}</Tag>}
                </Popover>
            )
        },
        {
            title: '商务',
            dataIndex: 'middleman',
            key: 'middleman',
            render: (_, record) => (
                <Popover title="提点备注" content={
                    <List>
                        {record.u_name_1 === null ? null : <List.Item>主商务：{record.u_name_1}</List.Item>}
                        {record.u_name_1 === null ? null : <List.Item>主商务提点：{record.u_point_1}%</List.Item>}
                        {record.u_name_2 === null ? null : <List.Item>副商务：{record.u_name_2}</List.Item>}
                        {record.u_name_2 === null ? null : <List.Item>副商务提点：{record.u_point_2}%</List.Item>}
                        {record.u_name_0 === null ? null : <List.Item>原商务：{record.u_name_0}</List.Item>}
                        {record.u_name_0 === null ? null : <List.Item>原商务提点：{record.u_point_0}%</List.Item>}
                        <List.Item>备注：{record.u_note}</List.Item>
                    </List>
                }>
                    {record.u_name_1 === null ? null : <Tag>{`${record.u_name_1}( ${record.u_point_1}% )`}</Tag>}
                    {record.u_name_2 === null ? null : <Tag>{`${record.u_name_2}( ${record.u_point_2}% )`}</Tag>}
                    {record.u_name_0 === null ? null : <Tag>{`${record.u_name_0}( ${record.u_point_0}% )`}</Tag>}
                </Popover>
            )
        },
        {
            title: '年框状态',
            dataIndex: 'yearbox_start_date',
            key: 'yearbox_start_date',
            render: (_, record) => (
                record.yearbox_start_date === null ? <Space size="small">
                    <StopTwoTone twoToneColor="#999999" /><span>暂无</span>
                </Space> : <Popover title="提点备注" content={
                    <List style={{ marginLeft: '10px' }}>
                        {record.yearbox_lavels_base !== null ? <List.Item key={0}>0：每个专场基础提点 {record.yearbox_lavels_base}% 【一专场一付】</List.Item> : null}
                        {JSON.parse(record.yearbox_lavels) && JSON.parse(record.yearbox_lavels).length > 0 && JSON.parse(record.yearbox_lavels).map((item, index) => {
                            return (
                                <List.Item key={index + 1}>{index + 1}：每{record.yearbox_cycle.slice(0, 2)}成交额达到 {item[`y_lavel_${index + 1}`]}万，提点 {item[`y_point_${index + 1}`]}%</List.Item>
                            )
                        })}
                    </List>
                }>
                    <Space size="small">
                        <PauseCircleTwoTone twoToneColor="#4ec990" /><span>生效中</span>
                    </Space>
                </Popover>
            )
        }
    ]
    // 表格：获取数据、分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filters: {},
        filtersDate: [],
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const getPointListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/point/getPointList',
            data: {
                filtersDate: tableParams.filtersDate,
                filters: tableParams.filters,
                pagination: {
                    current: tableParams.pagination.current - 1,
                    pageSize: tableParams.pagination.pageSize,
                },
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
                    setData(res.data.data)
                    setLoading(false)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: res.data.pagination.total,
                        },
                    })
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }
    // 查询、清空筛选
    const [filterForm] = Form.useForm()
    const [dateSelect, setDateSelect] = useState()

    // 导出
    let exportColumns = [
        { title: '变动时间', dataIndex: 'create_time', key: 'create_time' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        { title: '模式', dataIndex: 'model', key: 'model' },
        { title: '平台', dataIndex: 'platform', key: 'platform' },
        { title: '店铺', dataIndex: 'shop', key: 'shop' },
        { title: '常规品(%)', dataIndex: 'commission_1', key: 'commission_1' },
        { title: '福利品(%)', dataIndex: 'commission_2', key: 'commission_2' },
        { title: '爆品(%)', dataIndex: 'commission_3', key: 'commission_3' },
        { title: '买断品(折)', dataIndex: 'commission_4', key: 'commission_4' },
        { title: '含退货品(折)', dataIndex: 'commission_5', key: 'commission_5' },
        { title: '佣金折扣备注', dataIndex: 'commission_note', key: 'commission_note' },
        { title: '一级中间人', dataIndex: 'm_name_1', key: 'm_name_1' },
        { title: '一级中间人提点', dataIndex: 'm_point_1', key: 'm_point_1' },
        { title: '二级中间人', dataIndex: 'm_name_2', key: 'm_name_2' },
        { title: '二级中间人提点', dataIndex: 'm_point_2', key: 'm_point_2' },
        { title: '中间人提点备注', dataIndex: 'm_note', key: 'm_note' },
        { title: '主商务', dataIndex: 'u_name_1', key: 'u_name_1' },
        { title: '主商务提点', dataIndex: 'u_point_1', key: 'u_point_1' },
        { title: '副商务', dataIndex: 'u_name_2', key: 'u_name_2' },
        { title: '副商务提点', dataIndex: 'u_point_2', key: 'u_point_2' },
        { title: '原商务', dataIndex: 'u_name_0', key: 'u_name_0' },
        { title: '原商务提点', dataIndex: 'u_point_0', key: 'u_point_0' },
        { title: '商务提点备注', dataIndex: 'u_note', key: 'u_note' }
    ]
    const getExportPointListAPI = () => {
        request({
            method: 'post',
            url: '/point/getExportPointList',
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
                    exportTabel(res.data.data);
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const exportTabel = (exportData) => {
        let blobData = '\uFEFF' // 字节顺序标记 使用了BOM或者utf-16？
        blobData += `${exportColumns.map(item => item.title).join(',')} \n`
        exportData.forEach(item => {
            const itemData = []
            exportColumns.forEach(ele => {
                let val = item[ele.dataIndex] || null
                if ((+val).toString() === val) { // 判断当前值是否为纯数字
                    val = `\t${val.toString()}` // 纯数字加一个制表符，正常文件中不显示，但是会让excel不再特殊处理纯数字字符串
                }
                if (ele.dataIndex === 'create_time') { // 判断当前值是否为日期
                    val = `\t${dayjs(Number(val)).format('YYYY-MM-DD HH:mm:ss')}`
                }
                itemData.push(val)
            })
            
            blobData += `${itemData}\n`
        })
        const blob = new Blob([blobData], {
            // type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet’, // xlsx
            type: 'application/vnd.ms-excel;charset=utf-8', // xls
        });
        FileSaver.saveAs(blob, `提点规则导出-${+new Date()}.xls`);
    }

    useEffect(() => {
        getPointListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Card title="提点规则" extra={exportPower ? <Button type="primary" icon={<VerticalAlignBottomOutlined />} onClick={() => { getExportPointListAPI(); }}>导出</Button> : null}>
            <Form
                layout="inline"
                form={filterForm}
                onFinish={(values) => {
                    setTableParams({
                        ...tableParams,
                        filtersDate: dateSelect,
                        filters: values
                    })
                }}
            >
                <Form.Item label='开始时间' name='create_time' style={{ marginBottom: '20px' }}>
                    <MyDateSelect setDate={(value) => { setDateSelect(value); }} />
                </Form.Item>
                <Form.Item label='达人昵称' name='name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item label='模式' name='model'>
                    <Select style={{ width: 160 }} options={model} />
                </Form.Item>
                <Form.Item label='平台' name='platform'>
                    <Select style={{ width: 160 }} options={platform} />
                </Form.Item>
                <Form.Item label='店铺' name='shop'><Input /></Form.Item>
                <Form.Item label='常规/买断' name='commission_1'><Input /></Form.Item>
                <Form.Item label='福利/含退货' name='commission_2'><Input /></Form.Item>
                <Form.Item label='爆品' name='commission_3'><Input /></Form.Item>
                <Form.Item label='一级中间人' name='m_name_1' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item label='二级中间人' name='m_name_2' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item label='主商务' name='u_name_1' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item label='副商务' name='u_name_2' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item label='原商务' name='u_name_0' style={{ marginBottom: '20px' }}><Input /></Form.Item>
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
            <Alert message={`总计：${tableParams.pagination.total} 条数据`} type="info" showIcon />
            <Table
                style={{ margin: '20px auto' }}
                rowKey={(data) => `${data.tid}_${data.tmid}_${data.create_time}`}
                columns={columns}
                dataSource={data}
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </Card>
    )
}

export default PointList