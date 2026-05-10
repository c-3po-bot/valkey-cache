const log = require('./logger')
const { GlideClusterClient } = require('@valkey/valkey-glide')

const CLIENT_PORT = +(process.env.CLIENT_PORT || 6379), CLIENT_POD_NAME = process.env.CLIENT_POD_NAME || 'valkey', CLIENT_NAME_SPACE = process.env.CLIENT_NAME_SPACE || 'datastore', CLIENT_NUM_NODES = +(process.env.CLIENT_NUM_NODES || 5)

let NODE_ADDRESSES = [], client, client_ready

async function init(){
  try{
    for(let i = 0; i < CLIENT_NUM_NODES; i++) NODE_ADDRESSES.push({ host: `${CLIENT_POD_NAME}-${i}.${CLIENT_POD_NAME}.${CLIENT_NAME_SPACE}.svc.cluster.local`, port: CLIENT_PORT })
    client = await GlideClusterClient.createClient({
      addresses: NODE_ADDRESSES,
      useTLS: false,
      requestTimeout: 5000,
      clientName: 'valkey_test'
    })
    testClient()
  }catch(e){
    setTimeout(init, 5000)
    log.error(e)
  }
}
async function testClient(){
  try{
    let status = await client.ping()
    if(status == 'PONG'){
      log.info(`client is ready...`)
      client_ready = true
      return
    }
    setTimeout(testClient, 5000)
  }catch(e){
    setTimeout(testClient, 5000)
    log.error(e)
  }
}

init()
async function set(key, value, TTL){
  try{
    if(!key || !value || !client_ready) return
    let opts = {}
    if(TTL) opts.expiry = { count: TTL, type: 'EX' }
    let res = await client.set(key, value, opts)
    if(res == 'OK') return true
  }catch(e){
    log.error(e)
  }
}
async function get(key){
  try{
    if(!key || !client_ready) return
    return await client.get(key)
  }catch(e){
    log.error(e)
  }
}
async function del(key){
  try{
    if(!key || !client_ready) return
    await client.del([key])
    return true
  }catch(e){
    log.error(e)
  }
}
async function ping(){
  try{
    return await client.ping()
  }catch(e){
    log.error(e)
  }
}
module.exports = {
  del, get, set,
  status: () => ( client_ready )
}
