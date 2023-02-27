import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { text } from 'stream/consumers'
import useStore from './store/useStore'

// const ENDPOINT = 'https://vuecxr.ddns.net'
const ENDPOINT = 'http://192.168.11.3:3000'

const useChatService = () => {
  const [chatUnits, setChatUnits] = useState<ChatUnit[]>([])

  const socket = useStore(state => state.socket)

  const setPersonDict = useStore<(PersonDict) => void>(state => state.setPersonDict)

  useEffect(() => {
    console.log('[connecting...]')

    socket.on('receive-broadcast-message', (chatUnit: ChatUnit) => {
      console.log('[message]', `from ${chatUnit.nameFrom}`, chatUnit.text)
      console.log(chatUnit)
      setChatUnits([...chatUnits, chatUnit])
      setPersonDict({
        [chatUnit.personIdFrom]: {
          currentExpression: chatUnit.expression
        }
      })
    })

    // return () => {
    //   console.log('Disconnecting..')
    //   socket.disconnect()
    // }
  }, [])

  const sendMessage = (messageText: string): void => {
    console.log('[send]', messageText);
    socket.emit('message', {text: messageText})
  }

  return [chatUnits, sendMessage]
}

export default useChatService
