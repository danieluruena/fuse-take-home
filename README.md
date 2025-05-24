# fuse-take-home
This is the solution to the challenge for backend developers at Fuse

## Prerequisites

- NodeJS
- NestJS
- AWS CLI
- AWS SAM
- Docker

## Directory architecture

You'll find the following main directories in this repo:

```
/
├──apps
|   ├──api          <---- API to receive user requests
|   ├──get-stocks   <---- Lambda function to get stocks every 5 mins
|   ├──send-report  <---- Lambda function to get all transactions and send the daily report to the configured email
├──envs             <---- Files with environment variables
```

## Prepare develop environment

Once you have installed all pre-requisites you will be able to install dependencies by running this command:

```
make install-deps
```



## Deploy the infrastructure

The infrastructure is managed through AWS SAM, so you will have to prepare you environment to deploy the application to AWS following these steps:

1. Configure an AWS user with permissions to CloudFormation, IAM Roles, S3, Event Bridge, Lambda Function, DynamoDB
2. Setup your AWS credentials
3. Install [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
4. Set the environment variable `STAGE=prod` (this is to load the corresponding environment variables from the right file in the `envs` folder, in this case from `prod.env`)
5. Run `make deploy`