import {
    NoWork, Never, Sync, noTimeout, maxSigned31BitInt
} from "./ReactFiberExpirationTime"

export default class FiberNode {
    constructor(tag, pendingProps, key, mode) {
        // Instance
        this.tag = tag;
        this.key = key;
        this.stateNode = null;

        // Fiber
        this.return = null;
        this.child = null;
        this.sibling = null;
        this.index = 0;

        this.ref = null;


        // Effects
        // this.effectTag = NoEffect;
        this.effect = [];

        this.expirationTime = NoWork;

        this.alternate = null;

    }
}