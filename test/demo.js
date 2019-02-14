const d = {
  data: {
    temperature: 1,
    humidity: 1,
    isWindowOpening: false
  },
  decorators: {
    isHot (delta, upbound) {
      return this.temperature >= upbound
    },
    isCold (delta, downbound) {
      return this.temperature <= downbound
    },
    isDry (delta, downbound) {
      return this.humidity <= downbound
    },
    isHumid (delta, upbound) {
      return this.humidity >= upbound
    }
  },
  tasks: {
    heating () {
      this.temperature += 5
      console.log('heating--', this.temperature)
    },
    cooling () {
      this.temperature -= 3
      console.log('cooling--', this.temperature)
    },
    humidifing () {
      this.humidity += 1
    },
    roasting () {
      this.humidity -= 1
    },
    openWindow () {
      this.isWindowOpening = true
      this.temperature -= 5
      this.humidity += 5
    },
    closeWindow () {
      this.isWindowOpening = false
    }
  }
}
