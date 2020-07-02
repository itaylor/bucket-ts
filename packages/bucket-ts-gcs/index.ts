import { Storage, File, Bucket} from '@google-cloud/storage';
import { BucketProvider, BucketProviderOptions, BucketProviderResponse, registerBucketProvider, BucketProviderListFileOptions, BucketProviderListResponse } from 'bucket-ts';
import { basename } from 'path';
import optionsSchema from './optionsSchema.json';
import { GCSBucketOptions } from './types';

export * from './types';

/**
 * A bucket provider for Google Cloud Storage (GCS)
 */
export class GCSBucketProvider implements BucketProvider {
  private storage: Storage;
  private bucket: Bucket;

  constructor (options: GCSBucketOptions) {
    const { bucketName, ...rest } = options;
    this.storage = new Storage(rest);
    this.bucket = this.storage.bucket(options.bucketName);
  }

  getBaseUrl() {
    return `https://storage.cloud.google.com/${this.bucket.name}`;
  }
  
  getBucketName() {
    return this.bucket.name;
  }

  async uploadFile(filePath: string, destination?: string): Promise<BucketProviderResponse> {
    destination = destination || basename(filePath);
    await this.bucket.upload(filePath, { destination });
    return {
      message: `File "${filePath}" was uploaded successfully to bucket "${this.bucket.name}"`,
    }
  }

  async downloadFile(remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse> {
    let file = this.bucket.file(remoteFilename);
    await file.download({ destination: downloadedFilePath });
    return {
      message: `File "${remoteFilename}" was downloaded successfully from bucket "${this.bucket.name}"`,
    }
  };

  async listFiles(options: BucketProviderListFileOptions): Promise<BucketProviderListResponse> {
    const paginator = options.paginator || { maxReturn: 1000 }; 
    const getFilesResponse = await this.bucket.getFiles({
      prefix: options.prefix,
      maxResults: paginator.maxReturn,
      pageToken: paginator.pageOffsetId,
    });
    const [ results, extra ] = getFilesResponse;
    // @ts-ignore
    const pageOffsetId = extra?.pageToken;
    return {
      complete: !pageOffsetId,
      results: results.map((f: File) => f.name),
      paginator: {
        maxReturn: paginator.maxReturn,
        pageOffsetId,
      }
    };
  }

  async deleteFile(remoteFilename: string ): Promise<BucketProviderResponse> {
    const file = this.bucket.file(remoteFilename);
    await file.delete();
    return {
      message: `File "${remoteFilename}" was deleted successfully from bucket "${this.bucket.name}"`,
    }
  }

  static getOptionsSchema(): any {
    return optionsSchema;
  }

  getNativeClient(): Bucket {
    return this.bucket;
  }
};

// @ts-ignore
registerBucketProvider('gcs', GCSBucketProvider);
