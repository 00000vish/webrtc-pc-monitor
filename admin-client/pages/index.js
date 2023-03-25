import Head from "next/head";
import React, { useState, useEffect } from "react";
import ServerBackend from "../components/server_backend";

export default function Home({ machines }) {
  function navigateToControlPage(event) {
    event.preventDefault();
    const { name, value } = event.target;
    if (name === "all") {
      window.location.href = "/machines/" + value;
      return;
    }
    window.location.href = "/machines/" + name + "/" + value;
  }

  return (
    <div>
      <Head>
        <title>Machines</title>
        <meta name="description" content="Webpage for 00000vish/webrtc-pc-viewer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container">
        <h1 className="text-center display-2 mb-5 text-light">👾 Machines</h1>
        {machines.map((item) => {
          return (
            <div key={item.id} className="card bg-dark m-2">
              <div className="card-body">
                <h3 className="card-title ms-1 mb-3 text-light">
                  PC-{item.id}
                </h3>
                <button
                  onClick={navigateToControlPage}
                  name="ssh"
                  value={item.id}
                  className="btn btn-primary m-1"
                >
                  Terminal
                </button>
                <button
                  onClick={navigateToControlPage}
                  name="camera"
                  value={item.id}
                  className="btn btn-primary m-1"
                >
                  Camera
                </button>
                <button
                  onClick={navigateToControlPage}
                  name="screen"
                  value={item.id}
                  className="btn btn-primary m-1"
                >
                  Screen
                </button>
                <button
                  onClick={navigateToControlPage}
                  name="mic"
                  value={item.id}
                  className="btn btn-primary m-1"
                >
                  Mic
                </button>
                <button
                  onClick={navigateToControlPage}
                  name="all"
                  value={item.id}
                  className="btn btn-primary m-1"
                >
                  All
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const res = await ServerBackend.GetAllMachines();
  const machines = await (res).json();
  return {
    props: { machines }, 
  };
}
