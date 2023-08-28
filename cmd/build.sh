#!/usr/bin/env bash

DIR="$(dirname "${BASH_SOURCE[0]}")"
DIR="$(realpath "${DIR}/../")"

mkdir -p "${DIR}/dist"
cp "${DIR}/src/index.html" "${DIR}/dist/index.html"
touch "${DIR}/dist/worker-javascript.js"


npm i --prefix ${DIR}
rollup -c "${DIR}/rollup.config.js"

"${DIR}/cmd/libsBuild.sh"
