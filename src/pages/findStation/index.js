import Taro, { getCurrentInstance } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, Picker, Block, Image } from '@tarojs/components'
import {isEmptyObj, addTrip_sourcefrom_enum, isNotEmptyObj, queryParams, isEmptyObject, get_date_crossDay, toast} from '@/utils/common'
import './findStation.scss'
import dayjs from 'dayjs'
import classNames from 'classnames'
import noPage from '@/components/noPage/noPage'
import API from '@/api/index'

let today_date = new Date().getFullYear() + '-' + ((new Date().getMonth() + 1) >= 10 ? (new Date().getMonth() + 1) : '0' + (new Date().getMonth() + 1)) + '-' + ((new Date().getDate()) >= 10 ? (new Date().getDate()) : '0' + (new Date().getDate()))
export default class FindStation extends Component {

  // config = {
  //   navigationBarTitleText: '选择车次',
  //   enablePullDownRefresh: true,
  //   backgroundTextStyle: "dark",   // 把显示的文本颜色改成暗色调,亮色的话.你背景不改看不到,因为同色
  //   backgroundColor:'#f7f7f7' // 页面的背景色
  // }

  constructor(){//bind
    super(...arguments)
    this.state = {
        sruedata: {},//绑定传参
        list: [],
        where: '',
        num: '',
        date: '',
        shareData: '',
        type:'bind',//类型，time跳转查询结果页 bind为直接添加绑定车次跳转列车详情
        topdate:'',
        dateC: '',
        timeCC: '',
        weekDay: '',

        selector: ['全部路局', '广铁路局', '武铁路局'],
        selectorChecked:'全部铁路局',
        rail:false, //选择高铁动车
        choseindex:-1,
        srueadd:false,//确认添加按钮(是否能添加)
        noPageText:'',
        thisPage:true,
        status:0,//是否停运
    }
    this.sourcefrom = '4'
    this.from_station = ''
    this.to_station = ''
    this.from_station_type = '1'
    this.to_station_type = '1'
    this.basScr = 'https://imgczt.weitaikeji.com'
    this.registerType = ''
  }

