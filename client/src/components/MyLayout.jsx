import React, { Fragment, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import request from '../service/request'
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    RollbackOutlined,
    UserOutlined,
    BookOutlined,
    TeamOutlined,
    AreaChartOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Dropdown, Breadcrumb, Form, Modal, Input, message, Col, Row } from 'antd';
import logo from '../assets/logo_white.jpg'
import people from '../assets/people.jpg'

const { Header, Sider, Content, Footer } = Layout;
// 下拉菜单 items
const items = [
    {
        key: 'editPassword',
        label: (<a>修改密码</a>)
    },
    {
        key: 'logOut',
        label: (<a>退出</a>)
    }
];

// 左侧菜单 menus
const menuItemsTotal = [
    {
        key: '/admin/data',
        label: '数据统计',
        icon: <AreaChartOutlined />,
        children: [
            {
                key: '/admin/data/statistics',
                label: '系统操作'
            },
            {
                key: '/admin/data/goal',
                label: '月目标达成情况'
            }
        ]
    },
    {
        key: '/admin/talent',
        label: '业务管理',
        icon: <TeamOutlined />,
        children: [
            {
                key: '/admin/talent/chance_list',
                label: '商机列表'
            },
            {
                key: '/admin/talent/talent_list',
                label: '达人列表'
            },
            {
                key: '/admin/talent/talent_black_list',
                label: '达人黑名单'
            },
            /* {
                key: '/admin/talent/live_calendar',
                label: '专场日历'
            }, */
            {
                key: '/admin/talent/live_list',
                label: '专场列表'
            },
            {
                key: '/admin/talent/middleman_list',
                label: '中间人列表'
            }
        ]
    },
    {
        key: '/admin/user',
        icon: <UserOutlined />,
        label: '用户管理'
    },
    {
        key: '/admin/info',
        label: '登记资料',
        icon: <BookOutlined />,
        children: [
            {
                key: '/admin/info/store',
                label: '店铺信息'
            },
            {
                key: '/admin/info/company',
                label: '营业执照'
            },
            {
                key: '/admin/info/notice',
                label: '历史通知'
            },
            {
                key: '/admin/info/mechanism',
                label: '提点&报备机制'
            },
        ]
    },
    {
        key: '/admin/base',
        label: '基础设定',
        icon: <SettingOutlined />,
        children: [
            {
                key: '/admin/base/project',
                label: '项目'
            },
            {
                key: '/admin/base/platform',
                label: '平台'
            },
            {
                key: '/admin/base/liveroom',
                label: '直播间'
            },
            {
                key: '/admin/base/liaison',
                label: '联系人类型'
            },
            {
                key: '/admin/base/account',
                label: '达人账号类型'
            }
        ]
    },
    {
        key: '/admin/talent/talent_list/talent_detail',
        icon: <UserOutlined />,
        label: '达人详情'
    }
]

// menu权限配置
const getMenuItems = (company, department, position) => {
    let arrObj = []
    for (let i = 0; i < menuItemsTotal.length; i++) {
        let menu = menuItemsTotal[i];
        if (menu.label === '达人详情') {
            continue
        } else if (menu.label === '业务管理' && position !== '管理员' && department === '财务部') {
            let m = menu, c = []
            for (let i = 0; i < menu.children.length; i++) {
                if (menu.children[i].label === '系统操作' || menu.children[i].label === '达人列表' || menu.children[i].label === '专场列表' || menu.children[i].label === '中间人列表') {
                    c.push(menu.children[i])
                }
            }
            m.children = c
            arrObj.push(m)
        } else if (menu.label === '登记资料') {
            if (position !== '管理员' && position !== '总裁' && (company !== '总公司' && department === '事业部')) {
                let m = menu, c = []
                for (let i = 0; i < menu.children.length; i++) {
                    if (menu.children[i].label === '历史通知' || menu.children[i].label === '提点&报备机制') {
                        c.push(menu.children[i])
                    }
                }
                m.children = c
                arrObj.push(m)
            } else {
                arrObj.push(menu)
            }
        } else if (menu.label === '基础设定' && position !== '管理员' && position !== '总裁' && position !== '副总') {
            continue
        } else if (menu.label === '用户管理' && position !== '管理员' && position !== '总裁' && position !== '副总' && position !== '主管') {
            continue
        } else {
            arrObj.push(menu)
        }
    }
    return arrObj
}

