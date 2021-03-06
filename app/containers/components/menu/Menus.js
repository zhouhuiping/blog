import React, {Component} from 'react'
import {Menu} from 'antd'
import style from './style.css'

export default class Menus extends Component {
    constructor (props) {
        super(props)
        this.state = {
            current: this.props.categories[0]
        }
    }

    handleClick = (e) => {
        if (e.key === '首页') {
            this.props.getArticleList('')
        } else {
            console.log('e.key: ', e.key)
            this.props.getArticleList(e.key)
        }
        let toPath = e.key === '首页' ? '/' : '/' + e.key
        this.setState({
            current: e.key
        })
        console.log('toPath: ', toPath)
        this.props.history.push(toPath)
    }

    render () {
        return (
            <Menu
                onClick={this.handleClick}
                selectedKeys={[this.state.current]}
                mode="horizontal"
                className={`${style.MenuContainer}`}
            >
                {
                    this.props.categories.map((item, index) => {
                        return (
                            <Menu.Item key={item}>
                                {item}
                            </Menu.Item>
                        )
                    })
                }
            </Menu>
        )
    }

    componentDidMount () {
        this.setState({
            current: this.props.history.location.pathname.replace('\/', '') || '首页'
        })
    }
}
