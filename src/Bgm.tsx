import { useEffect, useRef } from 'react'

export default function Bgm() {
  const bgm = useRef(null)

  useEffect(() => {
    bgm.current.volume = 0.5
  }, [])

  return (
    <audio src='./bgm.mp3' ref={bgm} autoPlay loop>
      あなたのブラウザーは <code>audio</code>要素をサポートしていません。
    </audio>
  )
}
