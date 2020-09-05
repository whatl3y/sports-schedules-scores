import fs from 'fs'
import url from 'url'
import AWS from 'aws-sdk'
import config from '../config'

export default function Aws(options = {}) {
  const accessKeyId = options.accessKeyId || process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey =
    options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY

  return {
    S3: {
      _s3: new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      }),
      defaultbucket: options.bucket || config.aws.s3.bucket,

      writeFile(options) {
        return new Promise((resolve, reject) => {
          const bucket = options.bucket || this.defaultbucket
          const data = options.data
          const filename = !options.exact_filename
            ? getFileName(options.filename)
            : options.filename
          const params = { Bucket: bucket, Key: filename, Body: data }
          this._s3.putObject(params, (err, returnedData) => {
            if (err) return reject(err)
            resolve({ filename: filename, data: returnedData })
          })
        })
      },
    },
  }
}

function getFileName(fileName, extraText = Date.now()) {
  const lastPeriod = fileName.lastIndexOf('.')
  return `${fileName.substring(0, lastPeriod)}_${extraText}${fileName.substring(
    lastPeriod
  )}`
}
