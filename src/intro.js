// // options
// {
//     toplevel: true,
//     compress: {
//       passes: 5,
//       unsafe: true,
//       pure_getters: true
//     },
//   }
"use strict";

const a = document.createElement`canvas`
document.body.appendChild(a)

const c = a.getContext`2d`

const w = 1920
const h = 1080
const FN = 'px serif'
const audio = document.createElement`audio`
const player = new CPlayer()

let randomSeed = 0x12341234 //adefe51a
//https://gist.github.com/blixt/f17b47c62508be59987b
function randomNextFloat() {
    randomSeed = randomSeed * 16807 % 2147483647
    return (randomSeed - 1) / 2147483646
}
function easeOut(x, y, t) {
    if (t < 0) t = 0
    if (t > 1.0) t = 1.0
    const _t = 1.0 - (1.0 - t) * (1.0 - t)
    return x * (1 - _t) + y * _t
}

a.style.position = 'absolute'
a.style.left = a.style.top = 0
a.style.width = "100%"
a.style.height = "100%"

player.i(song)
let state = false

const E = c.createLinearGradient(0, 0, 0, h)
E.addColorStop(0, '#101')
E.addColorStop(1, '#000')

const treel = []
const pt = []
const pt2 = []
const acc = []
const bubbles = []

let zoff = 0
let treeCircleAlpha = 0
let pointsAlpha = 0
let titleAlpha = 0
let bubbleAlpha = 0
let lastT = 0
let bubbleidx = 0
let treeidx = 0
let accidx = 0
let accTime = 0
let accTimeT = 0
let bubblesGen = 0

function generatePoint(j, spread=false) {
    const k = (j + treeidx) * 4
    const r = w * 3 * (spread? randomNextFloat() : 1)
    const a = randomNextFloat() * 6.283
    const ad = randomNextFloat() * r * .2 - w*.1
    acc[k] = (r+ad) * Math.sin(a)
    acc[k + 1] = 20
    acc[k + 2] = (r+ad) * Math.cos(a)
}

function tree (x, y, z, l, n, it, t, oldidx) {
    n += Math.cos(t * .25) * .2
  
    let r = randomNextFloat()
    const x1 = x + l * Math.sin(n) * r * 2
    const y1 = y - l * Math.cos(n)
    const z1 = z + l * Math.sin(n) * (1 - r) * 2
    const k = accidx * 4

    acc[k] = x1
    acc[k+1] = y1
    acc[k+2] = z1

    treel[k-4] = oldidx
    oldidx = accidx
    treel[k+2-4] = it++
    treel[k+1-4] = accidx++

    l *= .7

    if (it == 7 && bubblesGen == 1) {
        const k = bubbleidx*4
        bubbles[k] = x1
        bubbles[k+1] = y1
        bubbles[k+2] = z1
        bubbles[k+3] = .1 + r * .25
        bubbleidx++
    }

    if(it<7) tree(x1, y1, z1, l, n - 1, it, t, oldidx) 
    if(it<5) tree(x1, y1, z1, l, n + 1, it, t, oldidx)
    if(it<7) tree(x1, y1, z1, l, n + .4, it, t, oldidx)
  }

accidx = 1
tree(0, 100, 0, 200, 0, 0, 0, 0)
bubblesGen = 1
for (let i = 0; i < w; i++) generatePoint(i, true)

