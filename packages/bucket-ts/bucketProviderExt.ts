
import { BucketProvider, BucketProviderExt } from './types';
import recursive from 'recursive-readdir';
import { statSync } from 'fs';
import { relative, join } from 'path';


export default function bucketProviderExtFactory(bp: BucketProvider): BucketProviderExt {
  const ext = <BucketProviderExt> bp;
  ext.uploadFolder = async function (folderPath: string, destination?: string) {
    if (!statSync(folderPath).isDirectory()) {
      throw new Error('folderPath must be a folder');
    }
    const files = await recursive(folderPath);
    const count = files.length;
    await Promise.all(files.map((f) => {
      const relPath = relative(folderPath, f);
      const dest = destination ? join(destination, relPath) : relPath 
      return bp.uploadFile(f, dest);
    }));
    return {
      message: `Uploaded ${count} files from ${folderPath} to ${bp.getBucketName()}`,
    };
  }
  return ext;
}