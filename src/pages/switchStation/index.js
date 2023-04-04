import Taro, { getCurrentInstance } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, ScrollView, Image, Input, Block } from '@tarojs/components'
import './switchStation.scss'
import * as stationData from '@/utils/getAllStation'
import {pinyin} from '@/utils/PingyinUtil'
import SearchSwitchStation from './searchSwitchStation'
import { isNotEmptyObj,queryParams } from '@/utils/common'
import API from '@/api/index'

export default class SwitchStation extends Component {
  constructor(){
    super(...arguments)
    this.state={
        toView: '',
        hotStation: [],
        latLng: null,
        seach: [],
        nearStationId: '',
        value:'',
        isShowSearchAllStation: false,
        scoped_loca:true,
        Env:Taro.getEnv(),
        bigChar:'',//显示大写字母
        thisCity:'',//当前位置站点名称
        thisCityid:'', //当前位置站点id
        newthisC:'',
        newthisId:'',
    }
    this.isBack = true //选择站点后是否立即回退上一个页面
    this.basScr = 'https://imgczt.weitaikeji.com'
    this.updateRef = ''
    this.jumpDoSelect = false // 进入，来处理选择跳转后 -> 回调 跳转工具方法返回 -> 切换站点数据 进行相应业务处理，通过传递的fromSource区分业务逻辑处理
    this.fromSource = ''
  }

  // config = {
  //   navigationBarTitleText: '切换站点'
  // }

  componentWillMount () { // fromSource=chezhanditu

    let params = getCurrentInstance().router.params
    if(params){
      if(params.updateRef){
        this.updateRef = params.updateRef
      }
      if(params.isBack){
        if(params.isBack == '0'){
         this.isBack = false
        }else{
          this.isBack = params.isBack || true
        }
      }
      this.jumpDoSelect = params.jumpDoSelect || false
      this.fromSource = params.fromSource || '' //来源
    }
  }

  componentDidMount () {
    this.hotStation()
  }

  componentWillUnmount () { }


  componentDidShow () {
    this.getLocaTrues()
  }
  componentDidHide () {
  }

  getLocaTrues = () => { //获取定位权限
    let that = this
    Taro.getLocation({
      type: 'gcj02',
      success: function (data) {
        Taro.getSetting({
          success: function (res) {
            if (res.authSetting['scope.userLocation'] || res.authSetting['location'] || res.authSetting['scope.location']) {
              that.getMyCity(data)
            }else {
              that.setState({
                scoped_loca:false
              })
            }
          },
          fail:function(res){
          }
        })
      },
      fail: function () {
        if(Taro.getStorageSync("settinging")){
          Taro.showModal({
            title:'提示',
            content:'如开启定位后仍无法定位，请检查开启手机定位',
            confirmColor:'#0196ff',
            showCancel:false
          })
        }
        that.setState({
          scoped_loca:false
        })
      }
    })
  }

  //获取所在城市
  getMyCity = (res) => {
    let that = this
    let latitude = res.latitude
    let longitude = res.longitude

    API.StationService.getNearStation({latLng: latitude + ',' + longitude})
    .then(res => {
      if(Taro.getStorageSync("settinging")){
        Taro.removeStorage({
          key:'settinging'
        })
      }
      that.setState({
        scoped_loca:true
      })

      let thisCity = res.nearStation
      let thisCityid = res.stationId
      that.setState({
        thisCity:thisCity,
        thisCityid:thisCityid,
      })
    })
    .catch((e) => {

    })
  }

  openSetting = () => {
    let that =this
    if(that.state.Env =="WEAPP"){
      Taro.openSetting({
        success: (res) => {
          Taro.getLocation({
            type: 'gcj02',
            success: function (res) { //01.说明系统位置和小程序位置开启直接获取坐标定位
              that.getMyCity(res);
            },
            fail: function () { //02.说明系统位置获取小程序未开启（1或2）
              that.setState({
                scoped_loca:false,
              })
               Taro.showModal({
                title:'提示',
                content:'如开启定位后仍无法定位，请检查开启手机定位',
                confirmColor:'#0196ff',
                showCancel:false
              })
            }
          })
        }
      })
    }else{
      my.openSetting({
        success(res) {
          Taro.setStorageSync("settinging",2)
        }
      })
    }
  }

