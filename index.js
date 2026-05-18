const log = require('./logger')
const valkey = require('./valkey')

process.on('unhandledRejection', (error) => {
  console.error(`[valkey-cache] [unhandledRejection] ${error}`)
  if(error?.stack) console.error(error)
});
module.exports.status = ()=>{
  return valkey.status()
}
module.exports.ValkeyCache = class{
  constructor({ keyPrefix, jsonOnly, defaultTTL }){
    this.CACHE_NAME
    this.KEY_PREFIX = keyPrefix,
    this.JSON_ONLY = jsonOnly
    this.TTL = +(defaultTTL || 0)
  }
  async get(key){
    try{
      if(this.JSON_ONLY) return await this.getJSON(key)
      if(key) return await valkey.get(`${this.KEY_PREFIX}:${key}`)
    }catch(e){
      log.error(e, this.CACHE_NAME || this.KEY_PREFIX)
    }
  }
  async getJSON(key){
    try{
      if(!key) return
      let res = await valkey.get(`${this.KEY_PREFIX}:${key}`)
      if(res) return JSON.parse(res)
    }catch(e){
      log.error(e, this.CACHE_NAME || this.KEY_PREFIX)
    }
  }
  async del(key){
    try{
      if(key) return await valkey.del(`${this.KEY_PREFIX}:${key}`)
    }catch(e){
      log.error(e, this.CACHE_NAME || this.KEY_PREFIX)
    }
  }
  async set(key, value, ttl){
    try{
      if(this.JSON_ONLY) return await this.setJSON(key, value, ttl)
      if(key) return await valkey.set(`${this.KEY_PREFIX}:${key}`, value, ttl || this.TTL)
    }catch(e){
      log.error(e, this.CACHE_NAME || this.KEY_PREFIX)
    }
  }
  async setJSON(key, value, ttl){
    try{
      if(!key || !value) return
      return await valkey.set(`${this.KEY_PREFIX}:${key}`, JSON.stringify(value), ttl || this.TTL)
    }catch(e){
      log.error(e, this.CACHE_NAME || this.KEY_PREFIX)
    }
  }
  status(){
    return valkey.status()
  }
}
