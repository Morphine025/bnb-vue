module.exports = {
  devServer: {
    port: 3000, // 设置开发服务器端口为3000
    open: true, // 自动打开浏览器
    host: 'localhost'
  },
  // UniApp 特定配置
  transpileDependencies: ['uview-plus']
}

