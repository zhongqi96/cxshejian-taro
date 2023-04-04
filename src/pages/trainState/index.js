import Taro, { getCurrentInstance } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import {addTrip_sourcefrom_enum, queryParams,isNotEmptyObj, isEmptyObj, toast} from '@/utils/common'
import './index.scss'
// import shareUtil from '../../../utils/shareUtil'
// import TrainUtil from '../../../service/apiCommon'
// import jumpUtil from '../../../utils/jumpUtil'
import noPage from '@/components/noPage/noPage'
import API from '@/api/index'

let rqi = [];
let cale = [];
export default class Index extends Component {
  constructor(){
    super(...arguments)
    this.state={

      currentTrip: [],
      list_rquser:[],
      hidden: "1000",
      scheduleNum: '',
      isHasSchedule: true,
      isOver:false,
      flog3: 'xianshi',
      windowHeight:'938rpx',
      listR: {},
      toDay: '',
      inToViewM: 'inToViewM',
      rqr: [],
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      env_type: Taro.getEnv(),
      sprDte:{
        wday:'',
        timeCC:'',
        weekDay:'',
      },
      scanHidden: true,
      isSpecial:true,//行程列表
      today:null,
      tormor:null,
      yesdays:null,
      enterTime:0,//进入页面的时间
      noPageText:'加载失败',
      thisPage:true, //是否显示重新加载页面  true不显示  false显示
      isRequest:false,
      state:0,
      isShowSchedule:false,
    }
  }  

  componentWillMount () {
    
  }

  componentDidMount () {
  }

  componentWillUnmount () { 
    
  }

  componentDidShow () {
    this.initData() 
  } 

  async initData(){
    let that=this
    let getNetworkType = await Taro.getNetworkType()

   
    if(getNetworkType.networkType=='none'|| getNetworkType.networkType=='NOTREACHABLE'){
      that.setState({
        noPageText:'网络异常，请重试',
        thisPage:false
      })
    }else{
      that.setState({
        noPageText:'',
        thisPage:true,
        enterTime:(new Date()).getTime()
      },()=>{
        if(Taro.getEnv() =='ALIPAY') { //支付宝小程序 关注生活号
          Taro.canIUse('lifestyle')
        }     

        this.setState({
          today:this.NewDate(0),
          tormor:this.NewDate(1),
          yesdays:this.NewDate(2),
        },res =>{
          that.getDateTime()
        })
      
        //行程
        that.getCurrentTrip()
        
      })
    }
  } 

  componentDidHide () { 

  }

  //下拉事件
onPullDownRefresh(){
  this.initData()
  // 接口请求完毕后隐藏两个loading , 标题和下拉区域
  Taro.stopPullDownRefresh();
}

