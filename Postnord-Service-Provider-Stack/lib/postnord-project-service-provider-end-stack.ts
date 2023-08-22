import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';



export class PNProjectServiceProviderEndStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //ServiceProvider VPC creation
    const vpc = new ec2.Vpc(this, 'ServiceProviderVPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.5.0.0/16'),
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

    //ServiceProvider private NLB creation
    const nlb = new elbv2.NetworkLoadBalancer(this, 'ServiceProviderNLB', {
      vpc,
      internetFacing: false,
      vpcSubnets: {subnets: vpc.privateSubnets},
    })

    const nlb_listener = nlb.addListener('nlblistener', {
      port: 80,
    })

    //ServiceProvider NLB target group
    const targetGroup = new elbv2.NetworkTargetGroup(this, 'ServiceProviderNLBTargetGroup', {
      port: 80,
      vpc: vpc,
      targetType: elbv2.TargetType.INSTANCE
    });

    nlb_listener.addAction('MyListenerAction', {
      action: elbv2.NetworkListenerAction.forward([targetGroup])
    });

    //ServiceProvider VPC endpoint service for NLB creation
    const vpcinterfaceendpoint = new cdk.aws_ec2.VpcEndpointService(this, 'ServiceProvidervpcendpoint', {
      vpcEndpointServiceLoadBalancers: [nlb],
      acceptanceRequired: false,
      allowedPrincipals: [new cdk.aws_iam.ArnPrincipal('arn:aws:iam::746247950449:root')]
    })

    //Output the VPC endpoint ServiceName
    new cdk.CfnOutput(this, 'vpcendpointservicename', {
      exportName: 'VPC-Endpoint-service-name',
      value:vpcinterfaceendpoint.vpcEndpointServiceName
    })
  }
}
