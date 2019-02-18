const d = {
  data: {
    temperature: 1,
    humidity: 1,
    isWindowOpening: false,
    test: {
      a: 1,
      b: true,
      c: 'abc',
      d: () => {},
      e: {
        f: 1,
        g: []
      },
      h: [0, 15, 3],
      i: [
        { a: 1 },
        { a: 2 },
        { a: 3 }
      ],
      j: 23.45,
      k: null,
      l: undefined,
      m: '' + 12
    }
  },
  decorators: {
    isHot (delta, upbound = 30) {
      return this.$data.temperature >= upbound
    },
    isCold (delta, downbound = 15) {
      return this.$data.temperature <= downbound
    },
    isDry (delta, downbound = 10) {
      return this.$data.humidity <= downbound
    },
    isHumid (delta, upbound = 60) {
      return this.$data.humidity >= upbound
    }
  },
  tasks: {
    heating () {
      this.$data.temperature += 5
      console.log('heating--', this.$data.temperature)
    },
    cooling () {
      this.$data.temperature -= 3
      console.log('cooling--', this.$data.temperature)
    },
    humidifing () {
      this.$data.humidity += 1
    },
    roasting () {
      this.$data.humidity -= 1
    },
    openWindow () {
      this.$data.isWindowOpening = true
      this.$data.temperature -= 5
      this.$data.humidity += 5
    },
    closeWindow () {
      this.$data.isWindowOpening = false
    }
  }
}
