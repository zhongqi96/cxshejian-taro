import Taro, { getCurrentInstance, getCurrentPages } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, ScrollView, Input, Image, Block} from '@tarojs/components'
import './city.scss'
// import api from '../../../../service/api'
// import {get as getGlobalData } from '../../../../service/config'
import {pinyin} from '@/utils/PingyinUtil'
import { isNotEmptyObj, toast } from '@/utils/common'
import API from '@/api/index'

export default class City extends Component {
  constructor(){
    super(...arguments)
    this.state={
      allCity: [],
      navRight: [],
      toView: 'inToViewA',
      hotCity: [],
      thisCity: '',
      kong: [],
      seach:[],
      bok1: true,
      bok2: false,
      bok3: true,
      sHeight: 0,//屏幕高度
      shareData: '',
      bigChar:'',//显示大写字母
      marTop:'',//放大字母位置
      scoped_loca:true,
      env:Taro.getEnv(),
      value:''
    }
    this.updateRef=''
    this.type=''
    this.basScr = 'https://www.cx9z.com'
  }

  config = {
    navigationBarTitleText: ''
  }

  componentWillMount () {
    const res = Taro.getSystemInfoSync()
    this.setState({
      sHeight: res.windowHeight
    })
    let params = getCurrentInstance().router.params
    if(params){
      if(params.updateRef){
        this.updateRef = params.updateRef
      }
      if(params.type){
        this.type = params.type
      }
    }

    if(isNotEmptyObj(this.type)){
      Taro.setNavigationBarTitle({
        title: this.type=='from' ? '选择出发地' : '选择目的地'
      })
    }else{
      Taro.setNavigationBarTitle({
        title: '选择城市'
      })
    }
  }

  componentDidMount () {
    let that = this
    that.getAllCity()
    that.getHotCity()
  }

  componentWillUnmount () {
  }

  componentDidShow () {
    this.getLocaTrues()
   }

