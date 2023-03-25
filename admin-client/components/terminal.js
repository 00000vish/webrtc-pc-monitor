import { Terminal } from 'xterm';
import React, { useEffect, useRef, useState } from "react";
import Head from 'next/head';
import "../node_modules/xterm/css/xterm.css";

export default function TerminalPage({clientData, webrtcClient}) {
  const [currentStatus, setStatus] = useState("Loading...");
  const terminalRef = useRef(null);
  var currentInput = "";
  var terminalChannel = webrtcClient.terminalChannel; 
  
  function processInput(channel, terminal, input) {
    switch (input) {
      case "clear": {
        terminal.clear();
        break;
      }
      case "help": {
        terminal.clear();
        break;
      }
      default: {
        channel.send(input)
        break;
      }
    }
  }

  useEffect(() => {
    const terminal = new Terminal({convertEol: true});
    terminal.onKey(key => {
      const char = key.domEvent.key;
      if (char === "Enter") {
        processInput(terminalChannel, terminal, currentInput);
        currentInput = "";
        terminal.write("\r\n$");
      } else if (char === "Backspace") {
        terminal.write("\b \b");
        currentInput = currentInput.slice(0, -1);
      } else {
        terminal.write(char);
        currentInput += char;
      }
    });

    terminalChannel.onopen = (event) => {
      setStatus("Terminal openned.");
    };
    terminalChannel.onmessage = (event) => {
      terminal.write("\n" + event.data + '\r\n$');
    };
    terminalChannel.onclose = (event) => {
      setStatus("Terminal has closed");
    };

    terminal.open(terminalRef.current);
    terminal.write('<Teminal to PC-' + clientData + '>\r\n$');
  }, [])

  return (
    <div>
      <Head>
        <title>SSH - {clientData}</title>
      </Head>
      <p className='text-white'>Status : {currentStatus}</p>
      <div ref={terminalRef} />
    </div>
  );
}