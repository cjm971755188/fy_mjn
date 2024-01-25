import React, { useEffect, useState, Fragment } from 'react';
import { message, Upload, Modal, Button } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { BASE_URL } from '../service/config';
import dayjs from 'dayjs'

/* const getBase64 = (img, callback) => {
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
}; */
const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
});

function UpLoadImg(props) {
    /* // 上传状态
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
            props.setPicUrl(info.file.response[0].url);
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
    ); */
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState([]);
    const handleCancel = () => setPreviewOpen(false);
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };
    const handleChange = (info) => {
        let newFileList = [...info.fileList];
        let f = []
        /* newFileList = newFileList.slice(-2); */
        newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
                f.push(file.response[0].url.replace('/public', ''));
            }
            return file;
        });
        setFileList(newFileList);
        if (f.length === info.fileList.length) {
            props.setPicUrl(f);
        }
    }
    const uploadButton = (
        <Button
            style={{
                border: 0,
                background: 'none',
            }}
            type="button"
        >
            <PlusOutlined />
            <div
                style={{
                    marginTop: 8,
                }}
            >
                上传证明
            </div>
        </Button>
    );

    useEffect(() => {
        if (props.value) {
            let urls = []
            for (let i = 0; i < props.value.length; i++) {
                urls.push({
                    response: [{ url: props.value[i] }],
                    url: props.value[i]
                })
            }
            setFileList(urls)
        } else {
            setFileList([])
        }
    }, [props])
    return (
        <Fragment>
            {/* <Upload
                name={`${localStorage.getItem('name')}_${dayjs().valueOf()}_${props.name}`}
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                // 上传的后端地址
                action={`${BASE_URL}/file/upload`}
                beforeUpload={beforeUpload}
                onChange={handleChange}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="avatar"
                        style={{
                            width: '40px',
                        }}
                    />
                ) : (
                    uploadButton
                )}
            </Upload> */}
            <Upload
                // 上传的后端地址
                action={`${BASE_URL}/file/upload`}
                name={`${localStorage.getItem('name')}_${dayjs().valueOf()}_${props.name}`}
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                multiple={true}
            >
                {fileList.length >= 5 ? null : uploadButton}
            </Upload>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img
                    alt="example"
                    style={{
                        width: '100%',
                    }}
                    src={previewImage}
                />
            </Modal>
        </Fragment>
    );
};
export default UpLoadImg;