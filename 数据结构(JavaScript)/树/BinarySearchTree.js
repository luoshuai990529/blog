/*
 * @Date: 2022-01-14 23:09:56
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-14 23:47:50
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
                if (node.left !== null) {
                    node = node.left;
                } else {
                    node.left = new BinarySearchTreeNode(key, value, node);
                    return true;
                }
            } else if (node.key < key) {
                if (node.right !== null) {
                    node = node.right;
                } else {
                    node.right = new BinarySearchTreeNode(key, value, node);
                    return true;
                }
            }
        }
    }
}
