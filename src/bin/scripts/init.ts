import * as inquirer from 'inquirer'
import * as chalk from 'chalk'
import { CreateBasicTemplate } from '../templates/basic/create'
import { exec } from 'child_process'

import { CliStage } from 'cli-stage'
import * as fs from 'fs'
import * as path from 'path'

enum Template {
  BASIC = 'Basic (Everything you need to start with the first line)',
  ENTERPRISE = 'Enterprise (For commercial products and professionals) [soon]',
}

enum Packman {
  NPM = 'npm',
  YARN = 'yarn',
}

const qs = [
  {
    name: 'project',
    type: 'input',
    message: 'Project name:',
    validate: function (input) {
      if (/^([a-z\-_\d])+$/.test(input)) {
        if (!fs.existsSync(path.join(process.cwd(), input))) return true
        else return 'Project already exists'
      } else
        return 'Project name may only include lowercase letters, numbers, underscores and hashes.'
    },
  },
  {
    name: 'token',
    type: 'input',
    message: 'Bot token:',
    validate: function (input) {
      if (/^\w+\.\w+\.\w+$/.test(input)) return true
      else return 'Invalid token'
    },
  },
  {
    name: 'private',
    type: 'confirm',
    message: 'Is not public bot?:',
  },
  {
    name: 'template',
    type: 'list',
    message: 'Select template:',
    choices: [Template.BASIC, Template.ENTERPRISE],
  },
  {
    name: 'packman',
    type: 'list',
    message: 'Select package manager:',
    choices: [Packman.NPM, Packman.YARN],
    default: Packman.NPM,
  },
]

export const initProject = async () => {
  const answers = await inquirer.prompt(qs)
  if (answers['private']) {
    answers['guild'] = (
      await inquirer.prompt([
        {
          name: 'guild',
          type: 'input',
          message: 'Guild id:',
          validate: input => {
            if (/^\d+$/.test(input) && input.length === 18) return true
            else return 'Invalid guild id'
          },
        },
      ])
    )['guild']
  }

  const cls = new CliStage('Generating project', 'Installing dependencies')

  let workdir

  switch (answers['template']) {
    case Template.BASIC:
      try {
        workdir = await CreateBasicTemplate(
          answers['project'],
          answers['token'],
          answers['guild'],
        )
        cls.success()
      } catch (e) {
        console.log(e)
        console.log(chalk.red('Failed'))
        cls.error(true)
        process.exit(0)
      }
      break
    case Template.ENTERPRISE:
      console.log(
        chalk.red(
          "'Enterprise' template is in development. Please use another template",
        ),
      )
      return
  }

  const installDeps = () => {
    if (answers['packman'] === Packman.YARN) {
      exec('yarn', { cwd: workdir }, err => {
        if (err) {
          cls.error(true)
          process.exit(0)
        } else cls.success()
      })
    } else {
      exec('npm i', { cwd: workdir }, err => {
        if (err) {
          cls.error(true)
          process.exit(0)
        } else cls.success()
      })
    }
  }
  if (answers['packman'] === Packman.YARN)
    exec('npm i yarn -g', { cwd: workdir }, err => {
      if (err) {
        cls.error(true)
        process.exit(0)
      } else installDeps()
    })
  else installDeps()
}
