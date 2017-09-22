;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.labels');

  /**
   * This label renderer will just display the label on the right of the node.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.labels.modelling = function(node, context, settings) {
    var fontSize,
      prefix = settings('prefix') || '',
      size = node[prefix + 'size'];

    if (size < settings('labelThreshold'))
      return;

    if (!node.label || typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
    settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');




    // do BG
    context.beginPath();
    context.fillStyle = settings('labelHoverBGColor') === 'node' ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultHoverLabelBGColor');
    var x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
    var y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);
    var w = Math.round(
      context.measureText(node.label).width + fontSize / 2 + size + 7
    );
    var e = Math.round(fontSize / 2 + 2);

    var node_x = Math.round(node[prefix + 'x']);

    context.moveTo(node_x + size + 2, y + e);
    context.arcTo(node_x + size + 2, y + 2*e, node_x + size + 2 + e, y + 2*e, e/2);
    context.lineTo(node_x + size + w - 2*e, y + 2*e);
    context.arcTo(node_x + size + w - e, y + 2*e, node_x + size + w - e, y + e, e/2);
    context.arcTo(node_x + size + w - e, y, node_x + size + w - 2 - 2*e, y, e/2);
    context.lineTo(node_x + size + 2 + e, y);
    context.arcTo(node_x + size + 2, y, node_x + size + 2, y + 2*e, e/2);

    context.closePath();
    context.fill();

    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');
    context.fillText(
      node.label,
      Math.round(node[prefix + 'x'] + size + 3),
      Math.round(node[prefix + 'y'] + fontSize / 3)
    );
  };
}).call(this);
