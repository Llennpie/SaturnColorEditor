import * as THREE from 'three'
import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { copyToClipboard, hexToRgb, igltf, rgbColorToHex, rgbToHex } from './api/utils'
import type { IMarioColors, ISM64Material } from './api/types'
import styles from '../styles/Main.module.scss'
import { convertPaletteToGS } from './api/gameshark'
import { PerspectiveCamera, Renderer, Scene } from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Draggable from 'react-draggable'
import React from 'react'

const colors: IMarioColors = {
  Hat: {
    color: 0xFF0000,
    ambient: 0x7F0000
  },
  Hair: {
    color: 0x730600,
    ambient: 0x390300
  },
  Gloves: {
    color: 0xFFFFFF,
    ambient: 0x7F7F7F
  },
  Overall: {
    color: 0x0000FF,
    ambient: 0x00007F
  },
  Shoes: {
    color: 0x721C0E,
    ambient: 0x390E07
  },
  Face: {
    color: 0xFEC179,
    ambient: 0x7F603C
  }
}

let scene: Scene
let marioScene: GLTF
let autoRotate = true
let showGrid = true
let camera: PerspectiveCamera
let renderer: Renderer

const updateMarioColors = () => {
  marioScene.scene.traverse( ( child ) => {
    if(child.isMesh){
      let name = child.material.name
      let entry = colors[name as keyof IMarioColors]
      if(entry != undefined)
        child.material = new THREE.MeshLambertMaterial({
          color: entry.ambient,
          emissive: entry.color,
          emissiveIntensity: .3,
          side: THREE.DoubleSide,
          name: name
        })
    }
  })
  scene.add( marioScene.scene )
}

const render = async () => {
  marioScene = await igltf('models/mario.glb')
  updateMarioColors()
}

const lighting = () => {
  const ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 )
  scene.add( ambientLight )

  const pointLight = new THREE.PointLight( 0xffffff, 0.8 )
  camera.add( pointLight )
  scene.add( camera )
}

const setup = () => {
  renderer = new THREE.WebGLRenderer({ antialias:true })
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( renderer.domElement )

  camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 2000)
  const controls = new OrbitControls( camera, renderer.domElement )

  camera.position.set(0, 6, 11)
  controls.update()
  controls.autoRotate = autoRotate
  controls.autoRotateSpeed = 5
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xdddddd)
  var grid = new THREE.GridHelper(5, 5)
  scene.add(grid)

  lighting()
  render()

  const animate = () => {
    requestAnimationFrame( animate )
    controls.update()
    grid.visible = showGrid
    renderer.render( scene, camera )
    controls.autoRotate = autoRotate
  }

  animate()
}

const randomizeColors = () => {
  Object.keys(colors).map((k) => {
    if(k == "Face") return
    const entry = colors[k as keyof IMarioColors]
    const color = Math.round(0xFFFFFF * Math.random())
    const preprocessed = hexToRgb(color)
    const ambient = rgbColorToHex(Math.round((preprocessed.r + 1) / 2), Math.round((preprocessed.g + 1) / 2), Math.round((preprocessed.b + 1) / 2))
    entry.color = color
    entry.ambient = ambient
    document.getElementById(`${k}-color`).value = rgbToHex(color)
    document.getElementById(`${k}-ambient`).value = rgbToHex(ambient)
  })
}

interface GamesharkEntry {
  addresses: string[],
  material: ISM64Material
}

const parseGameshark = async ( lines: string[], dataMap: GamesharkEntry[] ) => {
  for(let i = 0; i < lines.length; i++){
    const line = lines[i].trim();
    const address = line.substring(2, 8);
    let color = rgbColorToHex(
      parseInt(line.substring(9, 11), 16),
      parseInt(line.substring(11, 13), 16),
      parseInt(lines[i + 1].substring(9, 11), 16)
    )
    dataMap.forEach((entry) => {
      switch(entry.addresses.indexOf(address)){
        case 0:
          entry.material.color = color
          break;
        case 1:
          entry.material.ambient = color
      }
    })
    i++
  }
}

