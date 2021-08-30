import React, {useEffect, useState} from "react";
import SearchBar from './SearchBar';
import {Tabs, message, Row, Col, Button} from "antd";
import {BASE_URL, SEARCH_KEY, TOKEN_KEY} from '../constants'
import axios from 'axios'
import PhotoGallery from "./PhotoGallery";
import CreatePostButton from './CreatePostButton'


const {TabPane} = Tabs;


function Home(props) {

    const [posts, setPost] = useState([]);

    const [activeTab, setActiveTab] = useState("image");

    const [searchOption, setSearchOption] = useState({
        type: SEARCH_KEY.all,
        keyword: ""
    });

    //how to get posts from the server
    // didMount+ didUpdate
    //下面的searchbar和PhotoGallery都可能导致 调用useEffect
    useEffect(() => {
        // do search the first time =>didMount-> search:{type:all, value:""}
        //after the first time=>didUpdate-> search:{type: key/user, value: keyword}

        const {type, keyword} = searchOption;
        fetchPost(searchOption);

    }, [searchOption])


    const fetchPost = option => {
        // get search option
        //make a request to the server to fetch posts

        const {type, keyword} = option;
        let url = "";


        if (type === SEARCH_KEY.all) {
            url = `${BASE_URL}/search`;
        } else if (type === SEARCH_KEY.user) {
            url = `${BASE_URL}/search?user=${keyword}`;
        } else {
            url = `${BASE_URL}/search?keywords=${keyword}`;
        }

        //config opt for axios request
        const opt = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        };

        axios(opt).then(res => {
                if (res.status === 200) {
                    //res->posts
                    setPost(res.data);
                }

            }
        ).catch(err => {
                message.error("Fetch posts failed!");
                console.log("fetch posts failed: ", err.message);
            }
        );
    }


    const renderPosts = (type) => {
        //case1: type===image
        //case2: type===video

        if (!posts || posts.length === 0) {
            return <div>No data!</div>;

        }
        if (type === "image") {
            //prepare image data
            const imageArr = posts.filter(item => item.type === "image")
                .map(image => {
                    return {

                        postId: image.id,
                        src: image.url,
                        thumbnail: image.url,
                        user: image.user,
                        caption: image.message,
                        thumbnailWidth: 300,
                        thumbnailHeight: 200


                    }
                });


            console.log("images -> ", posts);
            console.log("imageArr -> ", imageArr);

            return <PhotoGallery images={imageArr}/>;


            //return a grid: gutter间距32 and span 8 一行3个; 给key={post.url}是因为在row下面相同的元素
        } else if (type === "video") {
            console.log("video -> ", posts);
            return (
                <Row gutter={32}>
                    {posts
                        .filter((post) => post.type === "video")
                        .map((post) => (
                            <Col span={8} key={post.url}>
                                <video src={post.url}
                                       controls={true}
                                       className="video-block"/>
                                <p>
                                    {post.user}: {post.message}
                                </p>
                            </Col>
                        ))}
                </Row>
            );

        }


    }


    const handleSearch = (option) => {

        // console.log(option)
        // const {type, keyword} = option;
        // setSearchOption({type: type, keyword: keyword});
        setSearchOption(option);
    };


    //upload成功后 通知home组件 可以刷新下
    const showPost = (type) => {
        //回来的type 是image 或者 video

        // console.log("type -> ", type);
        // console.log("searchOption", searchOption)


        setActiveTab(type);

        setTimeout(() => {
            setSearchOption({type: SEARCH_KEY.all, keyword: ""});
        }, 3000);//refresh home
    };




    const operations = <CreatePostButton onShowPost={showPost}/>;

    return (
        <div className="home">
            <SearchBar handleSearch={handleSearch}/>

            <div className="display">
                <Tabs
                    onChange={(key) => setActiveTab(key)}
                    defaultActiveKey="image"
                    activeKey={activeTab}

                    tabBarExtraContent={operations}
                >
                    <TabPane tab="Images" key="image">
                        {renderPosts("image")}

                    </TabPane>
                    <TabPane tab="Videos" key="video">
                        {renderPosts("video")}

                    </TabPane>
                </Tabs>
            </div>


        </div>
    );

}

export default Home;