window.addEventListener('mousedown', _ => {
    // document.body.requestFullscreen()

    setInterval(_ => {
        a.width = w
        a.height = h
    
        if (!state) {
            state = player.g() >= 1
            if (state) {
                audio.src = URL.createObjectURL(new Blob([player.w()], {type: "audio/wav"}))
                audio.play()
            }
        } else {
            let t = audio.currentTime

            let yangle = .5 * Math.sin(t * .1)
            let treeAlpha = 1
            let xoff = 0
            let yoff = h/4
            let maxCircle = 64
            titleAlpha = 0
            treeCircleAlpha = 1
            pointsAlpha = 1
            bubbleAlpha = 0
            zoff = h

            if (t < 13) {
                treeCircleAlpha = 0
                pointsAlpha = 0
                treeAlpha = easeOut(0,1,(t-3)/8)
                titleAlpha = easeOut(0,1,(t-5)/10)
            } else if(t < 27) {
                titleAlpha = easeOut(easeOut(0,1,(t-5)/10), 0, (t-21)/5) 
                xoff = easeOut(0, -w/4, (t-13)/8)
                zoff = easeOut(h, w, (t-13)/5)
                pointsAlpha = 0
                treeCircleAlpha = easeOut(0,1,(t - 13)/4)
            } else if(t < 40) {
                zoff = 500
                treeCircleAlpha = 0
                treeAlpha = 0
                maxCircle = 200
            } else if (t < 54) {
                zoff = easeOut(500, h, (t-40)/5)
                treeCircleAlpha = treeAlpha = easeOut(0, 1, (t-40)/10)
                maxCircle = easeOut(200, 64, (t-40)/5)
            } else if (t < 81) {
                zoff = easeOut(h, w, (t-54)/5)
                bubbleAlpha = 1
                yangle = .5 *  Math.sin(t*.2)
            } else if (t < 162) {
                bubbleAlpha = 1
                yangle = (t + accTime) * .05
                titleAlpha = accTime %4 == 0
            } else if (t < 177) {
                pointsAlpha = easeOut(1,0, (t-162)/3)
                titleAlpha = 1 - pointsAlpha
            } else {
                titleAlpha = treeAlpha = treeCircleAlpha = easeOut(1, 0, (t-177)/2)
                pointsAlpha = 0
            }
            c.globalCompositeOperation = 'lighter'
            c.fillStyle = E
            c.fillRect(0,0,w,h)

            const oldRs = randomSeed
            randomSeed = 0x12341234
            accidx = 1
            acc[0] = 0
            acc[1] = 0
            acc[2] = 0
            tree(0, 100, 0, 200, 0, 0, t, 0)
            bubblesGen = 0
            randomSeed = oldRs
            treeidx = accidx

            while(t - lastT > .005) {
                for (let i = 0; i < w; i++) {
                    const k = (i + treeidx)*4
                    acc[k  ] -= acc[k]*.002
                    acc[k+2] -= acc[k+2]*.002

                    if (acc[k] * acc[k] < 2) generatePoint(i)
                }

                for (let i = 0; i < bubbleidx; i++) bubbles[i*4+1] -= bubbles[i*4+3]

                if (bubbles[1] < -500) {
                    bubblesGen = 1
                    bubbleidx = 0
                }

                if (t > 80 && accTimeT-- == 0) {
                    accTime += 9
                    accTimeT = 290
                }
                lastT += .005
            }

            accidx = treeidx + w
            let pointsidx = accidx

            for (let i = 0; i < bubbleidx; i++) {
                const k = accidx*4
                acc[k] = bubbles[i*4]
                acc[k+1] = bubbles[i*4+1]
                acc[k+2] = bubbles[i*4+2]
                accidx++
            }
            
            const say = Math.sin(yangle)
            const cay = Math.cos(yangle)

            for(let i = 0; i < accidx; i++) {
                const k = i * 4
                pt2[k    ] = acc[k    ]
                pt2[k + 1] = acc[k + 1] - acc[k + 2] * .5
                pt2[k + 2] = acc[k + 1] * .5 + acc[k + 2]

                pt[k    ] = pt2[k    ] * cay + pt2[k + 2] * say
                pt[k + 1] = pt2[k + 1]
                const z = -pt2[k    ] * say + pt2[k + 2] * cay + zoff
            
                pt[k] = .8*w * pt[k] / z + w/2 + xoff
                pt[k+1] = .8*w * pt[k+1] / z + h/2 + yoff
                
                pt[k+3]= easeOut(maxCircle, 4, (z + w*2)/(w*4)) 
                pt[k+2] = z
            }

            let min = 0

            c.strokeStyle = '#e00'
            c.globalAlpha = treeAlpha
            for (let i = 0; i < treeidx; i++) {
                const f = 1-(treel[i*4+2]/7)
                c.lineWidth = easeOut(1, 32, t/10) * f**2+.2
                let i0 = treel[i*4]*4
                let i1 = treel[i*4+1]*4
                c.beginPath()
                c.moveTo(pt[i0], pt[i0+1])
                c.lineTo(pt[i1], pt[i1+1])
                c.stroke()
            }
            
            c.strokeStyle = c.fillStyle = '#fff'

            const coords = [treeidx, pointsidx, accidx]
            const alphas = [treeCircleAlpha, pointsAlpha, bubbleAlpha]
            for (let j = 0; j < 3; j++) {
                let max = coords[j]
                c.globalAlpha = alphas[j] * (j == 2 ? 1-(bubbles[5]/-500) : 1)

                for (let i = min; i < max; i++) {
                    if (pt[i*4+2] < 0) continue
                    c.beginPath()
                    c.arc(pt[i*4], pt[i*4+1], pt[i*4+3], 0, 6.283)
                    if (j < 2) c.fill()
                    else c.stroke()
                }
                min = max
            }

            c.globalAlpha = titleAlpha
            c.lineWidth = 8
            c.font = '200' + FN
            c.fillText('r173', w/2, h/2)
            c.font = '100' + FN
            c.textAlign = 'end'
            c.fillText('.bp.smash!.fuzzion.', w, h/2+100)
            c.beginPath()
            c.moveTo(w/2, h/2)
            c.lineTo(w, h/2)
            c.stroke()

            c.save()
            c.globalAlpha = .6
            let blur = 8
            while(blur >= 2) {
                c.filter = 'blur('+blur+'px)'
                c.drawImage(a, 0, 0)
                blur /= 2
            }
            c.restore()
        }
    })
})