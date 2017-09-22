;(function() {
  'use strict';
   sigma.utils.pkg('sigma.webgl.nodes');

   sigma.webgl.nodes.modelling = {
        POINTS: 3,
        ATTRIBUTES: 9,
        addNode: function(node, data, i, prefix, settings) {
          data[i++] = node[prefix + 'x'];
          data[i++] = node[prefix + 'y'];
          data[i++] = node[prefix + 'size'];
          data[i++] = node['color_node'];
          data[i++] = 0;
          data[i++] = node['border_color'];
          data[i++] = node['label'];
          data[i++] = node['transparency_node'];
          data[i++] = node['color_ranger'];

          data[i++] = node[prefix + 'x'];
          data[i++] = node[prefix + 'y'];
          data[i++] = node[prefix + 'size'];
          data[i++] = node['color_node'];
          data[i++] = 2 * Math.PI / 3;
          data[i++] = node['border_color'];
          data[i++] = node['label'];
          data[i++] = node['transparency_node'];
          data[i++] = node['color_ranger'];

          data[i++] = node[prefix + 'x'];
          data[i++] = node[prefix + 'y'];
          data[i++] = node[prefix + 'size'];
          data[i++] = node['color_node'];
          data[i++] = 4 * Math.PI / 3;
          data[i++] = node['border_color'];
          data[i++] = node['label'];
          data[i++] = node['transparency_node'];
          data[i++] = node['color_ranger'];
        },
        render: function(gl, program, data, params) {
          var buffer;

          // Define attributes:
          var positionLocation =
                gl.getAttribLocation(program, 'a_position'),
              sizeLocation =
                gl.getAttribLocation(program, 'a_size'),
              colorLocation =
                gl.getAttribLocation(program, 'a_color'),
              angleLocation =
                gl.getAttribLocation(program, 'a_angle'),
              transparencyLocation =
                gl.getAttribLocation(program, 'a_transparency'),
              rangerLocation =
                gl.getAttribLocation(program, 'a_range_by'),
              borderColor =
                gl.getAttribLocation(program, 'a_border_color'),
              resolutionLocation =
                gl.getUniformLocation(program, 'u_resolution'),
              matrixLocation =
                gl.getUniformLocation(program, 'u_matrix'),
              ratioLocation =
                gl.getUniformLocation(program, 'u_ratio'),
              scaleLocation =
                gl.getUniformLocation(program, 'u_scale'),
              borderWidth =
                gl.getUniformLocation(program, 'u_border_width_per'),
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
          gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

          gl.uniform2f(resolutionLocation, params.width, params.height);
          gl.uniform1f(
            ratioLocation,
            1 / Math.pow(params.ratio, params.settings('nodesPowRatio'))
          );
          gl.uniform1f(scaleLocation, params.scalingRatio);
          gl.uniformMatrix3fv(matrixLocation, false, params.matrix);

          gl.uniform1f(borderWidth, sigma.visual_settings.border.border_width_per);

          if(sigma.visual.inverseColorNode) {
            gl.uniform1f(rangeFrom, sigma.utils.floatColor(sigma.visual_settings.node.rangers.coloring.range[1]));
            gl.uniform1f(rangeTo, sigma.utils.floatColor(sigma.visual_settings.node.rangers.coloring.range[0]));
          }
          else{
            gl.uniform1f(rangeFrom, sigma.utils.floatColor(sigma.visual_settings.node.rangers.coloring.range[0]));
            gl.uniform1f(rangeTo, sigma.utils.floatColor(sigma.visual_settings.node.rangers.coloring.range[1]));
          }

          var instance = sigma.mode.getInstance();
          var coloring = {};
          if(sigma.visual.rangeColorNode) { // ranger enabled
            if (instance)
              coloring = sigma.utils.getFieldBounds(sigma.visual_settings.node.rangers.coloring.field, instance.graph.nodes());
            else
              coloring = {min: 0.0, max: 10.0};
          }
          else { // ranger disabled
            coloring = {min: 0.0, max: 0.0};
          }
          gl.uniform1f(rangeMin, coloring.min);
          gl.uniform1f(rangeMax, coloring.max);

          gl.enableVertexAttribArray(positionLocation);
          gl.enableVertexAttribArray(sizeLocation);
          gl.enableVertexAttribArray(colorLocation);
          gl.enableVertexAttribArray(angleLocation);
          gl.enableVertexAttribArray(borderColor);
          gl.enableVertexAttribArray(transparencyLocation);
          gl.enableVertexAttribArray(rangerLocation);

          gl.vertexAttribPointer(
            positionLocation,
            2,
            gl.FLOAT,
            false,
            this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
            0
          );
          gl.vertexAttribPointer(
            sizeLocation,
            1,
            gl.FLOAT,
            false,
            this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
            8
          );
          gl.vertexAttribPointer(
            colorLocation,
            1,
            gl.FLOAT,
            false,
            this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
            12
          );
          gl.vertexAttribPointer(
            angleLocation,
            1,
            gl.FLOAT,
            false,
            this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
            16
          );
          gl.vertexAttribPointer(
            borderColor,
            1,
            gl.FLOAT,
            false,
            this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
            20
          );
          gl.vertexAttribPointer(
            transparencyLocation,
            1,
            gl.FLOAT,
            false,
            this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
            28
          );
          gl.vertexAttribPointer(
            rangerLocation,
            1,
            gl.FLOAT,
            false,
            this.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
            32
          );

          // Set the parameters so we can render any size image.
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

          gl.drawArrays(
            gl.TRIANGLES,
            params.start || 0,
            params.count || (data.length / this.ATTRIBUTES)
          );
          // console.log('render nodes!');
        },
        initProgram: function(gl) {
          var vertexShader,
              fragmentShader,
              program;

          var errorHandler = function(e){
            console.log('Error!');
            console.log(e);
          };

          vertexShader = sigma.utils.loadShader(gl, document.getElementById("2d-node-vertex-shader").text, gl.VERTEX_SHADER);
          fragmentShader = sigma.utils.loadShader(gl, document.getElementById("2d-node-fragment-shader").text, gl.FRAGMENT_SHADER);

          program = sigma.utils.loadNewProgram(gl, [vertexShader, fragmentShader]);
          return program;
        }
    };
})();


