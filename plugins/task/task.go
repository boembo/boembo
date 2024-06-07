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

type ListWithTasks struct {
    ID       int     `json:"id"`
    ListName string  `json:"list_name"`
    Tasks    []Task `json:"tasks"`
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
		"/api/task/sort": tm.HandleTaskSort,
	}
}
func (tm *TaskManager) HandleTasks(w http.ResponseWriter, r *http.Request) {
    // Query to get tasks with their list_name
    query := `
        SELECT t.id, t.title, t.list_id, t.sort_no, l.name AS list_name
        FROM tasks t
        JOIN lists l ON t.list_id = l.id
        ORDER BY t.sort_no ASC
    `

    rows, err := tm.DB.Query(query)
    if err != nil {
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    // Group tasks by list_id and list_name
    taskMap := make(map[int]ListWithTasks) // Keyed by list_id

    for rows.Next() {
        var task Task
        var listName string
        if err := rows.Scan(&task.ID, &task.Title, &task.ListID, &task.SortNo, &listName); err != nil {
            http.Error(w, "Internal server error", http.StatusInternalServerError)
            return
        }

        list, ok := taskMap[task.ListID]
        if !ok {
            list = ListWithTasks{ID: task.ListID, ListName: listName, Tasks: []Task{}} // Initialize new list if not found
        }
        list.Tasks = append(list.Tasks, task)
        taskMap[task.ListID] = list
    }

    // Convert map to slice for response
    var lists []ListWithTasks
    for _, list := range taskMap {
        lists = append(lists, list)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(lists)
}

func (tm *TaskManager) HandleTaskSort(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Tasks  []Task `json:"tasks"`
		ListID int    `json:"list_id"`
	}

	// Parse JSON request body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update each task's sort_no and list_id in the database
	for i, task := range requestBody.Tasks {
		_, err := tm.DB.Exec(
			"UPDATE tasks SET sort_no = ?, list_id = ? WHERE id = ?",
			i,
			requestBody.ListID,
			task.ID,
		)
		if err != nil {
			http.Error(w, "Error updating task order", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK) // Success
}