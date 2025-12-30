---
home: true

title: 博客主页
icon: y-blog
layout: BlogHome

bgImage: /image/blog/bg-image.jpg

heroFullScreen: true
heroText: 五十色の葉
tagline: 保持年轻，保持好奇，保持理性，永远都不要停止思考

projects:
  - icon: cy-project
    name: 项目
    desc: 项目详细描述
    link: https://你的项目链接

  - icon: cy-article
    name: 文章
    desc: 文章详细描述
    link: https://你的文章链接

  - icon: cy-link
    name: 链接
    desc: 链接详细描述
    link: https://链接地址

  - icon: cy-vbook
    name: 微信读书
    desc: 我的书架
    link: https://weread.qq.com/web/shelf
---

<script setup lang="ts">
  import FireFlyFactory from '@util/firefly.ts'

  import { onMounted, onUnmounted } from 'vue'

  let fireFlyFactory: string = null;

  onMounted(() => {
    fireFlyFactory = new FireFlyFactory();
  })

  onUnmounted(() => {
    fireFlyFactory.destroye()
  })
</script>
