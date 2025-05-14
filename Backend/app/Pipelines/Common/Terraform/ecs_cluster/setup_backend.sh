#!/bin/bash

# Replace these with actual values
USER_GITHUB_ID=$1

# Reconfigure backend with current user's settings
terraform init -lock=false\
  -backend-config="key=ecs-cluster/${USER_GITHUB_ID}/terraform.tfstate" \
