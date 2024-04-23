import React, { Fragment, useEffect, useState } from "react";
import request from '../service/request'
import { Card, DatePicker, Space, Form, Calendar, Button, Select, Popover, List, message, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'
import AELiveCalendar from "../components/modals/AELiveCalendar";

function LiveCalendar() {
    // 操作权限
    const editPower = (localStorage.getItem('department') === '事业部' && localStorage.getItem('company') !== '总公司') || localStorage.getItem('position') === '管理员' ? true : false

    // 表格：获取数据、分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filtersDate: dayjs().format('YYYY-MM'),
        filters: {}
    });
    const getLiveCalendarAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/live/getLiveCalendar',
            data: {
                filtersDate: tableParams.filtersDate,
                filters: tableParams.filters,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    up_uid: localStorage.getItem('up_uid'),
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
    const getDate = () => {
        let date = []
        for (let i = 0; i < 3; i++) {
            date.push({
                year: 2022 + i,
                months: [],
                sum: {}
            })
            for (let j = 0; j < 12; j++) {
                date[i].months.push({
                    month: 1 + j,
                    days: [],
                    sum: {}
                })
                for (let k = 0; k < dayjs(`${i}-${j}`).daysInMonth(); k++) {
                    date[i].months[j].days.push({
                        day: k,
                        items: []
                    })
                }
            }
        }
        console.log('date: ', date);
        return date
    }
    // 添加
    const [type, setType] = useState('')
    const [isShow, setIsShow] = useState(false)
    const [form] = Form.useForm()

    useEffect(() => {
        if (localStorage.getItem('uid') && localStorage.getItem('uid') === null) {
            navigate('/login')
            message.error('账号错误，请重新登录')
        }
        getLiveCalendarAPI()
        console.log(dayjs(tableParams.filtersDate).format('YYYY-MM'), dayjs(tableParams.filtersDate).daysInMonth());
    }, [JSON.stringify(tableParams)])
    return (
        <Fragment>
            <Card title="专场日历" extra={editPower ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setType('添加新专场'); setIsShow(true); }}>添加新专场</Button> : null}>
                <Form
                    layout="inline"
                    form={filterForm}
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            filtersDate: dayjs(values.month).format('YYYY-MM'),
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='年月' name='month' style={{ margin: '0 10px 10px 0' }}>
                        <DatePicker picker="month" />
                    </Form.Item>
                    <Form.Item style={{ margin: '0 10px 10px 0' }}>
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
            </Card>
            <AELiveCalendar
                isShow={isShow}
                type={type}
                form={form}
                onOK={(values) => {
                    console.log('values: ', values);
                }}
                onCancel={() => { setIsShow(false); form.resetFields(); setType(''); }}
            />
        </Fragment>
    )
}

export default LiveCalendar