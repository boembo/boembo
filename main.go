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
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}

type Group struct {
	ID        int       `gorm:"primaryKey"`
	ProjectID int       `gorm:"not null"`
	Name      string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type TaskUser struct {
	TaskID int `gorm:"not null"`
	UserID int `gorm:"not null"`
}



var db *gorm.DB

func connectDB() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_NAME"),
	)

	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Connected to database")

	// Auto Migrate tables
	err = db.AutoMigrate(&User{}, &UserSetting{}, &Project{}, &Task{}, &TaskUser{} , &Group{})
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

	w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string][]Task{"tasks": tasks})
}




// Add a function for parsing and handling the JWT token
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
		GroupID     string `json:"group_id"`
		ProjectID   string `json:"project_id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Status      string `json:"status"`
		UserIDs     []int  `json:"user_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	groupID, err := strconv.Atoi(req.GroupID)
	if err != nil {
		http.Error(w, "Invalid group_id format", http.StatusBadRequest)
		return
	}

	projectID, err := strconv.Atoi(req.ProjectID)
	if err != nil {
		http.Error(w, "Invalid project_id format", http.StatusBadRequest)
		return
	}

	if groupID == 0 || projectID == 0 || req.Title == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Check and create default group if it doesn't exist
	var group Group
	groupName := ""
	switch groupID {
	case 1:
		groupName = "To Do"
	case 2:
		groupName = "In Progress"
	case 3:
		groupName = "Completed"
	default:
		http.Error(w, "Invalid group_id", http.StatusBadRequest)
		return
	}

	// Look for the group in the database
	if err := db.Where("project_id = ? AND name = ?", projectID, groupName).First(&group).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Group not found, create it
			group = Group{
				ProjectID:   projectID,
				Name:        groupName,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}
			if err := db.Create(&group).Error; err != nil {
				http.Error(w, "Error creating group", http.StatusInternalServerError)
				return
			}
		} else {
			http.Error(w, "Error checking for group", http.StatusInternalServerError)
			return
		}
	}

	task := Task{
		GroupID:     group.ID,
		ProjectID:   projectID,
		Title:       req.Title,
		Description: req.Description,
		Status:      "test",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := db.Create(&task).Error; err != nil {
		http.Error(w, "Error creating task", http.StatusInternalServerError)
		return
	}

	// Assign users to the task
	for _, userID := range req.UserIDs {
		taskUser := TaskUser{
			TaskID: task.ID,
			UserID: userID,
		}
		if err := db.Create(&taskUser).Error; err != nil {
			http.Error(w, "Error assigning users to task", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
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

	var group Group
	if err := json.NewDecoder(r.Body).Decode(&group); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := db.Create(&group).Error; err != nil {
		http.Error(w, "Error creating group", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(group)
}