
export type BucketProviderResponse = {
  /** A message describing the results */
  message?: string,
}
export type BucketProviderListResponse = {
  /**
   * true if the results contain the entire set data found, false otherwise 
   */
  complete: boolean,
  /**
   * A message describing the results
   */
  message?: string,
  /**
   * A list of file names found, relative from the bucket root
   */
  results: Array<string>,
  /**
   * A paginator object to control how many records to fetch at once.
   */
  paginator: BucketProviderPaginator,
}

export interface BucketProviderOptions {
  /**
   * the name/id of the bucket
   */
  bucketName: string,
}

export interface BucketProviderCtor {
  /**
   * @param options The options for a bucketProvider
   * @return a new instance of [[BucketProvider]]
   */
  new (options: BucketProviderOptions): BucketProvider;
  /** 
   * @return a JSON Schema object describing the options for this bucket provider
  */
  getOptionsSchema(): object;
}

export interface BucketProviderListFileOptions {
  /**
   * An optional paginator object to control how many items to return and where to start in the list
   */
  paginator?: BucketProviderPaginator,
  /**
   * Constrains the list results to only files with this prefix.
   * Useful for filtering by folder 
   */
  prefix?: string,
}

export type BucketProviderPaginator = {
  /**
   * The maximium number of records to return
   * @default 1000
   */
  maxReturn: number,
  /**
   * A key used to identity what page of results to start fetching from
   */
  pageOffsetId?: string,
}

export interface BucketProvider {
  /**
   * @return the full URL at which the bucket is hosted 
   */  
  getBaseUrl(): string;
  /**
   * @return the name of the bucket
   */
  getBucketName(): string;
  /**
   * @param filePath the path to the file to upload
   * @param destination the full path + file name you want for the file in the bucket
   */
  uploadFile(filePath: string, destination?: string): Promise<BucketProviderResponse>;
  /**
   * @param remoteFilename the path to file in the bucket, relative from the bucketName
   * @param downloadedFilePath the path that the file should be downloaded to
   */
  downloadFile(remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse>;
  /**
   * @param remoteFilename the name fo the file to delete
   */
  deleteFile(remoteFilename: string): Promise<BucketProviderResponse>;
  /**
   * @param options options for how to list the files
   */
  listFiles(options: BucketProviderListFileOptions): Promise<BucketProviderListResponse>;
}

export interface BucketProviderExt extends BucketProvider { 
  /**
  * Upload all the constents of a folder, recursively to a bucket
  * @param folderPath path to the folder to upload
  * @param destination path to upload the contents of the folder to.
  * If not provided, the bucket root is used.
  */
  uploadFolder(folderPath:string, destination?: string): Promise<BucketProviderResponse>;
}