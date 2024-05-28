// task/task.go
package task

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type Task struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	ListID int    `json:"list_id"`
	SortNo int    `json:"sort_no"`
}

type TaskManager struct {
	DB *sql.DB
}

func New(db *sql.DB) *TaskManager {
	return &TaskManager{DB: db}
}

func (tm *TaskManager) Routes() map[string]http.HandlerFunc {
	return map[string]http.HandlerFunc{
		"/api/task": tm.HandleTasks,
	}
}

func (tm *TaskManager) HandleTasks(w http.ResponseWriter, r *http.Request) {
	rows, err := tm.DB.Query("SELECT id, title, list_id, sort_no FROM tasks ORDER BY sort_no ASC")
	if err != nil {
		http.Error(w, "Internal server error 2", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var task Task
		if err := rows.Scan(&task.ID, &task.Title, &task.ListID, &task.SortNo); err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		tasks = append(tasks, task)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}
