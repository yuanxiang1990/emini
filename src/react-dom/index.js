const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
import FiberNode from "../react-reconciler/FiberNode";
import {
    NoWork, Never, Sync, noTimeout, maxSigned31BitInt
} from "../react-reconciler/ReactFiberExpirationTime"
import {updateContainer} from "../react-reconciler/index"

class ReactRoot {
    constructor(container, isConcurrent, hydrate) {
        var root = createFiberRoot(container);//创建根fiber节点
        this._internalRoot = root;
    }

    render(children, callback) {
        updateContainer(children, this._internalRoot);
    };
}

/**
 * react 根节点
 * @param containerInfo dom
 * @param hydrate
 * @constructor
 */
function FiberRootNode(containerInfo, hydrate) {
    this.containerInfo = containerInfo;
}


var createFiber = function (tag, pendingProps, key, mode) {
    // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
    return new FiberNode(tag, pendingProps, key, mode);
};

function createHostRootFiber(isConcurrent) {
    return createFiber(HostRoot, null, null, false);
}

function createFiberRoot(containerInfo) {
    var root = new FiberRootNode(containerInfo);

    // Cyclic construction. This cheats the type system right now because
    // stateNode is any.
    var uninitializedFiber = createHostRootFiber();
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;
    return root;
}

function legacyCreateRootFromDOMContainer(container, forceHydrate) {
    return new ReactRoot(container);
}

const ReactDom = {
    render(element, container, callback) {
        var root = container._reactRootContainer;
        if (!root) {
            root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container);
        }
        root.render(element, root);
    }
};
export default ReactDom;