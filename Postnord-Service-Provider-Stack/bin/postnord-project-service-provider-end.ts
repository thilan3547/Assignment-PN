#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PNProjectServiceProviderEndStack } from '../lib/postnord-project-service-provider-end-stack';

const app = new cdk.App();
new PNProjectServiceProviderEndStack(app, 'PostnordProjectServiceProviderEndStack', {});