import { Chalk } from '@hyuan/chalk';

/**
 *堆
 1. 支持数字堆
 2. 支持对象堆 存在priority字段值为数字
 */
export class Heap<T extends number | { [key: string]: unknown } = number> {
    public data: T[] = [];
    public small = true;
    public priority = '';

    private _chalk = new Chalk('@hyuan/browser-data-structure Heap');

    constructor(priority = '') {
        const chalk = this._chalk;
        this.priority = priority;

        let small = this.small;
        Object.defineProperties(this, {
            small: {
                get() {
                    return small;
                },
                set(newVal) {
                    if (typeof newVal === 'boolean') {
                        small = newVal;
                        this.reset();
                    } else {
                        chalk.log(
                            'error',
                            `attribute small need a boolean value, but supply a ${typeof newVal}!`,
                        );
                    }
                },
            },
        });
    }

    init(data: T[]) {
        this._chalk.log('warn', `init operation has reseted heap!`);
        this.data = data;

        this._adjustUpHeap(this.data.length - 1);
    }

    reset() {}

    _adjustUpHeap(index: number) {
        // debugger;
        const temp = this._getHeapVal(index);
        if (index === 0) {
            return this;
        } else {
            // 需要递归向上堆化
            if (temp) {
                const parentIndex = this._getParentIndex(index);
            } else {
                this._chalk.log(
                    'error',
                    `out-of-bounds element was detected inside the _adjustUpHeap function.`,
                );
            }
        }
    }

    _adjustDownHeap(index: number) {}

    // 基于索引获取堆排序依据的值
    _getHeapVal(index: number) {
        const temp = this.data[index];

        if (temp) {
            // 场景1: 数字堆
            if (typeof temp === 'number') {
                return temp;
            }
            // 场景2: 对象堆
            if (typeof temp === 'object') {
                return this.priority
                    ? typeof temp[this.priority] === 'number'
                        ? <number>temp[this.priority]
                        : (this._chalk.log(
                              'error',
                              `object heap the priority corresponding value should be a number.`,
                          ),
                          undefined)
                    : (this._chalk.log(
                          'error',
                          `object heap the priority corresponding field should not be an empty string.`,
                      ),
                      undefined);
            }
        } else {
            this._chalk.log(
                'error',
                `out-of-bounds element was detected inside the _adjustUpHeap function.`,
            );
        }
    }

    // 获取父节点索引
    _getParentIndex(index: number) {
        return Math.floor((index - 1) / 2);
    }

    // 获取左子节点索引
    _getLeftIndex(index: number) {
        return index * 2 + 1;
    }

    // 获取右子节点索引
    _getRightIndex(index: number) {
        return index * 2 + 2;
    }
}

const a = new Heap();
const b = new Heap<{ c: number }>();
b.priority = 'c1';

const n = [3, 4, 1, 8, 2, 6];
const o = n.map((item) => {
    return { c: item };
});
b.init(o);
// console.log(b._getHeapVal(2));

console.log(b);

// a.init([3, 4, 1, 8, 2, 6]);
