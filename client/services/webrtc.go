package services

import (
	"fmt"
	"time"

	"github.com/pion/mediadevices"
	"github.com/pion/mediadevices/pkg/codec/opus"
	"github.com/pion/mediadevices/pkg/codec/vpx"
	_ "github.com/pion/mediadevices/pkg/driver/camera"
	_ "github.com/pion/mediadevices/pkg/driver/screen"
	"github.com/pion/webrtc/v3"
)

type WebRTC struct {
	pc              *webrtc.PeerConnection
	terminal        Terminal
	channelsParsers []func(d *webrtc.DataChannel)
}

func (w *WebRTC) Initialize(connectionType int) {

	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302"},
			},
		},
	}

	var err error
	w.pc, err = webrtc.NewPeerConnection(config)

	if err != nil {
		panic(err)
	}

	// Set the handler for Peer connection state
	// This will notify you when the peer has connected/disconnected
	w.pc.OnConnectionStateChange(func(s webrtc.PeerConnectionState) {
		fmt.Printf("Peer Connection State has changed: %s\n", s.String())

		if s == webrtc.PeerConnectionStateFailed {
			// Wait until PeerConnection has had no network activity for 30 seconds or another failure. It may be reconnected using an ICE Restart.
			// Use webrtc.PeerConnectionStateDisconnected if you are interested in detecting faster timeout.
			// Note that the PeerConnection may come back from PeerConnectionStateDisconnected.
			fmt.Println("Peer Connection has gone to failed exiting")
		}
	})

	w.pc.OnDataChannel(func(d *webrtc.DataChannel) {
		d.OnOpen(func() {
			for _, parser := range w.channelsParsers {
				parser(d)
			}
		})
	})

	w.configure(connectionType)
}

func (w *WebRTC) Connect(remoteOffer *webrtc.SessionDescription) (*webrtc.SessionDescription, error) {

	err := w.pc.SetRemoteDescription(*remoteOffer)
	if err != nil {
		panic(err)
	}

	answer, err := w.pc.CreateAnswer(nil)
	if err != nil {
		panic(err)
	}
	gatherComplete := webrtc.GatheringCompletePromise(w.pc)

	err = w.pc.SetLocalDescription(answer)
	if err != nil {
		panic(err)
	}

	<-gatherComplete

	return &answer, nil
}

func (w *WebRTC) configure(connectionType int) {
	switch connectionType {
	case 1:
		w.setupTerminal()
		break
	case 2:
		w.setupVideos(0)
		break
	case 3:
		w.setupVideos(1)
		break
	case 4:
		w.setupAudio()
	case 5:
		w.setupAudio()
		w.setupTerminal()
		w.setupVideos(2)
		break
	}
}

func (w *WebRTC) setupTerminal() {
	w.terminal = Terminal{}
	w.channelsParsers = append(w.channelsParsers, func(d *webrtc.DataChannel) {
		if d.Label() == "terminalChannel" {
			d.OnMessage(func(msg webrtc.DataChannelMessage) {
				output := w.terminal.Run(string(msg.Data))
				d.SendText(output)
			})
		}
	})
}

func (w *WebRTC) setupVideos(videoType int) {
	vpxParams, err := vpx.NewVP8Params()
	if err != nil {
		panic(err)
	}

	codecSelector := mediadevices.NewCodecSelector(
		mediadevices.WithVideoEncoders(&vpxParams),
	)

	switch videoType {
	case 0:
		w.getScreenCaputre(codecSelector)
		break
	case 1:
		w.getCameraCapture(codecSelector)
		break
	case 2:
		w.getScreenCaputre(codecSelector)
		w.getCameraCapture(codecSelector)
		break
	}

}

func (w *WebRTC) getScreenCaputre(codecSelector *mediadevices.CodecSelector) {
	s, err := mediadevices.GetDisplayMedia(mediadevices.MediaStreamConstraints{
		Video: func(c *mediadevices.MediaTrackConstraints) {
		},
		Codec: codecSelector,
	})

	if err != nil {
		panic(err)
	}

	for _, track := range s.GetTracks() {
		track.OnEnded(func(err error) {
			fmt.Printf("Track (ID: %s) ended with error: %v\n",
				track.ID(), err)
		})
		println(track.Kind().String())
		_, err = w.pc.AddTrack(track)
		if err != nil {
			panic(err)
		}
	}
}

func (w *WebRTC) getCameraCapture(codecSelector *mediadevices.CodecSelector) {
	s, err := mediadevices.GetUserMedia(mediadevices.MediaStreamConstraints{
		Video: func(c *mediadevices.MediaTrackConstraints) {
		},
		Codec: codecSelector,
	})

	if err != nil {
		panic(err)
	}

	for _, track := range s.GetTracks() {
		track.OnEnded(func(err error) {
			fmt.Printf("Track (ID: %s) ended with error: %v\n",
				track.ID(), err)
		})
		println(track.Kind().String())
		_, err = w.pc.AddTrack(track)
		if err != nil {
			panic(err)
		}
	}
}

func (w *WebRTC) setupAudio() {
	opusParams, err := opus.NewParams()
	if err != nil {
		panic(err)
	}

	codecSelector := mediadevices.NewCodecSelector(
		mediadevices.WithAudioEncoders(&opusParams),
	)

	s, err := mediadevices.GetUserMedia(mediadevices.MediaStreamConstraints{
		Audio: func(c *mediadevices.MediaTrackConstraints) {
		},
		Codec: codecSelector,
	})

	if err != nil {
		panic(err)
	}

	for _, track := range s.GetTracks() {
		track.OnEnded(func(err error) {
			fmt.Printf("Track (ID: %s) ended with error: %v\n",
				track.ID(), err)
		})
		println(track.Kind().String())
		_, err = w.pc.AddTrack(track)
		if err != nil {
			panic(err)
		}
	}
}

func forever() {
	for {
		time.Sleep(time.Second * 10)
	}
}
