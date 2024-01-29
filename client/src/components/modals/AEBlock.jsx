import React from "react";
import { Form, Input, Modal } from 'antd';

const { TextArea } = Input;

function AEBlock(props) {
    const { isShow, type, form } = props;

    return (
        <Modal
            title={type === 'add' ? '拉黑新达人' : '修改拉黑原因'}
            open={isShow}
            maskClosable={false}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); }}
        >
            <Form form={form} onFinish={(values) => {
                props.onOK(values);
            }}>
                {type === 'edit' ? <Form.Item label="编号" name="bid" rules={[{ required: true, message: '不能为空' }]}>
                    <Input disabled={true} />
                </Form.Item> : null}
                <Form.Item label="达人昵称" name="name" rules={[{ required: true, message: '不能为空' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="拉黑原因" name="note">
                    <TextArea placeholder="请输入" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AEBlock