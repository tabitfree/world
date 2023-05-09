import { useLoader } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

type TreeType = {
  position: { x: number; z: number }
  box: number
}

type Props = {
  boundary: number
  count: number
}

export const Trees: React.FC<Props> = ({ boundary, count }) => {
  const model = useLoader(GLTFLoader, './models/treee.glb')

  const [trees, setTrees] = useState<TreeType[]>([])

  model.scene.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true
    }
  })

  const boxIntersect = (
    minAx: number,
    minAz: number,
    maxAx: number,
    maxAz: number,
    minBx: number,
    minBz: number,
    maxBx: number,
    maxBz: number
  ) => {
    let aLeftOfB = maxAx < minBx
    let aRightOfB = minAx > maxBx
    let aAboveB = minAz > maxBz
    let aBelowB = maxAz < minBz

    return !(aLeftOfB || aRightOfB || aAboveB || aBelowB)
  }

  const isOverlapping = (index: number, tree: any, trees: any[]) => {
    const minTargetX = tree.position.x - tree.box / 2
    const maxTargetX = tree.position.x + tree.box / 2
    const minTargetZ = tree.position.z - tree.box / 2
    const maxTargetZ = tree.position.z + tree.box / 2

    for (let i = 0; i < index; i++) {
      let minChildX = trees[i].position.x - trees[i].box / 2
      let maxChildX = trees[i].position.x + trees[i].box / 2
      let minChildZ = trees[i].position.z - trees[i].box / 2
      let maxChildZ = trees[i].position.z + trees[i].box / 2
      if (
        boxIntersect(
          minTargetX,
          minTargetZ,
          maxTargetX,
          maxTargetZ,
          minChildX,
          minChildZ,
          maxChildX,
          maxChildZ
        )
      ) {
        console.log('Content box overlapping!', tree.position)
        return true
      }
    }

    return false
  }

  const newPosition = (box: number, boundary: number) => {
    return (
      boundary / 2 -
      box / 2 -
      (boundary - box) * (Math.round(Math.random() * 100) / 100)
    )
  }

  const updatePosition = (treeArray: TreeType[], boundary: number) => {
    treeArray.forEach((tree, index) => {
      do {
        tree.position.x = newPosition(tree.box, boundary)
        tree.position.z = newPosition(tree.box, boundary)
      } while (isOverlapping(index, tree, treeArray))
    })

    setTrees(treeArray)
  }

  useEffect(() => {
    const tempTrees: TreeType[] = []

    for (let i = 0; i < count; i++) {
      tempTrees.push({ position: { x: 0, z: 0 }, box: 2 })
    }

    updatePosition(tempTrees, boundary)
  }, [boundary, count])

  return (
    <group rotation={[0, 4, 0]}>
      {trees.map((tree, i) => {
        return (
          <object3D key={i} position={[tree.position.x, 0, tree.position.z]}>
            <mesh scale={[tree.box, tree.box, tree.box]}>
              <boxGeometry />
              <meshBasicMaterial color={'blue'} wireframe />
            </mesh>
            <primitive object={model.scene.clone()} />
          </object3D>
        )
      })}
    </group>
  )
}
