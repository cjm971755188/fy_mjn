import React, { useEffect, useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BuildOutlined,
    UserOutlined,
    AreaChartOutlined,
    CarryOutOutlined,
    AuditOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Dropdown, Breadcrumb, Form, Modal, Input, message } from 'antd';
import logo from '../assets/logo_white.jpg'
import people from '../assets/people.jpg'
import { useLocation, useNavigate } from 'react-router-dom'
import request from '../service/request'

const { Header, Sider, Content } = Layout;
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
        key: '/admin/workbench',
        icon: <AreaChartOutlined />,
        label: '工作台',
    },
    {
        key: '/admin/talent',
        icon: <TeamOutlined />,
        label: '达人管理',
        children: [
            {
                label: '商机推进',
                key: '/admin/talent/talent_preparation'
            },
            {
                label: '合作达人',
                key: '/admin/talent/talent_list'
            }
        ]
    },
    {
        key: '/admin/live',
        icon: <CarryOutOutlined />,
        label: '排班管理',
        children: [
            {
                label: '排班列表',
                key: '/admin/live/live_list'
            }
        ]
    },
    {
        key: '/admin/pallet',
        icon: <BuildOutlined />,
        label: '货盘管理',
        children: [
            {
                label: '货盘列表',
                key: '/admin/pallet/pallet_list'
            },
            {
                label: '商品库存',
                key: '/admin/pallet/product_list'
            }
        ]
    },
    {
        key: '/admin/contract',
        icon: <AuditOutlined />,
        label: '合同管理',
        children: [
            {
                label: '合同列表',
                key: '/admin/contract/contract_list'
            }
        ]
    },
    {
        key: '/admin/user',
        icon: <UserOutlined />,
        label: '用户列表'
    }
]

// 查找对应的menu
const getMenuItems = (ud_id, ut_id) => {
    let arrObj = []
    for (let i = 0; i < menuItemsTotal.length; i++) {
        let menu = menuItemsTotal[i];
        if (ut_id == 'UT003' && menu.label == '用户列表') {
            continue
        } else if (ud_id == 'UD003' && menu.label == '达人管理') {
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
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    // 路由
    const navigate = useNavigate()
    // 个人中心conclick
    const onClick = ({ key }) => {
        if (key == 'editPassword') {
            setIsShowEdit(true)
            editForm.setFieldsValue({
                uid: localStorage.getItem('uid'),
                name: localStorage.getItem('name')
            })
        } else if (key == 'logOut') {
            localStorage.clear()
            navigate('/')
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
    let menuItems = getMenuItems(localStorage.getItem('ud_id'), localStorage.getItem('ut_id'))

    // 修改用户信息
    const [isShowEdit, setIsShowEdit] = useState(false)
    const [editForm] = Form.useForm()

    useEffect(() => {
        setBread(createBreadcrumb(pathname))
    }, [pathname])
    return (
        <Layout style={{ width: '100vw', height: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
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
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <span>慕江南销售管理系统</span>
                    <Dropdown
                        menu={{ items, onClick }}
                    >
                        <img src={people} style={{ width: '30px', borderRadius: '100%', float: 'right', margin: '20px 20px 0 0' }} />
                    </Dropdown>
                    <Modal
                        title='修改密码'
                        open={isShowEdit}
                        maskClosable={false}
                        onOk={() => { editForm.submit() }}
                        onCancel={() => setIsShowEdit(false)}
                    >
                        <Form
                            form={editForm}
                            onFinish={(values) => {
                                request({
                                    method: 'post',
                                    url: '/user/editPassword',
                                    data: values
                                }).then((res) => {
                                    if (res.status == 200) {
                                        if (res.data.code == 200) {
                                            setIsShowEdit(false)
                                            editForm.resetFields();
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
                            }}
                        >
                            <Form.Item label="编号" name="uid" rules={[{ required: true, message: '编号不能为空' }]}>
                                <Input disabled={true} />
                            </Form.Item>
                            <Form.Item label="姓名" name="name" rules={[{ required: true, message: '姓名不能为空' }]}>
                                <Input disabled={true} />
                            </Form.Item>
                            <Form.Item label="原密码" name="password" rules={[{ required: true, message: '原密码不能为空' }]}>
                                <Input type='password' />
                            </Form.Item>
                            <Form.Item label="新密码" name="password2" rules={[{ required: true, message: '新密码不能为空' }]}>
                                <Input type='password' />
                            </Form.Item>
                            <Form.Item label="确认新密码" name="password3" rules={[{ required: true, message: '确认新密码不能为空' }]}>
                                <Input type='password' />
                            </Form.Item>
                        </Form>
                    </Modal>
                    <span style={{ float: 'right', margin: 'auto 20px' }}>欢迎你，{localStorage.getItem('name')}</span>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                    }}
                >
                    <Breadcrumb
                        style={{ marginBottom: '20px' }}
                        items={
                            bread.map(n => {
                                return { title: <a href={n.key}>{n.label}</a> }
                            })
                        }
                    />
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};
export default MyLayout;