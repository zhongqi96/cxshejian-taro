import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
// import { connect } from 'react-redux'
import { WebView } from '@tarojs/components'

import './index.scss'

type PageStateProps = {

}

type PageDispatchProps = {

}

type PageOwnProps = {}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface AdPage {
  props: IProps;
}

class AdPage extends Component {
  state = {
    url: ''
  }

  UNSAFE_componentWillMount () {
    let router = getCurrentInstance().router
    let url = router.params.url
    if (url) {
      this.setState({
        url
      })
    } else {
      Taro.navigateBack({
        delta: 1
      })
    }


  }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <WebView src={this.state.url} />
    )
  }
}

export default AdPage

