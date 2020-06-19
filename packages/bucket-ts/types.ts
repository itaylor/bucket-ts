
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
  new (options: any): BucketProvider;
  getOptionsSchema(): object;
}

export interface BucketProviderListFileOptions {
  maxReturn?: number,
  prefix?: string,
}

export interface BucketProvider {
  getBaseUrl(): string;
  uploadFile(bucketName: string, filePath: string, destination?: string): Promise<BucketProviderResponse>;
  downloadFile(bucketName: string, remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse>;
  deleteFile(bucketName: string, remoteFilename: string ): Promise<BucketProviderResponse>;
  listFiles(bucketName: string, options: BucketProviderListFileOptions): Promise<BucketProviderListResponse>;
}