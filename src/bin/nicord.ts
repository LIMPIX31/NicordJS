#! /usr/bin/env node
import { program } from 'commander'
import { initProject } from './scripts/init'

const { version } = require('../../package.json')

program
  .name('nicord')
  .version(version)

program.command('init')
  .description('Initializes a new project')
  .action(async () => {
    await initProject()
  })

program.parse()
