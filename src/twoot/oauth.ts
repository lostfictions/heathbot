import { createHmac, randomBytes } from 'crypto'
import { stringify as querystringify, ParsedUrlQuery } from 'querystring'
import { parse as parseUrl, URL } from 'url'

interface AuthorizeOptions {
  requestUrl: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'DELETE'
  payload: { [ key: string ]: any }
  consumerKey: string
  consumerSecret: string
  accessKey: string
  accessSecret: string
}

interface OAuthParams {
  oauth_consumer_key: string
  oauth_nonce: string
  oauth_signature_method: 'HMAC-SHA1'
  oauth_timestamp: number
  oauth_version: '1.0'
  oauth_token: string
}

interface SignedData extends OAuthParams {
  oauth_signature: string
}

export function authorize(config: AuthorizeOptions): SignedData {
  const oauthParams: OAuthParams = {
    oauth_consumer_key: config.consumerKey,
    oauth_nonce: randomBytes(16).toString('hex'), // 32-char nonce
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_version: '1.0',
    oauth_token: config.accessKey
  }

  return {
    ...oauthParams,
    oauth_signature: getSignature(config, oauthParams)
  }
}

export function toHeader(oauthData: SignedData): { Authorization: string } {
  return {
    Authorization: 'OAuth ' + Object.entries(sorted(oauthData))
      .map(([key, value]) => `${encodeAll(key)}="${encodeAll(value)}"`)
      .join(', ')
  }
}

function getSignature(request: AuthorizeOptions, oauthData: OAuthParams): string {
  return sha1Sign(
    getPayloadString(request, oauthData),
    `${request.consumerSecret}&${request.accessSecret}`
  )
}

function sha1Sign(baseString: string, key: string): string {
  return createHmac('sha1', key).update(baseString).digest('base64')
}

function getPayloadString({ method, requestUrl, payload }: AuthorizeOptions, oauthParams: OAuthParams): string {
  const { origin } = new URL(requestUrl)
  const { query } = parseUrl(requestUrl, true)

  const fullPayload = {
    ...oauthParams,
    ...payload,
    ...query as ParsedUrlQuery
  }

  return `${method}&${encodeAll(origin)}&${encodeAll(querystringify(sorted(fullPayload)))}`
}

function sorted<T>(o: T): T {
  const p: any = {}
  for(const k of Object.keys(o).sort()) p[k] = o[k as keyof T]
  return p
}

function encodeAll(str: string): string {
  return encodeURIComponent(str)
    .replace(/\!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/\'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
}
