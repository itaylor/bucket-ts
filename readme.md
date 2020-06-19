# Bucket-TS

A strongly typed abstraction over several 'bucket' type object stores like AWS and GCS.

## Goals
* Consistent interface between bucket providers, with strong Typescript support
* Simple, promise/async based API
* Modular: only installs packages for the bucket provider you're using, won't bloat your `node_modules` with every single cloud provider's SDKs.
* Local filesystem support with the same APIs.

## Non-goals
* Support for every esoteric feature on every cloud provider.


# Usage:
First add the core `bucket-ts`, then add the support for the bucket store you're wanting to use.
```bash
yarn add bucket-ts
yarn add bucket-ts-gcs # or bucket-ts-folder or bucket-ts-s3
```

Somewhere in your code you'll need to do the following:

```ts 
import bucketTs from 'bucket-ts'
import 'bucket-ts-gcs'

const bucketApi = bucketTs('gcs', { keyFilename: `path/to/a/gcs/keyfile.json` });
await bucketApi.uploadFile('nameOfMyBucket', 'fileToUpload.txt', 'name/of/file/in/bucket.txt');

```





