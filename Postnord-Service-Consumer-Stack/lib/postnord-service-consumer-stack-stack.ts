import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as path from 'path';

export class PostnordServiceConsumerStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //ServiceConsumer VPC creation
    const vpc = new ec2.Vpc(this, 'ServiceConsumerVPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.6.0.0/16'),
      subnetConfiguration: [
        {
          name: "public-subnet",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "private-subnet",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
       maxAzs: 2,
       natGateways: 1

    })

    //ServiceConsumer Endpoint creation
    const interfacevpcendpoint = new ec2.InterfaceVpcEndpoint(this, 'VPC Endpoint', {
      vpc,
      service: new ec2.InterfaceVpcEndpointService('com.amazonaws.vpce.us-east-1.vpce-svc-018e2dcbd8780cd57', 80)
    })

    //Lambda function
    const LambdaFn = new lambda.Function(this, 'assignment-test-lambda', {
      vpc:vpc,
      vpcSubnets: {subnetType:ec2.SubnetType.PRIVATE_WITH_EGRESS},
      memorySize: 128,
      timeout: cdk.Duration.minutes(1),
      handler: 'lambda_function.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, `/../lambda-function/assignment_lambda_function.zip`))
    })

    //Filtering VPC endpoint URLs for R53 private hosted zone
    const vpcendpointurl = cdk.Fn.select(0, interfacevpcendpoint.vpcEndpointDnsEntries);
    const vpcendpointurltrim = cdk.Fn.split(':', vpcendpointurl);
    const vpcendpointdnsnamee = cdk.Fn.select(1, vpcendpointurltrim);

    //Route53 private hosted zone and cname record poiting to VPC endpoint URL
    const zone = new route53.PrivateHostedZone(this, 'HostedZone', {
      zoneName: 'assignment.com',
      vpc,
    });

    const cnamerecode = new route53.CnameRecord(this, `cnamerecord`, {
      recordName: 'api',
      zone,
      domainName: vpcendpointdnsnamee,
    });

    //Outputs
    new cdk.CfnOutput(this, 'vpcendpointURLs', {
      exportName: 'VPC-Endpoint-urls',
      value: vpcendpointdnsnamee
    })
  }
}
