import dotenv from 'dotenv'
dotenv.config({debug: true})

if(!process.env.DISCORD_TOKEN) throw new Error('Discord Token must be set!');
if(!process.env.DISCORD_CHANNEL_ID) throw new Error('Discord Channel must be set!');
if(!process.env.RCON_PASSWORD) throw new Error('RCON password must be set!')

export const discordToken = process.env.DISCORD_TOKEN ?? 'test'
export const discordChannel = process.env.DISCORD_CHANNEL_ID
export const rconHost = process.env.HOST || '127.0.0.1'
export const rconPort = parseInt(process.env.RCON_PORT || '27015')
export const rconPassword = process.env.RCON_PASSWORD