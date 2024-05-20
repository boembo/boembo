package main

import (
    "fmt"
    "net/http"

    "taskmanager/plugin_manager"
    "taskmanager/plugins/task"
    "taskmanager/plugins/user"
)

func main() {
    pm := plugin_manager.NewPluginManager()

    pm.RegisterPlugin("task", task.New()) // Use New() to initialize the plugin
    pm.RegisterPlugin("user", user.New()) // Use New() to initialize the plugin

    http.HandleFunc("/", pm.HandleRequest) // Use plugin manager's handler

    fmt.Println("Server listening on :8080")
    http.ListenAndServe(":8080", nil)
}
