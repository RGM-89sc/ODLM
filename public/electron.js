const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const url = require('url')
const path = require('path')
const fs = require('fs')

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win

function createWindow() {
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 1280,
    height: 960,
    show: false,
    autoHideMenuBar: true,
    icon: './favicon.ico',
    requestedExecutionLevel: "highestAvailable",
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, './renderer.js')
    }
  })
  // 然后加载应用的入口。
  if (process.env.NODE_ENV === 'development') { // 开发模式（可以热更新）
    win.loadURL('http://localhost:3000/')
  } else if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) { // 生产模式
    win.loadURL(url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      protocol: 'file'
    }))
  }

  // 打开开发者工具
  win.webContents.openDevTools()

  // 在加载页面时，渲染进程第一次完成绘制时，会发出 ready-to-show 事件，在此事件后显示窗口将没有视觉闪烁
  win.on('ready-to-show', () => {
    win.show()
  })

  // 点击关闭
  win.on('close', event => {
    event.preventDefault()
    win.hide()
  })

  // 当 window 被关闭后，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', () => {
  createWindow()
})

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。

ipcMain.on('save-file', (event, odlList) => {
  dialog.showSaveDialog({
    title: '文件另存为',
    defaultPath: 'backup.json'
  }).then(result => {
    if (result.canceled) {
      event.reply('saved-file', { status: 'SUCCESS', data: result })
    } else {
      fs.writeFile(result.filePath, JSON.stringify(odlList), err => {
        if (err) {
          event.reply('saved-file', { status: 'ERROR', error: err })
          return
        }
        event.reply('saved-file', { status: 'SUCCESS', data: result })
      })
    }
  }).catch(err => {
    event.reply('saved-file', { status: 'ERROR', error: err })
  })
})
