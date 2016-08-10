import npm from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  entry: 'index.js',
  format: 'umd',
  moduleName: 'ea',
  plugins: [
    npm({jsnext: true})
  ],
  dest: './build/ea-timeline.js'
}
