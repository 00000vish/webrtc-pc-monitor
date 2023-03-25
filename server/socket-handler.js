class SocketHandler {

    #unkownSockets = [];
    #openedSockets = {};
    #answeredSockets = {}

    add(socket) {
        this.#unkownSockets.push(socket);
        socket.on('message', (message) => { this.onMessage(message, socket) });
    }

    onMessage(message, socket) {
        var data = String(message).split(" ");
        if (data[0] == "machineId") {
            this.#openedSockets[data[1]] = socket;
            this.#unkownSockets = this.#unkownSockets.filter(item => item !== socket);
        }
        if(data[0] == "answer"){
            this.#answeredSockets[data[1]] = data[2];
        }
    }

    broadcast(message) {
        this.#unkownSockets.forEach(item => {
            item.send(message);
        });
    }

    requestConnection(id, offer, type) {
        if (this.#openedSockets[id] === undefined) return false;
        if (this.#openedSockets[id] === null) return false;
        this.#openedSockets[id].send(`connect ${type} ${offer}`);
        return true;
    }

    checkRequestAnswered(id){
        if (this.#answeredSockets[id] === undefined) return null;
        if (this.#answeredSockets[id] === null) return null;
        if (this.#openedSockets[id] === undefined) return null;
        if (this.#openedSockets[id] === null) return null;
        return this.#answeredSockets[id];
    }

}

module.exports = SocketHandler;