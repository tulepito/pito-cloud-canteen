#!/usr/bin/env bash

source ./scripts/set_environment.sh

echo -e "${COLOR}::::Connecting to AWS Instance::::${NC}"

ssh -o StrictHostKeyChecking=no -i "${AWS_PRIVATE_KEY_PATH}" ${AWS_INSTANCE_URL}
