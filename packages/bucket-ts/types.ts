
export type BucketProviderResponse = {
  message?: string,
}
export type BucketProviderListResponse = {
  complete: boolean,
  message?: string,
  results: Array<string>,
  paginator: BucketProviderPaginator,
}

export interface BucketProviderCtor {
  new (bucketName:string, options: any): BucketProvider;
  getOptionsSchema(): object;
}

export interface BucketProviderListFileOptions {
  paginator?: BucketProviderPaginator,
  prefix?: string,
}

export type BucketProviderPaginator = {
  maxReturn: number,
  pageOffsetId?: string,
}

export interface BucketProvider {
  getBaseUrl(): string;
  getBucketName(): string;
  uploadFile(filePath: string, destination?: string): Promise<BucketProviderResponse>;
  downloadFile(remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse>;
  deleteFile(remoteFilename: string): Promise<BucketProviderResponse>;
  listFiles(options: BucketProviderListFileOptions): Promise<BucketProviderListResponse>;
}

export interface BucketProviderExt extends BucketProvider { 
  uploadFolder(folderPath:string, destination?: string): Promise<BucketProviderResponse>;
}