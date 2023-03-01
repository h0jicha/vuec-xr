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
      <span ref={infoRef1}></span><br/>
      <span ref={infoRef2}></span>
    </div>
  );
}