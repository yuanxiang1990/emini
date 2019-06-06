import ReactDOM from "../src/react-dom";

export default {
    renderIntoDocument: function (element) {
        var div = document.createElement('div');
        return ReactDOM.render(element, div);
    }
}