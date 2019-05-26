export class SyntheticEvent {
    static eventPool = [];
    static getPooled = function (e) {
        const EventConstructor = this;
        if (EventConstructor.eventPool.length) {
            const instance = EventConstructor.eventPool.pop();
            EventConstructor.call(instance, e)
            return instance;
        }
        else {
            return new SyntheticEvent(e)
        }
    }

    constructor(nativeEvent) {
        this.nativeEvent = nativeEvent;
        this.isPropagationStopped = false;
        SyntheticEvent.eventPool.push(this);
    }

    stopPropagation() {
        const event = this.nativeEvent;
        if (!event) {
            return;
        }

        if (event.stopPropagation) {
            event.stopPropagation();
        } else if (typeof event.cancelBubble !== 'unknown') {
            // The ChangeEventPlugin registers a "propertychange" event for
            // IE. This event does not support bubbling or cancelling, and
            // any references to cancelBubble throw "Member not found".  A
            // typeof check of "unknown" circumvents this issue (and is also
            // IE specific).
            event.cancelBubble = true;
        }

        this.isPropagationStopped = true;
    }
}