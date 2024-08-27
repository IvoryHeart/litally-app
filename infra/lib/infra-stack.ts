import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'LitallyVpc', {
      maxAzs: 2
    });

    // Use existing ECR repository
    const repository = ecr.Repository.fromRepositoryName(
      this,
      'LitallyRepository',
      'litally-backend'
    );


    // Create ECS cluster
    const cluster = new ecs.Cluster(this, 'LitallyCluster', {
      vpc: vpc,
      containerInsights: true,
    });

    // Create a CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'LitallyServiceLogGroup', {
      logGroupName: '/ecs/litally-backend',
      retention: logs.RetentionDays.ONE_WEEK, 
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });
  
    // Create a secret for sensitive environment variables
    const envSecret = new secretsmanager.Secret(this, 'LitallyEnvSecret', {
      secretName: 'litally-env-secret',
      description: 'Sensitive environment variables for Litally backend'
    });

    // Create SSM Parameters for non-sensitive environment variables
    const portParam = new ssm.StringParameter(this, 'PortParameter', {
      parameterName: '/litally-backend/PORT',
      stringValue: '3000',
    });

    const nodeEnvParam = new ssm.StringParameter(this, 'NodeEnvParameter', {
      parameterName: '/litally-backend/NODE_ENV',
      stringValue: 'production',
    });

    const taskExecutionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
    assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    taskExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'));

    taskExecutionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
      ],
      resources: ['*'],
    }));
    // Grant the task execution role permissions to read the secret and parameters
    envSecret.grantRead(taskExecutionRole);
    portParam.grantRead(taskExecutionRole);
    nodeEnvParam.grantRead(taskExecutionRole);

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    const container = taskDefinition.addContainer('litally-container', {
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'litally-backend',
        logGroup: logGroup,
      }),
      environment: {
        PORT: portParam.stringValue,
        NODE_ENV: nodeEnvParam.stringValue,
      },
      secrets: {
        MONGODB_URI: ecs.Secret.fromSecretsManager(envSecret, 'MONGODB_URI'),
        JWT_SECRET: ecs.Secret.fromSecretsManager(envSecret, 'JWT_SECRET'),
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3000/healthcheck || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    container.addPortMappings({
      containerPort: 3000,
    });
    // Create Fargate service
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'LitallyService', {
      cluster: cluster,
      taskDefinition: taskDefinition,
      desiredCount: 1,
      publicLoadBalancer: true,
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });
    // Configure the target group health check
    const targetGroup = fargateService.targetGroup;
    targetGroup.configureHealthCheck({
      path: '/healthcheck',
      interval: cdk.Duration.seconds(60),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5,
      healthyHttpCodes: '200-299,304'
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'LitallyApi', {
      restApiName: 'Litally API Service'
    });

    // Create API Gateway integration
    const integration = new apigateway.HttpIntegration(`http://${fargateService.loadBalancer.loadBalancerDnsName}`);
    api.root.addMethod('ANY', integration);

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    // Output the ECR repository URI
    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: repository.repositoryUri,
      description: 'ECR Repository URI'
    });

    // Output the CloudWatch Log Group name
    new cdk.CfnOutput(this, 'CloudWatchLogGroup', {
      value: logGroup.logGroupName,
      description: 'CloudWatch Log Group for Fargate Service'
    });
  }
}