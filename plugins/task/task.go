package task

import (
    "fmt"
    "net/http"
)

type TaskPlugin struct{}

func New() *TaskPlugin { 
    return &TaskPlugin{}
}

func (tp *TaskPlugin) Routes() map[string]http.HandlerFunc {
    return map[string]http.HandlerFunc{
        "/task": tp.handleTask,
    }
}

func (tp *TaskPlugin) handleTask(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "Hello from Task module!")
}
