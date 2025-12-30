---
title: 视频
icon: y-video
article: false
---

::: vue-playground Vue 交互演示 1

@file App.vue

```vue
<script setup>
import { ref } from 'vue';

const msg = ref('你好交互演示!');
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg" />
</template>
```

:::
