import Aquila from '../index'

Aquila.Logger.setLevel('debug')

const data = {
  temperature: 1,
  humidity: 1,
  isWindowOpening: false
}

const engine = new Aquila.Engine({
  data: data,
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
  services: {

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
})

engine.load({
  root: {
    type: 'selector',
    label: '调节温度',
    children: [
      {
        type: 'task',
        label: '制冷',
        actor: {
          id: 'cooling'
        },
        elements: [
          {
            type: 'decorator',
            label: '温度是否太高',
            actor: {
              id: 'isHot',
              params: [30]
            }
          }
        ]
      },
      {
        type: 'task',
        label: '加热',
        actor: {
          id: 'heating'
        },
        elements: [
          {
            type: 'decorator',
            label: '温度是否太低',
            actor: {
              id: 'isCold',
              params: [16]
            }
          }
        ]
      }
    ]
  }
})

// 循环执行
for (let i = 0; i < 10; i++) {
  engine.tick()
}
