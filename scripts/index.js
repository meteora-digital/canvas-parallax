/*------------------------------------------------------------------
Canvas Parallax
------------------------------------------------------------------*/

/* ██████╗  █████╗ ██████╗  █████╗ ██╗     ██╗      █████╗ ██╗  ██╗
   ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║     ██║     ██╔══██╗╚██╗██╔╝
   ██████╔╝███████║██████╔╝███████║██║     ██║     ███████║ ╚███╔╝
   ██╔═══╝ ██╔══██║██╔══██╗██╔══██║██║     ██║     ██╔══██║ ██╔██╗
   ██║     ██║  ██║██║  ██║██║  ██║███████╗███████╗██║  ██║██╔╝ ██╗
   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ */

export default class CanvasParallaxController {
  constructor(options = {}) {
    // The parallax settings
    this.settings = Object.assign({
      alpha: false,
      depth: 50,
      preload: true,
      throttle: 100,
      precision: 5
    }, options);

    // Create a new buffer canvas
    this.canvas = new CanvasController();
    // Create a new buffer canvas
    this.buffer = new CanvasController();
    // The current image
    this.image = null;
    // Some timeouts
    this.timeouts = {};
    // A store for all our already solved calculations
    this.calculations = {};

    // Store the events here
    this.events = {};

    // We will store some values here
    this.cache = {
      // ScrollY will be used to store the last scroll position, we can use it to check if we have scrolled
      scrollY: -1, // set to -1 so it will always update on the first run
      static: false,
      canvasOffset: 0,
    };

    // A resize observer
    this.ResizeObserver = new ResizeObserver(() => {
      this.resize();
    });

    // Observe the canvas element
    this.ResizeObserver.observe(this.canvas.element);
    // Also observe the body element in case content has been added to the page
    this.ResizeObserver.observe(document.body);

    // Keep track of everything going on
    this.status = {
      active: false,
      loaded: false,
      depth: this.settings.depth,
      initialized: false,
      view: {
        top: 0,
        bottom: 0,
      },
    };

    // Tell the canvas to begin drawing immediately
    this.enable();
    this.start();

    // Define the worker for calculateScrollPercent
    this.scrollPercentageCalculator = new Worker(URL.createObjectURL(new Blob([`
      self.onmessage = function(e) {
        const { offset, decimalPlaces, canvasPageYOffset, windowHeight, canvasHeight } = e.data;
        const distance = (offset + windowHeight) - canvasPageYOffset;
        const alignment = (decimalPlaces * .5);
        const calculation = distance / ((windowHeight + canvasHeight) / decimalPlaces);
        const decimal = ((calculation - alignment) * 2) / decimalPlaces;
        const result = decimal.toFixed(decimalPlaces);
        self.postMessage(result);
      };
    `], { type: 'application/javascript' })));

    // Define the worker for getScrollPercentages
    this.scrollPercentageGetter = new Worker(URL.createObjectURL(new Blob([`
      self.onmessage = function(e) {
        const { from, to, windowHeight, canvasHeight, decimalPlaces, canvasPageYOffset } = e.data;
        const calculations = {};
        for (let index = from; index < to; index++) {
          const distance = (index + windowHeight) - canvasPageYOffset;
          const alignment = (decimalPlaces * .5);
          const calculation = distance / ((windowHeight + canvasHeight) / decimalPlaces);
          const decimal = ((calculation - alignment) * 2) / decimalPlaces;
          calculations[index] = decimal.toFixed(decimalPlaces);
        }
        self.postMessage(calculations);
      };
    `], { type: 'application/javascript' })));
  }

  enable() {
    // Change the cached scrollY to -1 so the draw function will run
    this.cache.scrollY = -1;
  }

  // A method to load an image to the canvas
  load(src = false, focus = '50% 50%') {
    // create a new image element
    const image = new Image;

    // Set the loaded status to false
    this.status.loaded = false;

    // Function to handle image load
    const handleImageLoad = () => {
      // Tell the status that something is loaded
      this.status.loaded = true;
      // Add this layer to the layers object
      this.image = new ParallaxImageController(image, {
        focus: focus,
        depth: this.settings.depth,
      });
      // Now we need to update some things
      this.resize();
      // Enable drawing
      this.enable();
      // Draw the image
      this.draw();

      clearTimeout(this.timeouts['loaded']);
      this.timeouts['loaded'] = setTimeout(() => {
        // if the canvas.element does not have loaded class
        if (!this.canvas.element.classList.contains('loaded')) {
          // Add the loaded class to the canvas.element
          this.canvas.element.classList.add('loaded');
        }
      }, 100);
    };

    // If the image is already loaded, call the handler immediately
    if (image.complete && image.src) {
      handleImageLoad();
    } else {
      // Otherwise, add the event listener
      image.addEventListener('load', handleImageLoad);
    }

    // if the src is an element
    if (src instanceof Element) {
      const viewBox = src.getAttribute('viewBox');
      const width = src.getAttribute('width') || (viewBox) ? viewBox.split(' ')[2] : 1;
      const height = src.getAttribute('height') || (viewBox) ? viewBox.split(' ')[3] : 1;

      src.setAttribute('width', width);
      src.setAttribute('height', height);
      src.setAttribute('viewBox', `0 0 ${width} ${height}`);

      // Set the height and width of the image
      image.width = parseInt(width) + 'px';
      image.height = parseInt(height) + 'px';
      // btoa the element and set it as the source
      image.src = 'data:image/svg+xml;base64,' + btoa(src.outerHTML);
      // Remove the orginal element
      src.parentElement.removeChild(src);
    } else {
      // Add the src to the image to make it load
      image.src = src;
    }
  }

