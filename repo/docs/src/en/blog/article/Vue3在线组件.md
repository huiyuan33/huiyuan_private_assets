---
title: Vue3在线组件
icon: y-article
cover: /image/blog/Vue3在线组件/cover.jpg
date: 2024-11-07

star: true

category: vue3
tag:
  - plugin
---

## 前置

1. [^vue3SfcLoader][vue3-sfc-loader](https://github.com/FranckFreiburger/vue3-sfc-loader)

[^vue3SfcLoader]: 一个在生产环境,集vue组件加载、解析、转换并执行的工具，支持typesript。

## 概览

### 总设计概览

```flow
st=>start:  Class: abstract SymbolNode
e=>end: Event: message

op1=>operation: VueSfcLoader
op2=>operation: VueInstance

cond1=>condition: cached?

sub1=>subroutine: Function: Symbol File

st(bottom)->sub1(bottom)->cond1(bottom)
cond1(no)->op1->op2->e
cond1(yes)->op2
e(left)->sub1
```

### 数据流概览

```flow
st=>start: Class: abstract SymbolNode
e=>end: Event: message

op1=>operation: VueSfcLoader
op2=>operation: VueInstance

cond1=>condition: cached?
cond2=>condition: cached?

sub1=>subroutine: Function: Symbol File

st->cond1
cond1(no, bottom)->sub1->cond2
cond2(yes, bottom)->op2
cond2(no, right)->op1->op2->e
cond1(yes, right)->cond2
e(left)->cond1
```

## 实现

### 图符抽象类实现

::: important 思路

1. 拥有renderHMTL方法, 用于支持远端和本地字符串函数执行, 且得到最终DOM片段
2. 拥有通信机制, 建立SymbolNode实例和Vue实例的链接
3. 拥有图符类应该具备的其它通用方法和属性

:::

```TS
abstract class Symbol {
    public cached = new Map<string, any>();

    public mitter = {
        // 监听事件
        $on() {},
        // 触发事件
        $emit() {},
        // 获取数据
        get() {}
    }

    abstract renderHTML(): HTMLElement;

    // 其它抽象方法 通信, 样式等...
}

class SymbolNode extends Symbol {
    renderHTML() {
        /**
         * 远端图符文件内函数字符串
         * const remoteFuncStr = fetch('/remote/SymbolNode.txt');
         *
         * 本地字符串
         * const localFuncStr = `function() { return dom }`;
         *
         * 执行funcStr且指定this,并返回产出的dom
         * const func = new Function(remoteFuncStr)
         * return funcStr.call(this);
         *
         */
    }
}

// 生产图元
new SymbolNode();

```

### 图符文件函数编写

::: important 思路

1. 基于图符节点缓存判断远端图符组件是否加载并实例化
2. 未加载的场景下基于VueSfcLoader加载并生成对应的组件实例
3. 将mitter实例注入到组件实例
4. 需要保证全局拥有Vue, ElementPlus & Vue3SfcLoader

:::

```TS
function () {
    const { cache, mitter } = this;
    const view = cache.get('view');

    if (view) return view;

    const options = {
        moduleCache: {
            vue: Vue,
        },
        async getFile(url) {
            const { ok, text, arrayBuffer, statusText } = await fetch(url);
            if (ok) {
                return {
                    getContentData: (binary) => {
                      return binary ? arrayBuffer() : text()
                    },
                };
            } else {
                throw new Error(statusText);
            }
        },
        addStyle(styleContent) {
            const style = document.createElement('style');
              style.textContent = styleContent;
            document.head.appendChild(style);
        },
    };

    // 加载并渲染当前组件
    const { loadModule } = window['vue3-sfc-loader'];
    // 创建目标节点
    const dom = document.createElement('div');
    cache.set('view', dom)

    Vue.createApp(
        Vue.defineAsyncComponent({
            loader: () => loadModule('./component/table.vue', options),
        }),
    )
    .use(ElementPlus)
    .provide('mitter', mitter)
    .mount(dom);
}
```

### 图符组件实现

::: important 思路

1. 实现一款随Symbol数据变化的自定义表格组件
2. 通过mitter同步获取数据, 且触发update
3. 基于mitter的变化, 触发update
4. 基于滚动逻辑完成对表格滚动的控制

:::

```TS
type TableAttrs = BindingExtendAttrs
          & MultipleDatasourceAttrs
          & PaginationAttrs
          & ScrollerAttrs;

type TableAttrshandlers = {
    [key: keyof TableAttrs]: {
        val: any;
        update: (this: UpdateManager<TableAttrs>) => void;
    };
};

// 滚动: 具体实现逻辑
function autoscrollHandle(options: HandlescrollOptions) {
    // 开启计时器,进行周期逻辑处理
    const timer = setInterval(() => {
        // 优先确定当前是否在执行
        if (!options.rumning) {
            return clearInterval(timer)
        } else {
            // 周期运转的逻辑
            const direction = scrollData.autoScrollDirection
            const complete = isScrollComplete(direction)
            const isPagination = paginationData.showPagination

            if (complete === false) {
                // 场景1: 触发滚动调度,但没有滚动条
                options.running = false
            } else {
                const { isScrollComplete, offset, scrollRef } = complete

                if (isScrollComplete) {
                    /**
                    * 当前页滚动完成
                    * 场景1: 当前无分页,垂直滚动完成
                    * 场景2: 当前无分页,水平滚动完成
                    * 场景3: 当前有分页,垂直滚列完成
                    * 场景4: 当前有分页,水平滚动完成
                    */
                    // 特殊场景3: 分页&垂直滚动
                    if (isPagination && direction === 'column') {
                        const { currentPage, totals, pagesizes } = paginationData;
                        const pageCount = totals / pagesizes
                        if (currentPage < pageCount) {
                            paginationData.currentPage += 1
                        } else {
                            paginationData.currentPage = 1
                        }
                        // 触发分页变化
                        handleCurrentChange(paginationData.currentPage)
                    }
                    // 所有场景: 重置水平垂直偏移量
                    direction === 'row' ?
                      scrollRef.setscrollLeft(0) :
                      scrollRef.setscrollTop(0)
                } else {
                    // 当前页滚动未完成
                    if (direction === 'row') {
                        /**
                        * 进行水平滚动
                        * frames: 每次滚动可以使用的帧数
                        * 60/2: 将帧数折半,用于保证完成过渡
                        * step: 计算每帧对应的步长
                        * */
                        const frames = (options.interval * 60) / 2
                        const step = options.perHorizontalScrollDistance / frames
                        setScrollAnimation(
                            scrollRef.setscrollleft,
                            offset,
                            offset + options.perHorizontalScrolldistance,
                            step
                        )
                    } else {
                        // 进行垂直移动
                        const frames = (options.interval * 60) / 2
                        const step = options.perVerticalScrollDistance / frames
                           scrollRef.setscrolllTop,
                            offset,
                            offset + options.perVerticalScrollDistance,
                          setScrollAnimation(
                           step
                        )
                    }
                }
            }
        }
    }, options.interval * 1000)
}

// 滚动: 判断完成逻辑
function isScrollComplete(direction: ScrollerAttrs['autoscrollDirection']) {
    const scrollRef = elTableRef.value?.ScrollBarRef;
    if (scrollRef) {
        const wraper: HTMLDivElement = scrollRef.wrapRef,
            viewr: HTMLDivElement = scrollRef.wrapRef.children[0];
        const wh = wraper.clientHeight,
            ww = wraper.clientWidth,
            wt = wraper.scrollTop,
            wl = wraper.scrollLeft,
            vh = viewr.clientHeight,
            vw = viewr.clientWidth;

        if (direction === 'column') {
            if (wh + wt >= vh) {
                // 场景2: 垂直滚动完成
                return {
                    isScrollComplete: true,
                    offset: wt,
                    scrollRef,
                };
            } else {
                return {
                    isScrollComplete: false,
                    offset: wt,
                    scrollRef,
                };
            }
        } else {
            if (wl + ww >= vw) {
                // 场景2： 水平滚动完成
                return {
                    isScrollComplete: true,
                    offset: wl,
                    scrollRef,
                };
            } else {
                return {
                    isScrollComplete: false,
                    offset: wl,
                    scrollRef,
                };
            }
        }
    } else {
        // 场景： 滚动条不存在,认为无法滚动
        return false;
    }
}

// 滚动: 动画补帧
function setScrollAnimation(
    scroll: (end: number) => void,
    start: number,
    end: number,
    step = 1
) {
    const nextstart = start + step
    if (nextstart > end) {
        scroll(end)
    } else {
        scroll(nextstart)
        requestAnimationFrame(() => {
            setScrollAnimation(scroll, nextstart, end, step)
        })
    }
}

// 滚动: 生成滚动控制函数
function enableScrollhandle(scrollOptions: HandlescrollOptions) {
    const running = false;
    return function (enable: boolean) {
        if (enable) {
            // 正在滚动, 即无效操作, 直接结告束
            if (running) {
                return
            } else {
                // 启用滚动,需要延退依赖e1-scro11的dom获取
                running = true
                setTimeout(() => {
                    autoScrollhandle(scrollOptions)
                }, 200)
            }
        } else {
            running = false
        }
    }
}
const enableAutoScroll = enableScrollhandle({
  interval: 2,
  perHorizontalScrollDistance: 50,
  perVerticalscrollistance: 50,
})

const tableAttrsHandle: TableAttrsHandlers = {
    ...,
    autoScroll: {
        val: scrollData.autoscroll,
        update() {
            const autoScroll = this.get("autoScroll")
            if (typeof autoScroll === "boolean") {
                scrollData.autoScroll = autoScroll
                // 自动滚动实现
                if (autoScroll) {
                    enableAutoScroll(true)
                } else {
                    enableAutoScroll(false)
                }
            }
        }
    }
    ...,
}

class UpdateManager<Attrs> {
    public cachedAttrs: UpdateManagerAttrsHandlers

    constructor(data: UpdateManagerAttrshandlers) {
        this.cachedAttrs = data
    }

    get<T extends keyof Attrs>(key: T): Attrs[T] {
        return this._get(key)
    }

    set(key: keyof Attrs, val: unknown) {
        return this._set(key, val)
    }

    _get(key) {
        if (!key) return
        // 触发属性读取
        return this.cachedAttrs[key].val
    }

    _set(key, val: unknown) {
        // // 场景1: key值不存在
        if (!key) return false

        const cachedAttr = this.cachedAttrs[key]
        if (cachedAttr) {
            const oldVal = cachedAttr.val;
            // 场景2. 基本类型的值
            if (typeof oldVal !== 'object' && !Object.is(oldVal, val)) {
                cachedAttr.val = val
                cachedAttr.update.call(this)
                return true
            }
            // 场景3: 复合类型的值
            if (
                typeof oldVal === 'object' &&
                JSON.stringify(oldVal) !== JSON.stringify(val)
              ) {
                cachedAttr.val = val
                cachedAttr.update.call(this)
                return true
            }
        } else {
            // 场景4: 当前值不存在
            return false
        }
    }

    update(newData: Attrs & Record<string, unknown>) {
        if (newData) {
            Object.keys(this.cachedAttrs).forEach((key) => {
                this._set(key, newData[key])
            })
        }
    }
}

// 初始化
const updateManager = new UpdateManager<TableAttrs>(tableAttrsHandle)
updateManager.update(mitter.get())
// 后续变化
mitter.on((val) => updateManager.update(val))

```
