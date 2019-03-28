// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const SmartBannerPlugin = require('smart-banner-webpack-plugin');

const { CheckerPlugin } = require('awesome-typescript-loader')
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

module.exports = {
    entry: './src/mqtt/test.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules[\/\\])(?!mqtt)/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'shebang-loader'
                    }
                ]
            }

        ]
    },
    resolve: {
        extensions: ['.ts','.js', '.tsx']
    },

    // devtool: 'eval-source-map',
    devtool: 'cheap-module-source-map',
    target: 'node',
    plugins: [
        new TsConfigPathsPlugin(/* { configFileName, compiler } */),
       // new  webpack.NormalModuleReplacementPlugin(/^mqtt$/,"mqtt/dist/mqtt.js"),
     //   new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
    //    new SmartBannerPlugin({
    //     banner: "#!/usr/bin/env node",
    //     raw: true//,
    //    // entryOnly: true
    //   }),
        new CheckerPlugin()  
    ]
};