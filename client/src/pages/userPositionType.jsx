import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, message } from 'antd';
import request from '../service/request'

const columns = [
    {
        title: '编号',
        dataIndex: 'up_id',
        key: 'up_id',
    },
    {
        title: '职位名称',
        dataIndex: 'position',
        key: 'position',
    },
    {
        title: '操作',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <a>删除</a>
            </Space>
        ),
    }
]

function UserPositionType() {
    const [data, setData] = useState([{up_id: 0}]);
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const fetchData = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/user/getPositionList',
            data: {
                pagination: {
                    current: tableParams.pagination.current - 1,
                    pageSize: tableParams.pagination.pageSize,
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                setData(res.data.data)
                setLoading(false)
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: res.data.pagination.total,
                      },
                })
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

        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card
                title="职位列表"
            >
                <Table
                    rowKey={(data) => data.up_id}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    style={{ margin: '20px auto' }}
                />
            </Card>
        </div>
    )
}

export default UserPositionType