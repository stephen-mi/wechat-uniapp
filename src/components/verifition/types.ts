export interface VerifyImgSize {
  width: string
  height: string
}

export interface VerifyBlockSize {
  width: string
  height: string
}

export interface VerifyBarSize {
  width: string
  height: string
}

export interface CaptchaGetRepData {
  originalImageBase64: string
  jigsawImageBase64?: string
  token: string
  secretKey: string
  wordList?: string[]
}

export interface CaptchaApiResult {
  repCode: string
  repData?: CaptchaGetRepData
}

export interface CaptchaPoint {
  x: number
  y: number
}

export interface CaptchaSuccessPayload {
  captchaVerification: string
}

export const VERIFY_POP_CLOSE_KEY = Symbol('verifyPopClose')
