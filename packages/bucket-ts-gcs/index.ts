import { Storage, File, Bucket} from '@google-cloud/storage';
import { BucketProvider, BucketProviderResponse, registerBucketProvider, BucketProviderListFileOptions, BucketProviderListResponse } from 'bucket-ts';
import { resolve, basename } from 'path';
import { GCSBucketOptions } from './types';
import optionsSchema from './optionsSchema.json';

export * from './types';

export class GCSBucketProvider implements BucketProvider {
  private storage: Storage;
  private bucket: Bucket;

  constructor (bucketName: string, options: any) {
    const { keyFilename } = <GCSBucketOptions> options;
    const resolvedKeyFilename = resolve(keyFilename);
    this.storage = new Storage({
      keyFilename: resolvedKeyFilename
    });
    this.bucket = this.storage.bucket(bucketName);
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
      ok: true,
      message: `File "${filePath}" was uploaded successfully to bucket "${this.bucket.name}"`,
    }
  }

  async downloadFile(remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse> {
    let file = this.bucket.file(remoteFilename);
    await file.download({ destination: downloadedFilePath });
    return {
      ok: true,
      message: `File "${remoteFilename}" was downloaded successfully from bucket "${this.bucket.name}"`,
    }
  };

  async listFiles(options: BucketProviderListFileOptions): Promise<BucketProviderListResponse> {
    const [ results ] = await this.bucket.getFiles({
      prefix: options.prefix,
    });
    return {
      ok: true,
      filePaths: results.map((f: File) => f.name),
    };
  }

  async deleteFile(remoteFilename: string ): Promise<BucketProviderResponse> {
    const file = this.bucket.file(remoteFilename);
    await file.delete();
    return {
      ok: true,
      message: `File "${remoteFilename}" was deleted successfully from bucket "${this.bucket.name}"`,
    }
  }

  static getOptionsSchema(): any {
    return optionsSchema;
  }
};

registerBucketProvider('gcs', GCSBucketProvider);
