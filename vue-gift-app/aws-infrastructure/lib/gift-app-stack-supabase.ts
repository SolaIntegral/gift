import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as bedrock from 'aws-cdk-lib/aws-bedrock'
import { Construct } from 'constructs'

export class GiftAppStackSupabase extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // S3バケット作成（静的ファイルホスティング用）
    const websiteBucket = new s3.Bucket(this, 'GiftAppWebsiteBucket', {
      bucketName: 'gift-app-website',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    })

    // S3バケット作成（ファイルアップロード用）
    const uploadBucket = new s3.Bucket(this, 'GiftAppUploadBucket', {
      bucketName: 'gift-app-uploads',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    })

    // Lambda関数用のIAMロール作成
    const lambdaRole = new iam.Role(this, 'GiftAppLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    })

    // Bedrock権限を追加
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream',
        ],
        resources: ['*'],
      })
    )

    // S3権限を追加
    uploadBucket.grantReadWrite(lambdaRole)

    // Lambda関数作成（Supabase使用版）
    const giftRecommendationFunction = new lambda.Function(this, 'GiftRecommendationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/gift-recommendation'),
      role: lambdaRole,
      environment: {
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
        UPLOAD_BUCKET: uploadBucket.bucketName,
        BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    })

    const orderManagementFunction = new lambda.Function(this, 'OrderManagementFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/order-management'),
      role: lambdaRole,
      environment: {
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    })

    const lineWebhookFunction = new lambda.Function(this, 'LineWebhookFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/line-webhook'),
      role: lambdaRole,
      environment: {
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
        LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET || '',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    })

    // API Gateway作成
    const api = new apigateway.RestApi(this, 'GiftAppAPI', {
      restApiName: 'Gift App API',
      description: 'Gift App REST API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    })

    // API Gatewayリソースとメソッド作成
    const gifts = api.root.addResource('gifts')
    const giftRecommendation = gifts.addResource('recommendation')
    giftRecommendation.addMethod('POST', new apigateway.LambdaIntegration(giftRecommendationFunction))

    const orders = api.root.addResource('orders')
    orders.addMethod('GET', new apigateway.LambdaIntegration(orderManagementFunction))
    orders.addMethod('POST', new apigateway.LambdaIntegration(orderManagementFunction))

    const order = orders.addResource('{id}')
    order.addMethod('GET', new apigateway.LambdaIntegration(orderManagementFunction))
    order.addMethod('PUT', new apigateway.LambdaIntegration(orderManagementFunction))

    const line = api.root.addResource('line')
    const webhook = line.addResource('webhook')
    webhook.addMethod('POST', new apigateway.LambdaIntegration(lineWebhookFunction))

    // CloudFront Distribution作成（フロントエンド用）
    const distribution = new cloudfront.Distribution(this, 'GiftAppDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(`${api.restApiId}.execute-api.${this.region}.amazonaws.com`),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
    })

    // S3バケットポリシー（CloudFrontからのアクセスのみ許可）
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': distribution.distributionArn,
          },
        },
      })
    )

    // 出力値
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    })

    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL',
    })

    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 Website Bucket Name',
    })

    new cdk.CfnOutput(this, 'UploadBucketName', {
      value: uploadBucket.bucketName,
      description: 'S3 Upload Bucket Name',
    })
  }
} 