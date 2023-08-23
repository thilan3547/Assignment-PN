![test](https://github.com/thilan3547/Assignment-PN/actions/workflows/test.yml/badge.svg)

## PostNord Assignment - IaC Repo
This repo contains all the CDK configurations required to create the AWS infrastructure for the PostNord assignment. Below is the list of infrastructure components created under this project.

- On AWS account A (refer to as the Consumer Account)
    - VPC
    - VPC endpoint
    - Lambda function
    - Route53 private hosted zone
    - CNAME record

- On AWS account B (refer to as Service Account)
    - VPC
    - VPC interface endpoint
    - NLB

### Architecture diagram

![Screenshot](Images/Screenshot.png)

### Cross account connectivity
- A VPC Endpoint Service (privatelink) was created at the Service account and linked to an NLB.

![Screenshot](Images/Screenshotserviceendpoint.png)


- At the Consumer account, an Interface Endpoint was created and linked to the service name of the VPC Service Interface Endpoint at the Service account.

![Screenshot](Images/Screenshotendpoint.png)

### High availability
- The NLB was deployed across 2 AZs
- The service app EC2 instances will be deployed across multiple AZs
- The lambda function was deployed across 2 AZs
- VPC Interface Endpoints are deployed across 2 AZs

### Lambda log outputs for successful connection establishment

![Screenshot](Images/lambdalog.png)

### Testing
An initial test case has been generated in the Postnord-Service-Consumer-Stack -> test folder. It will evaluate the configuration parameters for Lambda, VPC and VPCEndpoint to make sure they are within the recommended range. A GitActions workflow is in place to run the test case and verify the results.

### VPC endpoint service domain name
AWS provides a private DNS name setup option for a vpc endpoint service but at the moment I don't have a public domain name to test this configuration. But in a situation where a public domain name is available, we can use this feature to setup a private DNS name and share it with the service consumers.

![Screenshot](Images/privatedns.png)

#### Authors
Romesh Samarakoon


