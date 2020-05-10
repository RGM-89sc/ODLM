const { override, fixBabelImports, addLessLoader } = require('customize-cra')

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {},
    strictMath: false,
    noIeCompat: true,
    cssModules: {
      localIdentName: "[local]--[hash:base64:5]",
    }
  })
)