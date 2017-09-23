var graphHandler = window.graphHandler = {
  isMouseDown: false,
  startMouseX: 0,
  startMouseY: 0,
  currentMouseX: 0,
  currentMouseY: 0,
  isdrag: false,
  dragStartHandler: function(e) {
    graphHandler.isdrag = true;
  },
  dragEndHandler: function(e) {
    graphHandler.isdrag = false;
  },
  moveHandler: function(e){
    if (graphHandler.isMouseDown && !graphHandler.isdrag) {
      graphHandler.currentMouseX = e.clientX;
      graphHandler.currentMouseY = e.clientY;
      var container = sigma.mode.getBox();
      $(container).css('left', (graphHandler.currentMouseX - graphHandler.startMouseX).toString() + 'px');
      $(container).css('top', (graphHandler.currentMouseY - graphHandler.startMouseY).toString() + 'px');
    }

  },
  wheelHandler: function(e) {
    var pos,
      ratio;

    var instance = sigma.mode.getInstance();
    ratio = sigma.utils.getDelta(e) > 0 ?
    1 / instance.settings('zoomingRatio') :
      instance.settings('zoomingRatio');

    pos = instance.camera.cameraPosition(
      sigma.utils.getX(e) - sigma.utils.getCenter(e).x,
      sigma.utils.getY(e) - sigma.utils.getCenter(e).y,
      true
    );
    sigma.utils.zoomTo(instance.camera, pos.x, pos.y, ratio);
    if (e.preventDefault)
      e.preventDefault();
    else
      e.returnValue = false;

    e.stopPropagation();
    return false;
  },
  downHandler: function (e) {
    if (graphHandler.isdrag)
      return;
    graphHandler.startMouseX = e.clientX;
    graphHandler.startMouseY = e.clientY;
    graphHandler.currentMouseX = e.clientX;
    graphHandler.currentMouseY = e.clientY;
    // console.log({'x': graphHandler.startMouseX, 'y': graphHandler.startMouseY});
    switch (e.which) {
      case 2:
        // Middle mouse button pressed
        break;
      case 3:
        // Right mouse button pressed
        break;
      default:
        // Left mouse button pressed
        graphHandler.isMouseDown = true;
    }
  },
  upHandler: function(e){
    if (graphHandler.isdrag)
      return;
    switch (e.which) {
      case 2:
        // Middle mouse button pressed
        break;
      case 3:
        // Right mouse button pressed
        break;
      default:
        // Left mouse button pressed
        graphHandler.isMouseDown = false;
        var container = sigma.mode.getBox();
        $(container).css('left', '0px');
        $(container).css('top', '0px');

        graphHandler.currentMouseX = e.clientX;
        graphHandler.currentMouseY = e.clientY;

        var diff = {
          x: (graphHandler.currentMouseX - graphHandler.startMouseX),
          y: (graphHandler.currentMouseY - graphHandler.startMouseY)
        };

        var instance = sigma.mode.getInstance();
        var cameraPos = {
          x: (instance.camera.x - (diff.x) * instance.camera.ratio),
          y: (instance.camera.y - (diff.y) * instance.camera.ratio),
          ratio: instance.camera.ratio
        };
        instance.camera.goTo(cameraPos);
    }
  }
};
