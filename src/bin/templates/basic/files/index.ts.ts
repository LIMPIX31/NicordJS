export const indexFile = `import { NicordClient, IntentsFlags } from 'nicord.js'
import { MyCommands } from './commands'

const client = new NicordClient([
  IntentsFlags.GUILDS,
  IntentsFlags.GUILD_MESSAGES,
])

client.debug()

client.setToken('%TOKEN%')
%GUILD_CODE%
client.start()

client.addCommandListener(MyCommands)`
