#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsInfrastructureStack } from '../lib/aws-infrastructure-stack';

const app = new cdk.App();

// 環境変数からアカウントとリージョンを取得
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || 'us-east-1';

if (!account) {
  throw new Error('AWS account not configured. Please run "aws configure" first.');
}

new AwsInfrastructureStack(app, 'AwsInfrastructureStack', {
  env: { 
    account: account, 
    region: region 
  },
  description: 'GIFTS App - Health Gift Platform Infrastructure',
});