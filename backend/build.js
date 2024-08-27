const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/lambda.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/lambda.js',
  external: ['aws-sdk'], // AWS SDK is already available in the Lambda environment
}).catch(() => process.exit(1));
