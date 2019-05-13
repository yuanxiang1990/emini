import {
    NoWork,
    Never,
    Sync,
    noTimeout,
    maxSigned31BitInt,
    originalStartTimeMs,
    msToExpirationTime,
    MAGIC_NUMBER_OFFSET,
    UNIT_SIZE,
    computeInteractiveExpiration,
    computeAsyncExpiration
} from "./ReactFiberExpirationTime.js"
import FiberNode, {tag} from "./FiberNode";
import {updateHostComponent, updateClassComponent, Effect} from "./differ";

let isRendering = false;
let currentSchedulerTime = maxSigned31BitInt - Date.now();
let nextFlushedExpirationTime = NoWork;
let currentRendererTime = msToExpirationTime(originalStartTimeMs);
// The time at which we're currently rendering work.
let nextRenderExpirationTime = NoWork;
let isWorking = false;
let isCommitting = false;
let isBatchingInteractiveUpdates = false;//是否高优先级更新，如用户交互等
let workInProgress = null;//当前工作树
let nextUnitOfWork = null;//下一工作单元的任务
let pendingCommit;

/**
 * class类型组件相关方法
 * @type {{enqueueSetState: classComponentUpdater.enqueueSetState}}
 */
const classComponentUpdater = {
    enqueueSetState: function (inst, payload) {
        const fiber = inst._reactInternalFiber;
        const currentTime = requestCurrentTime()
        const expirationTime = computeExpirationForFiber(currentTime);
        fiber.updateQueue.push({
            payload
        })
        const root = getRootFiber(fiber);
        root.expirationTime = expirationTime;
        console.log(root, 666)
        if (root.expirationTime > nextRenderExpirationTime) {
            nextUnitOfWork = null;//当前任务优先级更高，直接打断之前的任务
            requestWork(root, expirationTime);
        }
    }
}

function getRootFiber(fiber) {
    let curFiber = fiber;
    while (curFiber) {
        if (!curFiber.return) {
            return curFiber;
        }
        curFiber = curFiber.return;
    }
}

function updateContainer(children, containerFiberRoot) {
    let root = containerFiberRoot;
    let currentTime = requestCurrentTime();
    let expirationTime = computeExpirationForFiber(currentTime);
    root.expirationTime = expirationTime;
    root.updateQueue.push({
        element: children
    })
    return updateContainerAtExpirationTime(root, expirationTime)
}

function updateContainerAtExpirationTime(currentFiber, expirationTime) {
    currentFiber.expirationTime = expirationTime;
    scheduleWork(currentFiber, expirationTime)
}


function scheduleWork(current, element, expirationTime) {
    requestWork(current, expirationTime);
}

function requestWork(current, expirationTime) {
    if (expirationTime === Sync) {
        performSyncWork(current);
    } else {
        performAsyncWork(current, expirationTime);
    }
}

function performSyncWork(current) {
    performWork(null, current)
}

function performAsyncWork(current, expirationTime) {
    recomputeCurrentRendererTime();
    requestIdleCallback((deadline) => {
        return performWork(deadline, current)
    })
}

function performWork(deadline, current) {
    isWorking = true;
    isRendering = true;
    if (nextUnitOfWork == null) {
        workInProgress = createWorkInProgress(current);
        nextUnitOfWork = workInProgress;
        nextRenderExpirationTime = workInProgress.expirationTime;
    }

    workLoop(deadline);
    recomputeCurrentRendererTime();
    let expirationTime = workInProgress.expirationTime;
    //继续处理回调
    if (nextUnitOfWork && currentRendererTime > expirationTime) {
        console.log(nextUnitOfWork, 1)
        requestIdleCallback((deadline) => {
            performWork(deadline, nextUnitOfWork), {
                timeout: currentRendererTime - expirationTime
            }
        })
    }
    else {
        isRendering = false;
        commitAllWork(pendingCommit);
        commitLifeCycle(pendingCommit);
        isCommitting = false;
        isWorking = false;
        pendingCommit = null;
        //workInProgress = null;
    }

}

/**
 * 进入commit阶段
 */
function commitAllWork(topFiber) {
    isCommitting = true;
    console.log(topFiber, 9090)
    topFiber.effects.forEach(fiber => {
        if (fiber.tag === tag.ClassComponent) {
            return;
        }
        let domParent = fiber.return;
        while (domParent.tag === tag.ClassComponent) {//class类型组件
            domParent = domParent.return;
        }
        if (fiber.effectTag === Effect.PLACEMENT) {
            domParent.stateNode.appendChild(fiber.stateNode);
        }
        if (fiber.effectTag === Effect.DELETION) {
            try {
                domParent.stateNode.removeChild(fiber.stateNode);
            }
            catch (e) {

            }
        }
    })
}

