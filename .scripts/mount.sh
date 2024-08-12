#!/usr/bin/env sh
echo "mount ./packages/ui/src to ./workbench/src/fractl"
echo "$(pwd) should be the root of the repo"

sudo mount --bind ./packages/ui/src ./workbench/src/fractl
