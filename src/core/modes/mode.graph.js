;(function(undefined) {
  'use strict';

  sigma.mode.graph = {
    instance: null,
    container: null,
    settings: {autoRescale: true},
    standartCaptor: false,

    sizeBox: {},

    init: function(container, settings){
      if(!container)
        throw 'Graph container not initialized';
      this.container = container;
      this.settings = $.extend({}, this.settings, settings);
    },
    activate: function(graphData){
      var currentBox = $(this.getBox());

      currentBox.show();
      sigma.mode.graphManager.init(graphData.model);
      this.initData(graphData);

      currentBox.width($(window).width());
      currentBox.height($(window).height());
      currentBox.parent().width($(window).width());
      currentBox.parent().height($(window).height());

      this.instance = new sigma({
        graph: sigma.mode.graphManager.getGraph(),
        renderer: {
          container: $(this.container)[0]
        },
        settings: this.settings
      });

      if(!this.isStandartCaptor()){
        var parent = currentBox.parent()[0];
        parent.addEventListener('DOMMouseScroll', graphHandler.wheelHandler, false);
        parent.addEventListener('mousemove', graphHandler.moveHandler, false);
        parent.addEventListener('mousewheel', graphHandler.wheelHandler, false);
        parent.addEventListener('mousedown', graphHandler.downHandler, false);
        parent.addEventListener('mouseup', graphHandler.upHandler, false);
      }

      this.updateSizeBox();
      console.log('ready');
    },
    deactivate: function(){
      var currentBox = $(this.getBox());
      if(!this.isStandartCaptor()){
        var parent = currentBox.parent()[0];
        parent.removeEventListener('DOMMouseScroll', graphHandler.wheelHandler, false);
        parent.removeEventListener('mousemove', graphHandler.moveHandler, false);
        parent.removeEventListener('mousewheel', graphHandler.wheelHandler, false);
        parent.removeEventListener('mousedown', graphHandler.downHandler, false);
        parent.removeEventListener('mouseup', graphHandler.upHandler, false);
      }
      currentBox.empty().hide(); // TODO comment me plz
      if(this.instance) this.instance.kill();
    },
    isStandartCaptor: function() {
      return this.standartCaptor;
    },
    updateSizeBox: function(){
      this.sizeBox = {'height': $(this.container).height(), 'width': $(this.container).width()};
    },
    getSizeBox: function(){
      return this.sizeBox;
    },
    getBox: function(){
      return $(this.container)[0];
    },
    initData: function(data){
      sigma.utils.updateLoaderText('Process data nodes');
      console.log('start nodes');

      var sizeBox = [0, 0];
      var graphManager = sigma.mode.graphManager;
      for (var i = 0; i < data.nodes.length; i++) {
        if(data.nodes[i][sigma.mode.mask]){
          _.each(data.nodes[i][sigma.mode.mask], function (value, key) {
            if(graphManager.model.node[key])
              data.nodes[i][sigma.mode.mask] = sigma.utils.renameProperty(data.nodes[i][sigma.mode.mask], key, graphManager.model.node[key]);
          });
        }

        var geo_latitude = sigma.utils.getMaskedValue(data.nodes[i], sigma.mode.mask, 'geo_latitude');
        var geo_longitude = sigma.utils.getMaskedValue(data.nodes[i], sigma.mode.mask, 'geo_longitude');

        sigma.mode.graphManager.addNode({
          id: data.nodes[i].id,
          url: null,
          label: data.nodes[i]['label'] || '',
          lat: geo_latitude,
          lng: geo_longitude,
          x: data.nodes[i].x || geo_latitude || Math.random()*1000,
          y: data.nodes[i].y || geo_longitude || Math.random()*1000,
          size: data.nodes[i]['size'],
          color: data.nodes[i]['color'] || '#3482B9',
          value: data.nodes[i][sigma.mode.mask]
        });

        if (sizeBox[0] >= data.nodes[i]['size'])
          sizeBox[0] = data.nodes[i]['size'];
        if (sizeBox[1] <= data.nodes[i]['size'])
          sizeBox[1] = data.nodes[i]['size'];
      }
      sigma.mode.graphManager.validateNodeSizes(sizeBox, [sigma.visual_settings.node.min_size, sigma.visual_settings.node.max_size]);
      console.log('nodes success');

      sigma.utils.updateLoaderText('Process data edges');
      console.log('start edges');
      for (i = 0; i < data.edges.length; i++) {
        sigma.mode.graphManager.addEdge({
          id: data.edges[i].id,
          source: data.edges[i].u || data.edges[i].source,
          target: data.edges[i].v || data.edges[i].target,
          value: data.edges[i][sigma.mode.mask] || {},
          label: sigma.utils.getMaskedValue(data.edges[i], sigma.mode.mask, 'label') || ''
        });
      }
      console.log('edges success');
      console.log('fill data ready');
      sigma.utils.updateLoaderText('Data processing: success');
    }
  };
}).call(this);