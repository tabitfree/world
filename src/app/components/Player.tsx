import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei'
import { useInput } from '../hooks'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

let walkDirection = new THREE.Vector3()
let rotateAngle = new THREE.Vector3(0, 1, 0)
let rotateQuaternion = new THREE.Quaternion()
let cameraTarget = new THREE.Vector3()

const directionOffset = ({ forward, backward, left, right }) => {
  if (forward) {
    if (left) return Math.PI / 4 // w+a

    if (right) return -Math.PI / 4 // w+d
  }

  if (backward) {
    if (left) return Math.PI / 4 + Math.PI / 2 // s+a

    if (right) return -Math.PI / 4 - Math.PI / 2 // s+d

    return Math.PI // s
  }

  if (left) return Math.PI / 2 // a

  if (right) return -Math.PI / 2 // d

  return 0
}

export const Player = () => {
  const { forward, backward, left, right, jump, shift } = useInput()
  const model = useGLTF('./models/player.glb')
  const { actions } = useAnimations(model.animations, model.scene)

  model.scene.scale.set(0.5, 0.5, 0.5)

  model.scene.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true
    }
  })

  const currentAction = useRef('')
  const controlsRef = useRef<typeof OrbitControls>()
  const camera = useThree((state) => state.camera)

  const updateCameraTarget = (moveX: number, moveZ: number) => {
    // move camera
    camera.position.x += moveX
    camera.position.z += moveZ

    //update camera target
    cameraTarget.x = model.scene.position.x
    cameraTarget.y = model.scene.position.y + 0.4
    cameraTarget.z = model.scene.position.z
    if (controlsRef.current) controlsRef.current.target = cameraTarget
  }

  useEffect(() => {
    let action = ''

    if (forward || backward || left || right) {
      action = 'walking'
      if (shift) {
        action = 'running'
      }
    } else if (jump) {
      action = 'jump'
    } else {
      action = 'idle'
    }

    if (currentAction.current != action) {
      const nextActionPlay = actions[action]
      const current = actions[currentAction.current]
      current?.fadeOut(0.2)
      nextActionPlay?.reset().fadeIn(0.2).play()
      currentAction.current = action
    }
  }, [forward, backward, left, right, jump, shift])

  useFrame((state, delta) => {
    if (
      currentAction.current == 'running' ||
      currentAction.current == 'walking'
    ) {
      //calculate towards camera direction
      let angleYCameraDirection = Math.atan2(
        camera.position.x - model.scene.position.x,
        camera.position.z - model.scene.position.z
      )

      // diagonal movement angle offset
      let newDirectionOffset = directionOffset({
        forward,
        backward,
        left,
        right,
      })

      // rotate model
      rotateQuaternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDirection + newDirectionOffset
      )

      model.scene.quaternion.rotateTowards(rotateQuaternion, 0.2)

      // calculate direction

      camera.getWorldDirection(walkDirection)
      walkDirection.y = 0
      walkDirection.normalize()
      walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset)

      //run/walk velocity
      const velocity = currentAction.current == 'running' ? 10 : 5

      // move model & camera
      const moveX = walkDirection.x * velocity * delta
      const moveZ = walkDirection.z * velocity * delta
      model.scene.position.x += moveX
      model.scene.position.z += moveZ

      updateCameraTarget(moveX, moveZ)
    }
  })

  useEffect(() => {
    actions?.idle?.play()
  }, [])

  return (
    <>
      <OrbitControls ref={controlsRef} enableZoom={false} enablePan={false} />
      <primitive object={model.scene} />
    </>
  )
}
