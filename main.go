package main

import (
    "fmt"
    "net/http"

    "taskmanager/plugin_manager"
)

func main() {
    pm := plugin_manager.NewPluginManager()

    // Load enabled plugins from JSON file
    if err := pm.LoadEnabledPlugins("plugins.json"); err != nil {
        fmt.Printf("Error loading plugins: %v\n", err)
        return
    }

    http.HandleFunc("/", pm.HandleRequest) // Use plugin manager's handler

    fmt.Println("Server listening on :8080")
    http.ListenAndServe(":8080", nil)
}
