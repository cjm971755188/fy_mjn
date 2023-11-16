import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.jsx'
import Login from './pages/login.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <Router>
        <ConfigProvider locale={zhCN}>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/admin/*' element={<App />} />
            </Routes>
        </ConfigProvider>
    </Router>
)