// 查找对应的menu
const searchUrlKey = (key) => {
    let arrObj = []
    const demoFn = (_arr) => {
        _arr.forEach(n => {
            if (key.includes(n.key)) {
                arrObj.push(n.key)
                // 判断是否有子节点，递归
                if (n.children) {
                    demoFn(n.children)
                }
            }
        })
    }
    demoFn(menuItemsTotal)
    return arrObj
}

// 面包屑导航
const createBreadcrumb = (key) => {
    let arrObj = []
    const demoFn = (_arr) => {
        _arr.forEach(n => {
            const { children, ...info } = n
            arrObj.push(info)
            if (n.children) {
                demoFn(n.children)
            }
        })
    }
    demoFn(menuItemsTotal)
    // 过滤
    const temp = arrObj.filter(m => key.includes(m.key))
    if (temp.length > 0) {
        return [...temp]
    } else {
        return []
    }
}

const MyLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer } } = theme.useToken();
    // 路由
    const navigate = useNavigate()
    // 个人中心conclick
    const onClick = ({ key }) => {
        if (key == 'editPassword') {
            setIsShowEdit(true)
            editForm.setFieldsValue({
                uid: localStorage.getItem('uid'),
                name: localStorage.getItem('name'),
                phone: localStorage.getItem('phone')
            })
        } else if (key == 'logOut') {
            localStorage.clear();
            navigate('/');
        } else {
            message.error('error: Dropdown onClick')
        }
    }

    // 获取当前url地址
    let { pathname } = useLocation()
    // 刷新不清空
    let tempMenu = searchUrlKey(pathname)
    // 面包屑
    let [bread, setBread] = useState([])
    // 权限菜单配置
    let menuItems = getMenuItems(localStorage.getItem('company'), localStorage.getItem('department'), localStorage.getItem('position'))

    // 修改用户信息
    const [isShowEdit, setIsShowEdit] = useState(false)
    const [editForm] = Form.useForm()
    const editPasswordAPI = (payload) => {
        request({
            method: 'post',
            url: '/user/editPassword',
            data: payload
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setIsShowEdit(false)
                    editForm.resetFields();
                    message.success(res.data.msg)
                } else if (res.data.code == 202) {
                    navigate('/login')
                    message.error(res.data.msg)
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

    useEffect(() => {
        setBread(createBreadcrumb(pathname))
    }, [pathname])
    return (
        <Fragment>
            <Layout style={{ minHeight: document.documentElement.clientHeight }}>
                <Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                >
                    <div className="logo">
                        <img src={logo} />
                    </div>
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultOpenKeys={tempMenu}
                        defaultSelectedKeys={tempMenu}
                        onClick={({ key }) => {
                            navigate(key)
                        }}
                        items={menuItems}
                    />
                </Sider>
                <Layout>
                    <Header style={{ padding: 0, background: colorBgContainer }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />
                        <span>慕江南客户管理系统</span>
                        <Dropdown menu={{ items, onClick }}>
                            <img src={people} style={{ width: '30px', borderRadius: '100%', float: 'right', margin: '20px 20px 0 0' }} />
                        </Dropdown>
                        <span style={{ float: 'right', margin: 'auto 20px' }}>欢迎你，{localStorage.getItem('name')}</span>
                    </Header>
                    <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer }}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Breadcrumb style={{ marginBottom: '20px' }} items={bread.map(n => { return { title: <a href={n.key}>{n.label}</a> } })} />
                            </Col>
                            {pathname.match('detail') ? <Col span={12}>
                                <Button icon={<RollbackOutlined />} style={{ float: 'right' }} onClick={() => { navigate(-1) }}>返回</Button>
                            </Col> : null}
                        </Row>
                        {children}
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>Ephemeroptera1.0 Created by 陈佳敏</Footer>
                </Layout>
            </Layout>
            <Modal title='修改密码'
                open={isShowEdit}
                maskClosable={false}
                onOk={() => { editForm.submit() }}
                onCancel={() => setIsShowEdit(false)}
            >
                <Form form={editForm} onFinish={(values) => { editPasswordAPI(values); }}>
                    <Form.Item label="编号" name="uid" rules={[{ required: true, message: '不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="姓名" name="name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="原密码" name="password" rules={[{ required: true, message: '不能为空' }]}>
                        <Input type='password' />
                    </Form.Item>
                    <Form.Item label="新密码" name="password2" rules={[{ required: true, message: '不能为空' }]}>
                        <Input type='password' />
                    </Form.Item>
                    <Form.Item label="确认新密码" name="password3" rules={[{ required: true, message: '不能为空' }]}>
                        <Input type='password' />
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    );
};
export default MyLayout;