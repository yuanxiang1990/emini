export class Component {
    constructor(props) {
        this.props = props
        this.updater = {};
    }

    setState(partialState) {
        this.updater.enqueueSetState(this, partialState)
    }
}

Component.prototype.isReactComponent = true;