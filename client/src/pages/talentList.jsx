import React, { useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Image, List, Select, Tooltip, Radio, InputNumber, Descriptions, message } from 'antd';
const { TextArea } = Input;
import { PlusOutlined, CheckCircleTwoTone, ClockCircleTwoTone, MinusCircleOutlined, PlayCircleTwoTone } from '@ant-design/icons';
import request from '../service/request'
import people from '../assets/people.jpg'
import UpLoadImg from '../components/UpLoadImg'
import { chanceStatus, model, platform, liaisonType, accountType, accountModelType, ageCut, priceCut, middleType } from '../baseData/talent'
import MyDateSelect from '../components/MyDateSelect'

function TalnetList() {
    let columns = [
        { title: '达人昵称', dataIndex: 'account_names', key: 'account_names' },
        { title: '商务', dataIndex: 'name', key: 'name' },
        {
            title: '联系人',
            dataIndex: 'liaison_name',
            key: 'liaison_name',
            render: (_, record) => (
                <Tooltip title={() => {
                    return (
                        <div>
                            <div>类型：{record.liaison_type}</div>
                            <div>姓名：{record.liaison_name}</div>
                            <div>微信：{record.liaison_v}</div>
                            <div>电话：{record.liaison_phone}</div>
                            <div>沟通群：{record.crowd_name}</div>
                        </div>
                    )
                }}>
                    <span>{record.liaison_name}</span>
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
        { title: '商务', dataIndex: 'name', key: 'name' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Space size="small">
                    {record.status === '未推进' || record.status === '报备驳回' ? <PlayCircleTwoTone twoToneColor="#f81d22" /> : (record.status === '已推进' || record.status === '报备通过') ? <CheckCircleTwoTone twoToneColor="#4ec990" /> : <ClockCircleTwoTone twoToneColor="#ee9900" />}
                    <span>{record.status}</span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    <a>123</a>
                </Space>
            )
        }
    ]
    if (localStorage.getItem('position') === '商务') {
        columns = columns.filter(item => item.title !== '商务')
    }

    // 传入数据，分页
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
    const fetchData = () => {
        setLoading(true)
        request({
            method: 'post',
            url: '/chance/getTalnetList',
            data: {
                userInfo: {
                    uid: localStorage.getItem('uid'),
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

    // 日期
    const [dateSelect, setDateSelect] = useState()
    const [salemans, setSalemans] = useState()

    // 添加、修改、推进
    const [isShow, setIsShow] = useState(false)
    const [formType, setFormType] = useState('add')
    const [form] = Form.useForm()
    const [isShowSearch, setIsShowSearch] = useState(false)
    const [searchList, setSearchList] = useState([])
    const [isShowPlatform, setIsShowPlatform] = useState(false)
    const [isShowGroup, setIsShowGroup] = useState(false)
    const [isShowProvide, setIsShowProvide] = useState(false)
    // 报备
    const [isShowKeyword, setIsShowKeyword] = useState(false)
    const [hasFuSaleman, setHasFuSaleman] = useState(false)
    const [hasFirstMiddle, setHasFirstMiddle] = useState(false)
    const [hasSecondMiddle, setHasSecondMiddle] = useState(false)
    const [hasGroupFuSaleman, setGroupHasFuSaleman] = useState(false)
    const [hasProvideFuSaleman, setProvideHasFuSaleman] = useState(false)

    // 添加新中间人
    const [isShowMid, setIsShowMid] = useState(false)
    const [formMid] = Form.useForm()
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
    const filterOption = (input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
    const [toGongOrSi, setToGongOrSi] = useState(false)
    const [canPiao, setCanPiao] = useState(false)

    // 查看详情
    const [isShowDetail, setIsShowDetail] = useState(false)
    const [detailType, setDetailType] = useState()
    const [detailData, setDetailData] = useState({
        comment: [],
        online: [],
        group: [],
        provide: []
    })
    const [isShowCheckNo, setIsShowCheckNo] = useState()
    const [checkNoReason, setCheckNoReason] = useState('')
    const [checkNoType, setCheckNoType] = useState('')
    const getDetail = (record) => {
        request({
            method: 'post',
            url: '/talent/getDetail',
            data: {
                cid: record.cid,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    for (let i = 0; i < res.data.data.comment.length; i++) {
                        if (res.data.data.comment[i].label === '达人昵称') {
                            res.data.data.comment[i].span = 4
                        }
                    }
                    for (let i = 0; i < res.data.data.online.length; i++) {
                        for (let j = 0; j < res.data.data.online[i].length; j++) {
                            const element = res.data.data.online[i][j];
                            if (element.label === '常规品线上佣金比例') {
                                element.span = 2
                            }
                        }
                    }
                    for (let i = 0; i < res.data.data.group.length; i++) {
                        if (res.data.data.group[i].label === '其他备注') {
                            res.data.data.group[i].span = 4
                        }
                    }
                    for (let i = 0; i < res.data.data.provide.length; i++) {
                        if (res.data.data.provide[i].label === '买断折扣') {
                            res.data.data.provide[i].span = 1.5
                        }
                        if (res.data.data.provide[i].label === '含退货折扣') {
                            res.data.data.provide[i].span = 1.5
                        }
                        if (res.data.data.provide[i].label === '其他备注') {
                            res.data.data.provide[i].span = 4
                        }
                    }
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
    const checkChance = (type) => {
        request({
            method: 'post',
            url: '/chance/checkChance',
            data: {
                tid: detailData.comment[0].children,
                type: type,
                check_note: checkNoReason,
                userInfo: {
                    uid: localStorage.getItem('uid'),
                    company: localStorage.getItem('company'),
                    department: localStorage.getItem('department'),
                    position: localStorage.getItem('position')
                }
            }
        }).then((res) => {
            if (res.status == 200) {
                if (res.data.code == 200) {
                    fetchData();
                    setIsShowDetail(false);
                    setIsShowCheckNo(false);
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
                    <Form.Item label='商务' name='uid' style={{ marginBottom: '20px' }}>
                        <Select
                            style={{ width: 160 }}
                            options={salemans}
                            onFocus={() => {
                                request({
                                    method: 'post',
                                    url: '/user/getSalemans',
                                    data: {
                                        userInfo: {
                                            uid: localStorage.getItem('uid'),
                                            company: localStorage.getItem('company'),
                                            department: localStorage.getItem('department'),
                                            position: localStorage.getItem('position')
                                        }
                                    }
                                }).then((res) => {
                                    if (res.status == 200) {
                                        if (res.data.code == 200) {
                                            setSalemans(res.data.data)
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
                        />
                    </Form.Item>
                    <Form.Item label='状态' name='status' style={{ marginBottom: '20px' }}>
                        <Select style={{ width: 160 }} options={chanceStatus} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: '20px' }}>
                        <Space size={'large'}>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button type="primary" onClick={() => {
                                selectForm.resetFields();
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
            <Modal
                title={formType == 'add' ? '添加商机' : formType == 'edit' ? '修改商机' : formType == 'advance' ? '推进商机' : formType == 'report' ? '达人合作报备' : ''}
                open={isShow}
                width='40%'
                maskClosable={false}
                onOk={() => { form.submit(); }}
                onCancel={() => { setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList([]); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false); }}
            >
                <Form
                    form={form}
                    onFinish={(values) => {
                        if (formType == 'add') {
                            if (isShowPlatform && values.account_ids.length !== values.account_names.length) {
                                message.error('线上达人的账号和ID数量不一致')
                            } else {
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
                                            setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList([]); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false);
                                            fetchData()
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
                                        setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList([]); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false);
                                        fetchData()
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
                                        setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList([]); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false);
                                        fetchData()
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
                            if (isShowPlatform) {
                                for (let i = 0; i < values.accounts.length; i++) {
                                    const element = values.accounts[i];
                                    request({
                                        method: 'post',
                                        url: '/chance/reportChanceOn',
                                        data: {
                                            cid: values.cid,
                                            talent_name: values.talent_name,
                                            key: i + 1,
                                            ...element,
                                            userInfo: {
                                                uid: localStorage.getItem('uid'),
                                                company: localStorage.getItem('company'),
                                                department: localStorage.getItem('department'),
                                                position: localStorage.getItem('position')
                                            }
                                        }
                                    }).then((res) => {
                                        if (res.status == 200) {
                                            if (res.data.code == 200) {
                                                setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList([]); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false);
                                                fetchData()
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
                            }
                            if (isShowGroup) {
                                request({
                                    method: 'post',
                                    url: '/chance/reportChanceGroup',
                                    data: {
                                        cid: values.cid,
                                        talent_name: values.talent_name,
                                        ...values,
                                        userInfo: {
                                            uid: localStorage.getItem('uid'),
                                            company: localStorage.getItem('company'),
                                            department: localStorage.getItem('department'),
                                            position: localStorage.getItem('position')
                                        }
                                    }
                                }).then((res) => {
                                    if (res.status == 200) {
                                        if (res.data.code == 200) {
                                            setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList([]); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false);
                                            fetchData()
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
                            if (isShowProvide) {
                                request({
                                    method: 'post',
                                    url: '/chance/reportChanceProvide',
                                    data: {
                                        cid: values.cid,
                                        talent_name: values.talent_name,
                                        ...values,
                                        userInfo: {
                                            uid: localStorage.getItem('uid'),
                                            company: localStorage.getItem('company'),
                                            department: localStorage.getItem('department'),
                                            position: localStorage.getItem('position')
                                        }
                                    }
                                }).then((res) => {
                                    if (res.status == 200) {
                                        if (res.data.code == 200) {
                                            setIsShow(false); form.resetFields(); setIsShowSearch(false); setSearchList([]); setIsShowPlatform(false); setIsShowGroup(false); setIsShowProvide(false); setHasFuSaleman(false); setHasFirstMiddle(false); setHasSecondMiddle(false);
                                            fetchData()
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
                        }
                    }}
                >
                    {formType == 'add' ? null : <Form.Item label="商机编号" name="cid" rules={[{ required: true, message: '不能为空' }]}>
                        <Input disabled={true} />
                    </Form.Item>}
                    {formType == 'report' ? <Form.Item label="达人昵称" name="talent_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入达人昵称（公司内部、唯一、比较简单好记）" />
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
                        {hasFirstMiddle ? <Space size='large'>
                            <Form.Item label="一级中间人" name="mid_1" rules={[{ required: true, message: '不能为空' }]}>
                                <Select showSearch placeholder="请输入中间人名称" options={middlemans1} filterOption={filterOption} onChange={(value) => { searchMiddleman1(value) }} onSearch={(value) => { searchMiddleman1(value) }} />
                            </Form.Item>
                            <Form.Item label="一级中间人提成点（%）" name="m_point_1" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space> : null}
                        {hasSecondMiddle ? <Space size='large'>
                            <Form.Item label="二级中间人" name="mid_2" rules={[{ required: true, message: '不能为空' }]}>
                                <Select showSearch placeholder="请输入中间人名称" options={middlemans2} filterOption={filterOption} onChange={(value) => { searchMiddleman2(value) }} onSearch={(value) => { searchMiddleman2(value) }} />
                            </Form.Item>
                            <Form.Item label="二级中间人提成点（%）" name="m_point_2" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber />
                            </Form.Item>
                        </Space> : null}</> : null}
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
                            <Form.Item label="账号ID" name="account_ids" rules={[{ required: true, message: '不能为空' }]}>
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
                            <Form.Item label="达人账号" name="account_names" rules={[{ required: true, message: '不能为空' }]}>
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
                                        <Card key={key} title={`第 ${name + 1} 个账号`} extra={<MinusCircleOutlined onClick={() => remove(name)} />} style={{ marginBottom: '20px' }}>
                                            <Form.Item label="平台" {...restField} name={[name, "platform"]} rules={[{ required: true, message: '不能为空' }]}>
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
                                            <Form.Item label="账号ID" {...restField} name={[name, "account_id"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select
                                                    placeholder="请选择报备的账号ID"
                                                    onChange={(value) => {
                                                        form.setFieldValue('account_id', value)
                                                    }}
                                                    options={form.getFieldValue('accountIdList')}
                                                />
                                            </Form.Item>
                                            <Form.Item label="账号名称" {...restField} name={[name, "account_name"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select
                                                    placeholder="请选择报备的账号名称"
                                                    onChange={(value) => {
                                                        form.setFieldValue('account_name', value)
                                                    }}
                                                    options={form.getFieldValue('accountNameList')}
                                                />
                                            </Form.Item>
                                            <Form.Item label="账号类型" {...restField} name={[name, "account_type"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select
                                                    placeholder="请选择报备的账号类型"
                                                    onChange={(value) => {
                                                        form.setFieldValue('account_type', value)
                                                    }}
                                                    options={accountType}
                                                />
                                            </Form.Item>
                                            <Form.Item label="合作方式" {...restField} name={[name, "account_models"]} rules={[{ required: true, message: '不能为空' }]}>
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
                                            {isShowKeyword ? <Form.Item label="关键字（前后缀）" {...restField} name={[name, "keyword"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Input placeholder="请输入报备的关键字（前后缀）" />
                                            </Form.Item> : null}
                                            <Space size='large'>
                                                <Form.Item label="平时带货在线（人）" {...restField} name={[name, "people_count"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                                <Form.Item label="女粉比例（%）" {...restField} name={[name, "fe_proportion"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                                <Form.Item label="粉丝地域分布（省份）" {...restField} name={[name, "main_province"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Space>
                                            <Form.Item label="粉丝购买主力年龄段（岁）" {...restField} name={[name, "age_cuts"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select mode="multiple" allowClear options={ageCut} />
                                            </Form.Item>
                                            <Form.Item label="平均客单价（元）" {...restField} name={[name, "price_cut"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <Select options={priceCut} />
                                            </Form.Item>
                                            <Form.Item label="常规品线上佣金比例（%）" {...restField} name={[name, "commission"]} rules={[{ required: true, message: '不能为空' }]}>
                                                <InputNumber />
                                            </Form.Item>
                                            <Space size='large'>
                                                <Form.Item label="主商务" {...restField} name={[name, "uid_1"]} >
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
                                                <Form.Item label="副商务" {...restField} name={[name, "uid_2"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <Select
                                                        style={{ width: 160 }}
                                                        options={salemans}
                                                        onFocus={() => {
                                                            request({
                                                                method: 'post',
                                                                url: '/user/getSalemans',
                                                                data: {
                                                                    userInfo: {
                                                                        uid: localStorage.getItem('uid'),
                                                                        company: localStorage.getItem('company'),
                                                                        department: localStorage.getItem('department'),
                                                                        position: localStorage.getItem('position')
                                                                    }
                                                                }
                                                            }).then((res) => {
                                                                if (res.status == 200) {
                                                                    if (res.data.code == 200) {
                                                                        setSalemans(res.data.data)
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
                                                    />
                                                </Form.Item>
                                                <Form.Item label="副商务提成点（%）" {...restField} name={[name, "u_point_2"]} rules={[{ required: true, message: '不能为空' }]}>
                                                    <InputNumber />
                                                </Form.Item>
                                            </Space> : null}
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
                            <Input placeholder="请输入新商机的社群团购达人名称" disabled={formType === 'report' ? true : false} />
                        </Form.Item>
                        {formType === 'report' ? <><Space size='large'>
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
                            <Form.Item label="折扣其他备注" name="discount_note" rules={[{ required: true, message: '不能为空' }]}>
                                <TextArea placeholder="请输入" />
                            </Form.Item>
                            <Space size='large'>
                                <Form.Item label="主商务" name="group_uid_1" >
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
                                <Form.Item label="副商务" name={"group_uid_2"} >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="副商务提成点（%）" name={"group_u_point_2"} >
                                    <InputNumber />
                                </Form.Item>
                            </Space> : null}</> : null}
                    </Card> : null}
                    {isShowProvide ? <Card title="供货" style={{ marginBottom: "20px" }}>
                        <Form.Item label="达人名称" name="provide_name" rules={[{ required: true, message: '不能为空' }]}>
                            <Input placeholder="请输入" disabled={formType === 'report' ? true : false} />
                        </Form.Item>
                        {formType === 'report' ? <><Space size='large'>
                            <Form.Item label="买断折扣（折）" name="discount_buyout" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber placeholder="请输入" />
                            </Form.Item>
                            <Form.Item label="含退货率折扣（折）" name="discount_back" rules={[{ required: true, message: '不能为空' }]}>
                                <InputNumber placeholder="请输入" />
                            </Form.Item>
                        </Space>
                            <Form.Item label="折扣其他备注" name="discount_label" rules={[{ required: true, message: '不能为空' }]}>
                                <TextArea placeholder="请输入" />
                            </Form.Item>
                            <Space size='large'>
                                <Form.Item label="主商务" name="provide_uid_1" >
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
                                <Form.Item label="副商务" name={"provide_uid_2"} >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="副商务提成点（%）" name={"provide_u_point_2"} >
                                    <InputNumber />
                                </Form.Item>
                            </Space> : null}</> : null}
                    </Card> : null}
                    {formType == 'add' ? <Form.Item label="寻找证明" name="search_pic" rules={[{ required: true, message: '不能为空' }]} >
                        <UpLoadImg title="上传寻找证明" name="addSearchPic" setPicUrl={(value) => { form.setFieldValue('search_pic', value) }} />
                    </Form.Item> : null}
                    {formType == 'advance' || (formType == 'edit' && form.getFieldValue('status') == '已推进') ? <><Form.Item label="联系人类型" name="liaison_type" rules={[{ required: true, message: '不能为空' }]}>
                        <Select
                            allowClear
                            style={{
                                width: '100%',
                            }}
                            placeholder="请选择"
                            onChange={(value) => {
                                form.setFieldValue('liaison_type', value)
                            }}
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
            </Modal>
            <Modal
                title='添加新中间人'
                open={isShowMid}
                maskClosable={false}
                onOk={() => { formMid.submit(); }}
                onCancel={() => { setIsShowMid(false); formMid.resetFields(); setToGongOrSi(false); setCanPiao(false) }}
            >
                <Form
                    form={formMid}
                    onFinish={(values) => {
                        request({
                            method: 'post',
                            url: '/middleman/addMiddleman',
                            data: {
                                ...values,
                                userInfo: {
                                    uid: localStorage.getItem('uid'),
                                    company: localStorage.getItem('company'),
                                    department: localStorage.getItem('department'),
                                    position: localStorage.getItem('position')
                                }
                            }
                        }).then((res) => {
                            if (res.status == 200) {
                                if (res.data.code == 200) {
                                    setIsShowMid(false)
                                    setToGongOrSi(false)
                                    setCanPiao(false)
                                    formMid.resetFields()
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
                    <Form.Item label="类型" name="type" rules={[{ required: true, message: '不能为空' }]}>
                        <Select placeholder="请选择" options={middleType} />
                    </Form.Item>
                    <Form.Item label="中间人名称" name="name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="联系人姓名" name="liaison_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="联系人微信" name="liaison_v" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="联系人电话" name="liaison_phone" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="付款方式" name="pay_way" rules={[{ required: true, message: '不能为空' }]}>
                        <Radio.Group onChange={(e) => { setToGongOrSi(e.target.value); }} value={toGongOrSi}>
                            <Radio value={true}>对公</Radio>
                            <Radio value={false}>对私</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {toGongOrSi ? <><Form.Item label="能否开票" name="can_piao" rules={[{ required: true, message: '不能为空' }]}>
                        <Radio.Group onChange={(e) => { setCanPiao(e.target.value); }} value={canPiao}>
                            <Radio value={true}>能</Radio>
                            <Radio value={false}>不能</Radio>
                        </Radio.Group>
                    </Form.Item>
                        {canPiao ? <Form.Item label="税点（%）" name="shui_point" rules={[{ required: true, message: '不能为空' }]}>
                            <InputNumber placeholder="请输入" />
                        </Form.Item> : null}</> : null}
                    <Form.Item label="收款姓名" name="pay_name" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="开户行" name="pay_bank" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="收款账号" name="pay_account" rules={[{ required: true, message: '不能为空' }]}>
                        <Input placeholder="请输入" />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={detailType == 'look' ? '达人详情' : '达人审批'}
                open={isShowDetail}
                width='60%'
                maskClosable={false}
                onCancel={() => { setIsShowDetail(false); }}
                footer={detailType == 'look' ? [] : [
                    <Button key="submit" type="primary" danger onClick={() => { setIsShowCheckNo(true); setCheckNoType('write') }}>
                        不通过
                    </Button>,
                    <Button key="back" type="primary" onClick={() => { checkChance(true) }}>
                        通过
                    </Button>
                ]}
            >
                <Card title="通用信息" style={{ marginBottom: '20px' }}>
                    <Descriptions bordered column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4, }} items={detailData.comment} />
                </Card>
                {detailData.online.length !== 0 ? detailData.online.map((item, key) => {
                    return (
                        <Card title={`合作模式：线上平台 【${item[0].children}】`} key={key} style={{ marginBottom: '20px' }}>
                            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4, }} items={item.slice(1)} />
                        </Card>
                    )
                }) : null}
                {detailData.group.length !== 0 ? <Card title={`合作模式：社群团购`} style={{ marginBottom: '20px' }}>
                    <Descriptions bordered column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4, }} items={detailData.group} />
                </Card> : null}
                {detailData.provide.length !== 0 ? <Card title={`合作模式：供货`} style={{ marginBottom: '20px' }}>
                    <Descriptions bordered column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4, }} items={detailData.provide} />
                </Card> : null}
            </Modal>
            <Modal
                title={checkNoType === 'write' ? '达人审批不通过理由填写' : '查看达人报备驳回理由'}
                open={isShowCheckNo}
                maskClosable={false}
                onCancel={() => { setIsShowCheckNo(false); setCheckNoReason(''); }}
                footer={checkNoType == 'look' ? [] : [
                    <Button key="submit" onClick={() => { setIsShowCheckNo(false); setCheckNoReason(''); }}>
                        取消
                    </Button>,
                    <Button key="back" type="primary" onClick={() => { checkChance(false) }}>
                        确认
                    </Button>
                ]}
            >
                <TextArea placeholder="请输入达人审批不通过的理由" value={checkNoReason} onChange={(e) => { setCheckNoReason(e.target.value) }} disabled={checkNoType == 'look' ? true : false}></TextArea>
            </Modal>
        </div >
    )
}

export default TalnetList