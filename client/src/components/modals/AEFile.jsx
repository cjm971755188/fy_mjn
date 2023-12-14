import React, { useState, useEffect } from "react";
import request from '../../service/request';
import { Table, Modal, message, Space } from 'antd';
import UpLoadFile from '../UpLoadFile';
import FilePreview from '../FilePreview';

function AEFile(props) {
    const { id, type, isShow } = props;
    // 操作权限
    const editPower = localStorage.getItem('position') === '商务' ? true : false
    // 表格：格式
    const columns = [
        {
            title: '文件类型',
            dataIndex: 'type',
            key: 'type',
            render: (_, record) => (
                <span>{record.split('_')[3].split('.')[1]}</span>
            )
        },
        {
            title: '文件',
            dataIndex: 'url',
            key: 'url',
            render: (_, record) => (
                <FilePreview
                    fileUrl={`${record.split('/')[4]}`}
                    fileType={
                        ['jpg', 'png', 'webp'].indexOf(record.split('_')[3].split('.')[1]) !== -1 ? 'image' :
                            ['pdf'].indexOf(record.split('_')[3].split('.')[1]) !== -1 ? 'pdf' :
                                ['xlsx', 'xls', 'csv'].indexOf(record.split('_')[3].split('.')[1]) !== -1 ? 'excel' :
                                    ['doc'].indexOf(record.split('_')[3].split('.')[1]) !== -1 ? 'word' : ''
                    }
                />
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                editPower ? <Space size="middle">
                    <a onClick={() => { downloadAPI(record); }}>下载</a>{/* 
                    <Popconfirm
                        title="确认要删除该文件吗"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => {
                            deleteResourceAPI();
                        }}
                    >
                        <a>删除</a>
                    </Popconfirm> */}
                </Space> : null
            ),
        }
    ]
    // 表格：获取数据
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const getFilesAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/file/getFiles',
            data: {
                id,
                type,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    e_id: localStorage.getItem('e_id'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setLoading(false)
                    setData(res.data.data)
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
    // 上传新增
    const editTalentAPI = (operate, ori, payload) => {
        request({
            method: 'post',
            url: '/talent/editTalent',
            data: {
                tid: id,
                operate,
                ori,
                new: payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    e_id: localStorage.getItem('e_id'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    getFilesAPI()
                    message.success(res.data.msg)
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
    const editTalentModelAPI = (operate, ori, payload) => {
        request({
            method: 'post',
            url: '/talent/editTalentModel',
            data: {
                id,
                operate,
                ori,
                new: payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    e_id: localStorage.getItem('e_id'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    getFilesAPI()
                    message.success(res.data.msg)
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
    // 下载、删除
    const downloadAPI = (url) => {
        request({
            method: 'get',
            url: '/file/download',
            params: { url: url.split('/')[4] },
            responseType: 'blob'
        }).then((res) => {
            if (res.status == 200) {
                const url = window.URL.createObjectURL(
                    new Blob([res.data]),
                );
                const link = document.createElement('a');
                link.style.display = 'none';
                link.href = url;
                link.setAttribute('download', res.config.params.url.split('_')[3]);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    /* const deleteResourceAPI = (payload) => {
        request({
            method: 'post',
            url: '/resource/deleteResource',
            data: {
                ...payload,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    e_id: localStorage.getItem('e_id'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    getYearListAPI();
                    message.success(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    } */

    useEffect(() => {
        getFilesAPI();
    }, [id])

    return (
        <Modal
            title={`${type}列表`}
            open={isShow}
            onOk={() => { props.onOK(); }}
            onCancel={() => { props.onCancel(); }}
        >
            <UpLoadFile
                type={type}
                setFile={(value) => {
                    if (value.length !== 0) {
                        if (type.match('年框')) {
                            editTalentAPI(`新增${type}`, data && data.length === 0 ? null : JSON.stringify(data), {
                                yearbox_files: JSON.stringify(data && data.concat(value))
                            });
                        } else {
                            editTalentModelAPI(`新增${type}`, data && data.length === 0 ? null : JSON.stringify(data), {
                                tmid: id,
                                model_files: JSON.stringify(data && data.concat(value))
                            });
                        }
                    }
                }}
            />
            <Table
                style={{ margin: '20px auto' }}
                rowKey={(data) => data}
                columns={columns}
                dataSource={data}
                pagination={false}
                loading={loading}
            />
        </Modal>
    )
}

export default AEFile