import {
  Application,
  Assets,
  ImageSource,
  isSafari,
  Sprite,
  Texture,
} from 'pixi.js';
import Worker from './worker.js?worker';
import './style.css';
import debugPng from './public/debug.png';
import debugSvg from './public/debug.svg';
import { makeApplicationOptions } from './makeApplicationOptions';

// Checkbox
const checkbox = document.getElementById('useWebgpu');
const rawUseWebgpu = localStorage.getItem('__useWebgpu');
const useWebgpu = rawUseWebgpu === null ? false : JSON.parse(rawUseWebgpu);
checkbox.checked = useWebgpu;

checkbox.addEventListener('change', (event) => {
  localStorage.setItem('__useWebgpu', JSON.stringify(event.target.checked));
  window.location.reload();
});

// Local canvas
makeLocalPngCanvas();
makeLocalSvgCanvas();

// OffscreenCanvas
const worker = new Worker();

const offscreenPngCanvas = document
  .getElementById('offscreenPngCanvas')
  .transferControlToOffscreen();
const offscreenSvgCanvas = document
  .getElementById('offscreenSvgCanvas')
  .transferControlToOffscreen();
const svgImageBitmapForOffscreen = await makeImageBitmapFromSvg(
  debugSvg,
  144,
  144,
  2
);

worker.postMessage(
  {
    offscreenPngCanvas,
    offscreenSvgCanvas,
    svgImageBitmapForOffscreen,
    useWebgpu,
  },
  [offscreenPngCanvas, offscreenSvgCanvas, svgImageBitmapForOffscreen]
);

async function makeLocalPngCanvas() {
  const canvas = document.getElementById('pngCanvas');

  const app = new Application();
  await app.init(makeApplicationOptions(canvas, useWebgpu));

  const sprite = Sprite.from(await Assets.load(debugPng));

  app.stage.addChild(sprite);
}

async function makeLocalSvgCanvas() {
  const canvas = document.getElementById('svgCanvas');

  const app = new Application();
  await app.init(makeApplicationOptions(canvas, useWebgpu));

  const sprite = Sprite.from(await makeTextureFromSvg(debugSvg, 144, 144, 2));
  sprite.scale = 0.5;

  app.stage.addChild(sprite);
}

async function makeTextureFromSvg(svgPath, width, height, resolution) {
  return new Texture({
    source: new ImageSource({
      resource: await makeImageBitmapFromSvg(
        svgPath,
        width,
        height,
        resolution
      ),
    }),
  });
}

async function makeImageBitmapFromSvg(svgPath, width, height, resolution) {
  const svg = await fetch(svgPath).then((res) => res.text());
  const dataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return new Promise((resolve) => {
    const image = new Image();

    const adjustedWidth = width * resolution;
    const adjustedHeight = height * resolution;

    image.width = adjustedWidth;
    image.height = adjustedHeight;

    if (isSafari()) {
      // In Safari, unless the image has actually been rendered in the document
      // at the `renderResolution`, `ctx.drawImage` will not scale the image and
      // instead will just draw the image at its natural size, resulting in
      // blurry images. To work around this, we render the image in a visually
      // hidden container and then draw the image from there.
      getVisuallyHiddenContainer().appendChild(image);
    }

    image.onload = function () {
      isSafari()
        ? // In Safari it appears necessary to wait for the image to be rendered
          // before drawing it to a canvas if you want the resolution to be
          // respected.
          requestAnimationFrame(renderToCanvas)
        : renderToCanvas();
    };

    image.src = dataURL;

    function renderToCanvas() {
      const canvas = document.createElement('canvas');

      canvas.width = adjustedWidth;
      canvas.height = adjustedHeight;

      const ctx = canvas.getContext('2d');

      ctx.drawImage(image, 0, 0, adjustedWidth, adjustedHeight);

      resolve(createImageBitmap(canvas));

      if (isSafari()) {
        getVisuallyHiddenContainer().removeChild(image);
      }
    }
  });
}

function getVisuallyHiddenContainer() {
  if (!window.visuallyHiddenContainer) {
    window.visuallyHiddenContainer = document.createElement('div');

    window.visuallyHiddenContainer.setAttribute('aria-hidden', 'true');
    window.visuallyHiddenContainer.setAttribute('tabindex', '-1');
    window.visuallyHiddenContainer.style.position = 'absolute';
    window.visuallyHiddenContainer.style.visibility = 'hidden';
    window.visuallyHiddenContainer.style.opacity = '0';
    window.visuallyHiddenContainer.style.pointerEvents = 'none';
    window.visuallyHiddenContainer.style.zIndex = '-999';
    window.visuallyHiddenContainer.style.top = '-10000px';
    window.visuallyHiddenContainer.style.left = '-10000px';

    document.body.appendChild(window.visuallyHiddenContainer);
  }

  return window.visuallyHiddenContainer;
}
