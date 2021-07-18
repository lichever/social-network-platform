package main

import (
    "fmt"
    "log"
    "net/http" 
    jwtmiddleware "github.com/auth0/go-jwt-middleware"
    jwt "github.com/form3tech-oss/jwt-go" 

    "github.com/gorilla/mux"
)

func main() {
    fmt.Println("started-service")
    
    jwtMiddleware := jwtmiddleware.New(jwtmiddleware.Options{ // for decoding the token
        ValidationKeyGetter: func(token *jwt.Token) (interface{}, error) {
            return []byte(mySigningKey), nil
        },
        SigningMethod: jwt.SigningMethodHS256,
    })
    
    //同一package 可以共享这些 全局 的 小写的variable
    // fmt.Println(string(mySigningKey))
    // fmt.Println(mediaTypes)

    
    // http.HandleFunc("/upload", uploadHandler)
    
    r := mux.NewRouter()
    // r.Handle("/upload", http.HandlerFunc(uploadHandler)).Methods("POST", "OPTIONS")
    /* 
    这里也可用r.HandleFunc(path string, f func(http.ResponseWriter,
	*http.Request)) which is a syntatic sugar for r.Handle
    */

    // r.Handle("/search", http.HandlerFunc(searchHandler)).Methods("GET", "OPTIONS")


    //这里除了signup，signin 都需token验证？？因为这2个 signup不用，signin是创建新token 都才是第一步，但需要额外的保护 恶意登录or注册
    r.Handle("/upload", jwtMiddleware.Handler(http.HandlerFunc(uploadHandler))).Methods("POST", "OPTIONS")//decorative pattern
    r.Handle("/search", jwtMiddleware.Handler(http.HandlerFunc(searchHandler))).Methods("GET", "OPTIONS")
    r.Handle("/signup", http.HandlerFunc(signupHandler)).Methods("POST", "OPTIONS")
    r.Handle("/signin", http.HandlerFunc(signinHandler)).Methods("POST", "OPTIONS")

    r.Handle("/post/{id}", jwtMiddleware.Handler(http.HandlerFunc(deleteHandler))).Methods("DELETE", "OPTIONS")


    log.Fatal(http.ListenAndServe(":8080", r))//因为firewall开放了8080端口，我们这里go代码监听8080，另外9200给ES的


    // fmt.Fprintf(os.Stdout, "Post received: %q\n", `This is a pos\t \n from " Vincent`)
    // fmt.Fprintf(os.Stdout, "Post received: %q\n", `he \nllo`)





}
