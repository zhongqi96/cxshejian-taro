import Taro from '@tarojs/taro';
import React, { Component } from 'react'
import {View,Text,Image} from '@tarojs/components'
import './keyboard.scss'
// import { get as getGlobalData } from '../../service/config'

class Keyboard extends Component {

    constructor(args){
      super(args)
    }

    //按键
    tabkey = (e) => {

        e &&  e.stopPropagation()
        let tex = e.currentTarget.dataset.tab;
        let myEventDetail = {
          val: tex
        } // detail对象，提供给事件监听函数
        //this.$scope.triggerEvent('myevent', myEventDetail) //myevent自定义名称事件，父组件中使用
         this.props.onGetCode(myEventDetail);
      }

   stopClick = (e) =>{
      e.stopPropagation()
   }

   UNSAFE_componentWillMount() {
      Taro.getSystemInfo({
         success: function (res) {
             var name = 'iPhone X'
             var name1 = 'iPhone XS MAX'
             var name2 = 'iPhone XS'
             var name3 = 'iPhone XR'
             if (res.model.indexOf(name) > -1 || res.model.indexOf(name1) > -1 || res.model.indexOf(name2) > -1 || res.model.indexOf(name3) > -1) {
               this.isIpx = true
             }else{
               this.isIpx = false
             }
         }
     })
   }

  render() {

    return (
      <View className='keyboard ATkey0' id='ATkey0'>
         <View className={`m_keyBoard ${this.props.dataSet} ATkey0_1`} style={this.isIpx?"height:460rpx;":""} id='ATkey0_1' onClick={this.stopClick}>
            <View className="row">
               <View className="ripple" onClick={this.tabkey} data-tab="C">C</View>
               <View className="ripple" onClick={this.tabkey} data-tab="D">D</View>
               <View className="ripple" onClick={this.tabkey} data-tab="G">G</View>
               <View className="ripple" onClick={this.tabkey} data-tab="K">K</View>
            </View>
            <View className="row">
               <View className="ripple" onClick={this.tabkey} data-tab="T">T</View>
               <View className="ripple" onClick={this.tabkey} data-tab="Z">Z</View>
               <View className="ripple" onClick={this.tabkey} data-tab="Y">Y</View>
               <View className="ripple" onClick={this.tabkey} data-tab="L">L</View>
            </View>
            <View className="row rowgray">
               <View className="ripple" onClick={this.tabkey} data-tab="1">1</View>
               <View className="ripple" onClick={this.tabkey} data-tab="2">2</View>
               <View className="ripple" onClick={this.tabkey} data-tab="3">3</View>
               <View  className="ripple" onClick={this.tabkey} data-tab="0">0</View>
            </View>
            <View className="row rowgray">
               <View  className="ripple" onClick={this.tabkey} data-tab="4">4</View>
               <View  className="ripple" onClick={this.tabkey} data-tab="5">5</View>
               <View  className="ripple" onClick={this.tabkey} data-tab="6">6</View>
               <View id='ATkey1' className="del ripple" onClick={this.tabkey} data-tab="del"><Image src={'https://www.cx9z.com/h5/tarocx9z/compo/keyborad/jp_shanchu.png'}></Image></View>
            </View>
            <View className="row rowgray">
               <View className="noBb ripple" onClick={this.tabkey} data-tab="7">7</View>
               <View className="noBb ripple" onClick={this.tabkey} data-tab="8">8</View>
               <View className="noBb ripple" onClick={this.tabkey} data-tab="9">9</View>
               <View id='ATkey2' className="close ripple" onClick={this.tabkey} data-tab="close"><Image src={'https://www.cx9z.com/h5/tarocx9z/compo/keyborad/jp_shouqi.png'}></Image></View>
            </View>
        </View>
      </View>
    )
  }
}

export default Keyboard;
