/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ var __webpack_modules__ = ({

/***/ "./scripts/index.js":
/*!**************************!*\
  !*** ./scripts/index.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ CanvasParallaxController)\n/* harmony export */ });\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \"prototype\", { writable: false }); return Constructor; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : String(i); }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\n/*------------------------------------------------------------------\nCarallax\n------------------------------------------------------------------*/\n/* ██████╗  █████╗ ██████╗  █████╗ ██╗     ██╗      █████╗ ██╗  ██╗\n   ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║     ██║     ██╔══██╗╚██╗██╔╝\n   ██████╔╝███████║██████╔╝███████║██║     ██║     ███████║ ╚███╔╝\n   ██╔═══╝ ██╔══██║██╔══██╗██╔══██║██║     ██║     ██╔══██║ ██╔██╗\n   ██║     ██║  ██║██║  ██║██║  ██║███████╗███████╗██║  ██║██╔╝ ██╗\n   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ */\nvar CanvasParallaxController = /*#__PURE__*/function () {\n  function CanvasParallaxController() {\n    var _this = this;\n    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n    _classCallCheck(this, CanvasParallaxController);\n    // The parallax settings\n    this.settings = {\n      throttle: 100,\n      depth: 50,\n      dpr: window.devicePixelRatio || 1\n    };\n\n    // Object assign the user settings\n    for (var key in this.settings) {\n      if (Object.hasOwnProperty.call(this.settings, key) && options[key]) this.settings[key] = options[key];\n    }\n\n    // Create a new buffer canvas\n    this.canvas = new CanvasController(this.settings.dpr);\n    // Create a new buffer canvas\n    this.buffer = new CanvasController(this.settings.dpr);\n    // The current image\n    this.image = null;\n    // Some timeouts\n    this.timeouts = {};\n    // A store for all our already solved calculations\n    this.calculations = {};\n\n    // We will store some values here\n    this.cache = {\n      // ScrollY will be used to store the last scroll position, we can use it to check if we have scrolled\n      scrollY: -1,\n      // set to -1 so it will always update on the first run\n      \"static\": false,\n      canvasOffset: 0\n    };\n\n    // A resize observer\n    this.ResizeObserver = new ResizeObserver(function () {\n      _this.resize();\n    });\n\n    // An intersection observer\n    this.IntersectionObserver = new IntersectionObserver(function (entries) {\n      entries.forEach(function (entry) {\n        if (entry.isIntersecting) _this.resize();\n      });\n    });\n\n    // Observe the canvas element\n    this.ResizeObserver.observe(this.canvas.element);\n    this.IntersectionObserver.observe(this.canvas.element);\n\n    // Keep track of everything going on\n    this.status = {\n      active: false,\n      loaded: false,\n      depth: this.settings.depth,\n      view: {\n        top: 0,\n        bottom: 0\n      }\n    };\n\n    // Tell the canvas to begin drawing immediately\n    this.enable();\n    this.start();\n  }\n  _createClass(CanvasParallaxController, [{\n    key: \"enable\",\n    value: function enable() {\n      // Change the cached scrollY to -1 so the draw function will run\n      this.cache.scrollY = -1;\n    }\n\n    // A method to load an image to the canvas\n  }, {\n    key: \"load\",\n    value: function load() {\n      var _this2 = this;\n      var src = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;\n      var focus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '50% 50%';\n      // create a new image element\n      var image = new Image();\n\n      // Set the loaded status to false\n      this.status.loaded = false;\n\n      // When the image loads, we need to add a new ParallaxImageController\n      image.addEventListener('load', function () {\n        // Tell the status that something is loaded\n        _this2.status.loaded = true;\n        // Add this layer to the layers object\n        _this2.image = new ParallaxImageController(image, {\n          focus: focus,\n          depth: _this2.settings.depth,\n          dpr: _this2.settings.dpr\n        });\n        // Now we need to update some things\n        _this2.resize();\n        // Enable drawing\n        _this2.enable();\n        clearTimeout(_this2.timeouts['loaded']);\n        _this2.timeouts['loaded'] = setTimeout(function () {\n          // if the canvas.element does not have loaded class\n          if (!_this2.canvas.element.classList.contains('carallax--loaded')) {\n            // Add the loaded class to the canvas.element\n            _this2.canvas.element.classList.add('carallax--loaded');\n          }\n        }, 100);\n      });\n\n      // if the src is an element\n      if (src instanceof Element) {\n        var viewBox = src.getAttribute('viewBox');\n        var width = src.getAttribute('width') || viewBox ? viewBox.split(' ')[2] : 1;\n        var height = src.getAttribute('height') || viewBox ? viewBox.split(' ')[3] : 1;\n        src.setAttribute('width', width);\n        src.setAttribute('height', height);\n        src.setAttribute('viewBox', \"0 0 \".concat(width, \" \").concat(height));\n\n        // Set the height and width of the image\n        image.width = parseInt(width) + 'px';\n        image.height = parseInt(height) + 'px';\n        // btoa the element and set it as the source\n        image.src = 'data:image/svg+xml;base64,' + btoa(src.outerHTML);\n        // Remove the orginal element\n        src.parentElement.removeChild(src);\n      } else {\n        // Add the src to the image to make it load\n        image.src = src;\n      }\n    }\n  }, {\n    key: \"calculateScrollPercent\",\n    value: function calculateScrollPercent() {\n      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;\n      var distance = offset + window.innerHeight - this.canvas.pageYOffset;\n      var decimalPlaces = 2;\n      var alignment = decimalPlaces * .5;\n      var calculation = distance / ((window.innerHeight + this.canvas.element.clientHeight) / decimalPlaces);\n      var decimal = (calculation - alignment) * 2 / decimalPlaces;\n      var result = decimal;\n      return result.toFixed(decimalPlaces);\n    }\n  }, {\n    key: \"getScrollPercentages\",\n    value: function getScrollPercentages() {\n      this.calculations = {};\n      var from = this.canvas.pageYOffset - window.innerHeight;\n      var to = from + this.canvas.element.clientHeight + window.innerHeight;\n      for (var index = from; index < to; index++) {\n        this.calculations[index] = this.calculateScrollPercent(index);\n\n        // Make sure the image is loaded\n        if (this.image) {\n          this.image.parallax(this.calculations[index], {\n            width: this.canvas.element.clientWidth,\n            height: this.canvas.element.clientHeight\n          });\n        }\n      }\n    }\n  }, {\n    key: \"getScrollPercent\",\n    value: function getScrollPercent() {\n      // this.getScrollPercentages();\n      var offset = Math.round(window.scrollY);\n\n      // If we have a cached value, return that, otherwise calculate it\n      if (!this.calculations[offset]) {\n        this.calculations[offset] = this.calculateScrollPercent(offset);\n      }\n      return this.calculations[offset];\n    }\n  }, {\n    key: \"draw\",\n    value: function draw() {\n      // If the image is null, return\n      if (!this.image) return;\n      if (window.scrollY + window.innerHeight > this.status.view.top && window.scrollY < this.status.view.bottom) {\n        // Clear the buffer canvas\n        this.buffer.ctx.clearRect(0, 0, this.buffer.element.width, this.buffer.element.height);\n        var percentScrolled = this.getScrollPercent();\n\n        // Draw the image to the buffer canvas;\n        try {\n          var position = this.image.parallax(percentScrolled, {\n            width: this.canvas.element.clientWidth,\n            height: this.canvas.element.clientHeight\n          });\n          this.buffer.ctx.drawImage(this.image.canvas.element, position.x, position.y);\n        } catch (e) {}\n\n        // Draw the buffer image to the canvas\n        this.canvas.ctx.clearRect(0, 0, this.canvas.element.width, this.canvas.element.height);\n        try {\n          this.canvas.ctx.drawImage(this.buffer.element, 0, 0);\n        } catch (e) {}\n      }\n    }\n  }, {\n    key: \"update\",\n    value: function update() {\n      var _this3 = this;\n      window.requestAnimationFrame(function () {\n        _this3.update();\n        if (_this3.cache.scrollY != window.scrollY) {\n          _this3.cache.scrollY = window.scrollY;\n          _this3.draw();\n        }\n      });\n    }\n\n    // A method that will wait for the loaded status to be true, then run the draw function\n  }, {\n    key: \"start\",\n    value: function start() {\n      var _this4 = this;\n      window.requestAnimationFrame(function () {\n        _this4.status.loaded ? _this4.update() : _this4.start();\n      });\n    }\n  }, {\n    key: \"resize\",\n    value: function resize() {\n      var _this5 = this;\n      clearTimeout(this.timeouts['resize']);\n      this.timeouts['resize'] = setTimeout(function () {\n        // Tell the canvas to resize\n        _this5.canvas.resize(_this5.canvas.element.clientWidth, _this5.canvas.element.clientHeight);\n        // Tell the buffer to resize\n        _this5.buffer.resize(_this5.canvas.element.clientWidth, _this5.canvas.element.clientHeight);\n\n        // Loop through the layers and resize them too, they only need the width of the canvas as their height is calculated\n        if (_this5.image) {\n          _this5.image.resize(_this5.canvas.element.clientWidth, _this5.canvas.element.clientHeight);\n        }\n\n        // Set the view area of the canvas\n        _this5.status.view.top = _this5.canvas.pageYOffset;\n        _this5.status.view.bottom = _this5.canvas.pageYOffset + _this5.canvas.element.clientHeight;\n        _this5.cache.canvasOffset = _this5.canvas.pageYOffset;\n\n        // Make sure it still draws during the resize\n        _this5.enable();\n\n        // Clear all the calculations\n        _this5.calculations = {};\n        _this5.getScrollPercentages();\n      }, this.settings.throttle);\n    }\n  }]);\n  return CanvasParallaxController;\n}();\n\nvar ParallaxImageController = /*#__PURE__*/function () {\n  function ParallaxImageController(image) {\n    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};\n    _classCallCheck(this, ParallaxImageController);\n    // The actual image element\n    this.image = image;\n    // The visual depth of the layer\n    this.depth = settings.depth || 50;\n    // The focus position of the image\n    this.focus = settings.focus || '50% 50%';\n    // Create a new buffer canvas\n    this.canvas = new CanvasController(settings.dpr);\n    // The pixel height of the layer\n    this.height = 0;\n    // The pixel width of the layer\n    this.width = 0;\n    // The parallax position calculations\n    this.calculations = {};\n\n    // Reset the focus position to an object (50% 50% will become { x: .5, y: .5 })\n    var focus = [];\n    this.focus.split(' ').forEach(function (value) {\n      if (value.indexOf('%') > -1) {\n        value = parseFloat(value) / 100;\n        focus.push(Math.abs(value));\n      }\n    });\n    var focusX = focus[0];\n    var focusY = focus[1] || focus[0];\n    this.focus = {\n      x: focusX,\n      y: focusY\n    };\n  }\n  _createClass(ParallaxImageController, [{\n    key: \"draw\",\n    value: function draw() {\n      // Draw the image on the canvas at the appropriate size\n      this.canvas.ctx.drawImage(this.image, 0, 0, this.canvas.element.width, this.canvas.element.height);\n    }\n\n    // parallax(percentage = 0, viewport = {}) {\n    //   if (!this.calculations[percentage]) {\n    //     // Calculate the y offset\n    //     let offset = this.depth * (percentage / 100);\n\n    //     // Get the center of the viewport\n    //     let center = {\n    //       x: (viewport.width - this.width) / 2,\n    //       y: (viewport.height - this.height) / 2,\n    //     };\n\n    //     // Calculate the new position\n    //     let position = {\n    //       x: center.x,\n    //       y: center.y + offset,\n    //     }\n\n    //     // Store the calculation\n    //     this.calculations[percentage] = position;\n    //   }\n\n    //   // Return the calculation\n    //   return this.calculations[percentage];\n    // }\n  }, {\n    key: \"parallax\",\n    value: function parallax() {\n      var percentage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;\n      var viewport = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};\n      if (!this.calculations[percentage]) {\n        // Get the center of the viewport\n        var center = {\n          x: (viewport.width - this.width) / 2,\n          y: (viewport.height - this.height) / 2\n        };\n\n        // get the overflow values for the image in the viewport\n        var overflow = {\n          x: this.width - viewport.width,\n          y: this.height - viewport.height\n        };\n\n        // Using the overflow and the focus, calculate the position of the image\n        var position = {\n          x: center.x + overflow.x * (0.5 - this.focus.x),\n          y: center.y + overflow.y * (0.5 - this.focus.y)\n        };\n        var offset = this.depth / 2 * percentage;\n\n        // Add the offset to the y position\n        position.y += offset;\n\n        // Store the calculation\n        this.calculations[percentage] = position;\n      }\n\n      // Return the calculation\n      return this.calculations[percentage];\n    }\n  }, {\n    key: \"resize\",\n    value: function resize(width, height) {\n      // Reset the calculations\n      this.calculations = {};\n\n      // Adjust the target height to be at least the height argument plus the depth\n      height = Math.max(height, this.depth + height);\n\n      // Calculate the aspect ratios\n      var imageAspectRatio = this.image.naturalWidth / this.image.naturalHeight;\n      var targetAspectRatio = width / height;\n      var canvasWidth, canvasHeight;\n\n      // If the image aspect ratio is less than the target aspect ratio,\n      // set the width to the target width and scale the height to maintain the aspect ratio\n      if (imageAspectRatio < targetAspectRatio) {\n        canvasWidth = width;\n        canvasHeight = Math.round(width / imageAspectRatio);\n      }\n      // If the image aspect ratio is greater than the target aspect ratio,\n      // set the height to the target height and scale the width to maintain the aspect ratio\n      else {\n        canvasHeight = height;\n        canvasWidth = Math.round(height * imageAspectRatio);\n      }\n\n      // Resize the canvas\n      this.canvas.resize(canvasWidth, canvasHeight);\n\n      // Work out the pixel height of the layer\n      this.height = this.canvas.element.height * (1 / this.canvas.dpr);\n      // Work out the pixel width of the layer\n      this.width = this.canvas.element.width * (1 / this.canvas.dpr);\n\n      // After we have resized the image, we want to update the canvas\n      this.draw();\n    }\n  }]);\n  return ParallaxImageController;\n}();\n/* ██████╗ █████╗ ███╗   ██╗██╗   ██╗ █████╗ ███████╗\n  ██╔════╝██╔══██╗████╗  ██║██║   ██║██╔══██╗██╔════╝\n  ██║     ███████║██╔██╗ ██║██║   ██║███████║███████╗\n  ██║     ██╔══██║██║╚██╗██║╚██╗ ██╔╝██╔══██║╚════██║\n  ╚██████╗██║  ██║██║ ╚████║ ╚████╔╝ ██║  ██║███████║\n   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝ */\nvar CanvasController = /*#__PURE__*/function () {\n  function CanvasController(dpr) {\n    _classCallCheck(this, CanvasController);\n    // Create a new canvasController element\n    this.element = document.createElement('canvas');\n    // The canvas context\n    this.ctx = this.element.getContext('2d');\n    // The devicePixelRatio\n    this.dpr = dpr || window.devicePixelRatio || 1;\n    // The page offset\n    this.pageYOffset = 0;\n  }\n\n  // Resize the buffer canvas\n  _createClass(CanvasController, [{\n    key: \"resize\",\n    value: function resize() {\n      var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;\n      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;\n      var offset = 0;\n      var element = this.element;\n      while (element) {\n        offset += element.offsetTop;\n        element = element.offsetParent;\n      }\n      this.element.width = width * this.dpr;\n      this.element.height = height * this.dpr;\n      // Update the pageYOffset of the canvas\n      this.pageYOffset = offset;\n    }\n  }]);\n  return CanvasController;\n}();\n\n//# sourceURL=webpack://canvas-parallax/./scripts/index.js?");

/***/ })

/******/ });
/************************************************************************/
/******/ // The require scope
/******/ var __webpack_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module can't be inlined because the eval devtool is used.
/******/ var __webpack_exports__ = {};
/******/ __webpack_modules__["./scripts/index.js"](0, __webpack_exports__, __webpack_require__);
/******/ var __webpack_exports__default = __webpack_exports__["default"];
/******/ export { __webpack_exports__default as default };
/******/ 