  //锚点跳转
  scrollToViewFn = (e) => {
    let that = this
    let _id = e.currentTarget.dataset.id;
    that.setState({
      toView: 'inToView' + _id,
      bigChar:_id
    }, ()=>{
      setTimeout(() => {
        this.setState({
          bigChar:0,
        })
      }, 300);
    })
  }

  //获取热门站点
  hotStation = () => {
    let that = this
    API.StationService.getHotStation({},true)
    .then(res => {
      let hot = res.data
      that.setState({
        hotStation: hot,
      })
    })
    .catch((e) => {

    })
  }
  //选择车站
  Choice = (e) => {

    let data = e.currentTarget.dataset//回退页面后：返回数据 -> id: 2625 name: "长春站"
    let jump_params = {
      'station': data.name,
      'stationId': data.id
    }

    let jumpUrl = '../stationLargeScreen/index?'+queryParams(jump_params)
    Taro.navigateTo({
      url: jumpUrl
    })

  }

  //光标确认
  open = (e) => {
    if(this.state.value == ""){
      if(this.state.isShowSearchAllStation == false){
        this.setState({
          isShowSearchAllStation: true,
          seach: []
        })
      }
    }
  }

  //输入
  change = (e) => {
    const value = e.detail.value
    this.setState({
      value: value
    })

    if(value != ""){
      let updata = this.searchPyFunc(value)
      let hasData = updata  && updata.length > 0
      this.setState({
        isShowSearchAllStation: !hasData, // 有数据 不显示筛选所有站点，没有数据 显示筛选
        seach: updata ? updata : [],
      })

      if(!hasData){
        Taro.showToast({
          title: '未搜索到，请重新搜索',
          icon: 'none',
          duration:500
        })
      }
    }else{
      this.setState({
        isShowSearchAllStation: true,
        seach: [],
      })
    }
  }

  changeNull = (e) => {
    const value = e.detail.value
    if(value ==''){
      this.setState({
        isShowSearchAllStation: true,
        seach: [],
        value:''
      })
    }
  }

 // 点击 搜索
serach = () => {
  const value = this.state.value
  if(value != ""){
    let updata = this.searchPyFunc(value)
    this.setState({
      isShowSearchAllStation: false,
      seach: updata ? updata : [],
    })
    if(updata === null || updata.length <=0){
      Taro.showToast({
        title: '未搜索到站点，请重新搜索',
        icon: 'none',
        value: ""
      })
    }
  }else{
    this.setState({
      isShowSearchAllStation: false,
      seach: [],
    })
  }
}

  //失去焦点
blur = (e) => {
    if(e.detail.value == ""){
      if(this.state.isShowSearchAllStation == true){
        this.setState({
          isShowSearchAllStation: false,
          seach: [],
        })
      }
    }
  }

  //清空搜索内容
  detel = (e) => {
    e.stopPropagation()
    this.setState({
      value:'',
      isShowSearchAllStation: false,
      seach: [],
    })
  }

searchPyFunc = (pyFirstChar) => {
    var updata = []
    var kongList = []

    var py_all = pinyin.getFullChars(pyFirstChar)
    var first_py = py_all && py_all != "" ? py_all.substr(0,1) : ""
    if(first_py != ""){
      first_py = first_py.toUpperCase()

      for(var i = 0; i<stationData.stationList.length; i++){
        var item = stationData.stationList[i]
        if(item.name == first_py){
          kongList = item.list
          break;
        }
      }

      var reg = new RegExp(pyFirstChar);
      for (let i = 0; i < kongList.length; i++) {
        if (kongList[i].stationName.match(reg) || kongList[i].stationEn.match(reg)) {
          updata.push(kongList[i])
        }
      }
    }
    return updata;
  }

  //定位热门站点
  toHot = () => {
    this.setState({
      toView:'hotCity'
    })
  }

  //定位头部
  positing = () => {
    this.setState({
      toView:'topost'
    })
  }

  //滚动时重置锚点
  onScroll = () => {
    this.setState({
      toView:''
    })
  }

