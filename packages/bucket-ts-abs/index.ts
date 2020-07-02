import { BlobServiceClient, ContainerClient, BlobItem } from '@azure/storage-blob';
import { BucketProvider, BucketProviderResponse, BucketProviderPaginator, registerBucketProvider, BucketProviderListFileOptions, BucketProviderListResponse } from 'bucket-ts';
import { basename, resolve } from 'path';
import { ABSBucketOptions } from './types';
import optionsSchema from './optionsSchema.json';

export * from './types';

/** 
 * A bucket provider for Azure Blob Store
 */
export class ABSBucketProvider implements BucketProvider {
  private abs: BlobServiceClient;
  private containerClient: ContainerClient;
  private bucketName: string;
  constructor (options: ABSBucketOptions) {
    this.abs = BlobServiceClient.fromConnectionString(options.connectionString);
    this.containerClient = this.abs.getContainerClient(options.bucketName);
    this.bucketName = options.bucketName;
  }

  getBaseUrl() {
    return this.containerClient.url;
  }

  getBucketName() {
    return this.bucketName;
  }

  async uploadFile(filePath: string, destination?: string): Promise<BucketProviderResponse> {
    const dest = destination || basename(filePath);
    const blobClient = this.containerClient.getBlockBlobClient(dest);

    await blobClient.uploadFile(resolve(filePath));
    return {
      message: `File "${filePath}" was uploaded successfully to bucket "${this.bucketName}"`,
    };
  }

  async downloadFile(remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse> {
    await this.containerClient.getBlockBlobClient(remoteFilename).downloadToFile(downloadedFilePath);
    return {
      message: `File "${remoteFilename}" was downloaded successfully from bucket "${this.bucketName}"`,
    }
  };

  async listFiles(options: BucketProviderListFileOptions): Promise<BucketProviderListResponse> {
    const paginator: BucketProviderPaginator = options.paginator || { maxReturn: 1000 };

    const iterator = this.containerClient.listBlobsFlat({
      prefix: options.prefix,
    }).byPage({
      maxPageSize: paginator.maxReturn,
      continuationToken: paginator.pageOffsetId,
    });
    
    let response = (await iterator.next()).value;
    const fileNames = (<BlobItem[]> response.segment.blobItems).map((b: BlobItem) => b.name);
  
    return {
      complete: !response.continuationToken,
      results: fileNames,
      paginator: {
        maxReturn: paginator.maxReturn,
        pageOffsetId: response.continuationToken || undefined, // azure client returns an empty string continuation token when you're at the last page      
      }
    };
  }

  async deleteFile(remoteFilename: string ): Promise<BucketProviderResponse> {
    await this.containerClient.getBlockBlobClient(remoteFilename).delete();

    return {
      message: `File "${remoteFilename}" was deleted successfully from bucket "${this.bucketName}"`,
    }
  }

  static getOptionsSchema(): any {
    return optionsSchema;
  }

  getNativeClient(): ContainerClient {
    return this.containerClient;
  }
};

// @ts-ignore
registerBucketProvider('abs', ABSBucketProvider);