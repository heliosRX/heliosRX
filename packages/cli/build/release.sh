#!/usr/bin/env bash

set -e
echo "Enter heliosRX CLI release version: "
read VERSION

read -p "Releasing CLI $VERSION - are you sure? (y/n)" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  # run tests
  # npm test 2>/dev/null

  # build
  VERSION=$VERSION npm run build

  # check if there is uncommitted changes
  set +e
  git diff-index --quiet HEAD --
  if [[ $? -eq 1 ]]
  then
    echo "Uncommited changes"
    exit
  fi
  set -e

  # set version
  npm version $VERSION --message "[release-cli] $VERSION"

  # commit
  git add package.json
  git commit -m "[build] $VERSION"

  # tag
  git tag -a "cli-$VERSION" -m "[release-cli] $VERSION"

  # publish
  git push origin refs/tags/cli-$VERSION
  git push
  npm publish
fi
