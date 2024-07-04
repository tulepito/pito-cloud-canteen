#!/usr/bin/env bash

set -e

SECONDS=0

source ./scripts/set_environment.sh

#check the branch name and deploy from CircleCI

echo -e "${COLOR}::::will deploy with tag >>${TAG_NAME}<<::::${NC}"
docker build -t ${AWS_ECR_REPO_URL} .

echo -e "${COLOR}::::login aws::::${NC}"

docker login -u AWS -p $(aws ecr get-login-password --profile=environment --region ${AWS_INSTANCE_REGION} ${AWS_PROFILE_PARAM})  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_INSTANCE_REGION}.amazonaws.com

echo -e "${COLOR}::::pushing to aws repo::::${NC}"
docker push ${AWS_ECR_REPO_URL}

# if [[ "$CIRCLE_BRANCH" == "master" ]] || [[ "$CIRCLE_BRANCH" == "main" ]]; then
#   echo -e "${COLOR}::::ssh and deploy::::${NC}"
#   ssh -o StrictHostKeyChecking=no -i "${AWS_PRIVATE_KEY_PATH}" ${AWS_INSTANCE_URL} "IMAGE_URL=${AWS_ECR_REPO_URL} REGION=${AWS_INSTANCE_REGION} ${AWS_INSTANCE_DEPLOY_SCRIPT}"
# fi

echo -e "${COLOR}:::::::::Deployed by the CI:::::::::${NC}"

duration=$SECONDS
echo -e "${COLOR}::::::::$(($duration / 60)) minutes and $(($duration % 60)) seconds deployment time.${NC}"