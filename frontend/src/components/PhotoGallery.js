import React, {useState, useEffect} from 'react';
import PropTypes from "prop-types";
import Gallery from "react-grid-gallery";
import {Button, message, Modal} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {BASE_URL, TOKEN_KEY} from "../constants";
import axios from "axios";


//overlay format
const captionStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    maxHeight: "240px",
    overflow: "hidden",
    position: "absolute",
    bottom: "0",
    width: "100%",
    color: "white",
    padding: "2px",
    fontSize: "90%"
};

const wrapperStyle = {
    display: "block",
    minHeight: "1px",
    width: "100%",
    border: "1px solid #ddd",
    overflow: "auto"
};

function PhotoGallery(props) {
    const [images, setImages] = useState(props.images);
    const [curImgIdx, setCurImgIdx] = useState(0);


    // console.log(props.images)

    const imageArr = images.map((image) => {//这里用images 而不是props.images 可以在delete后直接refresh
        return {
            ...image,
            customOverlay: (
                <div style={captionStyle}>
                    <div>{`${image.user}: ${image.caption}`}</div>
                </div>
            )
        };

        // console.log(props.images)


    });


    const onCurrentImageChange = (index) => {
        setCurImgIdx(index);


    }

    const onDeleteImage = () => {
        //step1: confirm to delete
        //step2: find the current  select image
        //step3: make a delete request to the server

        if (window.confirm('Are you sure you want to delete this image?')) {

            const curImg = images[curImgIdx];
            const newImageArr = images.filter((img, index) => index !== curImgIdx);

            console.log("delete curImg: ", curImg);


            const opt = {
                method: "DELETE",
                url: `${BASE_URL}/post/${curImg.postId}`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                }
            };
            axios(opt)
                .then((res) => {
                    // console.log("delete result -> ", res);
                    // case1: success
                    if (res.status === 200) {
                        // step1: set state
                        setImages(newImageArr);



                    }


                })
                .catch((err) => {
                    // case2: fail
                    message.error("Fetch posts failed!");
                    console.log("fetch posts failed: ", err.message);
                });

        }


    }


    // customControls can add more buttons for diff functions
    return (
        <div style={wrapperStyle}>
            <Gallery images={imageArr}
                     enableImageSelection={false}
                     backdropClosesModal={true}
                     currentImageWillChange={onCurrentImageChange}


                     customControls={[
                         <Button
                             style={{marginTop: "10px", marginLeft: "5px"}}
                             key="deleteImage"
                             type="primary"
                             icon={<DeleteOutlined/>}
                             size="small"
                             onClick={onDeleteImage}
                         >
                             Delete Image
                         </Button>
                     ]}


            />
        </div>

    );
}

// typechecking props  一般用在开发阶段
PhotoGallery.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            postId: PropTypes.string.isRequired,
            user: PropTypes.string.isRequired,
            caption: PropTypes.string.isRequired,
            src: PropTypes.string.isRequired,
            thumbnail: PropTypes.string.isRequired,
            thumbnailWidth: PropTypes.number.isRequired,
            thumbnailHeight: PropTypes.number.isRequired
        })
    ).isRequired
};



export default PhotoGallery;