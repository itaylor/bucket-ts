import 'mocha-ui-jest';
import getBucketProvider from 'bucket-ts';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import fs from 'fs';
import { homedir } from 'os';
import 'bucket-ts';
import 'bucket-ts-folder';
import 'bucket-ts-gcs';

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
    const bp = getBucketProvider('gcs', { keyFilename: `${homedir()}/snapdiff-gcs.json` });
    await bp.uploadFile(bucketName, `tsconfig.json`, 'foo/bar/tsconfig.json');
    let files = await bp.listFiles(bucketName, { prefix: 'foo/bar/' });
    expect(files.filePaths.length).toBe(1);
    await bp.downloadFile('mkto-snapdiff-test', 'foo/bar/tsconfig.json', 'junk/tsconfig.json');
    expect(fs.existsSync('junk/tsconfig.json')).toBe(true);
    await bp.deleteFile('mkto-snapdiff-test', 'foo/bar/tsconfig.json');
    files = await bp.listFiles(bucketName, { prefix: 'foo/bar/' } );
    expect(files.filePaths.length).toBe(0);
  });

  test('bucket upload to folder with filesystem', async () => {
    const bucketName ='mkto-snapdiff-test';
    const bp = getBucketProvider('folder', { folderPath: 'junk' });
    await bp.uploadFile(bucketName, `tsconfig.json`, 'foo/bar/tsconfig.json');
    let files = await bp.listFiles(bucketName, { prefix: 'foo/bar/' });
    expect(files.filePaths.length).toBe(1);
    await bp.downloadFile(bucketName, 'foo/bar/tsconfig.json', 'junk/tsconfig.json');
    expect(fs.existsSync('junk/tsconfig.json')).toBe(true);
    await bp.deleteFile(bucketName, 'foo/bar/tsconfig.json');
    files = await bp.listFiles(bucketName, { prefix: 'foo/bar/' } );
    expect(files.filePaths.length).toBe(0);
  });
})


