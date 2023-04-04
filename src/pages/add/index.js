import React, { Component } from 'react'
import { View, Text, ScrollView ,Image} from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import './add.scss'
// import api from '../../../../service/api'
// import {get as getGlobalData } from '../../../../service/config'
import { addTrip_sourcefrom_enum, isEmptyObj, queryParams,parseUrlStr2ParamsObj} from '@/utils/common'
import Keyboard from '@/components/keyboard/keyboard'
// import TrainUtil from '../../../../service/apiCommon'
import dayjs from 'dayjs'
import API from '@/api'

export default class Add extends Component {
  state = {
    current:0,
    activityBannerList:[],// 活动banner
    activityBanner:{
        autoplay:true,
        circular:true,
        current:0,
    },
    cityNameS: '广州',
    cityNameE: '长沙',

    dateC: dayjs(new Date()).format(('YYYY-MM-DD')),
    timeCC: dayjs(new Date()).format(('MM月DD日')),
    weekDay: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][new Date().getDay()],
    toDay: '今天',

    animationData: {},
    rotate: 0,
    flag: 0,
    content: '例如：G9', //虚拟键盘_输入提醒文本
    animations: '', //虚拟键盘_输入光标样式
    color: '#c3c3c3',
    historyCC: [],
    historyZZ: [],
    bind: 0,
    addPageH:'addPageH',//添加页面高度
    staticUrl:'',
    scanHidden: true,
    hasBoard: false,
    shareData: '',
    user12306:'',
    user12306Ps:''
    // $router: getCurrentInstance().router.router
  }
  // this.path=getCurrentInstance().router.path

  sourcefrom = addTrip_sourcefrom_enum.momentSearch_trainSearch//默认为时刻/正晚点下车次查询
  from_station_type = '1' //默认为城市 1       所选的出发点是城市的时候传1   所选的出发点是站的时候传2
  to_station_type = '1'
  is_monent_enter = true//默认时刻查询进入，否则 添加行程下进入
  basScr = 'https://www.cx9z.com'
  env = process.env.TARO_ENV   //环境判断
  collectPageName = ''
  // constructor(arguments) {
  //   super(...arguments)

  // }

  // config = {
  //   navigationBarTitleText: '',
  //   navigationBarBackgroundColor: "#0196ff",
  //   backgroundColor: "#f8f8f8",
  //   backgroundTextStyle: "light",
  //   navigationBarTextStyle:'white'
  // }

  UNSAFE_componentWillMount () {
    let qOption = getCurrentInstance().router.params.q ? parseUrlStr2ParamsObj(decodeURIComponent(getCurrentInstance().router.params.q)) : null
    if(qOption){
      this.sourcefrom = qOption.sourcefrom

      this.setState({
        content: qOption.content || this.state.content,
        color: qOption.content && '#323232'
      })
    }

    let params = getCurrentInstance().router.params
    if(params){
      if(params.sourcefrom){
        this.sourcefrom = params.sourcefrom
        this.is_monent_enter = this.sourcefrom == addTrip_sourcefrom_enum.momentSearch_trainSearch || this.sourcefrom == addTrip_sourcefrom_enum.momentSearch_stationSearch || this.sourcefrom == addTrip_sourcefrom_enum.momentSearch_scanTicket
      }

      if(params.from && params.from == 'userCenter'){
        Taro.setStorageSync('addType', 2)
      }else{
        Taro.setStorageSync('addType', 1)
      }
    }
    let {title}=getCurrentInstance().router.params
    let titleText = title || (this.is_monent_enter?'时刻查询':'添加行程')
    Taro.setNavigationBarTitle({
      title: titleText
    })
    this.collectPageName = titleText
  }

  componentDidMount () {
    let that = this
    //动画初始化
    let animation = Taro.createAnimation({
      duration: 500,
      timingFunction: 'linear'
    })
    this.animation = animation;
    // Taro.getStorage({ key: 'hCArry' }).then(res => {
    //     if(res.data && res.data.length>0){
    //       that.setState({
    //         content:res.data[0]
    //       })
    //     }
    // })
    Taro.getStorage({ key: 'hZArry' }).then(res => {
      if (res.data && res.data.length > 0) {
        that.setState({
          cityNameS: res.data[0].split("-")[0],
          cityNameE: res.data[0].split("-")[1]
        })
      }
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
    let that=this;

    // 选择日期或城市后获取数据
    let data = getCurrentInstance().page.data
    if (data.dateC) {
      this.setState({
        dateC: data.dateC,
        timeCC: data.timeCC,
        weekDay: data.weekDay,
        toDay: data.toDay,
      })
    }
    if(data.from_station_type){//更新出发站
      this.setState({
        cityNameS: data.cityNameS,
      })
      this.from_station_type = data.from_station_type
    }
    if(data.to_station_type){//更新到达站
      this.setState({
        cityNameE: data.cityNameE,
      })
      this.to_station_type =  data.to_station_type
    }
    Taro.getStorage({key:'hCArry'}).then(res=>{
      that.setState({
        historyCC: res.data,
      })
    })

    Taro.getStorage({key:'hZArry'}).then(res=>{
      that.setState({
        historyZZ: res.data
      })
    })

    // if(that.env=='weapp'){
    //   that.getActivityBanner({
    //     helpActivityId:'',	//是	助力活动Id
    //     voteActivityId:'',	//是	投票活动Id
    //   }).then((res1)=>{
    //       let data1 = res1.data
    //       if(data1.code==0){
    //           that.setState({
    //               activityBannerList:data1.data || []
    //           })
    //       }
    //   })
    // }

  }

  componentDidHide () { }

  //选择车次或者站站查询
  checkModule = (e) => {
    this.setState({
      hasBoard: false,
      current: e.target.dataset.index
    })
  }

  /**
       * 回退页面，数据更新方法
       * @param {*} type 更新数据类型定义
       * @param {*} data 更新数据
       */
  updateBackPageData = (type, data) => {//refs: tripCard
    if(type == 'date'){//更新日期
      this.setState({
        dateC:data.dateC,
        timeCC: data.timeCC,
        weekDay: data.weekDay,
        toDay: data.toDay,
      })
    }else if(type == 'from'){//更新出发站
      // from_station_type :1
      // station:"上海"
      // to_station_type:"1"
      this.setState({
        cityNameS: data.station,
      })
      this.from_station_type = data.from_station_type
    }else if(type == 'to'){//更新到达站
      this.setState({
        cityNameE: data.station,
      })
      this.to_station_type =  data.to_station_type
    }
}

  //选择日期
  toCalendar = () => {
    this.setState({
      addPageH:0
    })
    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })

    Taro.navigateTo({
      url: '../calendar/index'
    })
  }

  //选择出发城市--目的城市
  toCityS = (e) => {
    Taro.navigateTo({
      url: '../city/index?type='+e.currentTarget.dataset.type
    })
  }


  // onReloadUser(){
  //   // 刷新授权：子组件 状态
  //   const swiperComponent = getTargetComponentByRef("swiper1");
  //   swiperComponent && swiperComponent.reloadAuthStatus && swiperComponent.reloadAuthStatus()
  // }


  choice = () => {
    let that = this
    const {content, dateC, timeCC, weekDay, current, cityNameS, cityNameE, } = this.state
    let trainNO = content
    // this.onReloadUser()
    if(current == '0'){
      if(isEmptyObj(trainNO) || trainNO == '例如：G9'){
        this.onHiddenKeyBoard()
        Taro.showToast({
          title: '请输入正确的车次号',
          icon: 'none',
          duration: 1000
        })
        return
      }
    }

    if(current == '0'){

      // 车次查询 -> 跳转车次出发站选择页  selectSite/index
      API.StationService.getDetailByTrainNo({date: dateC,trainNO:trainNO})
      .then(res => {
        if (+res.state === 2) {
          Taro.showToast({
            title: '无此车次信息',
            icon: 'none'
          })
          return
        }
        let jump_params = {
          sourcefrom: this.is_monent_enter ? addTrip_sourcefrom_enum.momentSearch_trainSearch : addTrip_sourcefrom_enum.addTrain_trainSearch,
          trainNo:trainNO,
          dateC:dateC,
          timeCC: timeCC,
          weekDay: weekDay
        }
        let jumpUrl = '../selectSite/index?'+queryParams(jump_params)
        Taro.navigateTo({
          url: jumpUrl
        }).then(()=>{
          that.onHiddenKeyBoard()
          let arry = Taro.getStorageSync('hCArry') || []
          let cc = trainNO
          if (arry.length == 0) {
            arry.unshift(cc)
          } else if (arry.indexOf(cc) != -1) {

          } else {
            arry.unshift(cc)
            if (arry.length >= 20) {
              arry.pop()
            }
          }
          Taro.setStorageSync('hCArry', arry)
        })
      })
      .catch(() => {

      })
    }else if(current == '1'){
       // 站站查询  -> 跳转车次选择列表页
       let source = this.is_monent_enter ? addTrip_sourcefrom_enum.momentSearch_stationSearch : addTrip_sourcefrom_enum.addTrain_stationSearch
       let jump_params = {
        sourcefrom: source,
        dateC:dateC,
        timeCC: timeCC,
        weekDay:weekDay,
        from_station:cityNameS,
        from_station_type: that.from_station_type,
        to_station:cityNameE,
        to_station_type: that.to_station_type,
        type: source == addTrip_sourcefrom_enum.momentSearch_stationSearch ? 'time' : 'bind'
      }

      let jumpUrl = '../findStation/index?'+queryParams(jump_params)
      Taro.navigateTo({
        url: jumpUrl
      }).then(res=>{
        let arry = Taro.getStorageSync('hZArry') || []
        let czzc = cityNameS + '-' + cityNameE
        if (arry.length == 0) {
          arry.unshift(czzc)
        } else if (arry.indexOf(czzc) != -1) {

        } else {
          arry.unshift(czzc)
          if(arry.length>=20){
            arry.pop()
          }
        }

        Taro.setStorageSync('hZArry', arry)
      })
    }
  }

  //调换起点终点
  tochangeSE = () =>{
    this.setState({
      cityNameS: this.state.cityNameE,
      cityNameE: this.state.cityNameS
    })
    let from_type = this.from_station_type
    let to_type = this.to_station_type
    this.from_station_type = to_type
    this.to_station_type = from_type

    if (this.state.rotate == 180) {
      this.state.rotate = 0;
      this.animation.rotate(this.state.rotate).step();
      this.setState({
        animationData: this.animation.export()
      })
    } else if (this.state.rotate == 0) {
      this.state.rotate = 180;
      this.animation.rotate(this.state.rotate).step();
      this.setState({
        animationData: this.animation.export()
      })
    }
  }

  //接受按键值
  onGetCode (e) {
    let tex = e.val;
    this.setState({
      color: '#323232'
    });
    if (tex == 'del') { //清除

      let len = 0;
      tex = this.state.content.split("");
      len = tex.length;
      if (len == 0) {
        this.setState({
          color: '#c3c3c3'
        });
        return;
      } else {
        let newtex = [];
        for (let i = 0; i < len - 1; i++) {
          newtex.push(tex[i]);
        }
        tex = newtex.join("");
        this.setState({
          content: tex,
          color: '#323232'
        });
      }
    } else if (tex == 'close') { //收起
      //this.keyboard.hideKeyBoard();
      this.onHiddenKeyBoard()
    } else { //输入
      let sss= this.state.content.concat(tex)
      let lene = sss.split('')
      if(lene.length >=10){
        return
      }
      this.setState({
        content: this.state.content + tex
      });
    }
  }

  cleanCC = () => {
    Taro.setStorage({key:'hCArry',data:[]}).then(res=>{
      this.setState({
        historyCC: []
      })
    })
  }

  cleanZZ = () => {
    Taro.setStorage({key:'hZArry',data:[]}).then(res=>{
      this.setState({
        historyZZ: []
      })
    })
  }

  //点击车次历史查询
  hop = (e) => {
    let that = this
    let name1 = e.currentTarget.dataset.num
    this.setState({
      content:name1,
    },res=>{
      that.choice()
    })
  }

  //城市历史查询
  hopp = (e) => {
    let that = this
    let name1 = (e.currentTarget.dataset.name).split('-')[0];
    let name2 = (e.currentTarget.dataset.name).split('-')[1];
    this.setState({
      cityNameS:name1,
      cityNameE:name2
    }, ()=>{
      that.choice()
    })
  }


  showKeyBoard = (e) => {
    e.stopPropagation();
    let currentContent = ''
    var color = ''
    if(this.state.content == '例如：G9'){
      currentContent = ''
      color = '#c3c3c3'
      // this.setState({
      //   color: '#c3c3c3'
      // })
    }else{
      currentContent = this.state.content
      color = '#323232'
      // this.setState({
      //   color: '#323232'
      // })
    }
    this.setState({
      content: currentContent,
      animations: 'animation',
      hasBoard: true,
      color: color
    })
  }

  // 收起键盘
  onHiddenKeyBoard(e) {

    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    if (this.state.content) {
      this.setState({
        animations: ''
      });
    } else {
      this.setState({
        content: '例如：G9', //虚拟键盘_输入提醒文本
        animations: '', //虚拟键盘_输入光标样式
        color: '#c3c3c3'
      });
    }
    this.setState({
      addPageH: 0,
      hasBoard: false,
    })
  }
  //点击其他区域关闭键盘
  bodyCloseKeyboard = (e) => {
    this.setState({
      hasBoard: false,
    })
  }

  render () {
    let {current,activityBannerList,activityBanner, historyCC, historyZZ,content,timeCC,weekDay,toDay,hasBoard,cityNameS,animationData,cityNameE, color, animations} = this.state
    const history1 = historyCC.map((item, index)=>{
      return <View className='hisC' key={index} data-num={item} onClick={this.hop}>{item}</View>
    })

    const history2 = historyCC.map((item, index)=>{
      return <View className='hisC' key={index} data-num={item}>{item}</View>
    })

    const zz1 = historyZZ.map((item, index)=>{
      return <View className='hisZ' key={index} onClick={this.hopp} data-name={item}>{item}</View>
    })

    const zz2 = historyZZ.map((item, index)=>{
      return <View className='hisZ' key={index} data-name={item}>{item}</View>
    })

    let is_addTrip = this.sourcefrom == addTrip_sourcefrom_enum.addTrain_trainSearch || this.sourcefrom == addTrip_sourcefrom_enum.addTrain_stationSearch

    let activityBannerListDot = (this.env =='weapp' && activityBannerList && activityBannerList.length > 1) ? activityBannerList.map((item,index)=>{
      return (
        <Block key={"index_"+index}>
          <View data-i={index} className={'dot'+ (index == activityBanner.current ? ' active' : '')}></View>
        </Block>
      )
    }) : null;

    return (
      <View className='add' onClick={this.bodyCloseKeyboard}>
        <View className="addBgc"></View>
        <View className="contentbox">
          <View className='checkCol'>
            <View className={'ci ' + (current == '0' ? 'cur' : '')} data-index='0' onClick={this.checkModule}>{is_addTrip ? '车次添加' : '车次查询'}</View>
            <View className={'ci ' + (current == '1' ? 'cur right' : '')} data-index='1' onClick={this.checkModule}>{is_addTrip ? '站站添加' : '站站查询'}</View>
          </View>

          {current == '0' && <View className='trainQuery'>
            <View className='trainNo'>
              <View className='leftBox'>
                <View className='textC'>车次号</View>
                <View id='ATadd1' className={`inputCol ${animations}`} onClick={this.showKeyBoard} style={`color: ${color}`}>{content}</View>
              </View>
              <View className='rightBox' id='ATadd2'>
                {/* <View className="scanbgc">
                    <Image className='scanImg' src={this.basScr + '/h5/tarocx9z/czt_v1/search/icon_saomiao.png'} onClick={this.scanTicket}></Image>
                </View>
                <View className='scanText'>扫一扫</View> */}
              </View>
            </View>

            <View className='goDate'>
              <View className='textD'>出发日期</View>
              <View id='ATadd3' className='dateCol' onClick={this.toCalendar}>
                <View className='goDay'>{timeCC}</View>
                <View className='goWeek'>{weekDay}</View>
                <View className='toDay'>{toDay}</View>
              </View>
              {historyCC != '' && <View className='history'>
                <ScrollView scrollX className="scoll">
                  {history1}
                </ScrollView>
                {historyCC != '' && <View className='allC' onClick={this.cleanCC}>清空</View>}
              </View>}
            </View>
          </View>}

          {current == '1' && <View className='stationQuery'>
            <View className='cityCol'>
              <View className='start' data-type='from' onClick={this.toCityS}>
                <Text className='text'>出发地</Text>
                <Text className='cityName'>{cityNameS}</Text>
              </View>
              <Image id='ATadd4' className='switchImg' src={this.basScr + '/h5/tarocx9z/switch@2x.png'} animation={animationData} onClick={this.tochangeSE}></Image>
              <View className='start' data-type='to' onClick={this.toCityS}>
                <Text className='text'>目的地</Text>
                <Text className='cityName'>{cityNameE}</Text>
              </View>
            </View>

            <View className='goDate'>
              <View className='textD'>出发日期</View>
              <View id='ATadd5' className='dateCol' onClick={this.toCalendar}>
                <View className='goDay'>{timeCC}</View>
                <View className='goWeek'>{weekDay}</View>
                <View className='toDay'>{toDay}</View>
              </View>
              {historyZZ != '' && <View className='history'>
                <ScrollView scrollX className="scoll">
                  {zz1}
                </ScrollView>
                {historyZZ != '' && <View className='allC' onClick={this.cleanZZ}>清空</View>}
              </View>}
            </View>
          </View>}

          <View id='ATadd6' className={hasBoard ? 'sureBox sureBox_keyboard' : 'sureBox'}>
              <View className='sure' onClick={this.choice}>查询</View>
          </View>
          {hasBoard && <Keyboard id='keyboard' onHidden={this.onHiddenKeyBoard.bind(this)} onGetCode={this.onGetCode.bind(this)} dataSet='dataSet'></Keyboard>}

        </View>
        {/* <Image src={getGlobalData('domain_h5') + '/h5/tarocx9z/v2.0/common/banenrsync.png'} onClick={this.sync12306} className="toSync"></Image> */}
      </View>
    )
  }
}
