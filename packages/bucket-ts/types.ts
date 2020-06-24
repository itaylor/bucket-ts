
export type BucketProviderResponse = {
  ok: boolean,
  message?: string,
}
export type BucketProviderListResponse = {
  ok: boolean,
  message?: string,
  filePaths: Array<string>,
}

export interface BucketProviderCtor {
  new (bucketName:string, options: any): BucketProvider;
  getOptionsSchema(): object;
}

export interface BucketProviderListFileOptions {
  maxReturn?: number,
  prefix?: string,
}

export interface BucketProvider {
  getBaseUrl(): string;
  getBucketName(): string;
  uploadFile(filePath: string, destination?: string): Promise<BucketProviderResponse>;
  downloadFile(remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse>;
  deleteFile(remoteFilename: string): Promise<BucketProviderResponse>;
  listFiles(options: BucketProviderListFileOptions): Promise<BucketProviderListResponse>;
}