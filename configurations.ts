import * as fs from 'fs'
import * as path from 'path'
import inquirer from 'inquirer'
import spawn from 'cross-spawn'

async function selectBrand(): Promise<string> {
  const brandingPath = path.resolve(__dirname, '../src/branding')

  if (!fs.existsSync(brandingPath)) {
    console.error(`Branding folder does not exist at ${brandingPath}`)
    process.exit(1)
  }

  const brands = fs.readdirSync(brandingPath).filter(file =>
    fs.statSync(path.join(brandingPath, file)).isDirectory()
  )

  if (brands.length === 0) {
    console.error('No brands found in src/branding/')
    process.exit(1)
  }

  const answers = await inquirer.prompt<{ brand: string }>([
    {
      type: 'list',
      name: 'brand',
      message: 'Select a branding:',
      choices: brands,
    },
  ])

  return answers.brand
}

async function selectEnvironment(brand: string): Promise<string> {
  const brandPath = path.resolve(__dirname, `../src/branding/${brand}`)

  if (!fs.existsSync(brandPath)) {
    console.error(`Selected brand folder does not exist at ${brandPath}`)
    process.exit(1)
  }

  const envFiles = fs.readdirSync(brandPath).filter(file => /^config\.(.+)\.ts$/.test(file))

  if (envFiles.length === 0) {
    console.error(`No environment config files found in ${brandPath}`)
    process.exit(1)
  }

  const envs = envFiles.map(file => file.match(/^config\.(.+)\.ts$/)![1])

  const answers = await inquirer.prompt<{ env: string }>([
    {
      type: 'list',
      name: 'env',
      message: 'Select an environment:',
      choices: envs,
    },
  ])

  return answers.env
}

async function main() {
  const brand = await selectBrand()
  const environment = await selectEnvironment(brand)

  const args = ['ng', 'serve', `--configuration=${environment}`]

  const ng = spawn('npx', args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      BRAND: brand,
      ENV: environment
    },
  })

  ng.on('exit', code => {
    process.exit(code ?? 0)
  })
}

main()
