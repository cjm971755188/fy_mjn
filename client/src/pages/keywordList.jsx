import React, { useEffect, useState } from "react";
import request from '../service/request'
import { Card, Table, Space, Form, Input, Button, message, Alert } from 'antd';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import FileSaver from 'file-saver'

function KeywordList() {
    // 操作权限
    const exportPower = localStorage.getItem('department') === '财务部' ? true : false

    // 表格：格式
    let columns = [
        { title: '模式', dataIndex: 'model', key: 'model' },
        { title: '平台', dataIndex: 'platform', key: 'platform' },
        { title: '店铺', dataIndex: 'shop', key: 'shop' },
        { title: '关键字（账号/前后缀）', dataIndex: 'keyword', key: 'keyword' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' },
    ]
    // 表格：获取数据、分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filtersDate: [],
        filters: {},
        pagination: {
            current: 1,
            pageSize: 10,
            showTotal: ((total) => {
                return `共 ${total} 条`;
            }),
        }
    });
    const getKeywordListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/point/getKeywordList',
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
            pagination: {
                ...tableParams.pagination,
                ...pagination
            },
            filters: tableParams.filters,
            filtersDate: tableParams.filtersDate,
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }
    // 查询、清空筛选
    const [filterForm] = Form.useForm()

    // 导出
    let exportColumns = [
        { title: '模式', dataIndex: 'model', key: 'model' },
        { title: '平台', dataIndex: 'platform', key: 'platform' },
        { title: '店铺', dataIndex: 'shop', key: 'shop' },
        { title: '关键字（账号/前后缀）', dataIndex: 'keyword', key: 'keyword' },
        { title: '达人昵称', dataIndex: 'name', key: 'name' }
    ]
    const getExportListAPI = () => {
        request({
            method: 'post',
            url: '/point/getExportKeywordList',
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
                itemData.push(val)
            })
            
            blobData += `${itemData}\n`
        })
        const blob = new Blob([blobData], {
            // type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet’, // xlsx
            type: 'application/vnd.ms-excel;charset=utf-8', // xls
        });
        FileSaver.saveAs(blob, `达人昵称匹配规则导出-${+new Date()}.xls`);
    }

    useEffect(() => {
        if (localStorage.getItem('uid') && localStorage.getItem('uid') === null) {
            navigate('/login')
            message.error('账号错误，请重新登录')
        }
        getKeywordListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <Card title="达人昵称匹配规则" extra={exportPower ? <Button type="primary" icon={<VerticalAlignBottomOutlined />} onClick={() => { getExportListAPI(); }}>导出</Button> : null}>
            <Form
                layout="inline"
                form={filterForm}
                onFinish={(values) => {
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            current: 1
                        },
                        filters: values
                    })
                }}
            >
                <Form.Item label='模式' name='model' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item label='平台' name='platform' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item label='店铺' name='shop' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item label='关键字' name='keyword' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item label='达人昵称' name='name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                <Form.Item style={{ marginBottom: '20px' }}>
                    <Space size={'large'}>
                        <Button type="primary" htmlType="submit">查询</Button>
                        <Button type="primary" onClick={() => {
                            filterForm.resetFields();
                            setTableParams({
                                ...tableParams,
                                filters: {}
                            })
                        }}>清空筛选</Button>
                    </Space>
                </Form.Item>
            </Form>
            <Table
                style={{ margin: '20px auto' }}
                rowKey={(data) => `${data.tid}_${data.tmid}`}
                columns={columns}
                dataSource={data}
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </Card>
    )
}

export default KeywordList