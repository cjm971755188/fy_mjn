import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Select, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import request from '../service/request'

function UserType() {
    const columns = [
        { title: '编号', dataIndex: 'ut_id', key: 'ut_id' },
        { title: '职位', dataIndex: 'type', key: 'type' }
    ]

    // 传入数据，分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filters: {},
        pagination: {}
    });
    const fetchData = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/user/getTypeList',
            data: {
                ut_id: localStorage.getItem('ut_id'),
                filters: tableParams.filters,
                pagination: {
                    current: tableParams.pagination.current - 1,
                    pageSize: tableParams.pagination.pageSize,
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

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card title="职位列表" >
                <Table
                    style={{ margin: '20px auto' }}
                    rowKey={(data) => data.ut_id}
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

export default UserType