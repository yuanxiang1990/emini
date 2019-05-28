import ReactDom from "./src/react-dom";
import React from "./src/react";
import {Component} from "./src/react/ReactComponent";

class A extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'hehehe',
            eventTitle: 'hahaha',
            list: [8, 7, 4, 909090909090]
        }
    }

    clickHandler = (e) => {
        e.stopPropagation();
        this.setState({
            eventTitle: 'clickHandler' + Math.random()
        })
    }

    UNSAFE_componentWillMount() {
        /*    setInterval(() => {
                this.setState({
                    title: Math.random(),
                    list: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]
                })
            }, 9999)*/

    }

    componentDidUpdate(prevProps, prevState) {
        /* this.setState({
             title: 111
         })*/
        // console.log(prevProps, prevState)
        /* this.setState({
             title: 111
         })此处setState会循环调用componentDidUpdate方法，导致一直往root队列里面添加新的root导致死循环
         */
    }

    UNSAFE_componentWillUpdate(prevProps, prevState) {
        /*this.setState({
            title: 111
        })*///此处setState会循环调用componentWillUpdate方法，导致一直往root队列里面添加新的root导致死循环
    }

    shouldComponentUpdate(newProps, newState) {
        return true;
    }

    componentWillUnmount() {
        console.log('Component WILL UNMOUNT!')
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
            <B eventTitle={this.state.eventTitle}/>
        </div>
    }
}

class B extends Component {
    constructor(props) {
        super(props)
        this.state = {
            label: 'aaa'
        }
    }

    clickHandler = (e) => {
        e.stopPropagation();
        this.setState({
            label: 'bbb' + Math.random()
        })
    }

    render() {
        console.log(this.props)
        return <div>
            from props:{this.props.eventTitle||''}
            <div onClick={this.clickHandler}>{this.state.label}</div>
        </div>
    }
}


ReactDom.render(
    <div>
        <A/>
    </div>
    , document.getElementById('main'));