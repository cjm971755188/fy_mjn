import React from "react";
import { Image } from 'antd';
import { BASE_URL } from '../service/config'

class FilePreview extends React.Component {
    
    render () {
        const { fileUrl, fileType } = this.props;
        
        if (fileType === 'image') {
            return <Image width={50} src={`${BASE_URL}/${fileUrl}`} />
        }

        if (fileType === 'pdf') {
            return <embed src={`${BASE_URL}/${fileUrl}`} type="application/pdf" width={50} height={50} />
        }

        if (fileType === 'excel' || fileType === 'word') {
            return (
                <span>{fileUrl.split('_')[3]}</span>
            )
            /* return (
                <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${BASE_URL}/${fileUrl}`}
                    width={50}
                    height={50}
                />
            ) */
        }

        return null
    }
}

export default FilePreview