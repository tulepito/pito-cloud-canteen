#!/usr/bin/env bash

set -e

export COLOR='\033[0;32m'
export NC='\033[0m'
export ERR='\033[0;31m'

export TAG_NAME=${TAG:-"latest-$(git rev-parse HEAD)"}
export AWS_PROFILE_PARAM=''
export ENV_FILE_PATH='.env'
export ENV_NAME='STAGING'
export AWS_ECR_REPO_URL="718926326971.dkr.ecr.ap-southeast-1.amazonaws.com/pito-staging:${TAG_NAME}"
export AWS_INSTANCE_REGION='ap-southeast-1'
export AWS_SECURITY_GROUP_ID='sg-073ae61deea5a6a2a'
export AWS_PRIVATE_KEY_PATH=~/Desktop/projects/keys/pito-staging.pem

# todo: REPLACE HERE: environment for Test instance
export AWS_ENV_SECRET_NAME='pito/web/staging/cGl0b3Byb2plY3Q'

#if [ "$CIRCLECI" != "true" ]; then
#  cp .env.staging .env
#fi

if [ "$ENV" == "production" ] || [ "$CIRCLE_BRANCH" == "production" ]; then
  echo -e "${COLOR}:::::::::::::Setting environment for PRODUCTION::::::::::::::${NC}"
  # todo: REPLACE HERE: environment for Production instance
  export TAG_NAME=latest
  export ENV_FILE_PATH='.env'
  export ENV_NAME='PRODUCTION'
  export AWS_ENV_SECRET_NAME='pito//web/prod/'
  export AWS_ECR_REPO_URL=""
  export AWS_INSTANCE_REGION='ap-southeast-1'
  export AWS_SECURITY_GROUP_ID=''

  if [ "$CIRCLECI" != "true" ]; then
    cp .env.prod .env
  fi

else
  echo -e "${COLOR}:::::::::::::Setting environment for TEST::::::::::::::${NC}"
fi
