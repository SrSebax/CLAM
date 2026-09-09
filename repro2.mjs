import { chromium } from 'playwright'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

await page.goto('https://clam-blog.web.app/auth/login', { waitUntil: 'load' })
await page.fill('input[type="email"]', 'qa-test-clam@example.com')
await page.fill('input[type="password"]', 'TestClam123!')
await page.click('button[type="submit"]')
await page.waitForTimeout(2000)

await page.goto('https://clam-blog.web.app/admin/settings', { waitUntil: 'load' })
await page.waitForTimeout(1500)

const fileInput = page.locator('input[type="file"]')
await fileInput.setInputFiles('/tmp/huge.jpg')
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/repro-huge-immediate.png', fullPage: true })

await browser.close()
