import ReactDom from "./src/react-dom";
import React from "./src/react";
import {Component} from "./src/react/ReactComponent";

class A extends Component {
    constructor() {
        super();
        this.state = {
            title: 'hehehe',
            eventTitle: 'hahaha',
            list: [8, 7, 4, 909090909090]
        }
    }

    clickHandler = (e) => {
        e.stopPropagation();
        this.setState({
            eventTitle: 'clickHandler'+Math.random()
        })
    }

    componentDidMount() {
        setInterval(() => {
            this.setState({
                title: Math.random(),
                list: [1, 2, 3, 4, Math.random()]
            })
        }, 0)

    }

    render() {
        return <div>
            {<ul>
                {
                    this.state.list.map((item) => <li>{item}</li>)
                }
            </ul>}
            <div>
                {this.state.title}
            </div>
            <a href="javascript:void(0)" onClick={this.clickHandler}>点击</a>
            <div>
                {this.state.eventTitle}
            </div>
        </div>
    }
}


ReactDom.render(
    <div>
        <A/>
    </div>
    , document.getElementById('main'));