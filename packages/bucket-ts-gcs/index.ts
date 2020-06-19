import { Storage, File } from '@google-cloud/storage';
import { BucketProvider, BucketProviderResponse, registerBucketProvider, BucketProviderListFileOptions, BucketProviderListResponse } from 'bucket-ts';
import { resolve, basename } from 'path';
import { GCSBucketOptions } from './types';
import optionsSchema from './optionsSchema.json';

export * from './types';

export class GCSBucketProvider implements BucketProvider {
  private storage: Storage;
  private baseUrl: string;
  constructor (options: any) {
    const { folderName, keyFilename } = <GCSBucketOptions> options;
    const resolvedKeyFilename = resolve(keyFilename);
    this.storage = new Storage({
      keyFilename: resolvedKeyFilename
    });
    this.baseUrl = `https://storage.cloud.google.com/${folderName || ''}`;
  }

  getBaseUrl () {
    return this.baseUrl;
  }

  async uploadFile(bucketName: string, filePath: string, destination?: string): Promise<BucketProviderResponse> {
    let bucket = this.storage.bucket(bucketName);
    destination = destination || basename(filePath);
    await bucket.upload(filePath, { destination });
    return {
      ok: true,
      message: `File "${filePath}" was uploaded successfully to bucket "${bucketName}"`,
    }
  }

  async downloadFile(bucketName:string, remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse> {
    let bucket = this.storage.bucket(bucketName);
    let file = bucket.file(remoteFilename);
    await file.download({ destination: downloadedFilePath });
    return {
      ok: true,
      message: `File "${remoteFilename}" was downloaded successfully from bucket "${bucketName}"`,
    }
  };

  async listFiles(bucketName: string, options: BucketProviderListFileOptions): Promise<BucketProviderListResponse> {
    let bucket = this.storage.bucket(bucketName);
    const [ results ] = await bucket.getFiles({
      prefix: options.prefix,
    });
    return {
      ok: true,
      filePaths: results.map((f: File) => f.name),
    };
  }

  async deleteFile(bucketName: string, remoteFilename: string ): Promise<BucketProviderResponse> {
    let bucket = this.storage.bucket(bucketName);
    const file = bucket.file(remoteFilename);
    await file.delete();
    return {
      ok: true,
      message: `File "${remoteFilename}" was deleted successfully from bucket "${bucketName}"`,
    }
  }

  static getOptionsSchema(): any {
    return optionsSchema;
  }
};

registerBucketProvider('gcs', GCSBucketProvider);
