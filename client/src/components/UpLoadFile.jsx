import React, { useState, Fragment } from "react";
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { BASE_URL } from '../service/config';
import dayjs from "dayjs";

function UpLoadFile(props) {
    const [fileList, setFileList] = useState();
    const handleChange = (info) => {
        let newFileList = [...info.fileList];
        let f = []
        /* newFileList = newFileList.slice(-2); */
        newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            if (file.status === "done" || file.status === "uploading") {
                f.push(`${BASE_URL}/${localStorage.getItem('name')}_${dayjs().valueOf()}_${props.type}_${file.name}`)
            }
            return file;
        });
        setFileList(newFileList);
        if (info.file.status === "done") {
            props.setFile(f)
            setFileList()
        }
    };

    return (
        <Fragment>
            <Upload
                name={`${localStorage.getItem('name')}_${dayjs().valueOf()}_${props.type}`}
                action={`${BASE_URL}/file/upload`}
                fileList={fileList}
                onChange={handleChange}
                multiple={true}
            >
                <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
        </Fragment>
    );
};
export default UpLoadFile;