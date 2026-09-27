export interface RecordStopResult {
  tempFilePath: string
  result: string
}

export interface WechatRecordManager {
  start: (options: { duration: number; lang: string }) => void
  stop: () => void
  onStop: ((res: RecordStopResult) => void) | null
  onStart: ((res: unknown) => void) | null
  onError: ((res: { msg: string }) => void) | null
  onRecognize: ((res: unknown) => void) | null
}
