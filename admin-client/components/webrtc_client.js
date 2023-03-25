class WebrtcClient {
    #initiated;
    #pc;
    #offer;
    #answer;
    #terminalChannel;
    #sleep

    constructor() {
        this.#initiated = false;
        this.#pc = null;
        this.#offer = null;
        this.#answer = null;
        this.#terminalChannel = null;
        this.#sleep = function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    async intialize() {
        if (this.#initiated) return;

        this.#pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",
                },
            ],
        });

        this.#terminalChannel = this.#pc.createDataChannel("terminalChannel");
        
        this.#pc.oniceconnectionstatechange = (e) => console.log(this.#pc.iceConnectionState);

        this.#pc.onicecandidate = (event) => {
            if (event.candidate === null) {
                this.#offer = this.#pc.localDescription;
            }
        };

        await this.#pc.createOffer().then((offer) => {
            this.#pc.setLocalDescription(offer);
        });

        var offerTries = 10;
        while(!this.hasOffer() && --offerTries >= 0){
            await this.#sleep(5000);
        }

        return this.hasOffer();
    }

    get terminalChannel() {
        return this.#terminalChannel;
    }

    get peerConnection() {
        return this.#pc;
    }

    get offer() {
        return this.#offer;
    }

    async setAnswer(theAnswer) {
        var answerJson = JSON.parse(
            Buffer.from(theAnswer, "base64").toString("ascii")
        );
        this.#answer = answerJson;
        await this.#pc.setRemoteDescription(answerJson);
    }

    hasOffer(){
        return this.#offer != null
    }

    getOffer64() {
        return Buffer.from(JSON.stringify(this.#offer)).toString("base64");
    }
}

module.exports = WebrtcClient;
