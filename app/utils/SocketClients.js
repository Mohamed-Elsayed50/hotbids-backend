"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketClient = void 0;
class SocketClients {
    constructor(clients = []) {
        this.clients = clients;
        this.uniqueUsers = new Map();
    }
    push(socket) {
        var _a, _b;
        const client = new SocketClient(socket);
        this.clients.push(client);
        if ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id) {
            if (this.uniqueUsers.has(client.user.id)) {
                (_b = this.uniqueUsers.get(client.user.id)) === null || _b === void 0 ? void 0 : _b.add(client.id);
            }
            else {
                this.uniqueUsers.set(client.user.id, new Set([client.id]));
            }
            // console.log('\nPUSH USER START \n')
            for (let [key, setValue] of this.uniqueUsers.entries()) {
                const str = [];
                for (const value of setValue.values()) {
                    str.push(value);
                }
                // console.log(key, str.join(', '))
            }
            // console.log(this.clients.map(c => `c: ${c.socket.connected}, d: ${c.socket.disconnected}`).join(', '))
            // console.log('\nPUSH USER END \n')
        }
    }
    remove(socket) {
        var _a;
        const cIndex = this.clients.findIndex(c => c.id === socket.id);
        if (cIndex >= 0) {
            this.clients.splice(cIndex, 1);
        }
        if ((_a = socket.user) === null || _a === void 0 ? void 0 : _a.id) {
            if (this.uniqueUsers.has(socket.user.id)) {
                const usersSet = this.uniqueUsers.get(socket.user.id);
                usersSet === null || usersSet === void 0 ? void 0 : usersSet.delete(socket.id);
                if ((usersSet === null || usersSet === void 0 ? void 0 : usersSet.size) === 0) {
                    this.uniqueUsers.delete(socket.user.id);
                }
            }
        }
        // console.log('\nREMOVE USER START \n')
        for (let [key, setValue] of this.uniqueUsers.entries()) {
            const str = [];
            for (const value of setValue.values()) {
                str.push(value);
            }
            // console.log(key, str.join(', '))
        }
        // console.log('\nREMOVE USER END \n')
    }
    sendToRoom(room, event, value) {
        if (!this.io)
            return;
        this.io.to(room).emit(event, { value, success: 'true' });
    }
    sendTo(socket, event, value) {
        if (!socket)
            return;
        socket.emit(event, { value, success: 'true' });
    }
    sendToAll(event, value) {
        this.authenticatedClients.forEach(client => {
            client.emit(event, value);
        });
    }
    get uniqueUsersCount() {
        return this.uniqueUsers.size;
    }
    get length() {
        return this.clients.length;
    }
    get authenticatedClientsLength() {
        return this.authenticatedClients.length;
    }
    get authenticatedClients() {
        return this.clients.filter(c => Boolean(c.user));
    }
}
exports.default = SocketClients;
class SocketClient {
    constructor(socket) {
        this.socket = socket;
        this.id = socket.id;
    }
    emit(...args) {
        this.socket.emit(...args);
    }
    get user() {
        return this.socket.user;
    }
}
exports.SocketClient = SocketClient;
//# sourceMappingURL=SocketClients.js.map