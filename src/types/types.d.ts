interface Expression {
  Neutral: number
  Angry: number
  Relaxed: number
  Happy: number
  Sad: number
  Surprised: number
}

interface ChatUnit {
  id: string
  personIdFrom: string
  personIdsTo?: string[] // 基本使わないでおk、DM用
  nameFrom: string
  namesTo?: string[] // 基本使わないでおk、DM用
  text: string
  expression?: Expression
  voice?: Blob
  createdAt: string
}

interface Vec3 {
  x: number
  y: number
  z: number
}

interface Person {
  id: string
  socketId?: string
  name: string
  speechId?: string
  chatMemory: string[]
  position?: Vec3
  rotation?: Vec3
  currentExpression?: Expression
  avatarName?: string
  responsePolicyInitFunc: Function
  responsePolicyIterFunc: Function
  createdAt: string
}

interface PersonDict {
  [personId: string]: Person
}