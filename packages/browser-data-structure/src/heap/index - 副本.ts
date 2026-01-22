type GetKey<T> = T extends object ? keyof T : null;

export class Heap<T extends object | number = number> {
    public data: T[] = [];
    public small: boolean;
    public priority: GetKey<T> | null = null;

    /**
     *
     * @param isSmallHeap 小顶堆
     * @param key  当data为对象时,需要此字段对应的值作为大小顶堆的构建凭据
     */
    constructor(isSmallHeap?: boolean, key?: GetKey<T>) {
        let small = (this.small = Boolean(isSmallHeap) ? true : false),
            priority = (this.priority = key ?? null);

        Object.defineProperties(this, {
            small: {
                get() {
                    return small;
                },
                set(newVal: unknown) {
                    newVal = Boolean(newVal);
                    if (small !== newVal) {
                        small = <boolean>newVal;
                        this.reset();
                    }
                },
            },
            priority: {
                get() {
                    return priority;
                },
                set(newVal) {
                    if (newVal && priority !== newVal) {
                        priority = newVal;
                        this.reset();
                    }
                },
            },
        });
    }

    // 插入数据
    insert(val: T | T[]) {
        const valArr = Array.isArray(val) ? val : [val];
        valArr.forEach((item) => {
            this.data.push(item);
            this._adjustUpHeap();
        });
        return this;
    }

    // 取数据
    pop(count = 1, callback: (data: T[]) => unknown) {
        if (count > this.data.length) count = this.data.length;
        const result: T[] = [];
        while (count > 0) {
            result.push(<T>this._heapShift());
            count--;
        }
        callback(result);
        return this;
    }

    // 排序
    sort() {
        let len = this.data.length;
        while (len > 0) {
            const lastIndex = len - 1;
            /**
             * 1. 交换堆顶元素和堆尾元素
             * 2. 向下调整堆顶元素
             */
            this.data.push(this.data[0]);
            this.data[0] = this.data[lastIndex];
            this.data.splice(lastIndex, 1);

            this._adjustDownHeap(0, lastIndex - 1);
            len--;
        }
        return this;
    }

    /**
     *
     *基于现有的数据填充堆,会清空原有数据
     * @param data 填充堆的数据
     */
    fill(data: T[], key?: GetKey<T>) {
        this.clear();
        if (Array.isArray(data) && data.length) {
            this.data.push(...data);
        }
        if (key && this.priority !== key) {
            this.priority = key;
        } else {
            this.reset();
        }
        return this;
    }

    // 清空堆
    clear() {
        const data = this.data;
        while (data.length) {
            data.shift();
        }
        return this;
    }

    // 重置堆
    reset() {
        const { data } = this;
        if (Array.isArray(data) && data.length > 1) {
            // 获取尾节点的父节点索引
            let parentIndex = this._getParentIndex(data.length - 1);
            while (parentIndex >= 0) {
                // 从尾节点的父节点开始,依次向下堆化
                this._adjustDownHeap(parentIndex);
                parentIndex--;
            }
        }
        return this;
    }

    _getPriority(index: number) {
        const { priority } = this;
        if (typeof priority === 'string' && priority) {
            return <number>this.data[index][priority];
        } else {
            return <number>this.data[index];
        }
    }

    _compareExtrem(nodes: [val: number, index: number][]) {
        let extremNode = nodes[0];
        nodes.forEach((node) => {
            if (this.small) {
                // 小顶堆找出极小值
                if (node[0] < extremNode[0]) {
                    extremNode = node;
                }
            } else {
                // 大顶堆找出极大值
                if (node[0] > extremNode[0]) {
                    extremNode = node;
                }
            }
        });
        return extremNode[1];
    }

    // 获取当前索引对应子节点的极值索引
    _getExtremeIndex(startIndex: number, endIndex: number): number {
        // 处理边界情况
        if (typeof endIndex === 'number' && endIndex <= startIndex) {
            return startIndex;
        }

        const { data } = this;
        const lIndex = this._getSubLeftIndex(startIndex),
            rIndex = this._getSubRightIndex(startIndex),
            leftNode = data[lIndex],
            rightNode = data[rIndex];

        if (rightNode) {
            // 左右子节点
            if (lIndex > endIndex) {
                return startIndex;
            } else if (rIndex > endIndex) {
                return this._compareExtrem([
                    [this._getPriority(startIndex), startIndex],
                    [this._getPriority(lIndex), lIndex],
                ]);
            } else {
                return this._compareExtrem([
                    [this._getPriority(startIndex), startIndex],
                    [this._getPriority(lIndex), lIndex],
                    [this._getPriority(rIndex), rIndex],
                ]);
            }
        } else if (leftNode) {
            if (lIndex > endIndex) {
                return startIndex;
            } else {
                // 左子节点
                return this._compareExtrem([
                    [this._getPriority(startIndex), startIndex],
                    [this._getPriority(lIndex), lIndex],
                ]);
            }
        } else {
            // 无子节点
            return startIndex;
        }
    }

    // 从堆顶取出元素
    _heapShift() {
        const heapTop = this.data.shift(),
            heapBottom = this.data.pop();
        // 对堆顶元素向下堆化
        if (heapBottom) {
            this.data.unshift(heapBottom);
            this._adjustDownHeap();
        }
        return heapTop;
    }

    // 向下堆化
    _adjustDownHeap(startIndex?: number, endIndex?: number) {
        const data = this.data;
        /**
         * 限制堆化的范围
         * 1. 起始索引默认为0
         * 2. 结束索引默认为数组最后一个元素
         * 3. 极值索引小于结束索引,并且起始索引不等于极值索引时,继续向下堆化
         */
        startIndex = typeof startIndex === 'number' ? startIndex : 0;
        endIndex = typeof endIndex === 'number' ? endIndex : data.length - 1;

        const extremeIndex = this._getExtremeIndex(startIndex, endIndex);
        if (extremeIndex <= endIndex && startIndex !== extremeIndex) {
            // 调整当前节点与极值节点的位置
            const temp = data[startIndex];
            data[startIndex] = data[extremeIndex];
            data[extremeIndex] = temp;
            // 递归向下堆化
            this._adjustDownHeap(extremeIndex, endIndex);
        }
    }

    // 向上堆化
    _adjustUpHeap(startIndex?: number, endIndex?: number) {
        const data = this.data;

        startIndex = typeof startIndex === 'number' ? startIndex : data.length - 1;
        endIndex = typeof endIndex === 'number' ? endIndex : 0;

        let parentIndex = this._getParentIndex(startIndex);
        while (parentIndex >= endIndex && parentIndex >= 0) {
            const extremeIndex = this._compareExtrem([
                [this._getPriority(parentIndex), parentIndex],
                [this._getPriority(startIndex), startIndex],
            ]);
            // 父节点是极值,则不需要继续向上堆化;
            if (parentIndex === extremeIndex) {
                break;
            }

            // 需要调整父子节点位置
            const parent = this.data[parentIndex];
            this.data[parentIndex] = this.data[startIndex];
            this.data[startIndex] = parent;
            // 继续向上堆化
            startIndex = parentIndex;
            parentIndex = this._getParentIndex(parentIndex);
        }
    }

    // 获取父节点索引
    _getParentIndex(index: number) {
        return Math.floor((index - 1) / 2);
    }

    // 获取左右子节点索引
    _getSubLeftIndex(index: number) {
        return index * 2 + 1;
    }

    // 获取右子节点索引
    _getSubRightIndex(index: number) {
        return index * 2 + 2;
    }
}
