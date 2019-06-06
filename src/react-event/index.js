import {capturePhaseRegistrationNames, bubblePhaseRegistrationNames} from "../events"
import {tag} from "../react-reconciler/FiberNode";
import {trapBubbledEvent} from "./register";

const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;

export function finalizeInitialFiber(fiber, rootInstance) {
    if (fiber.tag === tag.HostComponent) {
        const props = fiber.props;
        for (let propKey in props) {
            if (bubblePhaseRegistrationNames.includes(propKey)) {
                const rootElement = rootInstance.stateNode;
                let isDocumentOrFragment = (rootElement.nodeType === DOCUMENT_NODE || rootElement.nodeType === DOCUMENT_FRAGMENT_NODE);
                trapBubbledEvent(propKey, isDocumentOrFragment ? rootElement : rootElement.ownerDocument);
            }
            else if (propKey !== 'children') {
                let attrName = propKey;
                if (propKey === 'className') {
                    attrName = 'class'
                }
                fiber.stateNode.setAttribute(attrName, props[propKey]);
            }
        }
    }
}

