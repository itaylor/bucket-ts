import 'mocha-ui-jest';
import getBucketProvider, { BucketProviderExt, BucketProviderOptions } from 'bucket-ts';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import fs from 'fs';
import 'bucket-ts';
import 'bucket-ts-folder';
import 'bucket-ts-gcs';
import 'bucket-ts-s3';
import 'bucket-ts-abs';
import folderOptions from './config/folder-config.json';
import gcsOptions from './config/gcs-config.json';
import minioOptions from './config/minio-config.json';
import s3Options from './config/s3-config.json';
import absOptions from './config/abs-config.json';

const providers: { [key: string]: { name: string, options: BucketProviderOptions } } = {
  'abs': { name: 'abs', options: absOptions },
  folder: { name: 'folder', options: folderOptions },
  gcs: { name: 'gcs', options: gcsOptions },
  s3: { name: 's3', options: s3Options },
  minio: { name: 's3', options: minioOptions }
};

describe('bucketProviders', () => {
  Object.keys(providers).forEach(key => {
    describe(`bucketProvider ${key}`, () => {
      let bp: BucketProviderExt;
      beforeEach(async () => {
        const { name, options } = providers[key]; 
        bp = await getBucketProvider(name, options);
        rimraf.sync('junk');
        mkdirp.sync('junk');
      })
      afterEach(() => {
        rimraf.sync('junk');
      });
      test(`Basic crud on files with ${key}`, async () => {
        await uploadListDownloadListDelete(bp);
      });
      test(`Pagination on listFiles with ${key}`, async () => {
        await listFilesPagination(bp);
      });
    });
});
});

async function uploadListDownloadListDelete(bp: BucketProviderExt) {
  await bp.uploadFile(`tsconfig.json`, 'foo/bar/tsconfig.json');
  let files = await bp.listFiles({ prefix: 'foo/bar/' });
  expect(files.results.length).toBe(1);
  await bp.downloadFile('foo/bar/tsconfig.json', 'junk/tsconfig.json');
  expect(fs.existsSync('junk/tsconfig.json')).toBe(true);
  await bp.deleteFile('foo/bar/tsconfig.json');
  files = await bp.listFiles({ prefix: 'foo/bar/' });
  expect(files.results.length).toBe(0);
}

async function listFilesPagination(bp: BucketProviderExt) {
  const folderPath = 'fixtures/';
  await bp.uploadFolder(folderPath, folderPath);
  const listResults = await bp.listFiles({ prefix: folderPath, paginator: {
    maxReturn: 2,
  }});
  // console.log(listResults);
  expect(listResults.results).toEqual([`${folderPath}a.txt`, `${folderPath}b.txt`]);
  expect(listResults.complete).toBe(false);
  expect(listResults.paginator.maxReturn).toBe(2);
  expect(listResults.paginator.pageOffsetId).toBeDefined();
  const listResults2 = await bp.listFiles({ prefix: folderPath, paginator: listResults.paginator });
  // console.log(listResults2, listResults.paginator);
  expect(listResults2.results).toEqual([`${folderPath}c.txt`, `${folderPath}d.txt`]);
  expect(listResults2.complete).toBe(false);
  expect(listResults2.paginator.maxReturn).toBe(2);
  expect(listResults2.paginator.pageOffsetId).toBeDefined();
  const listResults3 = await bp.listFiles({ prefix: folderPath, paginator: listResults2.paginator });
  // console.log(listResults3, listResults2.paginator);
  expect(listResults3.results).toEqual([`${folderPath}e.txt`, `${folderPath}f.txt`]);
  expect(listResults3.complete).toBe(true);
  expect(listResults3.paginator.maxReturn).toBe(2);
  expect(listResults3.paginator.pageOffsetId).not.toBeDefined();
}
