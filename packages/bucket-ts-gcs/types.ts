export type GCSBucketOptions = {
  bucketName: string,
  keyFilename: string,
} | {
  bucketName: string,
  email?: string,
  projectId?: string,
  credentials: {
    client_email: string,
    private_key: string,
  }
}