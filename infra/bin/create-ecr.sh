#!/bin/bash

# Set variables
AWS_REGION=$(aws configure get region)
ECR_REPOSITORY_NAME="litally-backend"

# Create ECR repository
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $AWS_REGION

echo "ECR repository '$ECR_REPOSITORY_NAME' created successfully in region $AWS_REGION"
