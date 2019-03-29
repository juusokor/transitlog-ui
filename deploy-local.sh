#!/bin/bash
set -e

ORG=${ORG:-hsldevcom}
DOCKER_IMAGE=${ORG}/transitlog-ui:latest
DOCKER_IMAGE_LATEST=${ORG}/transitlog-ui:latest

docker build -t ${DOCKER_IMAGE} .
docker push ${DOCKER_IMAGE}
docker tag ${DOCKER_IMAGE} ${DOCKER_IMAGE_LATEST}
docker push ${DOCKER_IMAGE_LATEST}