  UNSAFE_componentWillMount () {
    let params = getCurrentInstance().router.params
    
    if(params){
      if(params.sourcefrom){
        this.sourcefrom = 4
      }
      if(params.from_station){
        this.from_station = decodeURI(params.from_station)
        if(params.to_station){
          this.to_station = decodeURI(params.to_station)
        }
        this.state.where = this.from_station + '-' + this.to_station
      }

      if(params.from_station_type){
        this.from_station_type = decodeURI(params.from_station_type)
      }

      if(params.to_station_type){
        this.to_station_type = decodeURI(params.to_station_type)
      }

      // if(params.type){
      //   this.setState({
      //     type:params.type
      //     //type:'bind'
      //   })
      // }
    
      if (params.registerType){
        this.registerType = decodeURI(params.registerType)
      }
    }

    if(params && params.dateC){
      this.state.dateC = decodeURI(params.dateC)
      if(params.timeCC){
        this.state.timeCC = decodeURI(params.timeCC)
      }
      if(params.weekDay){
        this.state.weekDay = decodeURI(params.weekDay)
      }
    }else{
      this.state.dateC = today_date
      this.state.timeCC = dayjs(today_date).format('MM月DD日')
      this.state.weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][new Date().getDay()]
    }
  }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () {
    let data = getCurrentInstance().page.data
    if (data.dateC) {
      this.setState({
        dateC: data.dateC,
        timeCC: data.timeCC,
        weekDay: data.weekDay
      })
    }
    this.setState({
      rail:false, //选择高铁动车
      choseindex:-1,
    })
    this.initData(0)
  }

  componentDidHide () { }

  //下拉事件
  onPullDownRefresh(){
    this.initData()
    // 接口请求完毕后隐藏两个loading , 标题和下拉区域
    Taro.stopPullDownRefresh();
  }

  timeStamp = (StatusMinute) => {
  var hour = parseInt(StatusMinute / 60 % 24);
  var min = parseInt(StatusMinute % 60);
  StatusMinute = "";
  if (hour > 0) {
    StatusMinute += hour + "小时";
  }
  if (min > 0) {
    StatusMinute += parseFloat(min) + "分";
  }
  return StatusMinute;
}

  initData = (s=0) => {
    let that=this
    toast()

    let params = {
      date: this.state.dateC,
      dptCity: this.from_station,
      dptType: this.from_station_type,
      arrCity: this.to_station,
      arrType: this.to_station_type,
      hSpeed: s
    }
    API.StationService.getTrainsDetailListMiniApp(params,true)
    .then(res => {
      if(+res.code === 0){
        if (res.data) {
          // let list = (res.data.onlineTrains).concat(res.data.timeoutTrain)
          // for(var i=0;i<list.length;i++){
          //   if (list[i].interval && parseInt(list[i].interval)>0){
          //     list[i].interval = that.timeStamp(list[i].interval)
          //   }
          // }
          that.setState({
            list: res.data,
            num: res.data.length
          },function(){

          })
        }
      }else{
        Taro.showToast({
          title: '无此数据',
          icon: 'none'
        })
        that.setState({
          thisPage:false,
          noPageText:res.data.msg
        })
      }
    })
    .catch((e) => {
      that.setState({
        thisPage:false,
        noPageText:e.errorText || e
      })
    })
  }

  //选择日期
  toCalendar = () => {
    Taro.navigateTo({
      url: '../calendar/index'
    })
  }

  /**
     * 回退页面，数据更新方法
     * @param {*} type 更新数据类型定义
     * @param {*} data 更新数据
     */
  updateBackPageData(type, data){//refs: tripCard
    if(type == 'date'){//更新日期
      // let data = {
      //   dateC: dateC,//2019-07-05
      //   timeCC: timeCC,//07月05日
      //   weekDay:weekDay, //星期五
      //   toDay: toDay // ''/今天
      // }
      this.setState({
        dateC:data.dateC,
        timeCC: data.timeCC,
        weekDay: data.weekDay,
        toDay: data.toDay,
      })
    }
  }

  onChange = e=> {
    this.setState({
      selectorChecked: this.state.selector[e.detail.value]
    })
  }

  choserail = () => {
    this.setState({
      rail:!this.state.rail,
      choseindex:-1
    },res=>{
      if(this.state.rail){
        this.initData(1)
      }else{
        this.initData(0)
      }
    })
  }
  
  sureAdd = () =>{ //绑定
    let scheduleItem = this.state.sruedata;
    
    //绑定行程
    let params ={
      train: scheduleItem.trainNo,
      upStationName: scheduleItem.startStation,
      upTrainTime: scheduleItem.startTime,
      downStationName: scheduleItem.endStation,
      downTrainTime: scheduleItem.endTime,
    }

    API.StationService.addSchedule(params,true)
      .then(res => {
        if(+res.code === 1){
          Taro.showToast({
            title: '车次绑定成功',
            icon: 'none',
            duration:1000,
          })
          Taro.navigateBack({
            delta: 2
          })
          // Taro.switchTab({
          //   url: '/pages/trainState/index'
          // })
        }else{
          Taro.showToast({
            title: res.message,
            icon: 'none',
            duration:1000,
          })
        }
      })
      .catch(res => {

        that.setState({
          bottom_btn_enable: true,
        })
        Taro.hideLoading()
        if(isEmptyObj(res.message)){
          Taro.showToast({
            title:'添加行程失败',
            icon:'none',
            duration:1500
          })
        }else{
          Taro.showToast({
            title: res.message,
            icon: 'none',
            duration:1000,
          })
        }
      })
  }

  tobindready = (e) => {

      this.state.sruedata['endStation'] = e.currentTarget.dataset.e,
      this.state.sruedata['endTime'] = e.currentTarget.dataset.edate,
      this.state.sruedata['startStation'] = e.currentTarget.dataset.s,
      this.state.sruedata['startTime'] = e.currentTarget.dataset.sdate,
      this.state.sruedata['trainNo'] = e.currentTarget.dataset.num
    
      this.setState({
        choseindex:e.currentTarget.dataset.index,
        srueadd:true
    })
      
  }

  

  render () {
    let {list, timeCC, weekDay, choseindex,noPageText,thisPage, num,type,where,dateC,rail}=this.state;
    let top_time = timeCC +' '+weekDay

    const lists = list.map((item, index)=>{
      //跨天天数计算
      let daysNum = get_date_crossDay(item.dptDate, item.arrDate)
      let daysNumTip = daysNum > 0 ? "+"+daysNum+"天" : ''
      return <View id={'ATfind5_' + index} key={index} className={classNames('trip-list', choseindex == index ? 'bodershow' : '')} data-status={item.trainStatus} data-valid={item.valid} data-index={index} data-to-arrtime={item.arrDate+" "+item.arrTime} data-depDate={item.dptDate} data-sdate={item.dptDate+" "+item.dptTime} data-edate={item.arrDate+" "+item.arrTime} data-s={item.dptStationName} data-e={item.arrStationName} data-num={item.trainNo} onClick={this.tobindready}>
        {
          choseindex==index &&
          <Image className="bingstaTion" src={this.basScr+'/h5/taroVega/czt_v1/chooseStation/icon_yixuan2.png'}></Image>
        }
        <View className="trip-content">
          <View className="t-t">
            <View className={classNames("t-time", item.valid == 0 || item.trainStatus ==1?'traveColr':'')}>{item.trainNo}</View>
          </View>
          <View className="details">
            <View className="left">
              <View className={classNames("start", item.valid == 0 || item.trainStatus == 1?'traveColr':'')}>{item.dptStationName}</View>
              <View className={classNames("start-time", item.valid == 0 || item.trainStatus == 1?'traveColr':'')}>{item.dptTime}</View>
            </View>
            <View className="con">
              <View className={classNames("after", item.valid == 0 || item.trainStatus == 1?'traveColr':'')}>{item.interval}</View>
              <Image src={this.basScr+'/h5/taroVega/czt_v1/business/The_arrow.png'} class="ani"></Image>
              <View className={classNames("afterstype", item.valid == 0 || item.trainStatus == 1?'traveColr':'')}>{item.trainType || ''}</View>
            </View>
            <View className="right">
              <View className={classNames("end", item.valid == 0 || item.trainStatus == 1?'traveColr':'')}>{item.arrStationName}</View>
              <View className={classNames("end-time",item.valid==0 || item.trainStatus ==1?'traveColr':'')}>
                {item.arrTime}
                {daysNum > 0 && <View className={item.valid == 0 || item.trainStatus == 1? 'daysNum daysNumAlp':'daysNum'}>{daysNumTip}</View>}
              </View>
            </View>
          </View>
        </View>
      </View>
    })

    return (
      <View className={!thisPage?'newbaFind':(type =='time'?'findStation':'bindStation')}>
        {thisPage && <View className='thisPage'>

        <View className="finditem">
          <View className="tripdate">
              <View id='ATfind1' className="calendar" onClick={this.toCalendar}>
                <Text>{top_time}</Text>
                <Image src={this.basScr+'/h5/taroVega/czt_v1/chooseStation/icon_date.png'}></Image>
              </View>
              <View id='ATfind2' className="choserail" onClick={this.choserail}>
                <Image src={rail==false?this.basScr+'/h5/taroVega/czt_v1/chooseStation/icon_weixuan.png':this.basScr+'/h5/taroVega/czt_v1/chooseStation/icon_gouxuan.png'}></Image>
                <Text>高铁动车</Text>
              </View>
          </View>
          <View id='ATfind3' className="topTitle">
            <Text>{dateC}</Text>
            <Text>{where}</Text>
            {num == '' ? null : <Text>共{num}车次</Text>}
          </View>
        </View>
        {/* <View class='topTitleFill'></View> */}
        <View id='ATfind4'>
          {lists}
        </View>
        {
          list.length>0 &&
        <View className="bottomtext">
          <Text>— 我也是有底线的 —</Text>
        </View>
        }
        {
          type =="bind" &&
          <View className="sureadd">
            {
              choseindex!=-1
              ?<View id='ATfind6' className="btnadd truechose" onClick={this.sureAdd}>确认添加</View>
              :<View id='ATfind7' className="btnadd falsechose">确认添加</View>
            }
          </View>
        }
        </View>}

        {!thisPage && <View><noPage noPageText={noPageText} onInitData={this.initData.bind(this,0)}></noPage></View>}
      </View>
    )
  }
}
