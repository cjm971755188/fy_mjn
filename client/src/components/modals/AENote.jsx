import React, { useEffect, useState } from "react";
import { Modal, Input } from 'antd';

const { TextArea } = Input;

function AENote(props) {
    const { title, isShow, value } = props;

    const [note, setNote] = useState()

    useEffect(() => {
        setNote(value);
    }, [isShow])
    return (
        <Modal
            title={title}
            open={isShow}
            maskClosable={false}
            onOk={() => { props.onOk(note); }}
            onCancel={() => { props.onCancel(); setNote(); }}
        >
            <TextArea placeholder="请输入" maxLength={255} value={note} onChange={(e) => { setNote(e.target.value); }} />
        </Modal>
    )
}

export default AENote