import {tag} from "../react-reconciler/FiberNode"
import {SyntheticEvent} from "../events/SyntheticEvent";
import {setBatchingInteractiveUpdates} from "../react-reconciler";

export function dispatch(e) {
    console.log(e)
    const nativeEventTarget = e.target || e.srcElement;
    const ancestors = [];
    let fiber = nativeEventTarget.__reactInternalInstance;
    while (fiber) {
        if (fiber.tag !== tag.ClassComponent) {
            ancestors.push(fiber);
            fiber = fiber.return;
        }
        else {
            fiber = fiber.return;
        }
    }
    for (let i = 0; i < ancestors.length; i++) {
        const ancestor = ancestors[i];
        const type = e.type;
        const eventName = 'on' + type[0].toLocaleUpperCase() + type.slice(1)
        const syntheticEvent = SyntheticEvent.getPooled(e);
        const handler = ancestor.props[eventName];
        console.log(syntheticEvent)
        if (handler) {
            setBatchingInteractiveUpdates(true);
            handler.call(null, syntheticEvent);
            setBatchingInteractiveUpdates(false);
            if (syntheticEvent.isPropagationStopped) {
                break;
            }
        }
    }

}