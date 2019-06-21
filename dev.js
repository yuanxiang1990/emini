import ReactDom from "./src/react-dom";
import React from "./src/react";
import {Component} from "./src/react/ReactComponent";

class A extends Component {
    constructor(props) {
        super(props);
        const list = [1];

        this.state = {
            title: 1,
            eventTitle: 'hahaha',
            list: list,
            isShowB: false,
            label: '222'
        }
    }

    clickHandler = (e) => {
        e.stopPropagation();
        let i = this.state.title;

        this.setState({
            isShowB: !this.state.isShowB,
        })
    }

    UNSAFE_componentWillMount() {


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
        console.log(snapshot, 'snapshot')
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
        setTimeout(()=>{
            const list = [];
            for (let i = 0; i < 11111; i++) {
                list.push(String(i));
            }
            this.setState({
                list: list
            })
        },10)

    }

    componentDidCatch(e) {
        alert("出错了" + e);
    }

    render() {
        if (this.state.error) {
            return <div className="test" id="test"><b style="color:red">出错了！！！{this.state.msg}</b></div>
        }
        return <div>
            <input type="text" value={1}/>
            <a href="javascript:void(0)" onClick={this.clickHandler}>点击</a>
            {this.state.isShowB ? <B/> : ''}
            {<ul>
                {
                    this.state.list.map((item) => <li key={item}>{item}</li>)
                }
            </ul>}

            <div>
                {this.state.title}
            </div>

            <div>
                {this.state.eventTitle}
            </div>
        </div>
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
    <div>
        测试测试
        <A/>
    </div>
    , document.getElementById('main'));