#!/bin/bash

export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=$(aws configure get region)

echo "CDK_DEFAULT_ACCOUNT set to: $CDK_DEFAULT_ACCOUNT"
echo "CDK_DEFAULT_REGION set to: $CDK_DEFAULT_REGION"