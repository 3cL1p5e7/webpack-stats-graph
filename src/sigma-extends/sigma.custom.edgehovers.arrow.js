;(function() {
  'use strict';

  sigma.utils.pkg('sigma.canvas.edgehovers');

  /**
   * This hover renderer will display the edge with a different color or size.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.edgehovers.modelling =
    function(edge, source, target, context, settings) {
      var color = edge.color,
        prefix = settings('prefix') || '',
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        size = edge[prefix + 'size'] || 1,
        tSize = target[prefix + 'size'],
        sX = source[prefix + 'x'],
        sY = source[prefix + 'y'],
        tX = target[prefix + 'x'],
        tY = target[prefix + 'y'];

      size = (edge.hover) ?
      settings('edgeHoverSizeRatio') * size : size;
      var arrowSize = (settings('edgeArrowHoverSizeRatio') || 3.5) * 2.5;

      var aSize = size * 2.5,
        d = Math.sqrt(Math.pow(tX - sX, 2) + Math.pow(tY - sY, 2)),
        arX = sX + (tX - sX) * (d - arrowSize - tSize) / d,
        arY = sY + (tY - sY) * (d - arrowSize - tSize) / d,
        vX = (tX - sX) * arrowSize / d,
        vY = (tY - sY) * arrowSize / d;

      if (!color)
        switch (edgeColor) {
          case 'source':
            color = source.color || defaultNodeColor;
            break;
          case 'target':
            color = target.color || defaultNodeColor;
            break;
          default:
            color = defaultEdgeColor;
            break;
        }

      if (settings('edgeHoverColor') === 'edge') {
        color = edge.hover_color || color;
      } else {
        color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
      }

      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(sX, sY);
      context.lineTo(
        arX,
        arY
      );
      context.stroke();

      context.fillStyle = settings('defaultEdgeArrowColor') ||  '#000000';
      context.beginPath();
      context.moveTo(arX + vX, arY + vY);
      context.lineTo(arX + vY * 0.6, arY - vX * 0.6);
      context.lineTo(arX - vY * 0.6, arY + vX * 0.6);
      context.lineTo(arX + vX, arY + vY);
      context.closePath();
      context.fill();

      sigma.canvas.edges.labels.modelling(edge, source, target, context, settings);
    };
})();
