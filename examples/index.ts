import { NicordClient } from '../src/nicord/NicordClient'
import { IntentsFlags } from '../src/nicord/IntentsFlags'

const client = new NicordClient([
  IntentsFlags.GUILDS,
])

client.setToken('token')

client.start(() => {
  console.log('Started!')
})
