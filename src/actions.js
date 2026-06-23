import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js'




const startButton = new ButtonBuilder()
    .setCustomId('start')
    .setLabel('start')
    .setStyle(ButtonStyle.Success)

const saveButton = new ButtonBuilder()
    .setCustomId('save')
    .setLabel('save')
    .setStyle(ButtonStyle.Primary)

const stopButton = new ButtonBuilder()
    .setCustomId('stop')
    .setLabel('stop')
    .setStyle(ButtonStyle.Danger)

const playerlistButton = new ButtonBuilder()
    .setCustomId('plRefresh')
    .setLabel('refresh')
    .setStyle(ButtonStyle.Secondary)

export const buttonRow = new ActionRowBuilder()
    .addComponents(startButton, saveButton, stopButton, playerlistButton)

export function saveDropdown(saveFiles) {
    const options = saveFiles.map(file =>({
        label: file,
        value: file
    }))

    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('saveSelect')
            .setPlaceholder('Choose a save file')
            .addOptions(options)
            .setMinValues(1)
            .setMaxValues(1)
    )
}