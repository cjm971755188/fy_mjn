import React from "react";
import { useNavigate } from 'react-router-dom'
import request from '../service/request'
import { Col, Row, Card, Button, Form, Input, message } from 'antd';
import logo from '../assets/logo_white.jpg'

function Login() {
    const navigate = useNavigate()
    // 登录
    const loginAPI = (payload) => {
        request({
            method: 'post',
            url: '/user/login',
            data: payload
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    localStorage.setItem('uid', res.data.data.uid)
                    localStorage.setItem('name', res.data.data.name)
                    localStorage.setItem('phone', res.data.data.phone)
                    localStorage.setItem('company', res.data.data.company)
                    localStorage.setItem('department', res.data.data.department)
                    localStorage.setItem('position', res.data.data.position)
                    localStorage.setItem('e_id', res.data.data.e_id)
                    localStorage.setItem('up_uid', res.data.data.up_uid)
                    message.success('登录成功')
                    navigate('/admin/data/statistics')
                } else if (res.data.code == 202) {
                    navigate('/login')
                    message.error(res.data.msg)
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    }
    return (
        <Row>
            <Col
                md={{ span: 8, push: 8 }}
                xs={{ span: 22, push: 1 }}
            >
                <img src={logo} style={{ width: '300px', display: 'block', borderRadius: '15px', margin: '40px auto' }} />
                <Card title='慕江南销售管理系统' headStyle={{textAlign: 'center'}}>
                    <Form
                        labelCol={{ md: { span: 4 } }}
                        onFinish={(values) => { loginAPI(values); }}
                        onFinishFailed={(errorInfo) => { console.log('Failed:', errorInfo) }}
                    >
                        <Form.Item label="手机号" name="phone" rules={[ { required: true, message: '不能为空' } ]}>
                            <Input placeholder="请输入手机号" />
                        </Form.Item>
                        <Form.Item label="密码" name="password" rules={[ { required: true, message: '不能为空' } ]}>
                            <Input.Password placeholder="请输入密码" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ margin: '0 auto', display: 'block' }}>
                                登录
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    )
}

export default Login