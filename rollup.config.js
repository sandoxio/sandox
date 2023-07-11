//import {uglify} from 'rollup-plugin-uglify';
import build from 'rollup-plugin-rp';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const rootDir = dirname(__filename);

console.log('rootDir:', rootDir);

export default {
	input: rootDir + '/src/index.js',
	output: [
		{
			//dir: rootDir + '/dist/',
			file: rootDir + '/dist/index.js',
			format: 'iife',
			globals: {
				ws: 'WebSocket',
				wrtc: '{RTCPeerConnection: RTCPeerConnection, RTCSessionDescription: RTCSessionDescription}',
				abab: '{atob: atob.bind(window), btoa: btoa.bind(window)}'
			}
		}
	],

	plugins: [
		resolve({
			browser: true
		}),
		commonjs(),
		build(),
		//dotenv(),
		//uglify()
	]
};
