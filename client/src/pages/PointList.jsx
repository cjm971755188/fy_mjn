import React, { useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, Select, message, Alert } from 'antd';
import { model, platform } from '../baseData/talent'
import dayjs from 'dayjs'
import MyDateSelect from '../components/MyDateSelect'

function PointList() {
    // 操作权限
    const userShowPower = localStorage.getItem('position') === '商务' ? true : false
    const addPower = localStorage.getItem('position') === '商务' ? true : false
    const editPower = localStorage.getItem('position') === '商务' ? true : false

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
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
        { title: '模式', dataIndex: 'model', key: 'model' },
        { title: '平台', dataIndex: 'platform', key: 'platform' },
        { title: '店铺', dataIndex: 'shop', key: 'shop' },
        { title: '常规品/买断品', dataIndex: 'commission_1', key: 'commission_1' },
        { title: '福利品/含退货品', dataIndex: 'commission_2', key: 'commission_2' },
        { title: '爆品', dataIndex: 'commission_3', key: 'commission_3' },
        { title: '佣金/折扣备注', dataIndex: 'commission_note', key: 'commission_note' },
        { title: '年框提点', dataIndex: 'yearbox_point', key: 'yearbox_point' },
        { title: '一级中间人', dataIndex: 'm_name_1', key: 'm_name_1' },
        { title: '提点(%)', dataIndex: 'm_point_1', key: 'm_point_1' },
        { title: '二级中间人', dataIndex: 'm_name_2', key: 'm_name_2' },
        { title: '提点(%)', dataIndex: 'm_point_2', key: 'm_point_2' },
        { title: '备注', dataIndex: 'm_note', key: 'm_note' },
        { title: '主商务', dataIndex: 'u_name_1', key: 'u_name_1' },
        { title: '提点(%)', dataIndex: 'u_point_1', key: 'u_point_1' },
        { title: '副商务', dataIndex: 'u_name_2', key: 'u_name_2' },
        { title: '提点(%)', dataIndex: 'u_point_2', key: 'u_point_2' },
        { title: '原商务', dataIndex: 'u_name_0', key: 'u_name_0' },
        { title: '提点(%)', dataIndex: 'u_point_0', key: 'u_point_0' },
        { title: '备注', dataIndex: 'u_note', key: 'u_note' }
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

    useEffect(() => {
        getPointListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card title="达人结算列表">
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
                    <Form.Item label='日期选择' name='create_time' style={{ marginBottom: '20px' }}>
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
                    rowKey={(data) => `${data.tid}_${data.create_time}`}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    )
}

export default PointList