function commitLifeCycle(topFiber) {
    topFiber.effects.forEach(fiber => {
        if (fiber.tag === tag.ClassComponent) {
            const instance = fiber.stateNode;
            const componentDidMount = instance.componentDidMount;

            if (fiber.alternate === null) {
                componentDidMount.call(instance);
            }
        }

    })
}

function workLoop(deadline) {
    if (deadline) {
        while (nextUnitOfWork && deadline.timeRemaining() > 0) {
            nextUnitOfWork = performUnitWork(nextUnitOfWork);
        }
    }
    else {
        while (nextUnitOfWork) {
            nextUnitOfWork = performUnitWork(nextUnitOfWork);
        }
    }
}


function performUnitWork(nextUnitOfWork) {
    const nextChild = beginWork(nextUnitOfWork);
    if (nextChild) return nextChild;
    const currentFiber = nextUnitOfWork;

    let topFiber = currentFiber;
    while (topFiber) {
        completeWork(topFiber);
        if (topFiber.sibling) {
            return topFiber.sibling
        }
        else {
            topFiber = topFiber.return;
        }
    }
    return null;

}

/**
 * 搜集节点变更到根节点
 * @param currentFiber
 */
function completeWork(currentFiber) {

    if (currentFiber.return) {
        const currentEffect = (currentFiber.effects) || [] //收集当前节点的 effect list
        const currentEffectTag = (currentFiber.effectTag) ? [currentFiber] : []
        const parentEffects = currentFiber.return.effects || [];
        currentFiber.return.effects = parentEffects.concat(currentEffect, currentEffectTag)
    } else {
        // 到达最顶端了
        pendingCommit = currentFiber
    }

}

function beginWork(currentFiber) {
    switch (currentFiber.tag) {
        case tag.ClassComponent: {//处理class类型组件
            const update = currentFiber.updateQueue.shift();
            console.log(update,222)
            if (update) {
                currentFiber.stateNode._partialState = update.payload;
            }
            currentFiber.stateNode.updater = classComponentUpdater;
            return updateClassComponent(currentFiber);
        }
        case tag.HostRoot: {
            const update = currentFiber.updateQueue.shift();
            if (update) {
                currentFiber.props.children = update.element;
            }
            return updateHostComponent(currentFiber);
        }
        default: {
            return updateHostComponent(currentFiber);
        }

    }
}

function createWorkInProgress(current) {
    let workInProgress = current.alternate;
    if (workInProgress === null) {
        workInProgress = new FiberNode(current.tag);
        workInProgress.alternate = current;
        workInProgress.stateNode = current.stateNode;
        workInProgress.props = current.props || {};
        workInProgress.expirationTime = current.expirationTime;
        current.alternate = workInProgress;
    } else {
        workInProgress.effects = [];
        workInProgress.child = current.child;
        workInProgress.props = current.props;
    }
    workInProgress.updateQueue = current.updateQueue;
    return workInProgress;
}

function requestCurrentTime() {

    if (isRendering) {
        // We're already rendering. Return the most recently read time.
        return currentSchedulerTime;
    }
    if (nextFlushedExpirationTime === NoWork || nextFlushedExpirationTime === Never) {
        // If there's no pending work, or if the pending work is offscreen, we can
        // read the current time without risk of tearing.
        recomputeCurrentRendererTime();
        currentSchedulerTime = currentRendererTime;
        return currentSchedulerTime;
    }
    // There's already pending work. We might be in the middle of a browser
    // event. If we were to read the current time, it could cause multiple updates
    // within the same event to receive different expiration times, leading to
    // tearing. Return the last read time. During the next idle callback, the
    // time will be updated.
    //和接下来要执行的任务返回相同的时间，避免一次时间里出现多次更新
    return currentSchedulerTime;
}

function recomputeCurrentRendererTime() {
    let currentTimeMs = Date.now() - originalStartTimeMs;
    currentRendererTime = msToExpirationTime(currentTimeMs);
}

function computeExpirationForFiber(currentTime) {
    let expirationTime;
    if (isWorking) {
        if (isCommitting) {//
            expirationTime = Sync;//同步任务优先级最高
        } else {
            expirationTime = nextRenderExpirationTime
        }
    } else {
        if (isBatchingInteractiveUpdates) {//优先级较高的任务如用户交互等
            expirationTime = computeInteractiveExpiration(currentTime);//计算出的值较大，优先级高
        } else {//普通异步任务
            expirationTime = computeAsyncExpiration(currentTime);//计算的值较小，优先级低
        }
    }
    return expirationTime
}


export {updateContainer}