/*
 * @Date: 2022-01-21 23:27:00
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-01-25 15:33:57
 */

/* 
    图中的每个节点必须具有以下属性：
        key: 节点的key
        value: 节点的值
    
    图的每条边必须具有以下属性：
        a: 边的起始节点
        b：边的目标节点
        weight: 边的权重值

    图的主要操作方法：
        addNode：插入具有特定键和值的新节点
        addEdge：在两个给定节点之间插入一条新边，可选地设置其权重
        removeNode：移除一个具有特定键的节点
        removeEdge：移除两个给定节点之间的边
        findNode：找到给定键的节点
        hasEdge：检查图中是否含有给定两点之间的边
        setEdgeWeight：设置给定边的权重
        setEdgeWeight：获取指定边的权重
        adjacent：查找从给定节点中存在边的所有节点
        indegree：计算给定节点的总边数  
        outdegree：计算给定节点的总边数   

*/
class Graph {
    constructor(directed = true) {
        this.directed = directed;
        this.nodes = []
        this.edges = new Map();
    }

    addNode(key, value = key) {
        this.nodes.push({ key, value });
    }

    addEdge(a, b, weight) {
        const key = JSON.stringify([a, b])
        const value = { a, b, weight }
        this.edges.set(key, value)
        if (!this.directed) {
            // 如果没有方向 即无序图，那么这条边两端都可以是起始和结束节点
            const key = JSON.stringify([b, a])
            const value = { a: b, b: a, weight }
            this.edges.set(key, value);
        }
    }

    removeNode(key) {
        // 1-过滤掉被删除的节点
        this.nodes = this.nodes.filter(n => n.key !== key);
        // 2-遍历所有边的value属性，找到对应的key，然后删除其key
        [...this.edges.values()].forEach(({ a, b }) => {
            if (a === key || b === key) {
                const key = JSON.stringify([a, b])
                this.edges.delete(key);
            }
        })
    }

    removeEdge(a, b) {
        this.edges.delete(JSON.stringify([a, b]));
        if (!this.directed) {
            // 如果是无序图，则还需要删除其收尾互换后的边
            this.edges.delete(JSON.stringify([b, a]))
        }
    }

    hasEdge(a, b) {
        return this.edges.has(JSON.stringify([a, b]));
    }

    // 设置一条边的权重值
    setEdgeWeight(a, b, weight) {
        // 设置变得权重起始就是直接覆盖，那么和添加一条边的操作是一样的
        const key = JSON.stringify([a, b])
        const value = { a, b, weight }
        this.edges.set(key, value)
        if (!this.directed) {
            const key = JSON.stringify([b, a])
            const value = { a: b, b: a, weight }
            this.edges.set(key, value);
        }
    }

    // 获取一条边的权重值
    getEdgeWeight(a, b) {
        const key = JSON.stringify([a, b])
        const { weight } = this.edges.get(key)
        return weight
    }

    // 查找给定节点的相邻节点
    adjacent(key) {
        return [...this.edges.values()].reduce((acc, { a, b }) => {
            if (a === key) {
                acc.push(b);
            }
            return acc;
        }, [])
    }

    // 计算给定节点的总边数 (引入次数)
    indegree(key) {
        return [...this.edges.values()].reduce((acc, { a, b }) => {
            if (b === key) acc++;
            return acc;
        }, 0);
    }

    // 计算给定节点的总边数 (引出次数)
    outdegree(key) {
        return [...this.edges.values()].reduce((acc, { a, b }) => {
            if (a === key) acc++;
            return acc;
        }, 0);
    }
}
