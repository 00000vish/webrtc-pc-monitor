package backend

import (
	"strings"

	helpers "github.com/00000vish/webrtc-pc-viewer/helpers"
	services "github.com/00000vish/webrtc-pc-viewer/services"
	"github.com/pion/webrtc/v3"
)

type Listener struct {
	Id         string
	Server     *Server
	Connection *Connection
	WebRTC     *services.WebRTC
	signal     *helpers.Signal
}

func (listener *Listener) Initialize(id string, server *Server, webRTC *services.WebRTC) {
	listener.Id = id
	listener.Server = server
	listener.WebRTC = webRTC
	listener.signal = &helpers.Signal{}
}

func (listener *Listener) Run() {

	listener.Connection = &Connection{}
	error := listener.Connection.Connect(listener.Server.ProtocolAddress("ws"))
	if error != nil {
		panic(error)
	}
	listener.Connection.Write(([]byte)("machineId " + listener.Id))

	go func() {
		for {
			message, err := listener.Connection.Read()
			if err != nil {
				listener.Connection.Close()
				break
			}
			listener.parse(string(message))
		}
	}()
}

func (listener *Listener) parse(command string) {

	split := strings.Split(command, " ")

	if len(split) < 2 {
		return
	}

	if split[0] != "connect" {
		return
	}

	var transmitMode int = 1

	switch split[1] {
	case "screen":
		transmitMode = 2
		break
	case "camera":
		transmitMode = 3
	case "audio":
		transmitMode = 4
	case "all":
		transmitMode = 5
	}

	sdp := webrtc.SessionDescription{}
	listener.signal.Decode(split[2], &sdp)
	listener.WebRTC.Initialize(transmitMode)
	answerObj, _ := listener.WebRTC.Connect(&sdp)
	answerString := listener.signal.Encode(answerObj)
	listener.Connection.Write(([]byte)("answer " + listener.Id + " " + answerString))
}
