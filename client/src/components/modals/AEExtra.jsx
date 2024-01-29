import React, { useEffect, useState } from "react";
import request from '../../service/request'
import { Form, Input, Modal, Select, DatePicker, InputNumber, Card, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { extraPayType, productType } from '../../baseData/talent'

function AEExtra(props) {
    const { isShow, type, form } = props;

    const [talentsItmes, setTalentsItmes] = useState([]);
    const getTalentItemsAPI = () => {
        request({
            method: 'post',
            url: '/talent/getTalentItems',
            data: {
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
                    setTalentsItmes(res.data.data)
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
    const filterOption = (input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    const [modelsItems, setModelsItems] = useState();
    const getModelsItemsAPI = () => {
        request({
            method: 'post',
            url: '/talent/getModelItems',
            data: {
                tid: form.getFieldValue('tid') ? form.getFieldValue('tid').value ? form.getFieldValue('tid').value : form.getFieldValue('tid') : null,
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
                    setModelsItems(res.data.data)
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

    // 重置
    const reset = () => {
        setTalentsItmes([]);
        setModelsItems();
    }

    useEffect(() => {
        
    }, [isShow])
    return (
        <Modal
            title={type === 'add' ? '添加新额外结佣' : '修改额外结佣信息'}
            open={isShow}
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); reset(); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values); reset(); }}>
                <Form.Item label="结佣月份" name="month" rules={[{ required: true, message: '不能为空' }]}>
                    <DatePicker picker="month" onChange={(value) => { form.setFieldValue('month', value) }} />
                </Form.Item>
                <Form.Item label="业绩区间" name="area" rules={[{ required: true, message: '不能为空' }]}>
                    <Select placeholder="请选择" options={extraPayType} />
                </Form.Item>
                <Form.Item label="达人昵称" name="tid" rules={[{ required: true, message: '不能为空' }]}>
                    <Select
                        showSearch
                        placeholder="请输入"
                        disabled={type === 'add' ? false : true}
                        onFocus={() => { getTalentItemsAPI(); }}
                        filterOption={filterOption}
                        options={talentsItmes}
                        optionFilterProp="children"
                    />
                </Form.Item>
                <Form.Item label="合作模式" name="tmids" rules={[{ required: true, message: '不能为空' }]}>
                    <Select mode="multiple" allowClear options={modelsItems} onFocus={() => { getModelsItemsAPI(); }} />
                </Form.Item>
                <Form.List name="rules">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card key={key} title={`第 ${name + 1} 条规则：`} extra={<MinusCircleOutlined onClick={() => remove(name)} />} style={{ marginBottom: '20px' }}>
                                    <Form.Item label="商品类型/款号" {...restField} name={[name, "type"]} rules={[{ required: true, message: '不能为空' }]}>
                                        <Select mode="tags" allowClear placeholder="请输入" onChange={(value) => { form.setFieldValue('type', value) }} options={productType} />
                                    </Form.Item>
                                    <Form.Item label="额外结佣点（%）" {...restField} name={[name, "point"]} rules={[{ required: true, message: '不能为空' }]}>
                                        <InputNumber placeholder="请输入" min={0} max={100} />
                                    </Form.Item>
                                </Card>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    添加新规则
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    )
}

export default AEExtra