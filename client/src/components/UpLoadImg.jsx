import React, { useState, Fragment } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};
const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
};

function UpLoadImg(props) {
    // 上传状态
    const [loading, setLoading] = useState(false);
    // 上传后的地址
    const [imageUrl, setImageUrl] = useState();
    const handleChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, (url) => {
                setLoading(false);
                setImageUrl(url);
            });
            props.setPicUrl(info.file.response.url);
        }
    };
    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div
                style={{
                    marginTop: 8,
                }}
            >
                {props.title}
            </div>
        </div>
    );
    return (
        <Fragment>
            <Upload
                name={props.name}
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                // 上传的后端地址
                action="http://localhost:3000/api/uploadimg"
                beforeUpload={beforeUpload}
                onChange={handleChange}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="avatar"
                        style={{
                            width: '100%',
                        }}
                    />
                ) : (
                    uploadButton
                )}
            </Upload>
        </Fragment>
    );
};
export default UpLoadImg;