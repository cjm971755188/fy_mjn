import React, { useState, useEffect } from "react";
import { Button, Modal, Form, DatePicker, Select, InputNumber, message, Input, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { yearCycleType, yearType1, yearType2, yearType3 } from '../../baseData/talent'
import dayjs from 'dayjs';

const { TextArea } = Input;

function AEYear(props) {
    const { type, isShow, form } = props;

    const [cycleType, setCycleType] = useState();
    const [yearType, setYearType] = useState('');

    useEffect(() => {
        setYearType(form.getFieldValue('yearbox_type') && form.getFieldValue('yearbox_type').value || '')
        setCycleType(form.getFieldValue('yearbox_cycle') && form.getFieldValue('yearbox_cycle').value || '')
    }, [isShow])
    return (
        <Modal
            title={type}
            open={isShow}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); setYearType(''); }}
        >
            <Form form={form} onFinish={(values) => {
                let z = 0
                if (values.yearbox_lavels === null) {
                    message.error('年框提点，信息缺失！')
                    z++
                } else if (values.yearbox_lavels && values.yearbox_lavels.length === 0) {
                    message.error('年框提点，信息缺失！')
                    z++
                } else if (dayjs(values.yearbox_start_date).add(1, "year") < dayjs()) {
                    message.error('年框开始生效时间超过一年，添加失败！')
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
                <Form.Item label="备注" name="yearbox_note">
                    <TextArea maxLength={500} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AEYear