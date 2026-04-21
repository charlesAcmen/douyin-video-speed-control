# 抖音倍速扩展

为抖音网页版视频播放器添加额外倍速选项的油猴脚本。

## 功能

- 扩展倍速选项：0.1x、0.5x、0.75x、1.0x、1.25x、1.5x、1.75x、2.0x、2.5x、3.0x
- 自动适配视频切换，SPA 页面导航后自动注入
- 保留播放器原有功能，仅添加缺失选项

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 点击 [安装脚本](https://github.com/charlesAcmen/douyin-video-speed-control/raw/main/douyin-extended-speed.user.js)
3. 打开抖音网页版即可使用

## 使用

点击播放器右下角的倍速按钮，在弹出的倍速列表中选择所需倍速。

## 限制

- 抖音播放器内部限制最大 3 倍速，超过 3x 的倍速选项无法生效
- 原始倍速选项（0.75x ~ 3.0x）由播放器原生处理，新增选项（0.1x、0.5x、2.5x）由脚本手动设置

## License

[MIT](LICENSE)
