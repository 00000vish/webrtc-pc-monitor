package backend

type Server struct {
	address string
}

func (server *Server) Initialize(ipAddress string, port string) {
	server.address = ipAddress + ":" + port
}

func (server *Server) Address() string {
	return server.address
}

func (server *Server) ProtocolAddress(protocol string) string {
	return protocol + "://" + server.address
}
