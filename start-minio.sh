#!/usr/bin/env bash
set -e
mkdir -p minio/bucket-ts-test-bucket
docker run --rm -d -p 9000:9000 \
  -e "MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY_ID}" \
  -e "MINIO_SECRET_KEY=${MINIO_SECRET_ACCESS_KEY}" \
  -v "$(pwd)/minio:/data" minio/minio server /data