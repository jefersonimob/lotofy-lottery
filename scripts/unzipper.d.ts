declare module 'unzipper' {
  export function Extract(options: { path: string }): NodeJS.WritableStream
  export function Parse(): NodeJS.WritableStream
}
