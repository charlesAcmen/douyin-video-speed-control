// ==UserScript==
// @name         抖音倍速扩展
// @namespace    https://github.com/charlesAcmen/douyin-video-speed-control
// @version      1.0.0
// @description  为抖音网页版视频播放器添加 0.1x、0.5x、2.5x 等额外倍速选项
// @author       charlesAcmen
// @license      MIT
// @match        https://www.douyin.com/*
// @match        https://douyin.com/*
// @grant        none
// @run-at       document-end
// @supportURL   https://github.com/charlesAcmen/douyin-video-speed-control/issues
// @homepageURL  https://github.com/charlesAcmen/douyin-video-speed-control
// @downloadURL  https://github.com/charlesAcmen/douyin-video-speed-control/raw/main/douyin-extended-speed.user.js
// @updateURL    https://github.com/charlesAcmen/douyin-video-speed-control/raw/main/douyin-extended-speed.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 倍速选项（抖音播放器限制最大3倍速）
    const speedOptions = [
        { id: '0.1', label: '0.1x' },
        { id: '0.5', label: '0.5x' },
        { id: '0.75', label: '0.75x' },
        { id: '1.0', label: '1.0x' },
        { id: '1.25', label: '1.25x' },
        { id: '1.5', label: '1.5x' },
        { id: '1.75', label: '1.75x' },
        { id: '2.0', label: '2.0x' },
        { id: '2.5', label: '2.5x' },
        { id: '3.0', label: '3.0x' },
    ];

    // 添加倍速选项（保留原始事件绑定，只添加缺失选项并排序）
    function addSpeedOptions() {
        console.log('[抖音倍速扩展] 开始添加倍速选项');
        const speedWraps = document.querySelectorAll('.xgplayer-playratio-wrap');
        if (speedWraps.length === 0) {
            console.log('[抖音倍速扩展] 未找到倍速容器');
            return;
        }

        console.log('[抖音倍速扩展] 找到', speedWraps.length, '个倍速容器');

        speedWraps.forEach((speedWrap, index) => {
            // 检查是否已处理过
            if (speedWrap.dataset.extended === 'true') return;

            const playerEl = speedWrap.closest('.xgplayer');
            const isVisible = playerEl ? getComputedStyle(playerEl).display !== 'none' && getComputedStyle(playerEl).visibility !== 'hidden' : true;
            console.log('[抖音倍速扩展] 容器', index, '可见:', isVisible);

            // 收集现有选项的 data-id
            const existingItems = Array.from(speedWrap.querySelectorAll('.xgplayer-playratio-item'));
            const existingIds = new Set(existingItems.map(item => item.getAttribute('data-id')));
            console.log('[抖音倍速扩展] 容器', index, '现有选项:', [...existingIds]);

            // 添加缺失的倍速选项（保留原始选项的事件绑定）
            speedOptions.forEach(option => {
                if (!existingIds.has(option.id)) {
                    const div = document.createElement('div');
                    div.setAttribute('data-id', option.id);
                    div.className = 'xgplayer-playratio-item';
                    div.textContent = option.label;
                    speedWrap.appendChild(div);
                    console.log('[抖音倍速扩展] 添加新选项:', option.label);
                }
            });

            // 按 data-id 数值从小到大排序所有选项
            const allItems = Array.from(speedWrap.querySelectorAll('.xgplayer-playratio-item'));
            allItems.sort((a, b) => parseFloat(a.getAttribute('data-id')) - parseFloat(b.getAttribute('data-id')));
            allItems.forEach(item => speedWrap.appendChild(item));

            // 标记已处理
            speedWrap.dataset.extended = 'true';
        });

        console.log('[抖音倍速扩展] 倍速选项添加完成，当前URL:', location.href);
    }

    // 强制重新注入（不检查标志）
    function forceAddSpeedOptions() {
        console.log('[抖音倍速扩展] 强制重新注入倍速选项');
        addSpeedOptions();
    }

    // 原始播放器自带的倍速ID
    const originalSpeedIds = ['0.75', '1.0', '1.25', '1.5', '1.75', '2.0', '3.0'];

    // 使用事件委托监听倍速选项点击
    document.addEventListener('click', function(event) {
        // 检查点击的是否是倍速按钮（打开菜单时注入额外选项）
        const playbackRateBtn = event.target.closest('.xgplayer-playback-setting');
        if (playbackRateBtn) {
            console.log('[抖音倍速扩展] 检测到倍速按钮点击');
            setTimeout(() => {
                forceAddSpeedOptions();
            }, 50);
        }

        // 检查点击的是否是倍速选项
        const speedItem = event.target.closest('.xgplayer-playratio-item');
        if (!speedItem) return;

        const speedWrap = speedItem.closest('.xgplayer-playratio-wrap');
        if (!speedWrap) return;

        const speedId = speedItem.getAttribute('data-id');
        if (!speedId) return;

        // 判断是否为新增选项
        const isNewOption = !originalSpeedIds.includes(speedId);
        console.log('[抖音倍速扩展] 倍速选项点击:', speedId, '是否新增:', isNewOption);

        // 从点击元素向上找对应的播放器和视频
        const playerEl = speedWrap.closest('.xgplayer');
        const video = playerEl ? playerEl.querySelector('video') : document.querySelector('video');

        if (isNewOption && video) {
            // 新增选项：手动设置倍速
            console.log('[抖音倍速扩展] 手动设置倍速:', speedId);
            video.playbackRate = parseFloat(speedId);

            // 移除其他选项的选中状态
            speedWrap.querySelectorAll('.xgplayer-playratio-item').forEach(item => {
                item.classList.remove('select');
            });
            speedItem.classList.add('select');

            // 更新显示的倍速文字
            const playbackSetting = playerEl ? playerEl.querySelector('.xgplayer-setting-playbackRatio') : null;
            if (playbackSetting) {
                playbackSetting.textContent = speedId + 'x';
            }
        }
    }, true);

    // 监听URL变化（SPA导航）
    let lastUrl = location.href;

    // 方法1: MutationObserver监听
    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            console.log('[抖音倍速扩展] 检测到URL变化:', lastUrl, '->', currentUrl);
            lastUrl = currentUrl;
            setTimeout(forceAddSpeedOptions, 500);
        }
    }).observe(document, { subtree: true, childList: true });

    // 方法2: popstate事件监听（浏览器前进后退）
    window.addEventListener('popstate', () => {
        console.log('[抖音倍速扩展] 检测到popstate事件');
        setTimeout(forceAddSpeedOptions, 300);
    });

    // 方法3: hashchange事件监听
    window.addEventListener('hashchange', () => {
        console.log('[抖音倍速扩展] 检测到hashchange事件');
        setTimeout(forceAddSpeedOptions, 300);
    });

    // 监听DOM变化，检测新播放器加载
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // 检查是否添加了新的倍速选项容器
                        if (node.classList && node.classList.contains('xgplayer-playratio-wrap')) {
                            console.log('[抖音倍速扩展] 检测到新倍速容器添加');
                            setTimeout(forceAddSpeedOptions, 100);
                        }
                        // 检查子节点中是否包含倍速选项容器
                        const nestedWrap = node.querySelector && node.querySelector('.xgplayer-playratio-wrap');
                        if (nestedWrap) {
                            console.log('[抖音倍速扩展] 检测到子节点包含倍速容器');
                            setTimeout(forceAddSpeedOptions, 100);
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 定时检查（作为备用方案）
    setInterval(() => {
        console.log('[抖音倍速扩展] 定时检查触发');
        forceAddSpeedOptions();
    }, 2000);

    // 初始执行
    console.log('[抖音倍速扩展] 脚本初始化，当前URL:', location.href);
    setTimeout(forceAddSpeedOptions, 1000);
})();
