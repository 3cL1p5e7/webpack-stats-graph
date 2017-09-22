import fs from 'fs';
import path from 'path';
import express from 'express';
import webpack from 'webpack';

import webpackConfig from './webpack.config';

const app = express();
const compiler = webpack(webpackConfig);
const port = 8080;

// webpack
app.use('/', express.static(path.join(__dirname, '/examples')));
app.use('/build', express.static(path.join(__dirname, '/build')));
app.use('/static', express.static(path.join(__dirname, '/static')));

var server = app.listen(port, function() {
  var host = server.address().address;
  console.log('Server is listening at http://%s:%s', host, port);
});
