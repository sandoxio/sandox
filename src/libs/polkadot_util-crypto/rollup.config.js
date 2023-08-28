import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const rootDir = dirname(__filename);

export default {
	input: rootDir + '/index.js',
	output: [
		{
			file: rootDir + '/../../../dist/libs/polkadot_util-crypto.js',
			format: 'es'
		}
	],

	plugins: [
		resolve({
			browser: true
		}),
		commonjs()
	]
};
