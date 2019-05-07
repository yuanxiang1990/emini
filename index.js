import ReactDom from "./src/react-dom";
import React from "./src/react";
import {Component} from "./src/react/ReactComponent";

class Test extends Component {
    constructor() {
        super();
    }

    render() {
        return <p>
            <span>ttt</span><br/><span>sss</span><br/>aaa
        </p>
    }
}

ReactDom.render(<div>
    <Test/>
    <div>
        <ul>
            <li>
                <span>909999</span>
            </li>
            <li>
                <span>12121</span>
            </li>
            <li>
                <span>333</span>
            </li>
        </ul>
    </div>
    <div>
        <span>121</span>
    </div>
</div>, document.getElementById('main'));