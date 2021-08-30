import React, {Component} from 'react';
import {Modal, Button, message} from "antd";
import axios from "axios";

import {PostForm} from './PostForm'
import {BASE_URL, TOKEN_KEY} from '../constants'

class CreatePostButton extends Component {

    state = {
        visible: false,
        confirmLoading: false
    };

   showModal = () => {
        this.setState({
            visible: true
        });
    };



    handleOk = () => {

        //step1: show loading

        this.setState({
            confirmLoading: true

        });


        //step2. collect post info: message + image/video
        //下面的form-ref 存入到 类组件的 属性里面，这样才能拿出来在这里用
        // console.log(this.postForm)//拿到PostForm的 forminstance

        this.postForm
            .validateFields()
            .then((form) => {
                const {description, uploadPost} = form;
                const {type, originFileObj} = uploadPost[0];
                const postType = type.match(/^(image|video)/g)[0];


                console.log('form',form)
                console.log('type',type)
                console.log('postType',postType)

                if (postType) {

                    let formData = new FormData();
                    formData.append("message", description);
                    formData.append("media_file", originFileObj);


                    const opt = {
                        method: "POST",
                        url: `${BASE_URL}/upload`,
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                        },
                        data: formData
                    };

                    //step3, send post info to server
                    axios(opt)
                        .then((res) => {
                            if (res.status === 200) {

                                message.success("The image/video is uploaded!");
                                this.postForm.resetFields();//清空formInstance的内容
                                this.handleCancel();
                                this.setState({ confirmLoading: false });
                                this.props.onShowPost(postType);//auto refresh display area
                            }


                        })
                        .catch(
                            (err) => {

                                console.log("Upload image/video failed: ", err.message);
                                message.error("Failed to upload image/video!");
                                this.setState({confirmLoading: false});
                                this.handleCancel();//也要关闭窗口

                            }
                        )


                }


            })
            .catch((err) => {
                    console.log("err ir validate form -> ", err);
                }
            )


    }


    handleCancel = () => {
        console.log("Clicked cancel button");
        this.setState({
            visible: false
        });
    };


    render() {

        const {visible, confirmLoading} = this.state;

        return (

            <div>

                <Button type="primary" onClick={this.showModal}>
                    Create New Post
                </Button>
                <Modal
                    visible={visible}
                    onOk={this.handleOk}
                    title="Create New Post"
                    onCancel={this.handleCancel}
                    okText="Create"
                    confirmLoading={confirmLoading}
                >

                    <PostForm ref={(refInstance) => {(this.postForm = refInstance) ;
                        console.log(refInstance)}  }/>


                </Modal>

            </div>

        );
        //因为 postForm 没有button的onclick的事件 显式的把数据传给父级，所以这里只能用ref 传递 去拿子组件的 数据。
        //如果postForm有 显式事件 比如button，那么就可以用函数 把数据传递回去。
        //这里refinstance 拿的就是 PostForm里面的 formInstance
        //2种ref 创建方式：1.React.createRef  2. callback
    }
}

export default CreatePostButton;