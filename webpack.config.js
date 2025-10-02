const { DefinePlugin } = require('webpack')
const execSync = require('child_process').execSync

module.exports = (config, options) => {
    const env = process.env.ENV
    const brand = process.env.BRAND
    const conf = require(`./src/branding/${brand}/config.${env}.ts`).config

    return {
        ...config,
        plugins: [
            ...config.plugins,
            new DefinePlugin({
                PUBLIC: JSON.stringify({
                    ...conf,
                    ENVIRONMENT: env,
                    BRAND: brand,
                    COMMIT_HASH: execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
                })
            })
        ]
    }
}
