var mapHandler = window.mapHandler = {
  lastZoom: 18,
  zoomed: false,
  moveHandler: function(e){
    if(mapHandler.zoomed) {
      mapHandler.zoomed = false;
      return;
    }
    var instance = sigma.mode.getInstance();

    var pos = map._getMapPanePos();
    $(sigma.mode.map.container).css('transform', 'translate3d(' + (-pos.x).toString() + 'px, ' + (-pos.y).toString() + 'px, 0px)');

    var checkByNode = instance.graph.nodes()[0];
    var nodeOnGraph = instance.camera.graphPosition(checkByNode.x, checkByNode.y);
    var nodeOnCanvas = {
      x: nodeOnGraph.x + (map.getSize().x/2),
      y: nodeOnGraph.y + (map.getSize().y/2)
    };
    var nodeOnMap = map.latLngToContainerPoint(L.latLng(checkByNode.lat, checkByNode.lng));

    var cameraPos = {
      x: (instance.camera.x + (nodeOnCanvas.x - nodeOnMap.x) * instance.camera.ratio),
      y: (instance.camera.y + (nodeOnCanvas.y - nodeOnMap.y) * instance.camera.ratio),
      ratio: instance.camera.ratio
    };

    instance.camera.goTo(cameraPos);
    console.log('move!');
  },
  zoomHandler: function(e){
    mapHandler.zoomed = true;

    var instance = sigma.mode.getInstance();

    var targetZoom = e.target.getZoom();
    var scaleCoeff = Math.pow(2, targetZoom - mapHandler.lastZoom);

    var ratio = Math.pow(2, sigma.mode.map.initZoom - (targetZoom));
    var checkByNode = instance.graph.nodes()[0];
    var nodeOnGraph = instance.camera.graphPosition(checkByNode.x, checkByNode.y);
    var nodeOnCanvas = {
      x: (scaleCoeff*nodeOnGraph.x  + (map.getSize().x/2)),
      y: (scaleCoeff*nodeOnGraph.y  + (map.getSize().y/2))
    };
    var nodeOnMap = map.latLngToContainerPoint(L.latLng(checkByNode.lat, checkByNode.lng));

    var cameraPos = {
      x: (instance.camera.x + (nodeOnCanvas.x - nodeOnMap.x) * ratio),
      y: (instance.camera.y + (nodeOnCanvas.y - nodeOnMap.y) * ratio),
      ratio: ratio
    };

    instance.camera.goTo(cameraPos);
    mapHandler.lastZoom = targetZoom;
    console.log('zoom!');
  }
};
