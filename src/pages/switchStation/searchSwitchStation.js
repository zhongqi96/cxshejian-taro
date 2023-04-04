import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import React, { Component } from 'react'
import './switchStation.scss'
import * as stationData from '@/utils/getAllStation'

export default class searchSwitchStation extends Component {

    constructor(){
      super(...arguments)
    }

    static defaultProps = {
      isSection: true, //分组筛选， 搜索时：不分组筛选
      Choice: (e) => {

      }
    }

    shouldComponentUpdate(nextProps, nextState){
      return false;
    }

    Choice = (e) => {
      this.props.Choice(e)
    }

    render(){
      var view_html = stationData.stationList.map((item,index) => {
        const ACL = item.list.map((x, index1) => {
          return <View class="cityName" key={"stationItemIndex_"+index1} onClick={this.Choice} data-name={x.stationName} data-id={x.id}>{x.stationName}</View>
        })
        return <View key={"stationSectionIndex_"+index}>
              {this.props.isSection && <View class="type" id={'inToView'+item.name}>{item.name}</View>}
              {ACL}
            </View>
      })
      return <View>
        {view_html}
      </View>
    }
  }