  render () {
    let env = Taro.getEnv()
    let {thisCityid,thisCity,hotStation, seach, toView, isShowSearchAllStation, value,scoped_loca,bigChar} = this.state
    const navRight = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W","X", "Y", "Z"]

  var HS =hotStation.length>0 ? hotStation.map((item,index) => {
    return <View class="hotCity-item" key={"hotStationIndex_"+index} onClick={this.Choice} data-name={item.stationName} data-id={item.id} data-mapurl={item.newMiniMapUrl||''} >{item.stationName}</View>
  }): null
  var SEA = seach.map((item, index) => {
    return <View class="filter-item" key={index} onClick={this.Choice} data-id={item.id} data-name={item.stationName}>{item.stationName}</View>
  })

  var NR = navRight.map((item, index) => {
    return <View class='letter' key={index} className='letter' onClick={this.scrollToViewFn} data-id={item}>
      {
        bigChar == item &&
        <View className="bigChar1">{bigChar}</View>
      }
      <View className={bigChar==item?'newletter cur':'newletter'}>{item}</View>

    </View>
  })

  var section_stationHtml = process.env.TARO_ENV  == 'weapp' ? stationData.stationList.map((item,index) => {
    const ACL = item.list.map((x, index1) => {
      return <View class="cityName" key={"stationItemIndex_"+index1} onClick={this.Choice} data-name={x.stationName} data-id={x.id}>{x.stationName}</View>
    })
    return <View key={"stationSectionIndex_"+index} data-id={'inToView'+item.name}>
          <View class="type"  data-id={'inToView'+item.name} id={'inToView'+item.name}>{item.name}</View>
          {ACL}
        </View>
  }) : null

    const display_show_all_section_station = (value == "" && !isShowSearchAllStation) ? "block": "none"
    const showHot = value == "" && seach.length == 0 ? "block":"none"
    return (
      <View>
        <ScrollView className='switchStation' scrollY scroll-into-view={toView} scrollIntoView={toView} onScroll={this.onScroll}>
          <View class="sCs">
            <Image class="sImg" src={this.basScr+'/h5/taroVega/search_btn_1@2x.png'}></Image>
            <Input class={env =='WEAPP'?"serach":"serachs"}  placeholder="中文 / 英文" onFocus={this.open} value={value} onBlur={this.blur} onInput={this.change} ></Input>
            {
              value.length>0 &&
              <Image className="cImg" onClick={this.detel} src={'https://imgczt.weitaikeji.com/h5/taroVega/czt_v1/stationChange/icon_kdetele.png'}></Image>
            }

            {/* <View class='sSousuo'onClick={this.serach}>搜索</View> */}
          </View>

          <View style={'position:absolute; top:50px;left:0px; display:'+showHot}>
              {/* 所在城市站点/热门站点 */}
              <View class="allCity">
                <View class="location" id="topost">定位站点</View>
                <View className="location-list">
                {scoped_loca == true?<View className="location-item" data-name={thisCity} data-id={thisCityid} onClick={this.Choice}>
                    <Image src={this.basScr+'/h5/taroVega/czt_v1/stationChange/icon_location_n.png'}></Image>
                    {thisCity}
                  </View>
                  :<View className="no_scoped">定位服务已关闭，打开定位<Text onClick={this.openSetting}>去设置</Text></View>
                }

              </View>
              {hotStation.length>0 && <Block><View class="hotCity" id="hotCity">热门站点</View>
              <View class="hotCity-list">
                {HS}
              </View></Block>}

             </View>


               {/* 分组 所有城市列表 */}
              <View style={'display:'+display_show_all_section_station}>
               {process.env.TARO_ENV  == 'weapp'
               ? section_stationHtml
               :<SearchSwitchStation Choice={this.Choice} isSection={true}/>
              }
              </View>
          </View>

          {/* 搜索过滤 城市列表 */}
          <View class="filter" style='display:block; margin-top: 30px;'>
            {SEA}
          </View>
        </ScrollView>
        <View class="navRight" style={'display:'+display_show_all_section_station}>
          <View>
            <View className="text" onClick={this.positing}>定位</View>
            {hotStation.length>0 && <View className="text" onClick={this.toHot}>热门</View>}
          </View>
          {NR}
        </View>
      </View>
    )
  }
}
