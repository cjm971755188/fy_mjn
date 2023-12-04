import React, { useState } from "react";
import { Button, Modal, Form, DatePicker, Select, InputNumber, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { yearCycleType } from '../../baseData/talent'
import { BASE_URL } from '../../service/config';

function AEUser(props) {
    const { type, isShow, form } = props;

    const [fileList, setFileList] = useState();
    const handleChange = (info) => {
        let newFileList = [...info.fileList];

        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        newFileList = newFileList.slice(-2);

        // 2. Read from response and show file link
        newFileList = newFileList.map((file) => {
            if (file.response) {
                // Component will show file.url as link
                file.url = file.response.url;
            }
            return file;
        });
        setFileList(newFileList);
    };

    return (
        <Modal
            title={type}
            open={isShow}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values); }}>
                <Form.Item label="付款周期" name="name" rules={[{ required: true, message: '不能为空' }]}>
                    <Select options={yearCycleType} />
                </Form.Item>
                <Form.Item label="生效日期" name="yearbox_start_date" rules={[{ required: true, message: '不能为空' }]}>
                    <DatePicker onChange={(value) => { form.setFieldValue('yearbox_start_date', value) }} />
                </Form.Item>
                <Form.Item label="付款周期" name="yearbox_cycle" rules={[{ required: true, message: '不能为空' }]}>
                    <Select options={yearCycleType} />
                </Form.Item>
                <Form.Item label="返点（%）" name="yearbox_point" rules={[{ required: true, message: '不能为空' }]}>
                    <InputNumber />
                </Form.Item>
                <Form.Item label="合同文件" name="yearbox_files" rules={[{ required: true, message: '不能为空' }]}>
                    <Upload
                        name={`${localStorage.getItem('name')}_年框_${form.getFieldValue('tid')}`}
                        action={`${BASE_URL}/file/upload`}
                        fileList={fileList}
                        onChange={handleChange}
                        multiple={true}
                    >
                        <Button icon={<UploadOutlined />}>上传文件</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AEUser