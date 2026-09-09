import { chromium } from 'playwright'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const netlog = []
page.on('response', (res) => {
  if (res.url().includes('cloudinary.com')) netlog.push(`${res.status()} ${res.url()}`)
})
page.on('console', (msg) => { if (msg.type() === 'error') netlog.push('CONSOLE ERROR: ' + msg.text()) })

await page.goto('https://clam-blog.web.app/auth/login', { waitUntil: 'load' })
await page.fill('input[type="email"]', 'qa-test-clam@example.com')
await page.fill('input[type="password"]', 'TestClam123!')
await page.click('button[type="submit"]')
await page.waitForTimeout(2000)

await page.goto('https://clam-blog.web.app/admin/settings', { waitUntil: 'load' })
await page.waitForTimeout(1500)

const fileInput = page.locator('input[type="file"]')
await fileInput.setInputFiles('/tmp/huge.jpg')

for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `/tmp/repro3-t${i}.png`, fullPage: true })
}
console.log('NETLOG:', JSON.stringify(netlog, null, 2))

await browser.close()
