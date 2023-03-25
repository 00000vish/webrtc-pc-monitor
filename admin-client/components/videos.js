import React, { useEffect, useRef, useState } from "react";
import Head from 'next/head';

export default function VideoPage({clientData, webrtcClient}) {
  const [currentStatus, setStatus] = useState("Loading...");
  const videoRef = useRef(null);
  var peerConnection = webrtcClient.peerConnection;

  useEffect(() =>{
    peerConnection.ontrack = (event) => {
      var el = document.createElement(event.track.kind);
      el.srcObject = event.streams[0];
      el.autoplay = true;
      el.controls = true;
        
      videoRef.appendChild(el);
      setStatus("Connected");
    }
  },[])

  return (
    <div>
      <Head>  
        <title>Video Feed - {clientData}</title>
      </Head>
      <p className='text-white'>Status : {currentStatus}</p>
      <div ref={videoRef} />
    </div>
  );
}