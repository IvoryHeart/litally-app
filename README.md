# LiTally - Simple Fintech App

This is a simple fintech app written in Typescript on express.js

Its deployed on AWS Lambda [here](https://759aqiejpa.execute-api.eu-west-2.amazonaws.com/dev/). 

All APIs are under `MAIN_URI/api`

End point:
```
  ANY - https://759aqiejpa.execute-api.eu-west-2.amazonaws.com/dev/{proxy+}
```

## Table of Contents

- [Architecture](./doc/ARCHITECTURE.md)
- [LiTally - Simple Fintech App](#litally---simple-fintech-app)
  - [Table of Contents](#table-of-contents)
  - [App Structure](#app-structure)
  - [Installation](#installation)
    - [Local installation](#local-installation)
    - [Testing](#testing)
    - [Deployment](#deployment)
      - [AWS ECS](#aws-ecs)
    - [AWS Lambda](#aws-lambda)
  - [CI/CD](#cicd)
  - [Security](#security)
  - [Known Issues](#known-issues)
- [Operational Strategy and Scaling](./doc/SCALABILITY.md)

## App Structure

The app is a monorepo with backend and frontend.

`doc/architecture` - Contains all the diagrams written in PlantUML format and C4.
`doc/architecture/api-doc.yaml` - Contains the API documentation written in OpenAPI 3.0 with server URLs and AuthN/AuthZ
`backend/` - Contains the `backend` workspace with all the code for backend APIs
`frontend/` - Contains the `frontend` workspace with basic app accessing the `backend` - Incomplete
`infra/` - Contains AWS CDK files to deploy the backend api on ECS clusters

## Installation

Each workspace in the monorepo has its own `package.json`.

The app uses `npm`

### Local installation

Run `npm install` to install all required packages.
Run `npm run build` to build the app
Run `npm start` to start the server.

The app expects a local `.env` file. Each repo has its `.env.sample`, change the values as needed.

### Testing

Unit tests are co-located with each moudle under `__tests__` directory. This helps in moving the modules and launching them into different lambdas at a later point more convenient.

The app has unit tests written for almost all modules with `>97%` coverage. Jest along with Mongoose mocking mongodb was used.

The tests can be run using: `npm test`. This should also return the coverage. And coverage reports would be generated under `coverage/` directory.

The test coverage as on writing this document is as follows:
```
----------------------------|---------|----------|---------|---------|-------------------
File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------------|---------|----------|---------|---------|-------------------
All files                   |   98.62 |    91.08 |   97.91 |   98.49 |                   
 src                        |   97.72 |       80 |   85.71 |   97.72 |                   
  app.ts                    |   97.72 |       80 |   85.71 |   97.72 | 85                
 src/config                 |     100 |      100 |     100 |     100 |                   
  database.ts               |     100 |      100 |     100 |     100 |                   
 src/modules/account        |     100 |    93.54 |     100 |     100 | 
  account.controller.ts     |     100 |    92.85 |     100 |     100 | 22,52
  account.model.ts          |     100 |      100 |     100 |     100 | 
  account.routes.ts         |     100 |      100 |     100 |     100 | 
  account.service.ts        |     100 |      100 |     100 |     100 | 
  account.validation.ts     |     100 |      100 |     100 |     100 | 
 src/modules/transaction    |   96.26 |    85.18 |     100 |   95.87 | 
  paymentGateway.ts         |     100 |      100 |     100 |     100 | 
  transaction.controller.ts |   94.44 |      100 |     100 |   93.75 | 15,53
  transaction.model.ts      |     100 |      100 |     100 |     100 | 
  transaction.routes.ts     |     100 |      100 |     100 |     100 | 
  transaction.service.ts    |   95.45 |    71.42 |     100 |      95 | 44,66
  transaction.validation.ts |     100 |      100 |     100 |     100 | 
 src/modules/user           |     100 |      100 |     100 |     100 | 
  user.controller.ts        |     100 |      100 |     100 |     100 | 
  user.model.ts             |     100 |      100 |     100 |     100 | 
  user.routes.ts            |     100 |      100 |     100 |     100 | 
  user.service.ts           |     100 |      100 |     100 |     100 | 
  user.validation.ts        |     100 |      100 |     100 |     100 | 
 src/shared/middlewares     |   97.22 |    88.88 |     100 |   96.96 | 
  adminAuth.ts              |     100 |      100 |     100 |     100 | 
  auth.ts                   |   93.33 |       50 |     100 |   92.85 | 13
  errorHandler.ts           |     100 |      100 |     100 |     100 | 
 src/shared/utils           |     100 |      100 |     100 |     100 | 
  customError.ts            |     100 |      100 |     100 |     100 | 
  logger.ts                 |     100 |      100 |     100 |     100 | 
  userUtils.ts              |     100 |      100 |     100 |     100 | 
 src/shared/validations     |     100 |      100 |     100 |     100 | 
  commonValidations.ts      |     100 |      100 |     100 |     100 | 
----------------------------|---------|----------|---------|---------|-------------------

Test Suites: 22 passed, 22 total
Tests:       134 passed, 134 total
Snapshots:   0 total
Time:        70.413 s, estimated 89 s
Ran all test suites.
```

**Special Error Scenarios**:
1. While using the app if the amount is equivalient to `e` (`2.71`) then the transaction will be in `PENDING` state
2. If the amount is equivalent to `pi` (`3.14`) then the transaction will be in `FAILED` state
3. Only `ADMIN` users can change the status of a transaction or access all users.

### Deployment

Deployment is only built for `backend` app, the `frontend` is still under development.

#### AWS ECS

The `infra` directory has cdk scripts for deploying the app in AWS ECS + Fargate.

**Creating the Docker image:**</br>
The `backend` as a Dockerfile to create docker image of the backend. The image can be built using:

```
docker build -t litally-backend ./backend
```

**Creating ECR:**</br>
The app expects an ECR to exist by the name `litally-backend`. This can be run by running the script `infra/bin/create-ecr.sh`

**Tag and push docker image to ECR:**</br>

The docker image then needs to be tagged with ECR

```
docker tag litally-backend:latest <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/litally-backend:latest
```

Login to the ECR:
```
 aws ecr get-login-password --region <aws-region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/litally-backend
```

Then the docker image needs to be pushed to the above ECR
```
docker push <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/litally-backend:latest
```

> Assumption: The user has `aws-cli` and `aws-cdk` are installed and configured.

Running the CDK scripts:
```
# Bootstrap CDK
cdk bootstrap
# Synth CDK - Synthesizes and 
cdk synth
# Deploy
cdk deploy
```

This should deploy the backend app in ECS and print URLs for AWS API Gateway, ECR and Cloudwatch logs.

The ECS build also expects secrets and environment variables defined in `.env.sample`. They can be set using:
```
# Setup MONGODB_URI and JWT_SECRET
aws secretsmanager put-secret-value --secret-id litally-env-secret --secret-string '{"MONGODB_URI":"<mongodb-uri>","JWT_SECRET":"<jwt-password>"}'
# Default environment variables are already in the CDK
# ENV variable PORT
aws ssm put-parameter --name "/litally/PORT" --value "3000" --type String --overwrite
# ENV variable NODE_ENV
aws ssm put-parameter --name "/litally-backend/NODE_ENV" --value "production" --type String --overwrite
```

The ECS is also configured for container insights. No further configuration was done to Cloudwatch beyond this.

### AWS Lambda

The app can also be deployed to AWS Lambda using serverless. There is a `serverless.yml` for Lambda configuration. This calls the `lambda.ts` for running the lambda.

**Building and Deployment to AWS Lambda:**</br>

There is a separate command to build for AWS lambda called `aws-build`
Building for AWS lambda:</br>
```
npm run aws-build
```

Deploying to AWS lambda:
```
serverless deploy --stage dev
```

This should return the endpoints for `/api-docs` that returns swagger-ui and `/` (all APIs are under `/api/`). The swagger documentation should also be accessible under `/swagger.json`. This can be viewed using `https://editor.swagger.io`.

## CI/CD

GitHub workflows are also defined for backend.

`deploy-backend-ecs.yml` - Deploys the stack to ECS + Fargate</br>
`deploy-backend-lambda.yml` - Deploys the stack to Lambda

Both scripts are manually triggered.

## Security

The app is configured for CORS to be allowed from everywhere. This should ideally be set only for the domain names its deployed on.

No security tests have been written. Ideally systems like `synk` should have been used.

Authentication is handeled via `passport.js` with local login and JWT support.

All APIs expect `Bearer` token with the JWT token returned by `/api/login` API.

Only APIs that do not require this token are :
1. `/api/register`
2. `/api/login`
3. `/api-docs`
4. `/swagger.json`
5. `/healthcheck`. 

Every other API needs the JWT.

## Known Issues

1. In Lambda - `/api-docs` and `/swagger.json` are throwing errors
2. CI/CD scripts are not tested
3. ECS deployment healthcheck fails in certain cases.

## Missing Implementations
0. HTTPS is not implemented
1. Confirm password flow is missing
2. Forgot password flow is missing
3. Emails/Notifications are not implemented
4. Integration tests to be written.
5. Migrations for databases is not implemented
6. Backup stratgy is documented, but not implemented