const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database');
const dictionary = require('../dictionary.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lancer un jet de dés pour Vampire : La Mascarade')
        .addStringOption(option =>
            option.setName('attribute1')
                .setDescription('Premier attribut ou compétence')
                .setRequired(true)
                .setChoices(
                    { name: 'Force', value: 'strength' },
                    { name: 'Dextérité', value: 'dexterity' },
                    { name: 'Vigueur', value: 'stamina' },
                    { name: 'Charisme', value: 'charisma' },
                    { name: 'Manipulation', value: 'manipulation' },
                    { name: 'Sang-froid', value: 'composure' },
                    { name: 'Intelligence', value: 'intelligence' },
                    { name: 'Astuce', value: 'wits' },
                    { name: 'Résolution', value: 'resolve' },
                    { name: 'Frénésie', value: 'frenzy' },
                    { name: 'Humanité', value: 'humanity' },
                    { name: 'Exaltation', value: 'exaltation' },
                    { name: 'Reroll de dés (via Volonté) - Ajouter des bonus_dice !', value: 'reroll' }
                ))
        .addStringOption(option =>
            option.setName('attribute2')
                .setDescription('Deuxième attribut')
                .setRequired(false)
                .setChoices(
                    { name: 'Force', value: 'strength' },
                    { name: 'Dextérité', value: 'dexterity' },
                    { name: 'Vigueur', value: 'stamina' },
                    { name: 'Charisme', value: 'charisma' },
                    { name: 'Manipulation', value: 'manipulation' },
                    { name: 'Sang-froid', value: 'composure' },
                    { name: 'Intelligence', value: 'intelligence' },
                    { name: 'Astuce', value: 'wits' },
                    { name: 'Résolution', value: 'resolve' }
                ))
        .addStringOption(option =>
            option.setName('physical_skill')
                .setDescription('Skill physique')
                .setRequired(false)
                .setChoices(
                    { name: 'Athlétisme', value: 'athletics' },
                    { name: 'Bagarre', value: 'brawl' },
                    { name: 'Artisanat', value: 'craft' },
                    { name: 'Conduite', value: 'drive' },
                    { name: 'Armes à feu', value: 'firearms' },
                    { name: 'Larcin', value: 'larceny' },
                    { name: 'Mêlée', value: 'melee' },
                    { name: 'Discrétion', value: 'stealth' },
                    { name: 'Survie', value: 'survival' }
                ))
        .addStringOption(option =>
            option.setName('social_skill')
                .setDescription('Skill mental')
                .setRequired(false)
                .setChoices(
                    { name: 'Animaux', value: 'animal_ken' },
                    { name: 'Commandement', value: 'leadership' },
                    { name: 'Empathie', value: 'insight' },
                    { name: 'Étiquette', value: 'etiquette' },
                    { name: 'Expérience de la rue', value: 'streetwise' },
                    { name: 'Intimidation', value: 'intimidation' },
                    { name: 'Persuasion', value: 'persuasion' },
                    { name: 'Représentation', value: 'performance' },
                    { name: 'Subterfuge', value: 'subterfuge' }
                ))
        .addStringOption(option =>
            option.setName('mental_skill')
                .setDescription('Skill social')
                .setRequired(false)
                .setChoices(
                    { name: 'Erudition', value: 'academics' },
                    { name: 'Finance', value: 'finance' },
                    { name: 'Investigation', value: 'investigation' },
                    { name: 'Médecine', value: 'medicine' },
                    { name: 'Occultisme', value: 'occult' },
                    { name: 'Politique', value: 'politics' },
                    { name: 'Science', value: 'science' },
                    { name: 'Technologie', value: 'technology' },
                    { name: 'Vigilance', value: 'awareness' }
                ))
        .addStringOption(option =>
            option.setName('discipline')
                .setDescription('Discipline')
                .setRequired(false)
                .setChoices(
                    { name: 'Alchimie du sang clair', value: 'thin_blood_alchemy' },
                    { name: 'Animalisme', value: 'animalism' },
                    { name: 'Auspex', value: 'auspex' },
                    { name: 'Célérité', value: 'celerity' },
                    { name: 'Domination', value: 'dominate' },
                    { name: 'Force d\'âme', value: 'fortitude' },
                    { name: 'Occultation', value: 'obfuscate' },
                    { name: 'Obténébration', value: 'oblivion' },
                    { name: 'Présence', value: 'presence' },
                    { name: 'Protéisme', value: 'protean' },
                    { name: 'Puissance', value: 'potence' },
                    { name: 'Sorcellerie du sang', value: 'blood_sorcery' },
                    { name: 'Temporis', value: 'temporis' }
                ))
        .addStringOption(option =>
            option.setName('bonus_dices')
                .setDescription('Dés Bonus ou Malus')
                .setRequired(false)),

    async execute(interaction) {
        const channel_id = interaction.channelId;
        let values = [interaction.options.getString('attribute1'), interaction.options.getString('attribute2'), interaction.options.getString('physical_skill'), interaction.options.getString('social_skill'), interaction.options.getString('mental_skill'), interaction.options.getString('discipline')]
        values = values.filter(value => value !== undefined && value !== null);

        db.get('SELECT id, max_willpower, aggravated_willpower, superficial_willpower, identity, stains, skills, disciplines, hunger FROM characters WHERE channel_id = ?', [channel_id], async (err, row) => {
            if (err) {
                return interaction.reply({content: 'Erreur lors de la récupération du personnage.', ephemeral: true});
            }
            if (!row) {
                return interaction.reply({content: 'Aucun personnage trouvé pour ce canal.', ephemeral: true});
            }

            try {
                const characterData = JSON.parse(row.skills);
                const disciplines = JSON.parse(row.disciplines);
                const characterIdentity = JSON.parse(row.identity);
                const currentWillpower = row.max_willpower - row.aggravated_willpower - row.superficial_willpower;
                const attributes = characterData.attributes;
                const skills = characterData.skills;
                const hunger = row.hunger || 0;
                const bonusDices = interaction.options.getString('bonus_dices') || 0;

                // Vérifier si les attributs/compétences existent
                let dicePool = parseInt(bonusDices);

                let rollHunger = false;
                let buttonRow = null;
                let buttonToAdd = null;
                if (interaction.options.getString('attribute1') === "frenzy")
                    dicePool += Math.floor(characterIdentity.humanity / 3) + currentWillpower;
                else if (interaction.options.getString('attribute1') === "humanity")
                    dicePool += Math.max(10 - characterIdentity.humanity - row.stains, 1);
                else if (interaction.options.getString('attribute1') === "exaltation") {
                    const { row, button } = createButton("Augmenter la soif", ButtonStyle.Danger, handleButtonClick, handleCollectorEnd);
                    buttonRow = row;
                    buttonToAdd = button;
                    dicePool += 1;
                } else if (interaction.options.getString('attribute1') === "reroll") {
                    if(bonusDices <= 0) {
                        return interaction.reply({content: 'Aucun nombre de dés donné pour ce reroll (utilisez bonus_dice pour définir le nombre)', ephemeral: true});
                    } else {
                        await addWillpowerDamage(row.id, interaction);
                    }
                } else {
                    values.forEach((value) => dicePool += getStat(attributes, skills, disciplines, value));
                    rollHunger = true;
                }

                if (dicePool === 0) {
                    return interaction.reply({
                        content: 'Les attributs/compétences choisis ne sont pas valides.',
                        ephemeral: true
                    });
                }

                // Lancer les dés
                let rolls = [];
                for (let i = 0; i < dicePool; i++) {
                    rolls.push(Math.floor(Math.random() * 10) + 1);
                }

                let totalDice = rolls.length;
                let hungerDice = rollHunger ? Math.min(hunger, totalDice) : 0;
                let normalDice = totalDice - hungerDice;

                let hungerRolls = hungerDice > 0 ? rolls.slice(-hungerDice) : [];
                let normalRolls = rolls.slice(0, normalDice);

                let successes = normalRolls.filter(die => die >= 6).length;
                let hungerSuccesses = hungerRolls.filter(die => die >= 6).length;

                let normalCriticals = normalRolls.filter(die => die === 10).length;
                let hungerCriticals = hungerRolls.filter(die => die === 10).length;
                let hungerFails = hungerRolls.filter(die => die === 1).length;

                const filteredValues = values
                    .filter(value => value !== undefined && value !== null)
                    .map(value => dictionary[value]);


                let str = filteredValues.join(' + ');
                if (bonusDices > 0) str += " + " + bonusDices;
                if (bonusDices < 0) str += " - " + Math.abs(bonusDices);

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
                    status = '⚡ ** Triompe Brutal !**';
                }

                if (hungerFails >= 1) {
                    resultMessage += '\n💀 **Potentiel échec bestial !**';
                    status = '💀 **Échec Bestial !**';
                    color = '#ff0000'; // Rouge pour un échec bestial
                }

                insertRollhistory(channel_id, str, rolls, hunger);

                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(status)
                    .setDescription(`**${str} :**`)
                    .addFields(
                        {
                            name: '🎲 Dés normaux',
                            value: normalRolls.length > 0 ? normalRolls.join(', ') : 'Aucun',
                            inline: true
                        },
                        {
                            name: '🩸 Dés de Soif',
                            value: hungerRolls.length > 0 ? hungerRolls.join(', ') : 'Aucun',
                            inline: true
                        },
                        {name: '📊 Résultats', value: resultMessage}
                    )
                    .setFooter({text: 'Gotham by Night - Jet de dés'});


                if(buttonToAdd == null) {
                    await interaction.reply({embeds: [embed]});
                } else {
                    const response = await interaction.reply({embeds: [embed], components: [buttonRow], fetchReply: true });
                    // Création du collecteur
                    const filter = i => i.customId === `hunger_increase` && i.user.id === interaction.user.id;
                    const collector = response.createMessageComponentCollector({ filter, time: 60000, max: 1 });

                    collector.on('collect', async i => handleButtonClick(i, interaction, buttonToAdd));
                    collector.on('end', async collected => handleCollectorEnd(collected, interaction, buttonToAdd));
                }
            } catch (err) {
                console.error(err);
                return interaction.reply({
                    content: 'Erreur lors du traitement des données du personnage.',
                    ephemeral: true
                });
            }
        });
    }
};

