#!/usr/bin/env bash

DIR="$(dirname "${BASH_SOURCE[0]}")"
DIR="$(realpath "${DIR}/../")"

cp "${DIR}/src/index.html" "${DIR}/dist/index.html"

rollup -c "${DIR}/rollup.config.js"
#node --max-old-space-size=8192 /usr/bin/rollup -c "${DIR}/rollup.config.js"

