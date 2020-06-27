export default function replaceEnvs<T extends object>(obj: T) {
  const str = JSON.stringify(obj);
  const replaced = str.replace(/\${{\s?(.*?)\s?}}/gi, (match: string, envVar: string) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable '${ match }'`);
    }
    return process.env[envVar] || '';
  });
  return <T>JSON.parse(replaced);
}