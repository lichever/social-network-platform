package main
import (
    "fmt"
    "reflect"

    "github.com/olivere/elastic/v7"
)


const (
    USER_INDEX = "user"
)

type User struct {
    Username string `json:"username"`
    Password string `json:"password"`
    Age      int64  `json:"age"`
    Gender   string `json:"gender"`
}


/* 
2 functions: checkUser, addUser

*/

// 检查用户的用户名 和密码
func checkUser(username, password string) (bool, error) {
    query := elastic.NewBoolQuery()
    query.Must(elastic.NewTermQuery("username", username))// 注意是must 不加返回可以是空
    query.Must(elastic.NewTermQuery("password", password))
    searchResult, err := readFromES(query, USER_INDEX)
    if err != nil {
        return false, err
    }

    var utype User
    for _, item := range searchResult.Each(reflect.TypeOf(utype)) {
        if u, ok := item.(User); ok {
            if u.Password == password {
                fmt.Printf("Login as %s\n", username)
                return true, nil
            }
        }
    }
    return false, nil  //  just for completeness
}


//如果新建的 用户名 和 密码 符合 规范，就添加用户信息到ES
func addUser(user *User) (bool, error) {
    query := elastic.NewTermQuery("username", user.Username)
    searchResult, err := readFromES(query, USER_INDEX)
    if err != nil {//search err
        return false, err
    }

    if searchResult.TotalHits() > 0 {// 有可能多线程冲突 所以要 大于
        return false, nil
    }

    err = saveToES(user, USER_INDEX, user.Username)
    if err != nil {
        return false, err
    }
    fmt.Printf("User is added: %s\n", user.Username)
    return true, nil
}



