import React, { Fragment, useEffect, useState } from "react";
import { Card, Table, Space, Form, Input, Modal, Button, Image, List, Select, Tooltip, Radio, InputNumber, Descriptions, message } from 'antd';
const { TextArea } = Input;
import { PlusOutlined, CheckCircleTwoTone, ClockCircleTwoTone, MinusCircleOutlined, PlayCircleTwoTone } from '@ant-design/icons';
import request from '../service/request'
import { useLocation } from 'react-router-dom'

function TalentDetail() {
    let location = useLocation();
    const { tid, type } = location.state;

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

    // 查看详情
    const [isShowDetail, setIsShowDetail] = useState(false)
    const [detailData, setDetailData] = useState({
        comment: [],
        online: [],
        group: [],
        provide: []
    })
    const [isShowCheckNo, setIsShowCheckNo] = useState()
    const [checkNoReason, setCheckNoReason] = useState('')
    const [checkNoType, setCheckNoType] = useState('')
    const checkChance = (type) => {
        request({
            method: 'post',
            url: '/chance/checkChance',
            data: {
                cid: detailData.comment[3].children,
                toid: detailData.comment[0].children,
                tgid: detailData.comment[1].children,
                tpid: detailData.comment[2].children,
                type: type,
                check_note: checkNoReason,
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

    useEffect(() => {
        getTalentDetail();
    }, [tid])
    return (
        <Fragment>
            <div>{tid}</div>
            <Modal
                title={type == 'look' ? '达人详情' : '达人审批'}
                open={isShowDetail}
                width='60%'
                maskClosable={false}
                onCancel={() => { setIsShowDetail(false); }}
                footer={type == 'look' ? [] : [
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
        </Fragment>

    )
}

export default TalentDetail