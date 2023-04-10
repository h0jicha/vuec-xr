import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { text } from 'stream/consumers'
import useStore from './store/useStore'

const ENDPOINT = 'https://vuec-api.ddns.net'
// const ENDPOINT = 'http://127.0.0.1:3000/'

const useChatService = () => {
  const [chatUnits, setChatUnits] = useState<ChatUnit[]>([])

  const socket = useStore((state) => state.socket)

  const updatePerson = useStore<(person: Person) => void>(
    (state) => state.updatePerson
  )

  useEffect(() => {
      socket.on('receive-broadcast-message', (chatUnit: ChatUnit) => {
        console.log('[message]', `from ${chatUnit.nameFrom}`, chatUnit.text)
        // console.log([...chatUnits, chatUnit])
        setChatUnits(prevChatUnits => [...prevChatUnits, chatUnit])
        updatePerson({ id: chatUnit.personIdFrom, expression: chatUnit.expression })
      })
  }, [])

  const sendMessage = (messageText: string): void => {
    console.log('[send]', messageText)
    socket.emit('message', { text: messageText })
  }

  // console.log(chatUnits);
  return [chatUnits, setChatUnits, sendMessage]
}

export default useChatService
