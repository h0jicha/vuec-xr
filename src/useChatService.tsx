import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const ENDPOINT = 'http://192.168.11.2:3040'

const useChatService = (initialMessage) => {
  const [messages, setMessages] = useState(initialMessage)

  const socketRef = useRef<Socket>(null)

  useEffect(() => {
    console.log('Connecting..')
    socketRef.current = io(ENDPOINT, {
      transports: ['websocket'],
    })
    socketRef.current.on('broadcast', (payload) => {
      console.log('Recieved: ' + payload)
      // setMessages((prevMessages) => [...prevMessages, payload])
      setMessages((prevMessages) => payload)
    })
    return () => {
      console.log('Disconnecting..')
      socketRef.current.disconnect()
    }
  }, [])

  const sendMessage = (name, text) => {
    const aMessage = {
      name: name,
      text: text,
    }
    socketRef.current.emit('send', aMessage)
    // setMessages((prevMessages) => [...prevMessages, aMessage])
    // setMessages((prevMessages) => aMessage)
  }

  return [messages, sendMessage]
}

export default useChatService
