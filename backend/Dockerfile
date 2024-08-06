
# Use the official Golang image
FROM golang:1.22

# Set the working directory
WORKDIR /go/src/app

# Copy the Go application code
COPY . .

RUN go get
# Build the Go app
RUN go build main .

# Expose the port the app runs on
EXPOSE 8080

# Run the app
CMD ["./main"]
