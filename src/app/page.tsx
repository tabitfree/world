'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'

import { Lights, Ground, Trees, Player } from './components'

export default function Home() {
  const testing = true

  return (
    <div className='container'>
      <Canvas shadows camera={{ position: [0, 1, 2] }}>
        {testing ? <Stats /> : null}
        {testing ? <axesHelper args={[2]} /> : null}
        {testing ? <gridHelper args={[10, 10]} /> : null}

        {/* <OrbitControls /> */}

        <Player />

        <Trees boundary={30} count={20} />

        <Lights />
        <Ground />
      </Canvas>
    </div>
  )
}
