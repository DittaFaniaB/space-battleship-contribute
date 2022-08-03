import './style.css'
import 'normalize.css'
import 'phaser'
import { PHASER_CONFIG } from './config/phaser'
import Identification from 'scenes/identification'
import Room from 'scenes/room'
import { SCENES } from './utils/constants'
import Boot from 'scenes/boot'
import ShipsSelect from 'scenes/ships-select'
import GameScene from 'scenes/game'
import { AppUpdate, AppUpdateAvailability } from '@robingenz/capacitor-app-update'

class Game extends Phaser.Game {
  constructor() {
    super(PHASER_CONFIG)
    this.scene.add(SCENES.Boot, Boot)
    this.scene.add(SCENES.Identification, Identification)
    this.scene.add(SCENES.Room, Room)
    this.scene.add(SCENES.ShipsSelect, ShipsSelect)
    this.scene.add(SCENES.Game, GameScene)

    this.scene.start(SCENES.Boot)
  }
}

const startFlexibleUpdate = async () => {
  const result = await AppUpdate.getAppUpdateInfo()
  if (result.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
    return
  }
  if (result.flexibleUpdateAllowed) {
    await AppUpdate.startFlexibleUpdate()
  }
}

window.onload = async function (): Promise<void> {
  new Game()
  try {
    await startFlexibleUpdate()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.info('No update needed')
  }
  window.addEventListener('resize', function () {
    const newHeight = window.innerHeight
    const app = document.querySelector('#app') as HTMLDivElement
    app.style.height = `${newHeight}px`
  })
}
