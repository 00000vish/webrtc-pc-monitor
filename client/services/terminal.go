package services

import (
	"io"
	"os/exec"
	"strings"
)

type Terminal struct {
}

func (term *Terminal) Run(command string) string {
	splitData := strings.Split(command, " ")
	cmd := exec.Command(splitData[0], splitData[1:]...)

	stdout, _ := cmd.StdoutPipe()
	cmd.Start()
	cmd.Process.Wait()

	buf := new(strings.Builder)
	io.Copy(buf, stdout)
	return buf.String()
}
