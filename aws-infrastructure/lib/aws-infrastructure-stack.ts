import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

export class AwsInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC作成
    const vpc = new ec2.Vpc(this, 'GiftAppVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // RDS MySQL インスタンス（MySQL 8.0対応）
    const dbInstance = new rds.DatabaseInstance(this, 'GiftAppDatabase', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_42,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      databaseName: 'giftapp',
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      backupRetention: cdk.Duration.days(7),
      storageEncrypted: true, // MySQL 8.0では暗号化をサポート
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda関数用のセキュリティグループ
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc,
      description: 'Security group for Lambda functions',
      allowAllOutbound: true,
    });

    // RDSのセキュリティグループにLambdaからのアクセスを許可
    dbInstance.connections.allowFrom(lambdaSecurityGroup, ec2.Port.tcp(3306), 'Allow Lambda to access RDS');

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'GiftAppUserPool', {
      userPoolName: 'gift-app-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        name: new cognito.StringAttribute({
          mutable: true,
        }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'GiftAppUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls: ['http://localhost:3000/callback', 'https://your-domain.com/callback'],
      },
    });

    // Lambda関数用のIAMロール
    const lambdaRole = new iam.Role(this, 'GiftAppLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    });

    // Bedrock権限を追加
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: ['*'],
    }));

    // ギフト推薦Lambda関数
    const giftRecommendationFunction = new lambda.Function(this, 'GiftRecommendationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/gift-recommendation')),
      role: lambdaRole,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_HOST: dbInstance.instanceEndpoint.hostname,
        DB_PORT: dbInstance.instanceEndpoint.port.toString(),
        DB_NAME: 'giftapp',
        DB_USER: 'admin',
        DB_PASSWORD: dbInstance.secret!.secretValueFromJson('password').unsafeUnwrap(),
        DB_SSL: 'true',
        BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // LINE Webhook Lambda関数
    const lineWebhookFunction = new lambda.Function(this, 'LineWebhookFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/line-webhook')),
      role: lambdaRole,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_HOST: dbInstance.instanceEndpoint.hostname,
        DB_PORT: dbInstance.instanceEndpoint.port.toString(),
        DB_NAME: 'giftapp',
        DB_USER: 'admin',
        DB_PASSWORD: dbInstance.secret!.secretValueFromJson('password').unsafeUnwrap(),
        DB_SSL: 'true',
        BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
        LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET || '',
        LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
        FRONTEND_URL: 'https://your-domain.com',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // 注文管理Lambda関数
    const orderManagementFunction = new lambda.Function(this, 'OrderManagementFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/order-management')),
      role: lambdaRole,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_HOST: dbInstance.instanceEndpoint.hostname,
        DB_PORT: dbInstance.instanceEndpoint.port.toString(),
        DB_NAME: 'giftapp',
        DB_USER: 'admin',
        DB_PASSWORD: dbInstance.secret!.secretValueFromJson('password').unsafeUnwrap(),
        DB_SSL: 'true',
        FRONTEND_URL: 'https://your-domain.com',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // データベース初期化Lambda関数
    const databaseInitFunction = new lambda.Function(this, 'DatabaseInitFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/database-init')),
      role: lambdaRole,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_HOST: dbInstance.instanceEndpoint.hostname,
        DB_PORT: dbInstance.instanceEndpoint.port.toString(),
        DB_NAME: 'giftapp',
        DB_USER: 'admin',
        DB_PASSWORD: dbInstance.secret!.secretValueFromJson('password').unsafeUnwrap(),
        DB_SSL: 'true',
      },
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // ギフト詳細取得Lambda関数
    const giftDetailFunction = new lambda.Function(this, 'GiftDetailFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/gift-detail/lambda-package.zip')),
      role: lambdaRole,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_HOST: dbInstance.instanceEndpoint.hostname,
        DB_PORT: dbInstance.instanceEndpoint.port.toString(),
        DB_NAME: 'giftapp',
        DB_USER: 'admin',
        DB_PASSWORD: dbInstance.secret!.secretValueFromJson('password').unsafeUnwrap(),
        DB_SSL: 'true',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'GiftAppApi', {
      restApiName: 'Gift App API',
      description: 'Gift App API Gateway',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // ギフト推薦API
    const giftRecommendationIntegration = new apigateway.LambdaIntegration(giftRecommendationFunction);
    const giftRecommendationResource = api.root.addResource('consultation');
    giftRecommendationResource.addMethod('POST', giftRecommendationIntegration);

    // 注文管理API
    const orderManagementIntegration = new apigateway.LambdaIntegration(orderManagementFunction);
    const ordersResource = api.root.addResource('orders');
    ordersResource.addMethod('GET', orderManagementIntegration);
    ordersResource.addMethod('POST', orderManagementIntegration);
    
    const orderResource = ordersResource.addResource('{orderId}');
    orderResource.addMethod('GET', orderManagementIntegration);
    orderResource.addMethod('PUT', orderManagementIntegration);

    const paymentResource = api.root.addResource('payment');
    paymentResource.addMethod('POST', orderManagementIntegration);

    // LINE Webhook API
    const lineWebhookIntegration = new apigateway.LambdaIntegration(lineWebhookFunction);
    const lineWebhookResource = api.root.addResource('line-webhook');
    lineWebhookResource.addMethod('POST', lineWebhookIntegration);

    // データベース初期化API
    const databaseInitIntegration = new apigateway.LambdaIntegration(databaseInitFunction);
    const databaseInitResource = api.root.addResource('database-init');
    databaseInitResource.addMethod('POST', databaseInitIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    // ギフト詳細取得API
    const giftDetailIntegration = new apigateway.LambdaIntegration(giftDetailFunction);
    const giftResource = api.root.addResource('gift');
    const giftDetailResource = giftResource.addResource('{giftId}');
    giftDetailResource.addMethod('GET', giftDetailIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    // S3バケット（フロントエンド用）
    const frontendBucket = new s3.Bucket(this, 'GiftAppFrontendBucket', {
      bucketName: `gift-app-frontend-${this.account}-${this.region}`,
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
    });

    // CloudFront Distribution（S3ウェブサイトエンドポイント使用）
    const distribution = new cloudfront.Distribution(this, 'GiftAppDistribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin(`${frontendBucket.bucketName}.s3-website-${this.region}.amazonaws.com`, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // 出力値
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: dbInstance.instanceEndpoint.hostname,
      description: 'RDS Database Endpoint',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: frontendBucket.bucketName,
      description: 'S3 Bucket Name for Frontend',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });
  }
}
