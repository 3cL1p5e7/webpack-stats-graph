/**
 * This method renders the graph. It basically calls each program (and
 * generate them if they do not exist yet) to render nodes and edges, batched
 * per renderer.
 *
 * As in the canvas renderer, it is possible to display edges, nodes and / or
 * labels in batches, to make the whole thing way more scalable.
 *
 * @param  {?object}               params Eventually an object of options.
 * @return {sigma.renderers.webgl}        Returns the instance itself.
 */
sigma.renderers.webgl.prototype.render = function(params) {
  var a,
    i,
    l,
    k,
    o,
    program,
    renderer,
    self = this,
    graph = this.graph,
    nodesGl = this.contexts.nodes,
    edgesGl = this.contexts.edges,
    matrix = this.camera.getMatrix(),
    options = sigma.utils.extend(params, this.options),
    drawLabels = this.settings(options, 'drawLabels'),
    drawEdges = this.settings(options, 'drawEdges'),
    drawNodes = this.settings(options, 'drawNodes'),
    drawEdgeLabels = this.settings(options, 'drawEdgeLabels'),
    embedSettings = this.settings.embedObjects(options, {
      prefix: this.options.prefix
    });

  // Call the resize function:
  this.resize(false);

  // Check the 'hideEdgesOnMove' setting:
  if (this.settings(options, 'hideEdgesOnMove'))
    if (this.camera.isAnimated || this.camera.isMoving)
      drawEdges = false;

  // Clear canvases:
  this.clear();

  // Translate matrix to [width/2, height/2]:
  matrix = sigma.utils.matrices.multiply(
    matrix,
    sigma.utils.matrices.translation(this.width / 2, this.height / 2)
  );

  // Kill running jobs:
  for (k in this.jobs)
    if (conrad.hasJob(k))
      conrad.killJob(k);

  if (drawEdges) {
    if (this.settings(options, 'batchEdgesDrawing'))
      (function() {
        var a,
          k,
          i,
          id,
          job,
          arr,
          end,
          start,
          indices,
          renderer,
          batchSize,
          currentProgram;

        id = 'edges_' + this.conradId;
        batchSize = this.settings(options, 'webglEdgesBatchSize');
        a = Object.keys(this.edgeFloatArrays);

        if (!a.length)
          return;
        i = 0;
        renderer = sigma.webgl.edges[a[i]];
        arr = this.edgeFloatArrays[a[i]].array;
        indices = this.edgeIndicesArrays[a[i]];
        start = 0;
        end = Math.min(
          start + batchSize * renderer.POINTS,
          arr.length / renderer.ATTRIBUTES
        );

        job = function() {
          // Check program:
          if (!this.edgePrograms[a[i]])
            this.edgePrograms[a[i]] = renderer.initProgram(edgesGl);

          if (start < end) {
            edgesGl.useProgram(this.edgePrograms[a[i]]);
            renderer.render(
              edgesGl,
              this.edgePrograms[a[i]],
              arr,
              {
                settings: this.settings,
                matrix: matrix,
                width: this.width,
                height: this.height,
                ratio: this.camera.ratio,
                scalingRatio: this.settings(
                  options,
                  'webglOversamplingRatio'
                ),
                start: start,
                count: end - start,
                indicesData: indices
              }
            );
          }

          // Catch job's end:
          if (
            end >= arr.length / renderer.ATTRIBUTES &&
            i === a.length - 1
          ) {
            delete this.jobs[id];
            return false;
          }

          if (end >= arr.length / renderer.ATTRIBUTES) {
            i++;
            arr = this.edgeFloatArrays[a[i]].array;
            renderer = sigma.webgl.edges[a[i]];
            start = 0;
            end = Math.min(
              start + batchSize * renderer.POINTS,
              arr.length / renderer.ATTRIBUTES
            );
          } else {
            start = end;
            end = Math.min(
              start + batchSize * renderer.POINTS,
              arr.length / renderer.ATTRIBUTES
            );
          }

          return true;
        };

        this.jobs[id] = job;
        conrad.addJob(id, job.bind(this));
      }).call(this);
    else {
      for (k in this.edgeFloatArrays) {
        renderer = sigma.webgl.edges[k];

        // Check program:
        if (!this.edgePrograms[k])
          this.edgePrograms[k] = renderer.initProgram(edgesGl);

        // Render
        if (this.edgeFloatArrays[k]) {
          edgesGl.useProgram(this.edgePrograms[k]);
          renderer.render(
            edgesGl,
            this.edgePrograms[k],
            this.edgeFloatArrays[k].array,
            {
              settings: this.settings,
              matrix: matrix,
              width: this.width,
              height: this.height,
              ratio: this.camera.ratio,
              scalingRatio: this.settings(options, 'webglOversamplingRatio'),
              indicesData: this.edgeIndicesArrays[k]
            }
          );
        }
      }
    }
  }

  if (drawNodes) {
    // Enable blending:
    nodesGl.blendFunc(nodesGl.SRC_ALPHA, nodesGl.ONE_MINUS_SRC_ALPHA);
    nodesGl.enable(nodesGl.BLEND);

    for (k in this.nodeFloatArrays) {
      renderer = sigma.webgl.nodes[k];

      // Check program:
      if (!this.nodePrograms[k])
        this.nodePrograms[k] = renderer.initProgram(nodesGl);

      // Render
      if (this.nodeFloatArrays[k]) {
        nodesGl.useProgram(this.nodePrograms[k]);
        renderer.render(
          nodesGl,
          this.nodePrograms[k],
          this.nodeFloatArrays[k].array,
          {
            settings: this.settings,
            matrix: matrix,
            width: this.width,
            height: this.height,
            ratio: this.camera.ratio,
            scalingRatio: this.settings(options, 'webglOversamplingRatio')
          }
        );
      }
    }
  }

  if (drawLabels) {
    a = this.camera.quadtree.area(
      this.camera.getRectangle(this.width, this.height)
    );

    // Apply camera view to these nodes:
    this.camera.applyView(
      undefined,
      undefined,
      {
        nodes: a,
        edges: [],
        width: this.width,
        height: this.height
      }
    );

    o = function(key) {
      return self.settings({
        prefix: self.camera.prefix
      }, key);
    };

    for (i = 0, l = a.length; i < l; i++)
      if (!a[i].hidden)
        (
          sigma.canvas.labels[
          a[i].type ||
          this.settings(options, 'defaultNodeType')
            ] || sigma.canvas.labels.def
        )(a[i], this.contexts.labels, o);
  }

  ////Draw edge labels:
  if (drawEdgeLabels) {
    var labelRenderer = sigma.canvas.edges.labels.modelling;

    var edges = s ? s.graph.edges() : undefined;
    var len = s ? s.graph.edges().length : undefined;

    if(edges) {
      for (i = 0; i < len; i++) {
        o = edges[i];
        if (!o.hidden)
          labelRenderer(
            o,
            graph.nodes(o.source),
            graph.nodes(o.target),
            this.contexts.labels,
            embedSettings
          );
      }
    }
  }

  this.dispatchEvent('render');

  return this;
};