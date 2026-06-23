import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const baseUrl = process.env['LIGHTHOUSE_BASE_URL'] ?? 'http://localhost:3000'
const paths = ['/', '/blog', '/login']

async function runAudit(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] })

  try {
    const result = await lighthouse(url, {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    })

    if (!result?.lhr) {
      throw new Error(`No Lighthouse result for ${url}`)
    }

    const categories = result.lhr.categories
    return {
      url,
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    }
  } finally {
    await chrome.kill()
  }
}

async function main() {
  const results = []

  for (const path of paths) {
    const url = `${baseUrl}${path}`
    console.log(`Running Lighthouse for ${url}...`)
    results.push(await runAudit(url))
  }

  const outDir = join(process.cwd(), 'lighthouse-results')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'summary.json'), JSON.stringify(results, null, 2))

  console.log('\nLighthouse Summary')
  console.table(results)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
