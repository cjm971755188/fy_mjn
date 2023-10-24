import React, { useEffect, useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BuildOutlined,
    UserOutlined,
    AreaChartOutlined,
    CarryOutOutlined,
    AuditOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Dropdown, Breadcrumb, message } from 'antd';
import logo from '../assets/logo_white.jpg'
import { useLocation, useNavigate } from 'react-router-dom'

const { Header, Sider, Content } = Layout;
// 下拉菜单 items
const items = [
    {
        key: 'userCenter',
        label: (<a>个人中心</a>)
    },
    {
        key: 'changePassword',
        label: (<a>修改密码</a>)
    },
    {
        key: 'logOut',
        label: (<a>退出</a>)
    }
];

// 左侧菜单 menus
const menuItems = [
    {
        key: '/admin/workbench',
        icon: <AreaChartOutlined />,
        label: '工作台',
    },
    {
        key: '/admin/user',
        icon: <UserOutlined />,
        label: '账号管理',
        children: [
            {
                label: '账号列表',
                key: '/admin/user/user_list'
            },
            {
                label: '职位类型',
                key: '/admin/user/user_type'
            }
        ]
    },
    {
        key: '/admin/talent',
        icon: <UserOutlined />,
        label: '达人管理',
        children: [
            {
                label: '达人列表',
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
    }
]

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
    demoFn(menuItems)
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
    demoFn(menuItems)
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
        if (key == 'userCenter') {
            message.info('error: userCenter incomplete')
        } else if (key == 'changePassword') {
            message.info('error: changePassword incomplete')
        } else if (key == 'logOut') {
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
                        <img src={logo} style={{ width: '30px', borderRadius: '100%', float: 'right', margin: '20px 20px 0 0' }} />
                    </Dropdown>
                    <span  style={{ float: 'right', margin: 'auto 20px' }}>欢迎你，{localStorage.getItem('name')}</span>
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
                        style={{marginBottom: '20px'}}
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