(() => {
    const hueSlider = document.getElementById('hue-slider');
    const saturationSlider = document.getElementById('saturation-slider');
    const valueSlider = document.getElementById('value-slider');
    const hueIntensity = document.getElementById('hsv-hue');
    const saturationIntensity = document.getElementById('hsv-saturation');
    const valueIntensity = document.getElementById('hsv-value');
    const hslCanvas = document.getElementById('hsv-result');
    const hslContext = hslCanvas.getContext('2d');

    function hsvToHsl(h, s, v) {
      let lightness = ((2 - s) * v) / 2;
      let saturation = s;

      if (lightness !== 0) {
        if (lightness === 1) {
          saturation = 0;
        } else if (lightness < 0.5) {
          saturation = (s * v) / (lightness * 2);
        } else {
          saturation = (s * v) / (2 - lightness * 2);
        }
      }

      return [h, saturation * 100, lightness * 100];
    }

    function hsvToRgb(h, s, v) {
      const chroma = v * s;
      const hueSector = (h / 60) % 6;
      const x = chroma * (1 - Math.abs((hueSector % 2) - 1));
      const match = v - chroma;
      let red = 0;
      let green = 0;
      let blue = 0;

      if (hueSector >= 0 && hueSector < 1) {
        red = chroma;
        green = x;
      } else if (hueSector < 2) {
        red = x;
        green = chroma;
      } else if (hueSector < 3) {
        green = chroma;
        blue = x;
      } else if (hueSector < 4) {
        green = x;
        blue = chroma;
      } else if (hueSector < 5) {
        red = x;
        blue = chroma;
      } else {
        red = chroma;
        blue = x;
      }

      return [
        Math.round((red + match) * 255),
        Math.round((green + match) * 255),
        Math.round((blue + match) * 255)
      ];
    }

    function rgbToHex(red, green, blue) {
      return `#${((red << 16) | (green << 8) | blue).toString(16).toUpperCase().padStart(6, '0')}`;
    }

    function rgbCss(red, green, blue) {
      return `rgb(${red}, ${green}, ${blue})`;
    }

    function updateTrackStyles(hue, saturation, value) {
      const [satRed, satGreen, satBlue] = hsvToRgb(hue, 1, value);
      const [valueRed, valueGreen, valueBlue] = hsvToRgb(hue, saturation, 1);
      const gray = Math.round(value * 255);

      hueSlider.style.setProperty('--hsv-thumb-color', `hsl(${hue}, 100%, 50%)`);
      saturationSlider.style.background = `linear-gradient(90deg, ${rgbCss(gray, gray, gray)} 0%, ${rgbCss(satRed, satGreen, satBlue)} 100%)`;
      saturationSlider.style.setProperty('--hsv-thumb-color', rgbCss(satRed, satGreen, satBlue));
      valueSlider.style.background = `linear-gradient(90deg, rgb(0, 0, 0) 0%, ${rgbCss(valueRed, valueGreen, valueBlue)} 100%)`;
      valueSlider.style.setProperty('--hsv-thumb-color', rgbCss(valueRed, valueGreen, valueBlue));
    }

    function updateCanvas(red, green, blue, hexColor) {
      const nextWidth = hslCanvas.offsetWidth || hslCanvas.clientWidth || hslCanvas.width || 240;
      const nextHeight = hslCanvas.offsetHeight || hslCanvas.clientHeight || hslCanvas.height || 240;

      hslCanvas.width = nextWidth;
      hslCanvas.height = nextHeight;

      hslContext.fillStyle = rgbCss(red, green, blue);
      hslContext.fillRect(0, 0, hslCanvas.width, hslCanvas.height);

      hslContext.fillStyle = 'rgba(255, 255, 255, 0.82)';
      hslContext.fillRect(18, hslCanvas.height - 66, hslCanvas.width - 36, 48);

      hslContext.fillStyle = '#111827';
      hslContext.font = 'bold 22px sans-serif';
      hslContext.textAlign = 'center';
      hslContext.textBaseline = 'middle';
      hslContext.fillText(hexColor, hslCanvas.width / 2, hslCanvas.height - 42);
    }

    function updateHSVColor() {
      const hue = Number(hueSlider.value);
      const saturation = Number(saturationSlider.value);
      const value = Number(valueSlider.value);
      const [red, green, blue] = hsvToRgb(hue, saturation, value);

      hueIntensity.textContent = `${hue}°`;
      saturationIntensity.textContent = `${Math.round(saturation * 100)}%`;
      valueIntensity.textContent = `${Math.round(value * 100)}%`;

      updateTrackStyles(hue, saturation, value);
      updateCanvas(red, green, blue, rgbToHex(red, green, blue));
    }

    hueSlider.addEventListener('input', updateHSVColor);
    saturationSlider.addEventListener('input', updateHSVColor);
    valueSlider.addEventListener('input', updateHSVColor);
    window.addEventListener('resize', updateHSVColor);

    updateHSVColor();
  })();
