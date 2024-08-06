
# Use the official Golang image
FROM golang:1.22

# Set the working directory
WORKDIR /usr/src/websocket

# Copy the Go application code
COPY . .
# Build the Go app
RUN go build -o app

# Expose the port the app runs on
EXPOSE 8080

# Run the app
CMD ["./app"]
