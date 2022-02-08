export const indexFile = `import { NicordClient, IntentsFlags } from 'nicord.js'

export const client = new NicordClient([
  IntentsFlags.GUILDS,
  IntentsFlags.GUILD_MESSAGES,
])

client.setToken('%TOKEN%')
%GUILD_CODE%
client.start(() => {
  console.log('Bot started!')
})
`
