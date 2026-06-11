// Generates banner.svg + marquee.svg for the GitHub profile README,
// using the same scene math/palette as sky-shiiyu.moe.
import { readFileSync, writeFileSync } from 'node:fs'

const SCENE_W = 960
const SCENE_H = 240
const SCENE_FILL = '#28313d'
const SCENE_FILL_FAR = '#414c58'

const quantRidge = (cols, step, min, fn) =>
	Array.from({ length: cols }, (_, i) => {
		const t = (i / cols) * Math.PI * 2
		return Math.max(min, Math.round(fn(t) / step) * step)
	})

const MOUNTAIN = quantRidge(
	160,
	4,
	10,
	(t) =>
		40 +
		26 * Math.sin(t + 4.0) +
		16 * Math.sin(2 * t + 1.0) +
		7 * Math.sin(3 * t + 2.2) +
		4 * Math.sin(7 * t)
)

const RIDGE_FAR = quantRidge(
	120,
	6,
	20,
	(t) =>
		62 +
		30 * Math.sin(t + 1.5) +
		12 * Math.sin(2 * t + 3.0) +
		5 * Math.sin(5 * t + 1.0)
)

const steppedPoints = (heights, anchor) => {
	const stepW = SCENE_W / heights.length
	const points = []
	if (anchor === 'bottom') {
		points.push(`0,${SCENE_H}`)
		heights.forEach((h, i) => {
			const y = SCENE_H - h
			points.push(`${i * stepW},${y}`, `${(i + 1) * stepW},${y}`)
		})
		points.push(`${SCENE_W},${SCENE_H}`)
	} else {
		points.push('0,0')
		heights.forEach((h, i) => {
			points.push(`${i * stepW},${h}`, `${(i + 1) * stepW},${h}`)
		})
		points.push(`${SCENE_W},0`)
	}
	return points.join(' ')
}

const cloud = (x, y, s = 1) => `
<g fill="${SCENE_FILL}" transform="translate(${x},${y}) scale(${s})">
<rect x="24" y="0" width="20" height="4"/><rect x="56" y="0" width="16" height="4"/>
<rect x="16" y="4" width="36" height="4"/><rect x="48" y="4" width="32" height="4"/>
<rect x="8" y="8" width="80" height="4"/><rect x="2" y="12" width="92" height="4"/>
<rect x="0" y="16" width="96" height="4"/>
</g>`

const ceilingCloud = (x, s = 1) => `
<g fill="${SCENE_FILL}" transform="translate(${x},0) scale(${s})">
<rect x="0" y="0" width="128" height="10"/><rect x="6" y="10" width="116" height="5"/>
<rect x="18" y="15" width="88" height="5"/><rect x="40" y="20" width="44" height="4"/>
</g>`

// a drifting layer: content duplicated at x=0 and x=SCENE_W, slides left one tile
const drift = (content, dur) => `
<g>
<animateTransform attributeName="transform" type="translate" from="0 0" to="-${SCENE_W} 0" dur="${dur}s" repeatCount="indefinite"/>
<g>${content}</g><g transform="translate(${SCENE_W},0)">${content}</g>
</g>`

const fontB64 = readFileSync(
	'../site/public/fonts/daydream.otf'
).toString('base64')

const ridgeFar = `<polygon fill="${SCENE_FILL_FAR}" points="${steppedPoints(RIDGE_FAR, 'bottom')}"/>`
const cloudsFar = `<g opacity="0.55">${ceilingCloud(300, 1.1)}${ceilingCloud(760, 0.85)}${cloud(80, 80, 0.8)}${cloud(600, 110, 0.7)}</g>`
const ridgeNear = `<polygon fill="${SCENE_FILL}" points="${steppedPoints(MOUNTAIN, 'bottom')}"/>`
const cloudsNear = `${ceilingCloud(20, 1.3)}${ceilingCloud(580, 1)}${cloud(240, 60, 1.1)}${cloud(800, 90, 0.9)}`

const banner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_W} ${SCENE_H}" shape-rendering="crispEdges">
<defs>
<style>
@font-face{font-family:'Daydream';src:url(data:font/otf;base64,${fontB64}) format('opentype');}
.wordmark{font-family:'Daydream';font-size:64px;fill:#fff;opacity:0.9;}
</style>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#67747f"/><stop offset="1" stop-color="#4f5c68"/>
</linearGradient>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
<feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ffffff" flood-opacity="0.55"/>
</filter>
</defs>
<rect width="${SCENE_W}" height="${SCENE_H}" fill="#151515"/>
<rect x="2" y="2" width="${SCENE_W - 4}" height="${SCENE_H - 4}" fill="url(#sky)"/>
<clipPath id="frame"><rect x="2" y="2" width="${SCENE_W - 4}" height="${SCENE_H - 4}"/></clipPath>
<g clip-path="url(#frame)">
${drift(ridgeFar, 170)}
${drift(cloudsFar, 85)}
${drift(ridgeNear, 115)}
${drift(cloudsNear, 45)}
<rect x="2" y="2" width="${SCENE_W - 4}" height="${SCENE_H - 4}" fill="#000" opacity="0.32"/>
</g>
<rect x="0.5" y="0.5" width="${SCENE_W - 1}" height="${SCENE_H - 1}" fill="none" stroke="#2d2d2d" stroke-width="2"/>
<text class="wordmark" x="50%" y="50%" dominant-baseline="central" text-anchor="middle" filter="url(#glow)">addicted</text>
</svg>`

const MARQUEE_ITEMS = [
	'meow',
	'mrrp',
	'mew',
	'purrr',
	'mrow',
	'somewhere in germany',
	'prrrp'
]
// two strips ≈ 1100px at 14px mono; copies sit 1200px apart so they never overlap
const strip = MARQUEE_ITEMS.map((m) => `${m} ★`).join('  ')
const stripText = `${strip}  ${strip}`
const MARQ_W = 960
const MARQ_H = 36

const marqueeText = (x) =>
	`<text x="${x}" y="23" font-family="ui-monospace,monospace" font-size="14" fill="#777">${stripText}</text>`

const marquee = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARQ_W} ${MARQ_H}">
<rect width="${MARQ_W}" height="${MARQ_H}" fill="#1a1a1a"/>
<rect x="0.5" y="0.5" width="${MARQ_W - 1}" height="${MARQ_H - 1}" fill="none" stroke="#2d2d2d" stroke-width="2"/>
<clipPath id="clip"><rect x="2" y="2" width="${MARQ_W - 4}" height="${MARQ_H - 4}"/></clipPath>
<g clip-path="url(#clip)">
<g>
<animateTransform attributeName="transform" type="translate" from="0 0" to="-1200 0" dur="35s" repeatCount="indefinite"/>
${marqueeText(0)}${marqueeText(1200)}${marqueeText(2400)}
</g>
</g>
</svg>`

writeFileSync('banner.svg', banner)
writeFileSync('marquee.svg', marquee)
console.log('banner.svg', banner.length, 'bytes; marquee.svg', marquee.length, 'bytes')
