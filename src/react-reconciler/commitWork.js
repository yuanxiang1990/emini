import {tag} from "./FiberNode";
import {Effect} from "./differ";

/**
 * 进入commit阶段
 */
export function commitAllWork(topFiber) {
    console.log(topFiber.effects.slice(0))
    commitPreLifeCycle(topFiber);
    topFiber.effects.forEach(fiber => {
        let domParent = fiber.return;
        while (domParent.tag === tag.ClassComponent) {//class类型组件
            domParent = domParent.return;
        }
        if (fiber.effectTag === Effect.PLACEMENT) {
            commitPlacement(fiber, domParent);
        }
        if (fiber.effectTag === Effect.DELETION) {
            commitDeletion(fiber, domParent);
        }
        fiber.effectTag = null;
    })
    commitAfterLifeCycle(topFiber)
    topFiber.effects = [];
}

function commitPlacement(fiber, domParent) {
    if (fiber.tag === tag.ClassComponent) {
        return;
    }
    const before = getHostSibling(domParent, fiber);
    if (!before) {
        domParent.stateNode.appendChild(fiber.stateNode);
    } else {
        domParent.stateNode.insertBefore(fiber.stateNode, before.stateNode);
    }
}

/**
 * 查找当前节点已插入dom中的兄弟节点
 * @param fiber
 */
function getHostSibling(domParent, fiber) {
    let node = fiber;
    while (node !== domParent) {
        if (node.sibling && node.sibling.effectTag !== Effect.PLACEMENT) {
            return node.sibling;
        }
        node = node.return;
    }
}

function commitDeletion(fiber, domParent) {
    if (fiber.tag === tag.ClassComponent) {
        const instance = fiber.stateNode;
        const componentWillUnmount = instance.componentWillUnmount;
        if (typeof componentWillUnmount === "function") {
            componentWillUnmount.call(instance)
        }
        domParent.stateNode.removeChild(fiber.child.stateNode);
    }
    else if (fiber.tag === tag.HostComponent) {
        domParent.stateNode.removeChild(fiber.stateNode);
    }
}

function commitPreLifeCycle(topFiber) {
    topFiber.effects.forEach((fiber, i) => {
        if (fiber.tag === tag.ClassComponent) {
            const instance = fiber.stateNode;
            const UNSAFE_componentWillMount = instance.UNSAFE_componentWillMount;
            const UNSAFE_componentWillUpdate = instance.UNSAFE_componentWillUpdate;
            if (fiber.alternate === null) {
                if (typeof UNSAFE_componentWillMount === "function") {
                    UNSAFE_componentWillMount.call(instance);
                }
            }
            else {
                if (typeof UNSAFE_componentWillUpdate === "function") {
                    UNSAFE_componentWillUpdate.call(instance, fiber.stateNode.props, fiber.stateNode.state);
                }
            }

        }

    })
}

function commitAfterLifeCycle(topFiber) {
    topFiber.effects.forEach((fiber, i) => {
        if (fiber.tag === tag.ClassComponent) {
            const instance = fiber.stateNode;
            const componentDidMount = instance.componentDidMount;
            const componentDidUpdate = instance.componentDidUpdate;
            if (fiber.alternate === null) {
                if (typeof componentDidMount === "function") {
                    componentDidMount.call(instance);
                }
            }
            else {
                if (typeof componentDidUpdate === "function") {
                    componentDidUpdate.call(instance, fiber.alternate.stateNode.props, fiber.alternate.stateNode.state);
                }
            }

        }

    })
}
