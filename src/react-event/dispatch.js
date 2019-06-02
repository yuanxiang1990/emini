import {tag} from "../react-reconciler/FiberNode"
import {SyntheticEvent} from "../events/SyntheticEvent";
import {performSyncWork, setBatchingInteractiveUpdates} from "../react-reconciler";
import {setBatchingUpdates} from "../react-reconciler/index";

export function dispatch(e) {
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
        if (handler) {
            setBatchingInteractiveUpdates(true);
            setBatchingUpdates(true);
            try {
                handler.call(null, syntheticEvent);
            }
            catch (e) {
                console.log(e);
            }
            finally {
                setBatchingInteractiveUpdates(false);
                setBatchingInteractiveUpdates(false);
                performSyncWork();
                if (syntheticEvent.isPropagationStopped) {
                    break;
                }
            }
        }
    }

}