const RouterWebpackPlugin = require('./Router.webpack.plugin')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = (api, projectOptions) => {
  api.chainWebpack(config => {
    config.module.noParse(/^(vue|vue-router|vuex|axios|element-ui)$/)
    if (isProduction) config.devtool('cheap-module-source-map')
  })
  api.configureWebpack(config => {
    config.plugins.push(new RouterWebpackPlugin())
  })
}