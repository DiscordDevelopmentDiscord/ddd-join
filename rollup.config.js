import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { resolve as resolveDir } from 'path';
import cleaner from 'rollup-plugin-cleaner';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import dotenv from 'dotenv';

dotenv.config({ debug: process.env.NODE_ENV !== 'production' });

export default {
	input: 'src/index.ts',
	output: {
		file: './dist/index.js',
		format: 'umd',
		sourcemap: false
	},
	plugins: [
		cleaner({
			targets: ['./dist/']
		}),
		resolve(),
		commonjs(),
		typescript({ tsconfig: resolveDir(process.cwd(), 'tsconfig.json') }),
		terser({
			ecma: 2020,
			compress: { drop_console: !Reflect.has(process.env, 'ROLLUP_WATCH') },
			format: { comments: false }
		})
	]
};
