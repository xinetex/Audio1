/**
 * Discord Bot
 * Slash commands for playing games, viewing stats, leaderboards, tournaments
 */

import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { findOrCreateUserFromSocial, getUserStats } from '../services/user.service.js';
import { startGameSession, getLeaderboard } from '../services/game.service.js';

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const GAME_URL = process.env.GAME_URL || 'https://thunderverse.app';

// Commands
const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Start a ThunderVerse game!')
    .addStringOption(option =>
      option
        .setName('game')
        .setDescription('Choose a game')
        .setRequired(true)
        .addChoices(
          { name: '🎮 Pac-Man', value: 'pacman' },
          { name: '🎵 Music Rush', value: 'music-rush' },
          { name: '🎯 Target Blast', value: 'target-blast' }
        )
    ),
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View your player stats'),
  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the leaderboard')
    .addStringOption(option =>
      option
        .setName('game')
        .setDescription('Game type')
        .setRequired(false)
        .addChoices(
          { name: '🎮 Pac-Man', value: 'pacman' },
          { name: '🎵 Music Rush', value: 'music-rush' },
          { name: '🎯 Target Blast', value: 'target-blast' }
        )
    )
    .addStringOption(option =>
      option
        .setName('period')
        .setDescription('Time period')
        .setRequired(false)
        .addChoices(
          { name: '📅 Daily', value: 'daily' },
          { name: '📆 Weekly', value: 'weekly' },
          { name: '📋 Monthly', value: 'monthly' },
          { name: '🏆 All Time', value: 'all_time' }
        )
    ),
  new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('View active tournaments'),
  new SlashCommandBuilder()
    .setName('wallet')
    .setDescription('View your token balance and link wallet'),
  new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get your referral link')
].map(command => command.toJSON());

// Initialize bot
export async function startDiscordBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  // Register commands
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  
  try {
    console.log('🤖 Registering Discord slash commands...');
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
    console.log('✅ Discord commands registered');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }

  // Handle interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
      switch (interaction.commandName) {
        case 'play':
          await handlePlay(interaction);
          break;
        case 'stats':
          await handleStats(interaction);
          break;
        case 'leaderboard':
          await handleLeaderboard(interaction);
          break;
        case 'tournament':
          await handleTournament(interaction);
          break;
        case 'wallet':
          await handleWallet(interaction);
          break;
        case 'invite':
          await handleInvite(interaction);
          break;
      }
    } catch (error) {
      console.error('Command error:', error);
      await interaction.reply({
        content: '❌ An error occurred. Please try again.',
        ephemeral: true
      });
    }
  });

  client.on('ready', () => {
    console.log(`🤖 Discord bot ready as ${client.user?.tag}`);
  });

  await client.login(DISCORD_TOKEN);
  return client;
}

/**
 * Handle /play command
 */
async function handlePlay(interaction: ChatInputCommandInteraction) {
  const gameType = interaction.options.getString('game', true);
  
  // Find or create user
  const user = await findOrCreateUserFromSocial({
    provider: 'discord',
    provider_id: interaction.user.id,
    username: interaction.user.username,
    email: null,
    avatar_url: interaction.user.displayAvatarURL()
  });

  // Start session
  const session = await startGameSession({
    user_id: user.id,
    game_type: gameType,
    platform: 'discord'
  });

  // Create game URL with session token
  const gameUrl = `${GAME_URL}/play/${gameType}?session=${session.session_token}`;

  const embed = new EmbedBuilder()
    .setColor(0x7209B7)
    .setTitle(`🎮 ${getGameName(gameType)}`)
    .setDescription('Click the button below to start playing!')
    .addFields(
      { name: '🎯 Session ID', value: `\`${session.session_token.substring(0, 8)}...\``, inline: true },
      { name: '⚡ Status', value: 'Ready to play!', inline: true }
    )
    .setFooter({ text: '🏆 Compete for the top spot on the leaderboard!' })
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    components: [{
      type: 1,
      components: [{
        type: 2,
        style: 5,
        label: '🎮 Play Now',
        url: gameUrl
      }]
    }]
  });
}

/**
 * Handle /stats command
 */
