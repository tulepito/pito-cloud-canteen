#!/usr/bin/env bash

set -e

SECONDS=0

source ./scripts/set_environment.sh

#check the branch name and deploy from CircleCI

echo -e "${COLOR}::::will deploy with tag >>${TAG_NAME}<<::::${NC}"
docker build -t ${AWS_ECR_REPO_URL} .

echo -e "${COLOR}::::login aws::::${NC}"

# $(aws ecr get-login --no-include-email --region ${AWS_INSTANCE_REGION} ${AWS_PROFILE_PARAM})
aws ecr get-login-password --region ${AWS_INSTANCE_REGION} | docker login --password-stdin --username AWS ${AWS_ECR_REPO_URL}

echo -e "${COLOR}::::pushing to aws repo::::${NC}"
docker push ${AWS_ECR_REPO_URL}

if [ "$CIRCLECI" == "true" ] && [ "$CIRCLE_BRANCH" == "production" ]; then
  echo -e "${COLOR}:::::::::AWS Fargate will handle the rest!:::::::::${NC}"
  exit 0
fi

echo -e "${COLOR}::::ssh and deploy::::${NC}"
ssh -o StrictHostKeyChecking=no -i "${AWS_PRIVATE_KEY_PATH}" ${AWS_INSTANCE_URL} "IMAGE_URL=${AWS_ECR_REPO_URL} ./deploy.sh"

if [ "$CIRCLECI" == "true" ]; then
  echo -e "${COLOR}:::::::::Deployed by the CI:::::::::${NC}"

else
  echo -e "${COLOR}:::::::::Deployed by the local machine:::::::::${NC}"
  cp .env.staging .env
fi

duration=$SECONDS
echo -e "${COLOR}::::::::$(($duration / 60)) minutes and $(($duration % 60)) seconds deployment time.${NC}"

if [ "$CIRCLECI" == "true" ] && [ "$CIRCLE_BRANCH" == "production" ]; then
  echo -e "${COLOR}:::::::::Revoking the IP:::::::::${NC}"
  ENV_SET=true ./scripts/revoke_ip_for_production.sh
fi
