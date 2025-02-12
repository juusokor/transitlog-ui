#!/bin/bash
set -e

ORG=${ORG:-hsldevcom}
DOCKER_TAG=${TRAVIS_BUILD_NUMBER:-latest-production}
DOCKER_IMAGE=${ORG}/transitlog-ui:${DOCKER_TAG}
DOCKER_IMAGE_LATEST=${ORG}/transitlog-ui:latest

docker build --build-arg BUILD_ENV=production -t ${DOCKER_IMAGE} .

if [[ ${TRAVIS_PULL_REQUEST} == "false" ]] && [[ ${TRAVIS_BRANCH} == "master" ]]; then
  docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
  docker push ${DOCKER_IMAGE}
  docker tag ${DOCKER_IMAGE} ${DOCKER_IMAGE_LATEST}
  docker push ${DOCKER_IMAGE_LATEST}
fi
