#!/usr/bin/env bash

source ./scripts/set_environment.sh

echo -e "${COLOR}ENCODED_${ENV_NAME}_PEM${NC}"

base64 ${AWS_PRIVATE_KEY_PATH}

echo -e "${COLOR}AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY${NC}"

cat ${AWS_ACCESS_KEY_PATH}

echo -e "${COLOR}AWS_ENV_USER_ACCESS_KEY_ID / AWS_ENV_USER_SECRET_ACCESS_KEY${NC}"

cat ${AWS_ENV_USER_ACCESS_KEY_PATH}

echo -e "${COLOR}ENV IN JSON FORMAT - $AWS_ENV_SECRET_NAME${NC}"

node ./scripts/env2json.js ${ENV_FILE_PATH} ${ENV_FILE_PATH}.json

