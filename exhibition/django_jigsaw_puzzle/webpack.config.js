const path = require('path');
module.exports = {
    entry: path.join(__dirname, 'js_src/index.jsx'),
    output: {
        path: path.join(__dirname, 'static/django_jigsaw_puzzle/js'),
        filename: 'bundle.js'
    },
    resolve: {
	extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
	    {
                test: /\.css$/,
                exclude: /node_modules/,
                use: {
                    loader: 'css-loader'
                }
            }
        ]
    }
}
