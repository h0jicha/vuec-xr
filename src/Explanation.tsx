import useChatService from './useChatService'
import { useEffect, useRef, useState } from 'react'
import { useKeyboardControls } from '@react-three/drei'
import 'regenerator-runtime'
import React from 'react'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import { button, useControls } from 'leva'
import useControlsStore from './store/useControlsStore'
import { useThree } from '@react-three/fiber'

const STR_PLACEHOLDER = 'Enter to send'

export default function Explanation() {
  const [chatUnits, sendMessage] = useChatService()

  const p1Ref = useRef<HTMLParagraphElement>(null)
  const p2Ref = useRef<HTMLParagraphElement>(null)

  /**
   * Controls
   */
  // KeyboardControls
  const textInputRef = useRef<HTMLInputElement>(null)
  const setKeyboardControlsEnabled = useControlsStore(
    (state) => state.setKeyboardControlsEnabled
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && textInputRef.current) {
        textInputRef.current.focus()
      }
      if (event.key === 'Escape' && textInputRef.current) {
        textInputRef.current.blur()
      }
      if (event.keyCode === 13 &&
        textInputRef.current &&
        textInputRef.current.value != ''
      ) {
        // IME変換確定でないEnter押下時
        console.log(textInputRef.current.value)
        // textInputRef.current.blur()
        document.body.focus()
        sendMessage(textInputRef.current.value)
        textInputRef.current.value = ''

        // 簡単にクールタイム実装
        textInputRef.current.placeholder = `クールタイム中`
        setTimeout(() => {
          textInputRef.current.placeholder = STR_PLACEHOLDER
        }, 1000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleTextAreaFocus = () => {
    setKeyboardControlsEnabled(false)
  }

  const handleTextAreaBlur = () => {
    setKeyboardControlsEnabled(true)
  }

  /**
   * Speech Recognition
   */
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  const { talk } = useControls({
    talk: browserSupportsSpeechRecognition
      ? button(() => {
        handleSpeechRecognitionStart()
        })
      : '音声認識非対応（chromeで入室してください）',
  })
  const { forceSend } = useControls({
    forceSend: browserSupportsSpeechRecognition
      ? button(() => {
        handleSpeechRecognitionFinish()
        })
      : '音声認識非対応（chromeで入室してください）',
  })
  console.log(listening)

  const handleSpeechRecognitionStart = () => {
    SpeechRecognition.startListening()
  }

  const handleSpeechRecognitionFinish = () => {
    sendMessage(p2Ref.current?.innerText)
  }

  useEffect(() => {
    const chatUnit: ChatUnit = chatUnits[chatUnits.length - 1]

    // 文章表示
    if (chatUnit?.text) {
      printStringByChar(`${chatUnit.nameFrom}「${chatUnit.text}」`, p1Ref)
    }

    // 音声再生
    if (chatUnit?.voice) {
      const audio = new Audio()
      audio.src = URL.createObjectURL(new Blob([chatUnit.voice]))
      audio.play()
      chatUnits[chatUnits.length - 1].voice = null
    }
  }, [chatUnits])

  return (
    <div className='explanation'>
      <p ref={p1Ref}></p>
      <div>
        <input
          type='text'
          ref={textInputRef}
          className='chat_input'
          onFocus={handleTextAreaFocus}
          onBlur={handleTextAreaBlur}
          placeholder={STR_PLACEHOLDER}
        />
        {listening ?
          <button disabled>認識中</button>
          :
          <button onClick={handleSpeechRecognitionStart}>マイクで話す</button>
        }
      </div>
    </div>
  )
}

const INCREMENTAL_MODE = true
let interval: NodeJS.Timer

function printStringByChar(string, ref) {
  let i = 0
  ref.current.innerText = ''
  interval = setInterval(function () {
    if (INCREMENTAL_MODE) {
      if (i < string.length) {
        ref.current.innerText += string.charAt(i)
        i++
      } else {
        clearInterval(interval)
      }
    } else {
      ref.current.innerText = string
      clearInterval(interval)
    }
  }, 40)
  // }, 3)
}
