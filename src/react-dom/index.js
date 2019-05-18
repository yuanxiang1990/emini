import {tag} from "../react-reconciler/FiberNode"
import FiberNode from "../react-reconciler/FiberNode";
import {updateContainer} from "../react-reconciler/index"


var createFiber = function (tag, pendingProps, key, mode) {
    return new FiberNode(tag, pendingProps, key, mode);
};

function createHostRootFiber() {
    return createFiber(tag.HostRoot, null, null, false);
}

const ReactDom = {
    render(element, container, callback) {
        const root = createHostRootFiber();
        root.stateNode = container;
        root.nextScheduledRoot = null;//下一个需要执行的root
        root.alternate = null;
        updateContainer(element, root);
    }
};
export default ReactDom;