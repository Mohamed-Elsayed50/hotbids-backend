const MemcacheClient = require("memcache-client")

export class Memcache {

    static client

    static init(serverHost) {
        Memcache.client = new MemcacheClient({
            server: serverHost,
            ignoreNotStored: true,
            maxConnections: 10,
            lifetime: 3600//1 hour
        })
    }

    static async set(key, val) {
        return await Memcache.client.set(key, val)
    }


    static async add(key, val) {
        return await Memcache.client.add(key, val)
    }

    static async replace(key, val) {
        return await Memcache.client.replace(key, val)
    }

    static async delete(key) {
        return await Memcache.client.delete(key)
    }

    static async get(key) {
        let res = await Memcache.client.get(key)
        if (res && res.hasOwnProperty('value'))
            return res.value
        return null
    }

}
