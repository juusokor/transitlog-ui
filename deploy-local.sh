#!/bin/bash
set -e

PS3='Select an environment:'
option_labels=("Local" "Development" "Staging" "Production")
select opt in "${option_labels[@]}"; do
  case $opt in
  "Local")
    echo "You chose Local"
    ENV=local
    break
    ;;
  "Development")
    echo "You chose Development"
    ENV=dev
    break
    ;;
  "Staging")
    echo "You chose Staging"
    ENV=staging
    break
    ;;
  "Production")
    echo "You chose Production"
    ENV=production
    break
    ;;
  *)
    ENV=production
    break
    ;;
  esac
done

echo "Building for the $opt ($ENV) environment..."

ORG=${ORG:-hsldevcom}
DOCKER_IMAGE=${ORG}/transitlog-ui:latest-${ENV}

docker build --build-arg BUILD_ENV=${ENV} -t ${DOCKER_IMAGE} .
docker push ${DOCKER_IMAGE}
