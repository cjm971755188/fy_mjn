import React, { useState, useEffect } from "react";
import { Space, Select, DatePicker, TimePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
const { Option } = Select;

function MyDateSelect(props) {
    // 日期选择
    const [type, setType] = useState();
    const [dateValue, setDateValue] = useState();
    const PickerWithType = ({ type, onChange }) => {
        if (type === 'time') return <TimePicker locale={locale} value={dateValue} onChange={onChange} />;
        if (type === 'date') return <DatePicker locale={locale} value={dateValue} onChange={onChange} />;
        return <DatePicker locale={locale} picker={type} value={dateValue} onChange={onChange} />;
    }

    const FinnalDate = (date) => {
        if (type === 'date') {
            return [dayjs(date.format('YYYY-MM-DD')).valueOf(), dayjs(date.add(1, "day").format('YYYY-MM-DD')).valueOf()]
        } else if (type === 'week') {
            return [dayjs(date.startOf("week").add(1, "day").format('YYYY-MM-DD')).valueOf(), dayjs(date.endOf("week").add(2, "day").format('YYYY-MM-DD')).valueOf()]
        } else if (type === 'month') {
            return [dayjs(date.startOf("month").format('YYYY-MM-DD')).valueOf(), dayjs(date.endOf("month").add(1, "day").format('YYYY-MM-DD')).valueOf()]
        } else if (type === 'quarter') {
            return [dayjs(date.startOf("quarter").format('YYYY-MM-DD')).valueOf(), dayjs(date.startOf("quarter").add(3, "month").format('YYYY-MM-DD')).valueOf()]
        } else if (type === 'year') {
            return [dayjs(date.startOf("year").format('YYYY-MM-DD')).valueOf(), dayjs(date.endOf("year").add(1, "day").format('YYYY-MM-DD')).valueOf()]
        } else {
            return 'error'
        }
    }

    useEffect(() => {
        setType(props.selectType);
        setDateValue(dayjs());
    }, [JSON.stringify(props.selectType)])
    return (
        <Space>
            <Select value={type} onChange={(value) => { setType(value); setDateValue() }} style={{ width: '60px' }}>
                {props.selectType && props.selectType === 'month' ? null : <Option value="week">周</Option>}
                <Option value="month">月</Option>
                {props.selectType && props.selectType === 'month' ? null : <Option value="quarter">季</Option>}
                {props.selectType && props.selectType === 'month' ? null : <Option value="year">年</Option>}
            </Select>
            <PickerWithType
                type={type}
                onChange={(value) => {
                    setDateValue(value)
                    props.setDate(FinnalDate(value))
                }} />
        </Space>
    )
}

export default MyDateSelect
