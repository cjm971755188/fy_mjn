import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom'
import request from '../service/request'
import { Card, Table, Space, Form, Input, Modal, Button, Image, List, Select, Popover, Radio, InputNumber, message } from 'antd';
import { PlusOutlined, CheckCircleTwoTone, ClockCircleTwoTone, MinusCircleOutlined, PlayCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import people from '../assets/people.jpg'
import UpLoadImg from '../components/UpLoadImg'
import { chanceStatus, model, platform, liaisonType, accountType, accountModelType, ageCut, priceCut, middleType, yearDealType } from '../baseData/talent'
import MyDateSelect from '../components/MyDateSelect'
import AEMiddleman from '../components/modals/AEMiddleman'
import AEAChance from '../components/modals/AEAChance'

const { TextArea } = Input;

function ChanceList() {
    // 表格：格式
    const columns = [
        { title: '商机编号', dataIndex: 'cid', key: 'cid' },
        { title: '模式', dataIndex: 'models', key: 'models' },
        { title: '平台', dataIndex: 'platforms', key: 'platforms' },
        { title: '线上达人名', dataIndex: 'account_names', key: 'account_names' },
        { title: '团购达人名', dataIndex: 'group_name', key: 'group_name' },
        { title: '供货达人名', dataIndex: 'provide_name', key: 'provide_name' },
        { title: '寻找证明', dataIndex: 'search_pic', key: 'search_pic', render: (_, record) => (<Image width={50} src={record.search_pic} />) },
        {
            title: '联系人',
            dataIndex: 'liaison_name',
            key: 'liaison_name',
            render: (_, record) => (
                <Popover title="联系人信息" content={
                    <List>
                        <List.Item>姓名：{record.liaison_type}</List.Item>
                        <List.Item>微信：{record.liaison_name}</List.Item>
                        <List.Item>微信：{record.liaison_v}</List.Item>
                        <List.Item>电话：{record.liaison_phone}</List.Item>
                        <List.Item>微信：{record.crowd_name}</List.Item>
                    </List>}
                >
                    <span>{record.liaison_name}</span>
                </Popover>
            )
        },
        { title: '推进证明', dataIndex: 'advance_pic', key: 'advance_pic', render: (_, record) => (<Image width={50} src={record.advance_pic} />) },
        { title: '商务', dataIndex: 'name', key: 'name' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status === '未推进' ? <PlayCircleTwoTone twoToneColor="#f81d22" /> :
                        record.status === '报备驳回' ? <CloseCircleTwoTone twoToneColor="#f81d22" /> :
                            (record.status === '已推进' || record.status === '报备通过') ? <CheckCircleTwoTone twoToneColor="#4ec990" /> :
                                <ClockCircleTwoTone twoToneColor="#ee9900" />}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    {localStorage.getItem('position') === '主管' || localStorage.getItem('position') === '管理员' ?
                        <>{record.status === '报备待审批' ?
                            <NavLink to='/admin/talent/chance_list/talent_detail' state={{ cid: record.cid, tid: record.tid, type: 'report' }}>审批</NavLink> : null}
                        </> :
                        <>{record.status === '未推进' || record.status === '已推进' ?
                            <a onClick={() => {
                                setFormType('edit');
                                setIsShowPlatform(false)
                                setIsShowGroup(false)
                                setIsShowProvide(false)
                                let models = record.models.split(',')
                                for (let i = 0; i < models.length; i++) {
                                    const element = models[i];
                                    if (element === '线上平台') {
                                        setIsShowPlatform(true)
                                    }
                                    if (element === '社群团购') {
                                        setIsShowGroup(true)
                                    }
                                    if (element === '供货') {
                                        setIsShowProvide(true)
                                    }
                                }
                                let platforms = record.platforms
                                let account_names = record.account_names
                                let account_ids = record.account_ids
                                if (record.models.match('线上平台')) {
                                    platforms = record.platforms.split(',')
                                    account_names = record.account_names.split(',')
                                    account_ids = record.account_ids.split(',')
                                }
                                form.setFieldsValue({
                                    ...record,
                                    models,
                                    platforms,
                                    account_names,
                                    account_ids
                                })
                                setIsShow(true)
                            }}>修改信息</a> : null}
                            {record.status === '未推进' ?
                                <a onClick={() => {
                                    setFormType('advance');
                                    form.setFieldsValue(record)
                                    setIsShow(true)
                                }}>推进</a> : record.status === '已推进' || record.status === '报备驳回' ?
                                    <>
                                        <a onClick={() => {
                                            setFormType('report');
                                            setIsShowPlatform(false)
                                            setIsShowGroup(false)
                                            setIsShowProvide(false)
                                            let models = record.models.split(',')
                                            for (let i = 0; i < models.length; i++) {
                                                const element = models[i];
                                                if (element === '线上平台') {
                                                    setIsShowPlatform(true)
                                                }
                                                if (element === '社群团购') {
                                                    setIsShowGroup(true)
                                                }
                                                if (element === '供货') {
                                                    setIsShowProvide(true)
                                                }
                                            }
                                            let platformList = []
                                            let accountIdList = []
                                            let accountNameList = []
                                            if (record.models.match('线上平台')) {
                                                for (let i = 0; i < record.platforms.split(',').length; i++) {
                                                    const element = record.platforms.split(',')[i];
                                                    platformList.push({ label: element, value: element })
                                                }
                                                for (let i = 0; i < record.account_ids.split(',').length; i++) {
                                                    const element = record.account_ids.split(',')[i];
                                                    accountIdList.push({ label: element, value: element })
                                                }
                                                for (let i = 0; i < record.account_names.split(',').length; i++) {
                                                    const element = record.account_names.split(',')[i];
                                                    accountNameList.push({ label: element, value: element })
                                                }
                                            }
                                            form.setFieldsValue({
                                                ...record,
                                                platformList,
                                                accountIdList,
                                                accountNameList
                                            })
                                            setReportOnCount(accountIdList.length)
                                            setIsShow(true)
                                        }}>报备</a>
                                        {record.status === '报备驳回' ? <a onClick={() => {
                                            request({
                                                method: 'post',
                                                url: '/talent/getCheckNote',
                                                data: {
                                                    cid: record.cid,
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
                                                        setCheckNoReason(res.data.data)
                                                        setIsShowCheckNo(true);
                                                    } else {
                                                        message.error(res.data.msg)
                                                    }
                                                } else {
                                                    message.error(res.data.msg)
                                                }
                                            }).catch((err) => {
                                                console.error(err)
                                            })
                                        }}>查看驳回备注</a> : null}
                                    </> : null}
                        </>
                    }
                </Space>
            )
        }
    ]
    /* if (localStorage.getItem('position') === '商务') {
        columns = columns.filter(item => item.title !== '商务')
    } */
    // 表格：获取数据、分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filtersDate: [],
        filters: {},
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const getChanceListAPI = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/chance/getChanceList',
            data: {
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    name: localStorage.getItem('name'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                },
                filtersDate: tableParams.filtersDate,
                filters: tableParams.filters,
                pagination: {
                    current: tableParams.pagination.current - 1,
                    pageSize: tableParams.pagination.pageSize,
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    setData(res.data.data)
                    setLoading(false)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: res.data.pagination.total,
                        },
                    })
                } else {
                    message.error(res.data.msg)
                }
            }
        }).catch((err) => {
            console.error(err)
        })
    };
    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    }
    // 查询、清空筛选
    const [filterForm] = Form.useForm()
    const [dateSelect, setDateSelect] = useState()
    const [salemansItems, setSalemansItems] = useState()
    const getSalemanItemsAPI = () => {
        request({
            method: 'post',
            url: '/user/getSalemanItems',
            data: {
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
                    setSalemansItems(res.data.data)
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

    // 添加、修改、推进
    const [isShow, setIsShow] = useState(false)
    const [type, setType] = useState('add')
    const [form] = Form.useForm()
    const addChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/addChance',
            data: {
                ...payload,
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
                    setIsShow(false); 
                    getChanceListAPI();
                    form.resetFields();
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
    const editChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/editChance',
            data: {
                ...payload,
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
                    setIsShow(false); 
                    getChanceListAPI();
                    form.resetFields();
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
    const advanceChanceAPI = (payload) => {
        request({
            method: 'post',
            url: '/chance/advanceChance',
            data: {
                ...payload,
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
                    setIsShow(false); 
                    getChanceListAPI();
                    form.resetFields();
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

    // 报备
    const [isShowKeyword, setIsShowKeyword] = useState(false)
    const [reportOnCount, setReportOnCount] = useState(false)
    const [hasFuSaleman, setHasFuSaleman] = useState(false)
    const [hasFirstMiddle, setHasFirstMiddle] = useState(false)
    const [hasSecondMiddle, setHasSecondMiddle] = useState(false)
    const [hasGroupFuSaleman, setGroupHasFuSaleman] = useState(false)
    const [hasProvideFuSaleman, setProvideHasFuSaleman] = useState(false)
    const [checkNoReason, setCheckNoReason] = useState('')
    const [isShowCheckNo, setIsShowCheckNo] = useState(false)
    const reportChance = (values) => {
        request({
            method: 'post',
            url: '/chance/reportChance',
            data: {
                ...values,
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
                    setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList({}); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false);
                    getChanceListAPI()
                    form.resetFields()
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
    const [middlemans1, setMiddlemans1] = useState(false)
    const [middlemans2, setMiddlemans2] = useState(false)
    const searchMiddleman1 = (value) => {
        request({
            method: 'post',
            url: '/middleman/searchMiddlemans',
            data: {
                value: value,
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
                    setMiddlemans1(res.data.data)
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
    const searchMiddleman2 = (value) => {
        request({
            method: 'post',
            url: '/middleman/searchMiddlemans',
            data: {
                value: value,
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
                    setMiddlemans2(res.data.data)
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
    const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    // 添加新中间人
    const [isShowMid, setIsShowMid] = useState(false)
    const [formMid] = Form.useForm()
    const addMiddlemanAPI = (payload) => {
        request({
            method: 'post',
            url: '/middleman/addMiddleman',
            data: {
                ...payload,
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
                    setIsShowMid(false);
                    formMid.resetFields();
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
        getChanceListAPI();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card title="商机列表" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true); setType('add'); }}>添加新商机</Button>}>
                <Form
                    layout="inline"
                    form={filterForm}
                    onFinish={(values) => {
                        setTableParams({
                            ...tableParams,
                            filtersDate: dateSelect,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='日期选择' name='date' style={{ marginBottom: '20px' }}>
                        <MyDateSelect setDate={(value) => { setDateSelect(value) }} />
                    </Form.Item>
                    <Form.Item label='商机编号' name='cid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='模式' name='models' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={model} />
                    </Form.Item>
                    <Form.Item label='平台' name='platforms' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={platform} />
                    </Form.Item>
                    <Form.Item label='线上达人名' name='account_names' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='团购达人名' name='group_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='供货达人名' name='provide_name' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='联系人' name='liaison_name'><Input /></Form.Item>
                    {localStorage.getItem('position') === '商务' ? null : <Form.Item label='商务' name='uid' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemanItemsAPI(); }} />
                    </Form.Item>}
                    <Form.Item label='状态' name='status' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={chanceStatus} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: '20px' }}>
                        <Space size={'large'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                filterForm.resetFields();
                                setTableParams({
                                    ...tableParams,
                                    filtersDate: [],
                                    filters: {}
                                })
                            }}>清空筛选</Button>
                        </Space>
                    </Form.Item>
                </Form>
                <Table
                    style={{ margin: '20px auto' }}
                    rowKey={(data) => data.cid}
                    columns={columns}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
            {/* <Modal
                title={formType == 'add' ? '添加商机' : formType == 'edit' ? '修改商机' : formType == 'advance' ? '推进商机' : formType == 'report' ? '达人合作报备' : ''}
                open={isShow}
                width='40%'
                maskClosable={false}
                onOk={() => { form.submit(); }}
                onCancel={() => { setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList({}); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false); }}
            >
                <Form
                    form={form}
                    onFinish={(values) => {
                        if (formType == 'add') {
                            if (isShowPlatform && values.account_ids.length !== values.account_names.length) {
                                message.error('线上达人的账号和ID数量不一致')
                            } else {
                                addChance(values)
                            }
                        } else if (formType == 'edit') {
                            editChance(values)
                        } else if (formType == 'advance') {
                            advanceChance(values)
                        } else if (formType == 'report') {
                            if (values.accounts != null && reportOnCount !== values.accounts.length) {
                                message.error('请报备所有达人账号')
                            } else {
                                reportChance(values)
                            }
                        }
                    }}
                >
                    {formType == 'add' ? null : <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item>}
                    {formType == 'report' ? <Form.Item label="达人昵称" name="talent_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入达人昵称（公司内部、唯一、比较简单好记）" />
                    </Form.Item> : null}
                    {formType == 'report' ? <Form.Item label="年成交额" name="year_deal" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={yearDealType} />
                    </Form.Item> : null}
                    {formType == 'report' ? <><Form.Item label="若中间人信息未入库">
                        <Button type="primary" onClick={() => { setIsShowMid(true); }}>添加新中间人</Button>
                    </Form.Item>
                        <Form.Item label="是否有中间人">
                            <Radio.Group onChange={(e) => { setHasFirstMiddle(e.target.value); if (!e.target.value) { setMiddlemans1([]) } }} value={hasFirstMiddle} style={{ marginLeft: '20px' }}>
                                <Radio value={false}>无一级中间人</Radio>
                                <Radio value={true}>有一级中间人</Radio>
                            </Radio.Group>
                            <Radio.Group onChange={(e) => { setHasSecondMiddle(e.target.value); if (!e.target.value) { setMiddlemans2([]) } }} value={hasSecondMiddle} style={{ marginLeft: '20px' }}>
                                <Radio value={false}>无二级中间人</Radio>
                                <Radio value={true}>有二级中间人</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {hasFirstMiddle ? <><Space size='large'>
                            <Form.Item label="一级中间人" name="m_id_1" rules={[{ required: true, message: '不能为空' }]}>
                                <Select showSearch placeholder="请输入" options={middlemans1} filterOption={filterOption} onChange={(value) => { searchMiddleman1(value) }} onSearch={(value) => { searchMiddleman1(value) }} />
                            </Form.Item>
                            <Form.Item label="一级中间人提成点（%）" name="m_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space>
                            <Form.Item label="一级中间人提成备注" name="m_note_1">
                                <TextArea />
                            </Form.Item></> : null}
                        {hasSecondMiddle ? <><Space size='large'>
                            <Form.Item label="二级中间人" name="m_id_2" rules={[{ required: true, message: '不能为空' }]}>
                                <Select showSearch placeholder="请输入" options={middlemans2} filterOption={filterOption} onChange={(value) => { searchMiddleman2(value) }} onSearch={(value) => { searchMiddleman2(value) }} />
                            </Form.Item>
                            <Form.Item label="二级中间人提成点（%）" name="m_point_2" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space>
                            <Form.Item label="二级中间人提成备注" name="m_note_2">
                                <TextArea />
                            </Form.Item></> : null}</> : null}
                    {formType == 'add' || formType == 'edit' ? <Form.Item label="模式" name="models" rules={[{ required: true, message: '不能为空' }]}>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择新商机模式"
                            onChange={(value) => {
                                setIsShowPlatform(false)
                                setIsShowGroup(false)
                                setIsShowProvide(false)
                                form.setFieldValue('models', value)
                                for (let i = 0; i < value.length; i++) {
                                    const element = value[i];
                                    if (element === '线上平台') {
                                        setIsShowPlatform(true)
                                    }
                                    if (element === '社群团购') {
                                        setIsShowGroup(true)
                                    }
                                    if (element === '供货') {
                                        setIsShowProvide(true)
                                    }
                                }
                            }}
                            options={model}
                        />
                    </Form.Item> : null}
                    {isShowPlatform ? <Card title="线上平台" style={{ marginBottom: "20px" }}>
                        {formType !== 'report' ? <>
                            <Form.Item label="平台" name="platforms" rules={[{ required: true, message: '不能为空' }]}>
                                <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="请选择" onChange={(value) => { form.setFieldValue('platforms', value) }} options={platform} />
                            </Form.Item>
                            <Form.Item label="账号ID" name="account_ids" rules={[{ required: true, message: '不能为空' }]}>
                                <Select mode="tags" allowClear placeholder="请输入" onChange={(value) => { form.setFieldValue('account_ids', value) }} options={[]} />
                            </Form.Item>
                            <Form.Item label="达人账号" name="account_names" rules={[{ required: true, message: '不能为空' }]}>
                                <Select mode="tags" allowClear placeholder="请输入" onChange={(value) => { form.setFieldValue('account_names', value) }} options={[]} />
                            </Form.Item>
                            <Form.Item label="相同线上达人" name="pic">
                                <Button onClick={() => {
                                    if ((form.getFieldValue('account_names') && form.getFieldValue('account_names').length > 0) || (form.getFieldValue('account_ids') && form.getFieldValue('account_ids').length > 0)) {
                                        searchSame()
                                    } else {
                                        setIsShowSearch(false)
                                        setSearchList({})
                                        message.error('未填写达人账号名/ID, 无法查询')
                                    }
                                }}>查询</Button>
                            </Form.Item>
                            {isShowSearch && <Form.Item label="" name="pic">
                                {searchList.length > 0 ? <List
                                    itemLayout="horizontal"
                                    bordered
                                    dataSource={searchList}
                                    renderItem={(item, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Image width={50} src={people} preview={false} />}
                                                title={<Space size={'large'}><span>{`商机编号: ${item.cid}`}</span><span>{`状态: ${item.status}`}</span><span>{`商务: ${item.name}`}</span></Space>}
                                                description={<Space size={'large'}><span>{`平台: ${item.platforms}`}</span><span>{`账号ID: ${item.account_ids}`}</span><span>{`账号名称: ${item.account_names}`}</span></Space>}
                                            />
                                        </List.Item>
                                    )}
                                /> : null}
                            </Form.Item>}
                        </> : <Form.List name="accounts">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card key={key} title={`第 ${name + 1} 个账号`} extra={<MinusCircleOutlined onClick={() => remove(name)} />} style={{ marginBottom: '20px' }}>
                                            <Form.Item label="平台" {...restField} name={[name, "platform"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select
                                                    placeholder="请选择"
                                                    onChange={(value) => {
                                                        form.setFieldValue('platform', value)
                                                        if (value !== '闯货' && value !== '抖音' && value !== '快手' && value !== '视频号' && value !== '视频号服务商') {
                                                            setIsShowKeyword(true)
                                                        }
                                                    }}
                                                    options={form.getFieldValue('platformList')}
                                                />
                                            </Form.Item>
                                            <Form.Item label="账号ID" {...restField} name={[name, "account_id"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('account_id', value) }} options={form.getFieldValue('accountIdList')} />
                                            </Form.Item>
                                            <Form.Item label="账号名称" {...restField} name={[name, "account_name"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('account_name', value) }} options={form.getFieldValue('accountNameList')} />
                                            </Form.Item>
                                            <Form.Item label="账号类型" {...restField} name={[name, "account_type"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select placeholder="请选择" onChange={(value) => { form.setFieldValue('account_type', value) }} options={accountType} />
                                            </Form.Item>
                                            <Form.Item label="合作方式" {...restField} name={[name, "account_models"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select mode="multiple" allowClear placeholder="请选择" onChange={(value) => { form.setFieldValue('account_models', value) }} options={accountModelType} />
                                            </Form.Item>
                                            {isShowKeyword ? <Form.Item label="关键字（前后缀）" {...restField} name={[name, "keyword"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Input placeholder="请输入" />
                                            </Form.Item> : null}
                                            <Form.Item label="平时带货在线（人）" {...restField} name={[name, "people_count"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="女粉比例（%）" {...restField} name={[name, "fe_proportion"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="粉丝地域分布（省份）" {...restField} name={[name, "main_province"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Input />
                                            </Form.Item>
                                            <Form.Item label="粉丝购买主力年龄段（岁）" {...restField} name={[name, "age_cuts"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select mode="multiple" allowClear options={ageCut} />
                                            </Form.Item>
                                            <Form.Item label="平均客单价（元）" {...restField} name={[name, "price_cut"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select options={priceCut} />
                                            </Form.Item>
                                            <Form.Item label="常规品线上佣金比例（%）" {...restField} name={[name, "commission_normal"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="福利品线上佣金比例（%）" {...restField} name={[name, "commission_welfare"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="爆品线上佣金比例（%）" {...restField} name={[name, "commission_bao"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Form.Item label="佣金备注" {...restField} name={[name, "commission_note"]}>
                                                <TextArea />
                                            </Form.Item>
                                            <Space size='large'>
                                                <Form.Item label="主商务" {...restField} name={[name, "u_id_1"]} >
                                                    <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                                                </Form.Item>
                                                <Form.Item label="主商务提成点（%）" {...restField} name={[name, "u_point_1"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space>
                                            <Form.Item label="是否有副商务">
                                                <Radio.Group onChange={(e) => { setHasFuSaleman(e.target.value); }} value={hasFuSaleman} style={{ marginLeft: '20px' }}>
                                                    <Radio value={false}>无副商务</Radio>
                                                    <Radio value={true}>有副商务</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                            {hasFuSaleman ? <Space size='large'>
                                                <Form.Item label="副商务" {...restField} name={[name, "u_id_2"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemans(); }} />
                                                </Form.Item>
                                                <Form.Item label="副商务提成点（%）" {...restField} name={[name, "u_point_2"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space> : null}
                                            <Form.Item label="商务提成备注" {...restField} name={[name, "u_note"]}>
                                                <TextArea />
                                            </Form.Item>
                                        </Card>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            添加新账号
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>}
                    </Card> : null}
                    {isShowGroup ? <Card title="社群团购" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="group_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" disabled={formType === 'report' ? true : false} />
                        </Form.Item>
                        {formType === 'report' ? <><Form.Item label="聚水潭店铺名" name="group_shop">
                            <Input placeholder="请输入" />
                        </Form.Item>
                            <Space size='large'>
                                <Form.Item label="常规品折扣（折）" name="discount_normal" rules={[{ required: true, message: '不能为空' }]}>
                                    <InputNumber placeholder="请输入" />
                                </Form.Item>
                                <Form.Item label="福利品折扣（折）" name="discount_welfare" rules={[{ required: true, message: '不能为空' }]}>
                                    <InputNumber placeholder="请输入" />
                                </Form.Item>
                                <Form.Item label="爆品折扣（折）" name="discount_bao" rules={[{ required: true, message: '不能为空' }]}>
                                    <InputNumber placeholder="请输入" />
                                </Form.Item>
                            </Space>
                            <Form.Item label="折扣备注" name="discount_note">
                                <TextArea placeholder="请输入" />
                            </Form.Item>
                            <Space size='large'>
                                <Form.Item label="主商务" name="group_u_id_1" >
                                    <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                                </Form.Item>
                                <Form.Item label="主商务提成点（%）" name="group_u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                    <InputNumber />
                                </Form.Item>
                            </Space>
                            <Form.Item label="是否有副商务">
                                <Radio.Group onChange={(e) => { setGroupHasFuSaleman(e.target.value); }} value={hasGroupFuSaleman} style={{ marginLeft: '20px' }}>
                                    <Radio value={false}>无副商务</Radio>
                                    <Radio value={true}>有副商务</Radio>
                                </Radio.Group>
                            </Form.Item>
                            {hasGroupFuSaleman ? <Space size='large'>
                                <Form.Item label="副商务" name={"group_u_id_2"} >
                                    <Select style={{ width: 160 }} options={salemansItems} onFocus={() => { getSalemans(); }} />
                                </Form.Item>
                                <Form.Item label="副商务提成点（%）" name={"group_u_point_2"} >
                                    <InputNumber />
                                </Form.Item>
                            </Space> : null}<Form.Item label="商务提成备注" name="group_u_note">
                                <TextArea />
                            </Form.Item></> : null}
                    </Card> : null}
                    {isShowProvide ? <Card title="供货" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="provide_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" disabled={formType === 'report' ? true : false} />
                        </Form.Item>
                        {formType === 'report' ? <><Form.Item label="聚水潭店铺名" name="provide_shop">
                            <Input placeholder="请输入" />
                        </Form.Item>
                            <Space size='large'>
                                <Form.Item label="买断折扣（折）" name="discount_buyout" rules={[{ required: true, message: '不能为空' }]}>
                                    <InputNumber placeholder="请输入" />
                                </Form.Item>
                                <Form.Item label="含退货率折扣（折）" name="discount_back" rules={[{ required: true, message: '不能为空' }]}>
                                    <InputNumber placeholder="请输入" />
                                </Form.Item>
                            </Space>
                            <Form.Item label="折扣备注" name="discount_label">
                                <TextArea placeholder="请输入" />
                            </Form.Item>
                            <Space size='large'>
                                <Form.Item label="主商务" name="provide_u_id_1" >
                                    <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                                </Form.Item>
                                <Form.Item label="主商务提成点（%）" name="provide_u_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                    <InputNumber />
                                </Form.Item>
                            </Space>
                            <Form.Item label="是否有副商务">
                                <Radio.Group onChange={(e) => { setProvideHasFuSaleman(e.target.value); }} value={hasProvideFuSaleman} style={{ marginLeft: '20px' }}>
                                    <Radio value={false}>无副商务</Radio>
                                    <Radio value={true}>有副商务</Radio>
                                </Radio.Group>
                            </Form.Item>
                            {hasProvideFuSaleman ? <Space size='large'>
                                <Form.Item label="副商务" name={"provide_u_id_2"} >
                                    <Select
                                        style={{ width: 160 }}
                                        options={salemansItems}
                                        onFocus={() => { getSalemans(); }}
                                    />
                                </Form.Item>
                                <Form.Item label="副商务提成点（%）" name={"provide_u_point_2"} >
                                    <InputNumber />
                                </Form.Item>
                            </Space> : null}<Form.Item label="商务提成备注" name="provide_u_note">
                                <TextArea />
                            </Form.Item></> : null}
                    </Card> : null}
                    {formType == 'add' ? <Form.Item label="寻找证明" name="search_pic" rules={[{ required: true, message: '不能为空' }]} >
                        <UpLoadImg title="上传寻找证明" name="addSearchPic" setPicUrl={(value) => { form.setFieldValue('search_pic', value) }} />
                    </Form.Item> : null}
                    {formType == 'advance' || (formType == 'edit' && form.getFieldValue('status') == '已推进') ? <><Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '不能为空' }]}>
                        <Select
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="请选择"
                            onChange={(value) => { form.setFieldValue('liaison_type', value) }}
                            options={liaisonType}
                        />
                    </Form.Item>
                        <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="联系人微信" name="liaison_v" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="联系人电话（选填）" name="liaison_phone">
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item label="沟通群名称" name="crowd_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" />
                        </Form.Item></> : null}
                    {formType == 'advance' ? <Form.Item label="发货盘证明" name="advance_pic" rules={[{ required: true, message: '不能为空' }]} >
                        <UpLoadImg title="发货盘证明" name="advance_pic" setPicUrl={(value) => { form.setFieldValue('advance_pic', value) }} />
                    </Form.Item> : null}
                </Form>
            </Modal> */}
            <AEAChance
                isShow={isShow}
                type={type}
                form={form}
                onOK={(values) => { type === 'add' ? addChanceAPI(values) : type === 'edit' ? editChanceAPI(values) : advanceChanceAPI(values) }}
                onCancel={() => { setIsShow(false); form.resetFields(); }}
            />
            <AEMiddleman
                isShow={isShowMid}
                type={'add'}
                form={formMid}
                onOK={(values) => { addMiddlemanAPI(values) }}
                onCancel={() => { setIsShowMid(false); formMid.resetFields(); }}
            />
            <Modal title="报备驳回备注" open={isShowCheckNo} onOk={() => { setIsShowCheckNo(false); }} onCancel={() => { setIsShowCheckNo(false); }}>
                <TextArea placeholder="请输入" value={checkNoReason} disabled={true} />
            </Modal>
        </div >
    )
}

export default ChanceList