import ReactDom from "./src/react-dom";
import React from "./src/react";
import {Component} from "./src/react/ReactComponent";

const D = (props) => {
    return <div>DDD</div>
}

class A extends Component {
    constructor(props) {
        super(props);
        const list = [];

        this.state = {
            title: 1,
            eventTitle: 'hahaha',
            list: list,
            isShowB: false,
            label: '222'
        }
    }

    clickHandler = (e) => {
        this.setState({
            list: [1, 2, 3],
            title: '1212'
        })

    }

    UNSAFE_componentWillMount() {
        this.setState({
            eventTitle: '2121',
            list: [1, 2, 3, 4, 5]
        })
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        return prevState
    }


    static getDerivedStateFromError(error) {
        return {
            error: true,
            msg: error.message
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log(snapshot, 'snapshot')
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
        console.log('Component WILL UNMOUNT!');
    }

    componentDidMount() {
        this.setState({
            list: [90909090]
        })

    }

    componentDidCatch(e) {
        alert("出错了" + e);
    }

    render() {
        if (this.state.error) {
            return <div className="test" id="test"><b style="color:red">出错了！！！{this.state.msg}</b></div>
        }
        return <div>
            {this.state.eventTitle}<br/>
            <a href="javascript:void(0)" onClick={this.clickHandler}>点击</a>
            <div>
                {
                    this.state.list.map((item, i) => <input key={item} value={item}/>)
                }
            </div>
        </div>
    }
}

class C extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {value} = this.props;
        return <input value={value}/>
    }
}

class B extends Component {
    constructor(props) {
        super(props);
        this.state = {
            label: 1111
        }
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
        return <div>
            {this.props.render ? this.props.render(1) : ''}
            <div onClick={this.clickHandler}>{this.state.label}{"bbb"}</div>
        </div>
    }
}

ReactDom.render(
    <A/>
    , document.getElementById('main'));

