const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function createTmsSwooshIcon(size) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = size * 0.46;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Dark circular background
        let r = 11;
        let g = 17;
        let b = 27;

        // Border ring
        if (dist >= radius - size * 0.03) {
          r = 31;
          g = 41;
          b = 55;
        }

        // Angle in radians (-PI to PI)
        const angle = Math.atan2(dy, dx);

        // 1. Red Top/Left Orbit Swoosh (Angle roughly -3.0 to 0.2 rad, radius roughly 0.32 to 0.43)
        const rNormRed = dist / radius;
        if (dy < size * 0.05 && rNormRed >= 0.72 && rNormRed <= 0.94) {
          // Angle checks for upper swoosh
          if (angle < 0.2 && angle > -2.9) {
            const intensity = Math.sin((rNormRed - 0.72) / 0.22 * Math.PI);
            r = Math.round(r * (1 - intensity) + 255 * intensity);
            g = Math.round(g * (1 - intensity) + 30 * intensity);
            b = Math.round(b * (1 - intensity) + 86 * intensity);
          }
        }

        // 2. Cyan Bottom/Right Orbit Swoosh (Angle roughly 0.2 to 3.0 rad, radius roughly 0.72 to 0.94)
        if (dy > -size * 0.05 && rNormRed >= 0.72 && rNormRed <= 0.94) {
          if (angle > 0.2 && angle < 2.9) {
            const intensity = Math.sin((rNormRed - 0.72) / 0.22 * Math.PI);
            r = Math.round(r * (1 - intensity) + 0 * intensity);
            g = Math.round(g * (1 - intensity) + 229 * intensity);
            b = Math.round(b * (1 - intensity) + 255 * intensity);
          }
        }

        // 3. Central Letters "TMS" (Bold, blocky geometric representation)
        // Letter T:
        const inTBar = dy >= -size * 0.16 && dy <= -size * 0.07 && dx >= -size * 0.30 && dx <= -size * 0.10;
        const inTStem = dy >= -size * 0.07 && dy <= size * 0.16 && dx >= -size * 0.23 && dx <= -size * 0.17;
        
        // Letter M:
        const inMLeft = dy >= -size * 0.16 && dy <= size * 0.16 && dx >= -size * 0.07 && dx <= -size * 0.02;
        const inMRight = dy >= -size * 0.16 && dy <= size * 0.16 && dx >= size * 0.02 && dx <= size * 0.07;
        const inMMid = dy >= -size * 0.16 && dy <= size * 0.02 && Math.abs(dx) <= size * 0.025;

        // Letter S:
        const inSTop = dy >= -size * 0.16 && dy <= -size * 0.09 && dx >= size * 0.10 && dx <= size * 0.28;
        const inSMid = dy >= -size * 0.03 && dy <= size * 0.03 && dx >= size * 0.10 && dx <= size * 0.28;
        const inSBot = dy >= size * 0.09 && dy <= size * 0.16 && dx >= size * 0.10 && dx <= size * 0.28;
        const inSUp = dy >= -size * 0.09 && dy <= 0 && dx >= size * 0.10 && dx <= size * 0.15;
        const inSDn = dy >= 0 && dy <= size * 0.09 && dx >= size * 0.23 && dx <= size * 0.28;

        if (inTBar || inTStem || inMLeft || inMRight || inMMid || inSTop || inSMid || inSBot || inSUp || inSDn) {
          // Vibrant cyan gradient
          const textGrad = (dy + size * 0.16) / (size * 0.32);
          r = Math.round(255 * (1 - textGrad) + 0 * textGrad);
          g = Math.round(255 * (1 - textGrad) + 210 * textGrad);
          b = Math.round(255 * (1 - textGrad) + 255 * textGrad);
        }

        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      } else {
        // Outside circle
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      }
    }
  }

  return png;
}

const assetsDir = path.join(__dirname, '..', 'assets');

// Favicon
const favicon = createTmsSwooshIcon(64);
favicon.pack().pipe(fs.createWriteStream(path.join(assetsDir, 'favicon.png'))).on('finish', () => {
  console.log('Generated orbit swoosh favicon.png');
});

// App Icon
const appIcon = createTmsSwooshIcon(512);
appIcon.pack().pipe(fs.createWriteStream(path.join(assetsDir, 'icon.png'))).on('finish', () => {
  console.log('Generated orbit swoosh icon.png');
});
