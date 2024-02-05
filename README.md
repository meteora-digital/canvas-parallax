# Carallax

This class will create a canvas element to draw a parallax background image

## Installation

```bash
npm i canvas-parallax
```

## Usage

#### HTML

```html
<section class="banner">
    <img src="https://example.com/image.png" alt="Banner Image" />
</section>
```

#### JavaScript

```es6
import CanvasParallaxController from 'carallax';

const banner = document.querySelector('.banner');
const image = banner.querySelector('img');

const CanvasParallax = new CanvasParallaxController({
    // The depth is the pixel movement of the image - 200 is 100px up and 100px down
    depth: 200,
});
```

#### Put the canvas into the document

```es6
banner.appendChild(Carallax.canvas.element);
```

#### We can either load SVGs from the DOM
```es6
// The"50% 50%" is the main focus point of the image, it can be set to 0% 0% for top left hand corner or 100% 100% for bottom right hand corner etc.
Carallax.load(image.src, "50% 50%");
```

## Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `depth` | `number` | The depth of the parallax effect. | `50` |
| `throttle` | `number` | The resize calculations throttle time in milliseconds. | `100` |
| `dpr ` | `number` | The device pixed ratio | `window.devicePixelRatio` |

## License
[MIT](https://choosealicense.com/licenses/mit/)
