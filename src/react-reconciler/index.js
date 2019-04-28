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

let isRendering = false;
let currentSchedulerTime = maxSigned31BitInt - Date.now();
let nextFlushedExpirationTime = NoWork;
let currentRendererTime = msToExpirationTime(originalStartTimeMs);
// The time at which we're currently rendering work.
let nextRenderExpirationTime = NoWork;
let isWorking = false;
let isCommitting = false;
let isBatchingInteractiveUpdates = false;
const updateQueue = [];//更新队列
function updateContainer(children, containerFiberRoot) {
    let current = containerFiberRoot.current;
    let currentTime = requestCurrentTime();
    let expirationTime = computeExpirationForFiber(currentTime);
    return updateContainerAtExpirationTime(current, children, expirationTime)
}

function updateContainerAtExpirationTime(currentFiber, element, expirationTime) {
    scheduleWork(currentFiber, element, expirationTime)
}


function scheduleWork(current, element, expirationTime) {
    updateQueue.push({current});
    requestWork(element, expirationTime);
}

function requestWork(element, expirationTime) {
    if (expirationTime === Sync) {
        performSyncWork(element);
    }
    else {
        performAsyncWork(element, expirationTime);
    }
}

function performSyncWork() {

}

function performAsyncWork() {
    const workInProgress = createWorkInProgress(updateQueue);
    requestIdleCallback(performWork)

}

function performWork(deadline) {
    console.log(deadline)
}

function workLoop(deadline) {

}

function performUnitWork() {

}

function createWorkInProgress(updateQueue) {
    const update = updateQueue.shift();
    return {
        stateNode: update.current.stateNode,
        alternate: update.current
    }
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
    var currentTimeMs = Date.now() - originalStartTimeMs;
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