import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'youtubetime/content.js',
    output: {
      file: 'dist/content.js',
      format: 'iife',
      name: 'ContentScript',
    },
    plugins: [resolve(), commonjs()],
  },
  {
    input: 'youtubetime/options.js',
    output: {
      file: 'dist/options.js',
      format: 'iife',
      name: 'OptionsScript',
    },
    plugins: [resolve(), commonjs()],
  }
]; 