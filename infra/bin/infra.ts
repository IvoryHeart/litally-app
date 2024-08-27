import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID;
const region = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION;

if (!account || !region) {
  throw new Error('Please set CDK_DEFAULT_ACCOUNT/AWS_ACCOUNT_ID and CDK_DEFAULT_REGION/AWS_REGION environment variables');
}

new InfraStack(app, 'LitallyInfraStack', {
  env: { account, region }
});