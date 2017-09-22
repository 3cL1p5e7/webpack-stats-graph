;(function() {
  'use strict';

  sigma.utils.pkg('sigma.webgl.edges');

  /**
   * This edge renderer will display edges as arrows going from the source node
   * to the target node. To deal with edge thicknesses, the lines are made of
   * three triangles: two forming rectangles, with the gl.TRIANGLES drawing
   * mode.
   *
   * It is expensive, since drawing a single edge requires 9 points, each
   * having a lot of attributes.
   */
  var black = sigma.utils.floatColor('#000000');
  sigma.webgl.edges.modelling = {
    POINTS: 9,
    ATTRIBUTES: 14,
    addEdge: function(edge, source, target, data, i, prefix, settings) {
      var w = (edge[prefix + 'size'] || 1) / 2,
          x1 = source[prefix + 'x'],
          y1 = source[prefix + 'y'],
          x2 = target[prefix + 'x'],
          y2 = target[prefix + 'y'];

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = target[prefix + 'size'];
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = edge['color_edge'];
      data[i++] = edge['transparency_edge'];
      data[i++] = edge['color_ranger'];
      data[i++] = 0.0;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = target[prefix + 'size'];
      data[i++] = 1.0;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = edge['color_edge'];
      data[i++] = edge['transparency_edge'];
      data[i++] = edge['color_ranger'];
      data[i++] = 0.0;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = target[prefix + 'size'];
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = edge['color_edge'];
      data[i++] = edge['transparency_edge'];
      data[i++] = edge['color_ranger'];
      data[i++] = 0.0;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = target[prefix + 'size'];
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = edge['color_edge'];
      data[i++] = edge['transparency_edge'];
      data[i++] = edge['color_ranger'];
      data[i++] = 0.0;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = target[prefix + 'size'];
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = edge['color_edge'];
      data[i++] = edge['transparency_edge'];
      data[i++] = edge['color_ranger'];
      data[i++] = 0.0;

      data[i++] = x1;
      data[i++] = y1;
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = w;
      data[i++] = target[prefix + 'size'];
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = 0.0;
      data[i++] = edge['color_edge'];
      data[i++] = edge['transparency_edge'];
      data[i++] = edge['color_ranger'];
      data[i++] = 0.0;

      // Arrow head:
      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = target[prefix + 'size'];
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = -1.0;
      data[i++] = black; //color;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = target[prefix + 'size'];
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = black; //color;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;

      data[i++] = x2;
      data[i++] = y2;
      data[i++] = x1;
      data[i++] = y1;
      data[i++] = w;
      data[i++] = target[prefix + 'size'];
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
      data[i++] = 1.0;
      data[i++] = black; //color;
      data[i++] = 1.0;
      data[i++] = 0.0;
      data[i++] = 1.0;
    },
    render: function(gl, program, data, params) {
      var buffer;

      // Define attributes:
      var positionLocation1 =
            gl.getAttribLocation(program, 'a_pos1'),
          positionLocation2 =
            gl.getAttribLocation(program, 'a_pos2'),
          thicknessLocation =
            gl.getAttribLocation(program, 'a_thickness'),
          targetSizeLocation =
            gl.getAttribLocation(program, 'a_tSize'),
          delayLocation =
            gl.getAttribLocation(program, 'a_delay'),
          minusLocation =
            gl.getAttribLocation(program, 'a_minus'),
          headLocation =
            gl.getAttribLocation(program, 'a_head'),
          headPositionLocation =
            gl.getAttribLocation(program, 'a_headPosition'),
          colorLocation =
            gl.getAttribLocation(program, 'a_color'),
          transparencyLocation =
            gl.getAttribLocation(program, 'a_transparency'),
          rangerLocation =
            gl.getAttribLocation(program, 'a_range_by'),
          isArrowLocation =
            gl.getAttribLocation(program, 'a_is_arrow'),
          resolutionLocation =
            gl.getUniformLocation(program, 'u_resolution'),
          matrixLocation =
            gl.getUniformLocation(program, 'u_matrix'),
          matrixHalfPiLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPi'),
          matrixHalfPiMinusLocation =
            gl.getUniformLocation(program, 'u_matrixHalfPiMinus'),
          ratioLocation =
            gl.getUniformLocation(program, 'u_ratio'),
          nodeRatioLocation =
            gl.getUniformLocation(program, 'u_nodeRatio'),
          arrowHeadLocation =
            gl.getUniformLocation(program, 'u_arrowHead'),
          scaleLocation =
            gl.getUniformLocation(program, 'u_scale'),
          rangeFrom =
            gl.getUniformLocation(program, 'u_range_from_color'),
          rangeTo =
            gl.getUniformLocation(program, 'u_range_to_color'),
          rangeMin =
            gl.getUniformLocation(program, 'u_range_min'),
          rangeMax =
            gl.getUniformLocation(program, 'u_range_max');

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

      gl.uniform2f(resolutionLocation, params.width, params.height);
      gl.uniform1f(
        ratioLocation,
        params.ratio / Math.pow(params.ratio, params.settings('edgesPowRatio'))
      );
      gl.uniform1f(
        nodeRatioLocation,
        Math.pow(params.ratio, params.settings('nodesPowRatio')) /
        params.ratio
      );
      gl.uniform1f(arrowHeadLocation, sigma.visual_settings.edge.arrowSize);
      gl.uniform1f(scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(matrixLocation, false, params.matrix);
      gl.uniformMatrix2fv(
        matrixHalfPiLocation,
        false,
        sigma.utils.matrices.rotation(Math.PI / 2, true)
      );
      gl.uniformMatrix2fv(
        matrixHalfPiMinusLocation,
        false,
        sigma.utils.matrices.rotation(-Math.PI / 2, true)
      );

      if(sigma.visual.rangeColorEdge) {
        if (sigma.visual.inverseColorEdge) {
          gl.uniform1f(rangeFrom, sigma.utils.floatColor(sigma.visual_settings.edge.rangers.coloring.range[1]));
          gl.uniform1f(rangeTo, sigma.utils.floatColor(sigma.visual_settings.edge.rangers.coloring.range[0]));
        }
        else {
          gl.uniform1f(rangeFrom, sigma.utils.floatColor(sigma.visual_settings.edge.rangers.coloring.range[0]));
          gl.uniform1f(rangeTo, sigma.utils.floatColor(sigma.visual_settings.edge.rangers.coloring.range[1]));
        }
      }
      else{
        gl.uniform1f(rangeFrom, sigma.utils.floatColor(sigma.visual_settings.edge.defaultColor));
        gl.uniform1f(rangeTo, sigma.utils.floatColor(sigma.visual_settings.edge.defaultColor));
      }

      var instance = sigma.mode.getInstance();
      var coloring = {};
      if(sigma.visual.rangeColorEdge) { // ranger enabled
        if (instance)
          coloring = sigma.utils.getFieldBounds(sigma.visual_settings.edge.rangers.coloring.field, instance.graph.edges());
        else
          coloring = {min: 0.0, max: 10.0};
      }
      else { // ranger disabled
        coloring = {min: 0.0, max: 0.0};
      }
      gl.uniform1f(rangeMin, coloring.min);
      gl.uniform1f(rangeMax, coloring.max);

      gl.enableVertexAttribArray(positionLocation1);
      gl.enableVertexAttribArray(positionLocation2);
      gl.enableVertexAttribArray(thicknessLocation);
      gl.enableVertexAttribArray(targetSizeLocation);
      gl.enableVertexAttribArray(delayLocation);
      gl.enableVertexAttribArray(minusLocation);
      gl.enableVertexAttribArray(headLocation);
      gl.enableVertexAttribArray(headPositionLocation);
      gl.enableVertexAttribArray(colorLocation);
      gl.enableVertexAttribArray(transparencyLocation);
      gl.enableVertexAttribArray(rangerLocation);
      gl.enableVertexAttribArray(isArrowLocation);

      gl.vertexAttribPointer(positionLocation1,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.vertexAttribPointer(positionLocation2,
        2,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        8
      );
      gl.vertexAttribPointer(thicknessLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        16
      );
      gl.vertexAttribPointer(targetSizeLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        20
      );
      gl.vertexAttribPointer(delayLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        24
      );
      gl.vertexAttribPointer(minusLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        28
      );
      gl.vertexAttribPointer(headLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        32
      );
      gl.vertexAttribPointer(headPositionLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        36
      );
      gl.vertexAttribPointer(colorLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        40
      );
      gl.vertexAttribPointer(transparencyLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        44
      );
      gl.vertexAttribPointer(
        rangerLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        48
      );
      gl.vertexAttribPointer(
        isArrowLocation,
        1,
        gl.FLOAT,
        false,
        this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
        52
      );


      // чтобы при прозрачности не было якобы белого фона под ребром
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);

      gl.drawArrays(
        gl.TRIANGLES,
        params.start || 0,
        params.count || (data.length / this.ATTRIBUTES)
      );
      // console.log('render edges!');
    },
    initProgram: function(gl) {
      var vertexShader,
          fragmentShader,
          program;

      vertexShader = sigma.utils.loadShader(gl, document.getElementById("2d-edge-vertex-shader").text, gl.VERTEX_SHADER);
      fragmentShader = sigma.utils.loadShader(gl, document.getElementById("2d-edge-fragment-shader").text, gl.FRAGMENT_SHADER);

      program = sigma.utils.loadNewProgram(gl, [vertexShader, fragmentShader]);
      return program;
    }
  };
})();
