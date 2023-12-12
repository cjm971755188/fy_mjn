import React from "react";
import { Image } from 'antd';
import { BASE_URL } from '../service/config'

class FilePreview extends React.Component {
    
    render () {
        const { fileUrl, fileType } = this.props;
        
        if (fileType === 'image') {
            return <Image width={100} src={`${BASE_URL}/${fileUrl}`} />
        }

        if (fileType === 'pdf') {
            return <embed src={`${BASE_URL}/${fileUrl}`} type="application/pdf" width={100} />
        }

        if (fileType === 'excel' || fileType === 'word') {
            return (
                <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${BASE_URL}/${fileUrl}`}
                    width={100}
                />
            )
        }

        return null
    }
}

export default FilePreview