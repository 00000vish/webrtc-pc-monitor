package main

import (
	b64 "encoding/base64"
	"time"

	backend "github.com/00000vish/webrtc-pc-viewer/backend"
	helpers "github.com/00000vish/webrtc-pc-viewer/helpers"
	services "github.com/00000vish/webrtc-pc-viewer/services"
	"github.com/denisbrodbeck/machineid"
)

var MachineID string

func startUp() {

	id, err := machineid.ID()
	if err != nil || id == "" {
		timeStamp := time.Now().String()
		MachineID = b64.StdEncoding.EncodeToString([]byte(timeStamp))
	} else {
		MachineID = id
	}

	//initialize server
	httpServer := backend.Server{}
	httpServer.Initialize("=== YOUR SERVER IP ADDRESS ===", "5000")

	socketServer := backend.Server{}
	socketServer.Initialize("=== YOUR SERVER IP ADDRESS ===", "4000")

	send := backend.Send{}
	send.Initialize(&httpServer)
	send.Send(helpers.MachineId{MachineId: MachineID})

	webRTC := services.WebRTC{}

	//initialize listener
	listener := backend.Listener{}
	listener.Initialize(MachineID, &socketServer, &webRTC)
	listener.Run()
}

func main() {
	startUp()
	select {}
}