function getStat(attributes, skills, disciplines, toFind) {
    if(toFind === undefined)
        return 0;

    if (attributes[toFind]) {
        return attributes[toFind];
    } else if (skills[toFind]) {
        return skills[toFind];
    } else if (disciplines[toFind]) {
        return disciplines[toFind].level;
    }

    return 0;
}

function insertRollhistory(channel_id, label, rolls, hunger) {
    db.run(
        `INSERT INTO roll_history (channel_id, label, rolls, hunger) VALUES (?, ?, ?, ?)`,
        [channel_id, label, JSON.stringify(rolls), hunger], // On passe les valeurs ici
        (err) => {
            if (err) {
                console.log(err);
            }
        }
    );
}

// Fonction pour créer un bouton avec collecteur
function createButton(text, style, lambdaOnCollect, lambdaOnEnd) {
    const button = new ButtonBuilder()
        .setCustomId(`hunger_increase`)
        .setLabel(text)
        .setStyle(style)
        .setDisabled(false);

    const row = new ActionRowBuilder().addComponents(button);

    return { row, button, lambdaOnCollect, lambdaOnEnd };
}

// Lambda pour gérer le clic du bouton
const handleButtonClick = async (i, interaction, button) => {
    const channel_id = interaction.channelId;

    db.get('SELECT hunger FROM characters WHERE channel_id = ?', [channel_id], async (err, row) => {
        if (err) {
            return i.reply({ content: 'Erreur lors de la récupération des données.', ephemeral: true });
        }
        if (!row) {
            return i.reply({ content: 'Aucun personnage trouvé pour ce canal.', ephemeral: true });
        }

        button.setDisabled(true);
        i.update({components: [new ActionRowBuilder().addComponents(button)]});

        if (row.hunger >= 5) {
            return interaction.channel.send('🩸 **Les problèmes commencent !** C\'est l\'heure du jet de frénésie pour résister à la faim (diff 4).');
        }

        // Mise à jour de la faim (+1)
        db.run('UPDATE characters SET hunger = hunger + 1 WHERE channel_id = ?', [channel_id], (err) => {
            if (err) {
                return i.reply({ content: 'Erreur lors de la mise à jour de la faim.', ephemeral: true });
            }
        });
    });
};

