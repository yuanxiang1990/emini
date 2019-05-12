import {
    NoWork, Never, Sync, noTimeout, maxSigned31BitInt
} from "./ReactFiberExpirationTime"

export default class FiberNode {
    constructor(tag, type,pendingProps, key) {
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


        // Effects
        // this.effectTag = NoEffect;
        this.effects = [];
        this.effectTag = null;
        this.expirationTime = NoWork;

        this.alternate = null;

        this.queue = [];

    }
}

export function createFiber(tag,type, pendingProps, key) {
    return new FiberNode(tag, type,pendingProps, key);
};

export const tag = {
    HostComponent:1,
    ClassComponent:2,
    HostRoot: 3
}