import {dispatch} from "./dispatch"

export function trapBubbledEvent(eventType, rootElement) {
    let event = eventType.slice(2).toLocaleLowerCase();
    addEventBubbleListener(rootElement, event, dispatch)
}

function addEventBubbleListener(element, eventType, listener,) {
    element.addEventListener(eventType, listener, false);
}