async function handleStats(interaction: ChatInputCommandInteraction) {
  const user = await findOrCreateUserFromSocial({
    provider: 'discord',
    provider_id: interaction.user.id,
    username: interaction.user.username,
    email: null,
    avatar_url: interaction.user.displayAvatarURL()
  });

  const stats = await getUserStats(user.id);

  const embed = new EmbedBuilder()
    .setColor(0xFF006E)
    .setTitle(`📊 ${interaction.user.username}'s Stats`)
    .setThumbnail(interaction.user.displayAvatarURL())
    .addFields(
      { name: '🎚️ Level', value: `${stats.level}`, inline: true },
      { name: '⭐ XP', value: `${stats.xp}`, inline: true },
      { name: '🪙 Tokens', value: `${stats.tokens_balance}`, inline: true },
      { name: '🎮 Games Played', value: `${stats.games_played}`, inline: true },
      { name: '🏆 Total Score', value: `${stats.total_score}`, inline: true },
      { name: '🎯 Win Rate', value: `${stats.win_rate}%`, inline: true }
    )
    .setFooter({ text: '⚡ Keep playing to level up!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

/**
 * Handle /leaderboard command
 */
async function handleLeaderboard(interaction: ChatInputCommandInteraction) {
  const gameType = interaction.options.getString('game') || 'pacman';
  const period = interaction.options.getString('period') || 'all_time';

  const leaderboard = await getLeaderboard(
    gameType,
    period as 'daily' | 'weekly' | 'monthly' | 'all_time',
    10
  );

  if (leaderboard.length === 0) {
    await interaction.reply('No leaderboard data yet. Be the first to play!');
    return;
  }

  const description = leaderboard
    .map((entry: any, index: number) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      return `${medal} **${entry.username}** - ${entry.total_score.toLocaleString()} pts (Lvl ${entry.level})`;
    })
    .join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x00F5FF)
    .setTitle(`🏆 ${getGameName(gameType)} Leaderboard`)
    .setDescription(description)
    .addFields(
      { name: '📅 Period', value: getPeriodName(period), inline: true },
      { name: '👥 Total Players', value: `${leaderboard.length}`, inline: true }
    )
    .setFooter({ text: '🎮 Play now to climb the ranks!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

/**
 * Handle /tournament command
 */
async function handleTournament(interaction: ChatInputCommandInteraction) {
  // TODO: Implement tournament listing
  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🏆 Active Tournaments')
    .setDescription('No active tournaments right now. Check back soon!')
    .setFooter({ text: '💰 Win big prizes in tournaments!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

/**
 * Handle /wallet command
 */
async function handleWallet(interaction: ChatInputCommandInteraction) {
  const user = await findOrCreateUserFromSocial({
    provider: 'discord',
    provider_id: interaction.user.id,
    username: interaction.user.username,
    email: null,
    avatar_url: interaction.user.displayAvatarURL()
  });

  const stats = await getUserStats(user.id);

  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('💰 Your Wallet')
    .addFields(
      { name: '🪙 Token Balance', value: `${stats.tokens_balance} THUNDER`, inline: false },
      { name: '🔗 Wallet Address', value: user.wallet_address || 'Not connected', inline: false }
    )
    .setDescription(
      user.wallet_address 
        ? '✅ Wallet connected! You can withdraw tokens anytime.' 
        : '❌ Connect your wallet to withdraw tokens.'
    )
    .setFooter({ text: '⚡ Earn tokens by playing games!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * Handle /invite command
 */
async function handleInvite(interaction: ChatInputCommandInteraction) {
  const user = await findOrCreateUserFromSocial({
    provider: 'discord',
    provider_id: interaction.user.id,
    username: interaction.user.username,
    email: null,
    avatar_url: interaction.user.displayAvatarURL()
  });

  const referralLink = `${GAME_URL}?ref=${user.id}`;

  const embed = new EmbedBuilder()
    .setColor(0xFF69B4)
    .setTitle('🎁 Invite Friends & Earn')
    .setDescription('Share your referral link and earn rewards when friends play!')
    .addFields(
      { name: '🔗 Your Referral Link', value: `\`${referralLink}\``, inline: false },
      { name: '💰 Rewards', value: '10% of friend earnings + 100 bonus tokens per signup!', inline: false }
    )
    .setFooter({ text: '🚀 Build your squad and dominate!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * Helper: Get game display name
 */
function getGameName(gameType: string): string {
  const names: Record<string, string> = {
    'pacman': '🎮 Pac-Man',
    'music-rush': '🎵 Music Rush',
    'target-blast': '🎯 Target Blast'
  };
  return names[gameType] || gameType;
}

/**
 * Helper: Get period display name
 */
function getPeriodName(period: string): string {
  const names: Record<string, string> = {
    'daily': '📅 Today',
    'weekly': '📆 This Week',
    'monthly': '📋 This Month',
    'all_time': '🏆 All Time'
  };
  return names[period] || period;
}
