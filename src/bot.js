import { 
	Client,
	Events,
	GatewayIntentBits,
	AttachmentBuilder,
	EmbedBuilder,
	ChannelType, 
	MessageFlags 
} 
from 'discord.js';
import { readdirSync, access, constants, writeFileSync, readFileSync, mkdirSync} from 'fs'

import { buttonRow, saveDropdown } from './actions.js'
import { discordToken, discordChannel } from './config.js';
import { startConnection, sendRconCommand, getPlayers } from './server.js'






const STATUS_FILE = './last_embed.json';
const saveEmbed = (cl, msg) => writeFileSync(STATUS_FILE, JSON.stringify({channelId:cl, messageId:msg}));
const getEmbed = () => { try { return JSON.parse(readFileSync(STATUS_FILE, 'utf8')); } catch { return null; } };
const deleteOldEmbed = async (client) => {
    const data = getEmbed();
    if (!data) return;
    try {
        const channel = await client.channels.fetch(data.channelId);
        const msg = await channel.messages.fetch(data.messageId);
        await msg.delete();
    } catch {}
};


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
})
let playerList = 'Server Offline'
let serverStatus = 'Offline'
let worldName = 'N/A'
let playerAmount = 0
let selectedSave
let saves
let panelMessage
let players

if (serverStatus !=='Online')
	playerList = 'server Offline'
else playerList = 0 //some rcon getting

function buildServerPanel() {
	
	return new EmbedBuilder()
		.setColor(0xc26e15)
		.setTitle('Factorio Server Control Panel')
		.addFields(
			{name : 'Status', value: serverStatus, inline: true},
			{name : 'World', value : worldName, inline: true},
			{name : `Players (${playerAmount})`, value: `\`\`\`\n${playerList}\n\`\`\``})
		.setFooter({ text: 'Last Updated' }) 
		.setTimestamp()
	}
client.once(Events.ClientReady, async (readyClient) => {
	const channel = client.channels.cache.get(discordChannel)
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	await deleteOldEmbed(client)

	if(!channel){ 
		console.error(`Channel with ID "${discordChannel}" not found!`);
		process.exit(1)
	};
	console.log(channel.type)
	if(channel.type !== ChannelType.GuildText){
		console.error(`Channel with ID ${discordChannel} is not a text channel`)
		process.exit(1)
	} 

	
	panelMessage = await channel.send({
		embeds: [buildServerPanel()],
		components: [buttonRow]
	});   
	saveEmbed(channel.id, panelMessage.id)

	setInterval(async ()=> {
		if (serverStatus !== '**Online**')
		players = await getPlayers()
		playerList = players.join('\n') || 'No Players online'
		playerAmount = players.length
		await panelMessage.edit({
			embeds: [buildServerPanel()],
			components:[buttonRow]
		})
		console.log('updated²')
	}, 60000)
})


mkdirSync('/opt/factorio/saves/', { recursive: true }, (err) => {
  if (err) {
    console.error('Failed to create directory:', err);
  } else {

  }
});

client.on(Events.InteractionCreate, async (interaction) =>{
	if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

	if (interaction.customId == 'start'){
		saves = readdirSync('/opt/factorio/saves').filter(f => f.endsWith('.zip'))
		
		await interaction.reply({flags: MessageFlags.Ephemeral,
			components: [saveDropdown(saves)]
			
		 })
		 
	
	}
	if (interaction.customId == 'saveSelect'){
		selectedSave = interaction.values[0]

		await interaction.update({content:`Starting server at ${selectedSave}`, ephemeral: true, components: []})
		await startConnection(selectedSave)


		

		setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
		
		serverStatus = '**Online**'
		worldName = selectedSave.replace(/\.zip$/, '')
		players = await getPlayers()
		playerList = players.join('\n') || 'No Players online'
		playerAmount = players.length
		await panelMessage.edit({
			embeds: [buildServerPanel()],
			components:[buttonRow]
		})

	}

	if (interaction.customId == 'stop'){
		await sendRconCommand('/quit')
		playerList = 'No Players online'
		playerAmount = 0
		worldName = 'N/A'
		serverStatus = 'offline'


		await panelMessage.edit({
			embeds: [buildServerPanel()],
			components:[buttonRow]
		})
		interaction.reply({content: 'Stopped' })
		setTimeout(() => interaction.deleteReply().catch(() => {}), 3000);
	}
	if (interaction.customId == 'save'){
		await sendRconCommand('/save')
		interaction.deferUpdate()
	}
	
	if (interaction.customId == 'plRefresh'){

		players = await getPlayers()
		playerList = players.join('\n') || 'No Players online'
		playerAmount = players.length

		await panelMessage.edit({
			embeds: [buildServerPanel()],
			components:[buttonRow]
		})
		console.log('updated')
		interaction.deferUpdate()
	}
})



client.login(discordToken)
