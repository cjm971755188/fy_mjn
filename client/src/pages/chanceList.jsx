import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Image, List, Select, Tooltip, Radio, InputNumber, message } from 'antd';
import { PlusOutlined, CheckCircleTwoTone, ClockCircleTwoTone, MinusCircleOutlined } from '@ant-design/icons';
import request from '../service/request'
import people from '../assets/people.jpg'
import UpLoadImg from '../components/UpLoadImg'
import { chanceStatus, model, platform, liaisonType, accountType, accountModelType, ageCut, priceCut, middleType } from '../baseData/talent'

function ChanceList() {
    const columns = [
        { title: '商机编号', dataIndex: 'cid', key: 'cid' },
        { title: '模式', dataIndex: 'models', key: 'models' },
        { title: '平台', dataIndex: 'platforms', key: 'platforms' },
        { title: '账号ID', dataIndex: 'account_ids', key: 'account_ids' },
        { title: '账号名称', dataIndex: 'account_names', key: 'account_names' },
        { title: '团购达人', dataIndex: 'group_name', key: 'group_name' },
        { title: '供货达人', dataIndex: 'provide_name', key: 'provide_name' },
        {
            title: '寻找证明',
            dataIndex: 'search_pic',
            key: 'search_pic',
            render: (_, record) => (
                <Image width={50} src={record.search_pic} />
            )
        },
        {
            title: '联系人类型',
            dataIndex: 'liaison_type',
            key: 'liaison_type',
            render: (_, record) => (
                <Tooltip title={() => {
                    return (
                        <div>
                            <div>姓名：{record.liaison_name}</div>
                            <div>微信：{record.liaison_v}</div>
                            <div>电话：{record.liaison_phone}</div>
                            <div>沟通群：{record.crowd_name}</div>
                        </div>
                    )
                }}>
                    <span>{record.liaison_type}</span>
                </Tooltip>
            )
        },
        {
            title: '推进证明',
            dataIndex: 'advance_pic',
            key: 'advance_pic',
            render: (_, record) => (
                <Image width={50} src={record.advance_pic} />
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status === '已推进' ? <CheckCircleTwoTone twoToneColor="#4ec990" /> : <ClockCircleTwoTone twoToneColor="#ffc814" />}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.status === '未推进' || record.status === '已推进' ? <a onClick={() => {
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
                        let platforms = record.platforms.split(',')
                        let account_names = record.account_names.split(',')
                        let account_ids = record.account_ids.split(',')
                        form.setFieldsValue({
                            ...record,
                            models,
                            platforms,
                            account_names,
                            account_ids
                        })
                        setIsShow(true)
                    }}>修改信息</a> : null}
                    {record.status === '未推进' ? <a onClick={() => {
                        setFormType('advance');
                        form.setFieldsValue(record)
                        setIsShow(true)
                    }}>推进</a> : record.status === '已推进' ? <a onClick={() => {
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
                        for (let i = 0; i < record.platforms.split(',').length; i++) {
                            const element = record.platforms.split(',')[i];
                            platformList.push({ label: element, value: element })
                        }
                        let accountIdList = []
                        for (let i = 0; i < record.account_ids.split(',').length; i++) {
                            const element = record.account_ids.split(',')[i];
                            accountIdList.push({ label: element, value: element })
                        }
                        let accountNameList = []
                        for (let i = 0; i < record.account_names.split(',').length; i++) {
                            const element = record.account_names.split(',')[i];
                            accountNameList.push({ label: element, value: element })
                        }
                        form.setFieldsValue({
                            ...record,
                            platformList,
                            accountIdList,
                            accountNameList
                        })
                        setIsShow(true)
                    }}>报备审批</a> : null}
                </Space>
            )
        }
    ]

    // 传入数据，分页
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        filters: {},
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const fetchData = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/chance/getChanceList',
            data: {
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                },
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

    // 添加、修改、推进、报备
    const [isShow, setIsShow] = useState(false)
    const [formType, setFormType] = useState('add')
    const [form] = Form.useForm()
    const [isShowSearch, setIsShowSearch] = useState(false)
    const [searchList, setSearchList] = useState([])
    const [isShowPlatform, setIsShowPlatform] = useState(false)
    const [isShowGroup, setIsShowGroup] = useState(false)
    const [isShowProvide, setIsShowProvide] = useState(false)

    const [isShowKeyword, setIsShowKeyword] = useState(false)
    const [hasFuSaleman, setHasFuSaleman] = useState(false)
    const [hasFirstMiddle, setHasFirstMiddle] = useState(false)
    const [hasSecondMiddle, setHasSecondMiddle] = useState(false)
    const [hasGroupFuSaleman, setGroupHasFuSaleman] = useState(false)
    const [hasProvideFuSaleman, setProvideHasFuSaleman] = useState(false)

    // 查询、清空筛选
    const [selectForm] = Form.useForm()

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)])
    return (
        <div>
            <Card title="商机列表" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsShow(true); setFormType('add'); }}>添加新商机</Button>}>
                <Form
                    layout="inline"
                    form={selectForm}
                    onFinish={(values) => {
                        console.log('onFinish');
                        setTableParams({
                            ...tableParams,
                            filters: values
                        })
                    }}
                >
                    <Form.Item label='商机编号' name='cid' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='模式' name='models' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={model} />
                    </Form.Item>
                    <Form.Item label='平台' name='platforms' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={platform} />
                    </Form.Item>
                    <Form.Item label='达人账号' name='account_names' style={{ marginBottom: '20px' }}><Input /></Form.Item>
                    <Form.Item label='联系人类型' name='liaison_type' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={liaisonType} />
                    </Form.Item>
                    <Form.Item label='状态' name='status' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={chanceStatus} />
                    </Form.Item>
                    <Form.Item>
                        <Space size={'middle'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                selectForm.resetFields();
                                setTableParams({
                                    ...tableParams,
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
            <Modal
                title={formType == 'add' ? '添加商机' : formType == 'edit' ? '修改商机' : formType == 'advance' ? '推进商机' : formType == 'report' ? '商机报备' : ''}
                open={isShow}
                width='40%'
                maskClosable={false}
                onOk={() => { form.submit() }}
                onCancel={() => { setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList([]); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false); }}
            >
                <Form
                    form={form}
                    onFinish={(values) => {
                        if (formType == 'add') {
                            request({
                                method: 'post',
                                url: '/chance/addChance',
                                data: {
                                    ...values,
                                    uid: localStorage.getItem('uid')
                                }
                            }).then((res) => {
                                if (res.status == 200) {
                                    if (res.data.code == 200) {
                                        setIsShow(false)
                                        fetchData()
                                        form.resetFields()
                                        setSearchList([])
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
                        } else if (formType == 'edit') {
                            request({
                                method: 'post',
                                url: '/chance/editChance',
                                data: {
                                    ...values,
                                    status: form.getFieldValue('status')
                                }
                            }).then((res) => {
                                if (res.status == 200) {
                                    if (res.data.code == 200) {
                                        setIsShow(false)
                                        fetchData()
                                        form.resetFields()
                                        setSearchList([])
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
                        } else if (formType == 'advance') {
                            request({
                                method: 'post',
                                url: '/chance/advanceChance',
                                data: values
                            }).then((res) => {
                                if (res.status == 200) {
                                    if (res.data.code == 200) {
                                        setIsShow(false)
                                        fetchData()
                                        form.resetFields()
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
                        } else if (formType == 'report') {
                            let submit = {
                                ...values,
                                group_uid_1: localStorage.getItem('uid')
                            }
                            console.log('submit: ', submit);
                            if (submit.accounts !== null) {
                                for (let i = 0; i < submit.accounts.length; i++) {
                                    const element = submit.accounts[i];
                                    request({
                                        method: 'post',
                                        url: '/chance/reportChanceOn',
                                        data: {
                                            cid: submit.cid,
                                            talent_name: submit.talent_name,
                                            ...element,
                                            userInfo: {
                                                uid: localStorage.getItem('uid'),
                                                compnay: localStorage.getItem('company'),
                                                department: localStorage.getItem('department'),
                                                position: localStorage.getItem('position')
                                            }
                                        }
                                    }).then((res) => {
                                        if (res.status == 200) {
                                            if (res.data.code == 200) {
                                                setIsShow(false)
                                                fetchData()
                                                form.resetFields()
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
                            }
                        }
                    }}
                >
                    {formType == 'add' ? null : <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '模式不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item>}
                    {formType == 'report' ? <Form.Item label="达人昵称" name="talent_name" rules={[{ required: true, message: '达人昵称不能为空' }]}>
                        <Input placeholder="请输入达人昵称（公司内部、唯一、比较简单好记）" />
                    </Form.Item> : null}
                    {formType == 'add' || formType == 'edit' ? <Form.Item label="模式" name="models" rules={[{ required: true, message: '模式不能为空' }]}>
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
                            <Form.Item label="平台" name="platforms" rules={[{ required: true, message: '平台不能为空' }]}>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{
                                        width: '100%',
                                    }}
                                    placeholder="请选择新商机合作平台"
                                    onChange={(value) => {
                                        form.setFieldValue('platforms', value)
                                    }}
                                    options={platform}
                                />
                            </Form.Item>
                            <Form.Item label="账号ID" name="account_ids" rules={[{ required: true, message: '账号ID不能为空' }]}>
                                <Select
                                    mode="tags"
                                    allowClear
                                    placeholder="请输入新达人的账号ID"
                                    onChange={(value) => {
                                        form.setFieldValue('account_ids', value)
                                    }}
                                    options={[]}
                                />
                            </Form.Item>
                            <Form.Item label="达人账号" name="account_names" rules={[{ required: true, message: '达人账号不能为空' }]}>
                                <Select
                                    mode="tags"
                                    allowClear
                                    placeholder="请输入新达人账号"
                                    onChange={(value) => {
                                        form.setFieldValue('account_names', value)
                                    }}
                                    options={[]}
                                />
                            </Form.Item>
                            <Form.Item label="相同线上达人" name="pic">
                                <Button onClick={() => {
                                    if ((form.getFieldValue('account_names') && form.getFieldValue('account_names').length > 0) || (form.getFieldValue('account_ids') && form.getFieldValue('account_ids').length > 0)) {
                                        request({
                                            method: 'post',
                                            url: '/chance/searchSameChance',
                                            data: {
                                                account_names: form.getFieldValue('account_names'),
                                                account_ids: form.getFieldValue('account_ids'),
                                                cid: formType == 'add' ? '' : form.getFieldValue('cid')
                                            }
                                        }).then((res) => {
                                            if (res.status == 200) {
                                                if (res.data.code != 200) {
                                                    setIsShowSearch(true)
                                                    setSearchList(res.data.data)
                                                    message.error(res.data.msg)
                                                } else {
                                                    setIsShowSearch(false)
                                                    setSearchList([])
                                                    message.success(res.data.msg)
                                                }
                                            } else {
                                                message.error(res.data.msg)
                                            }
                                        }).catch((err) => {
                                            console.error(err)
                                        })
                                    } else {
                                        setIsShowSearch(false)
                                        setSearchList([])
                                        message.error('未填写达人账号名/ID, 无法查询')
                                    }
                                }}>查询</Button>
                            </Form.Item>
                            {isShowSearch && <Form.Item label="" name="pic">
                                {searchList.Unreported.length > 0 ? <List
                                    itemLayout="horizontal"
                                    bordered
                                    style={{ margin: '20px 0' }}
                                    header="未合作"
                                    dataSource={searchList.Unreported}
                                    renderItem={(item, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Image width={50} src={people} preview={false} />}
                                                title={<Space size={'large'}><div>{`账号名: ${item.account_names}`}</div><div>{`账号ID: ${item.account_ids}`}</div></Space>}
                                                description={<span>{`商务: ${item.name}`}</span>}
                                            />
                                        </List.Item>
                                    )}
                                /> : null}
                                {searchList.cooperation.length > 0 ? <List
                                    itemLayout="horizontal"
                                    bordered
                                    style={{ margin: '20px 0' }}
                                    header="已合作"
                                    dataSource={searchList.cooperation}
                                    renderItem={(item, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Image width={50} src={people} preview={false} />}
                                                title={<Space size={'large'}><div>{`账号名: ${item.account_names}`}</div><div>{`账号ID: ${item.account_ids}`}</div></Space>}
                                                description={<Space size={'large'}><div>{`平台: ${item.platform}`}</div><div>{`商务: ${item.name}`}</div></Space>}
                                            />
                                        </List.Item>
                                    )}
                                /> : null}
                            </Form.Item>}
                        </> : <Form.List name="accounts">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card key={key} title={`第 ${name + 1} 个账号`} style={{ marginBottom: '20px' }} extra={<MinusCircleOutlined onClick={() => remove(name)} />}>
                                            <Form.Item label="平台" {...restField} name={[name, "platform"]} rules={[{ required: true, message: '平台不能为空' }]}>
                                                <Select
                                                    placeholder="请选择报备的平台"
                                                    onChange={(value) => {
                                                        form.setFieldValue('platform', value)
                                                        if (value !== '闯货' && value !== '抖音' && value !== '快手' && value !== '视频号' && value !== '视频号服务商') {
                                                            setIsShowKeyword(true)
                                                        }
                                                    }}
                                                    options={form.getFieldValue('platformList')}
                                                />
                                            </Form.Item>
                                            <Form.Item label="账号ID" {...restField} name={[name, "account_id"]} rules={[{ required: true, message: '账号ID不能为空' }]}>
                                                <Select
                                                    placeholder="请选择报备的账号ID"
                                                    onChange={(value) => {
                                                        form.setFieldValue('account_id', value)
                                                    }}
                                                    options={form.getFieldValue('accountIdList')}
                                                />
                                            </Form.Item>
                                            <Form.Item label="账号名称" {...restField} name={[name, "account_name"]} rules={[{ required: true, message: '账号名称不能为空' }]}>
                                                <Select
                                                    placeholder="请选择报备的账号名称"
                                                    onChange={(value) => {
                                                        form.setFieldValue('account_name', value)
                                                    }}
                                                    options={form.getFieldValue('accountNameList')}
                                                />
                                            </Form.Item>
                                            <Form.Item label="账号类型" {...restField} name={[name, "account_type"]} rules={[{ required: true, message: '账号类型不能为空' }]}>
                                                <Select
                                                    placeholder="请选择报备的账号类型"
                                                    onChange={(value) => {
                                                        form.setFieldValue('account_type', value)
                                                    }}
                                                    options={accountType}
                                                />
                                            </Form.Item>
                                            <Form.Item label="合作方式" {...restField} name={[name, "account_models"]} rules={[{ required: true, message: '合作方式不能为空' }]}>
                                                <Select
                                                    mode="multiple"
                                                    allowClear
                                                    placeholder="请选择报备的合作方式"
                                                    onChange={(value) => {
                                                        form.setFieldValue('account_models', value)
                                                    }}
                                                    options={accountModelType}
                                                />
                                            </Form.Item>
                                            {isShowKeyword ? <Form.Item label="关键字（前后缀）" {...restField} name={[name, "keyword"]} rules={[{ required: true, message: '关键字（前后缀）不能为空' }]}>
                                                <Input placeholder="请输入报备的关键字（前后缀）" />
                                            </Form.Item> : null}
                                            <Space size='middle'>
                                                <Form.Item label="平时带货在线（人）" {...restField} name={[name, "people_count"]} rules={[{ required: true, message: '平时带货在线不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                                <Form.Item label="女粉比例（%）" {...restField} name={[name, "fe_proportion"]} rules={[{ required: true, message: '女粉比例（%）不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space>
                                            <Form.Item label="粉丝购买主力年龄段（岁）" {...restField} name={[name, "age_cuts"]} rules={[{ required: true, message: '粉丝购买主力年龄段（岁）不能为空' }]}>
                                                <Select mode="multiple" allowClear options={ageCut} />
                                            </Form.Item>
                                            <Form.Item label="粉丝地域分布（省份）" {...restField} name={[name, "main_province"]} rules={[{ required: true, message: '粉丝地域分布（省份）不能为空' }]}>
                                                <Input />
                                            </Form.Item>
                                            <Form.Item label="平均客单价（元）" {...restField} name={[name, "price_cut"]} rules={[{ required: true, message: '平均客单价（元）不能为空' }]}>
                                                <Select options={priceCut} />
                                            </Form.Item>
                                            <Form.Item label="常规品线上佣金比例（%）" {...restField} name={[name, "commission"]} rules={[{ required: true, message: '常规品线上佣金比例（%）不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Space size='middle'>
                                                <Form.Item label="主商务" {...restField} name={[name, "uid_1"]} >
                                                    <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                                                </Form.Item>
                                                <Form.Item label="主商务提成点（%）" {...restField} name={[name, "u_point_1"]} rules={[{ required: true, message: '平时带货在线不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space>
                                            <Form.Item label="是否有副商务">
                                                <Radio.Group onChange={(e) => { setHasFuSaleman(e.target.value); }} value={hasFuSaleman} style={{ marginLeft: '20px' }}>
                                                    <Radio value={false}>无副商务</Radio>
                                                    <Radio value={true}>有副商务</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                            {hasFuSaleman ? <Space size='middle'>
                                                <Form.Item label="副商务" {...restField} name={[name, "uid_2"]} >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item label="副商务提成点（%）" {...restField} name={[name, "u_point_2"]} >
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space> : null}
                                            {/* <Form.Item label="是否有中间人">
                                                <Radio.Group onChange={(e) => { setHasFirstMiddle(e.target.value); }} value={hasFirstMiddle} style={{ marginLeft: '20px' }}>
                                                    <Radio value={false}>无一级中间人</Radio>
                                                    <Radio value={true}>有一级中间人</Radio>
                                                </Radio.Group>
                                                <Radio.Group onChange={(e) => { setHasSecondMiddle(e.target.value); }} value={hasSecondMiddle} style={{ marginLeft: '20px' }}>
                                                    <Radio value={false}>无二级中间人</Radio>
                                                    <Radio value={true}>有二级中间人</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                            {hasFirstMiddle ? <Space size='middle'>
                                                <Form.Item label="类型" {...restField} name={[name, "m_type_1"]} >
                                                    <Select placeholder='请选择中间人类型' options={middleType} />
                                                </Form.Item>
                                                <Form.Item label="一级中间人" {...restField} name={[name, "mid_1"]} >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item label="一级中间人提成点（%）" {...restField} name={[name, "m_point_1"]} >
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space> : null}
                                            {hasSecondMiddle ? <Space size='middle'>
                                                <Form.Item label="类型" {...restField} name={[name, "m_type_2"]} >
                                                    <Select placeholder='请选择中间人类型' options={middleType} />
                                                </Form.Item>
                                                <Form.Item label="二级中间人" {...restField} name={[name, "mid_2"]} >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item label="二级中间人提成点（%）" {...restField} name={[name, "m_point_2"]} >
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space> : null} */}
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
                        <Form.Item label="达人名称" name="group_name" rules={[{ required: true, message: '达人名称不能为空' }]}>
                            <Input placeholder="请输入新商机的社群团购达人名称" disabled={formType === 'report' ? true : false} />
                        </Form.Item>
                        {formType === 'report' ? <><Space size='middle'>
                            <Form.Item label="主商务" name="group_uid_1" >
                                <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                            </Form.Item>
                            <Form.Item label="主商务提成点（%）" name="group_u_point_1" rules={[{ required: true, message: '平时带货在线不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space>
                            <Form.Item label="是否有副商务">
                                <Radio.Group onChange={(e) => { setGroupHasFuSaleman(e.target.value); }} value={hasGroupFuSaleman} style={{ marginLeft: '20px' }}>
                                    <Radio value={false}>无副商务</Radio>
                                    <Radio value={true}>有副商务</Radio>
                                </Radio.Group>
                            </Form.Item>
                            {hasGroupFuSaleman ? <Space size='middle'>
                                <Form.Item label="副商务" name={"group_uid_2"} >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="副商务提成点（%）" name={"group_u_point_2"} >
                                    <InputNumber />
                                </Form.Item>
                            </Space> : null}</> : null}
                    </Card> : null}
                    {isShowProvide ? <Card title="供货" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="provide_name" rules={[{ required: true, message: '达人名称不能为空' }]}>
                            <Input placeholder="请输入新商机的供货达人名称" disabled={formType === 'report' ? true : false} />
                        </Form.Item>
                        {formType === 'report' ? <><Space size='middle'>
                            <Form.Item label="主商务" name="group_uid_1" >
                                <Input defaultValue={localStorage.getItem('name')} disabled={true} />
                            </Form.Item>
                            <Form.Item label="主商务提成点（%）" name="group_u_point_1" rules={[{ required: true, message: '平时带货在线不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space>
                            <Form.Item label="是否有副商务">
                                <Radio.Group onChange={(e) => { setProvideHasFuSaleman(e.target.value); }} value={hasProvideFuSaleman} style={{ marginLeft: '20px' }}>
                                    <Radio value={false}>无副商务</Radio>
                                    <Radio value={true}>有副商务</Radio>
                                </Radio.Group>
                            </Form.Item>
                            {hasProvideFuSaleman ? <Space size='middle'>
                                <Form.Item label="副商务" name={"group_uid_2"} >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="副商务提成点（%）" name={"group_u_point_2"} >
                                    <InputNumber />
                                </Form.Item>
                            </Space> : null}</> : null}
                    </Card> : null}
                    {formType == 'add' ? <Form.Item label="寻找证明" name="search_pic" rules={[{ required: true, message: '寻找证明不能为空' }]} >
                        <UpLoadImg title="上传寻找证明" name="addSearchPic" setPicUrl={(value) => { form.setFieldValue('search_pic', value) }} />
                    </Form.Item> : null}
                    {formType == 'advance' || (formType == 'edit' && form.getFieldValue('status') == '已推进') ? <><Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '联系人类型不能为空' }]}>
                        <Select
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择联系人类型"
                            onChange={(value) => {
                                form.setFieldValue('liaison_type', value)
                            }}
                            options={liaisonType}
                        />
                    </Form.Item>
                        <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '联系人姓名不能为空' }]}>
                            <Input placeholder="请输入联系人姓名" />
                        </Form.Item>
                        <Form.Item label="联系人微信" name="liaison_v" rules={[{ required: true, message: '联系人微信不能为空' }]}>
                            <Input placeholder="请输入联系人微信" />
                        </Form.Item>
                        <Form.Item label="联系人电话（选填）" name="liaison_phone">
                            <Input placeholder="请输入联系人电话" />
                        </Form.Item>
                        <Form.Item label="沟通群名称" name="crowd_name" rules={[{ required: true, message: '沟通群名不能为空' }]}>
                            <Input placeholder="请输入沟通群名" />
                        </Form.Item></> : null}
                    {formType == 'advance' ? <Form.Item label="发货盘证明" name="advance_pic" rules={[{ required: true, message: '发货盘证明不能为空' }]} >
                        <UpLoadImg title="发货盘证明" name="advance_pic" setPicUrl={(value) => { form.setFieldValue('advance_pic', value) }} />
                    </Form.Item> : null}
                </Form>
            </Modal>
        </div>
    )
}

export default ChanceList