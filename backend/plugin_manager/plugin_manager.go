// plugin_manager.go
package plugin_manager

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"taskmanager/database"
	"taskmanager/plugins/task"
	// "taskmanager/plugins/user"
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

// LoadEnabledPlugins loads enabled plugins based on a JSON file
func (pm *PluginManager) LoadEnabledPlugins(filename string) error {
	// Read the JSON file
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}

	// Unmarshal JSON data into a map
	var pluginConfig map[string]bool
	if err := json.Unmarshal(data, &pluginConfig); err != nil {
		return err
	}

	// Load enabled plugins
	for name, enabled := range pluginConfig {
		if enabled {
			switch name {
			case "task":
				pm.RegisterPlugin(name, task.New(database.GetDB())) // Load task plugin with DB connection
			// case "user":
			// 	pm.RegisterPlugin(name, user.New(database.GetDB())) // Load user plugin with DB connection
			// Add cases for other plugins as needed
			default:
				fmt.Printf("Unknown plugin: %s\n", name)
			}
		}
	}

	return nil
}
