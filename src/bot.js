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
import { readdirSync, access, constants, mkdir, writeFileSync, readFileSync} from 'fs'

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
	
client.once(Events.ClientReady, async (readyClient) => {
	const channel = client.channels.cache.get(discordChannel)
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	await deleteOldEmbed(client)

	if(!channel){ 
		console.error(`Channel with ID "${DISCORD_CHANNEL}" not found!`);
		console.error(`   The bot couldn't find this channel.`);
		console.error(`   • The channel ID is incorrect`);
		console.error(`   • The bot doesn't have access to that channel`);
		console.error(`   • The channel is in a different server`);
		console.error(`   Please check your .env file and try again.`);
		process.exit(1)
	};
	console.log(channel.type)
	if(channel.type !== ChannelType.GuildText){
		console.error(`Channel with ID ${DISCORD_CHANNEL} is not a text channel`)
		console.error(`Please set a valid text channel ID`)
		process.exit(1)
	} 

	
	const message = await channel.send({
		embeds: [serverPanel],
		components: [buttonRow]
	});   
	saveEmbed(channel.id, message.id)
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

		await interaction.update({content:`Starting server at ${selectedSave}`, ephemeral: true, components: []})
		//start server logic

		setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
	}
})



client.login(discordToken)