// Lambda pour gérer la fin du collecteur (expiré sans clic)
const handleCollectorEnd = async (collected, interaction, button) => {
    if (collected.size === 0) {
        button.setDisabled(true);
        await interaction.editReply({ components: [new ActionRowBuilder().addComponents(button)] });
    }
};

async function addWillpowerDamage(characterId, interaction) {
    const channelId = interaction.channelId;
    const channel = interaction.channel;
    return new Promise((resolve, reject) => {
        db.get('SELECT max_willpower, superficial_willpower, aggravated_willpower FROM characters WHERE id = ?', [characterId], async (err, row) => {
            if (err || !row) {
                console.error("Erreur lors de la récupération du personnage :", err);
                return reject(err);
            }

            let { max_willpower, superficial_willpower, aggravated_willpower } = row;

            // Ajoute un point de dégât superficiel
            superficial_willpower += 1;

            if (superficial_willpower + aggravated_willpower >= max_willpower) {
                // Envoyer un message dans le channel d'affaiblissement
                try {
                    await channel.send("⚠️ Le personnage est **affaibli** ! -2 sur tous les jets de Social et de Mental.");
                } catch (sendError) {
                    console.error("Erreur lors de l'envoi du message :", sendError);
                }
            }

            if (superficial_willpower + aggravated_willpower > max_willpower) {
                // Si on dépasse le max, convertir un superficiel en aggravé
                superficial_willpower -= 2;
                aggravated_willpower += 1;

                // Envoyer un message dans le channel d'affaiblissement
                try {
                    await channel.send("⚠️ Le personnage a pris un dégât de Willpower aggravé.");
                } catch (sendError) {
                    console.error("Erreur lors de l'envoi du message :", sendError);
                }

            }

            // Mettre à jour les valeurs dans la base de données
            db.run(`
                UPDATE characters 
                SET superficial_willpower = ?, aggravated_willpower = ? 
                WHERE id = ?
            `, [superficial_willpower, aggravated_willpower, characterId], function (updateErr) {
                if (updateErr) {
                    console.error("Erreur lors de la mise à jour des dégâts :", updateErr);
                    return reject(updateErr);
                }
                resolve();
            });
        });
    });
}

