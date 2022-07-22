import 'phaser'
import { Socket } from 'socket.io-client'

import { SCENES } from 'utils/constants'

import RoomSocketHandler from './socket'
import RoomUI from './ui'

class Room extends Phaser.Scene {
  private UI?: RoomUI
  private socketHandler?: RoomSocketHandler
  private returnKey?: Phaser.Input.Keyboard.Key

  constructor() {
    super(SCENES.Room)
  }

  init(data: { webSocketClient: Socket }): void {
    this.socketHandler = new RoomSocketHandler(data.webSocketClient)
    this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
  }

  setupWebsocketListeners = (): void => {
    const handleGetUsersList = (value: string): void => {
      const users = JSON.parse(value).reduce(
        (acc: Record<string, string>, { id, name }: { id: string; name: string }) => ({
          ...acc,
          [id]: name,
        }),
        {}
      )
      this.UI?.updateUsers(users)
    }

    const handleUserDisconnected = (value: string): void => {
      this.UI?.addQuittedMessage(value)
      this.UI?.removeUser(value)
    }

    const handleCloseChallenge = (value: string): void => {
      const { challengeId, reason } = JSON.parse(value)
      if (reason === 'TIMEOUT') {
        this.UI?.setChallengeClosedMessage(challengeId, 'The challenge timed out')
        return
      }
      const name = this.socketHandler?.isMe(reason) ? 'You' : 'The opponent'
      this.UI?.setChallengeClosedMessage(
        challengeId,
        `${name ?? 'The opponent'} canceled the challenge`
      )
    }

    const handleErrorChallenge = (value: string): void => {
      const { message } = JSON.parse(value)
      this.UI?.addMessage(message)
    }

    const handleAcceptChallenge = (message: string): void => {
      const { challenger, challenged } = JSON.parse(message)
      const challengerName = this.UI?.getUserName(challenger)
      const challengedName = this.UI?.getUserName(challenged)
      this.scene.start(SCENES.ShipsSelect, {
        webSocketClient: this.socketHandler?.getWebSocketClient(),
        challenged,
        challenger,
        challengerName,
        challengedName,
      })
    }

    const handleChallenge = (value: string): void => {
      const { challengeId, challengerId, challengedId } = JSON.parse(value)
      if (this.socketHandler?.isMe(challengedId)) {
        this.UI?.addChallengedMessage(challengedId, challengeId)
        return
      }
      if (this.socketHandler?.isMe(challengerId)) {
        this.UI?.addChallengerMessage(challengedId, challengeId)
      }
    }

    const handleUserConnected = (value: string): void => {
      const item = JSON.parse(value)
      this.UI?.updateUsers({
        ...this.UI.getUsers(),
        [item.id]: item.name,
      })
      this.UI?.addJoinedMessage(item.name)
    }

    const handleRoomMessage = (value: string): void => {
      const { id, message } = JSON.parse(value)
      this.UI?.addUserMessage(id, message)
    }

    const handleDisconnect = () => {
      this.scene.start(SCENES.Identification)
    }

    this.socketHandler?.createRoomSocketHandler({
      handleGetUsersList,
      handleUserDisconnected,
      handleUserConnected,
      handleRoomMessage,
      handleChallenge,
      handleAcceptChallenge,
      handleCloseChallenge,
      handleErrorChallenge,
      handleDisconnect,
    })
  }

  setupButtonListeners = (): void => {
    const handleSubmitMessage = (message?: string): void => {
      this.socketHandler?.sendMessage(message ?? '')
    }

    const handleSubmitChallenge = (selectedValue?: string): void => {
      if (!selectedValue) {
        this.UI?.addErrorMessage('You need to select someone to challenge')
        return
      }
      if (this.socketHandler?.isMe(selectedValue)) {
        this.UI?.addErrorMessage("You can't challenge yourself, select someone else")
        return
      }
      this.socketHandler?.sendChallenge(selectedValue)
    }

    this.UI = new RoomUI(this, {
      handleSubmitChallenge,
      handleSubmitMessage,
      handleRefuseChallengeClick: (id: string) => this.socketHandler?.sendMessageRefuse(id),
      handleAcceptChallengeClick: (id: string) => this.socketHandler?.sendMessageAccept(id),
      handleCloseChallengeClick: (id: string) => this.socketHandler?.sendMessageCancel(id),
    })

    this.returnKey?.on('down', () => {
      this.UI?.sendMessage()
    })
  }

  create(): void {
    this.setupButtonListeners()
    this.setupWebsocketListeners()
    this.socketHandler?.sendGetUsersList()
  }
}

export default Room
