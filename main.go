package main

import (
    "fmt"
    "net/http"
    "strings"
    "taskmanager/database"
    "taskmanager/plugin_manager"
)

func main() {
    pm := plugin_manager.NewPluginManager()

    database.Initialize("root:@(localhost:3306)/test")
    // Load enabled plugins from JSON file
    if err := pm.LoadEnabledPlugins("plugins.json"); err != nil {
        fmt.Printf("Error loading plugins: %v\n", err)
        return
    }

    fs := http.FileServer(http.Dir("./svelte2/demo/dist")) // Create the FileServer first
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Check if the request path starts with "/api/"
        if strings.HasPrefix(r.URL.Path, "/api/") {
            // If yes, let the plugin manager handle it
            pm.HandleRequest(w, r)
        } else {
            // Otherwise, serve the Svelte app (index.html or other Svelte paths)
            fs.ServeHTTP(w, r) // Use the FileServer instance 
        }
    })

    fmt.Println("Server listening on :8080")
    http.ListenAndServe(":8080", nil)
}
