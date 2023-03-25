class ServerBackend {
    static ipAddress = "====== SERVER IP ADDRESS HERE ========";
    static maxRetries = 5;

    static async Sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    static async RetryMethod(method) {
        var retryTimes = this.maxRetries;
        var res = null;
        var methodSuccess = false;
        while (!methodSuccess && --retryTimes > 0) {
            res = await method();
            methodSuccess = res.status != 404;
            this.Sleep(1000);
        }
        if (res.status == 404) return null;
        return res;
    }

    static async SendConnectCommand(machindId, webRtcOffer, connectType) {
        const connectMethod = async () => {
            return await fetch(`http://${this.ipAddress}/connect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: machindId,
                    offer: webRtcOffer,
                    type: connectType,
                }),
            });
        };
        return await this.RetryMethod(connectMethod);
    }

    static async GetConnectAnswer(machindId) {
        const answerMethod = async () => {
            return await fetch(`http://${this.ipAddress}/getAnswer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: machindId }),
            });
        };
        return await this.RetryMethod(answerMethod);
    }

    static async GetAllMachines(){
        const allMachineMethod = async () => {
            return await fetch(`http://${this.ipAddress}/getOffers`);
        };
        return await this.RetryMethod(allMachineMethod);
    }
}

module.exports = ServerBackend;
