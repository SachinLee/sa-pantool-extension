import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 图标尺寸
const sizes = [16, 48, 128]

// 生成一个简单的渐变圆角图标
async function generateIcon(size) {
  // 创建一个简单的SVG图标
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
            fill="white" font-family="Arial" font-weight="bold" font-size="${size * 0.5}">
        ↗
      </text>
    </svg>
  `

  const outputPath = resolve(__dirname, `../public/icons/icon-${size}.png`)
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath)
  
  console.log(`Generated: icon-${size}.png`)
}

// 生成所有尺寸的图标
async function main() {
  for (const size of sizes) {
    await generateIcon(size)
  }
  console.log('All icons generated!')
}

main().catch(console.error)
