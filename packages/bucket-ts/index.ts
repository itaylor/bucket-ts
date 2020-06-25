import { BucketProviderExt, BucketProviderCtor } from './types';
export * from './types';
import Ajv, { ValidateFunction } from 'ajv';
import bucketProviderExtFactory from './bucketProviderExt';

const ajv = new Ajv();
const providers: { [key: string]: BucketProviderCtor } = {}
const schemas: { [key: string]: ValidateFunction } = {};
export function registerBucketProvider(name: string, provider: BucketProviderCtor) {
  providers[name] = provider;
  schemas[name] = ajv.compile(provider.getOptionsSchema());
}

export default function getBucketProvider(name: string, bucketName: string, options: any) : BucketProviderExt {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`No bucket-ts provider named \`${name}\` registered.  You may need to import a bucket provider eg: \`import 'bucket-ts-gcs';\``);
  }
  const validateFn = schemas[name];
  const valid = validateFn(options);
  if (!valid) {
    throw new Error(`Invalid options passed to bucket-ts provider \`${name}\`: ${validateFn.errors}`);
  }

  const bp = new provider(bucketName, options); 
  return bucketProviderExtFactory(bp);
}
