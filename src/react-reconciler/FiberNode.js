import {
    NoWork, Never, Sync, noTimeout, maxSigned31BitInt
} from "./ReactFiberExpirationTime"

export  class FiberNode {
    constructor(tag, type, pendingProps, key) {
        // Instance
        this.tag = tag;
        this.key = key;
        this.stateNode = null;
        this.type = type;

        // Fiber
        this.return = null;
        this.child = null;
        this.sibling = null;
        this.index = 0;

        this.props = pendingProps;
        this.memoizedState = null;

        // Effects
        // this.effectTag = NoEffect;
        this.effects = [];
        this.effectTag = null;
        this.expirationTime = NoWork;

        this.alternate = null;

        this.updateQueue = [];//更新队列

    }
}

export function createFiber(tag, type, pendingProps, key) {
    return new FiberNode(tag, type, pendingProps, key);
};

export function getRootFiber(fiber) {
    let curFiber = fiber;
    while (curFiber) {
        if (!curFiber.return) {
            return curFiber;
        }
        curFiber = curFiber.return;
    }
}

export const tag = {
    HostComponent: 1,
    ClassComponent: 2,
    HostRoot: 3
}