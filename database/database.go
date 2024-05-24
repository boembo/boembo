// database/database.go
package database

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

var db *sql.DB

// Initialize initializes the database connection
func Initialize(connString string) {
	var err error
	db, err = sql.Open("postgres", connString)
	if err != nil {
		log.Fatalf("Error connecting to the database: %v\n", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Error pinging the database: %v\n", err)
	}
}

// GetDB returns the database connection
func GetDB() *sql.DB {
	return db
}
