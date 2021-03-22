const RouterWebpackPlugin = require('./plugins/Router.webpack.plugin')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = (api, projectOptions) => {
  const options = projectOptions.pluginOptions.routeConfig
  console.log('options', options)
  api.configureWebpack(config => {
    config.plugins.push(new RouterWebpackPlugin(options ? options.route : {} || {}))
  })
}
