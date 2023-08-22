#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PostnordServiceConsumerStackStack } from '../lib/postnord-service-consumer-stack-stack';

const app = new cdk.App();
new PostnordServiceConsumerStackStack(app, 'PostnordServiceConsumerStackStack', {});