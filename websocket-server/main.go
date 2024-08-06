package main

import (
	"log"
	"time"
	"net/http"
	"github.com/gorilla/websocket"
	"github.com/streadway/amqp"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var connections []*websocket.Conn

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	connections = append(connections, conn)
}

func connectRabbitMQ() (*amqp.Connection, *amqp.Channel, error) {
	var conn *amqp.Connection
	var ch *amqp.Channel
	var err error

	for i := 0; i < 5; i++ {
		conn, err = amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
		if err == nil {
			break
		}
		log.Println("Failed to connect to RabbitMQ, retrying...", err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		return nil, nil, err
	}

	ch, err = conn.Channel()
	if err != nil {
		return nil, nil, err
	}

	return conn, ch, nil
}


func main() {
	conn, ch, err := connectRabbitMQ()
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ:", err)
	}
	defer conn.Close()
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
		log.Fatal(err)
	}

	http.HandleFunc("/ws", handleWebSocket)

	go func() {
		msgs, err := ch.Consume(
			q.Name, // queue
			"",     // consumer
			true,   // auto-ack
			false,  // exclusive
			false,  // no-local
			false,  // no-wait
			nil,    // args
		)
		if err != nil {
			log.Fatal(err)
		}

		for d := range msgs {
			for _, conn := range connections {
				if err := conn.WriteMessage(websocket.TextMessage, d.Body); err != nil {
					log.Println("write:", err)
					conn.Close()
				}
			}
		}
	}()

	log.Println("Listening WEBSOCKET on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

