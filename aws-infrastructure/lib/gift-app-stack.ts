import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as bedrock from 'aws-cdk-lib/aws-bedrock'
import { Construct } from 'constructs'

export class GiftAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // VPC作成
    const vpc = new ec2.Vpc(this, 'GiftAppVPC', {
      maxAzs: 2,
      natGateways: 1,
    })

    // Cognito User Pool作成
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
        name: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Cognito User Pool Client作成
    const userPoolClient = new cognito.UserPoolClient(this, 'GiftAppUserPoolClient', {
      userPool,
      userPoolClientName: 'gift-app-client',
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
        callbackUrls: ['http://localhost:3000/callback', 'https://gift-app.com/callback'],
      },
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

    // Aurora PostgreSQL クラスター作成
    const dbCluster = new rds.DatabaseCluster(this, 'GiftAppDatabase', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      instanceProps: ec2.InstanceProps.of(
        ec2.InstanceClass.T3_MICRO,
        ec2.InstanceSize.MICRO,
      ),
      instances: 1,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      storageEncrypted: true,
      backup: {
        retention: cdk.Duration.days(7),
        preferredWindow: '03:00-04:00',
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Lambda関数用のIAMロール作成
    const lambdaRole = new iam.Role(this, 'GiftAppLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
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

    // Lambda関数作成
    const giftRecommendationFunction = new lambda.Function(this, 'GiftRecommendationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/gift-recommendation'),
      role: lambdaRole,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      environment: {
        DB_SECRET_ARN: dbCluster.secret?.secretArn || '',
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
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      environment: {
        DB_SECRET_ARN: dbCluster.secret?.secretArn || '',
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
        DB_SECRET_ARN: dbCluster.secret?.secretArn || '',
        LINE_CHANNEL_SECRET: 'your-line-channel-secret',
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
        origin: new origins.S3Origin(uploadBucket),
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

    // 出力値
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    })

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    })

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    })

    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution URL',
    })

    new cdk.CfnOutput(this, 'UploadBucketName', {
      value: uploadBucket.bucketName,
      description: 'S3 Upload Bucket Name',
    })
  }
} 