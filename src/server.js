import { rconPassword, rconHost, rconPort } from './config.js'
import { createRCONclient } from 'js-rcon'
import { spawn } from 'child_process'
let client;
let factorioProcess;



async function startServer(saveLocation) {
    return new Promise((resolve,reject) => {
    factorioProcess = spawn('/opt/factorio/bin/x64/factorio', [
        '--start-server', saveLocation,
        '--rcon-bind', `${rconHost}:${rconPort}`,
        '--rcon-password', rconPassword
    ])

    factorioProcess.stdout.on('data', (data) =>{
        const output = data.toString()
        console.log(output)
        if (output.includes('Hosting game at IP')) resolve()})
    

    factorioProcess.stderr.on('data', (data) => console.error(data.toString()), reject)})}


export async function startConnection(saveLocation) {
    await startServer(saveLocation)
    await new Promise(resolve => setTimeout(resolve, 5000));
    client = await createRCONclient(rconHost,rconPort ,rconPassword)
    console.log('rcon client Connected')}


export async function sendRconCommand(command) {
    if (!client) throw new Error('RCON client not connected') 
    return await client.sendCommand(command)
}
export async function getPlayers(){
    const raw = await sendRconCommand('/players online')
    const players = raw.split('\n').slice(1).map(p => p.trim()).filter(Boolean)
    return players
}
