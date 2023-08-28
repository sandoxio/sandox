#!/usr/bin/env bash

DIR="$(dirname "${BASH_SOURCE[0]}")"
DIR="$(realpath "${DIR}/../")"

mkdir -p "${DIR}/dist"
cp "${DIR}/src/index.html" "${DIR}/dist/index.html"
touch "${DIR}/dist/worker-javascript.js"

"${DIR}/cmd/libsBuild.sh"

rollup -c "${DIR}/rollup.config.js"
