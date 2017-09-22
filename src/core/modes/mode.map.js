;(function(undefined) {
  'use strict';

  sigma.mode.map = {
    instance: null,
    container: null,

    mapBox: '#leaf-map',
    defaultCenter: [56.0487578359952, 37.60345458984374],
    initZoom: 18,
    settings: {autoRescale: false},
    startZoom: 7,

    sizeBox: {},

    init: function(container, settings){
      if(!container)
        throw 'Map container not initialized';
      this.container = container;
      this.settings = $.extend({}, this.settings, settings);
    },
    activate: function(graphData){
      $(this.mapBox).show();

      sigma.mode.graphManager.init(graphData.model);

      this.initLeaflet(this.initZoom);
      var success = this.initData(graphData);

      if(!success){
        sigma.mode.activate('graph', graphData);
        return;
      }

      this.instance = new sigma({
        graph: sigma.mode.graphManager.getGraph(),
        renderer: {
          container: $(this.container)[0]
        },
        settings: this.settings
      });
      map.setView(sigma.utils.getCenterGraph(sigma.mode.graphManager.lat, sigma.mode.graphManager.lng)
                                              || L.latLng(this.defaultCenter[0], this.defaultCenter[1]));
      
      map.on('zoomend', mapHandler.zoomHandler);
      map.on('moveend', mapHandler.moveHandler);

      map.setZoom(this.startZoom); // start zooming
      this.updateSizeBox();
      console.log('ready');
    },
    deactivate: function(){
      map.off('zoomend', mapHandler.zoomHandler);
      map.off('moveend', mapHandler.moveHandler);
      map.remove();
      $(this.mapBox).hide();
      if(this.instance) this.instance.kill();
    },
    isStandartCaptor: function() {
      return false;
    },
    updateSizeBox: function(){
      this.sizeBox = {'width': map.getSize().x || 0, 'height': map.getSize().y || 0};
    },
    getSizeBox: function(){
      return this.sizeBox;
    },
    getBox: function(){
      return $(this.mapBox)[0];
    },
    initData: function(data){
      console.log('start nodes');
      var sizeBox = [];
      var graphManager = sigma.mode.graphManager;
      for (var i = 0; i < data.nodes.length; i++) {
        if(data.nodes[i][sigma.mode.mask]){
          _.each(data.nodes[i][sigma.mode.mask], function (value, key) {
            if(graphManager.model.node[key])
              data.nodes[i][sigma.mode.mask] = sigma.utils.renameProperty(data.nodes[i][sigma.mode.mask], key, graphManager.model.node[key]);
          });
        }
        var coords = {};
        var latLng = {
          lat: data.nodes[i][sigma.mode.mask].geo_latitude || data.nodes[i].lat,
          lng: data.nodes[i][sigma.mode.mask].geo_longitude || data.nodes[i].lng
        };
        if(latLng.lat && latLng.lng) {
          coords = map.latLngToLayerPoint(L.latLng(latLng.lat, latLng.lng));
          coords = {
            x: (coords.x - $(this.mapBox).width()/2),
            y: (coords.y - $(this.mapBox).height()/2)
          };
        }
        else{
          coords = {
            x: data.nodes[i].x || Math.random() * 1000,
            y: data.nodes[i].y || Math.random() * 1000
          };
          return false;
        }
        graphManager.addNode({
          id: data.nodes[i].id,
          url: null,
          label: data.nodes[i]['label'] || '',
          x: coords.x,
          y: coords.y,
          size: data.nodes[i]['size'],
          lat: latLng.lat,
          lng: latLng.lng,
          value: data.nodes[i][sigma.mode.mask]
        });
        if (!sizeBox[0] || sizeBox[0] >= data.nodes[i]['size'])
          sizeBox[0] = data.nodes[i]['size'];
        if (!sizeBox[1] || sizeBox[1] <= data.nodes[i]['size'])
          sizeBox[1] = data.nodes[i]['size'];
        if (sizeBox[0] === sizeBox[1]) {
          sizeBox[0] -= 1;
          sizeBox[1] += 1;
        }
      }
      sigma.mode.graphManager.validateNodeSizes(sizeBox, [sigma.visual_settings.node.min_size, sigma.visual_settings.node.max_size]);
      console.log('nodes success');

      console.log('start edges');
      for (i = 0; i < data.edges.length; i++) {
        graphManager.addEdge({
          id: data.edges[i].id,
          source: data.edges[i].u || data.edges[i].source,
          target: data.edges[i].v || data.edges[i].target,
          value: data.edges[i][sigma.mode.mask],
          label: sigma.utils.getMaskedValue(data.edges[i], sigma.mode.mask, 'label') || data.edges[i]['label'] || ''
        });
      }
      console.log('fill data ready');
      return true;
    },

    initLeaflet: function(initZoom){
      var data = {};
      data.accessToken = 'pk.eyJ1IjoiM2NsMXA1ZTciLCJhIjoiY2o3d2JuM3E2NWJpaDJ5bWxlNzRmbzljcCJ9.2m_lloETB2gB6xRQGaIUeQ';

      var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>';
      // var mbUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      var mbUrl = `https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}`;

      var streets = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr, accessToken: data.accessToken}),
        grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr, accessToken: data.accessToken}),
        satellitehyb = L.tileLayer(mbUrl, {id: 'mapbox.streets-satellite',   attribution: mbAttr, accessToken: data.accessToken});

      var mapBox = $(this.mapBox);
      mapBox.height($(window).height());
      mapBox.width($(window).width());

      var map = window.map = L.map(mapBox[0].id, {
        center: this.defaultCenter, // moscow
        zoom: initZoom,
        layers: [streets]
      });

      var size = map.getSize();
      $(this.container).height(size.y);
      $(this.container).width(size.x);
  }
  };
}).call(this);