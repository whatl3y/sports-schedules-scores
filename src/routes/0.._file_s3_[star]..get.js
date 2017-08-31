import bunyan from 'bunyan'
import AWS from 'aws-sdk'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)
const s3 = new AWS.S3()

export default function fileDownloadS3(req, res) {
  const bucket = config.aws.s3.bucket
  const filename = req.params[0]
  const params = {Bucket: bucket, Key: filename}
  s3.getObject(params).createReadStream()
  .on('error', (err, response) => {
    res.status(500).json(err.toString())
    return log.error(err)
  })
  .pipe(res)
}
