import { chromium } from 'playwright'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('console', (msg) => errors.push(`[console:${msg.type()}] ${msg.text()}`))
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message))
page.on('requestfailed', (req) => errors.push('REQFAILED: ' + req.url() + ' ' + req.failure()?.errorText))
page.on('response', (res) => {
  if (res.url().includes('cloudinary.com') && !res.ok()) {
    errors.push(`CLOUDINARY ${res.status()} ${res.url()}`)
  }
})

await page.goto('https://clam-blog.web.app/auth/login', { waitUntil: 'load' })
await page.fill('input[type="email"]', 'qa-test-clam@example.com')
await page.fill('input[type="password"]', 'TestClam123!')
await page.click('button[type="submit"]')
await page.waitForTimeout(2000)

await page.goto('https://clam-blog.web.app/admin/settings', { waitUntil: 'load' })
await page.waitForTimeout(1500)
await page.screenshot({ path: '/tmp/repro-settings-before.png', fullPage: true })

console.log('--- Subiendo imagen NORMAL (1.6MB) ---')
const fileInput = page.locator('input[type="file"]')
await fileInput.setInputFiles('/tmp/normal.jpg')
await page.waitForTimeout(4000)
await page.screenshot({ path: '/tmp/repro-normal-upload.png', fullPage: true })
console.log('errores tras normal:', JSON.stringify(errors, null, 2))

errors.length = 0
console.log('--- Subiendo imagen GRANDE (5.2MB) ---')
await fileInput.setInputFiles('/tmp/huge.jpg')
await page.waitForTimeout(4000)
await page.screenshot({ path: '/tmp/repro-huge-upload.png', fullPage: true })
console.log('errores tras huge:', JSON.stringify(errors, null, 2))

await browser.close()
