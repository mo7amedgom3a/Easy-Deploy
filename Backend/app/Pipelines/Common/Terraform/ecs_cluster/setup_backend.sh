#!/bin/bash

# Replace these with actual values
USER_GITHUB_ID=$1

cd /mnt/sda2/repos/Easy-Deploy/Backend/app/Pipelines/Common/Terraform/ecs_cluster

# Reconfigure backend with current user's settings
terraform init \
  -reconfigure \
  -backend-config="key=states/${USER_GITHUB_ID}/terraform.tfstate" \