const Home: NextPage = () => {
  const windowRef = React.useRef(null);
  useEffect(() => {
    setup()
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }, false)
  }, [])
  const [status, setStatus] = useState(true)
  let inputs = Object.keys(colors).map((k, idx) => {
    const entry   = colors[k as keyof IMarioColors]
    const color   = rgbToHex(entry.color)
    const ambient = rgbToHex(entry.ambient)
    return (
      <div className={styles.input} key={"CInput-" + k}>
        <div className={styles.cp_wrapper}>
          <input type="color" id={k+"-color"} defaultValue={color} onChange={(ev) => {
            ev.preventDefault()
            entry.color = parseInt(ev.target.value.replace("#", "0x"), 16)
            updateMarioColors()
          }}/>
        </div>
        <div className={styles.cp_wrapper}>
          <input type="color" id={k+"-ambient"} defaultValue={ambient} onChange={(ev) => {
            ev.preventDefault()
            entry.ambient = parseInt(ev.target.value.replace("#", "0x"), 16)
            updateMarioColors()
          }}/>
        </div>
        <span>{k == "Hat" ? "Hat / Body" : k} Color</span>
      </div>
    )
  })
  return (
    <Draggable nodeRef={windowRef}>
      <div ref={windowRef} className={styles.container} style={{paddingBottom: status ? '10px' : '0'}}>
        <div className={styles.title} style={{ borderBottomWidth: status ? '2px' : '0'}}>
          <img width={26} height={26} src="saturn-logo.png"/>
          <span>Saturn Color Editor</span>
          <div className={styles.toggle} onClick={(e) => {
            setStatus(!status)
          }}>
            <img src={
              status ? "minimize.png" : "maximize.png"
            }/>
          </div>
        </div>
        <div style={{display: status ? 'block' : 'none', padding: '0', margin: '0'}}>
          <div className={styles.input}>
            <input type="checkbox" defaultChecked onChange={(v) => {
              autoRotate = v.target.checked
            }}/>
            <span>Auto Rotate</span>
          </div>
          <div className={styles.input}>
            <input type="checkbox" defaultChecked onChange={(v) => {
              showGrid = v.target.checked
            }}/>
            <span>Show Grid</span>
          </div>
          { inputs }
          <div className={styles.buttons}>
            <button onClick={async (ev) => {
              ev.preventDefault()
              const lines = await (await navigator.clipboard.readText()).split("\n").filter((l) => l.length > 1);
              await parseGameshark(lines, [
                { addresses: ['07EC40', '07EC38'], material: colors.Hat },
                { addresses: ['07EC28', '07EC20'], material: colors.Overall },
                { addresses: ['07EC58', '07EC50'], material: colors.Gloves },
                { addresses: ['07EC70', '07EC68'], material: colors.Shoes },
                { addresses: ['07EC88', '07EC80'], material: colors.Face },
                { addresses: ['07ECA0', '07EC98'], material: colors.Hair }
              ]);
              updateMarioColors()
            }}>Import GS</button>
            <button onClick={async (ev) => {
              ev.preventDefault()
              copyToClipboard(convertPaletteToGS(colors))
              alert("Copied to clipboard")
            }}>Export GS</button>
          </div>
          <div className={styles.buttons}>
            <button onClick={(ev) => {
              ev.preventDefault()
              randomizeColors()
              updateMarioColors()
            }}>Random</button>
            <button onClick={async (ev) => {
              ev.preventDefault()
              for(let i = 0; i < Math.random() * 100; i++){
                await new Promise((resolve) => {
                  let tm = setTimeout(() => {
                    randomizeColors()
                    resolve(null)
                    clearTimeout(tm)
                  }, 50)
                })
              }
              updateMarioColors()
            }}>I'm Feeling Lucky</button>
          </div>
          <span className={styles.footer}>Saturn Links -
            <a href='https://discord.gg/rGqREG2kYv'>
              <img src="discord.png" width={16}/>
            </a>
            <a href='https://github.com/Llennpie/Saturn'>
              <img src="github.png" width={16}/>
            </a>
            <a href='https://ko-fi.com/sm64rise'>
              <img src="kofi.png" width={20}/>
            </a>
          </span>
          <span className={styles.footer}>Made with<img src="heart.png" width={16} height={16}/>by <a className={styles.twitter} href='https://twitter.com/KiritoDev'>@KiritoDev</a></span>
        </div>
      </div>
    </Draggable>
  )
}

export default Home