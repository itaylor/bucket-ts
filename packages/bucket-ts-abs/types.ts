export type ABSBucketOptionConnectionString = {
  /** The name of the ABS container eg: `my-awesome-bucket` */
  bucketName: string,
  /** The connection string to use for this ABS container */
  connectionString: string,
}
export type ABSBucketOptions =  ABSBucketOptionConnectionString;
