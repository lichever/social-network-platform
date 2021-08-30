import React, {useState} from 'react';
import {Input, Radio} from "antd";

import {SEARCH_KEY} from "../constants";

const {Search} = Input;


function SearchBar(props) {

    const [searchType, setSearchType] = useState(SEARCH_KEY.all);
    const [error, setError] = useState("");


    const changeSearchType = (e) => {
        //case1: display error msg
        //- searchtype!==all && value ==""
        //case2: clear error

        const searchType = e.target.value;
        setSearchType(searchType);
        setError("");//Radio变化了 先清空

        //如果是非all type 则由handleSearch 解决
        if (searchType === SEARCH_KEY.all) {
            props.handleSearch({ type: searchType, keyword: "" });
        }


    };


    const handleSearch = (value) => {
        if (searchType !== SEARCH_KEY.all && value === "") {
            setError("Please input your search keyword!");
            return;
        }


        console.log("click search ", value)
        setError("");//也要清除
        props.handleSearch({ type: searchType, keyword: value });//把数据传回home组件

    };


    return (

        <div className="search-bar">
            <Search
                placeholder="input search text"
                enterButton="Search"
                size="large"
                onSearch={handleSearch}
                disabled={searchType === SEARCH_KEY.all}//search is uncontrolled radio is controlled
            />
            <p className="error-msg">{error}</p>

            <Radio.Group
                onChange={changeSearchType}
                value={searchType}
                className="search-type-group"
            >
                <Radio value={SEARCH_KEY.all}>All</Radio>
                <Radio value={SEARCH_KEY.keyword}>Keyword</Radio>
                <Radio value={SEARCH_KEY.user}>User</Radio>
            </Radio.Group>
        </div>
    );


}

export default SearchBar;