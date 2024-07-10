package main

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/dgrijalva/jwt-go"
    "github.com/joho/godotenv"
    "github.com/rs/cors"
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

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file")
    }

    mux := http.NewServeMux()
    mux.HandleFunc("/api/auth/google", googleAuthHandler)
    mux.HandleFunc("/api/data", dataHandler) // Example endpoint to test CORS

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

    expirationTime := time.Now().Add(24 * time.Hour)
    claims := Claims{
        UserID: tokenInfo.UserId,
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: expirationTime.Unix(),
        },
    }

    jwtKey := []byte("your_secret_key")
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
