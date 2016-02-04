package main

import (
	"flag"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", "localhost:12345", "http service address")

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Rect struct {
	ID, X, Y, Height, Width int
}

func messages(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	i := 5
	rect := Rect{ID: 1, X: 10, Y: 0, Height: 50, Width: 50}
	for {
		// mt, message, err := c.ReadMessage()
		// if err != nil {
		// 	log.Println("read:", err)
		// 	break
		// }
		// log.Printf("recv: %s", message)

		if err := c.WriteJSON(rect); err != nil {
			log.Println("write:", err)
			break
		}
		// i += 5

		if rect.X > 500 {
			i = -5
		} else if rect.X == 0 {
			i = 5
		}

		rect.X += i
		// rect.Y += i
		// log.Println(rect)
		time.Sleep(15 * time.Millisecond)
		// time.Sleep(1 * time.Second)
	}
}

// func home(w http.ResponseWriter, r *http.Request) {
// 	homeTemplate.Execute(w, "ws://"+r.Host+"/messages")
// }

func main() {
	flag.Parse()
	log.SetFlags(0)
	http.HandleFunc("/messages", messages)
	// http.HandleFunc("/", home)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
