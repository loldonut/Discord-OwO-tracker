const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10.js');

const BaseEmbed = require('../Utils/BaseEmbed.js');
const Profile = require('../models/OwO');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset OwO stats')
    .addStringOption(option =>
      option.setName('value')
        .setDescription('Reset type')
        .setRequired(true)
        .addChoices(
          { name: 'Daily', value: 'daily' },
          { name: 'Weekly', value: 'weekly' },
          { name: 'Monthly', value: 'monthly' },
          { name: 'Total', value: 'total' },
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const type = interaction.options.getString('value');

      const resetEmbed = BaseEmbed(interaction)
        .setTitle(`${type} OwOs reset!`)
        .setDescription(`Clicking on \`clear\` button below will reset ${type} OwOs of all users in this server`);

      const clear = new MessageButton()
        .setCustomId('clear')
        .setLabel('Clear')
        .setStyle('SUCCESS');
      const stop = new MessageButton()
        .setCustomId('stop')
        .setLabel('Stop')
        .setStyle('DANGER');

      const row = new MessageActionRow().addComponents([clear, stop]);

        const filter = (i) => ['clear', 'stop'].includes(i.customId) && i.user.id === interaction.user.id;

        const msg = await interaction.reply({ embeds: [resetEmbed], components: [row], fetchReply: true });
        const collector = await msg.createMessageComponentCollector({
          filter,
          componentType: 'BUTTON',
          time: 120000,
          errors: ['time']
        });

        let shouldClear;
        collector.on('collect', async (i) => {
          i.deferUpdate();

          if (i.customId === 'clear') shouldClear = true;
          else if (i.customId === 'stop') shouldClear = false;

          collector.stop();
        });

        collector.on('end', (_, reason) => {
          if (reason === 'time') {
            clear.setDisabled(true);
            stop.setDisabled(true);

            await interaction.editReply({
              components: [row],
              fetchReply: true
            });
          }
        });

      if (!shouldClear) {
        const stopped = new BaseEmbed(interaction)
          .setTitle('Cancelled reset!')
          .setDescription('Alright we are not deleting daily OwOs');
        
        clear.setDisabled(true);
        stop.setDisabled(true);
        
        await interaction.editReply({
          embeds: [stopped],
          components: [row]
        });
        return;
      }

      if (type === 'daily') await Profile.updateMany({ guildId: i.guild.id }, { $unset: { daily: 1 } });
      if (type === 'weekly') await Profile.updateMany({ guildId: i.guild.id }, { $unset: { weekly: 1 } });
    } catch (err) {
      console.error(err);
    }
  },

  async execute(i) {
    try {
      const type = i.options.getString('value');
      if (!type) return;

      if (type.toLowerCase() == 'daily') {
        let resetEmbed = BaseEmbed(i)
          .setTitle(`Daily OwOs reset!`)
          .setDescription(`Clicking on \`clear\` button below will reset daily OwOs of all users in this server`);

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('clear')
              .setLabel('Clear')
              .setStyle('SUCCESS'),
            new MessageButton()
              .setCustomId('stop')
              .setLabel('Stop')
              .setStyle('DANGER')
          );

        const msg = await i.reply({ embeds: [resetEmbed], components: [row], fetchReply: true })
        const collector = await msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 120000, errors: ['time'] });

        collector.on('collect', async bi => {
          bi.deferUpdate()
          if (bi.user.id === i.user.id) {
            if (bi.customId == 'clear') {
              collector.stop()
              await Profile.updateMany({ guildId: i.guild.id }, { $unset: { daily: 1 } })
              let cleared = BaseEmbed(i)
                .setTitle(`Cleared daily OwOs`)
                .setDescription(`Successfully cleared daily OwOs of all users in this server`)
              const clearedrow = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('clear')
                    .setLabel('Clear')
                    .setDisabled(true)
                    .setStyle('SUCCESS'),
                  new MessageButton()
                    .setCustomId('stop')
                    .setLabel('Stop')
                    .setDisabled(true)
                    .setStyle('DANGER')
                );

              await i.editReply({ embeds: [cleared], components: [clearedrow] });
            } else if (bi.customId == 'stop') {
              let stopped = BaseEmbed(i)
                .setTitle(`Cancelled reset!`)
                .setDescription(`Alright we are not deleting daily OwOs`)
              const stoprow = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('clear')
                    .setLabel('Clear')
                    .setDisabled(true)
                    .setStyle('SUCCESS'),
                  new MessageButton()
                    .setCustomId('stop')
                    .setLabel('Stop')
                    .setDisabled(true)
                    .setStyle('DANGER')
                );

              await i.editReply({ embeds: [stopped], components: [stoprow] });
            }
          } else {
            bi.reply({ content: `These buttons aren't for you!`, ephemeral: true });
          }
        });

        collector.on('end', async (msg, reason) => {
          if (reason == 'time') {
            const endrow = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId('clear')
                  .setLabel('Clear')
                  .setDisabled(true)
                  .setStyle('SUCCESS'),
                new MessageButton()
                  .setCustomId('stop')
                  .setLabel('Stop')
                  .setDisabled(true)
                  .setStyle('DANGER')
              );

            await i.editReply({ components: [endrow], fetchReply: true })
          }
        });
      } else if (type.toLowerCase() == 'weekly') {
        let resetEmbed = BaseEmbed(i)
          .setTitle(`Weekly OwOs reset!`)
          .setDescription(`Clicking on \`clear\` button below will reset weekly OwOs of all users in this server`);

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('clear')
              .setLabel('Clear')
              .setStyle('SUCCESS'),
            new MessageButton()
              .setCustomId('stop')
              .setLabel('Stop')
              .setStyle('DANGER')
          );

        const msg = await i.reply({ embeds: [resetEmbed], components: [row], fetchReply: true })
        const collector = await msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 120000, errors: ['time'] });

        collector.on('collect', async bi => {
          bi.deferUpdate();

          if (bi.user.id === i.user.id) {
            if (bi.customId == 'clear') {
              collector.stop();
              await Profile.updateMany({ guildId: i.guild.id }, { $unset: { weekly: 1 } });

              let cleared = BaseEmbed(i)
                .setTitle(`Cleared weekly OwOs`)
                .setDescription(`Successfully cleared weekly OwOs of all users in this server`);

              const clearedrow = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('clear')
                    .setLabel('Clear')
                    .setDisabled(true)
                    .setStyle('SUCCESS'),
                  new MessageButton()
                    .setCustomId('stop')
                    .setLabel('Stop')
                    .setDisabled(true)
                    .setStyle('DANGER')
                );

              await i.editReply({ embeds: [cleared], components: [clearedrow] });
            } else if (bi.customId == 'stop') {
              let stopped = BaseEmbed(i)
                .setTitle(`Cancelled reset!`)
                .setDescription(`Alright we are not deleting weekly OwOs`);

              const stoprow = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('clear')
                    .setLabel('Clear')
                    .setDisabled(true)
                    .setStyle('SUCCESS'),
                  new MessageButton()
                    .setCustomId('stop')
                    .setLabel('Stop')
                    .setDisabled(true)
                    .setStyle('DANGER')
                );

              await i.editReply({ embeds: [stopped], components: [stoprow] });
            }
          } else {
            await bi.reply({ content: `These buttons aren't for you!`, ephemeral: true });
          }
        });

        collector.on('end', async (_, reason) => {
          if (reason == 'time') {
            const endrow = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId('clear')
                  .setLabel('Clear')
                  .setDisabled(true)
                  .setStyle('SUCCESS'),
                new MessageButton()
                  .setCustomId('stop')
                  .setLabel('Stop')
                  .setDisabled(true)
                  .setStyle('DANGER')
              );

            await i.editReply({ components: [endrow], fetchReply: true });
          }
        });
      } else if (type.toLowerCase() == 'monthly') {
        let resetEmbed = BaseEmbed(i)
          .setTitle(`Monthly OwOs reset!`)
          .setDescription(`Clicking on \`clear\` button below will reset monthly OwOs of all users in this server`);

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('clear')
              .setLabel('Clear')
              .setStyle('SUCCESS'),
            new MessageButton()
              .setCustomId('stop')
              .setLabel('Stop')
              .setStyle('DANGER')
          );

        const msg = await i.reply({ embeds: [resetEmbed], components: [row], fetchReply: true });
        const collector = await msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 120000, errors: ['time'] });

        collector.on('collect', async bi => {
          bi.deferUpdate();

          if (bi.user.id === i.user.id) {
            if (bi.customId == 'clear') {
              collector.stop();
              await Profile.updateMany({ guildId: i.guild.id }, { $unset: { monthly: 1 } });

              let cleared = BaseEmbed(i)
                .setTitle(`Cleared monthly OwOs`)
                .setDescription(`Successfully cleared monthly OwOs of all users in this server`);

              const clearedrow = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('clear')
                    .setLabel('Clear')
                    .setDisabled(true)
                    .setStyle('SUCCESS'),
                  new MessageButton()
                    .setCustomId('stop')
                    .setLabel('Stop')
                    .setDisabled(true)
                    .setStyle('DANGER')
                );

              await i.editReply({ embeds: [cleared], components: [clearedrow] });
            } else if (bi.customId == 'stop') {
              let stopped = BaseEmbed(i)
                .setTitle(`Cancelled reset!`)
                .setDescription(`Alright we are not deleting monthly OwOs`);

              const stoprow = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('clear')
                    .setLabel('Clear')
                    .setDisabled(true)
                    .setStyle('SUCCESS'),
                  new MessageButton()
                    .setCustomId('stop')
                    .setLabel('Stop')
                    .setDisabled(true)
                    .setStyle('DANGER')
                );

              await i.editReply({ embeds: [stopped], components: [stoprow] });
            }
          } else {
            await bi.reply({ content: `These buttons aren't for you!`, ephemeral: true });
          }
        });

        collector.on('end', async (_, reason) => {
          if (reason == 'time') {
            const endrow = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId('clear')
                  .setLabel('Clear')
                  .setDisabled(true)
                  .setStyle('SUCCESS'),
                new MessageButton()
                  .setCustomId('stop')
                  .setLabel('Stop')
                  .setDisabled(true)
                  .setStyle('DANGER')
              );

            await i.editReply({ components: [endrow], fetchReply: true })
          }
        });

      } else if (type.toLowerCase() == 'total') {
        let resetEmbed = BaseEmbed(i)
          .setTitle(`Total OwOs reset!`)
          .setDescription(`Clicking on \`clear\` button below will reset total OwOs of all users in this server`);

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('clear')
              .setLabel('Clear')
              .setStyle('SUCCESS'),
            new MessageButton()
              .setCustomId('stop')
              .setLabel('Stop')
              .setStyle('DANGER')
          );

        const msg = await i.reply({ embeds: [resetEmbed], components: [row], fetchReply: true });
        const collector = await msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 120000, errors: ['time'] });

        collector.on('collect', async bi => {
          bi.deferUpdate();

          if (bi.user.id === i.user.id) {
            if (bi.customId == 'clear') {
              collector.stop()
              await Profile.updateMany({ guildId: i.guild.id }, { $unset: { total: 1 } });

              let cleared = BaseEmbed(i)
                .setTitle(`Cleared total OwOs`)
                .setDescription(`Successfully cleared total OwOs of all users in this server`)
              const clearedrow = new MessageActionRow()
              clearedrow.addComponents(
                new MessageButton()
                  .setCustomId('clear')
                  .setLabel('Clear')
                  .setDisabled(true)
                  .setStyle('SUCCESS'),
                new MessageButton()
                  .setCustomId('stop')
                  .setLabel('Stop')
                  .setDisabled(true)
                  .setStyle('DANGER')
              );
              await i.editReply({ embeds: [cleared], components: [clearedrow] });

            } else if (bi.customId == 'stop') {
              let stopped = BaseEmbed(i)
                .setTitle(`Cancelled reset!`)
                .setDescription(`Alright we are not deleting total OwOs`)
              const stoprow = new MessageActionRow()
              stoprow.addComponents(
                new MessageButton()
                  .setCustomId('clear')
                  .setLabel('Clear')
                  .setDisabled(true)
                  .setStyle('SUCCESS'),
                new MessageButton()
                  .setCustomId('stop')
                  .setLabel('Stop')
                  .setDisabled(true)
                  .setStyle('DANGER')
              );
              await i.editReply({ embeds: [stopped], components: [stoprow] });
            }
          } else {
            bi.reply({ content: `These buttons aren't for you!`, ephemeral: true });
          }
        });

        collector.on('end', async (msg, reason) => {
          if (reason == 'time') {
            const endrow = new MessageActionRow()
            endrow.addComponents(
              new MessageButton()
                .setCustomId('clear')
                .setLabel('Clear')
                .setDisabled(true)
                .setStyle('SUCCESS'),
              new MessageButton()
                .setCustomId('stop')
                .setLabel('Stop')
                .setDisabled(true)
                .setStyle('DANGER')
            );
            await i.editReply({ components: [endrow], fetchReply: true })
          }
        });

      }
    } catch (e) {
      console.log(e)
    }
  },
};
