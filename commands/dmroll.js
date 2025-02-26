const { SlashCommandBuilder, MessageEmbed, EmbedBuilder} = require('discord.js');
const db = require('../database');
const dictionary = require('../dictionary.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dmroll')
        .setDescription('Lancer un jet de dés pour Vampire : La Mascarade')
        .setDefaultMemberPermissions(8)
        .addIntegerOption(option =>
            option.setName('dices')
                .setDescription('Nombre de D10')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('hunger')
                .setDescription('Soif du jet')
                .setRequired(false)),

    async execute(interaction) {
        const dicePool = interaction.options.getInteger('dices');
        const hunger = interaction.options.getString('hunger') || 0;

        if (dicePool <= 0) {
            return interaction.reply({ content: 'Les attributs/compétences choisis ne sont pas valides.', ephemeral: true });
        }

        // Lancer les dés
        let rolls = [];
        for (let i = 0; i < dicePool; i++) {
            rolls.push(Math.floor(Math.random() * 10) + 1);
        }

        let totalDice = rolls.length;
        let hungerDice = Math.min(hunger, totalDice);
        let normalDice = totalDice - hungerDice;

        let hungerRolls = hungerDice > 0 ? rolls.slice(-hungerDice) : [];
        let normalRolls = rolls.slice(0, normalDice);

        let successes = normalRolls.filter(die => die >= 6).length;
        let hungerSuccesses = hungerRolls.filter(die => die >= 6).length;

        let normalCriticals = normalRolls.filter(die => die === 10).length;
        let hungerCriticals = hungerRolls.filter(die => die === 10).length;
        let hungerFails = hungerRolls.filter(die => die === 1).length;

        let str = dicePool + "D10" + ((hunger) ? " (" + hunger + " de soif)" : "");

        let totalSuccesses = successes + hungerSuccesses;
        let bonusSuccesses = Math.floor((normalCriticals + hungerCriticals) / 2) * 2;
        totalSuccesses += bonusSuccesses;

        let resultMessage = `Succès totaux : **${totalSuccesses}**\n`;
        let status = '🎲 **Jet de dés**';
        let color = '#800080'; // Violet par défaut

        // 🔥 Gestion des succès critiques et échecs 🔥
        if (normalCriticals >= 2) {
            resultMessage += '\n🔥 **Succès critique !**';
            status = '🔥 **Succès Critique !**';
        }

        if (normalCriticals >= 1 && hungerCriticals >= 1) {
            resultMessage += '\n⚡ **Triomphe Brutal !**';
            totalSuccesses += 2;
            status = '⚡ **Succès Triomphal !**';
        }

        if (hungerFails >= 1) {
            resultMessage += '\n💀 **Potentiel échec bestial !**';
            status = '💀 **Échec Bestial !**';
            color = '#ff0000'; // Rouge pour un échec bestial
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(status)
            .setDescription(`**${str} :**`)
            .addFields(
                { name: '🎲 Dés normaux', value: normalRolls.length > 0 ? normalRolls.join(', ') : 'Aucun', inline: true },
                { name: '🩸 Dés de Soif', value: hungerRolls.length > 0 ? hungerRolls.join(', ') : 'Aucun', inline: true },
                { name: '📊 Résultats', value: resultMessage }
            )
            .setFooter({ text: 'Gotham by Night - Jet de dés' });

        interaction.reply({ embeds: [embed], ephemeral : true });

    }
};
