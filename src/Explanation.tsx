import useChatService from './useChatService'
import { useEffect, useRef } from 'react'
import { useKeyboardControls } from '@react-three/drei'
import 'regenerator-runtime'
import React from 'react'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import { button, useControls } from 'leva'

export default function Explanation() {
  const [chatUnits, sendMessage] = useChatService()

  // const prompt = useRef(null)

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  const { talk } = useControls({
    talk: browserSupportsSpeechRecognition
      ? button(() => {
          // resetTranscript()
          SpeechRecognition.startListening()
          // const f = () => {
          //   if (listening) {
          //     setTimeout(f, 1000)
          //   } else {
          //     const text = document.getElementById('p2').innerText
          //     console.log(text)
          //     sendMessage(text)
          //   }
          // }
          // setTimeout(f, 1000)
        })
      : '音声認識非対応の環境です',
  })
  const { forceSend } = useControls({
    forceSend: browserSupportsSpeechRecognition
      ? button(() => { 
        sendMessage(document.getElementById('p2')?.innerText)
        // resetTranscript()
      })
      : '音声認識非対応の環境です',
  })
  console.log(listening)

  useEffect(() => {
    const chatUnit: ChatUnit = chatUnits[chatUnits.length - 1]

    // 文章表示
    if (chatUnit?.text) {
      printStringByChar(`${chatUnit.nameFrom}「${chatUnit.text}」`, 'p1')
    }

    // 音声再生
    if (chatUnit?.voice) {
      const audio = new Audio()
      audio.src = URL.createObjectURL(new Blob([chatUnit.voice]))
      audio.play()
      chatUnits[chatUnits.length - 1].voice = null
    }
  }, [chatUnits])

  // // 音声を再生する
  // if (messages && messages.voice) {
  //   const audio = new Audio()
  //   audio.src = URL.createObjectURL(new Blob([messages.voice]))
  //   audio.play()
  //   messages.voice = null
  // }

  // const handleKeyDown = (e) => {
  //   if (e.keyCode === 13) {
  //     // prompt.current.disabled = true
  //     // document.querySelector('.interface').style['pointer-events'] = 'none'

  //     console.log(prompt.current)
  //     sendMessage('あなた', prompt.current.value)
  //     printStringByChar(prompt.current.value, 'question-text')
  //     prompt.current.value = ''
  //     document.getElementById('answer-text').innerText = '（思考中...）'
  //   }
  //   if (e.keyCode === 243) {
  //     console.log('esc')
  //   }
  // }

  // if (prompt.current) {
  //   prompt.current.value = ''
  //   prompt.current.disabled = true
  //   document.querySelector('.interface').style['pointer-events'] = 'none'
  //   // setTimeout(() => {
  //   //   prompt.current.disabled = document.querySelector('.interface').style['pointer-events'] !== 'none' ? false : true
  //   //   prompt.current.value = ''
  //   // }, 3000)
  // }

  return (
    <div className='interface'>
      <div className='explanation'>
        <p id='p1'></p>
        <p id='p2'>{transcript}</p>
      </div>
    </div>
  )
}

const INCREMENTAL_MODE = true
let interval: NodeJS.Timer

function printStringByChar(string, id) {
  let i = 0
  document.getElementById(id).innerText = ''
  interval = setInterval(function () {
    if (INCREMENTAL_MODE) {
      if (i < string.length) {
        document.getElementById(id).innerText += string.charAt(i)
        i++
      } else {
        clearInterval(interval)
      }
    } else {
      document.getElementById(id).innerText = string
      clearInterval(interval)
    }
    }, 80);
  // }, 3)
}
