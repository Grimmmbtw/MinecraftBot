const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { prefix, token } = require('./config.json');

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get('1093943502225801331');
  const invites = await member.guild.invites.fetch();
  const invite = invites.find(i => i.inviter && i.uses > (i.inviter.uses || 0));
  const serveur = 'https://discord.gg/shandera'

  const welcome = new MessageEmbed()
    .setColor('#e67e22')
    .setTitle(`Bienvenue sur Shandera 🎉`)
    .setURL(serveur)
    .setDescription(`**${member.user.tag}** vient de rejoindre l'aventure !\n${invite ? `Il a été invité par **${invite.inviter.tag}**` : 'Nous ne savons pas qui l\'a invité.'} \n\nLe discord compte désormais **${member.guild.memberCount}** aventuriers !`)
    .setThumbnail('https://cdn.discordapp.com/attachments/1093653326240948257/1093959900985569310/a8c63134c7710ccc014c9ba7b5f94e75.png')
    .setFooter(`© Shandera - 2022`)
    .setTimestamp();

  channel.send({ embeds: [welcome] });
});

client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./src/commands');

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./src/commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./src/events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.on('messageCreate', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  try {
    command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('Une erreur est survenue lors de l\'exécution de la commande.');
  }
});

client.login(token);