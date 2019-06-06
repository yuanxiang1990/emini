# 一个仿react的迷你库

## 主要实现react fiber架构。

1. setSatate支持(ok)。
2. class类型组件支持(ok)。
3. 组件生命周期支持(ok)。
4. fiber任务调度机制(ok)。
5. react事件支持(初步实现)。

## 为什么需要fiber架构
react的大体流程主要分为render阶段和commit阶段。render阶段主要differ出虚拟dom的变更，即收集各节点的effect。commit阶段主要将各节点的effcet应用到真实dom上。在react16之前，render阶段采用递归的方式实现，当dom节点较为复杂时，render的执行时间会非常长。由于js代码执行和浏览器dom操作都是执行在主线程上，render阶段可能会持续占用主线程，造成用户的很多操作的得不到马上响应，十分影响用户体验。所以react16提出了fiber架构来解决这个问题。
## fiber核心问题分析
### 对哪个阶段进行拆分
fiber架构主要对render阶段进行拆分，commit阶段不需要拆分，一方面commit阶段不会需要非常久的执行时间，再加上对commit阶段进行拆分会导致dom操作执行一不分被终止，对用户体验的影响非常大。
### 如何拆分
首先需要改变以前的递归的differ方式，如果继续采用递归这种形式的话，是没法进行拆分的。react主要是讲之前的递归改成了循环的形式，因此，react引入了一种新的数据结构fiber。fiber的数据结构如下：

```
export class FiberNode {
    constructor(tag, type, pendingProps, key) {
        // Instance
        this.tag = tag;//节点类型
        this.key = key;
        this.stateNode = null;//对应真实dom或者class类型组件实例
        this.type = type;//对应的是以前reaat element的type属性

        // Fiber
        this.return = null;//父节点
        this.child = null;//子节点
        this.sibling = null;//兄弟节点
        this.index = 0;

        this.props = pendingProps;
        this.memoizedState = null;

        // Effects
        // this.effectTag = NoEffect;
        this.effects = [];//子节点变更
        this.effectTag = null;//当前节点变更
        this.expirationTime = NoWork;//节点到期时间，根据这个属性判断任务优先级

        this.alternate = null;//对应变更下的fiber节点

        this.updateQueue = [];//更新队列

    }
}
```
**注意：改fiber结构做了很多简化，删除了一些不需要的属性。**
这个alternate属性需要特别说一下，任务开始时会创建一颗workInProgress Tree。该对象是从alternate属性上创建的，workInProgress对象的alternate属性又指向当前的tree，当前的tree的alertnate对象又指向workInProgress。（**貌似非常绕**）后续的操作都是针对workInProgress操作，完成之后workInProgress就变成了新的fiber tree。下次执行时不会继创建workInProgress对象，而是把原对象的alternate属性赋值给workInProgress作为新的对象，此时的workInProgress的alternate就变成了原fibertree，然后把当前的child再赋值给新的workInprogre对象。后续的differ都是对当前对象的child和alternate对象的chidl做对比，如果相同则把alternate对象的child拷贝到新创建的fiber child的alertnate属性下。

上面说了一大推估计基本都看晕了。总结一下就是当前tree和alternate是相互引用关系，新的任务到来时，当前对象需要挂载到alternate下，则只需把新的workInProgress指向当前对象的alternate即可。而新的child都需要从最新的element下创建。**这种相互持有引用的技术，react称之为双缓冲技术。**

代码如下：
```
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
```


下面我们来看以下html结构

```
<div id="A">
    <div id="B">
        <div id="D">aaa</div>
        <div id="E">bbb</div>
    </div>
    <div id="C">
        <div id="F">ccc</div>
        <div id="G">ddd</div>
    </div>
<div>
```

