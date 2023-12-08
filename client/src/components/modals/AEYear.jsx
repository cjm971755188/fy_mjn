import React, { useState } from "react";
import request from '../../service/request';
import { Button, Modal, Form, DatePicker, Select, InputNumber, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { yearCycleType } from '../../baseData/talent'
import { BASE_URL } from '../../service/config';

function AEUser(props) {
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
            title="新增年框"
            open={isShow}
            onOk={() => { form.submit(); }}
            onCancel={() => { props.onCancel(); }}
        >
            <Form form={form} onFinish={(values) => { props.onOK(values); }}>
                {type === 'detail' ? null : <Form.Item label="达人昵称" name="tid" rules={[{ required: true, message: '不能为空' }]}>
                    <Select showSearch placeholder="请输入" options={talents} filterOption={filterOption} onChange={(value) => { searchtalentsAPI(value) }} onSearch={(value) => { searchtalentsAPI(value) }} />
                </Form.Item>}
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