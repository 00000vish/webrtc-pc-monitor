package backend

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type Send struct {
	Server              *Server
	SEND_OFFER_ENDPOINT string
}

func (send *Send) Initialize(server *Server) {
	send.Server = server
	send.SEND_OFFER_ENDPOINT = server.ProtocolAddress("http") + "/sendOffer"
}

func (send *Send) Send(offer interface{}) {
	payload, err := json.Marshal(offer)
	if err != nil {
		panic(err)
	}
	resp, err := http.Post(send.SEND_OFFER_ENDPOINT, "application/json; charset=utf-8", bytes.NewReader(payload)) // nolint:noctx
	if err != nil {
		panic(err)
	} else if err := resp.Body.Close(); err != nil {
		panic(err)
	}
}
