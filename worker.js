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
  data: { offscreenPngCanvas, offscreenSvgCanvas, svgImageBitmapForOffscreen },
}) {
  console.log(
    'worker got canvas objects:',
    offscreenPngCanvas,
    offscreenSvgCanvas,
    svgImageBitmapForOffscreen
  );

  makePngCanvas(offscreenPngCanvas);
  makeSvgCanvas(offscreenSvgCanvas, svgImageBitmapForOffscreen);
};

async function makePngCanvas(offscreenPngCanvas) {
  const app = new Application();
  await app.init({
    canvas: offscreenPngCanvas,
    width: 144,
    height: 144,
    preference: 'webgpu',
    resolution: 2,
    backgroundAlpha: 0,
  });

  const sprite = Sprite.from(await Assets.load(debugPng));

  app.stage.addChild(sprite);
}

async function makeSvgCanvas(offscreenSvgCanvas, svgImageBitmapForOffscreen) {
  const app = new Application();
  await app.init({
    canvas: offscreenSvgCanvas,
    width: 144,
    height: 144,
    preference: 'webgpu',
    resolution: 2,
    // premultipliedAlpha: false,
    // // backgroundColor: '#99897A',
    // // backgroundAlpha: 0,

    powerPreference: 'high-performance',
    eventMode: 'none',
    preference: 'webgl',
    // premultipliedAlpha: false,
    // backgroundColor: "#99897A",
    backgroundAlpha: 0,
  });

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
