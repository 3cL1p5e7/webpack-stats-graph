;(function() {
  'use strict';
  sigma.visual_settings = {};

  sigma.utils.getSize = function(element, mask, field, settings, sizing, invert) {
    var size = parseFloat(sigma.utils.getMaskedValue(element, mask, field)) || sizing.defaultValue;

    if (invert)
      size = settings.min_size +
        (settings.max_size - settings.min_size) * (sizing.max - size) / (sizing.max - sizing.min);
    else
      size = settings.min_size +
        (settings.max_size - settings.min_size) * (size - sizing.min) / (sizing.max - sizing.min);
    return size;
  };

  sigma.visual = {
    inverseColorNode: false,
    inverseSizeNode: false,

    rangeColorNode: false,
    rangeSizeNode: false,

    inverseColorEdge: false,
    inverseSizeEdge: false,

    rangeColorEdge: false,
    rangeSizeEdge: false,

    colorRangerField: 'color_ranger', // custom field for SHADER
    sizeRangerField: 'size', // general field of SigmaJS

    labelField: 'label',
    mask: 'value',

    enable: function(){
      // coloring enables by renderer
      // because coloring realized in shaders WebGL

      // sizing
      if(this.rangeSizeNode)
        this.enableRangeNodeSize();
      if(this.rangeSizeEdge)
        this.enableRangeEdgeSize();
    },

    enableRangeNodeColor: function (field, range, inverse) {
      var current_coloring = sigma.visual_settings.node.rangers.coloring;

      if(field)
        current_coloring.field = field;
      if(range)
        current_coloring.range = range;

      if(!current_coloring.field || !current_coloring.range)
        return;

      var nodes = sigma.mode.getInstance().graph.nodes();
      for (var i = 0; i < nodes.length; i++) {
        var val = parseFloat(sigma.utils.getMaskedValue(nodes[i], this.mask, current_coloring.field));
        nodes[i][this.colorRangerField] = isNaN(val) ? 0 : val;
      }

      this.rangeColorNode = true;
      this.inverseColorNode = typeof inverse == 'undefined' ?
        this.inverseColorNode : Boolean(inverse);
      sigma.mode.getInstance().refresh({skipIndexation: true});
    },
    disableRangeNodeColor: function () {
      this.rangeColorNode = false;
      this.inverseColorNode = false;
      sigma.mode.getInstance().refresh({skipIndexation: true});
    },

    enableRangeNodeSize: function(field, inverse) {
      var current_sizing = sigma.visual_settings.node.rangers.sizing;
      if(field)
        current_sizing.field = field;

      if(!current_sizing.field)
        return;

      this.inverseSizeNode = typeof inverse == 'undefined' ?
        this.inverseSizeNode : Boolean(inverse);

      var nodes = sigma.mode.getInstance().graph.nodes();
      var sizing = sigma.utils.getFieldBounds(current_sizing.field, nodes);
      for(var i=0; i<nodes.length; i++) {
        nodes[i][this.sizeRangerField] = sigma.utils.getSize(
          nodes[i], this.mask, current_sizing.field,
          sigma.visual_settings.node, sizing, this.inverseSizeNode);
      }
      sigma.mode.getInstance().refresh({skipIndexation: true});
    },
    disableRangeNodeSize: function() {
      var nodes = sigma.mode.getInstance().graph.nodes();
      for(var i=0; i<nodes.length; i++) {
        nodes[i][this.sizeRangerField] = sigma.visual_settings.node.min_size;
      }
      this.inverseSizeNode = false;
      sigma.mode.getInstance().refresh({skipIndexation: true});
    },

    enableRangeEdgeColor: function (field, range, inverse) {
      var current_coloring = sigma.visual_settings.edge.rangers.coloring;
      if(field)
        current_coloring.field = field;
      if(range)
        current_coloring.range = range;

      if(!current_coloring.field || !current_coloring.range)
        return;

      var edges = sigma.mode.getInstance().graph.edges();
      for (var i = 0; i < edges.length; i++) {
        var val = parseFloat(sigma.utils.getMaskedValue(edges[i], this.mask, current_coloring.field));
        edges[i][this.colorRangerField] = isNaN(val) ? 0 : val;
      }

      this.rangeColorEdge = true;
      this.inverseColorEdge = typeof inverse == 'undefined' ? this.inverseColorEdge : Boolean(inverse);
      sigma.mode.getInstance().refresh({skipIndexation: true});
    },
    disableRangeEdgeColor: function () {
      this.rangeColorEdge = false;
      this.inverseColorEdge = false;
      sigma.mode.getInstance().refresh({skipIndexation: true});
    },

    enableRangeEdgeSize: function(field, inverse) {
      var current_sizing = sigma.visual_settings.edge.rangers.sizing;
      if(field)
        current_sizing.field = field;

      if(!current_sizing.field)
        return;

      this.inverseSizeEdge = typeof inverse == 'undefined' ?
        this.inverseSizeEdge : Boolean(inverse);

      var edges = sigma.mode.getInstance().graph.edges();
      var sizing = sigma.utils.getFieldBounds(current_sizing.field, edges);

      for(var i=0; i<edges.length; i++) {
        edges[i][this.sizeRangerField] = sigma.utils.getSize(
          edges[i], this.mask, current_sizing.field,
          sigma.visual_settings.edge, sizing, this.inverseSizeEdge);
      }
      sigma.mode.getInstance().refresh({skipIndexation: true});
    },
    disableRangeEdgeSize: function() {
      var edges = sigma.mode.getInstance().graph.edges();
      for(var i=0; i<edges.length; i++) {
        edges[i][this.sizeRangerField] = sigma.visual_settings.edge.min_size;
      }
      this.inverseSizeEdge = false;
      sigma.mode.getInstance().refresh({skipIndexation: true});
    },

    enableNodeLabels: function(field, isDraw){
      if(field)
        sigma.visual_settings.node.label = field;

      if(!sigma.visual_settings.node.label)
        return;
      var nodes = sigma.mode.getInstance().graph.nodes();
      for (var i = 0; i < nodes.length; i++) {
        var label = sigma.utils.getMaskedValue(nodes[i], this.mask, sigma.visual_settings.node.label);
        nodes[i][this.labelField] = (label || '').toString();
      }
      if(isDraw) {
        sigma.mode.getInstance().settings('drawLabels', true);
        sigma.mode.getInstance().render(); // nodes
      }
    },
    disableNodeLabels: function () {
      sigma.mode.getInstance().settings('drawLabels', false);
      sigma.mode.getInstance().render(); // nodes
    },

    enableEdgeLabels: function(field, isDraw){
      if(field)
        sigma.visual_settings.edge.label = field;

      if(!sigma.visual_settings.edge.label)
        return;
      var edges = sigma.mode.getInstance().graph.edges();
      for (var i = 0; i < edges.length; i++) {
        var label = sigma.utils.getMaskedValue(edges[i], this.mask, sigma.visual_settings.edge.label);
        edges[i][this.labelField] = (label || '').toString();
      }
      if(isDraw) {
        sigma.mode.getInstance().settings('drawEdgeLabels', true);
        sigma.mode.getInstance().render(); // edges
      }
    },
    disableEdgeLabels: function () {
      sigma.mode.getInstance().settings('drawEdgeLabels', false);
      sigma.mode.getInstance().render(); // nodes
    }
  };
})();