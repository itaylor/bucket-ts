export type S3BucketOptions = {
  /** The name of the s3 bucket eg: `my-awesome-bucket` */
  bucketName: string,
  /** The [accessKeyId](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) for the bucket */
  accessKeyId: string,
  /** The [secretAccessKey](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) for the bucket */
  secretAccessKey: string,
  /** The AWS region in which the bucket is used */ 
  region?: string,
  /** The url of the endpoint to use with the S3 client.  
   * *Note:* This is only needed if you are using a non-AWS, S3 compatible server, (like [minio](https://min.io/)) */
  endpoint?: string,
}
