import { MessageEmbed, MessageEmbedOptions } from 'discord.js'
import { EmbedParseException } from '../exceptions/EmbedParse.exception'
import * as YAML from 'yaml'

type EmbedLike = string

const embedFindRegexp =
  /embed```(?<format>(json|yml|yaml))(?<code>(.|\s)+?)```/g

export const toCorrectJson = (rjson?: string) =>
  rjson?.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ')

export type EmbedParserResult = {
  embeds: MessageEmbed[]
  clearMessage: string
}

export const parseRelaxedJson = <T = any>(rjson?: string): T => {
  try {
    return JSON.parse(toCorrectJson(rjson) ?? '')
  } catch (e) {
    try {
      return JSON.parse(`{${toCorrectJson(rjson)}}`)
    } catch (e) {
      throw new EmbedParseException('Invalid JSON provided')
    }
  }
}

export const EmbedParser = (input: EmbedLike) => {
  const matches = Array.from(input.matchAll(embedFindRegexp))
  const rawEmbeds = matches.map(v => [v.groups?.format, v.groups?.code])
  const embedOptions: MessageEmbedOptions[] = []
  for (const [format, embed] of rawEmbeds) {
    if (format === 'json') {
      embedOptions.push(parseRelaxedJson(embed))
    } else if (format === 'yml' || format === 'yaml') {
      try {
        embedOptions.push(YAML.parse(embed ?? ''))
      } catch (e: any) {
        throw new EmbedParseException(`Invalid YAML provided: ${e.message}`)
      }
    }
  }
  let clearMessage = input
  for (const match of matches) {
    const [replace] = match
    clearMessage = clearMessage.replaceAll(replace, '')
  }
  return {
    embeds: embedOptions.map(v => new MessageEmbed(v)),
    clearMessage,
  }
}
