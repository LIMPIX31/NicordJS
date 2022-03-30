import { EmbedParser } from '../nicord/EmbedParser'
import { EmbedParseException } from '../exceptions/EmbedParse.exception'

describe('EmbedParser', () => {
  it('should parse json', () => {
    const testJson = `
      embed\`\`\`json
        {
          "title": "Test"
        }
      \`\`\`
    `
    const result = EmbedParser(testJson)
    expect(result.embeds).toHaveLength(1)
    expect(result.embeds[0].title).toBe('Test')
  })
  it('should parse json without curlies', () => {
    const testJson = `
      embed\`\`\`json
        "title": "Test"
      \`\`\`
    `
    const result = EmbedParser(testJson)
    expect(result.embeds).toHaveLength(1)
    expect(result.embeds[0].title).toBe('Test')
  })
  it('should parse json without curlies and extra quotes', () => {
    const testJson = `
      embed\`\`\`json
        title: "Test"
      \`\`\`
    `
    const result = EmbedParser(testJson)
    expect(result.embeds).toHaveLength(1)
    expect(result.embeds[0].title).toBe('Test')
  })
  it('should parse json without extra quotes', () => {
    const testJson = `
      embed\`\`\`json
        {
          title: "Test"
        }
      \`\`\`
    `
    const result = EmbedParser(testJson)
    expect(result.embeds).toHaveLength(1)
    expect(result.embeds[0].title).toBe('Test')
  })
  it('should parse yml', () => {
    const testYml = `
      embed\`\`\`yml
        title: Test
        fields:
          - name: FieldName
            value: FieldValue
          - name: AnotherField
            value: AnotherValue
      \`\`\`
    `
    const result = EmbedParser(testYml)
    expect(result.embeds).toHaveLength(1)
    expect(result.embeds[0].title).toBe('Test')
    expect(result.embeds[0].fields).toHaveLength(2)
    expect(result.embeds[0].fields?.[0].name).toBe('FieldName')
    expect(result.embeds[0].fields?.[0].value).toBe('FieldValue')
    expect(result.embeds[0].fields?.[1].name).toBe('AnotherField')
    expect(result.embeds[0].fields?.[1].value).toBe('AnotherValue')
  })

  it('should throw error', () => {
    const invalidJson = `
      embed\`\`\`json
        {
          "invalid": "json"
      \`\`\`
    `
    let err
    try {
      EmbedParser(invalidJson)
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(EmbedParseException)
  })

  it('should generate correct clean message',() => {
    const testYml = `
      any message before
      embed\`\`\`yml
        title: Test
        fields:
          - name: FieldName
            value: FieldValue
          - name: AnotherField
            value: AnotherValue
      \`\`\`
      any message after
    `

    const result = EmbedParser(testYml)

    expect(result.clearMessage).toBe(`
      any message before
      
      any message after
    `)

  })

})
