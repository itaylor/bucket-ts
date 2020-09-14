import { BucketProvider, BucketProviderResponse, BucketProviderPaginator, BucketProviderListFileOptions, BucketProviderListResponse, registerBucketProvider } from 'bucket-ts';
import { resolve, join, dirname, basename, relative } from 'path';
import { Stream } from 'stream';
import { WriteStream, createWriteStream, createReadStream, unlink, Stats, statSync } from 'fs';
import mkdirp from 'mkdirp';
import { FolderBucketOptions } from './types';
import optionsSchema from './optionsSchema.json';
export * from './types';
import { promisify } from 'util';
import recursive from 'recursive-readdir';

const unlinkAsync = promisify(unlink);

/**
 * A bucket provider that uses the local filesystem instead of a "real" object store.
 * 
 * This is incredibly useful for testing/mocking scenarios, as you can mimic the behavior of calls that would normally be remote, locally, without installing any additional software.
 */
export class FolderBucketProvider implements BucketProvider {
  private rootFolder: string;
  private bucketName: string;
  constructor (options: FolderBucketOptions) {
    this.rootFolder = resolve(options.bucketName);
    if (options.createMissingFolders) {
      mkdirp.sync(this.rootFolder);
    }
    if (!statSync(this.rootFolder).isDirectory()) {
      throw new Error(`bucketName '${options.bucketName}' must be a folder`);
    }
    this.bucketName = basename(options.bucketName);
  }

  getBaseUrl() {
    return this.rootFolder
  }

  getBucketName() {
    return this.bucketName;
  }

  async uploadFile(filePath: string, destination?: string): Promise<BucketProviderResponse> {
    if (!this.bucketName || !filePath) {
      throw new Error('Invalid parameters');
    }
    let filename = destination || basename(filePath);
    if (destination && destination.includes('/')) {
      mkdirp.sync(join(this.rootFolder, dirname(destination)));
    }
    let source = createReadStream(filePath);
    let dest = createWriteStream(
      join(this.rootFolder, filename)
    );

    await readStreamToEnd(source, dest);
    return {
      message: `File "${filePath}" was uploaded successfully to bucket "${this.bucketName}"`,
    }
  }

  async downloadFile(remoteFilename: string, downloadedFilePath: string): Promise<BucketProviderResponse> {
    if (!this.bucketName || !remoteFilename || !downloadedFilePath) {
      throw new Error('Invalid parameters');
    }
    let source = createReadStream(
      join(this.rootFolder, remoteFilename)
    );
    let dest = createWriteStream(downloadedFilePath);
    await readStreamToEnd(source, dest);
    return {
      message: `File "${remoteFilename}" was downloaded successfully from bucket "${this.bucketName}"`,
    }
  };

  async listFiles(options: BucketProviderListFileOptions = {}): Promise<BucketProviderListResponse> {
    const path = this.rootFolder;
    let files: Array<string>;
    const paginator: BucketProviderPaginator = options.paginator || { maxReturn: 1000, pageOffsetId: '0' };
    const { prefix } = options;
    const { maxReturn } = paginator;
    const offset = paginator.pageOffsetId ? parseInt(paginator.pageOffsetId) : 0;
    if (prefix) {
      const ignoreFunc = (file: string, stats: Stats) => {
        if (stats.isDirectory()) {
          return false;
        }
        const relFile = relative(path, file);
        return !relFile.startsWith(prefix);
      };
      // todo: eliminate `recursive` dependency.  
      // Stop fetching recursively when we hit maxReturn.
      files = await recursive(path, [ignoreFunc]);
    } else {
      files = await recursive(path);
    }
    // recursive-readdir evidently doesn't sort things in a stable order?  More reason to replace it.
    let filePaths = files.map<string>((f) => relative(path, f)).sort();
    const endIndex = maxReturn + offset;
    const hasMore = endIndex < files.length;
    if (files.length > maxReturn) {
      filePaths = filePaths.slice(offset, maxReturn + offset);
    }
    return {
      complete: !hasMore,
      results: filePaths,
      paginator: {
        maxReturn,
        pageOffsetId: hasMore ? `${endIndex}` : undefined,
      }
    }
  }

  async deleteFile(filename: string): Promise<BucketProviderResponse> {
    const path = join(this.rootFolder, filename);
    await unlinkAsync(path);
    return {
      message: `File "${filename}" was deleted successfully from bucket "${this.bucketName}"`
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
