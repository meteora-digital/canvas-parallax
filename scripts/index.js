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
    this.settings = {
      alpha: false,
      depth: 50,
      preload: true,
      throttle: 100,
      precision: 5
    }

    // Object assign the user settings
    for (const key in this.settings) {
      if (Object.hasOwnProperty.call(this.settings, key) && options[key]) this.settings[key] = options[key];
    }

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

    // An intersection observer
    this.IntersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) this.resize();
      });
    });

    // Observe the canvas element
    this.ResizeObserver.observe(this.canvas.element);
    this.IntersectionObserver.observe(this.canvas.element);

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
    const distance = (offset + window.innerHeight) - (this.canvas.pageYOffset);
    const decimalPlaces = this.settings.precision;
    const alignment = (decimalPlaces * .5);


    const calculation = distance / ((window.innerHeight + this.canvas.element.clientHeight) / decimalPlaces);
    const decimal = ((calculation - alignment) * 2) / decimalPlaces;
    const result = decimal;

    return result.toFixed(decimalPlaces);
  }

  getScrollPercentages() {
    this.calculations = {};

    if (this.status.initialized || this.settings.preload) {
      const from = this.canvas.pageYOffset - window.innerHeight;
      const to = from + this.canvas.element.clientHeight + window.innerHeight;

      for (let index = from; index < to; index++) {
        this.calculations[index] = this.calculateScrollPercent(index);

        // Make sure the image is loaded
        if (this.image) {
          this.image.parallax(this.calculations[index], {
            width: this.canvas.element.clientWidth,
            height: this.canvas.element.clientHeight,
          });
        }
      }

      this.status.initialized = true;
    }
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

      console.log('image-width: ', this.image.canvas.element.width);
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

      // Make sure it still draws during the resize
      this.enable();

      // Clear all the calculations
      this.calculations = {};
      this.getScrollPercentages();

      // Fire the callback functions
      this.callback('resize');
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
    this.depth = settings.depth || 50;
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

    // Get the aspect ratio of the image
    const imgAspectRatio = this.image.naturalWidth / this.image.naturalHeight;

    // Calculate the dimensions of the canvas based on the larger of the viewport width and the viewport height times the image's aspect ratio
    let canvasWidth = Math.max(vw, vh * imgAspectRatio);
    let canvasHeight = canvasWidth / imgAspectRatio;

    // Calculate the extra height required by the depth
    let extraHeight = vh * this.depth / 100;

    // If the image's natural height isn't enough to cover the extra height, add the extra height to the canvas height
    if (this.image.naturalHeight < vh + extraHeight) {
      canvasHeight += extraHeight;
    }

    // Set the width and height of the layer
    this.canvas.resize(canvasWidth, canvasHeight);

    this.width = this.canvas.element.width;
    this.height = this.canvas.element.height;

    // After we have resized the image, we want to update the canvas
    this.draw();
  }

  draw() {
    // Calculate the scale factor to cover the canvas while maintaining the image's aspect ratio
    const scale = Math.max(
      this.canvas.element.width / this.image.naturalWidth,
      this.canvas.element.height / this.image.naturalHeight
    );

    // Calculate the size to draw the image at
    const drawWidth = this.image.naturalWidth * scale;
    const drawHeight = this.image.naturalHeight * scale;

    // Calculate the position to draw the image at so it's centered on the canvas
    const x = (this.canvas.element.width - drawWidth) / 2;
    const y = (this.canvas.element.height - drawHeight) / 2;

    // Draw the image on the canvas at the calculated size and position
    this.canvas.ctx.drawImage(this.image, x, y, drawWidth, drawHeight);
  }

  parallax(percentage = 0, viewport = {}) {
    if (!this.calculations[percentage]) {
      // Get the center of the viewport
      let center = {
        x: (viewport.width - this.width) / 2,
        y: (viewport.height - this.height) / 2,
      };

      // get the overflow values for the image in the viewport
      let overflow = {
        x: this.width - viewport.width,
        y: this.height - viewport.height,
      }

      // Calculate the maximum possible focal point that will not expose the edge of the image
      let maxFocusY = (this.height - viewport.height) / (2 * overflow.y);

      // If the user-defined focus point is greater than the maximum, use the maximum
      let focusY = Math.min(this.focus.y, maxFocusY);

      // Calculate the extra height required by the depth
      let extraHeight = viewport.height * (this.depth / 100);

      // Calculate a dynamic focal point based on the image height, viewport height, and depth
      let dynamicFocusY = (this.height - extraHeight) / (2 * viewport.height);

      // Use the larger of the user-defined focal point and the dynamic focal point
      focusY = Math.max(focusY, dynamicFocusY);

      // Calculate the offset as a percentage of the viewport height
      let offset = extraHeight * percentage;

      // Calculate the maximum possible x focal point that will not expose the edge of the image
      let maxFocusX = overflow.x !== 0 ? (this.width - viewport.width) / (2 * overflow.x) : this.focus.x;

      // If the user-defined x focus point is greater than the maximum, use the maximum
      let focusX = Math.min(this.focus.x, maxFocusX);

      // Using the overflow and the focus, calculate the position of the image
      let position = {
        x: center.x + (overflow.x * (0.5 - focusX)),
        y: center.y + (overflow.y * (0.5 - focusY)),
      }

      // Add the offset to the y position
      position.y += offset;

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
