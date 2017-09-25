window.$ = require('jquery');
window._ = require('underscore');
require('./vendor.js');

import {load} from 'src/parsers/stats-parser.js';
import {parse} from 'src/parsers/stats.graph.parser.js';
window.load_stats = load;
window.parse_stats = parse;