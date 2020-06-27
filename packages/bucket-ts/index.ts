import { BucketProviderExt, BucketProviderCtor, BucketProviderOptions } from './types';
export * from './types';
import Ajv, { ValidateFunction } from 'ajv';
import bucketProviderExtFactory from './bucketProviderExt';
import envReplace from './envReplace';

const ajv = new Ajv();
const providers: { [key: string]: BucketProviderCtor } = {}
const schemas: { [key: string]: ValidateFunction } = {};
/**
 * Registers a [[BucketProvider]] constructor that can be used later with [[getBucketProvider]]
 * @param name the name of the bucket provider
 * @param provider A constructor for a new instance of BucketProvider
 */
export function registerBucketProvider(name: string, provider: BucketProviderCtor) {
  providers[name] = provider;
  schemas[name] = ajv.compile(provider.getOptionsSchema());
}

/**
 * @param name the name of the [[BucketProvider]] instance to fetch
 * @param options the options for the BucketProvider.  This will be validated against its JSON Schema at runtime.
 * Also, the options will be processed for environment variable substitution.
 * Example: 
 * ```
 * getBucketProvider('s3', { 
 *   accessSecretId: 'mySecretId',
 *   secretAccessKey: '${{ MY_SECRET_KEY }}',
 * });
 * ```
 * would place the value of `process.env.MY_SECRET_KEY` into the `secretAccessKey` value.
 * *Note:* options must be serializable to JSON.
 * @return a new [[BucketProviderExt]] instance for the provider
 */
export default function getBucketProvider(name: string, options: BucketProviderOptions) : BucketProviderExt {
  options = envReplace(options);
  const provider = providers[name];
  if (!provider) {
    throw new Error(`No bucket-ts provider named \`${name}\` registered.  You may need to import a bucket provider eg: \`import 'bucket-ts-gcs';\``);
  }
  const validateFn = schemas[name];
  const valid = validateFn(options);
  if (!valid) {
    throw new Error(`Invalid options passed to bucket-ts provider \`${name}\`: ${validateFn.errors}`);
  }

  const bp = new provider(options); 
  return bucketProviderExtFactory(bp);
}
