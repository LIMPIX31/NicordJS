export const tsconfig = `{
  "compilerOptions": {                
    "target": "ESNext",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules",
    "**/__tests__/*"
  ]
}`
