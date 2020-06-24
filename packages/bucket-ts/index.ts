import { BucketProvider, BucketProviderCtor } from './types';
export * from './types';
import Ajv, { ValidateFunction } from 'ajv';

const ajv = new Ajv();
const providers: { [key: string]: BucketProviderCtor } = {}
const schemas: { [key: string]: ValidateFunction } = {};
export function registerBucketProvider(name: string, provider: BucketProviderCtor) {
  providers[name] = provider;
  schemas[name] = ajv.compile(provider.getOptionsSchema());
}

export default function getBucketProvider(name: string, bucketName: string, options: any) : BucketProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`No bucket-ts provider named \`${name}\` registered.  You may need to import a bucket provider eg: \`import 'bucket-ts-gcs';\``);
  }
  const validateFn = schemas[name];
  const valid = validateFn(options);
  if (!valid) {
    throw new Error(`Invalid options passed to bucket-ts provider \`${name}\`: ${validateFn.errors}`);
  }
  return new provider(bucketName, options); 
}