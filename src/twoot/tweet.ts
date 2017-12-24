import * as fs from 'fs'

import * as FormData from 'form-data'
import * as got from 'got'

// import { getOAuthAuthorizationHeader } from 'oauth-authorization-header'

import { authorize, toHeader } from './oauth'
import { Tweet } from './twitter-api/tweet'
import { ImageUploadResponse } from './twitter-api/api-responses'
import { StatusUpdateRequest, MediaUploadRequest } from './twitter-api/api-requests'

const ENDPOINTS = {
  postStatus: 'https://api.twitter.com/1.1/statuses/update.json',
  uploadMedia: 'https://upload.twitter.com/1.1/media/upload.json'
}

export interface TweetOptions {
  /** The text of the tweet. */
  status: string
  /** A list of file paths. */
  attachments?: string[]
  consumerKey: string
  consumerSecret: string
  accessKey: string
  accessSecret: string
}

export async function tweet({
  consumerKey,
  consumerSecret,
  accessKey,
  accessSecret,
  status,
  attachments = []
}: TweetOptions): Promise<Tweet> {
  const mediaIds = await Promise.all(attachments.map(async path => {
    const formData = new FormData()
    formData.append('media', fs.createReadStream(path))

    const mediaRes: got.Response<ImageUploadResponse> = await got(ENDPOINTS.uploadMedia, {
      json: true,
      body: formData,
      headers: toHeader(authorize({
        method: 'POST',
        requestUrl: ENDPOINTS.uploadMedia,
        payload: formData,
        consumerKey,
        consumerSecret,
        accessKey,
        accessSecret
      }))
    })

    return mediaRes.body.media_id_string
  }))

  const payload: StatusUpdateRequest = {
    status,
    media_ids: mediaIds.join(',')
  }

  // const headers = { 'Authorization': getOAuthAuthorizationHeader({
  //     oAuth: {
  //       consumerKey,
  //       consumerSecret,
  //       token: accessKey,
  //       tokenSecret: accessSecret
  //     },
  //     method: 'POST',
  //     queryParams: {},
  //     formParams: payload,
  //     url: ENDPOINTS.postStatus
  //   })
  // }

  // console.log('their headers: ', headers)

  const headers = toHeader(authorize({
    method: 'POST',
    requestUrl: ENDPOINTS.postStatus,
    payload,
    consumerKey,
    consumerSecret,
    accessKey,
    accessSecret
  }))

  console.log('our headers: ', headers)

  const res: got.Response<Tweet> = await got(ENDPOINTS.postStatus, {
    json: true,
    body: payload,
    headers
  })

  return res.body
}