  calculateScrollPercent(offset = 0) {
    return new Promise((resolve) => {
      this.scrollPercentageCalculator.onmessage = (e) => {
        resolve(e.data);
      };
      this.scrollPercentageCalculator.postMessage({
        offset: offset,
        decimalPlaces: this.settings.precision,
        canvasPageYOffset: this.canvas.pageYOffset,
        windowHeight: window.innerHeight,
        canvasHeight: this.canvas.element.clientHeight
      });
    });
  }

  async getScrollPercentages() {
    return new Promise((resolve) => {
      if (this.status.initialized || this.settings.preload) {
        const from = Math.max(0, this.canvas.pageYOffset - window.innerHeight);
        const to = from + this.canvas.element.clientHeight + window.innerHeight;

        this.scrollPercentageGetter.onmessage = (e) => {
          this.calculations = e.data;
          this.status.initialized = true;

          // Make sure the image is loaded
          if (this.image) {
            Object.values(this.calculations).forEach(calculation =>
              this.image.parallax(calculation, {
                width: this.canvas.element.clientWidth,
                height: this.canvas.element.clientHeight,
              })
            );
          }

          resolve();
        };

        this.scrollPercentageGetter.postMessage({
          from: from,
          to: to,
          windowHeight: window.innerHeight,
          canvasHeight: this.canvas.element.clientHeight,
          decimalPlaces: this.settings.precision,
          canvasPageYOffset: this.canvas.pageYOffset
        });
      } else {
        resolve();
      }
    });
  }

  getScrollPercent() {
    // this.getScrollPercentages();
    const offset = Math.round(window.scrollY);

    // If we have a cached value, return that, otherwise calculate it
    if (!this.calculations[offset]) {
      this.calculations[offset] = this.calculateScrollPercent(offset);
    }

    return this.calculations[offset];
  }

  draw() {
    // If the image is null, return
    if (!this.image) return;

    if (window.scrollY + window.innerHeight > this.status.view.top && window.scrollY < this.status.view.bottom) {
      // Get the scroll percentage
      const percentScrolled = this.getScrollPercent();

      // Clear the canvas if alpha is enabled
      if (this.settings.alpha) {
        // Clear the buffer canvas
        this.buffer.ctx.clearRect(0, 0, this.buffer.element.width, this.buffer.element.height);
        // Draw the buffer image to the canvas
        this.canvas.ctx.clearRect(0, 0, this.canvas.element.width, this.canvas.element.height);
      }

      // Draw the image to the buffer canvas;
      try {
        let position = this.image.parallax(percentScrolled, {
          width: this.canvas.element.clientWidth,
          height: this.canvas.element.clientHeight,
        });


        this.buffer.ctx.drawImage(this.image.canvas.element, position.x, position.y);
      } catch (e) { }

      try {
        this.canvas.ctx.drawImage(this.buffer.element, 0, 0);

        // Fire the callback functions
        this.callback('draw');
      } catch (e) { }
    }
  }

  update() {
    window.requestAnimationFrame(() => {
      this.update();

      if (this.cache.scrollY != window.scrollY) {
        this.cache.scrollY = window.scrollY;
        this.draw();
      }
    });
  }

  // A method that will wait for the loaded status to be true, then run the draw function
  start() {
    window.requestAnimationFrame(() => {
      (this.status.loaded) ? this.update() : this.start();
    });
  }

  resize() {
    clearTimeout(this.timeouts['resize']);

    this.timeouts['resize'] = setTimeout(() => {
      // Tell the canvas to resize
      this.canvas.resize(this.canvas.element.clientWidth, this.canvas.element.clientHeight);
      // Tell the buffer to resize
      this.buffer.resize(this.canvas.element.clientWidth, this.canvas.element.clientHeight);

      // Loop through the layers and resize them too, they only need the width of the canvas as their height is calculated
      if (this.image) {
        this.image.resize(this.canvas.element.clientWidth, this.canvas.element.clientHeight);
      }

      // Set the view area of the canvas
      this.status.view.top = this.canvas.pageYOffset;
      this.status.view.bottom = this.canvas.pageYOffset + this.canvas.element.clientHeight;

      this.cache.canvasOffset = this.canvas.pageYOffset;

      // Clear all the calculations
      this.calculations = {};

      // Get the scroll percentages
      this.getScrollPercentages().then(() => {
        // Make sure it still draws during the resize
        this.enable();
        // Call the resize event
        this.callback('resize');
      });

      // Fire the callback functions
    }, this.settings.throttle);
  }

