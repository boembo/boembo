package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
	"github.com/gorilla/mux"
"github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
"github.com/streadway/amqp"
)

type Credentials struct {
	Token string `json:"token"`
}

type Claims struct {
	UserID int  `json:"user_id"`
	jwt.StandardClaims
}

type User struct {
	ID        int       `gorm:"primaryKey"`
	Name      string    `gorm:"not null"`
	Email     string    `gorm:"unique;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type UserSetting struct {
	ID        int       `gorm:"primaryKey"`
	UserID    int       `gorm:"not null"`
	Type      string    `gorm:"not null"`
	Settings  string    `gorm:"type:json;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type Project struct {
	ID        int       `gorm:"primaryKey"`
	Name      string    `gorm:"not null"`
	UserID    int       `gorm:"not null"`
	Pinned    bool      `gorm:"default:false"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type Task struct {
	ID          int       `json:"id" gorm:"primaryKey"`
	GroupID     int       `gorm:"not null"`
	ProjectID   int       `gorm:"not null"`
	Title       string    `gorm:"not null"`
	Description string    `gorm:"not null"`
	Status      string    `gorm:"not null"`
	Order       int       `gorm:"not null"` // Add this field
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}


type Group struct {
	ID        int       `gorm:"primaryKey"`
	ProjectID int       `gorm:"not null"`
	Name      string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
	Order     int       `gorm:"not null"`
}

type TaskUser struct {
	TaskID int `gorm:"not null"`
	UserID int `gorm:"not null"`
}
var (
    requests = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "golang_requests_total",
            Help: "Total number of requests",
        },
        []string{"method"},
    )
)

func init() {
    prometheus.MustRegister(requests)
}

func handler(w http.ResponseWriter, r *http.Request) {
    requests.WithLabelValues(r.Method).Inc()
    w.Write([]byte("Hello, world!"))
}


var db *gorm.DB
func connectDB() {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
    os.Getenv("DB_USER"),
    os.Getenv("DB_PASSWORD"),
    os.Getenv("DB_HOST"),
    os.Getenv("DB_PORT"),
    os.Getenv("DB_NAME"))


	var err error
	count := 0
	maxRetries := 30

	for {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			log.Println("Not ready. Retry connecting...")
			time.Sleep(time.Second)
			count++
			log.Println(count)
			if count >= maxRetries {
				log.Fatalf("Failed to connect to database after %d retries: %v", maxRetries, err)
			}
			continue
		}

		log.Println("Connected to database")
		break
	}

	// Auto Migrate tables
	err = db.AutoMigrate(&User{}, &UserSetting{}, &Project{}, &Task{}, &TaskUser{}, &Group{})
	if err != nil {
		log.Fatalf("Failed to auto migrate tables: %v", err)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	connectDB()

http.Handle("/metrics", promhttp.Handler())

	r := mux.NewRouter()
	r.HandleFunc("/api/auth/google", googleAuthHandler)
	r.HandleFunc("/api/data", dataHandler) // Example endpoint to test CORS
	r.HandleFunc("/api/user", userHandler)
	r.HandleFunc("/api/settings/save", saveSettingsHandler)
	r.HandleFunc("/api/widgetSettings", getSettingsHandler)
r.HandleFunc("/api/projects", getProjectsHandler)
	r.HandleFunc("/api/projects/save", createProjectHandler)
r.HandleFunc("/api/projects/pin", pinProjectHandler)

r.HandleFunc("/api/projects/{projectId}/tasks", getTasksHandler) // New endpoint to get tasks
	r.HandleFunc("/api/projects/{projectId}/createTasks", createTaskHandler) // New endpoint to create a task
	r.HandleFunc("/api/tasks/update", updateTaskHandler) // New endpoint to update a task
	r.HandleFunc("/api/tasks/delete", deleteTaskHandler) 

r.HandleFunc("/api/groups/create", createGroupHandler)
r.HandleFunc("/api/projects/{projectId}/groups/update", updateGroupOrderHandler)
	// Add CORS middleware
	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler(r)

	log.Println("Server started at :3000")
	http.ListenAndServe(":3000", handler)
}

func userHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var user User
	if err := db.Where("id = ?", claims.UserID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Error fetching user data", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func googleAuthHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	oauth2Service, err := oauth2.NewService(ctx, option.WithAPIKey(os.Getenv("CLIENT_ID")))
	if err != nil {
		http.Error(w, "Failed to create OAuth2 service", http.StatusInternalServerError)
		return
	}

	tokenInfo, err := oauth2Service.Tokeninfo().IdToken(creds.Token).Context(ctx).Do()
	if err != nil {
		http.Error(w, "Failed to validate token", http.StatusUnauthorized)
		return
	}

	var user User 
	result := db.Where("email = ?", tokenInfo.Email).First(&user)
	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		return
	}

	if result.Error == gorm.ErrRecordNotFound {
		newUser := User{
			Name:  tokenInfo.Email,
			Email: tokenInfo.Email,
		}

		err := db.Create(&newUser).Error
		if err != nil {
			http.Error(w, "Failed to create new user", http.StatusInternalServerError)
			return
		}

		log.Printf("New user created: %s\n", newUser.Email)
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := Claims{
		UserID: user.ID ,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	jwtKey := []byte(os.Getenv("JWT_SECRET"))
	tokenString, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Failed to generate JWT", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"userData": map[string]string{
			"email": tokenInfo.Email,
		},
	})
}

func dataHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"data": "Your secured data"})
}


func saveSettingsHandler(w http.ResponseWriter, r *http.Request) {
    log.Println("start save setting")

    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, "Authorization header missing", http.StatusUnauthorized)
        return
    }
    tokenString := authHeader[len("Bearer "):]

    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("JWT_SECRET")), nil
    })
    if err != nil || !token.Valid {
        http.Error(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    // Parse request body to get new layout settings
    var newSettings map[string]interface{}
    if err := json.NewDecoder(r.Body).Decode(&newSettings); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Convert new settings to JSON string
    settingsJSON, err := json.Marshal(newSettings["newLayout"])
    if err != nil {
        http.Error(w, "Failed to serialize settings", http.StatusInternalServerError)
        return
    }

    // Check if the user already has layout settings
    var userSetting UserSetting
    result := db.Where("user_id = ? AND type = ?", claims.UserID, "layout_settings").First(&userSetting)

    if result.Error == nil {
        // Update existing setting
        userSetting.Settings = string(settingsJSON)
        userSetting.UpdatedAt = time.Now()

        if err := db.Save(&userSetting).Error; err != nil {
            http.Error(w, "Failed to update user settings: "+err.Error(), http.StatusInternalServerError)
            return
        }

        w.WriteHeader(http.StatusOK)
    } else if result.Error == gorm.ErrRecordNotFound {
        // Create new setting if not found
        userSetting = UserSetting{
            UserID:    claims.UserID,
            Type:      "layout_settings",
            Settings:  string(settingsJSON),
            CreatedAt: time.Now(),
            UpdatedAt: time.Now(),
        }

        if err := db.Create(&userSetting).Error; err != nil {
            http.Error(w, "Failed to save user settings: "+err.Error(), http.StatusInternalServerError)
            return
        }

        w.WriteHeader(http.StatusCreated)
    } else {
        // Handle other possible errors
        http.Error(w, "Failed to query user settings: "+result.Error.Error(), http.StatusInternalServerError)
        return
    }

    // Respond with success message or the updated user setting
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Layout settings saved successfully",
        "data":    userSetting,
    })
}





func getSettingsHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var userSettings UserSetting
	err = db.Where("user_id = ?", claims.UserID).First(&userSettings).Error
	if err != nil {
		http.Error(w, "Failed to retrieve user settings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userSettings.Settings)
}


func getProjectsHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var projects []Project
	if err := db.Where("user_id = ?", claims.UserID).Find(&projects).Error; err != nil {
		http.Error(w, "Error fetching projects", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string][]Project{"projects": projects})
}

func createProjectHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var project Project
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	project.UserID = claims.UserID
	if err := db.Create(&project).Error; err != nil {
		http.Error(w, "Error creating project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}



func pinProjectHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var req struct {
		ProjectID int `json:"project_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.ProjectID == 0 {
		http.Error(w, "Project ID cannot be empty", http.StatusBadRequest)
		return
	}

	var project Project
	if err := db.Where("id = ?", req.ProjectID).First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Project not found", http.StatusNotFound)
		} else {
			http.Error(w, "Error fetching project", http.StatusInternalServerError)
		}
		return
	}

	// Update the project's pinned status
	project.Pinned = !project.Pinned
	if err := db.Save(&project).Error; err != nil {
		http.Error(w, "Error updating project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}




func getTasksHandler(w http.ResponseWriter, r *http.Request) {
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, "Authorization header missing", http.StatusUnauthorized)
        return
    }
    tokenString := authHeader[len("Bearer "):]

    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("JWT_SECRET")), nil
    })
    if err != nil || !token.Valid {
        http.Error(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    projectID := mux.Vars(r)["projectId"]

    var tasks []Task
    if err := db.Where("project_id = ?", projectID).Find(&tasks).Error; err != nil {
        http.Error(w, "Error fetching tasks", http.StatusInternalServerError)
        return
    }

    var groups []Group
    if err := db.Where("project_id = ?", projectID).Find(&groups).Error; err != nil {
        http.Error(w, "Error fetching groups", http.StatusInternalServerError)
        return
    }

    // Create a combined response structure
    response := struct {
        Tasks  []Task  `json:"tasks"`
        Groups []Group `json:"groups"`
    }{
        Tasks:  tasks,
        Groups: groups,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}



var defaultGroups = []struct {
    ID   int
    Name string
}{
    {1, "To Do"},
    {2, "Processing"},
    {3, "Complete"},
}


func createTaskHandler(w http.ResponseWriter, r *http.Request) {
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, "Authorization header missing", http.StatusUnauthorized)
        return
    }

    tokenString := authHeader[len("Bearer "):]
    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("JWT_SECRET")), nil
    })
    if err != nil || !token.Valid {
        http.Error(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    var req struct {
        GroupID     string `json:"GroupID"`
        ProjectID   string `json:"ProjectID"`
        Title       string `json:"Title"`
        Description string `json:"Description"`
        UserIDs     []int  `json:"UserIDs"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    groupID, err := strconv.Atoi(req.GroupID)
    if err != nil {
        http.Error(w, "Invalid group ID format", http.StatusBadRequest)
        return
    }

    projectID, err := strconv.Atoi(req.ProjectID)
    if err != nil {
        http.Error(w, "Invalid project ID format", http.StatusBadRequest)
        return
    }

    if groupID == 0 || projectID == 0 || req.Title == "" {
        http.Error(w, "Missing required fields", http.StatusBadRequest)
        return
    }

    var group Group
    if err := db.First(&group, groupID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            // Check if groupID matches any default group
            var defaultGroupName string
            for _, defaultGroup := range defaultGroups {
                if defaultGroup.ID == groupID {
                    defaultGroupName = defaultGroup.Name
                    break
                }
            }
            if defaultGroupName == "" {
                http.Error(w, "Invalid group ID", http.StatusBadRequest)
                return
            }
            // Create new group
            newGroup := Group{
                ID:        groupID,
                ProjectID: projectID,
                Name:      defaultGroupName,
                Order:     groupID, // Assuming default order is the same as ID
                CreatedAt: time.Now(),
                UpdatedAt: time.Now(),
            }
            if err := db.Create(&newGroup).Error; err != nil {
                http.Error(w, "Error creating new group", http.StatusInternalServerError)
                return
            }
            group = newGroup
        } else {
            http.Error(w, "Error fetching group", http.StatusInternalServerError)
            return
        }
    }

    // Shift orders of existing tasks in the group
    if err := db.Model(&Task{}).Where("group_id = ?", groupID).Update("order", gorm.Expr("`order` + 1")).Error; err != nil {
        http.Error(w, "Error updating task orders", http.StatusInternalServerError)
        return
    }

    newTask := Task{
        GroupID:     groupID,
        ProjectID:   projectID,
        Title:       req.Title,
        Description: req.Description,
        Status:      "test",
        Order:       0,
        CreatedAt:   time.Now(),
        UpdatedAt:   time.Now(),
    }

    if err := db.Create(&newTask).Error; err != nil {
        http.Error(w, "Error creating task", http.StatusInternalServerError)
        return
    }

    for _, userID := range req.UserIDs {
        taskUser := TaskUser{
            TaskID: newTask.ID,
            UserID: userID,
        }
        if err := db.Create(&taskUser).Error; err != nil {
            http.Error(w, "Error assigning users to task", http.StatusInternalServerError)
            return
        }
    }

    // Publish the event to RabbitMQ
    conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
    if err != nil {
        http.Error(w, "Error connecting to RabbitMQ", http.StatusInternalServerError)
        return
    }
    defer conn.Close()

    ch, err := conn.Channel()
    if err != nil {
        http.Error(w, "Error creating RabbitMQ channel", http.StatusInternalServerError)
        return
    }
    defer ch.Close()

    q, err := ch.QueueDeclare(
        "task_events", // name
        true,          // durable
        false,         // delete when unused
        false,         // exclusive
        false,         // no-wait
        nil,           // arguments
    )
    if err != nil {
        http.Error(w, "Error declaring RabbitMQ queue", http.StatusInternalServerError)
        return
    }

    body, err := json.Marshal(newTask)
    if err != nil {
        http.Error(w, "Error marshalling task", http.StatusInternalServerError)
        return
    }

    err = ch.Publish(
        "",     // exchange
        q.Name, // routing key
        false,  // mandatory
        false,  // immediate
        amqp.Publishing{
            ContentType: "application/json",
            Body:        body,
        })
    if err != nil {
        http.Error(w, "Error publishing message to RabbitMQ", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(newTask)
}




func updateTaskHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var task Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := db.Save(&task).Error; err != nil {
		http.Error(w, "Error updating task", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

func deleteTaskHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var task Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := db.Delete(&task).Error; err != nil {
		http.Error(w, "Error deleting task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func reorderTasksHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var req struct {
		GroupID int   `json:"groupId"`
		TaskIDs []int `json:"taskIds"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.GroupID == 0 || len(req.TaskIDs) == 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	for order, taskID := range req.TaskIDs {
		if err := db.Model(&Task{}).Where("id = ? AND group_id = ?", taskID, req.GroupID).Update("order", order).Error; err != nil {
			http.Error(w, "Error reordering tasks", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}


func updateGroupOrderHandler(w http.ResponseWriter, r *http.Request) {
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, "Authorization header missing", http.StatusUnauthorized)
        return
    }
    tokenString := authHeader[len("Bearer "):]

    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("JWT_SECRET")), nil
    })
    if err != nil || !token.Valid {
        http.Error(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    var req struct {
        Groups []struct {
            ID    string `json:"id"`
            Name  string `json:"name"`
            Tasks []struct {
                ID    string `json:"id"`
                Index int    `json:"index"` // This is the new order index
            } `json:"tasks"`
        } `json:"groups"`
        ProjectID string `json:"projectId"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    // Update task orders in the database
    for groupIndex, group := range req.Groups {
        if err != nil {
            http.Error(w, "Invalid group ID format", http.StatusBadRequest)
            return
        }

			if err := db.Model(&Group{}).Where("id = ?", group.ID).Update("order", groupIndex).Error; err != nil {
                http.Error(w, "Error updating task order", http.StatusInternalServerError)
                return
            }
				
			groupID, _ := strconv.Atoi(group.ID)
			for taskIndex, task := range group.Tasks {
				taskID, err := strconv.Atoi(task.ID)
				if err != nil {
					http.Error(w, "Invalid task ID format", http.StatusBadRequest)
					return
				}

				if err := db.Model(&Task{}).Where("id = ?", taskID).Updates(map[string]interface{}{"order": taskIndex, "group_id": groupID}).Error; err != nil {
					http.Error(w, "Error updating task order", http.StatusInternalServerError)
					return
				}
			}
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(req.Groups)
}




func createGroupHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var req struct {
		ProjectID int    `json:"projectId"`
		Name      string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.ProjectID == 0 || req.Name == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	var maxOrder int
	if err := db.Model(&Group{}).Where("project_id = ?", req.ProjectID).Select("IFNULL(MAX(`order`), 0)").Scan(&maxOrder).Error; err != nil {
		http.Error(w, "Error getting max order", http.StatusInternalServerError)
		return
	}

	group := Group{
		ProjectID: req.ProjectID,
		Name:      req.Name,
		Order:     maxOrder + 1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.Create(&group).Error; err != nil {
		http.Error(w, "Error creating group", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(group)
}
