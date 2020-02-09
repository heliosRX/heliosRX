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

  # commit
  git add -A ./dist
  git commit -m "[build] $VERSION"

  # set version
  npm version $VERSION --message "[release] $VERSION"

  # tag (is created by npm version)
  # git tag -a "v$VERSION" -m "[release] $VERSION"

  # publish
  # git push origin refs/tags/v$VERSION
  # git push
  git push github --tags
  git push github
  npm publish
fi
