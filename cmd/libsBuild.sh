DIR="$(dirname "${BASH_SOURCE[0]}")"
DIR="$(realpath "${DIR}/../")"

echo "build libs..."
mkdir -p "${DIR}/dist/libs"


npm i --prefix ${DIR}/src/libs/polkadot_api
rollup -c "${DIR}/src/libs/polkadot_api/rollup.config.js"

npm i --prefix ${DIR}/src/libs/polkadot_util-crypto
rollup -c "${DIR}/src/libs/polkadot_util-crypto/rollup.config.js"