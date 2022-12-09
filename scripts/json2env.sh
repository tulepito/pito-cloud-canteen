#!/usr/bin/env bash

json=`cat $1`

echo ${json}

rm $2
touch $2

jq -r "to_entries|map(\"\(.key)=\(.value|tostring)\")|.[]" $1 > $2
