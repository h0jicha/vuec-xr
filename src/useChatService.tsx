import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import useStore from './store/useStore'

const ENDPOINT = 'https://vuecxr.ddns.net'

const useChatService = (initialMessage) => {
  const [messages, setMessages] = useState(initialMessage)

  const socket = useStore(state => state.socket)

  useEffect(() => {
    console.log('Connecting..')
    socket.on('broadcast', (payload) => {
      console.log('Recieved: ' + payload)
      // setMessages((prevMessages) => [...prevMessages, payload])
      setMessages((prevMessages) => payload)
    })
    return () => {
      console.log('Disconnecting..')
      socket.disconnect()
    }
  }, [])

  const sendMessage = (name, text) => {
    const aMessage = {
      name: name,
      text: text,
    }
    socket.emit('send', aMessage)
    // setMessages((prevMessages) => [...prevMessages, aMessage])
    // setMessages((prevMessages) => aMessage)
  }

  return [messages, sendMessage]
}

export default useChatService
