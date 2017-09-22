;(function(undefined) {
  'use strict';

  sigma.utils.renameProperty = function (obj, oldName, newName) {
    // Do nothing if the names are the same
    if (oldName == newName) {
      return obj;
    }
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (obj.hasOwnProperty(oldName)) {
      obj[newName] = obj[oldName];
      delete obj[oldName];
    }
    return obj;
  };

  sigma.mode = {
    mask: 'attributes',
    graphManager: {
      nodes: [],
      edges: [],
      model: {'node': {}, 'edge': {}},
      mask: 'value',

      lat: {},
      lng: {},

      defaultNode: {},
      defaultEdge: {},

      init: function (model) {
        if(model){
          var node = {};
          _.each(model.node, function(elem){
            node[elem.id] = elem.title;
          });
          this.model.node = node;
          var edge = {};
          _.each(model.edge, function(elem){
            edge[elem.id] = elem.title;
          });
          this.model.edge = edge;
        }

        this.nodes = [];
        this.edges = [];
        this.lng = {};
        this.lat = {};

        this.defaultNode = {
          type: 'modelling',
          url: null,
          label: '',
          size: sigma.visual_settings.node.min_size,
          color_node: sigma.utils.floatColor(sigma.visual_settings.node.defaultColor),
          transparency_node: 1.0,
          color: sigma.visual_settings.node.defaultColor,
          border_color: sigma.utils.floatColor('rgba(0, 0, 0, 1)'),
          color_ranger: 0
        };

        this.defaultEdge = {
          color_edge: sigma.utils.floatColor(sigma.visual_settings.node.defaultColor),
          label: '',
          size: sigma.visual_settings.edge.min_size,
          transparency_edge: 1.0,
          type: 'modelling',
          hover: true,
          color_ranger: 0
        };
      },
      getGraph: function(){
        return {
          nodes: this.nodes,
          edges: this.edges
        };
      },
      addNode: function(node) {
        var def = JSON.parse(JSON.stringify(this.defaultNode));
        if(node.color){
          def.color = node.color;
          def.color_node = sigma.utils.floatColor(node.color);
        }
        else{
          def.color = sigma.visual_settings.node.defaultColor;
          def.color_node = sigma.utils.floatColor(sigma.visual_settings.node.defaultColor);
        }

        if(sigma.visual.rangeColorNode){
          def.color_ranger = sigma.utils.getMaskedValue(node, this.mask, sigma.visual_settings.node.rangers.coloring.field);
          if(typeof def.color_ranger == 'undefined'){
            def.color_ranger = 0;
          }
        }
        if(sigma.visual_settings.node.label) {
          def.label = sigma.utils.getMaskedValue(node, this.mask, sigma.visual_settings.node.label);
        }

        if(node.size){
          def.size = node.size;
        }
        
        this.nodes.push($.extend(def, node));

        // info for center graph by lat lag
        var currentLat = parseFloat(sigma.utils.getMaskedValue(node, null, 'lat'));
        var currentLng = parseFloat(sigma.utils.getMaskedValue(node, null, 'lng'));
        if(!this.lat.max){
          this.lat = {
            max: currentLat,
            min: currentLat
          };
          this.lng = {
            max: currentLng,
            min: currentLng
          };
        }
        else {
          if(this.lat.max < currentLat)
            this.lat.max = currentLat;
          if(this.lat.min > currentLat)
            this.lat.min = currentLat;

          if(this.lng.max < currentLng)
            this.lng.max = currentLng;
          if(this.lng.min > currentLng)
            this.lng.min = currentLng;
        }
      },
      addEdge: function(edge){
        var def = JSON.parse(JSON.stringify(this.defaultEdge));

        if(sigma.visual.rangeColorEdge){
          def.color_ranger = sigma.utils.getMaskedValue(edge, this.mask, sigma.visual_settings.edge.rangers.coloring.field);
          if(typeof def.color_ranger == 'undefined'){
            def.color_ranger = 0;
          }
        }

        if(sigma.visual_settings.edge.label)
          def.label = sigma.utils.getMaskedValue(edge, this.mask, sigma.visual_settings.edge.label) || 'use strict';
        this.edges.push($.extend(def, edge));
      },
      validateNodeSizes: function(bounds, minmax){
        sigma.utils.evaluateBounds(
          this.nodes,
          bounds,
          minmax
        );
      }
    },
    activated: null,
    init: function(containers, settings){
      var self = this;
      if(!containers)
        throw 'Containers not initialized';
      var keys = Object.keys(containers);
      for(var key in keys){
        this[keys[key]].init(containers[keys[key]], settings);
      }
      window.addEventListener('resize', function() {
        self.updateSizeBox();
      });
    },
    getInstance: function(){
      return this[this.activated].instance;
    },
    isStandartCaptor: function(){
      return this[this.activated].isStandartCaptor();
    },
    updateSizeBox: function(){
      this[this.activated].updateSizeBox();
    },
    getSizeBox: function(){
      return this[this.activated].getSizeBox();
    },
    getBox: function(){
      return this[this.activated].getBox();
    },
    instanceData: function(instance){
      if(!instance)
        return {nodes: [], edges: []};
      return {nodes: instance.graph.nodes(), edges: instance.graph.edges()};
    },
    activate: function(modeStr, graphData){
      if(!modeStr || modeStr == this.activated)
        return;
      var old = this.activated;
      var oldData;
      if(old) {
        oldData = this.instanceData(this[old].instance);
        this[old].deactivate();
      }
      this.activated = modeStr;
      this[modeStr].activate(graphData || oldData);
    }
  };
}).call(this);