这些真实dom会转化成虚拟dom。react16之前的节点是按层级遍历对比的，先对比A节点，再对比B、C节点，在分别对比F、G和D、E将节点。react16之后会先遍历左子树，知道没有子节点后再回溯遍历对比父节点的兄弟节点的子树，最后一次遍历玩整棵树。**在fiber架构中，遍历顺序会是A->B->C->D->E->aaa文本节点->bbb文本节点->F->G->ccc文本节点->ddd文本节点**。
该结构是一个链表结构，可随时中断，之后再恢复。
### 如何给任务执行分片
任务执行分片主要是采用浏览器的requestIdleCallback这个api。requestIdleCallback可以在浏览器一帧的空闲时间执行。requestIdleCallback具体可参考[http://www.zhangyunling.com/702.html/](http://www.zhangyunling.com/702.html/)

### 如何划分任务优先级
在react中每个任务都会对应一次root，每个root会对应一个到期时间。在react中时间是反过来的，先出初始化一个非常大的时间然后依次减少。时间越大，任务优先级越高。（注意：在原生react中当当前时间减去expirationTime差值为0时会自动获得高优先级执行该任务，防止低优先级任务一直被插队）计算到期时间的方法如下

```
function computeExpirationForFiber(currentTime) {
    let expirationTime;
    if (isWorking) {
        if (isCommitting) {//commit阶段不能被打断
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
```
## fiber实现细节

### React.render和setState执行入口api实现
React.render主要在初始化的时候执行，setState则是触发虚拟dom的更新。
react.render核心代码如下
```
const ReactDom = {
    render(element, container, callback) {
        const root = createHostRootFiber();
        root.stateNode = container;
        root.alternate = null;
        updateContainer(element, root);
    }
};
```
该方法主要是创建root节点后执行updateContainer方法。

```
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
```
updateContainer方法主要是计算expirationTime并将react element放入更新队列中，最后执行scheduleWork开始进入render阶段。

setState方法主要是调用内部的enqueueSetState方法。

```
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
```
该方法和updateContainer方法类似，同样是拿到执行的root节点后计算expirationTime最后执行scheduleWork方法。**注意，当前任务的优先级大于正在执行任务的优先级时，会中断当前任务，执行高优先级任务。**

### 任务调度方法scheduleWork和requestWork

```
function scheduleWork(root, expirationTime) {
    addRootToSchedule(root, expirationTime);

    if (isBatchingUpdates) {
        return;
    }

    requestWork(root, expirationTime);
}

function requestWork(root, expirationTime) {
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
```
scheduleWork方法首先会把root节点放入队列，其次需注意isBatchingUpdates和isRendering这两个参数。isBatchingUpdates参数主要是在事件回调方法执行之前会设置为true，主要是处理事件回调里面包含多个setState方法的情况，会把多个setState合成更新。isRendering参数代表当前正在渲染时先不执行，最后一次再一起执行。

### performSyncWork和performAsyncWork方法

```
export function performSyncWork() {
    performWork(null)
}

function performAsyncWork(root, expirationTime) {
    recomputeCurrentRendererTime();
    requestIdleCallback((deadline) => {
        return performWork(deadline)
    })
}
```
两者都会执行performWork方法，异步方法会调用requestIdleCallback执行并传入deadline参数

### root任务调度大循环

```
function performWork(deadline, root) {
    findHighestPriorityRoot();
    while (nextFlushedRoot !== null && nextFlushedExpirationTime !== NoWork) {
        performWorkOnRoot(deadline, nextFlushedRoot);
        findHighestPriorityRoot();
    }
}
```
每次循环都会调用findHighestPriorityRoot方法会找出优先级最高的root出来执行。

### performWorkOnRoot方法


```

function performWorkOnRoot(deadline, root) {
    isWorking = true;
    isRendering = true;
    if (nextUnitOfWork == null) {
        workInProgress = createWorkInProgress(root);
        nextUnitOfWork = workInProgress;
        nextRenderExpirationTime = workInProgress.expirationTime;
    }
    try {
        workLoop(deadline);
    }
    catch (e) {
        nextUnitOfWork = throwException(nextUnitOfWork, e);
        console.error(e);
    }
    recomputeCurrentRendererTime();
    let expirationTime = workInProgress.expirationTime;
    //继续处理回调
    if (nextUnitOfWork) {
        if (currentRendererTime > expirationTime && deadline.didTimeout) {//帧超时退出
            requestIdleCallback((deadline) => {
                performWorkOnRoot(deadline, nextUnitOfWork);
            })
        }
        else {//错误异常退出等。。。
            performWorkOnRoot(deadline, nextUnitOfWork);
        }
    }
    /**
     * 任务已处理完，直接进入commit阶段
     */
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
```
该方法首先会调用createWorkInProgress方法构建一颗workInProgress树，workLoop方法则是循环处理每一个fiber节点。workLoop方法执行之后，如果fiber节点已经处理完，则会进入commit阶段。最后workInProgress树会变成当前树。

### fiber节点处理循环

```
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
function beginWork(workInProgress) {
    workInProgress.effects.length = 0;
    switch (workInProgress.tag) {
        case tag.ClassComponent: {//处理class类型组件
            let update = {};
            workInProgress.updateQueue.forEach(item => {
                update = Object.assign(update, item.payload);
            })
            console.log(update, 'up')
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
```
workLoop会分同步和异步两种方式调用performUnitWork方法。performUnitWork方法则是单个节点的处理过程。beginWork方法相当于是节点分分类，根据节点的类型调用不同的方法differ节点。处理完之后completeWork依次收集节点变更到root节点。到此render阶段的任务执行完成。

### commit阶段

```
/**
 * 进入commit阶段
 */
export function commitAllWork(topFiber) {
    console.log(topFiber.effects.slice(0))
    commitPreLifeCycle(topFiber);
    topFiber.effects.forEach(fiber => {
        let domParent = fiber.return;
        while (domParent.tag === tag.ClassComponent) {//class类型组件
            domParent = domParent.return;
        }
        if (fiber.effectTag === Effect.PLACEMENT) {
            commitPlacement(fiber, domParent);
        }
        if (fiber.effectTag === Effect.DELETION) {
            commitDeletion(fiber, domParent);
        }
        fiber.effectTag = null;
    })
    commitAfterLifeCycle(topFiber)
    topFiber.effects = [];
}
```
commit阶段比较简单，主要就是将收集到的变更应用到真实dom当中。
