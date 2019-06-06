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
        }, 0)
    });
    it('allows a DOM element to be used with a string', () => {
        const element = React.createElement('div', {className: 'foo'});
        const node = ReactTestUtils.renderIntoDocument(element);
        expect(node.tagName).toBe('DIV');
    });

    /**
     * We need to make sure that updates occur to the actual node that's in the
     * DOM, instead of a stale cache.
     */
    it('should purge the DOM cache when removing nodes', () => {
        let myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="dog"/>
                ,
                <div key="theBird" className="bird"/>
            </div>,
        );
        // Warm the cache with theDog
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="dogbeforedelete"/>
                ,
                <div key="theBird" className="bird"/>
                ,
            </div>,
        );
        // Remove theDog - this should purge the cache
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theBird" className="bird"/>
                ,
            </div>,
        );
        // Now, put theDog back. It's now a different DOM node.
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="dog"/>
                ,
                <div key="theBird" className="bird"/>
                ,
            </div>,
        );
        // Change the className of theDog. It will use the same element
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="bigdog"/>
                ,
                <div key="theBird" className="bird"/>
                ,
            </div>,
        );
        setTimeout(function () {
            const dog = myDiv.childNodes[0];
            expect(dog.className).toBe('bigdog');
        }, 0)

    });
});