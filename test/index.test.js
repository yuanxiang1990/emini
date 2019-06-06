import ReactDOM from "../src/react-dom";
import React from "../src/react";
import "./setupEnvironment";
import ReactTestUtils from "./ReactTestUtils";

describe('ReactDOM', () => {
    beforeEach(() => {

    });

    it('should allow children to be passed as an argument', () => {
        const argNode = ReactTestUtils.renderIntoDocument(
            React.createElement('div', null, 'child'),
        );
        setTimeout(function () {
            expect(argNode.innerHTML).toBe('child');
        },10)
    });

});