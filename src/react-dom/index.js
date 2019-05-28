import {tag} from "../react-reconciler/FiberNode"
import {FiberNode} from "../react-reconciler/FiberNode";
import {updateContainer} from "../react-reconciler/index"


let createFiber = function (tag, type,pendingProps, key) {
    return new FiberNode(tag,type, pendingProps, key);
};

function createHostRootFiber() {
    return createFiber(tag.HostRoot, null, null, false);
}

const ReactDom = {
    render(element, container, callback) {
        const root = createHostRootFiber();
        root.stateNode = container;
        root.alternate = null;
        updateContainer(element, root);
    }
};
export default ReactDom;