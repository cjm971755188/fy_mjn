import React from "react";
import { Col, Row, Card, Button, Form, Input, message } from 'antd';
import logo from '../assets/logo_white.jpg'
import { useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate()
    return (
        <Row>
            <Col
                md={{
                    span: 8,
                    push: 8
                }}
                xs={{
                    span: 22,
                    push: 1
                }}
            >
                <img src={logo} style={{ width: '300px', display: 'block', borderRadius: '15px', margin: '40px auto' }} />
                <Card title='慕江南销售管理系统' headStyle={{textAlign: 'center'}}>
                    <Form
                        labelCol={{ md: { span: 4 } }}
                        onFinish={(values) => {
                            console.log('Success:', values);
                            message.success('success: login')
                            navigate('/admin/workbench')
                        }}
                        onFinishFailed={(errorInfo) => {
                            console.log('Failed:', errorInfo);
                        }}
                    >
                        <Form.Item
                            label="账号"
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: '账号不能为空',
                                },
                            ]}
                        >
                            <Input placeholder="请输入账号" />
                        </Form.Item>

                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: '密码不能为空',
                                },
                            ]}
                        >
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