import React, { useState } from "react";
import { Space, Select, DatePicker, TimePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
const { Option } = Select;

function MyDateSelect(props) {
    // 日期选择
    const [type, setType] = useState('date');
    const [dateValue, setDateValue] = useState();
    const PickerWithType = ({ type, onChange }) => {
        if (type === 'time') return <TimePicker locale={locale} value={dateValue} onChange={onChange} />;
        if (type === 'date') return <DatePicker locale={locale} value={dateValue} onChange={onChange} />;
        return <DatePicker locale={locale} picker={type} value={dateValue} onChange={onChange} />;
    }

    const FinnalDate = (date) => {
        if (type === 'date') {
            return [dayjs(date).format('YYYY-MM-DD'), dayjs(dayjs(date).add(1, "day")).format('YYYY-MM-DD')]
        } else if (type === 'week') {
            return [dayjs(dayjs(date).startOf("week").add(1, "day").valueOf()).format('YYYY-MM-DD'), dayjs(dayjs(date).endOf("week").add(2, "day").valueOf()).format('YYYY-MM-DD')]
        } else if (type === 'month') {
            return [dayjs(dayjs(date).startOf("month").valueOf()).format('YYYY-MM-DD'), dayjs(dayjs(date).endOf("month").add(1, "day").valueOf()).format('YYYY-MM-DD')]
        } else if (type === 'quarter') {
            return [dayjs(dayjs(date).startOf("quarter").valueOf()).format('YYYY-MM-DD'), dayjs(dayjs(date).startOf("quarter").add(3, "month").valueOf()).format('YYYY-MM-DD')]
        } else if (type === 'year') {
            return [dayjs(dayjs(date).startOf("year").valueOf()).format('YYYY-MM-DD'), dayjs(dayjs(date).endOf("year").add(1, "day").valueOf()).format('YYYY-MM-DD')]
        } else {
            return 'error'
        }
    }
    return (
        <Space>
            <Select value={type} onChange={(value) => { setType(value); setDateValue() }}>
                <Option value="date">日</Option>
                <Option value="week">周</Option>
                <Option value="month">月</Option>
                <Option value="quarter">季</Option>
                <Option value="year">年</Option>
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
