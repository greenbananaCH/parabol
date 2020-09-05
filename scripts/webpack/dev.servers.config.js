const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./utils/transformRules')
const getProjectRoot = require('./utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor')
const DOTENV = path.join(PROJECT_ROOT, 'scripts', 'webpack', 'utils', 'dotenv.js')
// const CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = {
  stats: 'minimal',
  watch: true,
  devtool: 'eval-source-map',
  mode: 'development',
  node: {
    __dirname: false
  },
  entry: {
    web: ['webpack/hot/poll?1000', DOTENV, path.join(SERVER_ROOT, 'server.dev.ts')],
    gqlExecutor: ['webpack/hot/poll?1000', DOTENV, path.join(GQL_ROOT, 'gqlExecutor.ts')]
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'dev'),
    libraryTarget: 'commonjs',
    hotUpdateChunkFilename: 'hot/[id].[hash].hot-update.js',
    hotUpdateMainFilename: 'hot/[hash].hot-update.json'
  },
  resolve: {
    alias: {
      '~': path.join(CLIENT_ROOT),
      'parabol-server': SERVER_ROOT,
      'parabol-client': CLIENT_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    unsafeCache: true,
    // this is run outside the server dir, but we want to favor using modules from the server dir
    modules: [path.resolve(SERVER_ROOT, 'node_modules'), path.resolve(PROJECT_ROOT, 'node_modules')]
  },
  resolveLoader: {
    modules: [path.resolve(SERVER_ROOT, 'node_modules'), path.resolve(PROJECT_ROOT, 'node_modules')]
  },
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000', /parabol-client/, /parabol-server/]
    })
  ],
  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin()],
  module: {
    rules: [
      ...transformRules(PROJECT_ROOT),
      {
        test: /\.js$/,
        include: [path.join(SERVER_ROOT), path.join(CLIENT_ROOT)],
        use: [
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx']
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: ['ignore-loader']
      }
    ]
  }
}
