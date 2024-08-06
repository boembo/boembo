
# Use the official Golang image
FROM golang:1.22

# Set the working directory
WORKDIR /usr/src/api

# Copy the Go application code
COPY . .

RUN go get
# Build the Go app
RUN go build -o app

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD ["./app"]
