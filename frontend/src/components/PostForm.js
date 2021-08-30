import React ,{forwardRef} from 'react';
import { Form, Upload, Input } from "antd";
import { InboxOutlined } from "@ant-design/icons";



//这里用 forwardRef 是因为 PostForm是函数组件，传给父级的时候 必须包一层 forwardRef
export const PostForm=forwardRef((props,formRef)=> {

    // console.log(props )
    console.log("formRef ",formRef )

    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 }
    };


    //拿到upload 内容
    const normFile = (e) => {
        console.log("Upload event:", e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };



    //阻止文件自动上传：删除action和 设置beforeUpload->false
    //formRef 就是父亲的 callback 函数，这里又传进Form组件：this.postForm= FromInstance
    //这里因为这个Form没有显性的 事件上传数据；而且这个form是antd的，所以要通过FromInstance的getvalue拿数据
    return (

    <Form name="validate_other" {...formItemLayout} ref={formRef}>
        <Form.Item
            name="description"
            label="Message"

            rules={[
                {
                    required: true,
                    message: "Please input your description!"
                }
            ]}

        >
            <Input />
        </Form.Item >


        <Form.Item label="Dragger">
            <Form.Item
                name="uploadPost"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                noStyle
                rules={[
                    {
                        required: true,
                        message: "Please select an image/video!"
                    }
                ]}
            >
                <Upload.Dragger name="files" beforeUpload={() => false}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                        Click or drag file to this area to upload
                    </p>
                </Upload.Dragger>
            </Form.Item>

        </Form.Item>


    </Form>



    );
})
