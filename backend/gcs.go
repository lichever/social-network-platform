 	package main

import (
    "context"
    "fmt"
    "io"

    "cloud.google.com/go/storage"
)

const (
    BUCKET_NAME = "****"
)

func saveToGCS(r io.Reader, objectName string) (string, error) {
    ctx := context.Background()//提供一个运行时的 空白的 context ？ 

    client, err := storage.NewClient(ctx)
    if err != nil {
        return "", err
    }

object := client.Bucket(BUCKET_NAME).Object(objectName)
    wc := object.NewWriter(ctx)

    if _, err := io.Copy(wc, r); err != nil {//this is a blocking call
        return "", err
    }

    if err := wc.Close(); err != nil {
        return "", err
    }

    if err := object.ACL().Set(ctx, storage.AllUsers, storage.RoleReader); err != nil {
        return "", err
    }

    attrs, err := object.Attrs(ctx)
    if err != nil {
        return "", err
    }

    fmt.Printf("Image is saved to GCS: %s\n", attrs.MediaLink)
    return attrs.MediaLink, nil
}
