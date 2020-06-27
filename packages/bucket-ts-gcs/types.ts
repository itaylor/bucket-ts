export type GCSBucketOptionKeyfileOnly = {
  /**
   * The name of the GCS bucket
   */
  bucketName: string,
  /**
   * The path to a [GCS keyfile](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)
   */
  keyFilename: string,
}
export type GCSBucketOptionSpecifiedCredentials = {
  /**
   * The name of the GCS bucket
   */
  bucketName: string,
  /**
   * The path to a [GCS keyfile](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)
   */
  keyFilename?: string,
  /**
   * The email of the user of the GCS bucket
   * Needed when keyFilename is a .pem instead of a JSON.
   */
  email?: string,
  /**
   * The google cloud project id, eg: `my-cool-project`
   */
  projectId?: string,
  credentials: {
    /**
     * The email associated with the `private_key`, usually for a service account
     */  
    client_email: string,
    /**
     * The private key to use for authentication.  Usually associated with a service account
     */  
    private_key: string,
  }
}
export type GCSBucketOptions = GCSBucketOptionKeyfileOnly | GCSBucketOptionSpecifiedCredentials 