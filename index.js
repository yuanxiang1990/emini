import ReactDom from "./src/react-dom";
import React from "./src/react";
import {Component} from "./src/react/ReactComponent";

class A extends Component {
    constructor() {
        super();
        this.state = {
            title: 'hehehe',
            list: [8, 7, 4, 909090909090]
        }
    }

    componentDidMount() {
        this.setState({
            title: '哈哈',
            list: [1, 2, 3, 4, 5]
        })

    }

    render() {
        return <div>
            {<ul>
                {
                    this.state.list.map((item) => <li>{item}</li>)
                }
            </ul>}
            {this.state.title}
        </div>
    }
}


ReactDom.render(
    <div>
        <A/>
        <A/>
    </div>
    , document.getElementById('main'));