import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';



export class PNProjectServiceProviderEndStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //servicesrovider vpc creation
    const vpc = new ec2.Vpc(this, 'servicesrovidervpc', {
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

    //servicesrovider private nlb creation
    const nlb = new elbv2.NetworkLoadBalancer(this, 'serviceprovidernlb', {
      vpc,
      internetFacing: false,
      vpcSubnets: { subnets: vpc.privateSubnets },
    })

    const nlb_listener = nlb.addListener('nlblistener', {
      port: 80,
    })

    //serviceprovider nlb target group
    const targetGroup = new elbv2.NetworkTargetGroup(this, 'serviceprovidernlbtargetgroup', {
      port: 80,
      vpc: vpc,
      targetType: elbv2.TargetType.INSTANCE
    });

    nlb_listener.addAction('listeneraction', {
      action: elbv2.NetworkListenerAction.forward([targetGroup])
    });

    //servicesrovider vpc endpoint service for nlb creation
    const vpcinterfaceendpoint = new cdk.aws_ec2.VpcEndpointService(this, 'servicesrovidervpcendpoint', {
      vpcEndpointServiceLoadBalancers: [nlb],
      acceptanceRequired: false,
      allowedPrincipals: [new cdk.aws_iam.ArnPrincipal('arn:aws:iam::746247950449:root')]
    })

    //output the vpc endpoint servicename
    new cdk.CfnOutput(this, 'vpcendpointservicename', {
      exportName: 'VPC-Endpoint-service-name',
      value: vpcinterfaceendpoint.vpcEndpointServiceName
    })
  }
}
