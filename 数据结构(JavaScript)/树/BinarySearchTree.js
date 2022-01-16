/*
 * @Date: 2022-01-14 23:09:56
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-16 22:26:21
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
}
