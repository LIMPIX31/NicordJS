export const packageJson = `{
  "name": "%PROJECT_NAME%",
  "version": "1.0.0",
  "main": "src/index.ts",
  "license": "MIT",
  "scripts": {
    "start": "ts-node src/index.ts"
  },
  "dependencies": {
    "nicord.js": "~%NJSV%",
    "typescript": "^4.5.5"
  },
  "devDependencies": {
    "ts-node": "^10.4.0"
  }
}`
