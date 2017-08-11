import webpack from 'webpack';
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const GLOBALS = {
    'process.env.NODE_ENV': JSON.stringify('production')
};

export default {
    devtool: 'source-map',
    entry: './client/meetings',
    target: 'web',
    output: {
        path: __dirname + '/dist', // Note: Physical files are only output by the production build task `npm run build`.
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DefinePlugin(GLOBALS),
        new ExtractTextPlugin('styles.css'),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        }),
        new webpack.ProvidePlugin({
            "$": "jquery",
            "jquery": "jquery",
            "jQuery": "jquery",
            "window.jquery": "jquery",
            "window.jQuery": "jquery",
            "window.$": "jquery"
        })
    ],
    module: {
        loaders: [
            { test: /\.js$/, include: path.join(__dirname, 'client'), loader: 'babel-loader', query: { presets: ['es2015'], retainLines: 'true' } },
            { test: /(\.css)$/, loader: ExtractTextPlugin.extract("css-loader?sourceMap") },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
            { test: /\.(woff|woff2)$/, loader: "url-loader?prefix=font/&limit=5000" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=image/svg+xml" },
            { test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/, loader: "file-loader?name=[name].[ext]" }
        ]
    }
};