import { User } from '../models/User'

export default class SocketClients {
    public io
    public uniqueUsers: Map<number, Set<string>> = new Map()

    constructor(
        public readonly clients: SocketClient[] = []
    ) {}

    push(socket) {
        const client = new SocketClient(socket)
        this.clients.push(client)

        if (client.user?.id) {
            if (this.uniqueUsers.has(client.user.id)) {
                this.uniqueUsers.get(client.user.id)?.add(client.id)
            } else {
                this.uniqueUsers.set(client.user.id, new Set([client.id]))
            }

            // console.log('\nPUSH USER START \n')
            for (let [key, setValue] of this.uniqueUsers.entries()) {
                const str: any[] = []
                for (const value of setValue.values()) {
                    str.push(value)
                }
                // console.log(key, str.join(', '))
            }
            // console.log(this.clients.map(c => `c: ${c.socket.connected}, d: ${c.socket.disconnected}`).join(', '))
            // console.log('\nPUSH USER END \n')

        }
    }

    remove(socket) {
        const cIndex = this.clients.findIndex(c => c.id === socket.id)
        if (cIndex >= 0) {
            this.clients.splice(cIndex, 1)
        }
        
        if (socket.user?.id) {
            if (this.uniqueUsers.has(socket.user.id)) {
                const usersSet = this.uniqueUsers.get(socket.user.id)
                usersSet?.delete(socket.id)

                if (usersSet?.size === 0) {
                    this.uniqueUsers.delete(socket.user.id)
                }
            }
        }

        // console.log('\nREMOVE USER START \n')
            for (let [key, setValue] of this.uniqueUsers.entries()) {
                const str: any[] = []
                for (const value of setValue.values()) {
                    str.push(value)
                }
                // console.log(key, str.join(', '))
            }
            // console.log('\nREMOVE USER END \n')
    }

    sendToRoom(room: string, event: string, value?: any) {
        if (!this.io) return
        this.io.to(room).emit(event, { value, success: 'true' })
    }

    sendTo(socket, event, value?: any) {
        if (!socket) return
        socket.emit(event, { value, success: 'true' })
    }

    sendToAll(event, value?:any) {
        this.authenticatedClients.forEach(client => {
            client.emit(event, value)
        })  
    }

    get uniqueUsersCount() {
        return this.uniqueUsers.size
    }

    get length() {
        return this.clients.length
    }

    get authenticatedClientsLength() {
        return this.authenticatedClients.length
    }

    get authenticatedClients() {
        return this.clients.filter(c => Boolean(c.user))
    }
}

export class SocketClient {
    lastNotificationDate: number
    id: any

    constructor(
        public readonly socket: any
    ) {
        this.id = socket.id
    }

    emit(...args) {
        this.socket.emit(...args)
    }

    get user(): User {
        return this.socket.user
    }
}
