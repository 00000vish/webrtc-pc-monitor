import React, { useEffect, useRef, useState } from "react";
import Head from 'next/head';

export default function AudioPage({clientData, webrtcClient}) {
  const [currentStatus, setStatus] = useState("Loading...");
  const audioRef = useRef(null);
  var peerConnection = webrtcClient.peerConnection;

  useEffect(() =>{
    peerConnection.ontrack = (event) => {
        var el = document.createElement(event.track.kind);
        el.srcObject = event.streams[0];
        el.autoplay = true;
        el.controls = true;
        
        audioRef.appendChild(el);
        setStatus("Connected");
    }
  },[])

  return (
    <div>
      <Head>  
        <title>Audio - {clientData}</title>
      </Head>
      <p className='text-white'>Status : {currentStatus}</p>
      <div ref={audioRef} />
    </div>
  );
}