  getDateTime = () => { //获取当前时间  周几
    let timeCC = (new Date(new Date().getTime()).getMonth() + 1) + '月' + new Date(new Date().getTime()).getDate() + '号';
    let weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][new Date(new Date().getTime()).getDay()];
    this.setState({
      sprDte:{
        timeCC:timeCC,
        weekDay:weekDay
      }
    })
  }
  deleteSchedule = (id) =>{ //删除行程
    var that = this
    var scheduleIDs = []
    scheduleIDs.push(id)
    
    Taro.showModal({
      title:"",
      content: '确定要删除该行程？',
      cancelText:"否"//默认是“取消”
    }).then(res =>{
      if(res.confirm){
        
        API.StationService.deleteSchedule(scheduleIDs, true)
        .then(res => {
          if(+res.code === 1){
            this.setState({
              hidden: 1000,
              isDelete:true
            },()=>{
              this.getCurrentTrip()
            })
          }else{
            Taro.showToast({
              title: res.message,
              icon: 'none',
              duration:1000,
            })
          }
        })
        .catch(res => {
          
          if(isEmptyObj(res.message)){
            Taro.showToast({
              title:'删除行程失败',
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
      }else{
        //
      }
    })
  }
  // get_isShowAddSchedule(){
  //   var is_show = false
  //   
  //   const {currentTrip} = this.state
  //   if(isEmptyObj(currentTrip) && currentTrip.length<=0){//无行程
  //     is_show = true
  //   }else{
  //     let list_rquser = Object.keys(currentTrip)
  //     let num = 0
  //     for(var i=0; i<list_rquser.length;i++){
  //       let mops = currentTrip[list_rquser[i]]
  //       if(mops.length==0){
  //           num++
  //       }
  //     }
  //     if(num==7){
  //       is_show = true   //显示添加按钮
  //     }
  //     if(num==6 && isNotEmptyObj(currentTrip['over']) && currentTrip['over'].length>0){
  //       is_show = true   //显示添加按钮
  //     }
  //  }
  //   return is_show
  // }

  //当前行程
  getCurrentTrip = () =>{
    
    let that = this
    API.StationService.getScheldeList({},true,)
    .then(res => {
       if(+res.code === 1){
          that.setState({
            isRequest:true
          })
        
        if (res.data != null && res.data != '') {
            let currentTrip = res.data
            let list_rquser = Object.keys(currentTrip)
            let num = 0
            let {isHasSchedule , isOver} = this.state
            for(var i=0; i<list_rquser.length;i++){
              
              let mops = currentTrip[list_rquser[i]]
              if(mops.length==0){
                  num++
              }

            for(var k=0;k<mops.length;k++){
              
                let starTime = mops[k].upTrainTime.trim().split(" ")[1]
                let ednTime = mops[k].downTrainTime.trim().split(" ")[1]
                let deleteStartime =mops[k].upTrainTime.trim().split(" ")[0] +" "+ starTime.split(":")[0]+':'+starTime.split(":")[1]
                mops[k].startTime =starTime.split(":")[0]+':'+starTime.split(":")[1]
                mops[k].endTime = ednTime.split(":")[0]+':'+ednTime.split(":")[1]
                mops[k].deleteStartime = deleteStartime
                if(mops[k].lateState ==null){
                  mops[k].lateState = '--'
                }
            }
          }
            
          let is_showSchedule = false 
          if(num==7){
            isHasSchedule = false   //显示添加按钮
            is_showSchedule = true
          }
          if(num==6 && currentTrip['over'].length>0){
            isHasSchedule = false
            is_showSchedule = true
          }

          if(num<=6 && currentTrip['over'].length>0){
              isOver = true
          }else{
              isOver = false
          }
          
          that.setState({
            currentTrip: currentTrip,
            list_rquser:list_rquser,
            isHasSchedule:isHasSchedule,
            isOver:isOver,
            isShowSchedule:is_showSchedule
          })
        } else {
          rqi = [];
          let currentTriplist = [];
          that.setState({
            scheduleNum: '您今日还未添加任何行程',
            isHasSchedule: false,
            currentTrip: currentTriplist,
            rqr: [],
            isOver:false,
            isShowSchedule:true
          })
          //this.calendarEvent.getAllArr();
          //this.init();
        }
      }else{
        that.setState({
          thisPage:false,
          noPageText:res.msg
        })
      }
    })
    .catch(res => {
      Taro.showToast({
        title: res.message,
        icon: 'none',
        duration:1000,
      })
    })
  }

  // 日期
  NewDate = (i) => {
    var weekDayArr=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"]
    var myDate = new Date()
    var milliseconds=myDate.getTime()+1000*60*60*24*i //当i为0代表当前日期，为1时可以得到明天的日期，以此类推
    var newMyDate = new Date(milliseconds)
    var weekDay=newMyDate.getDay()
    var month ="0" + (newMyDate.getMonth() + 1)
    var day ="0" + newMyDate.getDate()
    return  month.substring(month.length - 2, month.length) + "月" + day.substring(day.length - 2, day.length) + '日' +" "+weekDayArr[weekDay]

  }

  /*
   * 添加行程 弹框
   */
  toAddTrain = (e) =>{

    Taro.navigateTo({
      url: '../add/index?sourcefrom='+addTrip_sourcefrom_enum.addTrain_trainSearch
    })
  }

  render () {
    var {currentTrip,isSpecial,list_rquser,isOver,showPag,thisPage,noPageText,isRequest,today,tormor,isShowSchedule } = this.state
    let current_none = !isNotEmptyObj(currentTrip) || currentTrip == [] || currentTrip == {}
    if(current_none){
      currentTrip = null
    }
    //let page_style = is_show_Schedule ? '' : 'background:#f8f8f8'
    // let is_show_Schedule = this.get_isShowAddSchedule()
    let keys = ["current", "today", "tomorrow", "afterTomorrow", "longer", "overLess", "over"]
    let isWord = [false,false,false,false,false,false]
    let wordF = false
    const trip =  keys.map((item,index) => {
      if(!wordF){
        if(currentTrip && currentTrip[item].length>0){
          isWord[index] = true
          wordF = true
        }
      }
      
      return <View key={'item_'+index} className={item == 'current' ? 'scheduleContent1' : 'scheduleContent'}>
        {
           item == 'current' && currentTrip && currentTrip[item].length>0 ?
          <View className='special'>
            <View className='line'></View>
            <View className='type'>              
             <View className='name'>进行中</View>
           </View>         
          </View>
          :null
        }
        {
          item == 'today' && currentTrip &&currentTrip[item].length>0 ?
          <View className='normal'>
            <View className='line'></View>          
            <View className='name'>今天</View>         
            <View className='date1'>{today}</View>       
          </View>
          :null
        }
        {
          item == 'tomorrow' && currentTrip && currentTrip[item].length>0 ?
          <View className='normal'>
            <View className='line'></View>          
            <View className='name'>明天</View>         
            <View className='date1'>{tormor}</View>       
          </View>
          :null
        }
        {
          item == 'afterTomorrow' && currentTrip && currentTrip[item].length>0 ?
          <View className='normal'>
            <View className='line'></View>          
            <View className='name'>后天</View>         
            <View className='date1'>{yesdays}</View>      
          </View>
          :null
        }
        {
          item == 'longer' && currentTrip && currentTrip[item].length>0 ?
          <View className='special'>
            <View className='line'></View>
            <View className='type'>              
             <View className='name'>更久以后</View>
           </View>         
          </View>
          :null
        }
        {
          item == 'overLess' && currentTrip && currentTrip[item].length>0 ?
          <View className='special'>
            <View className='line'></View>
            <View className='type'>     
            <View className='name'>刚刚结束</View>
            </View>         
          </View>
          :null
        }
        
        { 
          item != 'over' && currentTrip && currentTrip[item].length>0 ?  currentTrip[item].map((itemData,index1)=>{
            return <View class='scheduleBg' key={"itme_"+index1}
                data-id={itemData.id} 
                data-date={itemData.date} 
                data-from={itemData.startStation} 
                data-to={itemData.endStation} 
                data-train={ itemData.trainNo}>
              {
                item == 'today' || item == 'tomorrow' || item == 'afterTomorrow' ?
                null
                :<View className="tarin_time">{itemData.date}</View>
              }
           
            <View className="contan_box" className={item == 'overLess' ? 'contan_box cr' : 'contan_box'}>
            {/* <View className='deteleAll' id='detele' onClick={this.deleteSchedule} data-scheduleid={itemData.id} data-train={ itemData.train} data-dept={itemData.upStationName} data-date={itemData.deleteStartime}>
                    <Image   className='dimg' src={'https://imgczt.weitaikeji.com/h5/taroVega/czt_v2/schedule/detele.png'} ></Image>
              </View>  */}
              <View class='trainNo'>
                <View class='leftBox'>
                  {itemData.scheduleType == 12 && <View className='type'>接</View>}
                  {itemData.scheduleType == 13 && <View className='type'>送</View>}             
                  
                  {
                    item=='current' ? 
                    <Text className='tr'>{itemData.fullRemainTime}</Text>
                    :
                    <Text className={item=='overLess' ? 'or':'tr'}>{itemData.lengthTime}</Text>
                  }
                  
                </View>
                <View className='rightBox1'>
                  {
                    item == 'afterTomorrow' || item == 'longer' ?
                    <View class='todays'>{itemData.startLessTime}</View>
                    :null
                  }
                  {
                    item == 'tomorrow' || item=='today' ?
                    <View class={['todays'+' '+(itemData.flag && itemData.lateState.indexOf('晚点') != -1?'bitlate':'')+' '+(itemData.flag && itemData.lateState.indexOf('正点') != -1?'bitearlier':'')+' '+(itemData.flag && itemData.lateState.indexOf('早点') != -1 ?'Punctuality':'')]}>{itemData.flag ?(itemData.lateState == '--' ? ''+(itemData.startLessTime == '后出发' ? '1分钟后出发' : itemData.startLessTime) : itemData.lateState) : (itemData.startLessTime == '后出发' ? '1分钟后出发' : itemData.startLessTime)}</View>
                    :null
                  }
                  {
                    // item == 'current' &&
                    // <View class={["today"+' '+(itemData.lateState.indexOf('晚点') != -1 ?'bitlate':'')+' '+(itemData.lateState.indexOf('正点') != -1 ?'bitearlier':'')+' '+(itemData.lateState.indexOf('早点') != -1 ?'Punctuality':'')]}>{itemData.lateState == '--' ? '' : itemData.lateState+'·'}下一站{itemData.nextStation}</View>                 
                  }
                  {
                    item == 'overLess' &&
                    <View class='todays oldtaodst'>已结束</View>
                  }
                </View>

            </View>
            <View class='stationContent'>
                <View class={item == 'overLess'?'stationNew':'stationTime'}>  
                  <Text className="bonld">{itemData.startTime}</Text>
                  <Text className='stationLast' style='margin-left: 30rpx;'>{itemData.upStationName}站</Text>
                </View>
                <View class='wholeTime'>
                  <View class={item == 'overLess'?'lineArNew':'lineArrow'}>{itemData.train}</View>
                  <Image className="jiantou" src={'https://imgczt.weitaikeji.com/h5/taroVega/v1/usercenter/zhixiang.png'}></Image>
                  <Text className={item=='overLess'?'tranType':''}>{itemData.trainType == '--' ? '' : itemData.trainType}</Text>
                </View>
                <View class={item == 'overLess'?'stationNew':'stationTime'}>  
                  <View style='text-align:right;position:relative;'><Text className="bonlds">{itemData.endTime}</Text></View>
                  <Text className="stationLast" style='text-align:right;margin-right: 30rpx;'>{itemData.downStationName}站</Text>
                </View>
            </View>
            {/* <View className='deteleAll' id='detele' onClick={() => {this.deleteSchedule(itemData.id)}} data-scheduleid={itemData.id} data-train={ itemData.train} data-dept={itemData.upStationName} data-date={itemData.deleteStartime}> */}
            <View className='deteleAll' onClick={() => {this.deleteSchedule(itemData.id)}}>
                <Image   className='dimg' src={'https://imgczt.weitaikeji.com/h5/taroVega/czt_v2/schedule/detele.png'} ></Image>
                <Text className='delete-text'>删除</Text>
            </View>
        </View>
      </View>
          })
          :null
        }
      </View>
    })
    return (     
          
      <View className={ isShowSchedule ? 'newindex index_add_snew' : 'newindex'}>
          {thisPage && isRequest && <View className='thisPage'>     
            <View className={ isShowSchedule ? 'index index_add_schedule' : 'index'}>
              {trip}
             {isShowSchedule && <View className='default'>
                  <Image className='defaultImg' src={'https://imgczt.weitaikeji.com/h5/taroVega/czt_v1/trip/xingcheng_img.png'}></Image>
                  <View className='defaultContent'>
                    <Text className='tet1'>暂无行程</Text>
                    <Text className='tet2'>添加行程，让出行更效率更贴心</Text>
                  </View>
              
                  <View className='addNow' onClick={this.toAddTrain}>
                      <Text className='add_now_text'>添加行程</Text>
                  </View>
              </View>}
   
              {(isShowSchedule && !isOver) && <View className='bottom'>-我也是有底线的-</View>}
              {!isShowSchedule &&  <View id='ATtrain2' className="addBtnImg" onClick={this.toAddTrain}></View>}

           </View>
         </View>}

        {!thisPage && <View> 
          <noPage hidden noPageText={noPageText} onInitData={this.initData}></noPage>
        </View>}
    </View>
    )
  }
}