   getLocaTrues = () => { //获取定位权限
    let that = this
    Taro.getLocation({
      type: 'gcj02',
      success: function (data) {
        Taro.getSetting({
          success: function (res) {
            if (res.authSetting['scope.userLocation'] || res.authSetting['location']  || res.authSetting['scope.location']) {
              that.getMyCity(data)
            }else {
              that.setState({
                scoped_loca:false
              })
            }
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

  componentDidHide () { }

  openSetting = () => {
    let that =this
    if(that.state.env =="WEAPP"){
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

  //获取所有城市
  getAllCity = () => {
    API.StationService.getAllCityAndStation({},true)
    .then(res => {
      if(res.code == 0){
        let array = res.data
        let navRight =[]
        for(var i =0;i<array.length;i++){
          if(array[i].list.length!=0){
            navRight.push(array[i].name)
          }else{
            array.splice(i,1)
          }
        }
        this.setState({
          allCity: array,
          navRight:navRight
        })
      }else{
        Taro.showToast({
          title:res.msg,
          icon:'none'
        })
      }
    })
    .catch((e) => {
      Taro.hideLoading()
      Taro.showToast({
        title:e.errorText || e,
        icon:'none'
      })
    })
  }

  //获取热门城市
  getHotCity = () => {

    API.StationService.getHotCity()
    .then(res => {
      this.setState({
        hotCity: res.hotCity
      })
    })
    .catch((e) => {

    })
  }

  //获取所在城市
  getMyCity = (res) => {
    let that = this
    let latitude = res.latitude
    let longitude = res.longitude
    API.StationService.getCityForLngLat({lnglat:latitude + ',' + longitude})
    .then(value => {
      if(Taro.getStorageSync("settinging")){
        Taro.removeStorage({
          key:'settinging'
        })
      }
      that.setState({
        thisCity: value.cityname.split('市')[0],
        scoped_loca:true
      })
    })
    .catch(() => {

    })
  }

  //锚点跳转
  scrollToViewFn = (e) => {
    let _id = e.currentTarget.dataset.id;
    this.setState({
      toView: 'inToView' + _id,
      bigChar:_id
    }, ()=>{
      setTimeout(() => {
        this.setState({
          bigChar:0,
        })
      }, 2000);
    })
  }

  //搜索栏聚焦
  open = () => {
    let that = this
    let citylist = that.state.allCity
    citylist.forEach(function (item, index) {
      item.list.forEach(function (items, index) {
        that.state.kong.push(item)
      })
    })
    that.setState({
      seach: that.state.kong,
      bok1: false,
      bok2: true,
      bok3: false
    })

  }

  // 点击 搜索
  serach = () => {
    const value = this.state.value
    if(value != ""){
      let updata = this.searchPyFunc(value,this.state.allCity)
      this.setState({
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
        seach: [],
      })
    }
  }

  //输入
  change = (e) => {
    const value = e.detail.value
    this.setState({
      value: value
    })

    if(value != ""){
      // Taro.showLoading({
      //   title: '加载中',
      // })
      let updata = this.searchPyFunc(value,this.state.allCity)
      let hasData = updata  && updata.length > 0
      this.setState({
        //isShowSearchAllStation: !hasData, // 有数据 不显示筛选所有站点，没有数据 显示筛选
        seach: updata ? updata : [],
        bok1: false,
        bok2: true,
        bok3: false
      })

      if(!hasData){
        Taro.showToast({
          title: '未搜索到，请重新搜索',
          icon: 'none',
          value: "",
          duration:500
        })
      }
    }else{
      this.setState({
        //isShowSearchAllStation: true,
        seach: [],
        bok1: true,
        bok2: false,
        bok3: true
      })
    }
  }

  searchPyFunc = (pyFirstChar,arrlist) => {
    var updata = []
    var kongList = []
    var py_all = pinyin.getFullChars(pyFirstChar)
    var first_py = py_all && py_all != "" ? py_all.substr(0,1) : ""
    if(first_py != ""){
      first_py = first_py.toUpperCase()
      for(var i = 0; i<arrlist.length; i++){
        var item = arrlist[i]
        if(item.name == first_py){
          kongList = item.list
          break;
        }
      }
      var reg = new RegExp(pyFirstChar);
      for (var i = 0; i < kongList.length; i++) {
        if (kongList[i].cityName.match(reg)  || kongList[i].cityAllPin.match(reg)  || kongList[i].citySimplePin.match(reg)) {
          updata.push(kongList[i])

        }
      }

        for(var i=0;i<arrlist.length;i++){

          for(var j=0;j<arrlist[i].list.length;j++){

            for(var k=0;k<arrlist[i].list[j].stationList.length;k++){

              if( arrlist[i].list[j].stationList[k].stationName.match(pyFirstChar) || arrlist[i].list[j].stationList[k].stationAllPin.match(pyFirstChar) || arrlist[i].list[j].stationList[k].stationSimplePin.match(pyFirstChar) ){
                let stinglist = arrlist[i].list[j].stationList
                //arrlist[i].list[j].stationList = stinglist.slice(k,k+1)
                if(arrlist[i].list[j].cityName.match(pyFirstChar) && arrlist[i].list[j].stationList[k].stationName.match(pyFirstChar) && updata.length>0){

                }else{
                  updata.push({'cityName':arrlist[i].list[j].cityName,'stationList':stinglist.slice(k,k+1)})
                }
              }
            }
          }
        }
    }
    return updata;
  }

  //选择城市
  choiceCity = (e) => {
    let dataset = e.currentTarget.dataset
    let city = dataset.name
    // let se = Taro.getStorageSync('cityNameSE')
    // if(se == 'start'){
    //   Taro.setStorageSync('cityNameS', city)
    //   Taro.setStorageSync('cityNameStype', type)
    //   Taro.setStorageSync('cityNameEtype', 1)

    //   Taro.navigateBack({delta: 1})
    // }else if(se == 'end'){
    //   Taro.setStorageSync('cityNameE', city)
    //   Taro.setStorageSync('cityNameEtype', type)
    //   Taro.setStorageSync('cityNameStype', 1)

    //   Taro.navigateBack({delta: 1})
    // }

    var pages =getCurrentPages();//当前页面栈   // $component $$refs
    if (pages.length >1) {//回退页面数据更新
        var beforePage = pages[pages.length- 2];//获取上一个页面实例对象
        var data = {
          station: city
        }
        if(this.type == 'from'){
          data = {
            cityNameS: city,//选择站
            from_station_type: dataset.type,//类型
            // to_station_type: 1
          }
        }else if(this.type == 'to'){
          data = {
            cityNameE: city,//选择站
            // from_station_type: 1,
            to_station_type: dataset.type//类型
          }
        }
        beforePage.setData(data)
        Taro.navigateBack({delta: 1})
        // if(this.updateRef != ''){
        //   let refs = beforePage.$component.$$refs
        //   if(refs && refs.length > 0){
        //     for(var i = 0; i<refs.length; i++){
        //       let item = refs[i]
        //       if(item.refName == this.updateRef){//item.refName == 'tripCard'
        //         let target_component = item.target
        //         //触发父页面中 子组件的方法
        //         target_component && target_component.updateBackPageData && target_component.updateBackPageData(this.type,data)
        //         Taro.navigateBack({delta: 1})
        //         return
        //       }
        //     }
        //   }
        // }else{
          // beforePage.$component.updateBackPageData && beforePage.$component.updateBackPageData(this.type,data)

       // }
    }
  }

  //显示大写字母
  disBigChar = (e) => {
    e.stopPropagation();
    var realTarget = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      this.setState({
        bigChar:e.target.dataset.id
      })
  }

  //定位热门城市
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

  //清空搜索内容
  detel = (e) => {
    e.stopPropagation()
    this.setState({
      value: '',
      seach: [],
      bok1: true,
      bok2: false,
      bok3: true
    })
  }

  changeNull = (e) => {
    const value = e.detail.value
    if(value ==''){
      this.setState({
        value: '',
        seach: [],
        bok1: true,
        bok2: false,
        bok3: true
      })
    }
  }

  render () {
    let {hotCity,allCity,navRight,seach,sHeight,thisCity,value,bok1,bok2,bok3,scoped_loca}=this.state;

    const hotCitys = hotCity.map((item, index) => {
      return <View className='hotCity-item' key={index} data-type="1" data-name={item} onClick={this.choiceCity}>{item}</View>
    })

    const AllCityList = ({item}) => {
      return (
        item.list.map((x, index) => {
          return <View key={index} className='cityName' data-name={x.cityName} data-type="1" onClick={this.choiceCity}>{x.cityName}</View>
        })
      )
    }

    const allCitys = allCity.map((item, index) => {
      return <View key={index}>
        <View className='type' id={'inToView'+item.name}>{item.name}</View>
        <AllCityList item={item} />
      </View>
    })

    const navRights = navRight.map((item, index) => {
      return <View className='letter' key={index} onClick={this.scrollToViewFn} data-id={item}>
                {
                  this.state.bigChar == item &&
                  <View className="bigChar1">{this.state.bigChar}</View>
                }
                <View className={this.state.bigChar==item?'newletter cur':'newletter'}>{item}</View>
            </View>
    })

    const Search_Item = ({item}) => {
        return (
          item.stationList.map((x, index) => {
            return <View className='filter-item'   data-name={x.stationName} data-type="2" onClick={this.choiceCity}>
              <View className="city station">站点</View>
              <Text>{x.stationName}</Text>
              </View>
          })
        )
    }

    const SearchItm = ({item}) => {
      return (
        item.stationList.map((itemp,indexp)=>{
          return (<Block>
            {itemp.stationName}
            {
              indexp == item.stationList.length-1?
              ''
              :
              '，'
            }
          </Block>
          )
        })
      )
    }

    const seachs = seach.map((item, index) => {
        // return <View className='filter-item' key={index} data-name={item.cityName} onClick={this.choiceCity}  ><View>城市</View>{item.cityName}</View>
     return (<Block key={index}>
       {
         item.cityName &&
          <View className='filter-item'   data-name={item.cityName} data-type="1" onClick={this.choiceCity}>
            <Block><View className="city">城市</View><Text>{item.cityName}</Text><View className="clour">（包含：{SearchItm}）</View></Block>
          </View>
       }

        <Search_Item item={item} />
      </Block>)
    })
    return (
      <View className='city'>
        <ScrollView scrollY scrollIntoView={this.state.toView}  onScroll={this.onScroll} style={'height:' + sHeight + 'px'}>
          <View className="sCs">
            <Image className="sImg" src={this.basScr+'/h5/tarocx9z/czt_v1/stationChange/icon_sous1.png'}></Image>
            <Input id='ATcity1' className="serach" placeholder="中文  /  英文  /  首字母" value={value} onInput={this.change}></Input>
            <Image id='ATcity2' className="cImg" onClick={this.detel} src={this.basScr+'/h5/tarocx9z/czt_v1/stationChange/icon_kdetele.png'}></Image>
          </View>

          {bok1 && <View className="allCity">
            <View className="location" id="topost">定位城市</View>
            <View className="location-list">
            {scoped_loca == true?<View className="location-item" data-type="1" data-name={thisCity} onClick={this.choiceCity}>
                <Image src={this.basScr+'/h5/tarocx9z/czt_v1/stationChange/icon_location_n.png'}></Image>
                {thisCity}
              </View>
              :<View className="no_scoped">定位服务已关闭，打开定位<Text onClick={this.openSetting}>去设置</Text></View>
            }

            </View>

            {hotCity.length>0 && <Block>
              <View className="hotCity" id="hotCity">热门城市</View>
              <View className="hotCity-list">
                {hotCitys}
              </View>
            </Block>}

            {allCitys}
          </View>}

          {bok2 && <View className="filter">
            {seachs}
          </View>}

          {bok3 && <View className="navRight">
            <View>
              <View className="text" onClick={this.positing}>定位</View>
              {hotCity.length>0 && <View className="text" onClick={this.toHot}>热门</View>}
            </View>
            <View>{navRights}</View>
          </View>}
        </ScrollView>
      </View>
    )
  }
}
