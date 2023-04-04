import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import {View,Text, Button,Image} from '@tarojs/components'
import './noPage.scss'
import PropTypes from 'prop-types';

 class noPage extends Component {
    static defaultProps = {
      noPageText: '请求超时',
      onInitData: function(e){
      }
    }

    constructor(args){
      super(args)
      this.state = {
      }
  }

  componentDidShow(){
  }

  componentDidMount(){
    // var that  = this
    // this.updateUserInfo_block(null)
  }

  componentWillReceiveProps () {
  }

  componentDidHide(){
  }
    

  render(){
      const {noPageText,onInitData} = this.props
    
      return (
        <View className='noPage'>
          <View className='noPage_c'>
              <Image className='img' src={'https://www.cx9z.com/h5/tarocx9z/czt_v1/other/no.png'}></Image>
              <Text>{noPageText}</Text>
              <Button className="btn btn-radius" onClick={onInitData}>重新加载</Button>
          </View>
        </View>
      )
  }
}

noPage.propTypes = {
  noPageText: PropTypes.string,
  onInitData: PropTypes.func
};

export default noPage
