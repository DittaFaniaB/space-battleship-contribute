import React, { useRef, useState } from 'react'
import cx from 'classnames'

import sendButton from 'assets/send_button.png'
import challengeButton from 'assets/challenge_button.png'
import usersTab from 'assets/users_tab.png'
import messagesTab from 'assets/messages_tab.png'

import { Container } from 'components/container'
import { TextInput } from 'components/input'

import styles from './styles.module.css'

export enum MessageType {
  USER = 'USER',
  QUITTED = 'QUITTED',
  JOINED = 'JOINED',
  CHALLENGER = 'CHALLENGER',
  CHALLENGED = 'CHALLENGED',
  ERROR = 'ERROR',
}

export type Message = {
  message?: string
  type: MessageType
  name?: string
  id?: string
  time?: number
  inactiveReason?: string
}

export type RoomTemplateProps = {
  users: Record<string, string>
  messages: Message[]
  handleSubmitMessage: (message?: string) => void
  handleSubmitChallenge: (userId?: string) => void
  handleRefuseChallengeClick?: (challengeId: string) => void
  handleAcceptChallengeClick?: (challengeId: string) => void
  handleCloseChallengeClick?: (challengeId: string) => void
}

export const RoomTemplate = ({
  users = {},
  messages = [],
  handleSubmitMessage,
  handleSubmitChallenge,
  handleRefuseChallengeClick,
  handleAcceptChallengeClick,
  handleCloseChallengeClick,
}: RoomTemplateProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined)
  return (
    <Container className={styles.container}>
      <div className={styles.topPanelsWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.usersWrapper}>
            <img src={usersTab} className={styles.panelTitle} />
            <div className={styles.users}>
              {Object.entries(users).map(([id, name]) => (
                <div
                  key={id}
                  className={cx(styles.user, selectedUser === id && styles.userSelected)}
                  onClick={() => setSelectedUser(id)}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
          <img
            src={challengeButton}
            className={styles.challengeButton}
            onClick={() => handleSubmitChallenge(selectedUser)}
          />
        </div>
        <div className={styles.rightColumn}>
          <img src={messagesTab} className={styles.panelTitle} />
          <div className={styles.messages} id="messages">
            {messages.map((message, i) => (
              <span className={styles.message} key={`message-${i}`}>
                {message.type === MessageType.JOINED ? (
                  <>
                    <span className={styles.messageName}>{message.name}</span> joined =)
                  </>
                ) : message.type === MessageType.QUITTED ? (
                  <>
                    <span className={styles.messageName}>{message.name}</span> quited =(
                  </>
                ) : message.type === MessageType.USER ? (
                  <>
                    <span className={styles.messageName}>{message.name}:</span> {message.message}
                  </>
                ) : message.type === MessageType.ERROR ? (
                  message.message
                ) : message.type === MessageType.CHALLENGED ? (
                  <>
                    The user <span className={styles.messageName}>{message.name}:</span> challenged
                    you -{' '}
                    {message.inactiveReason ? (
                      message.inactiveReason
                    ) : (
                      <>
                        <span
                          className={styles.challengeButton}
                          onClick={() => handleAcceptChallengeClick?.(message.id ?? '')}
                        >
                          Accept
                        </span>{' '}
                        |{' '}
                        <span
                          className={styles.challengeButton}
                          onClick={() => handleRefuseChallengeClick?.(message.id ?? '')}
                        >
                          Refuse
                        </span>{' '}
                        - {message.time}
                      </>
                    )}
                  </>
                ) : message.type === MessageType.CHALLENGER ? (
                  <>
                    You challenged <span className={styles.messageName}>{message.name}:</span> -{' '}
                    {message.inactiveReason ? (
                      message.inactiveReason
                    ) : (
                      <>
                        <span
                          className={styles.challengeButton}
                          onClick={() => handleCloseChallengeClick?.(message.id ?? '')}
                        >
                          Cancel
                        </span>{' '}
                        - {message.time}
                      </>
                    )}
                  </>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.messageWrapper}>
        <TextInput
          placeholder="Enter your message"
          autoComplete="off"
          ref={inputRef}
          className={styles.input}
          id="input"
        />
        <img
          src={sendButton}
          className={styles.messageButton}
          onClick={() => {
            handleSubmitMessage(inputRef.current?.value)
            if (inputRef.current) {
              inputRef.current.value = ''
            }
          }}
        />
      </div>
    </Container>
  )
}
