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
|   ├──api              <---- API to receive user requests
|   ├──get-stocks       <---- Lambda function to get stocks every 5 mins
|   ├──send-report      <---- Lambda function to get all transactions and send the daily report to the configured email
├──libs
|   ├──take-home-core   <---- Shared library with common code
├──envs                 <---- Files with environment variables
```

## Prepare develop environment

Once you have installed all pre-requisites you will be able to install dependencies by running this command:

```
make install-deps
```

## Run components in a local environment

Before running components in a local environment please follow these steps:

1. Run a local instance of DynamoDB using docker with the command `docker compose up -d`
2. Create the DynamoDB tables for `stocks`, `users`, `portfolio` and `transactions` (I recommend to use the admin portal included in the `docker-compose` file expose in the url http://localhost:8001)
3. Check the environment file to provide the right values in the `envs` folder.

### Run lambda function to get stocks from vendor
To run this lambda function locally you have set the `STOCKS_API_KEY` environment variable in the file `envs/local.json`. Then you can run this command:

```
make run-local-get-stocks
```

You will see the logs in the terminal and the table `StocksTable` will be populated.

### Run API

You can run this command to run the API locally:

```
make start-api
```

Endpoints documentation can be found [here](./apps/api/swagger.yaml).



## Deploy the infrastructure

The infrastructure is managed through AWS SAM, so you will have to prepare you environment to deploy the application to AWS following these steps:

1. Configure an AWS user with permissions to CloudFormation, IAM Roles, S3, Event Bridge, Lambda Function, DynamoDB
2. Setup your AWS credentials
3. Install [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
4. Set the environment variable `STAGE=prod` (this is to load the corresponding environment variables from the right file in the `envs` folder, in this case from `prod.env`)
5. Run `make deploy`