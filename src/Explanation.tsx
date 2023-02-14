import useChatService from './useChatService'
import { useEffect, useRef } from 'react'
import { useKeyboardControls } from '@react-three/drei'

export default function Explanation() {
  const [messages, sendMessage] = useChatService({
    name: '？？？',
    text: `zzz`,
  })

  const prompt = useRef(null)

  // const ctrl = useKeyboardControls((state) => state.ctrl)

  if (typeof window === 'object' && document.querySelector('.interface') && prompt.current /*&& ctrl*/) {
    const present = document.querySelector('.interface').style['pointer-events']

    if (present === 'none') {
      console.log(prompt.current)
      // document.querySelector('.interface').style['pointer-events'] = 'auto'
      // prompt.current.disabled = false
    } else {
      // document.querySelector('.interface').style['pointer-events'] = 'none'
      // prompt.current.disabled = true
    }
  }

  useEffect(() => {
    sendMessage('あなた', '')
    console.log(messages)
  }, [])

  // 音声を再生する
  if (messages && messages.voice) {
    const audio = new Audio()
    audio.src = URL.createObjectURL(new Blob([messages.voice]))
    audio.play()
    messages.voice = null
  }

  // テキストを1文字ずつ出力する
  if (messages && messages.text && prompt.current) {
    console.log(messages)
    if (messages.prompt) {
      printStringByChar(messages.prompt, 'question-text')
    }
    printStringByChar(messages.text, 'answer-text')
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      // prompt.current.disabled = true
      // document.querySelector('.interface').style['pointer-events'] = 'none'

      console.log(prompt.current)
      sendMessage('あなた', prompt.current.value)
      printStringByChar(prompt.current.value, 'question-text')
      prompt.current.value = ''
      document.getElementById('answer-text').innerText = '（思考中...）'
    }
    if (e.keyCode === 243) {
      console.log('esc')
    }
  }

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
        {/* Lorem ipsum dolor sit amet consectetur, adipisicing elit. Unde odio
        porro voluptate vero officiis laborum iste, veritatis nobis et tempora
        sunt a dolorum reiciendis illum excepturi inventore, illo nulla facere? */}
        {/* 「やっと会うことができました！私はここで先生をずっと、ずーっと待っていました！」 */}
        <p id='question'>
          {messages.senderName ? messages.senderName : 'あなた'}「<span id='question-text'></span>」
        </p>
        <p id='answer'>
          {messages.name ?? ''}「<span id='answer-text'></span>」
        </p>
        <p id='prompt'>
          {/* <label htmlFor='prompt'>あなた</label> */}
          {/* 「 */}
          <input ref={prompt} type='text' name='prompt' size='80%' onKeyDown={(e) => handleKeyDown(e)} />
          {/* 」 */}
        </p>
      </div>
    </div>
  )
}

const INCR_MODE = false
function printStringByChar(string, id) {
  let i = 0
  // const answerElement = document.getElementById(id)
  document.getElementById(id).innerText = ''
  const interval = setInterval(function () {
    if (INCR_MODE) {
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
    // }, 120);
  }, 3)
}
