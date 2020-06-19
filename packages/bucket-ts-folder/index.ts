import { BucketProvider, BucketProviderResponse, BucketProviderListFileOptions, BucketProviderListResponse, registerBucketProvider } from 'bucket-ts';
import { resolve, join, dirname, basename, relative } from 'path';
import { Stream } from 'stream';
import { WriteStream, createWriteStream, createReadStream, unlink, Stats } from 'fs';
import mkdirp from 'mkdirp';
import { FolderBucketOptions } from './types';
import optionsSchema from './optionsSchema.json';
export * from './types';
import { promisify } from 'util';
import recursive from 'recursive-readdir';

const unlinkAsync = promisify(unlink);

export class FolderBucketProvider implements BucketProvider {
  private rootFolder: string;
  constructor (options: any) {
    this.rootFolder = resolve((<FolderBucketOptions> options).folderPath);
  }

  getBaseUrl() {
    return this.rootFolder;
  }

  async uploadFile(bucketName: string, filePath: string, destination?: string): Promise<BucketProviderResponse> {
    if (!bucketName || !filePath) {
      throw new Error('Invalid parameters');
    }
    let filename = destination || basename(filePath);
    if (destination && destination.includes('/')) {
      mkdirp.sync(join(this.rootFolder, bucketName, dirname(destination)));
    }
    let source = createReadStream(filePath);
    let dest = createWriteStream(
      join(this.rootFolder, bucketName, filename)
    );

    const ok = await readStreamToEnd(source, dest);
    return {
      ok,
      message: `File "${filePath}" was uploaded successfully to bucket "${bucketName}"`,
    }
  }

  async downloadFile(bucketName:string, remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse> {
    if (!bucketName || !remoteFilename || !downloadedFilePath) {
      throw new Error('Invalid parameters');
    }
    let source = createReadStream(
      join(this.rootFolder, bucketName, remoteFilename)
    );
    let dest = createWriteStream(downloadedFilePath);
    const ok = await readStreamToEnd(source, dest);
    return {
      ok,
      message: `File "${remoteFilename}" was downloaded successfully from bucket "${bucketName}"`,
    }
  };

  async listFiles(bucketName: string, options: BucketProviderListFileOptions = {}): Promise<BucketProviderListResponse> {
    const path = join(this.rootFolder, bucketName);
    let files: Array<string>;
    const { prefix, maxReturn } = options;
    if (prefix) {
      const ignoreFunc = (file: string, stats: Stats) => {
        if (stats.isDirectory()) {
          return false;
        }
        const relFile = relative(path, file);
        return !relFile.startsWith(prefix);
      };
      files = await recursive(path, [ignoreFunc]);
    } else {
      files = await recursive(path);
    }

    if (maxReturn && files.length > maxReturn) {
      files = files.slice(0, maxReturn);
    }
    const filePaths = files.map<string>((f) => relative(path, f));
    return {
      ok: true,
      filePaths,
    }
  }

  async deleteFile(bucketName: string, filename: string): Promise<BucketProviderResponse> {
    const path = join(this.rootFolder, bucketName, filename);
    await unlinkAsync(path);
    return {
      ok: true,
      message: `File "${filename}" was deleted successfully from bucket "${bucketName}"`
    };
  }

  static getOptionsSchema(): any {
    return optionsSchema;
  }
};

registerBucketProvider('folder', FolderBucketProvider);

function readStreamToEnd(source:Stream, dest:WriteStream): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    source.on('end', () => resolve(true));
    source.on('error', reject);
    source.pipe(dest);
  })
}
