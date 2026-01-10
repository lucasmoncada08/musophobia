import path from 'path';
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development', // Change to 'production' for production builds
  entry: {
    // Add your entry points here
    // Example:
    // background: './src/background.ts',
    // content: './src/content.ts',
    // popup: './src/popup.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true, // Clean the output directory before emit
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        // Add files to copy to dist folder
        // Example:
        // { from: 'manifest.json', to: 'manifest.json' },
        // { from: 'src/popup.html', to: 'popup.html' },
      ],
    }),
  ],
  devtool: 'cheap-module-source-map', // Use 'source-map' for production
};

