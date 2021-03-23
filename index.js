const RouterWebpackPlugin = require('./Router.webpack.plugin')

module.exports = (api, projectOptions) => {
  const options = projectOptions.pluginOptions.routeConfig
  api.configureWebpack(config => {
    config.plugins.push(new RouterWebpackPlugin(options ? options.route : {} || {}))
  })
}
