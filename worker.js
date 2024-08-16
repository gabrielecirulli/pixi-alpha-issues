import { makeApplicationOptions } from './makeApplicationOptions';
import debugPng from './public/debug.png';
import {
  Application,
  Assets,
  DOMAdapter,
  Graphics,
  ImageSource,
  Sprite,
  Texture,
  WebWorkerAdapter,
} from 'pixi.js';

DOMAdapter.set(WebWorkerAdapter);

self.onmessage = function ({
  data: {
    offscreenPngCanvas,
    offscreenSvgCanvas,
    svgImageBitmapForOffscreen,
    useWebgpu,
  },
}) {
  console.log('worker got canvas objects:', {
    offscreenPngCanvas,
    offscreenSvgCanvas,
    svgImageBitmapForOffscreen,
    useWebgpu,
  });

  makePngCanvas(offscreenPngCanvas, useWebgpu);
  makeSvgCanvas(offscreenSvgCanvas, svgImageBitmapForOffscreen, useWebgpu);
};

async function makePngCanvas(offscreenPngCanvas, useWebgpu) {
  const app = new Application();
  await app.init(makeApplicationOptions(offscreenPngCanvas, useWebgpu));

  const sprite = Sprite.from(await Assets.load(debugPng));

  app.stage.addChild(sprite);
}

async function makeSvgCanvas(
  offscreenSvgCanvas,
  svgImageBitmapForOffscreen,
  useWebgpu
) {
  const app = new Application();
  await app.init(makeApplicationOptions(offscreenSvgCanvas, useWebgpu));

  const sprite = Sprite.from(
    new Texture({
      source: new ImageSource({
        resource: svgImageBitmapForOffscreen,
      }),
    })
  );

  sprite.scale = 0.5;

  app.stage.addChild(sprite);
}
