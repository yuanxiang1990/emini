import ReactDom from "./src/react-dom";
import React from "./src/react";
import {Component} from "./src/react/ReactComponent";

class A extends Component {
    constructor() {
        super();
        this.state = {
            title: '呵呵',
            list: []
        }
        setTimeout(() => {
            this.setState({
                title: '哈哈',
                list: [1, 2, 3, 4, 5]
            })
        }, 1000)
    }

    render() {
        return <div>
           <ul>
               {
                   this.state.list.map((item)=><li>{item}</li>)
               }
           </ul>
            {this.state.title}
            </div>
    }
}

class B extends Component {
    constructor() {
        super();
    }

    render() {
        return <A/>
    }
}


ReactDom.render(<div>
    <A/>
</div>, document.getElementById('main'));