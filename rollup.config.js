import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import del from 'rollup-plugin-delete'
import json from '@rollup/plugin-json'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import image from 'rollup-plugin-img'

const packageJson = require('./package.json')

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      del({ targets: 'dist/*' }),
      peerDepsExternal(),
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', exclude: ['**/*.stories.tsx', '**/*.test.tsx'] }),
      json(),
      postcss({
        minimize: true,
        modules: true,
        extensions: ['.css', '.scss']
      }),
      image({
        output: 'dist/images', // default the root
        extensions: /\.(png|jpg|jpeg|gif|svg)$/, // support png|jpg|jpeg|gif|svg, and it's alse the default value
        limit: 8192, // default 8192(8k)
        exclude: 'node_modules/**'
      })
      // terser()
    ]
  }
]
