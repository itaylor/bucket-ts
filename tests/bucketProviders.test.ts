import 'mocha-ui-jest';
import getBucketProvider, { BucketProvider } from 'bucket-ts';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import fs from 'fs';
import { homedir } from 'os';
import 'bucket-ts';
import 'bucket-ts-folder';
import 'bucket-ts-gcs';
import 'bucket-ts-s3';
import s3Config from '../../../aws.config.json';
import minioConfig from '../../../minio.config.json';

describe('bucketProviders', () => {
  beforeEach(() => {
    rimraf.sync('junk');
    mkdirp.sync('junk');
  })
  afterEach(() => {
    rimraf.sync('junk');
  });
  test('bucket upload to folder with gcs', async () => {
    const bucketName ='mkto-snapdiff-test';
    const bp = getBucketProvider('gcs', bucketName, { keyFilename: `${homedir()}/snapdiff-gcs.json` });
    await uploadListDownloadListDelete(bp);
  });

  test('bucket upload to folder with filesystem', async () => {
    const bucketName ='test-bucket';
    const bp = getBucketProvider('folder', bucketName, { folderPath: 'junk' });
    await uploadListDownloadListDelete(bp);
  });

  test('bucket upload to folder with S3', async () => {
    const bucketName = 'bucket-ts-test-bucket';
    const bp = getBucketProvider('s3', bucketName, s3Config);
    await uploadListDownloadListDelete(bp);
  });

  test('bucket upload to folder with S3 with minio endpoint', async () => {
    const bucketName = 'bucket-ts-test-bucket';
    const bp = getBucketProvider('s3', bucketName, minioConfig);
    await uploadListDownloadListDelete(bp);
  });

  async function uploadListDownloadListDelete(bp: BucketProvider) {
    await bp.uploadFile(`tsconfig.json`, 'foo/bar/tsconfig.json');
    let files = await bp.listFiles({ prefix: 'foo/bar/' });
    expect(files.filePaths.length).toBe(1);
    await bp.downloadFile('foo/bar/tsconfig.json', 'junk/tsconfig.json');
    expect(fs.existsSync('junk/tsconfig.json')).toBe(true);
    await bp.deleteFile('foo/bar/tsconfig.json');
    files = await bp.listFiles({ prefix: 'foo/bar/' });
    expect(files.filePaths.length).toBe(0);
  }
})
