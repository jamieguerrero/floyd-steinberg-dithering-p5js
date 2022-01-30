let loadedImage;

var ditherFactor = 1;
// set ditherFactor range and ditherFactor with magic variables
var ditherFactorMin = 0.1;
var ditherFactorMax = 4;
var ditherFactorStep = 0.1;


function setup() {
  createCanvas(512, 512);
  
  var gui = createGui("GUI");
  gui.addGlobals("ditherFactor");
  
  noLoop();
  setLoadedImage();
}

function setLoadedImage() {
  loadedImage = loadImage("data/kitten.jpeg", display);
}

function display(img) {
  resizeCanvas(img.width, img.height);
  background(0);
  img.filter(GRAY);
  makeDithered(img, ditherFactor);
  image(img, 0, 0);
  redraw();
}

function draw() {
  setLoadedImage();
}

function imageIndex(img, x, y) {
  return 4 * (x + y * img.width);
}

function getColorAtIndex(img, x, y) {
  let idx = imageIndex(img, x, y);
  let pix = img.pixels;
  let red = pix[idx];
  let green = pix[idx + 1];
  let blue = pix[idx + 2];
  let alpha = pix[idx + 3];
  return color(red, green, blue, alpha);
}

function setColorAtIndex(img, x, y, clr) {
  let idx = imageIndex(img, x, y);

  let pix = img.pixels;
  pix[idx] = red(clr);
  pix[idx + 1] = green(clr);
  pix[idx + 2] = blue(clr);
  pix[idx + 3] = alpha(clr);
}

function closestStep(max, steps, value) {
  return round((steps * value) / max) * floor(max / steps);
}

function makeDithered(img, steps) {
  img.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtIndex(img, x, y);
      let oldR = red(clr);
      let oldG = green(clr);
      let oldB = blue(clr);
      let newR = closestStep(255, steps, oldR);
      let newG = closestStep(255, steps, oldG);
      let newB = closestStep(255, steps, oldB);

      let newClr = color(newR, newG, newB);
      setColorAtIndex(img, x, y, newClr);

      let errR = oldR - newR;
      let errG = oldG - newG;
      let errB = oldB - newB;

      distributeError(img, x, y, errR, errG, errB);
    }
  }

  img.updatePixels();
}

function distributeError(img, x, y, errR, errG, errB) {
  addError(img, 7 / 16.0, x + 1, y, errR, errG, errB);
  addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB);
  addError(img, 5 / 16.0, x, y + 1, errR, errG, errB);
  addError(img, 1 / 16.0, x + 1, y + 1, errR, errG, errB);
}

function addError(img, factor, x, y, errR, errG, errB) {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height) return;
  let clr = getColorAtIndex(img, x, y);
  let r = red(clr);
  let g = green(clr);
  let b = blue(clr);
  clr.setRed(r + errR * factor);
  clr.setGreen(g + errG * factor);
  clr.setBlue(b + errB * factor);

  setColorAtIndex(img, x, y, clr);
}


// stellarlux dithering implementation
// function makeDithered(img) {
//   img.loadPixels();
//   img.pixels.forEach((value, index, pixels) => {
//     let x = floor(index / 4) % img.width;
//     let y = floor(index / 4 / img.width);

//     pixels[index] = quantise(value);
//     let error = quantError(value);
//     if (x < img.width - 1) {
//       pixels[index + 4] += round(error * 7 / 16);
//     }
//     if (y < img.height - 1) {
//       pixels[index + img.width * 4] += round(error * 5 / 16);
//       if (x > 0) {
//         pixels[index - 4 + img.width * 4] += round(error * 3 / 16);
//       }
//       if (x < img.width - 1) {
//         pixels[index + 4 + img.width * 4] += round(error / 16);
//       }
//     }
//   });
//   img.updatePixels();
// }

// function quantise(value, factor = ditherFactor) {
//   return round(value / factor) * factor;
// }
// function quantError(value, factor = ditherFactor) {
//   return value - round(value / factor) * factor;
// }