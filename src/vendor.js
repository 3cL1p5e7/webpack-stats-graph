import './vendor/sigmajs/sigma.core.js';
import './vendor/sigmajs/conrad.js';
import './vendor/sigmajs/utils/sigma.utils.js';
import './vendor/sigmajs/utils/sigma.polyfills.js';
import './vendor/sigmajs/sigma.settings.js';
import './vendor/sigmajs/classes/sigma.classes.dispatcher.js';
import './vendor/sigmajs/classes/sigma.classes.configurable.js';
import './vendor/sigmajs/classes/sigma.classes.graph.js';
import './vendor/sigmajs/classes/sigma.classes.camera.js';
import './vendor/sigmajs/classes/sigma.classes.quad.js';
import './vendor/sigmajs/classes/sigma.classes.edgequad.js';

//import 'src/captors/sigma.captors.mouse.js';
import './sigma-extends/sigma.custom.mouse.captor.js';

import './vendor/sigmajs/captors/sigma.captors.touch.js';
import './vendor/sigmajs/renderers/sigma.renderers.canvas.js';

import './vendor/sigmajs/renderers/sigma.renderers.webgl.js';
import './sigma-extends/sigma.custom.renderers.wedgl.js';

import './vendor/sigmajs/renderers/sigma.renderers.svg.js';
import './vendor/sigmajs/renderers/sigma.renderers.def.js';
import './vendor/sigmajs/renderers/webgl/sigma.webgl.nodes.def.js';
import './vendor/sigmajs/renderers/webgl/sigma.webgl.nodes.fast.js';
import './vendor/sigmajs/renderers/webgl/sigma.webgl.edges.def.js';
import './vendor/sigmajs/renderers/webgl/sigma.webgl.edges.fast.js';
import './vendor/sigmajs/renderers/webgl/sigma.webgl.edges.arrow.js';

import './vendor/sigmajs/renderers/canvas/sigma.canvas.labels.def.js';
import './sigma-extends/sigma.custom.labels.modelling.js';

import './vendor/sigmajs/renderers/canvas/sigma.canvas.hovers.def.js';
import './vendor/sigmajs/renderers/canvas/sigma.canvas.nodes.def.js';

import './sigma-extends/sigma.custom.hovers.modelling.js';

import './vendor/sigmajs/renderers/canvas/sigma.canvas.edges.def.js';
import './vendor/sigmajs/renderers/canvas/sigma.canvas.edges.curve.js';
import './vendor/sigmajs/renderers/canvas/sigma.canvas.edges.arrow.js';
import './vendor/sigmajs/renderers/canvas/sigma.canvas.edges.curvedArrow.js';
import './vendor/sigmajs/renderers/canvas/sigma.canvas.edgehovers.def.js';
import './vendor/sigmajs/renderers/canvas/sigma.canvas.edgehovers.curve.js';

//import 'src/renderers/canvas/sigma.canvas.edgehovers.arrow.js';
import './sigma-extends/sigma.custom.edgehovers.arrow.js';

import './vendor/sigmajs/renderers/canvas/sigma.canvas.edgehovers.curvedArrow.js';
import './vendor/sigmajs/renderers/canvas/sigma.canvas.extremities.def.js';
import './vendor/sigmajs/renderers/svg/sigma.svg.utils.js';
import './vendor/sigmajs/renderers/svg/sigma.svg.nodes.def.js';
import './vendor/sigmajs/renderers/svg/sigma.svg.edges.def.js';
import './vendor/sigmajs/renderers/svg/sigma.svg.edges.curve.js';
import './vendor/sigmajs/renderers/svg/sigma.svg.labels.def.js';
import './vendor/sigmajs/renderers/svg/sigma.svg.hovers.def.js';
import './vendor/sigmajs/middlewares/sigma.middlewares.rescale.js';
import './vendor/sigmajs/middlewares/sigma.middlewares.copy.js';
import './vendor/sigmajs/misc/sigma.misc.animation.js';

//import 'src/misc/sigma.misc.bindEvents.js';
import './sigma-extends/sigma.custom.misc.bindEvents.js';

import './vendor/sigmajs/misc/sigma.misc.bindDOMEvents.js';
import './vendor/sigmajs/misc/sigma.misc.drawHovers.js';

// plugins
import './vendor/sigma-plugins/settings.js';
import './vendor/sigma-plugins/sigma.canvas.edges.labels.curve.js';
import './vendor/sigma-plugins/sigma.canvas.edges.labels.curvedArrow.js';
//import 'plugins/sigma.canvas.edges.labels.def.js';
import './vendor/sigma-plugins/sigma.renderers.snapshot.js';
import './vendor/sigma-plugins/sigma.statistics.HITS.js';
import './sigma-extends/sigma.custom.edges.labels.js';


import './sigma-extends/utils.js';

import './sigma-extends/webgl-renderers/sigma.custom.webgl.node.js';
import './sigma-extends/webgl-renderers/sigma.custom.webgl.edge.js';
import './sigma-extends/map.handlers.js';
import './sigma-extends/graph.handlers.js';
import './vendor/sigma-plugins/gexf-parser.js';
import './vendor/sigma-plugins/sigma.parsers.gexf.js';
import './vendor/sigma-plugins/sigma.drag.js';
require('./vendor/sigma-plugins/patch-force-atlas!./vendor/sigma-plugins/sigma.forceAtlas2.js');

import './core/visual.js';

import './core/modes/mode.js';
import './core/modes/mode.graph.js';
import './core/modes/mode.map.js';

import './vendor/leaflet/leaflet.css';
window.L = require('./vendor/leaflet/leaflet.js');
require('./vendor/leaflet/overlay.js');
