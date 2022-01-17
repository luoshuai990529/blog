/*
 * @Date: 2022-01-14 23:09:56
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-17 23:10:10
 */

// 节点类BinarySearchTreeNode
class BinarySearchTreeNode {
    constructor(key, value = key, parent = null) {
        this.key = key;
        this.value = value;
        this.parent = parent;
        this.left = null;
        this.right = null;
    }

    // 左右节点是否都为null
    get isLeaf() {
        return this.left === null && this.right === null;
    }

    // 是否有子节点
    get hasChildren() {
        return !this.isLeaf;
    }
}

class BinarySearchTree {
    constructor(key, value = key) {
        this.root = new BinarySearchTreeNode(key, value);
    }

    insert(key, value = key) {
        let node = this.root;
        while (true) {
            if (node.key === key) return false;
            if (node.key > key) {
                // 插入节点的key 比当前比较节点的key 小，因此插入的节点应该放在此节点的左边节点下
                if (node.left !== null) {
                    // 此时该节点的左节点不为null，则拿该节点的左节点继续比较
                    node = node.left;
                } else {
                    // 此时该节点的左节点为null，则直接插入节点到该节点的左节点
                    node.left = new BinarySearchTreeNode(key, value, node);
                    return true;
                }
            } else if (node.key < key) {
                // 插入节点的key 比当前比较节点的key 大，因此插入的节点应该放在此节点的右边节点下
                if (node.right !== null) {
                    // 此时该节点的右节点不为null，则拿该节点的右节点继续比较
                    node = node.right;
                } else {
                    // 此时该节点的右节点为null，则直接插入节点到该节点的右节点
                    node.right = new BinarySearchTreeNode(key, value, node);
                    return true;
                }
            }
        }
    }

    // 中序遍历
    *inOrderTraversal(node = this.root) {
        if (node.left) yield* this.inOrderTraversal(node.left);
        yield node;
        if (node.right) yield* this.inOrderTraversal(node.right);
    }

    // 前序遍历
    *preOrderTraversal(node = this.root) {
        yield node;
        if (node.left) yield* this.preOrderTraversal(node.left);
        if (node.right) yield* this.preOrderTraversal(node.right);
    }

    // 后序遍历
    *postOrderTraversal(node = this.root) {
        if (node.left) yield* this.postOrderTraversal(node.left);
        if (node.right) yield* this.postOrderTraversal(node.right);
        yield node;
    }

    // 查找指定节点
    find(key) {
        // postOrderTraversal返回的是一个遍历器对象，因此可以用for of 来遍历
        for (const node of this.postOrderTraversal()) {
            if (node.key === key) return node;
        }
        return undefined;
    }

    // 删除指定节点和它的所有链接
    remove(key) {
        // 1- 首先找到指定节点，如果没找到则直接返回false
        const node = this.find(key);
        if (!node) return false;
        //
        const isRoot = node.parent === null; // 是否是根节点
        const isLeftChild = !isRoot ? node.parent.left === node : false; // 被删除的节点 是否为左子节点
        const hasBothChildren = node.left !== null && node.right !== null; // 被删除的这个节点 是否有两个子节点，即左右节点都有
        console.log("isLeftChild---", isLeftChild);
        console.log("hasBothChildren---", hasBothChildren);
        console.log("node.isLeaf---", node.isLeaf);
        if (node.isLeaf) {
            // 如果被删除的节点 一个子节点都没有
            if (!isRoot) {
                if (isLeftChild) {
                    // 是左子节点
                    node.parent.left = null;
                } else {
                    // 是右子节点
                    node.parent.right = null;
                }
            } else {
                // 如果是根节点，则直接让根节点为null
                this.root = null;
            }
            return true;
        }else if(!hasBothChildren){
            // 如果被删除的节点 只有一个子节点
            const child = node.left !== null ? node.left : node.right; // 拿到该节点的子节点
            if(!isRoot){
                if(isLeftChild){
                    // 是左节点
                    node.parent.left = child;
                }else{
                    // 是右节点
                    node.parent.right = child
                }
            }else{
                // 如果该节点是根节点,直接让根节点指向 被删除节点的 子节点
                this.root = child
            }
            // 最后让该子节点的 父节点 指向被删除节点的父节点（有点像删除链表中一个节点的操作）
            child.parent = node.parent
            return true
        }else{
            // 如果被删除的节点 有两个子节点
            
        }
    }
}
