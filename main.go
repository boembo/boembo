package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

type Credentials struct {
	Token string `json:"token"`
}

type Claims struct {
	UserID string `json:"user_id"`
	jwt.StandardClaims
}

type User struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey"`
	Name      string    `gorm:"not null"`
	Email     string    `gorm:"unique;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type UserSetting struct {
	ID        uuid.UUID      `gorm:"type:char(36);primaryKey"`
	UserID    uuid.UUID      `gorm:"type:char(36);not null"`
	Type      string         `gorm:"not null"`
	Settings  string		`gorm:"type:json;not null"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
}

type Project struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey"`
	Name      string    `gorm:"not null"`
	UserID    uuid.UUID `gorm:"type:char(36);not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
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
	err = db.AutoMigrate(&User{}, &UserSetting{}, &Project{})
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

	mux := http.NewServeMux()
	mux.HandleFunc("/api/auth/google", googleAuthHandler)
	mux.HandleFunc("/api/data", dataHandler) // Example endpoint to test CORS
	mux.HandleFunc("/api/user", userHandler)
	mux.HandleFunc("/api/settings/save", saveSettingsHandler)
	mux.HandleFunc("/api/widgetSettings", getSettingsHandler)
mux.HandleFunc("/api/projects", getProjectsHandler)
	mux.HandleFunc("/api/projects/save", createProjectHandler)
	// Add CORS middleware
	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler(mux)

	log.Println("Server started at :3000")
	http.ListenAndServe(":3000", handler)
}

func userHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Get the token from the Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[len("Bearer "):]

	// 2. Parse and validate the JWT token
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// 3. Fetch the user from the database based on the userID in the claims
	var user User
	if err := db.Where("id = ?", claims.UserID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Error fetching user data", http.StatusInternalServerError)
		}
		return
	}

	// 4. Send the user data in the response
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

	// Check if user exists in database, create if not
	var user User 
	result := db.Where("email = ?", tokenInfo.Email).First(&user)
	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		return
	}

	if result.Error == gorm.ErrRecordNotFound {
		// User not found, create new user
		newUser := User{
			ID:    uuid.New(),
			Name:  tokenInfo.Email, // Set the name to email for demonstration purpose
			Email: tokenInfo.Email,
		}

		// Persist new user to database
		err := db.Create(&newUser).Error
		if err != nil {
			http.Error(w, "Failed to create new user", http.StatusInternalServerError)
			return
		}

		log.Printf("New user created: %s\n", newUser.Email)
	}

	// Generate JWT token
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := Claims{
		UserID: user.ID.String(), // Assuming user is fetched from database
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

	// Return JWT token and user data in response
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
            ID:        uuid.New(),
            UserID:    uuid.MustParse(claims.UserID),
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

	userID := uuid.MustParse(claims.UserID)
	var projects []Project
	if err := db.Where("user_id = ?", userID).Find(&projects).Error; err != nil {
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

	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Project name cannot be empty", http.StatusBadRequest)
		return
	}

	userID := uuid.MustParse(claims.UserID)
	project := Project{
		ID:        uuid.New(),
		Name:      req.Name,
		UserID:    userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.Create(&project).Error; err != nil {
		http.Error(w, "Error creating project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}
