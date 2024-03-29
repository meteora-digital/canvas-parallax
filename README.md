# Canvas Parallax

This class will create a canvas element to draw a parallax background image

## Example

[Canvas Parallax Example on CodePen](https://codepen.io/meteora-digital/full/abMePNr)

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
import CanvasParallaxController from 'canvas-parallax';

const banner = document.querySelector('.banner');
const image = banner.querySelector('img');

const CanvasParallax = new CanvasParallaxController({
    // The depth is the pixel movement of the image - 200 is 100px up and 100px down
    depth: 200,
});
```

#### Put the canvas into the document

```es6
banner.appendChild(CanvasParallax.canvas.element);
```

#### We can load image src URLs from the DOM
```es6
// The"50% 50%" is the main focus point of the image, it can be set to 0% 0% for top left hand corner or 100% 100% for bottom right hand corner etc.
CanvasParallax.load(image.src, "50% 50%");
```

## Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `alpha` | `boolean` | Whether or not the canvas needs to be cleared between each render. | `false` |
| `depth` | `number` | The depth of the parallax effect. | `50` |
| `preload ` | `boolean` | Whether or not the class will pre-calculate all the positions of the parallax | `true` |
| `throttle` | `number` | The resize calculations throttle time in milliseconds. | `100` |

## License
[MIT](https://choosealicense.com/licenses/mit/)
