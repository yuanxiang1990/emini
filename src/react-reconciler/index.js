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
import {updateHostComponent} from "./differ";

let isRendering = false;
let currentSchedulerTime = maxSigned31BitInt - Date.now();
let nextFlushedExpirationTime = NoWork;
let currentRendererTime = msToExpirationTime(originalStartTimeMs);
// The time at which we're currently rendering work.
let nextRenderExpirationTime = NoWork;
let isWorking = false;
let isCommitting = false;
let isBatchingInteractiveUpdates = false;//是否高优先级更新，如用户交互等
const updateQueue = [];//更新队列
let workInProgress = null;//当前工作树
let nextUnitOfWork;//下一工作单元的任务
let root = null;//当前fiber tree
function updateContainer(children, containerFiberRoot) {
    root = containerFiberRoot;
    let currentTime = requestCurrentTime();
    let expirationTime = computeExpirationForFiber(currentTime);
    root.expirationTime = expirationTime;
    return updateContainerAtExpirationTime(root, children, expirationTime)
}

function updateContainerAtExpirationTime(currentFiber, element, expirationTime) {
    currentFiber.expirationTime = expirationTime;
    scheduleWork(currentFiber, element, expirationTime)
}


function scheduleWork(current, element, expirationTime) {
    updateQueue.push(element);
    requestWork(current, expirationTime);
}

function requestWork(current, expirationTime) {
    if (expirationTime === Sync) {
        performSyncWork(current);
    } else {
        performAsyncWork(current, expirationTime);
    }
}

function performSyncWork() {

}

function performAsyncWork(current, expirationTime) {
    recomputeCurrentRendererTime();
    const update = updateQueue.shift();
    requestIdleCallback((deadline) => {
        return performWork(deadline, current, update), {
            timeout: currentRendererTime - expirationTime
        }
    })
}

function performWork(deadline, current, update) {
    workInProgress = createWorkInProgress(current, update);
    nextUnitOfWork = workInProgress;
    workLoop(deadline);
    recomputeCurrentRendererTime();
    let expirationTime = workInProgress.expirationTime;
    //继续处理回调
    if (nextUnitOfWork && currentRendererTime > expirationTime) {
        requestIdleCallback((deadline) => {
            return performWork(deadline, current, update), {
                timeout: currentRendererTime - expirationTime
            }
        })
    }
}

function workLoop(deadline) {
    while (nextUnitOfWork && deadline.timeRemaining() > 0) {
        nextUnitOfWork = performUnitWork(nextUnitOfWork);
    }
    console.log(workInProgress,9090)
}

function performUnitWork(nextUnitOfWork) {
    return beginWork(nextUnitOfWork);
}

function beginWork(currentFiber) {
    console.log(currentFiber)
    switch (currentFiber.tag) {
       /* case tag.HostRoot://处理根节点
            break;*/
        default:
            return updateHostComponent(currentFiber);

    }
}

function createWorkInProgress(current, update) {
    if (workInProgress === null) {
        workInProgress = new FiberNode(current.tag);
        workInProgress.alternate = current;
        workInProgress.stateNode = current.stateNode;
        workInProgress.props = current.props || {};
        workInProgress.props.children = update;
        workInProgress.expirationTime = current.expirationTime;
        current.alternate = workInProgress;
    } else {
        workInProgress.effect = [];
    }
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