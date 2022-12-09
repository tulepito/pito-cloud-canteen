#!/usr/bin/env bash

set -e

source ./scripts/set_environment.sh

echo -e "${COLOR}:::::::::::::CircleCI Detected::::::::::::::${NC}"

if [[ "$CIRCLE_BRANCH" == "main" ]] || [[ "$CIRCLE_BRANCH" == "production" ]] ; then
  # todo: set up aws credentials for getting the env file
  mkdir ~/.aws
  touch ~/.aws/config
  touch ~/.aws/credentials

  echo "[profile environment]" >> ~/.aws/config
  echo "[environment]" >> ~/.aws/credentials
  echo "aws_access_key_id = ${AWS_ENV_USER_ACCESS_KEY_ID}" >> ~/.aws/credentials
  echo "aws_secret_access_key = ${AWS_ENV_USER_SECRET_ACCESS_KEY}" >> ~/.aws/credentials

  echo -e "${COLOR}:::::::::Deploying $CIRCLE_BRANCH by the Circle CI:::::::::${NC}"
  # todo: download and convert env from json to .env
  echo -e "${COLOR}::::Decoding env file::::${NC}"
  aws secretsmanager get-secret-value --secret-id ${AWS_ENV_SECRET_NAME} --region=ap-southeast-1 --query SecretString --output text --profile=environment > .env.json
  ./scripts/json2env.sh .env.json .env
fi
