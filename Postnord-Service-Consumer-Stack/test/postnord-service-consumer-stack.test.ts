import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as PostnordServiceConsumerStack from '../lib/postnord-service-consumer-stack-stack';


describe('Stack Testing', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new PostnordServiceConsumerStack.PostnordServiceConsumerStackStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    test('Lambda creation', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            MemorySize: 128,
            Timeout: 60,
            Handler: 'lambda_function.lambda_handler',
            Runtime: 'python3.10'
        })
    });
    test('Vpc creation', () => {
        template.hasResourceProperties('AWS::EC2::VPC', {
            EnableDnsHostnames: true,
            EnableDnsSupport: true
        })
    });
    test('Vpc endpoint creation', () => {
        template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
            VpcEndpointType: 'Interface',
            ServiceName: 'com.amazonaws.vpce.us-east-1.vpce-svc-07db6ffc4ca7eb54c',
            PrivateDnsEnabled: false
        })
    });
});
