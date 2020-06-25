import { S3 } from 'aws-sdk';
import { BucketProvider, BucketProviderResponse, BucketProviderPaginator, registerBucketProvider, BucketProviderListFileOptions, BucketProviderListResponse } from 'bucket-ts';
import { basename } from 'path';
import { createReadStream, statSync, createWriteStream } from 'fs';
import { S3BucketOptions } from './types';
import optionsSchema from './optionsSchema.json';
import stream from 'stream';

export * from './types';

export class S3BucketProvider implements BucketProvider {
  private s3: S3;
  private region?: string;
  private endpoint?: string;
  private bucketName: string;
  constructor (bucketName: string, options: any) {
    const { accessKeyId, secretAccessKey } = <S3BucketOptions> options;
    this.endpoint = options.endpoint;
    this.region = options.region;
    this.s3 = new S3({
      accessKeyId, 
      secretAccessKey, 
      region: options.region,
      endpoint: this.endpoint,
      s3ForcePathStyle: !!this.endpoint,
    });
    this.bucketName = bucketName;
  }

  getBaseUrl() {
    if (this.region) {
      return `https://${this.bucketName}.s3-${this.region}.amazonaws.com/`;
    }
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucketName}/`;
    }
    return `https://${this.bucketName}.s3.amazonaws.com/`;
  }

  getBucketName() {
    return this.bucketName;
  }

  async uploadFile(filePath: string, destination?: string): Promise<BucketProviderResponse> {
    let fileSize = statSync(filePath);
    let preferredPartSize = (fileSize.size > 50000 ? 10 : 5) * 1024 * 1024;
    let options = {
      partSize: preferredPartSize,
      queueSize: 10
    };
    const result = await this.s3.upload({
      Bucket: this.bucketName,
      Key: destination || basename(filePath),
      Body: createReadStream(filePath),
    }, options).promise();
    return {
      message: `File "${result.Key}" was uploaded successfully to bucket "${result.Bucket}"`,
    };
  }

  async downloadFile(remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse> {
    const src = this.s3.getObject({
      Bucket: this.bucketName,
      Key: remoteFilename,
    }).createReadStream();
    const dest = createWriteStream(downloadedFilePath);
    await readStreamToEnd(src, dest);
    return {
      message: `File "${remoteFilename}" was downloaded successfully from bucket "${this.bucketName}"`,
    }
  };

  async listFiles(options: BucketProviderListFileOptions): Promise<BucketProviderListResponse> {
    const paginator: BucketProviderPaginator = options.paginator || { maxReturn: 1000 };
    const results = await this.s3.listObjectsV2({
      Bucket: this.bucketName,
      Prefix: options.prefix,
      MaxKeys: paginator.maxReturn,
      ContinuationToken: paginator.pageOffsetId,
    }).promise();
    results.NextContinuationToken
    
    return {
      complete: !results.NextContinuationToken,
      results: results?.Contents?.map(obj => obj.Key || '') || [],
      paginator: {
        maxReturn: paginator.maxReturn,
        pageOffsetId: results.NextContinuationToken,       
      }
    };
  }

  async deleteFile(remoteFilename: string ): Promise<BucketProviderResponse> {
    const result = await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: remoteFilename,
    }).promise();

    return {
      message: `File "${remoteFilename}" was deleted successfully from bucket "${this.bucketName}"`,
    }
  }

  static getOptionsSchema(): any {
    return optionsSchema;
  }
};

registerBucketProvider('s3', S3BucketProvider);

function readStreamToEnd(src: stream.Readable, dest: stream.Writable) {
  src.pipe(dest);
  return new Promise((res, rej) => {
    src.on('finish', res);
    src.on('error', rej);
    dest.on('error', rej);
    dest.on('finish', res);
  });
}