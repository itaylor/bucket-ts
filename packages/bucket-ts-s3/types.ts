export type S3BucketOptions = {
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
} | {
  endpoint: string,
  accessKeyId: string,
  secretAccessKey: string,
}
