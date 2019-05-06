import {
    NoWork, Never, Sync, noTimeout, maxSigned31BitInt
} from "./ReactFiberExpirationTime"

export default class FiberNode {
    constructor(tag, type,pendingProps, key, mode) {
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

        this.props = null;


        // Effects
        // this.effectTag = NoEffect;
        this.effects = [];
        this.effectTag = null;
        this.expirationTime = NoWork;

        this.alternate = null;

    }
}

export function createFiber(tag,type, pendingProps, key, mode) {
    return new FiberNode(tag, type,pendingProps, key, mode);
};

export const tag = {
    HostComponent:1,
    HostRoot: 3
}