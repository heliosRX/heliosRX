set -e
echo "Enter heliosRX CLI release version: "
read VERSION

read -p "Releasing CLI $VERSION - are you sure? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  # run tests
  # npm test 2>/dev/null

  # build
  VERSION=$VERSION npm run build

  # check if there is uncommitted changes
  git diff-index --quiet HEAD -- || (echo "Uncommited changes"; exit)

  # commit
  # git add -A
  # git commit -m "[build] $VERSION"

  # tag
  git tag -a "cli-$VERSION" -m "[release-cli] $VERSION"
  npm version $VERSION --message "[release-cli] $VERSION"

  # publish
  git push origin refs/tags/cli-$VERSION
  git push
  npm publish
fi
