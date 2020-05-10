export default {
  darkenColor (colorHex: string, percent: number): string | false {
    if (!/^#?[0-9A-F]{6}$/i.test(colorHex)) {
      return false
    }
    if (percent < -1 || percent > 1) {
      return false
    }
    let rgb = this.hexToRgb(colorHex)
    if (!rgb) {
      return false
    }
    let { r, g, b } = rgb
    r = Math.round(r - (255 - r) * percent)
    g = Math.round(g - (255 - g) * percent)
    b = Math.round(b - (255 - b) * percent)
    return this.rgbToHex({ r: r < 0 ? 0 : r, g: g < 0 ? 0 : g, b: b < 0 ? 0 : b })
  },

  hexToRgb (colorHex: string): { r: number, g: number, b: number } | false {
    if (!/^#?[0-9A-F]{6}$/i.test(colorHex)) {
      return false
    }
    const rgbArr = colorHex.replace('#', '').match(/../g)
    if (!rgbArr) {
      return false
    }
    return {
      r: parseInt(rgbArr[0], 16),
      g: parseInt(rgbArr[1], 16),
      b: parseInt(rgbArr[2], 16)
    }
  },

  rgbToHex ({ r, g, b }: { r: number, g: number, b: number }) {
    const reg = /^\d{1,3}$/
    if (!reg.test(r + '') || !reg.test(g + '') || !reg.test(b + '')) {
      return false
    }
    let colorHex = '#'
    const hexs = [r.toString(16), g.toString(16), b.toString(16)]
    hexs.forEach((hex: string) => {
      if (hex.length === 1) {
        colorHex += '0' + hex
      } else {
        colorHex += hex
      }
    })
    return colorHex
  }
}
