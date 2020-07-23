import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default [{
  input: 'src/initFormsLookup.js',
  output: {
    file: 'build/forms-lookup-bundle.js',
    format: 'iife',
    name: 'initFormsLookup'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled' })
  ]
},
{
  input: 'src/all-forms-list/initAllForms.js',
  output: {
    file: 'build/all-forms-bundle.js',
    format: 'iife',
    name: 'initAllForms'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled' })
  ]
}];