package user

import (
    "fmt"
    "net/http"
)

// UserPlugin struct to represent the user plugin
type UserPlugin struct{}

// New creates a new UserPlugin instance
func New() *UserPlugin {
    return &UserPlugin{}
}

// Routes defines the routes and their corresponding handlers for the UserPlugin
func (up *UserPlugin) Routes() map[string]http.HandlerFunc {
    return map[string]http.HandlerFunc{
        "/user": up.handleUser, // Associate the "/user" route with handleUser
    }
}

// handleUser is the handler function for the "/user" route
func (up *UserPlugin) handleUser(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "Hello from User module!")
}
