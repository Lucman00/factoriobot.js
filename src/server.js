import { rconPassword, rconHost, rconPort } from './config.js'
import { createRCONclient } from 'js-rcon'
import { spawn } from 'child_process'
let client;
let factorioProcess;



async function startServer(saveLocation) {
    return new Promise((resolve,reject) => {
    factorioProcess = spawn('/opt/factorio/factorio', [
        '--start-server', saveLocation,
        '--rcon-port', rconPort,
        '--rcon-bind', `${rconHost}:${rconPort}`,
        '--rcon-password', rconPassword,
    ])

    factorioProcess.stdout.on('data', (data) =>{
        const output = data.toString()
        console.log(output)})
        if (output.includes('RCON ready')) resolve() })
    

    factorioProcess.stderr.on('data', (data) => console.error(data.toString()))}
    factorioProcess.on('error',  reject)


export async function startConnection(saveLocation) {
    await startServer(saveLocation)
    client = await createRCONclient(rconHost,rconPort ,rconPassword)
    console.log('rcon client Connected')}


export async function sendCommand(command) {
    if (!client) throw new Error('RCON client not connected') 
    return await client.sendCommand(command)
}