  callback(type, data = false) {
    // run the callback functions
    if (this.events[type]) this.events[type].forEach((event) => event(data));
  }

  on(event, func) {
    // If we loaded an event and it's not the on event and we also loaded a function
    if (event && event != 'on' && event != 'callback' && this[event] && func && typeof func == 'function') {
      if (this.events[event] == undefined) this.events[event] = [];
      // Push a new event to the event array
      this.events[event].push(func);
    }
  }
}

class ParallaxImageController {
  constructor(image, settings = {}) {
    // The actual image element
    this.image = image;
    // The visual depth of the layer
    this.depth = settings.depth;
    // The focus position of the image
    this.focus = settings.focus || '50% 50%';
    // Create a new buffer canvas
    this.canvas = new CanvasController();
    // The pixel height of the layer
    this.height = 0;
    // The pixel width of the layer
    this.width = 0;
    // The parallax position calculations
    this.calculations = {};

    // Reset the focus position to an object (50% 50% will become { x: .5, y: .5 })
    let focus = [];

    this.focus.split(' ').forEach((value) => {
      if (value.indexOf('%') > -1) {
        value = parseFloat(value) / 100;
        focus.push(Math.abs(value));
      }
    });

    let focusX = focus[0]
    let focusY = focus[1] || focus[0];

    this.focus = {
      x: focusX,
      y: focusY,
    };
  }

  resize(vw, vh) {
    // Reset the calculations
    this.calculations = {};

    // Calculate the absolute depth
    let depth = Math.abs(this.depth);

    // Calculate the extra height required by the depth
    let extraHeight = vh * ((depth * 2) / 100);

    // Set the width and height of the layer
    this.canvas.resize(vw, vh + extraHeight);

    this.width = this.canvas.element.width;
    this.height = this.canvas.element.height;

    // After we have resized the image, we want to update the canvas
    this.draw();
  }

  draw() {
    let canvasAspectRatio = this.width / this.height;
    let imageAspectRatio = this.image.naturalWidth / this.image.naturalHeight;

    let imageWidth, imageHeight;

    if (imageAspectRatio > canvasAspectRatio) {
      // Image aspect ratio is greater, scale by height
      imageWidth = this.image.naturalWidth * (this.height / this.image.naturalHeight);
      imageHeight = this.height;
    } else {
      // Canvas aspect ratio is greater/equal, scale by width
      imageWidth = this.width;
      imageHeight = this.image.naturalHeight * (this.width / this.image.naturalWidth);
    }

    // Calculate the x and y offsets
    let xOffset = (this.width - imageWidth) * this.focus.x;
    let yOffset = (this.height - imageHeight) * this.focus.y;

    // Adjust the y offset based on the depth
    yOffset = yOffset + (imageHeight * (this.depth / 100));

    // Draw the image at the calculated x and y offsets
    this.canvas.ctx.drawImage(this.image, xOffset, Math.max(0, yOffset - imageHeight), imageWidth, imageHeight);
  }

  parallax(percentage = 0, viewport = {}) {
    if (!this.calculations[percentage]) {
      // Get the center of the viewport
      let center = {
        x: (viewport.width - this.width) / 2,
        y: (viewport.height - this.height) / 2,
      };

      // Calculate the extra height required by the depth
      let extraHeight = viewport.height * (this.depth / 100);

      // Calculate the offset as a percentage of the viewport height
      let offset = extraHeight * percentage;

      // The position of the image is always centered in the viewport
      let position = {
        x: center.x,
        y: center.y + offset, // Add the offset to the y position
      }

      // Store the calculation
      this.calculations[percentage] = position;
    }

    // Return the calculation
    return this.calculations[percentage];
  }
}

/* ██████╗ █████╗ ███╗   ██╗██╗   ██╗ █████╗ ███████╗
  ██╔════╝██╔══██╗████╗  ██║██║   ██║██╔══██╗██╔════╝
  ██║     ███████║██╔██╗ ██║██║   ██║███████║███████╗
  ██║     ██╔══██║██║╚██╗██║╚██╗ ██╔╝██╔══██║╚════██║
  ╚██████╗██║  ██║██║ ╚████║ ╚████╔╝ ██║  ██║███████║
   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝ */

class CanvasController {
  constructor() {
    // Create a new canvasController element
    this.element = document.createElement('canvas');
    // The canvas context
    this.ctx = this.element.getContext('2d');
    // The page offset
    this.pageYOffset = 0;
  }

  // Resize the buffer canvas
  resize(width = 1, height = 1) {
    let offset = 0;
    let element = this.element;

    while (element) {
      offset += element.offsetTop;
      element = element.offsetParent;
    }

    this.element.width = width;
    this.element.height = height;
    // Update the pageYOffset of the canvas
    this.pageYOffset = offset;
  }
}
