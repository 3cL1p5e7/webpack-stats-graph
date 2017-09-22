var images = [];
function loadImages(urls, callback) {
  var imagesToLoad = urls.length;

  // Called each time an image finished loading.
  var onImageLoad = function() {
    --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad == 0) {
      callback(images);
    }
  };

  for (var ii = 0; ii < imagesToLoad; ++ii) {
    var image = new Image();
    image.src = urls[ii];
    image.onload = onImageLoad;
    images.push(image);
  }
}

sigma.utils.loadNewProgram = function(gl, shaders, attribs, locations, error) {
  var i,
    linked,
    program = gl.createProgram();

  for (i = 0; i < shaders.length; ++i)
    gl.attachShader(program, shaders[i]);

  gl.linkProgram(program);

  if (attribs)
    for (i = 0; i < attribs.length; ++i)
      gl.bindAttribLocation(
        program,
        locations ? locations[i] : i,
        attribs[i]
      );

  // Check the link status
  linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    if (error)
      error('Error in program linking: ' + gl.getProgramInfoLog(program));

    gl.deleteProgram(program);
    return null;
  }

  return program;
};

var floatColorCacheA = {};
sigma.utils.floatColorA = function(color){
  var original = color,
                 r = 0,
                 g = 0,
                 b = 0;

  // Is the color already computed?
  if (floatColorCacheA[color])
    return floatColorCacheA[color];

  if (color[0] === '#') {
    color = color.slice(1);

    if (color.length === 3) {
      r = parseInt(color.charAt(0) + color.charAt(0), 16);
      g = parseInt(color.charAt(1) + color.charAt(1), 16);
      b = parseInt(color.charAt(2) + color.charAt(2), 16);
    }
    else {
      r = parseInt(color.charAt(0) + color.charAt(1), 16);
      g = parseInt(color.charAt(2) + color.charAt(3), 16);
      b = parseInt(color.charAt(4) + color.charAt(5), 16);
    }
  }
  else if (color.match(/^ *rgba? *\(/)) {
    color = color.match(
      /^ *rgba? *\( *([0-9]*) *, *([0-9]*) *, *([0-9]*) *(,.*)?\) *$/
    );
    r = +color[1];
    g = +color[2];
    b = +color[3];
  }

  return {r: r, g: g, b: b};
};

sigma.utils.calcCamNode = function(node, prefix){
  var instance = sigma.mode.getInstance();
  var box = sigma.mode.getSizeBox();
  if(!instance || !instance.camera)
    return node;
  var camera = instance.camera;
  var relCos = Math.cos(camera.angle) / camera.ratio,
    relSin = Math.sin(camera.angle) / camera.ratio,
    nodeRatio = Math.pow(camera.ratio, camera.settings('nodesPowRatio')),
    xOffset = box.width / 2 - camera.x * relCos - camera.y * relSin,
    yOffset = box.height / 2 - camera.y * relCos + camera.x * relSin;
    node[prefix + 'x'] =
        (node['read_' + prefix + 'x'] || 0) * relCos +
        (node['read_' + prefix + 'y'] || 0) * relSin +
      xOffset;
    node[prefix + 'y'] =
        (node['read_' + prefix + 'y'] || 0) * relCos -
        (node['read_' + prefix + 'x'] || 0) * relSin +
      yOffset;
    node[prefix + 'size'] =
      (node['read_' + prefix + 'size'] || 0) /
      nodeRatio;
  return node;
};

sigma.utils.getFieldBounds = function (field, list) {
  var defaultValue = 6;
  var min = 0;
  var max = 10;
  if(field) {
    min = _.min(list, function (elem) {
        return parseFloat(elem.value[field]) || 0.0001;
      }).value[field] || 0.0001;
    max = _.max(list, function (elem) {
        return parseFloat(elem.value[field]) || 0.0001;
      }).value[field] || 0.0001;

    if (min == max)
      max = min + 10.0;
    defaultValue = 0.0001;
  }

  min = parseFloat(min);
  max = parseFloat(max);

  if(isNaN(min))
    min = 0.0001;
  if(isNaN(max))
    max = 10.0;

  return {min: min, max: max, defaultValue: defaultValue};
};

sigma.utils.darkerColor = function (rgbObj, lighter) {
  if(typeof rgbObj == 'string'){
    rgbObj = sigma.utils.floatColorA(rgbObj);
  }

  if(typeof rgbObj == 'object'){
    var hsl = sigma.utils.rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
    hsl[2] = hsl[2]*lighter;
    rgbObj = sigma.utils.hslToRgb(hsl[0], hsl[1], hsl[2]);
  }

  return 'rgba(' + rgbObj.r + ', ' + rgbObj.g + ', ' + rgbObj.b + ', 1.0)';
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
sigma.utils.rgbToHsl = function(r, g, b){
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
    h = s = 0; // achromatic
  }else{
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Object           The RGB representation
 */
sigma.utils.hslToRgb = function(h, s, l){
  var r, g, b;

  if(s == 0){
    r = g = b = l; // achromatic
  }else{
    function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {r: Math.floor(r * 255), g: Math.floor(g * 255), b: Math.floor(b * 255)};
};

sigma.utils.randomColor = function(){
  return 'rgba(' + Math.floor(255*Math.random()) + ', '
    + Math.floor(255*Math.random()) + ', '
    + Math.floor(255*Math.random()) + ', 1.0)';
};

sigma.utils.getMaskedValue = function (obj, mask, field) {
  if(!obj)
    return obj;

  if(!mask || mask == '')
    return obj[field];

  if(typeof obj[mask] != 'undefined')
    return obj[mask][field];
  else return obj[field];
};

sigma.utils.getCenterGraph = function(lats, lngs){
  if(lats.max && lats.min && lngs.max && lngs.min){
    return L.latLng(lats.min + (lats.max - lats.min) / 2,
      lngs.min + (lngs.max - lngs.min) / 2);
  }
};

sigma.utils.queryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}();

sigma.utils.loader = function(isShow){
  isShow ? $('.spinner-text').show() : $('.spinner-text').hide();
};

sigma.utils.updateLoaderText = function (text) {
  $('.message').html(text);
};

sigma.utils.fetchFile = function(filename, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', filename, true);
  xhr.send();

  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;

    if (xhr.status != 200) {
      console.error( xhr.status + ': ' + xhr.statusText );
    } else {
      callback(xhr.responseText);
    }
  };
};

sigma.utils.evaluateBounds = function (elements, bounds, minmax) {
  var getSize = function(element){
    var size = element.size;
    if (!size)
      return minmax[0];
    size = minmax[0] +
      (minmax[1] - minmax[0]) * (size - bounds[0]) / (bounds[1] - bounds[0]);
    return size;
  };

  for(var i=0; i < elements.length; i++) {
    elements[i].size = getSize(elements[i]);
  }
};