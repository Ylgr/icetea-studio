const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const dotenv = require('dotenv');
const webpack = require('webpack');

module.exports = env => {

  // call dotenv and it will return an Object with a parsed key
  const denv = dotenv.config().parsed;

  // reduce it to a nice object, the same as before
  const envKeys = Object.keys(denv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(denv[next]);
    return prev;
  }, {});


  const config = {
    entry: {
      main: './src/index.tsx',
      worker: './src/worker.ts',
    },
    output: {
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist/'),
      publicPath: '/dist/',
    },
    devServer: {
      host: '0.0.0.0',
      inline:true,
      port: 28443
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: 'source-map',

    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    module: {
      rules: [
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },

        // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
        { test: /\.tsx?$/, loader: 'ts-loader' },

        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: path.resolve(__dirname, 'node_modules'),
        },
      ],
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    plugins: [new MonacoWebpackPlugin(),new webpack.DefinePlugin(envKeys)],
    optimization: {
      splitChunks: {
        cacheGroups: {
          editor: {
            // Editor bundle
            test: /[\\/]node_modules\/(monaco-editor\/esm\/vs\/(nls\.js|editor|platform|base|basic-languages|language\/(css|html|json|typescript)\/monaco\.contribution\.js)|style-loader\/lib|css-loader\/lib\/css-base\.js)/,
            name: 'monaco-editor',
            chunks: 'async',
          },
          languages: {
            // Language bundle
            test: /[\\/]node_modules\/monaco-editor\/esm\/vs\/language\/(css|html|json|typescript)\/(_deps|lib|fillers|languageFeatures\.js|workerManager\.js|tokenization\.js|(tsMode|jsonMode|htmlMode|cssMode)\.js|(tsWorker|jsonWorker|htmlWorker|cssWorker)\.js)/,
            name: 'monaco-languages',
            chunks: 'async',
          },
        },
      },
    },
    node: {
      fs: 'empty',
    },
  };

  return config;
};
