import { useState, useEffect } from 'react'
import WebrtcClient from '../../../components/webrtc_client'
import ServerBackend from '../../../components/server_backend';
import dynamic from 'next/dynamic'

const CameraHeader = dynamic(() => import("../../../components/video"), { ssr: false });

export default function Machine({ machine }){
    const [isLoading, setLoading] = useState(true)
    const [currentStatus, setStatus] = useState("Connecting...")
    const [webrtcClient, setWebRTC] = useState(new WebrtcClient());

    useEffect(() => {
        const connectMachine = async () => {
            if (machine === undefined) return;

            var initialized = await webrtcClient.intialize();
            if(!initialized){
                setStatus("Could not initialize webrtc with offer.");
                return;
            }

            var offer = webrtcClient.getOffer64();

            var found = await ServerBackend.SendConnectCommand(machine, offer, "camera");
            if (found == null){
                setStatus("Machine is currently offline.");
                return;
            }

            var answered = await(await ServerBackend.GetConnectAnswer(machine)).json();
            if (answered == null){
                setStatus("Machine did not respond.");
                return;
            }

            await webrtcClient.setAnswer(answered.machineAnswer);
            
            setWebRTC(webrtcClient)
            setLoading(false);
        }
        connectMachine();
    },[]);

    if (isLoading) {
        return (
            <p className='text-white'>{currentStatus}</p>
        )
    }

    return (
        <div>
            <CameraHeader clientData={machine} webrtcClient={webrtcClient}/>
        </div>
    )        
}

export async function getStaticPaths() {
    const res = await ServerBackend.GetAllMachines();
    const machines = await (res).json();

    const paths = machines.map((machine) => ({
        params: { machine: machine.id },
    }))

    return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
    return {
      props: { machine:params.machine }
    }
}