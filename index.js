import ReactDom from "./src/react-dom";
import React from "./src/react";
import {Component} from "./src/react/ReactComponent";

class A extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 1,
            eventTitle: 'hahaha',
            list: [1, 3, 4, 909090909090],
            isShowB: false,
            label: '222'
        }
    }

    clickHandler = (e) => {
        e.stopPropagation();
        let i = this.state.title;
        this.setState({
            isShowB: true,
            list: [1, 2, 3, 4]
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
            msg: error.message
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
       /* let i = this.state.title;
        this.setState({
            title: i + 1
        })*/
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
            {<ul>
                {
                    this.state.list.map((item) => <li key={item}>{item}</li>)
                }
            </ul>}
            <div>
                {this.state.title}
            </div>
            <a href="javascript:void(0)" onClick={this.clickHandler}>点击</a>
            {this.state.isShowB ? <div>这是在class类型组件前插入节点</div> : ''}
            <B render={mouse => <b>{mouse + 1}</b>}/>
            {this.state.isShowB ? <B/> : ''}
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
            {this.props.render?this.props.render(1):''}
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