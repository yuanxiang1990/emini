import FiberNode from "./FiberNode";

const REPLACE = 0;
const REORDER = 1;
const ATTR = 2;
const TEXT = 3;

function sameNode(oldNode, newNode) {
    return (
        oldNode && newNode && oldNode.tag === newNode.tag && oldNode.key === newNode.key
    )
}

function contains(a, obj) {
    var i = 0;
    while (i < a.length) {
        if (sameNode(a[i], obj)) {
            return a[i];
        }
        i++;
    }
    return false;
}

/**
 * 子节点differ算法
 * @param oldChildren
 * @param newChildren
 * @returns {{moves: Array, children: Array}}
 */
function differChildren(oldChildren, newChildren) {
    var newAdd = [], simulateArray = [], moves = [];
    var oldCopy = [].concat(oldChildren);
    /**
     * 丢弃被删除的节点
     */
    for (var i = 0; i < oldCopy.length; i++) {
        var newNode = contains(newChildren, oldCopy[i]);
        if (!newNode) {
            oldCopy.splice(i, 1);
            remove(i);
            i--;
        }
    }
    var newAddIndex = 0;
    for (var i = 0; i < newChildren.length; i++) {
        if (!contains(oldCopy, newChildren[i])) {
            newAdd.push(newChildren[i]);
            insert(oldCopy.length + newAddIndex, newChildren[i]);
            newAddIndex++;
        }
    }
    simulateArray = oldCopy.concat(newAdd);

    var i = 0, j = 0;//i:simulate indx j:new array index
    while (j < newChildren.length) {
        var newItem = newChildren[j];
        if (sameNode(simulateArray[i], newChildren[j])) {
            i++;
            j++;
            continue;
        }
        if (simulateArray[i]) {
            if (sameNode(simulateArray[i + 1], newItem)) {
                simulateArray.splice(i, 1);
                remove(i);
                i++;
                j++;
            }
            else {
                simulateArray.splice(i, 0, newItem);
                insert(i, newItem);
                i++;
                j++;
            }
        }
        else {
            simulateArray.push(newItem);
            insert(i, newItem);
            i++;
            j++;
        }
    }

    // 记录remove操作
    function remove(index) {
        let move = {index: index, type: 0}
        moves.push(move)
    }

    // 记录insert操作
    function insert(index, item) {
        let move = {index: index, item: item, type: 1};
        moves.push(move)
    }

    /**
     * 移除多余的dom元素
     */
    while (simulateArray.length > newChildren.length) {
        simulateArray.splice(simulateArray.length - 1, 1);
        remove(simulateArray.length - 1);
    }

    return {
        moves: moves,
        children: simulateArray
    }
}

function toArray(fiber) {
    const children = [];
    if (fiber) {
        let sib = fiber.sibling;
        children.push(fiber)
        while (sib) {
            children.push(sib);
            sib = sib.sibling;
        }
    }
    return children
}


function updateHost(workInProgress, newFiber) {
    const effect = differChildren(toArray(workInProgress.alternate.child), toArray(newFiber));
    console.log(effect)
    console.log(newFiber)
    effect.moves.forEach((item) => {
        if (item.type === 1) {//子节点插入
            const element = item.item;
            console.log(element)
            const child = new FiberNode(element.type);
            child.stateNode = document.createElement(element.type);
            child.return = workInProgress;
            if (workInProgress.child == null) {
                workInProgress.child = child;
            }
            else {
                let i = 0;
                let sibling;
                while (sibling = workInProgress.child.sibling) {
                    if (i === item.index) {
                        let temp = sibling;

                    }
                    i++
                }
            }
        }
    })
    workInProgress.effect.push(effect);
    return workInProgress.child;
}


export {updateHost}