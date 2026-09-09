import { chromium } from 'playwright'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message))

await page.goto('https://clam-blog.web.app/auth/login', { waitUntil: 'load' })
await page.fill('input[type="email"]', 'qa-test-clam@example.com')
await page.fill('input[type="password"]', 'TestClam123!')
await page.click('button[type="submit"]')
await page.waitForTimeout(2000)

await page.goto('https://clam-blog.web.app/admin/settings', { waitUntil: 'load' })
await page.waitForTimeout(1500)

// Subir banner -> debe abrir el cropper
const fileInput = page.locator('input[type="file"]')
await fileInput.setInputFiles('/tmp/normal.jpg')
await page.waitForTimeout(1500)
await page.screenshot({ path: '/tmp/repro5-cropper-open.png', fullPage: true })
console.log('errores tras abrir cropper:', errors)

// Confirmar recorte sin mover nada
await page.getByRole('button', { name: 'Recortar y usar' }).click()
await page.waitForTimeout(3000)
await page.screenshot({ path: '/tmp/repro5-after-crop-upload.png', fullPage: true })
console.log('errores tras recortar/subir:', errors)

// Cambiar colores
const colorInputs = page.locator('input[type="color"]')
await colorInputs.nth(0).evaluate((el) => {
  el.value = '#e63946'
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/repro5-color-preview.png', fullPage: true })

await page.getByRole('button', { name: 'Guardar cambios' }).click()
await page.waitForTimeout(2000)
console.log('errores finales:', errors)

// Recargar y confirmar persistencia + aplicación global
await page.goto('https://clam-blog.web.app/', { waitUntil: 'load' })
await page.waitForTimeout(2000)
await page.screenshot({ path: '/tmp/repro5-home-final.png', fullPage: true })
console.log('errores en home tras reload:', errors)

await browser.close()
