#!/usr/bin/env bash

set -e
echo "Enter heliosRX release version: "
read VERSION

read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  # run tests
  npm test 2>/dev/null

  # build
  VERSION=$VERSION npm run build

  # check if there is uncommitted changes
  if [[ $( git diff-index HEAD | grep -v "dist/" | wc -c ) -ne 0 ]]
  then
    echo
    echo
    echo "Uncommited changes!"
    exit
  fi

  # set version
  npm version $VERSION --force --allow-same-version --message "[release] $VERSION"

  # commit
  git add -A package.json ./dist
  git commit -m "[build] $VERSION"

  # tag
  git tag -a "v$VERSION" -m "[release] $VERSION"

  # publish
  git push origin refs/tags/v$VERSION
  git push
  npm publish
fi
