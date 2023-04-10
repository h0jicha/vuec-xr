import useChatService from './useChatService'
import { useEffect, useRef, useState } from 'react'
import 'regenerator-runtime'
import React from 'react'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import useControlsStore from './store/useControlsStore'

const STR_PLACEHOLDER = 'Enter to send'
const INCREMENTAL_MODE = true

export default function Explanation() {
  const [chatUnits, setChatUnits, sendMessage] = useChatService()
  const [speaking, setSpeaking] = useState(false)

  const p1Ref = useRef<HTMLParagraphElement>(null)

  const [inputValue, setInputValue] = useState('')

  /**
   * Controls
   */
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
      if (
        event.keyCode === 13 &&
        textInputRef.current &&
        textInputRef.current.value != ''
      ) {
        // IME変換確定でないEnter押下時
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

  const handleSpeechRecognitionStart = () => {
    SpeechRecognition.startListening()
  }

  const handleSpeechRecognitionFinish = () => {
    sendMessage(textInputRef.current?.innerText)
  }

  // transcriptが更新されたらinputValueも更新する
  useEffect(() => {
    setInputValue(transcript)
  }, [transcript])

  /**
   * Chat Speaking
   */
  const handleSpeechEnd = () => {
    setChatUnits(prevChatUnits => {
      const newChatUnits: ChatUnit[] = [...prevChatUnits]
      newChatUnits.shift()
      return newChatUnits
    })
    setSpeaking(false)
  }

  const playAudio = (chatUnit, handleSpeechEnd) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(new Blob([chatUnit.voice]));
      audio.addEventListener("ended", () => {
        handleSpeechEnd();
        URL.revokeObjectURL(audio.src); // メモリ解放
        resolve(null);
      });
      audio.play();
    });
  }

  const asyncChatSpeak = async (chatUnit: ChatUnit) => {

    let promises: Promise<unknown>[] = []
    // テキスト表示
    if (chatUnit?.text) {
      promises.push(printStringByCharAsync(`${chatUnit.nameFrom}「${chatUnit.text}」`, p1Ref))
    }

    // 音声再生
    if (chatUnit?.voice) {
      promises.push(playAudio(chatUnit, handleSpeechEnd))
    }

    await Promise.all(promises);
  }

  useEffect(() => {
    console.log('speaking', speaking, 'chatUnits', chatUnits)
    if (!speaking && chatUnits.length > 0) {
      setSpeaking(true)
      const chatUnit: ChatUnit = chatUnits[0]
      asyncChatSpeak(chatUnit)
    }
  }, [chatUnits, speaking])

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
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {listening ? (
          <button disabled>認識中</button>
        ) : browserSupportsSpeechRecognition ? 
          <button onClick={handleSpeechRecognitionStart}>
            マイクで話す
          </button>
        : 
          <button disabled>
            マイク機能は一部Chromeでのみ利用可能
          </button>
        }
      </div>
    </div>
  )
}

async function printStringByCharAsync(string, ref) {
  let i = 0;
  ref.current.innerText = '';

  while (INCREMENTAL_MODE && i < string.length) {
    ref.current.innerText += string.charAt(i);
    i++;
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  if (!INCREMENTAL_MODE) {
    ref.current.innerText = string;
  }
}
