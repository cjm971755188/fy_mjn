import React, { useState } from "react";
import request from '../../service/request';
import { Button, Modal, Form, DatePicker, Select, InputNumber, message, Input, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { yearCycleType, yearType1, yearType2, yearType3 } from '../../baseData/talent'

function AEYear(props) {
    const { type, isShow, form } = props;

    const [talents, setTalents] = useState(false)
    const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
    const searchtalentsAPI = (value) => {
        request({
            method: 'post',
            url: '/talent/searchtalents',
            data: {
                value: value,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setTalents(res.data.data)
                } else {
                    message.error(res.data.msg)
                }
            } else {
                message.error(res.data.msg)
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    const [cycleType, setCycleType] = useState();
    const [yearType, setYearType] = useState('');

    return (
        <Modal
            title="新增年框"
            open={isShow}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); setYearType(''); }}
        >
            <Form form={form} onFinish={(values) => {
                console.log('values: ', values);
                let z = 0
                if (values.yearbox_lavels === null) {
                    message.error('年框提点，信息缺失！')
                    z++
                } else if (values.yearbox_lavels.length === 0) {
                    message.error('年框提点，信息缺失！')
                    z++
                }
                if (z === 0) {
                    let v = {
                        ...values,
                        yearbox_lavels_base: values.yearbox_lavels_base ? values.yearbox_lavels_base : null
                    }
                    props.onOK(v);
                    setYearType('');
                }
            }}>
                {type === 'detail' ? null : <Form.Item label="达人昵称" name="tid" rules={[{ required: true, message: '不能为空' }]}>
                    <Select showSearch placeholder="请输入" options={talents} filterOption={filterOption} onChange={(value) => { searchtalentsAPI(value) }} onSearch={(value) => { searchtalentsAPI(value) }} />
                </Form.Item>}
                <Form.Item label="生效日期" name="yearbox_start_date" rules={[{ required: true, message: '不能为空' }]}>
                    <DatePicker onChange={(value) => { form.setFieldValue('yearbox_start_date', value) }} />
                </Form.Item>
                <Form.Item label="付款周期" name="yearbox_cycle" rules={[{ required: true, message: '不能为空' }]}>
                    <Select options={yearCycleType} onChange={(value) => { setCycleType(value); form.setFieldValue('yearbox_type', null); form.setFieldValue('yearbox_lavels', null); form.setFieldValue('yearbox_lavels_base', null); setYearType(''); }} />
                </Form.Item>
                <Form.Item label="类型" name="yearbox_type" rules={[{ required: true, message: '不能为空' }]}>
                    <Select
                        options={cycleType === '一年一付' ? yearType1 : (cycleType === '半年一付' || cycleType === '季度一付') ? yearType2 : (cycleType === '月度一付' || cycleType === '专场一付') ? yearType3 : null}
                        onChange={(value) => { setYearType(value); form.setFieldValue('yearbox_lavels', null); form.setFieldValue('yearbox_lavels_base', null); }}
                    />
                </Form.Item>
                {yearType.match('基础') ? <Form.Item label={yearType === '基础型' ? `每${cycleType.slice(0, 2)} 的基础提点（%）[例：0.5]` : `${cycleType.slice(0, 2)}中每个专场 的基础提点（%）[例：0.5]`} name="yearbox_lavels_base" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber min={0} max={100} />
                </Form.Item> : null}
                {yearType.match('阶梯') ? <Form.List name="yearbox_lavels">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card key={key} style={{ marginBottom: "10px" }}>
                                    <Form.Item label={`每${cycleType.slice(0, 2)}达成 成交额(万)`} {...restField} name={[name, `y_lavel_${key + 1}`]} rules={[{ required: true, message: '不能为空' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="额外提点（%）[例：0.5]" {...restField} name={[name, `y_point_${key + 1}`]} rules={[{ required: true, message: '不能为空' }]}>
                                        <InputNumber min={0} max={100} />
                                    </Form.Item>
                                    <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)}>删除</Button>
                                </Card>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    添加额外阶梯
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List> : null}
            </Form>
        </Modal>
    )
}

export default AEYear