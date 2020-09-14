# Bucket-TS

* Simple, consistent, strongly-typed bucket storage client

## Goals
* Consistent interface between bucket providers, with strong Typescript support
* Simple, promise/async based API
* Modular: only installs packages for the bucket provider you're using, won't bloat your `node_modules` with every single cloud provider's SDKs.
* Local filesystem support with the same API
* Secure secret handling: supports pulling secrets from env vars without them hitting the disk
* Auto updated/released so that current versions of dependencies are always used 

## Non-goals
* Support for every esoteric feature on every cloud provider.  If you need to do something unusual or provider specific, use that cloud provider's client library instead.

## Currently supported
* Amazon S3 (use provider `s3`, `bucket-ts-s3`)
* S3 compatible (use provider `s3`, `bucket-ts-s3`, tested with [minio](https://github.com/minio/minio))
* Google Cloud Storage (use provider `gcs`, `bucket-ts-gcs`)
* Azure Blob Storage (use provider `abs`, `bucket-ts-abs`)
* Local filesystem (use provider `folder`, `bucket-ts-folder`)


## Usage:
First add the core `bucket-ts`, then add the support for the bucket store you're wanting to use.
```bash
yarn add bucket-ts
yarn add bucket-ts-gcs # or bucket-ts-folder or bucket-ts-s3 or bucket-ts-abs
```

Somewhere in your code you'll need to do the following:

```ts 
import bucketTs from 'bucket-ts'
import 'bucket-ts-gcs'

const bucketApi = bucketTs('gcs', { 
  bucketName: 'my-awesome-bucket-name' 
  keyFilename: `path/to/a/gcs/keyfile.json` 
});
await bucketApi.uploadFile('fileToUpload.txt', 'name/of/file/in/bucket.txt');

```

## API Docs
See: [https://itaylor.github.io/bucket-ts/](https://itaylor.github.io/bucket-ts/)

Github: [https://github.com/itaylor/bucket-ts](https://github.com/itaylor/bucket-ts)

