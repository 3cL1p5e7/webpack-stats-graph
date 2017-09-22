;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.captors');

  /**
   * The user inputs default captor. It deals with mouse events, keyboards
   * events and touch events.
   *
   * @param  {DOMElement}   target   The DOM element where the listeners will be
   *                                 bound.
   * @param  {camera}       camera   The camera related to the target.
   * @param  {configurable} settings The settings function.
   * @return {sigma.captor}          The fresh new captor instance.
   */
  sigma.captors.mouse = function(target, camera, settings) {
    var _self = this,
        _target = target,
        _camera = camera,
        _settings = settings,

        // CAMERA MANAGEMENT:
        // ******************
        // The camera position when the user starts dragging:
        _startCameraX,
        _startCameraY,
        _startCameraAngle,

        // The latest stage position:
        _lastCameraX,
        _lastCameraY,
        _lastCameraAngle,
        _lastCameraRatio,

        // MOUSE MANAGEMENT:
        // *****************
        // The mouse position when the user starts dragging:
        _startMouseX,
        _startMouseY,

        _isMouseDown,
        _isMoving,
        _hasDragged,
        _downStartTime,
        _movingTimeoutId;

    sigma.classes.dispatcher.extend(this);

    var customMouseHandlers = {
      // MOUSE EVENTS:
      // *************

      /**
       * The handler listening to the 'move' mouse event. It will effectively
       * drag the graph.
       *
       * @param {event} e A mouse event.
       */
      _moveHandler: function (e) {
        // Dispatch event:
        if (_settings('mouseEnabled')) {
          _self.dispatchEvent('mousemove',
            sigma.utils.mouseCoords(e));
        }
      },

      /**
       * The handler listening to the 'up' mouse event. It will stop dragging the
       * graph.
       *
       * @param {event} e A mouse event.
       */
      _upHandler: function (e) {
        if (_settings('mouseEnabled') && _isMouseDown) {
          _isMouseDown = false;
          if (_movingTimeoutId)
            clearTimeout(_movingTimeoutId);

          _camera.isMoving = false;

          var x = sigma.utils.getX(e),
            y = sigma.utils.getY(e);

          if (_isMoving) {
          } else if (
            _startMouseX !== x ||
            _startMouseY !== y
          )
          _self.dispatchEvent('mouseup', sigma.utils.mouseCoords(e));

          // Update _isMoving flag:
          _isMoving = false;
        }
      },

      /**
       * The handler listening to the 'down' mouse event. It will start observing
       * the mouse position for dragging the graph.
       *
       * @param {event} e A mouse event.
       */
      _downHandler: function (e) {
        if (_settings('mouseEnabled')) {
          _startCameraX = _camera.x;
          _startCameraY = _camera.y;

          _lastCameraX = _camera.x;
          _lastCameraY = _camera.y;

          _startMouseX = sigma.utils.getX(e);
          _startMouseY = sigma.utils.getY(e);

          _hasDragged = false;
          _downStartTime = (new Date()).getTime();

          switch (e.which) {
            case 2:
              // Middle mouse button pressed
              // Do nothing.
              break;
            case 3:
              // Right mouse button pressed
              break;
            // case 1:
            default:
              // Left mouse button pressed
              _isMouseDown = true;
              _self.dispatchEvent('mousedown', sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));
          }
        }
      },

      /**
       * The handler listening to the 'out' mouse event. It will just redispatch
       * the event.
       *
       * @param {event} e A mouse event.
       */
      _outHandler: function (e) {
        if (_settings('mouseEnabled'))
          _self.dispatchEvent('mouseout');
      },

      /**
       * The handler listening to the 'click' mouse event. It will redispatch the
       * click event, but with normalized X and Y coordinates.
       *
       * @param {event} e A mouse event.
       */
      _clickHandler : function (e) {
        if (_settings('mouseEnabled')) {
          var event = sigma.utils.mouseCoords(e);
          event.isDragging =
            (((new Date()).getTime() - _downStartTime) > 100) && _hasDragged;
          _self.dispatchEvent('click', event);
        }

        if (e.preventDefault)
          e.preventDefault();
        else
          e.returnValue = false;

        e.stopPropagation();
        return false;
      },

      /**
       * The handler listening to the double click custom event. It will
       * basically zoom into the graph.
       *
       * @param {event} e A mouse event.
       */
      _doubleClickHandler: function (e) {
        var pos,
          ratio,
          animation;

        if (_settings('mouseEnabled')) {
          ratio = 1 / _settings('doubleClickZoomingRatio');

          _self.dispatchEvent('doubleclick',
            sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));

          if (_settings('doubleClickEnabled')) {
            pos = _camera.cameraPosition(
              sigma.utils.getX(e) - sigma.utils.getCenter(e).x,
              sigma.utils.getY(e) - sigma.utils.getCenter(e).y,
              true
            );

            animation = {
              duration: _settings('doubleClickZoomDuration')
            };

            //sigma.utils.zoomTo(_camera, pos.x, pos.y, ratio, animation);
          }

          if (e.preventDefault)
            e.preventDefault();
          else
            e.returnValue = false;

          e.stopPropagation();
          return false;
        }
      },

      /**
       * The handler listening to the 'wheel' mouse event. It will basically zoom
       * in or not into the graph.
       *
       * @param {event} e A mouse event.
       */
      _wheelHandler: function (e) {
        var pos,
          ratio,
          animation;

        if (_settings('mouseEnabled') && _settings('mouseWheelEnabled')) {
          ratio = sigma.utils.getDelta(e) > 0 ?
          1 / _settings('zoomingRatio') :
            _settings('zoomingRatio');

          pos = _camera.cameraPosition(
            sigma.utils.getX(e) - sigma.utils.getCenter(e).x,
            sigma.utils.getY(e) - sigma.utils.getCenter(e).y,
            true
          );

          animation = {
            duration: _settings('mouseZoomDuration')
          };
        }
      }
    };

    var standartHandlers = {
      // MOUSE EVENTS:
      // *************

      /**
       * The handler listening to the 'move' mouse event. It will effectively
       * drag the graph.
       *
       * @param {event} e A mouse event.
       */
      _moveHandler: function (e) {
        var x,
          y,
          pos;

        // Dispatch event:
        if (_settings('mouseEnabled')) {
        _self.dispatchEvent('mousemove',
          sigma.utils.mouseCoords(e));

        if (_isMouseDown) {
          _isMoving = true;
          _hasDragged = true;

          if (_movingTimeoutId)
            clearTimeout(_movingTimeoutId);

          _movingTimeoutId = setTimeout(function() {
            _isMoving = false;
          }, _settings('dragTimeout'));

          sigma.misc.animation.killAll(_camera);

          _camera.isMoving = true;
          pos = _camera.cameraPosition(
            sigma.utils.getX(e) - _startMouseX,
            sigma.utils.getY(e) - _startMouseY,
            true
          );

          x = _startCameraX - pos.x;
          y = _startCameraY - pos.y;

          if (x !== _camera.x || y !== _camera.y) {
            _lastCameraX = _camera.x;
            _lastCameraY = _camera.y;

            _camera.goTo({
              x: x,
              y: y
            });
          }

          if (e.preventDefault)
            e.preventDefault();
          else
            e.returnValue = false;

          e.stopPropagation();
          return false;
        }
      }
    },

      /**
       * The handler listening to the 'up' mouse event. It will stop dragging the
       * graph.
       *
       * @param {event} e A mouse event.
       */
      _upHandler: function (e) {
        if (_settings('mouseEnabled') && _isMouseDown) {
          _isMouseDown = false;
          if (_movingTimeoutId)
            clearTimeout(_movingTimeoutId);

          _camera.isMoving = false;

          var x = sigma.utils.getX(e),
            y = sigma.utils.getY(e);

          if (_isMoving) {
            sigma.misc.animation.killAll(_camera);
            sigma.misc.animation.camera(
              _camera,
              {
                x: _camera.x +
                _settings('mouseInertiaRatio') * (_camera.x - _lastCameraX),
                y: _camera.y +
                _settings('mouseInertiaRatio') * (_camera.y - _lastCameraY)
              },
              {
                easing: 'quadraticOut',
                duration: _settings('mouseInertiaDuration')
              }
            );
          } else if (
            _startMouseX !== x ||
            _startMouseY !== y
          )
            _camera.goTo({
              x: _camera.x,
              y: _camera.y
            });

          _self.dispatchEvent('mouseup',
            sigma.utils.mouseCoords(e));

          // Update _isMoving flag:
          _isMoving = false;
        }
      },

      /**
       * The handler listening to the 'down' mouse event. It will start observing
       * the mouse position for dragging the graph.
       *
       * @param {event} e A mouse event.
       */
      _downHandler: function (e) {
        if (_settings('mouseEnabled')) {
          _startCameraX = _camera.x;
          _startCameraY = _camera.y;

          _lastCameraX = _camera.x;
          _lastCameraY = _camera.y;

          _startMouseX = sigma.utils.getX(e);
          _startMouseY = sigma.utils.getY(e);

          _hasDragged = false;
          _downStartTime = (new Date()).getTime();

          switch (e.which) {
            case 2:
              // Middle mouse button pressed
              // Do nothing.
              break;
            case 3:
              // Right mouse button pressed
              _self.dispatchEvent('rightclick',
                sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));
              break;
            // case 1:
            default:
              // Left mouse button pressed
              _isMouseDown = true;

              _self.dispatchEvent('mousedown',
                sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));
          }
        }
      },

      /**
       * The handler listening to the 'out' mouse event. It will just redispatch
       * the event.
       *
       * @param {event} e A mouse event.
       */
      _outHandler: function (e) {
        if (_settings('mouseEnabled'))
          _self.dispatchEvent('mouseout');
      },

      /**
       * The handler listening to the 'click' mouse event. It will redispatch the
       * click event, but with normalized X and Y coordinates.
       *
       * @param {event} e A mouse event.
       */
      _clickHandler: function (e) {
        if (_settings('mouseEnabled')) {
          var event = sigma.utils.mouseCoords(e);
          event.isDragging =
            (((new Date()).getTime() - _downStartTime) > 100) && _hasDragged;
          _self.dispatchEvent('click', event);
        }

        if (e.preventDefault)
          e.preventDefault();
        else
          e.returnValue = false;

        e.stopPropagation();
        return false;
      },

      /**
       * The handler listening to the double click custom event. It will
       * basically zoom into the graph.
       *
       * @param {event} e A mouse event.
       */
      _doubleClickHandler: function (e) {
        var pos,
          ratio,
          animation;

        if (_settings('mouseEnabled')) {
          ratio = 1 / _settings('doubleClickZoomingRatio');

          _self.dispatchEvent('doubleclick',
            sigma.utils.mouseCoords(e, _startMouseX, _startMouseY));

          if (_settings('doubleClickEnabled')) {
            pos = _camera.cameraPosition(
              sigma.utils.getX(e) - sigma.utils.getCenter(e).x,
              sigma.utils.getY(e) - sigma.utils.getCenter(e).y,
              true
            );

            animation = {
              duration: _settings('doubleClickZoomDuration')
            };

            sigma.utils.zoomTo(_camera, pos.x, pos.y, ratio, animation);
          }

          if (e.preventDefault)
            e.preventDefault();
          else
            e.returnValue = false;

          e.stopPropagation();
          return false;
        }
      },

      /**
       * The handler listening to the 'wheel' mouse event. It will basically zoom
       * in or not into the graph.
       *
       * @param {event} e A mouse event.
       */
      _wheelHandler: function (e) {
        var pos,
          ratio,
          animation;

        if (_settings('mouseEnabled') && _settings('mouseWheelEnabled')) {
          ratio = sigma.utils.getDelta(e) > 0 ?
          1 / _settings('zoomingRatio') :
            _settings('zoomingRatio');

          pos = _camera.cameraPosition(
            sigma.utils.getX(e) - sigma.utils.getCenter(e).x,
            sigma.utils.getY(e) - sigma.utils.getCenter(e).y,
            true
          );

          animation = {
            duration: _settings('mouseZoomDuration')
          };

          sigma.utils.zoomTo(_camera, pos.x, pos.y, ratio, animation);

          if (e.preventDefault)
            e.preventDefault();
          else
            e.returnValue = false;

          e.stopPropagation();
          return false;
        }
      }
    };

    if(sigma.mode.isStandartCaptor()){
      sigma.utils.doubleClick(_target, 'click', standartHandlers._doubleClickHandler);
      sigma.mode.getBox().addEventListener('DOMMouseScroll', standartHandlers._wheelHandler, false);
      sigma.mode.getBox().addEventListener('mousewheel', standartHandlers._wheelHandler, false);
      sigma.mode.getBox().addEventListener('mousemove', standartHandlers._moveHandler, false);
      sigma.mode.getBox().addEventListener('mousedown', standartHandlers._downHandler, false);
      sigma.mode.getBox().addEventListener('click', standartHandlers._clickHandler, false);
      sigma.mode.getBox().addEventListener('mouseout', standartHandlers._outHandler, false);
      sigma.mode.getBox().addEventListener('mouseup', standartHandlers._upHandler, false);

      /**
       * This method unbinds every handlers that makes the captor work.
       */
      this.kill = standartHandlers.kill = function() {
        sigma.utils.unbindDoubleClick(_target, 'click');
        sigma.mode.getBox().removeEventListener('DOMMouseScroll', standartHandlers._wheelHandler);
        sigma.mode.getBox().removeEventListener('mousewheel', standartHandlers._wheelHandler);
        sigma.mode.getBox().removeEventListener('mousemove', standartHandlers._moveHandler);
        sigma.mode.getBox().removeEventListener('mousedown', standartHandlers._downHandler);
        sigma.mode.getBox().removeEventListener('click', standartHandlers._clickHandler);
        sigma.mode.getBox().removeEventListener('mouseout', standartHandlers._outHandler);
        sigma.mode.getBox().removeEventListener('mouseup', standartHandlers._upHandler);
      };
    }
    else{
      sigma.utils.doubleClick(_target, 'click', customMouseHandlers._doubleClickHandler);

      sigma.mode.getBox().addEventListener('mousemove', customMouseHandlers._moveHandler, false);
      sigma.mode.getBox().addEventListener('click', customMouseHandlers._clickHandler, false);
      sigma.mode.getBox().addEventListener('mouseout', customMouseHandlers._outHandler, false);

      sigma.mode.getBox().addEventListener('DOMMouseScroll', customMouseHandlers._wheelHandler, false);
      sigma.mode.getBox().addEventListener('mousewheel', customMouseHandlers._wheelHandler, false);
      sigma.mode.getBox().addEventListener('mousedown', customMouseHandlers._downHandler, false);
      sigma.mode.getBox().addEventListener('mouseup', customMouseHandlers._upHandler, false);

      /**
       * This method unbinds every handlers that makes the captor work.
       */
      this.kill = customMouseHandlers.kill = function() {
        sigma.utils.unbindDoubleClick(_target, 'click');
        sigma.mode.getBox().removeEventListener('mousemove', customMouseHandlers._moveHandler);
        sigma.mode.getBox().removeEventListener('click', customMouseHandlers._clickHandler);
        sigma.mode.getBox().removeEventListener('mouseout', customMouseHandlers._outHandler);

        sigma.mode.getBox().removeEventListener('DOMMouseScroll', customMouseHandlers._wheelHandler, false);
        sigma.mode.getBox().removeEventListener('mousewheel', customMouseHandlers._wheelHandler, false);
        sigma.mode.getBox().removeEventListener('mousedown', customMouseHandlers._downHandler, false);
        sigma.mode.getBox().removeEventListener('mouseup', customMouseHandlers._upHandler, false);
      };
    }

  };
}).call(this);
