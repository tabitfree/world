import { useHelper } from '@react-three/drei'
import { useRef } from 'react'
import { DirectionalLightHelper } from 'three'

export const Lights: React.FC = () => {
  const lightRef = useRef<THREE.DirectionalLight>()

  useHelper(lightRef, DirectionalLightHelper, 5, 'red')

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        ref={lightRef}
        position={[0, 10, 10]}
        castShadow
        shadow-mapSize-height={10000}
        shadow-mapSize-width={10000}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
      <hemisphereLight args={['#7cdbe6', '#5e9c49', 0.7]} />
    </>
  )
}
