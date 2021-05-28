import Vector from './models/vector.js'
import FourByFour from './models/four_by_four.js'
import Camera from './models/orthographic.js'
import angles from './isomorphisms/angles.js'
import coordinates from './isomorphisms/coordinates.js'
import renderLine from './views/line.js'
import renderCircle from './views/circle.js'
import { seed, noise } from './utilities/noise.js'
import { COLORS } from './constants/colors.js'
import {
  ZOOM, FPS, TIME_THRESHOLD, Δt, FREQUENCY, AMPLITUDE, INCREMENTS
} from './constants/dimensions.js'

// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const canvas = document.querySelector('.canvas')
const context = canvas.getContext('2d')

const perspective = FourByFour.identity()
  .rotX(angles.toRadians(45))
  .rotY(angles.toRadians(30))

const camera = new Camera({
  position: Vector.zeroes(),
  direction: Vector.zeroes(),
  up: Vector.from([0, 1, 0]),
  width: canvas.width,
  height: canvas.height,
  zoom: ZOOM
})

seed(Math.random())

context.shadowBlur = 5

const θdeg = 90
const θ = angles.toRadians(θdeg)

const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height)

  perspective.rotY(angles.toRadians(0.5))
  perspective.rotX(angles.toRadians(0.25))

  context.shadowColor = COLORS[0]
  renderCircle(context, camera.project(Vector.zeroes().transform(perspective)), 3, COLORS[0], COLORS[0])

  const points = []

  for (let r = 1; r < 8; r++) {
    const distortion = noise(r * FREQUENCY, θdeg * FREQUENCY, time * FREQUENCY) * AMPLITUDE
    const color = COLORS[r]

    for (let φdeg = 0; φdeg <= 360; φdeg = φdeg + INCREMENTS[r]) {
      const φ = angles.toRadians(φdeg)
      const cartesian = coordinates.toCartesian(Vector.from([r, θ + distortion, φ]))
      const projected = camera.project(cartesian.transform(perspective))

      if (φdeg) {
        const prev = points[points.length - 1]

        context.shadowColor = color

        renderLine(context, projected, prev, color, 2)
      }

      points.push(projected)
    }
  }

  if (time > TIME_THRESHOLD) time = 0
  time += Δt
}

let time = 0
let prevTick = 0

const step = () => {
  window.requestAnimationFrame(step)

  const now = Math.round(FPS * Date.now() / 1000)
  if (now === prevTick) return
  prevTick = now

  render()
}

step()
