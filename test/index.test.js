import ReactDom from "../src/react-dom";
import React from "../src/react";
describe('ReactDOM', () => {
    beforeEach(() => {
    });
    it('should bubble onSubmit', function () {
        ReactDom.render(React.createElement('div',{}), document);
    })
});