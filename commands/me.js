const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('me')
        .setDescription('Obtenir les informations du personnage')
        .addStringOption(option =>
            option.setName('section')
                .setDescription('Section à afficher')
                .setChoices(
                    { name: 'skills', value: 'skills' },
                    { name: 'disciplines', value: 'disciplines' },
                    { name: 'background', value: 'background' },
                    { name: 'all', value: 'all' }
                )),
    async execute(interaction) {
        const channel_id = interaction.channelId;
        const section = interaction.options.getString('section') || 'all';

        db.get('SELECT * FROM characters WHERE channel_id = ?', [channel_id], (err, row) => {
            if (err) {
                return interaction.reply({ content: 'Erreur lors de la récupération du personnage.', ephemeral: true });
            }
            if (!row) {
                return interaction.reply({ content: 'Aucun personnage trouvé pour ce canal.', ephemeral: true });
            }

            try {
                const identity = JSON.parse(row.identity);
                const skills = row.skills ? JSON.parse(row.skills) : {};
                const disciplines = row.disciplines ? JSON.parse(row.disciplines) : {};
                const background = row.background ? JSON.parse(row.background) : {};

                const healthBar = formatHealth(row.aggravated_damage ?? 0, row.superficial_damage ?? 0, row.max_damage ?? 10);
                const willpowerBar = formatHealth(row.aggravated_willpower ?? 0, row.superficial_willpower ?? 0, row.max_willpower ?? 10);


                const embed = new EmbedBuilder()
                    .setTitle(`${identity.name}`)
                    .setDescription(`**Clan:** ${identity.clan}`)
                    .addFields(
                        { name: 'Faim', value: (row.hunger ?? 0).toString(), inline: true },
                        { name: 'Dégâts', value: healthBar, inline: false },
                        { name: 'Volonté', value: willpowerBar, inline: false }
                    );

                if (section === 'all' || section === 'skills') {
                    console.log(row)
                    const { attributesText, skillsText } = formatAttributesAndSkills(row.skills.attributes, row.skills.skills);
                    embed.addFields(
                        { name: 'Attributs', value: attributesText, inline: true },
                        { name: 'Compétences', value: skillsText, inline: true }
                    );
                }

                if (section === 'all' || section === 'disciplines') {
                    const disciplineText = Object.entries(disciplines)
                        .map(([key, value]) => formatDiscipline(value.name, value.level, value.skills))
                        .join('\n\n') || 'Aucune discipline définie.';
                    embed.addFields({ name: 'Disciplines', value: disciplineText });
                }

                if (section === 'all' || section === 'background') {
                    const backgroundText = Object.entries(background)
                        .map(([key, value]) => `• **${key}**: ${value}`)
                        .join('\n') || 'Aucun historique défini.';
                    embed.addFields({ name: 'Historique', value: backgroundText });
                }

                interaction.reply({ embeds: [embed], ephemeral: true });

            } catch (e) {
                console.error("Erreur de parsing JSON:", e);
                interaction.reply({ content: 'Erreur lors du traitement des informations du personnage.', ephemeral: true });
            }
        });
    },
};

function formatHealth(aggravated, superficial, max) {
    const fullSquare = '◼'; // Carré plein pour les dégâts aggravés
    const halfSquare = '⛝'; // Carré barré pour les dégâts superficiels
    const emptySquare = '◻'; // Carré vide pour les cases restantes

    return fullSquare.repeat(aggravated) +
        halfSquare.repeat(superficial) +
        emptySquare.repeat(Math.max(0, max - aggravated - superficial));
}

function formatAttributesAndSkills(attributes, skills) {
    console.log(attributes)
    const attributesText = [
        `**Force**: ${attributes.strength}`,
        `**Dexterité**: ${attributes.dexterity}`,
        `**Endurance**: ${attributes.stamina}`,
        `**Charisme**: ${attributes.charisma}`,
        `**Manipulation**: ${attributes.manipulation}`,
        `**Composure**: ${attributes.composure}`,
        `**Intelligence**: ${attributes.intelligence}`,
        `**Wits**: ${attributes.wits}`,
        `**Resolve**: ${attributes.resolve}`
    ].join('\n');

    const skillsText = [
        `**Athletics**: ${skills.athletics}`,
        `**Brawl**: ${skills.brawl}`,
        `**Craft**: ${skills.craft}`,
        `**Drive**: ${skills.drive}`,
        `**Firearms**: ${skills.firearms}`,
        `**Larceny**: ${skills.larceny}`,
        `**Melee**: ${skills.melee}`,
        `**Stealth**: ${skills.stealth}`,
        `**Survival**: ${skills.survival}`,
        `**Animal Ken**: ${skills.animal_ken}`,
        `**Etiquette**: ${skills.etiquette}`,
        `**Insight**: ${skills.insight}`,
        `**Intimidation**: ${skills.intimidation}`,
        `**Leadership**: ${skills.leadership}`,
        `**Performance**: ${skills.performance}`,
        `**Persuasion**: ${skills.persuasion}`,
        `**Streetwise**: ${skills.streetwise}`,
        `**Subterfuge**: ${skills.subterfuge}`,
        `**Academics**: ${skills.academics}`,
        `**Awareness**: ${skills.awareness}`,
        `**Finance**: ${skills.finance}`,
        `**Investigation**: ${skills.investigation}`,
        `**Medicine**: ${skills.medicine}`,
        `**Occult**: ${skills.occult}`,
        `**Politics**: ${skills.politics}`,
        `**Science**: ${skills.science}`,
        `**Technology**: ${skills.technology}`
    ].join('\n');

    return { attributesText, skillsText };
}

function formatDiscipline(discipline, level, skills) {
    const fullCircle = '⦿'; // Cercle plein pour un niveau atteint
    const emptyCircle = '◯'; // Cercle vide pour les niveaux restants

    const levelText = fullCircle.repeat(level) + emptyCircle.repeat(5 - level);

    // Afficher les compétences associées
    const skillsText = skills.map(skill => `${skill.name} (${skill.level}) - ${skill.description}`).join('\n');

    return `**${discipline}** ${levelText}\n${skillsText}`;
}