import { 
	Client,
	Events,
	GatewayIntentBits,
	AttachmentBuilder,
	EmbedBuilder,
	ChannelType, 
} 
from 'discord.js';
import { buttonRow, saveDropdown } from './actions.js'
import { discordToken, discordChannel } from './config.js';
import { readdirSync, access, constants, mkdir } from 'fs'



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

if (serverStatus !=='Online')
	playerList = 'server Offline'
else playerList = 0 //some rcon getting


const serverPanel = new EmbedBuilder()
	.setColor(0xc26e15)
	.setTitle('Factorio Server Control Panel')
	.addFields(
		{name : 'Status', value: serverStatus, inline: true},
		{name : 'World', value : worldName, inline: true},
		{name : `Players (${playerAmount})`, value: `\`\`\`\n${playerList}\n\`\`\``})
	.setFooter({ text: 'Last Updated' }) 
	.setTimestamp()
	
client.once(Events.ClientReady, (readyClient) => {
	const channel = client.channels.cache.get(discordChannel)

	if (!channel) {
		console.error(`Channel "${DISCORD_CHANNEL}" not found! Check ID, permissions, or server.`);
		process.exit(1);
	}
	
	if (channel.type !== ChannelType.GuildText) {
		console.error(`Channel "${DISCORD_CHANNEL}" is not a text channel`);
		process.exit(1);
	}
	
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	channel.send({
		embeds: [serverPanel],
		components: [buttonRow]
	});   
})

mkdir('/opt/factorio/saves/', { recursive: true }, (err) => {
	if (err) {
    console.error('Failed to create directory:', err);
	} else {

	}
});

const saves = readdirSync('/opt/factorio/saves').filter(f => f.endsWith('.zip'))

client.on(Events.InteractionCreate, async (interaction) =>{
	if (!interaction.isButton() && !interaction.isStringSelectMenu) return;

	if (interaction.customId == 'start'){
		await interaction.reply({ephemeral: true,
			components: [saveDropdown(saves)]
		})
	
	}
	if (interaction.customId == 'saveSelect'){
		selectedSave = interaction.values[0]

		await interaction.update({content:`Starting server at ${selectedSave}`, components: []})
		//start server logic

		setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
	}
})



client.login(discordToken)
