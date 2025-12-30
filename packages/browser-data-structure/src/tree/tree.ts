import { Chalk } from '@hyuan/chalk';

type DefaultTreeData = {
    id: string | number;
    children: DefaultTreeData[];
};

interface BaseTreeInterface {
    root: TreeNode | null;
    nodeMap: Map<DefaultTreeData['id'], TreeNode>;

    size: number;
    height: number;

    insert(id: DefaultTreeData['id'], data: DefaultTreeData): void;
    delete(id: DefaultTreeData['id']): void;
    find(id: DefaultTreeData['id']): TreeNode | null;
}

export class TreeNode<T extends DefaultTreeData = DefaultTreeData> {
    public data: T;

    public id: T['id'];
    public parent: TreeNode<T> | null = null;
    public children: TreeNode<T>[] = [];
    public depth: number;
    public leaf: boolean;

    constructor(data: T, parent: TreeNode<T> | null, depth: number) {
        this.id = data.id;
        this.data = data;
        this.parent = parent ?? null;
        this.depth = depth;
        this.leaf = false;

        if (parent) {
            parent.children.push(this);
        }
        if (!data.children || data.children.length === 0) {
            this.leaf = true;
        }
    }
}

export class Tree<
    T extends DefaultTreeData = DefaultTreeData,
> implements BaseTreeInterface {
    public root: TreeNode<T> | null = null;
    public nodeMap = new Map<T['id'], TreeNode<T>>();
    private _chalk: Chalk;

    constructor(data: T) {
        this._chalk = new Chalk();
        if (data) {
            this._init(data);
        }
    }

    get size() {
        return this.nodeMap.size;
    }

    get height() {
        const depthArr = [...this.nodeMap.values()].map((node) => node.depth);
        return Math.max(...depthArr);
    }

    insert(parentId: T['id'], data: T) {
        const parentNode = this.nodeMap.get(parentId);
        if (parentNode) {
            if (data) {
                new TreeNode(data, parentNode, parentNode.depth + 1);
                this._chalk.log('ready', `insert ${JSON.stringify(data)} success !`);
            }
        } else {
            this._chalk.log(
                'error',
                `id ${parentId} not found in the tree, insert failed !`,
            );
        }
    }

    delete(id: T['id']) {
        const node = this.nodeMap.get(id);
        if (node) {
            if (node.parent) {
                // 非根节点删除
                const index = node.parent.children.indexOf(node);
                if (index > -1) {
                    node.parent.children.splice(index, 1);
                }
            } else {
                // 根节点删除
                this.root = null;
            }
            this.nodeMap.delete(id);
        }
    }

    find(id: T['id']): TreeNode<T> | null {
        return this.nodeMap.get(id) ?? null;
    }

    // 深度优先遍历
    depthFirstTraversal(callback: (node: TreeNode<T>) => true | void, sort: '') {
        let stopFlag = false;

        (function recusive(nodes: TreeNode<T>[] | null) {
            if (stopFlag) return;
            if (Array.isArray(nodes) && nodes.length) {
                for (const node of nodes) {
                    // 避免递归时第一层级节点并发执行
                    if (!stopFlag && callback(node)) {
                        stopFlag = true;
                        return;
                    } else {
                        recusive(node.children);
                    }
                }
            }
        })(this.root ? [this.root] : null);
    }

    // 广度优先遍历
    breadthFirstTraveral(callback: (node: TreeNode<T>) => true | void) {
        if (this.root) {
            const queue: TreeNode<T>[] = [this.root];
            while (queue.length) {
                const node = queue.shift();
                if (node) {
                    if (callback(node)) break;
                    if (Array.isArray(node.children) && node.children.length) {
                        queue.push(...node.children);
                    }
                }
            }
        }
    }

    // 初始化树
    _init(data: T, parent: TreeNode<T> | null = null, depth = 0) {
        const nodeMap = this.nodeMap;
        if (nodeMap.has(data.id)) {
            this._chalk.log('error', `Repeated id in ${JSON.stringify(data)}`);
        }
        const treeNode = new TreeNode(data, parent, depth);
        nodeMap.set(data.id, treeNode);
        // 绑定根节点
        if (!this.root) {
            this.root = treeNode;
        }
        // 递归处理子节点
        if (Array.isArray(data.children) && data.children.length) {
            data.children.forEach((child) => {
                this._init(<T>child, treeNode, depth + 1);
            });
        }
    }
}
