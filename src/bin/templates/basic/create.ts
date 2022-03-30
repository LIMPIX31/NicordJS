import * as path from 'path'
import * as fs from 'fs/promises'
import * as fsd from 'fs'
import { packageJson } from './files/package.json'
import { indexFile } from './files/index.ts'
import { commandsFile } from './files/commands.ts'
import { tsconfig } from './files/tsconfig.json'
import * as chalk from 'chalk'

const { version } = require('../../../../package.json')

export const CreateBasicTemplate = async (
  project: string,
  token: string,
  guild?: string,
) => {
  const workdir = path.join(process.cwd(), project)
  if (fsd.existsSync(workdir)) {
    console.log(chalk.red('Project already exists'))
    throw new Error('Project already exists')
  }
  await fs.mkdir(workdir)
  const packageJsonGenerated = packageJson
    .replaceAll('%PROJECT_NAME%', project)
    .replaceAll('%NJSV%', version)
  const indexGenerated = indexFile
    .replaceAll('%TOKEN%', token)
    .replaceAll(
      '%GUILD_CODE%',
      guild
        ? `client.defaultGuild = '${guild}'\nclient.localSlashCommands()`
        : '',
    )
  await fs.writeFile(path.join(workdir, 'package.json'), packageJsonGenerated)
  await fs.writeFile(path.join(workdir, 'tsconfig.json'), tsconfig)
  await fs.mkdir(path.join(workdir, 'src'))
  await fs.writeFile(path.join(workdir, 'src', 'index.ts'), indexGenerated)
  await fs.writeFile(path.join(workdir, 'src', 'commands.ts'), commandsFile)
  return workdir
}
