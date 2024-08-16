export function makeApplicationOptions(canvas, useWebgpu) {
  return {
    canvas,
    width: 144,
    height: 144,
    preference: useWebgpu ? 'webgpu' : 'webgl',
    resolution: 2,
    // backgroundAlpha: 0,
    backgroundColor: 0x0000ff,
  };
}
