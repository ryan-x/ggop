package main

import (
	"flag"
	"log"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/ryan-x/goop/physics"
)

//go:generate browserify frontend/index.js -o static/bundle.js
//go:generate go-bindata -o static.go -prefix "static" static/...

const (
	KeyRight = "39"
	KeyLeft  = "37"
	KeyUp    = "38"
	KeyDown  = "40"
)

var (
	contentTypes = map[string]string{
		".css":  "text/css",
		".js":   "text/javascript",
		".html": "text/html",
	}
)

var addr = flag.String("addr", "localhost:12345", "http service address")

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Rect struct {
	ID, Height, Width int
	X, Y              float64
	XVector, YVector  physics.Vector
}

func (r *Rect) Tick() {
	if r.XVector.Magnitude() > 0 {
		r.X += float64(r.XVector)
	}

	if r.YVector.Magnitude() > 0 {
		r.Y += float64(r.YVector)
	}
}

func Friction(v physics.Vector) physics.Vector {
	if v.Magnitude() < 1 {
		return physics.Vector(0.0)
	}

	if v.Direction() == physics.PositiveDirection {
		return physics.AddVectors(v, physics.Vector(-1.0))
	}
	return physics.AddVectors(v, physics.Vector(1.0))
}

func messages(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	// i := 5
	rect := Rect{ID: 1, X: 10, Y: 0, Height: 50, Width: 50}
	go func() {
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				break
			}
			log.Printf("recv: %s", message)
			msg := string(message)

			if msg == KeyRight {
				rect.XVector = physics.AddVectors(rect.XVector, physics.Vector(20))
			} else if msg == KeyLeft {
				rect.XVector = physics.AddVectors(rect.XVector, physics.Vector(-20.0))
			}

			if msg == KeyUp {
				rect.YVector = physics.AddVectors(rect.YVector, physics.Vector(20))
			} else if msg == KeyDown {
				rect.YVector = physics.AddVectors(rect.YVector, physics.Vector(-20))
			}

		}
	}()
	for {
		rect.Tick()
		if err := c.WriteJSON(rect); err != nil {
			log.Println("write:", err)
			break
		}
		rect.XVector = Friction(rect.XVector)
		rect.YVector = Friction(rect.YVector)
		// i += 5

		// if rect.X > 50 {
		// 	i = -5
		// } else if rect.X == 0 {
		// 	i = 5
		// }

		// rect.X += i
		// rect.Y += i
		// log.Println(rect)
		time.Sleep(15 * time.Millisecond)
		// time.Sleep(1 * time.Second)
	}
}

func home(w http.ResponseWriter, r *http.Request) {
	assetPath := r.URL.Path

	if strings.HasSuffix(assetPath, "/") {
		assetPath += "index.html"
	}

	if ct, ok := contentTypes[path.Ext(assetPath)]; ok {
		w.Header().Set("Content-Type", ct)
	}

	data, err := Asset(assetPath[1:])
	if err != nil {
		http.NotFound(w, r)
	} else {
		w.Write(data)
	}
}

func main() {
	flag.Parse()
	log.SetFlags(0)
	http.HandleFunc("/messages", messages)
	http.HandleFunc("/", home)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
