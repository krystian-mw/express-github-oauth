// babel-polyfill is not included in parceljs
import 'babel-polyfill'

import React, { Component } from 'react'
import { render } from 'react-dom'
import axios from 'axios'

class App extends Component {
    state = { user: null }

    async componentDidMount() {
        const { data } = await axios.get('/user/profile')
        this.setState({
            user: JSON.stringify(data)
        })
    }

    render() {
        return <p>This is what our session knows about you: {this.state.user}</p>
    }
}

render(<App />, document.getElementById('root'))