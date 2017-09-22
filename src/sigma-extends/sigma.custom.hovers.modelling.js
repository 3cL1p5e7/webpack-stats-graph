;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.hovers');

  /**
   * This hover renderer will basically display the label with a background.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.hovers.modelling = function(node, context, settings) {
    var x,
      y,
      w,
      h,
      e,
      fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
      prefix = settings('prefix') || '',
      size = node[prefix + 'size'],
      fontSize = (settings('labelSize') === 'fixed') ?
        settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;

    // Label background:
    context.font = (fontStyle ? fontStyle + ' ' : '') +
      fontSize + 'px ' + (settings('hoverFont') || settings('font'));

    context.beginPath();
    context.fillStyle = settings('labelHoverBGColor') === 'node' ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultHoverLabelBGColor');

    if (node.label && settings('labelHoverShadow')) {
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 8;
      context.shadowColor = settings('labelHoverShadowColor');
    }

    if (node.label && typeof node.label === 'string') {
      x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
      y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);
      w = Math.round(
        context.measureText(node.label).width + fontSize / 2 + size + 7
      );
      e = Math.round(fontSize / 2 + 2);

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

      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 0;
    }

    // Node border:
    if (settings('borderSize') > 0) {
      context.beginPath();
      context.fillStyle = settings('nodeBorderColor') === 'node' ?
        (node.color || settings('defaultNodeColor')) :
        settings('defaultNodeBorderColor');
      context.arc(
        node[prefix + 'x'],
        node[prefix + 'y'],
        size + settings('borderSize'),
        0,
        Math.PI * 2,
        true
      );
      context.closePath();
      context.fill();
    }

    // Node:
    var nodeRenderer = sigma.canvas.nodes[node.type] || sigma.canvas.nodes.def;
    nodeRenderer(node, context, settings);

    // Display the label:
    if (node.label && typeof node.label === 'string') {
      context.fillStyle = (settings('labelHoverColor') === 'node') ?
        (node.color || settings('defaultNodeColor')) :
        settings('defaultLabelHoverColor');

      context.fillText(
        node.label,
        Math.round(node[prefix + 'x'] + size + 3),
        Math.round(node[prefix + 'y'] + fontSize / 3)
      );
    }
  };
}).call(this);
