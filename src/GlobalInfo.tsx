import React, { useState, useEffect, useRef } from 'react';
import useStore from './store/useStore';

export default function GlobalInfo() {
  const personDict = useStore<PersonDict>((state) => state.personDict)
  const socket = useStore(state => state.socket)
  const infoRef1 = useRef<HTMLSpanElement>(null)
  const infoRef2 = useRef<HTMLSpanElement>(null)

  const persons = Object.entries(personDict).map((arr) => arr[1])
  const currentPersonNum = persons.length // 自分を含めない

  useEffect(() => {
    if (infoRef1.current && infoRef2.current) {
      infoRef1.current.innerText = socket.connected ? `online 現在の入室者: ${currentPersonNum + 1} 人 (me: ${socket.id})` : 'offline'
    }
    infoRef2.current.innerText = persons.map((p) => p.name?.length > 7 ? `${p.name.slice(0, 7)}...` : p.name).join(', ')
  }, [personDict, socket])
  

  return (
    <div className='global_info'>
      <span ref={infoRef1}></span>
      <br/>
      <span ref={infoRef2}></span>
      <br />
      <div className="tooltip">
        ℹ️
        <i className="fas fa-info-circle"></i>
        <span className="tooltip-text">
          <h2>Virtual UEC</h2>
          <h4>注意事項</h4>
          <ul>
            <li>ブラウザはPCのChrome推奨です。</li>
            <li>適宜ブラウザでサイトの音声許可をしてください。ページをリロードしてBGMが流れたら成功です。</li>
            <li>マイク会話には一部のブラウザのみ対応しています。(PCの一部Chromeなど)</li>
            <li>おためしくんは間違ったことをよく言います。</li>
            <li>悪意のあるご利用はおやめください。</li>
          </ul>
          <h4>スマホ・タブレットからの入室について</h4>
          <ul>
            <li>スマホ・タブレットからの入室は動作が特に不安定になりますが、実験的に提供しています。</li>
            <li>現在は、ARモードのみ対応としています。</li>
            <li>ARモードを使用するためには、WebXR対応のブラウザアプリから入室してください。</li>
            <li>例）iOSの場合: <a href='https://apps.apple.com/us/app/webxr-viewer/id1295998056'>WebXR Viewer</a></li>
          </ul>
          <p></p>
          <h4>クレジット</h4>
          <p>[話者]</p>
          <p>VOICEVOX:櫻歌ミコ</p>
          <p>VOICEVOX:猫使ビィ</p>
          <p>VOICEVOX:春歌ナナ</p>
          <p>VOICEVOX</p>
          <a href='https://voicevox.hiroshiba.jp/'>https://voicevox.hiroshiba.jp/</a>
          <p></p>
          <p>[BGM]</p>
          <p>DOVA-SYNDROME</p>
          <a href='https://dova-s.jp'>https://dova-s.jp</a>
          <p></p>
        </span>
      </div>
    </div>
  );
}