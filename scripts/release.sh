#!/bin/bash

# config
VERSION=$(node --eval "console.log(require('./package.json').version);")
NAME=$(node --eval "console.log(require('./package.json').name);")

# build and test
npm test || exit 1

# checkout temp branch for release
git checkout -b gh-release

# run build
npm run build

# force add files
git add dist -f

# commit changes with a versioned commit message
git commit -m "build $VERSION"

# push commit so it exists on GitHub when we run gh-release
git push origin gh-release

# create a ZIP archive of the dist files
7z a $NAME-v$VERSION.zip dist

# run gh-release to create the tag and push release to github
gh-release --assets $NAME-v$VERSION.zip

# checkout master and delete release branch locally and on GitHub
git checkout master
git branch -D gh-release
git push origin :gh-release

# publish release on NPM
# TODO: only publish if gh-release was successful, currently
# this fails often enough that we should do this manually
# npm publish
