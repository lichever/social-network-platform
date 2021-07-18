package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "path/filepath"
    "regexp"
    "time"

    jwt "github.com/form3tech-oss/jwt-go"  //alias
    "github.com/gorilla/mux"   
    "github.com/pborman/uuid"

)

var mySigningKey = []byte("****")


var (
    mediaTypes = map[string]string{
        ".jpeg": "image",
        ".jpg":  "image",
        ".gif":  "image",
        ".png":  "image",
        ".mov":  "video",
        ".mp4":  "video",
        ".avi":  "video",
        ".flv":  "video",
        ".wmv":  "video",
    }
)



func uploadHandler(w http.ResponseWriter, r *http.Request) {
    // Parse from body of request to get a json object.
    fmt.Println("Received one post request")

	w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
    w.Header().Set("Access-Control-Allow-Methods", "POST,OPTIONS")

    if r.Method == "OPTIONS" {
        fmt.Fprintf(w, "Options received.\n")
        return
    }

   /*  decoder := json.NewDecoder(r.Body)
    var p Post
    if err := decoder.Decode(&p); err != nil {
        panic(err)
    }
	
	

    fmt.Fprintf(w, "Post received: %s\n", p.Message)
    fmt.Fprintf(w, "Post received: %s\n", p.Url) */




    // 经过token验证后，从token里面 拿出来user 而不是request body， 以免冒充他人
    user := r.Context().Value("user") //固定用法 看github
    claims := user.(*jwt.Token).Claims
    username := claims.(jwt.MapClaims)["username"]

    //这次request body不是json格式了 是 multipart
        p := Post{
        Id: uuid.New(),
        // User: r.FormValue("user"),
        User: username.(string),
        Message: r.FormValue("message"),
    }



    file, header, err := r.FormFile("media_file")
    if err != nil {
        http.Error(w, "Media file is not available", http.StatusBadRequest)
        fmt.Printf("Media file is not available %v\n", err)
        return
    }

    suffix := filepath.Ext(header.Filename)
    if t, ok := mediaTypes[suffix]; ok {
        p.Type = t
    } else {
        p.Type = "unknown"
    }

    err = savePost(&p, file)
    if err != nil {
        http.Error(w, "Failed to save post to GCS or Elasticsearch", http.StatusInternalServerError)
        fmt.Printf("Failed to save post to GCS or Elasticsearch %v\n", err)
        return
    }

    fmt.Println("Post is saved successfully.")


}



func searchHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("Received one request for search")

    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
    w.Header().Set("Content-Type", "application/json")

    if r.Method == "OPTIONS" {
        return
    }

    user := r.URL.Query().Get("user") //类似servlet里的get para
    keywords := r.URL.Query().Get("keywords")

    var posts []Post
    var err error

    if user != "" {//默认 先searchPostsByUser
        posts, err = searchPostsByUser(user)
    } else {
        posts, err = searchPostsByKeywords(keywords)
    }

    if err != nil {
        http.Error(w, "Failed to read post from Elasticsearch", http.StatusInternalServerError)
        fmt.Printf("Failed to read post from Elasticsearch %v.\n", err)
        return
    }

    js, err := json.Marshal(posts)
    if err != nil {
        http.Error(w, "Failed to parse posts into JSON format", http.StatusInternalServerError)
        fmt.Printf("Failed to parse posts into JSON format %v.\n", err)
        return
    }
    w.Write(js)
}

func signinHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("Received one signin request")
    w.Header().Set("Content-Type", "text/plain")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    if r.Method == "OPTIONS" {
        return
    }

    //  Get User information from client
    decoder := json.NewDecoder(r.Body)
    var user User
    if err := decoder.Decode(&user); err != nil {
        http.Error(w, "Cannot decode user data from client", http.StatusBadRequest)
        fmt.Printf("Cannot decode user data from client %v\n", err)
        return
    }

    exists, err := checkUser(user.Username, user.Password)
    if err != nil {
        http.Error(w, "Failed to read user from Elasticsearch", http.StatusInternalServerError)
        fmt.Printf("Failed to read user from Elasticsearch %v\n", err)
        return
    }

    if !exists {
        http.Error(w, "User doesn't exists or wrong password", http.StatusUnauthorized)
        fmt.Printf("User doesn't exists or wrong password\n")
        return
    }

    // 如果用户名和密码 没毛病 
    //sign in 会新建一个token 发给用户 期限为24小时，其实jwt适合短时间的auth
    //这里的claims 里面数据比较简单, 不能含密码！
    //这里也暴露JWT的安全隐患，因为
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{

        "username": user.Username,
        "exp":      time.Now().Add(time.Hour * 24).Unix(),
    })


    tokenString, err := token.SignedString(mySigningKey)
    if err != nil {
        http.Error(w, "Failed to generate token", http.StatusInternalServerError)
        fmt.Printf("Failed to generate token %v\n", err)
        return
    }

    w.Write([]byte(tokenString))
}

func signupHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("Received one signup request")
    w.Header().Set("Content-Type", "text/plain")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    if r.Method == "OPTIONS" {
        return
    }

    decoder := json.NewDecoder(r.Body)
    var user User
    if err := decoder.Decode(&user); err != nil {
        http.Error(w, "Cannot decode user data from client", http.StatusBadRequest)
        fmt.Printf("Cannot decode user data from client %v\n", err)
        return
    }

    if user.Username == "" || user.Password == "" || regexp.MustCompile(`^[a-z0-9]$`).MatchString(user.Username) {
        http.Error(w, "Invalid username or password", http.StatusBadRequest)
        fmt.Printf("Invalid username or password\n")
        return
    }

    success, err := addUser(&user)
    if err != nil {
        http.Error(w, "Failed to save user to Elasticsearch", http.StatusInternalServerError)
        fmt.Printf("Failed to save user to Elasticsearch %v\n", err)
        return
    }

    if !success {
        http.Error(w, "User already exists", http.StatusBadRequest)
        fmt.Println("User already exists")
        return
    }
    fmt.Printf("User added successfully: %s.\n", user.Username)
}


func deleteHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("Received one delete for search")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")

    if r.Method == "OPTIONS" {
        return
    }

    user := r.Context().Value("user")
    claims := user.(*jwt.Token).Claims
    username := claims.(jwt.MapClaims)["username"].(string)
    id := mux.Vars(r)["id"]

    if err := deletePost(id, username); err != nil {
        http.Error(w, "Failed to delete post from Elasticsearch", http.StatusInternalServerError)
        fmt.Printf("Failed to delete post from Elasticsearch %v\n", err)
        return
    }
    fmt.Println("Post is deleted successfully")
}
