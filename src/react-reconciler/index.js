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
import {tag, FiberNode, getRootFiber} from "./FiberNode";
import {updateHostComponent, updateClassComponent, Effect} from "./differ";
import {isEmptyObject} from "../utils/index";
import {finalizeInitialFiber} from "../react-event"
import {commitAllWork} from "./commitWork";

let isRendering = false;//是否正在渲染包括reconcile阶段和commit阶段
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
let nextFlushedRoot = null;
const rootQueue = [];
/**
 * class类型组件相关方法
 * @type {{enqueueSetState: classComponentUpdater.enqueueSetState}}
 */
const classComponentUpdater = {
    enqueueSetState: function (inst, payload) {
        const fiber = inst._reactInternalFiber;
        const currentTime = requestCurrentTime();
        const expirationTime = computeExpirationForFiber(currentTime);
        if (expirationTime > nextRenderExpirationTime) {//更高优先级任务到来时终止当前任务
            nextUnitOfWork = null;
            nextRenderExpirationTime = NoWork;
        }
        fiber.updateQueue.push({
            payload
        })
        const root = getRootFiber(fiber);
        root.expirationTime = expirationTime;
        scheduleWork(root, expirationTime);
    }
}


export function updateContainer(children, containerFiberRoot) {
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


function scheduleWork(root, expirationTime) {
    requestWork(root, expirationTime);
}

function requestWork(root, expirationTime) {
    addRootToSchedule(root, expirationTime);
    if (isRendering) {
        //当前正在渲染时先不执行，最后一次再一起执行
        return
    }
    if (expirationTime === Sync) {
        performSyncWork(root);
    } else {
        performAsyncWork(root, expirationTime);
    }
}

function addRootToSchedule(root, expirationTime) {
    let isAdd = false;
    for (let i = 0, len = rootQueue.length; i < len; i++) {
        if (rootQueue[i] === root) {
            if (expirationTime > rootQueue[i].expirationTime) {
                rootQueue[i].expirationTime = expirationTime;
            }
            isAdd = true;
            break
        }
    }
    if (!isAdd) {
        rootQueue.push(root);
    }
}


function findHighestPriorityRoot() {
    let highestPriorityWork = NoWork;
    let highestPriorityRoot = null;
    for (let i = 0, len = rootQueue.length; i < len; i++) {
        if (rootQueue[i].expirationTime !== NoWork) {
            if (rootQueue[i].expirationTime > highestPriorityWork) {
                highestPriorityRoot = rootQueue[i];
                highestPriorityWork = highestPriorityRoot.expirationTime;
            }
            if (highestPriorityWork === Sync) {
                break
            }

        }
    }
    nextFlushedRoot = highestPriorityRoot;
    nextFlushedExpirationTime = highestPriorityWork;
}

function performSyncWork(root) {
    performWork(null, root)
}

function performAsyncWork(root, expirationTime) {
    recomputeCurrentRendererTime();
    requestIdleCallback((deadline) => {
        return performWork(deadline, root)
    })
}

function performWork(deadline, root) {
    findHighestPriorityRoot();
    while (nextFlushedRoot !== null && nextFlushedExpirationTime !== NoWork) {
        performWorkOnRoot(deadline, nextFlushedRoot);
        findHighestPriorityRoot();
    }
}

function performWorkOnRoot(deadline, root) {
    isWorking = true;
    isRendering = true;
    if (nextUnitOfWork == null) {
        workInProgress = createWorkInProgress(root);
        nextUnitOfWork = workInProgress;
        nextRenderExpirationTime = workInProgress.expirationTime;
    }

    workLoop(deadline);
    recomputeCurrentRendererTime();
    let expirationTime = workInProgress.expirationTime;
    //继续处理回调
    if (nextUnitOfWork && currentRendererTime > expirationTime) {
        requestIdleCallback((deadline) => {
            performWorkOnRoot(deadline, nextUnitOfWork)
        })
    }
    else {
        isCommitting = true;
        commitAllWork(pendingCommit);
        isCommitting = false;
        isRendering = false;
        isWorking = false;
        pendingCommit = null;
        nextRenderExpirationTime = NoWork;
        root.expirationTime = NoWork;
        rootQueue.splice(rootQueue.indexOf(root), 1);
        //workInProgress = null;
    }
}


function workLoop(deadline) {
    if (deadline) {
        while (nextUnitOfWork && !deadline.didTimeout) {
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
    const currentFiber = nextUnitOfWork;
    const nextChild = beginWork(currentFiber);
    finalizeInitialFiber(currentFiber, getRootFiber(currentFiber))
    if (nextChild) return nextChild;
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
 * @param workInProgress
 */
function completeWork(workInProgress) {
    if (workInProgress.return) {
        const currentEffect = (workInProgress.effects) || [] //收集当前节点的 effect list
        const currentEffectTag = (workInProgress.effectTag) ? [workInProgress] : []
        const parentEffects = workInProgress.return.effects || [];
        workInProgress.return.effects = parentEffects.concat(currentEffect, currentEffectTag)
    } else {
        // 到达最顶端了
        pendingCommit = workInProgress
    }

}

function beginWork(workInProgress) {
    workInProgress.effects.length = 0;
    switch (workInProgress.tag) {
        case tag.ClassComponent: {//处理class类型组件
            let update = {};
            workInProgress.updateQueue.forEach(item => {
                update = Object.assign(update, item.payload);
            })
            if (!isEmptyObject(update)) {
                workInProgress.stateNode._partialState = update;
                workInProgress.effectTag = Effect.UPDATE;
            }
            workInProgress.stateNode.updater = classComponentUpdater;
            return updateClassComponent(workInProgress);
        }
        case tag.HostRoot: {
            const update = workInProgress.updateQueue.shift();
            if (update) {
                workInProgress.props.children = update.element;
            }
            return updateHostComponent(workInProgress);
        }
        default: {
            return updateHostComponent(workInProgress);
        }
    }
}

export function createWorkInProgress(current) {
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
    workInProgress.expirationTime = current.expirationTime;
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

export function setBatchingInteractiveUpdates(val) {
    isBatchingInteractiveUpdates = val;
}