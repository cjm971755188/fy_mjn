import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import request from '../service/request'
import { Card, Input, Modal, Button, Descriptions, Row, Col, message, Space } from 'antd';
import { AuditOutlined, MessageOutlined, GlobalOutlined, CrownOutlined, PlusOutlined, EditOutlined, MinusOutlined, ApiOutlined } from '@ant-design/icons';

const { TextArea } = Input;

function TalentDetail() {
    let location = useLocation();
    const { tid, type } = location.state;
    const navigate = useNavigate()
    const back = () => {
        navigate(-1) // 返回上一个路由
    }

    const getTalentDetail = () => {
        request({
            method: 'post',
            url: '/talent/getDetail',
            data: {
                tid: tid,
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
                    setDetailData(res.data.data)
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

    const [detailData, setDetailData] = useState({})

    useEffect(() => {
        getTalentDetail();
    }, [tid])
    return (
        <Fragment>
            <Row gutter={24}>
                <Col span={18}>
                    <Card title={<Space><CrownOutlined /><span>基础信息</span></Space>} style={{ marginBottom: '20px' }} extra={
                        <Space>
                            <Button onClick={() => { back(); }}>返回上级</Button>
                            <Button type="primary" icon={<ApiOutlined />} danger onClick={() => { message.info('修改年框') }}>移交</Button>
                        </Space>
                    }>
                        <Descriptions column={4} items={detailData.base} />
                    </Card>
                    <Card title={<Space><AuditOutlined /><span>年框信息</span></Space>} style={{ marginBottom: '20px' }} extra={
                        <Space>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => { message.info('添加年框') }}></Button>
                            <Button type="primary" icon={<EditOutlined />} onClick={() => { message.info('修改年框') }}></Button>
                            <Button type="primary" icon={<MinusOutlined />} danger onClick={() => { message.info('修改年框') }}></Button>
                        </Space>
                    }>
                        <Descriptions column={4} items={detailData.year} />
                    </Card>
                    <Card title={<Space><MessageOutlined /><span>联络信息</span></Space>} style={{ marginBottom: '20px' }}>
                        <Descriptions title="联系人" column={4} items={detailData.liaison} />
                        {detailData.middle1 && detailData.middle1[0].children === null ?
                            <Descriptions title="无一级中间人" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { message.info('添加年框') }}></Button>}/> : 
                            <Descriptions title="一级中间人" column={4} items={detailData.middle1} extra={
                                <Space>
                                    <Button type="primary" icon={<EditOutlined />} onClick={() => { message.info('修改年框') }}></Button>
                                    <Button type="primary" icon={<MinusOutlined />} danger onClick={() => { message.info('修改年框') }}></Button>
                                </Space>
                            } />}
                        {detailData.middle2 && detailData.middle2[0].children === null ?
                            <Descriptions title="无二级中间人" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { message.info('添加年框') }}></Button>}/> : 
                            <Descriptions title="二级中间人" column={4} items={detailData.middle2} extra={
                                <Space>
                                    <Button type="primary" icon={<EditOutlined />} onClick={() => { message.info('修改年框') }}></Button>
                                    <Button type="primary" icon={<MinusOutlined />} danger onClick={() => { message.info('修改年框') }}></Button>
                                </Space>
                            } />}
                    </Card>
                    <Card title={<Space><GlobalOutlined /><span>合作模式 ----- {detailData.models && detailData.models.length} 个</span></Space>} extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { message.info('添加年框') }}></Button>
                    }>
                        {detailData.models && detailData.models.map((model, index) => {
                            return (
                                <Card
                                    key={index}
                                    title={`${model[2].children} - ${model[3].children}`}
                                    style={{ marginBottom: '20px' }}
                                    extra={
                                        <Space>
                                            <Button type="primary" icon={<EditOutlined />} onClick={() => { message.info('添加年框') }}></Button>
                                            <Button type="primary" icon={<MinusOutlined />} danger onClick={() => { message.info('修改年框') }}></Button>
                                        </Space>
                                    }>
                                    <Descriptions column={4} items={model} />
                                </Card>

                            )
                        })}
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="达人时间线"></Card>
                </Col>
            </Row>
        </Fragment>
    )
}

export default TalentDetail