package plugin_manager

import (
    "net/http"
)

// Plugin represents a plugin module
type Plugin interface {
    Routes() map[string]http.HandlerFunc
}

// PluginManager manages registered plugins
type PluginManager struct {
    plugins map[string]Plugin // map of plugin name to Plugin instance
}

// NewPluginManager creates a new PluginManager
func NewPluginManager() *PluginManager {
    return &PluginManager{
        plugins: make(map[string]Plugin),
    }
}

// RegisterPlugin registers a plugin with the given name
func (pm *PluginManager) RegisterPlugin(name string, plugin Plugin) {
    pm.plugins[name] = plugin
}

// HandleRequest handles incoming requests
func (pm *PluginManager) HandleRequest(w http.ResponseWriter, r *http.Request) {
    for _, plugin := range pm.plugins { // Iterate through all registered plugins
        for route, handler := range plugin.Routes() {
            if route == r.URL.Path {
                handler(w, r) // Call the handler if the route matches
                return
            }
        }
    }
    http.NotFound(w, r) // No matching route found
}
