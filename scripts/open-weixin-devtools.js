const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const candidates = [
  path.resolve(__dirname, '../dist/dev/mp-weixin'),
  path.resolve(__dirname, '../dist/build/mp-weixin'),
  path.resolve(__dirname, '../unpackage/dist/dev/mp-weixin'),
  path.resolve(__dirname, '../unpackage/dist/build/mp-weixin')
]

const projectPath = candidates.find((dir) =>
  fs.existsSync(path.join(dir, 'app.json'))
)

if (!projectPath) {
  console.error(
    '[open:mp-weixin] 未找到编译产物，请先运行: npm run dev:mp-weixin 或 npm run build:mp-weixin'
  )
  candidates.forEach((dir) => console.error('  -', dir))
  process.exit(1)
}

const cliCandidates = [
  '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
  process.env.WECHAT_DEVTOOLS_CLI
].filter(Boolean)

for (const cli of cliCandidates) {
  if (!fs.existsSync(cli)) continue
  try {
    execFileSync(cli, ['open', '--project', projectPath], { stdio: 'inherit' })
    process.exit(0)
  } catch (e) {
    console.error('[open:mp-weixin] 调用失败:', cli, e.message)
  }
}

console.log('编译产物目录（可在微信开发者工具中手动导入）:')
console.log(projectPath)
console.log('')
console.log('若需命令行打开，请设置环境变量 WECHAT_DEVTOOLS_CLI 为 cli 可执行文件路径。')
