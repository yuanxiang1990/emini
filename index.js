import ReactDom from "./src/react-dom";
import React from "./src/react";
import {Component} from "./src/react/ReactComponent";

class A extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'hehehe',
            eventTitle: 'hahaha',
            list: [8, 7, 4, 909090909090],
            isShowB: false,
            label: '222'
        }
    }

    clickHandler = (e) => {
        e.stopPropagation();
        this.setState({
            title: 'clickHandler' + Math.random(),
            label: Math.random(),
            isShowB: true
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

    getSnapshotBeforeUpdate(prevProps, prevState) {
        return prevState
    }


    static getDerivedStateFromError(error) {
        return {
            error: true,
            msg: error
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(snapshot, 'snapshot')
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

    componentDidMount() {
        console.log(document.getElementById('main').childNodes.length)
    }

    render() {
        if (this.state.error) {
            return <div className="test" id="test"><b style="color:red">出错了！！！{this.state.msg}</b></div>
        }
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
            {this.state.isShowB ? <B eventTitle={this.state.eventTitle} label={this.state.label}/> : ""}
            <div>
                {this.state.eventTitle}
            </div>
        </div>
    }
}

class B extends Component {
    constructor(props) {
        super(props)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        console.log(nextProps, 99999999999)
    }

    static getDerivedStateFromProps(props, state) {
        return {
            ...state,
            ...props
        }
    }

    componentDidMount() {
        console.log("B mounted!");
    }

    componentDidUpdate() {
        console.log("B updated!");
    }

    UNSAFE_componentWillMount() {
    }

    componentWillUnmount() {
        console.log('Component WILL UNMOUNT!');
    }

    clickHandler = (e) => {
        e.stopPropagation();
        this.setState({
            label: 'bbb' + Math.random()
        })
    }

    render() {
        componentWillUnmount.a.a

        return <div>
            from props:{this.props.eventTitle || ''}
            <div onClick={this.clickHandler}>{this.state.label}{"bbb"}</div>
        </div>
    }
}


ReactDom.render(
    <div>
        测试测试
        <A/>
    </div>
    , document.getElementById('main'));