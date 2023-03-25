package backend

import "github.com/gorilla/websocket"

type Connection struct {
	connection *websocket.Conn
}

func (con *Connection) Connect(url string) error {
	var err error
	con.connection, _, err = websocket.DefaultDialer.Dial(url, nil)
	return err
}

func (con *Connection) Close() {
	con.connection.Close()
}

func (con *Connection) Read() ([]byte, error) {
	_, message, err := con.connection.ReadMessage()
	return message, err
}

func (con *Connection) Write(message []byte) error {
	return con.connection.WriteMessage(websocket.TextMessage, message)
}
