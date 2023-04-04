import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import {get as getGlobalData } from '../../../service/config'
import api from '../../../service/api'
import {navigateToMiniApp, addTrip_sourcefrom_enum, queryParams,isNotEmptyObj,commonCollect, isEmptyObj, toast,getUeridAddKont, appIdJumpEnum,getCacheByKey,setCacheByKey} from '../../../utils/common'
import './index.scss'
import CustomButton from '../../../components/customButton/customButton'
import {auth_need_enum, request_UserInfo, get_userId, get_userName, auth_enum, is_authed_mobile, is_authed_user,get_userInfo} from '../../../utils/authUtil'
import shareUtil from '../../../utils/shareUtil'
import TrainUtil from '../../../service/apiCommon'
import noPage from '../../../components/noPage/noPage'
import ExpectMsg from '../../../components/expectMsg/index'
let rqi = [];
let cale = [];

export default class Index extends Component {
  constructor(){
    super(...arguments)
    this.state={
      thisCity: '',
      currentTrip: [],
      list_rquser:[],
      hidden: "1000",
      weather: {},
      scheduleNum: '',
      isHasSchedule: true,
      isOver:false,
      flog3: 'xianshi',
      windowHeight:'938rpx',
      listR: {},
      toDay: '',
      BGS: 'BGH',
      SGS: 'SGH',
      inToViewM: 'inToViewM',
      rqr: [],
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      env_type: Taro.getEnv(),
      shareData: '',
      sprDte:{
        wday:'',
        timeCC:'',
        weekDay:'',
      },
      showPag:false,//底部弹框
      scanHidden: true,
      lifestyle_id:'2019050564342740', //生活号ID
      no_wars:true,
      isSpecial:true,//行程列表
      today:null,
      tormor:null,
      yesdays:null,
      no_wars:true,
      sruedata:{},
      path: this.$router.path,
      user12306:'', //12306账号
      user12306Ps:'',//12306密码
      enterTime:0,//进入页面的时间
      isMshow:false,//登录返回后进行同步
      noPageText:'加载失败',
      thisPage:true, //是否显示重新加载页面  true不显示  false显示
      shareImg:'', //微信分享图片
      shareImg1:'', //支付宝分享图片
      shareInfo:null, //分享信息
      isShowShareDlg:false, //false 不展示分享弹框
      shareItem:null, //点击分享后把信息存起来，用于分享
      isDelete:false,
      isRequest:false,
      isShowShare:false,
      state:0,
      isDialog: false,//弹框
      dialogInfo:null,
    }
    this.authType = auth_need_enum.auth_mobile_user
  }  

  config = {
    navigationBarTitleText: '智能行程',
    navigationBarBackgroundColor: '#0095ff',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true, 
    backgroundTextStyle: "dark",   // 把显示的文本颜色改成暗色调,亮色的话.你背景不改看不到,因为同色
    backgroundColor:'#f7f7f7' // 页面的背景色
  }

  componentWillMount () {
    console.log(this.$router.params)
      if(this.$router.params && this.$router.params.q){
        console.log(this.$router.params)
        var canshu = decodeURIComponent(this.$router.params.q).split('?')[1]
        let arrQr = canshu.split('&')
        let startTime = arrQr[1].split("=")[1].split("+")[0] + " " +arrQr[1].split("=")[1].split("+")[1]
        let endTime = arrQr[3].split("=")[1].split("+")[0] + " " + arrQr[3].split("=")[1].split("+")[1]
        console.log(arrQr)
        this.setState({
          sruedata:{
            startStation: arrQr[0].split("=")[1],
            startTime: startTime+':00',
            endStation: arrQr[2].split("=")[1],
            endTime: endTime + ':00',
            trainNo: arrQr[4].split("=")[1],
            scheduleType:1,
            type: 'station_mini_app'
          }
        },res=>{
          Taro.setStorageSync("sruedata",this.state.sruedata)
        })
      }
      getUeridAddKont() //添加中国结
      this.getDialogInfo()
  }

  componentDidMount () {
   
  }

  componentWillUnmount () { 
    
  }

  componentDidShow () {
    var that = this
    Taro.setNavigationBarTitle({
      title: '智能行程'
    })

    that.initData() 
    shareUtil.loadShareBaseData(false).then((res)=>{})    
  } 

  async initData(){
    let that=this
    let getNetworkType = await Taro.getNetworkType()

   
    if(getNetworkType.networkType=='none'|| getNetworkType.networkType=='NOTREACHABLE'){
      that.setState({
        noPageText:'网络异常，请重试',
        thisPage:false
      })
      console.log('getNetworkType11')
    }else{
      console.log('getNetworkType12222')
      that.setState({
        noPageText:'',
        thisPage:true,
        enterTime:(new Date()).getTime()
      },()=>{
        commonCollect(this.state.path,'行程首页',2,'','','',(new Date()).getTime(),'')
        if(Taro.getEnv() =='ALIPAY') { //支付宝小程序 关注生活号
          Taro.canIUse('lifestyle')
        }     

        this.setState({
          today:this.NewDate(0),
          tormor:this.NewDate(1),
          yesdays:this.NewDate(2),
        },res =>{
          that.getDateTime()
          //that.getWeatherData() //获取小程序站点天气信息
        })
        if(!is_authed_mobile() || !is_authed_user()){//没有授权手机号 或用户信息
          this.loadData_user()
          that.setState({
            user12306: '',
            user12306Ps:'',
            scheduleNum: '您还未登录',
            isHasSchedule: false,
            currentTrip: [],
            thisPage:true,//展示空数据样式
            isRequest:true//展示空数据样式
          })
        }else{
          if(Taro.getStorageSync('sruedata') && Taro.getStorageSync('sruedata')!=''){
            that.addTrip(Taro.getStorageSync('sruedata'))
          }else{
            //行程
            that.currentTrip()
          }
          this.keepMy12306()
        }
        console.log('12306登录页面回退按钮设置isMshow值'+Taro.getStorageInfo('isMshow'))
        if(Taro.getStorageSync('isMshow') && Taro.getStorageSync('isMshow')==true){
          this.keepMy12306()
        }
      })
    }
  } 

  keepMy12306(){
    let that = this
    api.get(getGlobalData('domain_galaxy') +'/user12306/keepLoginStatus',{
      userId:get_userId(),
      mobile: get_userInfo().mobile,
    }).then((res) => {
      if(res.data.code == '0'){
        if(res.data.data){ //有值（有账户跳转弹框
          that.setState({
            user12306: res.data.data.username,
            user12306Ps: res.data.data.password
          },res=>{
            if(Taro.getStorageSync('isMshow') && Taro.getStorageSync('isMshow')==true){
              that.synchronization()
            }
          })  
          // if(Taro.getStorageSync('delete_same12306') && Taro.getStorageSync('delete_same12306')==1){
          //   that.setState({
          //     user12306: '',
          //     user12306Ps:''
          //   })  
          // }else{
          //   that.setState({
          //     user12306: res.data.data.username,
          //     user12306Ps: res.data.data.password
          //   },res=>{
          //     if(Taro.getStorageSync('isMshow') && Taro.getStorageSync('isMshow')==true){
          //       that.synchronization()
          //     }
          //   })  
          // }
        }else{
          that.setState({
            user12306: '',
            user12306Ps:''
          })
        }
        
      }
    })
  }

  componentDidHide () { 
    commonCollect(this.state.path,'行程首页',3,'','','',this.state.enterTime,(new Date()).getTime())
    this.setState({
      showPag:false,
    })
  }

  onShareAppMessage(res){
    let that =this 
    var path = this.$router.path
    var customShare = {}
    if(res.from == 'menu'){
      return shareUtil.onShareAppMessage(1, '', customShare) 
    }


    //车次详情
    let {id,date,
      startStation,
      start_time,
      endStation,
      arrive_time,
      trainNo}=that.state.shareItem
    path = 'pages/station/pages/tripDetailsV2/tripDetailsV2' // 通过 path,检索分享数据

    if(isNotEmptyObj(date)){
      if(date.indexOf('日')){
        date = date.split('日')[0]+'日'
      }else{
        date = date
      }
    }

    // debugger
    // 6月25日武汉到上海G578行程单
    let title = date+" "+startStation+"到"+endStation+" "+trainNo+"行程单"
    let params = {
      trainNo:trainNo,
      scheduleId: id,
      title: title
    }
    customShare =  {
      aliTitle: title,
      wetchatTitle:title,
    }

    path = path+"?"+queryParams(params)
    
    that.closeDlg()

    return shareUtil.onShareAppMessage(2, path, customShare) 
  }

  //下拉事件
onPullDownRefresh(){
  this.initData()
  // 接口请求完毕后隐藏两个loading , 标题和下拉区域
  Taro.stopPullDownRefresh();
}

  getDateTime(){ //获取当前时间  周几
    let timeCC = (new Date(new Date().getTime()).getMonth() + 1) + '月' + new Date(new Date().getTime()).getDate() + '号';
    let weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][new Date(new Date().getTime()).getDay()];
    this.setState({
      sprDte:{
        timeCC:timeCC,
        weekDay:weekDay
      }
    })
  }

  //获取所在城市
  getCity(){
    let that = this
    Taro.getLocation({
      type: 'gcj02', //返回可以用于Taro.openLocation的经纬度
      success(res){
        let latitude = res.latitude
        let longitude = res.longitude
        api.get(getGlobalData('domain_station') + '/Gaode/getCityForLngLat',{
          lnglat: latitude + ',' + longitude
        }).then((data)=>{
          that.setState({
            thisCity: data.data.cityname.split('市')[0]
          }, () => {
            that.getWeatherData()
          })
          
        })
      },
      fail() {
      
      }
    })
  }

  get_isShowAddSchedule(){
    var is_show = false
    const {currentTrip} = this.state
    if(isEmptyObj(currentTrip) && currentTrip.length<=0){//无行程
      is_show = true
    }else{
      let list_rquser = Object.keys(currentTrip)
      let num = 0
      for(var i=0; i<list_rquser.length;i++){
        let mops = currentTrip[list_rquser[i]]
        if(mops.length==0){
            num++
        }
      }
      if(num==7){
        is_show = true   //显示添加按钮
      }
      if(num==6 && isNotEmptyObj(currentTrip['over']) && currentTrip['over'].length>0){
        is_show = true   //显示添加按钮
      }
   }
    return is_show
  }

  //当前行程
  currentTrip(uId){
    let that = this
    if(that.state.isDelete){ 
      that.setState({
        isDelete:false
      })
    }else{
      toast()
    }
    api.post(getGlobalData('domain_galaxy') + '/schedule/queryScheduleListWithXiaochangNew',{
    // api.post('http://192.168.100.19:3000/mock/57/galaxy/schedule/queryScheduleListWithXiaochangNew',{
    //api.post('http://192.168.100.96:8080/galaxy/schedule/queryScheduleListWithXiaochangNew',{
      userId: get_userId()
    },'application/json;charset=UTF-8',false).then((res)=>{
      Taro.hideLoading();
      if(res.data.code=='0'){
        that.setState({
          isRequest:true
        })
        if (res.data.data != null && res.data.data != '') {
            let currentTrip = res.data.data
            let list_rquser = Object.keys(currentTrip)
            let num = 0
            let {isHasSchedule , isOver} = this.state
            for(var i=0; i<list_rquser.length;i++){
              let mops = currentTrip[list_rquser[i]]
              if(mops.length==0){
                  num++
              }
              for(var k=0;k<mops.length;k++){
                  let starTime = mops[k].schedule.startTime.trim().split(" ")[1]
                  let ednTime = mops[k].schedule.endTime.trim().split(" ")[1]
                  let deleteStartime =mops[k].schedule.startTime.trim().split(" ")[0] +" "+ starTime.split(":")[0]+':'+starTime.split(":")[1]
                  mops[k].schedule.startTime =starTime.split(":")[0]+':'+starTime.split(":")[1]
                  mops[k].schedule.endTime = ednTime.split(":")[0]+':'+ednTime.split(":")[1]
                  mops[k].schedule.deleteStartime = deleteStartime
                  if(mops[k].lateState ==null){
                    mops[k].lateState = '--'
                  }
              }
            }
          if(num==7){
            isHasSchedule = false   //显示添加按钮
            console.log('878888888888888888888888888888888888888888888888888')
          }
          if(num==6 && currentTrip['over'].length>0){
            console.log('878888888888888888888888888888888888888888888888889')
            isHasSchedule = false
          }

          if(num<=6 && currentTrip['over'].length>0){
              isOver = true
          }else{
              isOver = false
          }
          console.log(num+','+currentTrip['over'].length)
          console.log('行程历史按钮弹框！！！！！！！！！！！！！！！！！！！！！！！！！！！！！'+isHasSchedule+isOver)
          that.setState({
            currentTrip: currentTrip,
            list_rquser:list_rquser,
            isHasSchedule:isHasSchedule,
            isOver:isOver
          })
        } else {
          rqi = [];
          let currentTriplist = [];
          that.setState({
            scheduleNum: '您今日还未添加任何行程',
            isHasSchedule: false,
            currentTrip: currentTriplist,
            rqr: [],
            isOver:false
          })
          //this.calendarEvent.getAllArr();
          //this.init();
        }
      }else{
        that.setState({
          thisPage:false,
          noPageText:res.data.msg
        })
      }
    },(e)=>{
       console.log('----- queryScheduleListWithXiaochangNew e:')
       console.log(e)
       Taro.hideLoading()
        if(is_authed_mobile() && is_authed_user()){//授权了手机号 用户信息

        }else{
          that.setState({
            scheduleNum: '您还未登录',
            isHasSchedule: false,
            currentTrip: []
          })
        }      
    })
  }

  // 日期
  NewDate (i){
    var weekDayArr=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"]
    var myDate = new Date()
    var milliseconds=myDate.getTime()+1000*60*60*24*i //当i为0代表当前日期，为1时可以得到明天的日期，以此类推
    var newMyDate = new Date(milliseconds)
    var weekDay=newMyDate.getDay()
    var month ="0" + (newMyDate.getMonth() + 1)
    var day ="0" + newMyDate.getDate()
    return  month.substring(month.length - 2, month.length) + "月" + day.substring(day.length - 2, day.length) + '日' +" "+weekDayArr[weekDay]

    // let date = new Date(obj)
    // let m = "0" + (date.getMonth() + 1)
    // let d = "0" + date.getDate()
    // return m.substring(m.length - 2, m.length) + "月" + d.substring(d.length - 2, d.length) + '日';
  }

  /**
   * 去行程详情
   */
  totripDetail(e){
    commonCollect(this.state.path,'行程首页',1,'',3,103009,'','')
   
    let dataset = e.currentTarget.dataset
    let id = dataset.id

    if(isNotEmptyObj(id)){
      var date = ''
      if(isNotEmptyObj(dataset.date)){
        if(dataset.date.indexOf('日')){
          date = dataset.date.split('日')[0]
        }else{
          date = dataset.date
        }
      }

      let from = dataset.from
      let to = dataset.to 
      let trainNo = dataset.train

      let jump_params = {
        scheduleId: id,//行程id
        trainNo:trainNo, //车次号
        from_station:from,//出发站
        to_station:to,//到达站
        dept:date// 7月25日 出发日期
      }
      Taro.navigateTo({
        url: '../../station/pages/tripDetailsV2/tripDetailsV2?'+queryParams(jump_params)
      })
    }
  }

  /*
   * 添加行程 弹框
   */
  toAddTrain(e) {
    if(e && e == 1){
      this.setState({
        showPag:false,
      })
    }else{
      commonCollect(this.state.path,'行程首页',1,'',3,103010,'','')
      // this.keepMy12306()
      this.setState({
        showPag:true,
      })
    }
  }

  deletshow() { //关闭弹框
    commonCollect(this.state.path,'行程首页',1,'',3,103015,'','')
    this.posfix()
  }

  posfix(e){
    commonCollect(this.state.path,'行程首页',1,'',3,103015,'','')
    let that = this
    that.setState({
      showPag:false,
    })
  }

  Manualaddition(e) { //添加行程下,车次查询
    e.stopPropagation()
    let that = this
    that.setState({
      showPag:false,
    })
    commonCollect(this.state.path,'行程首页',1,'',3,103013,'','')
    Taro.navigateTo({
      url: '../../station/pages/add/add?sourcefrom='+addTrip_sourcefrom_enum.addTrain_trainSearch
    })
  }


  synchronization (){ //同步12306页面
    //e.stopPropagation()
    commonCollect(this.state.path,'行程首页',1,'',3,103014,'','')
    //同步接口
    let that = this
    that.setState({
      showPag:false
    })
    if(that.state.user12306!=''){
      Taro.showLoading({ //显示loading
        title: '加载中',
        mask:true
      })
        let username = this.state.user12306
        let password = this.state.user12306Ps
        api.post(getGlobalData('domain_galaxy') + '/m12306/syncScheduleV2',{
          username :username,
          password :password
        }).then((res)=>{
          Taro.hideLoading()
          if(res.data.code == 0){ //同步成功 数据进入
            Taro.hideLoading()
            that.currentTrip()
            Taro.setStorageSync('isMshow','')
            Taro.showToast({
              title: res.data.data.msg,
              icon: 'none',
              duration: 2000,
            })       
          }else{ //失败
            Taro.hideLoading()
            Taro.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000,
            })
            return 
          }
        }).catch(function(error) {
          // 处理 getJSON 和 前一个回调函数运行时发生的错误
          Taro.hideLoading()
          Taro.showToast({
            title: '同步超时，请重试',
            icon: 'none',
            duration: 1000,
          }) 
          console.log('发生错误！12312', error+123);
          })
        return
    }
    Taro.navigateTo({
      url:'../../mine/pages/bindStations/bindStations'
    })
  }

  delet(e) {
    e.stopPropagation()
    let index = e.currentTarget.dataset.index;
    if (this.state.hidden == index) {
      this.setState({
        hidden: 1000
      })
      return
    }
    this.setState({
      hidden: index
    })
  }

    //扫码车票二维码
    scanTicket(e){
      console.log('------- scanTicket 扫码车票二维码')
      e.stopPropagation()
      commonCollect(this.state.path,'行程首页',1,'',3,103012,'','')
      let that = this
      that.setState({
        showPag:false,
      })

      /// --------------------- 
      Taro.scanCode({
        success(res) {
          let code = res.result
          TrainUtil.request_scanTicket(code, addTrip_sourcefrom_enum.addTrain_scanTicket).then((jump_params)=>{
            let jumpUrl = '../../station/pages/lateQueryResults/index?'+queryParams(jump_params)
            console.log('跳转车次结果页：'+jumpUrl)
            Taro.navigateTo({
              url: jumpUrl
            })
          },(e)=>{

          })
        },
        fail(res) {
          Taro.showToast({
            title:'扫描识别失败',
            icon: 'none',
            duration:1000,
          })
        },
        complete(res) {}
      })
    }

  share(e){
    e && e.stopPropagation()
    let that=this
    commonCollect(that.state.path, '行程首页',1,'',3,103432, '', '')
    let pages=Taro.getCurrentPages()
    toast()

    let {id,date,dept:startStation,to:endStation,train:trainNo,time:lengthTime,starttime:start_time,arrivetime:arrive_time} = e.currentTarget.dataset
    let tripInfoJson={
      str1: date,
      str2: startStation,
      str3: start_time,
      str4: endStation,
      str5: arrive_time,
      str6: trainNo,
      str7: lengthTime.replace('全程',''),
    }

    
    let path='pages/station/pages/tripDetailsV2/tripDetailsV2'

    shareUtil.loadShareBaseData(true,path,tripInfoJson,false).then((res)=>{
      console.log(that.state,555555555)
      that.setState({
        shareItem:{
          id,
          date,
          startStation,
          start_time,
          endStation,
          arrive_time,
          trainNo
        },
        isShowShareDlg:true,
      },()=>{
        Taro.hideLoading()
      })
  
      // shareUtil.shareFn.curPage=pages[pages.length-1]
      // shareUtil.shareFn.tripInfoJson=tripInfoJson 
      // shareUtil.shareFn.initShare(null,shareDataItem,path,function(){
      //   // resolve(res)
      //   console.log(that.state,555555555)
      //   that.setState({
      //     isShowShareDlg:true,
      //   })
  
      //   Taro.hideLoading()
      // })
    })
  }

  closeDlg(){
    this.setState({
      isShowShareDlg:false,
    })
  }

  deleteSchedule(e){ //删除行程
    e.stopPropagation()
    
    var that =this
    commonCollect(that.state.path, '行程首页',1,'',3,103431, '', '')
    Taro.showModal({
      title:"",
      content: '确定要删除该行程？',
      cancelText:"否"//默认是“取消”
    }).then(res =>{
      if(res.confirm){
        toast()
        api.post(getGlobalData('domain_galaxy') + '/schedule/deleteRefundScheduleV2',{
          trainNo: e.currentTarget.dataset.train,
          startStation: e.currentTarget.dataset.dept,
          startTime: e.currentTarget.dataset.date,
          scheduleType: 1
        },'',false).then((res)=>{
          that.setState({
            hidden: 1000,
            isDelete:true
          },()=>{
            that.currentTrip()
          })
         
        })
      }else{
        //
      }
    })
  }


  onsuccess(e) {  //关注生活号成功回调

  }

  /* 指路机过来后直接绑定绑定行程 */
  addTrip(add){
    let that = this
    var requestUrl=null
    if(Taro.getEnv() == 'WEAPP'){
      requestUrl='/schedule/addScheduleCZT'
    }else if(Taro.getEnv() == 'ALIPAY'){
      requestUrl='/schedule/addScheduleAli'
    }
    api.post(getGlobalData('domain_galaxy') +requestUrl,add).then((res)=>{
      console.log(res)
      if (res.data.state != '1') {
        Taro.showModal({
          title:'提示',
          content:res.data.msg,
          showCancel: false,
        }).then(res=>{
          Taro.removeStorage({
            key:'sruedata'
          }).then(lo=>{
            that.currentTrip()
          })
        })
      }else {
        //Taro.setStorage({key:'scheduleId',data:res.data.schedule.id})
        Taro.removeStorage({
          key:'sruedata'
        }).then(lo=>{
          that.currentTrip()
        })
      }
  })
}


  toMap(e) {  //有站内导航--跳转
    e.stopPropagation()
    let that = this
    let str = JSON.parse(e.currentTarget.dataset.poiid)
    let stationid = e.currentTarget.dataset.stationid
    let poidlist= []
    for(var i=0;i<str.length;i++){
      poidlist.push(str[i].poiId)
    }
    let poid = poidlist.join(',')
    api.get(getGlobalData('domain_station')+ '/Station/getstationUrl',{stationId:stationid}).then((res)=>{
      if(res.data.data){ //有数据返回  地图H5
        let mar = res.data.data.newMiniMapUrl+'?poiId='+poid
        let marurl = encodeURIComponent(mar)
        Taro.navigateTo({
          url:'../../smartWC/pages/webview/webview?mapUrl='+marurl
        })
      }
    })
  }
 

  // 点击跳转到天气详情页
  gotoWeather(){
    Taro.navigateTo({
      url: '/pages/station/pages/stationWeather/index',
    })
  }

  //跳转调查问卷小程序
  toqusetion(){
    console.log('跳转调查问卷小程序 toqusetion')
    navigateToMiniApp({appType: appIdJumpEnum.wenJuan, jumpAppid:null,path:'pages/stationQuestion/stationQuestion'})
  }

  //跳转历史行程
  goHistoryTrip(){
    commonCollect(this.state.path,'行程首页',1,'',3,103011,'','')
    Taro.navigateTo({
      // url: '../../mine/pages/history/history'  
      url: '../../mine/pages/newHistory/newHistory'      
    })
  }

   // 加载用户信息
   loadData_user(){
    var that = this
    request_UserInfo().then((data)=>{
       that.reloadUser(data)
       // 告诉子组件： 刷新 授权组件里的授权状态：让其现在对应授权状态click逻辑
      setTimeout(()=>{
        // console.log('setTimeout -> that.authButton: ')
        // console.log(that.authButton)
        that.authButton && that.authButton.reloadAuthStatus() // 刷新子组件 状态
        that.addButton && that.addButton.reloadAuthStatus()
      },1000) //100毫秒延迟
     }, (e)=>{
      console.log('request_UserInfo 个人中心 fail')
      that.setState({
        scheduleNum: '您还未登录',
        isHasSchedule: false,
        currentTrip: [],
        thisPage:true,//展示空数据样式
        isRequest:true//展示空数据样式
      })
     })
  }

   /**
   * 点击授权按钮组件（当开始未获取到授权状态level ）：点击-> 重试请求用户信息成功 => 执行其他操作： 刷新用户状态 
   * this.props.onTry_userSuccess_Action(user)
   */
  reloadUser(userInfo){
    var that = this
    if(is_authed_mobile(userInfo) && is_authed_user(userInfo)){
      if(Taro.getStorageSync('sruedata') && Taro.getStorageSync('sruedata')!=''){
        that.addTrip(Taro.getStorageSync('sruedata'))
      }else{
        //行程
        that.currentTrip()
      }
    }
}

refAuthButton(node){
  this.authButton = node // `this.cat` 会变成 `Cat` 组件实例的引用
 }

 refAddButton(node){
  this.addButton = node 
 }

 actionClick(res){
  res && res.stopPropagation && res.stopPropagation()
 }

 //电子客票
 toEticket(e){
   e.stopPropagation()
   Taro.navigateTo({
    url: '/pages/station/pages/eTicket/index'
   })
 }

  //取消弹框
  cancel(item, event){
    this.setState({
      isDialog:false
    })
    item.isActive = false //点击后，更新状态为非激活状态
    setCacheByKey('preDialogInfo2', item)
  }

  //弹框消息
  getDialogInfo(){
    let that = this
    api.get(getGlobalData('domain_miniapp') + '/cxt2/home/loadHomePopupWindowMessage', {
      messageType:2
    }, 'none').then((res) => {
        Taro.hideLoading()
        if (res.data.code == 0) {  
          if(res.data){
            let data = res.data.data || null
            if(data.length>=1){
              let jumpItem = data[0] 
              let cacheCurrentBlock = ()=>{
                jumpItem.isActive = true
                setCacheByKey('preDialogInfo2',jumpItem)
                that.setState({
                  isDialog:true,
                  dialogInfo: jumpItem,
                }) 
              }
              let preDialogInfo = getCacheByKey('preDialogInfo2') || null


              let pre =  Object.assign({}, preDialogInfo||{})
              pre.isActive = null
              let cur = Object.assign({}, jumpItem||{})
              cur.isActive = null

              let pre_str = JSON.stringify(pre)
              let curr_str = JSON.stringify(cur)
              if(preDialogInfo){
                if(pre_str != curr_str){
                  console.log(44444, ' ----- 2.2 缓存了之前，但是不同本次活动 缓存新的')
                  cacheCurrentBlock()
                  return
                }else{// pre == curr
                  if(preDialogInfo.isActive == true){
                    console.log(55555, ' ----- 2.1.缓存了之前，同本次活动, 但是未失效, 任然弹框')
                    cacheCurrentBlock()
                    return
                  }
                }
              }else{
                console.log(333333, ' ----- 1.无缓存, 缓存新的')
                cacheCurrentBlock()
                return
              }
            
            }else{
              that.setState({
                isDialog:false,
              })
            }
          }
          
          
        }
    }).catch(() => {
        Taro.hideLoading()
    })
  }

  onDialogClick(item, event){
    item.isActive = false //点击后，更新状态为非激活状态
    setCacheByKey('preDialogInfo2', item)
    commonCollect(this.state.path, '行程首页',1,'',3,item.elementId, '', '')
    jumpUtil.jumpService(item)
  }

  //点击广告banner跳转
  toAd(){
    Taro.navigateTo({
     url: '/pages/station/pages/eTicket/index'
    })
  }

  render () {
    var {currentTrip,isSpecial,list_rquser,isOver,showPag,thisPage,noPageText,shareImg,isShowShareDlg,isRequest,user12306,isDialog, dialogInfo} = this.state
    let current_none = !isNotEmptyObj(currentTrip) || currentTrip == [] || currentTrip == {}
    if(current_none){
      currentTrip = null
    }
    //let page_style = is_show_Schedule ? '' : 'background:#f8f8f8'
    let is_show_Schedule = this.get_isShowAddSchedule()
    let keys = ["current", "today", "tomorrow", "afterTomorrow", "longer", "overLess", "over"]
    const trip =  keys.map((item,index) => {
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
                onClick={this.totripDetail} 
                data-id={itemData.schedule.id} 
                data-date={itemData.date} 
                data-from={itemData.schedule.startStation} 
                data-to={itemData.schedule.endStation} 
                data-train={ itemData.schedule.trainNo}>
              {
                item == 'today' || item == 'tomorrow' || item == 'afterTomorrow' ?
                null
                :<View className="tarin_time">{itemData.date}</View>
              }
           
            <View className="contan_box" className={item == 'overLess' ? 'contan_box cr' : 'contan_box'}>
              <View class='trainNo'>
              <View class='leftBox'>
                {/* <Image src={"https://www.cx9z.com/h5/vegaImg{{item.trainSchedule.scheduleType==1?'/travel/icon_cheng.png':'/travel/icon_jie.png'}}"}></Image> */}
                {/* <Image src="https://www.cx9z.com/h5/taroVega/v1/usercenter/chengche.png"></Image>
                <Text>{item.trainSchedule.startStation}站乘车</Text> */}
                {itemData.schedule.scheduleType == 12 && <View className='type'>接</View>}
                {itemData.schedule.scheduleType == 13 && <View className='type'>送</View>}             
                {/* <Image className='img' src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v1/userCenter/icon_time.png'}></Image> */}
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
                 // <View class="today">{itemData.startLessTime}</View>
                }
                {
                   item == 'tomorrow' || item=='today' ?
                   <View class={['todays'+' '+(itemData.flag && itemData.lateState.indexOf('晚点') != -1?'bitlate':'')+' '+(itemData.flag && itemData.lateState.indexOf('正点') != -1?'bitearlier':'')+' '+(itemData.flag && itemData.lateState.indexOf('早点') != -1 ?'Punctuality':'')]}>{itemData.flag ?(itemData.lateState == '--' ? ''+(itemData.startLessTime == '后出发' ? '1分钟后出发' : itemData.startLessTime) : itemData.lateState) : (itemData.startLessTime == '后出发' ? '1分钟后出发' : itemData.startLessTime)}</View>
                   :null
                }
                {
                  item == 'current' &&
                  <View class={["today"+' '+(itemData.lateState.indexOf('晚点') != -1 ?'bitlate':'')+' '+(itemData.lateState.indexOf('正点') != -1 ?'bitearlier':'')+' '+(itemData.lateState.indexOf('早点') != -1 ?'Punctuality':'')]}>{itemData.lateState == '--' ? '' : itemData.lateState+'·'}下一站{itemData.nextStation}</View>                 
                 // <View class="today">{itemData.startLessTime}</View>
                }
                 {
                  item == 'overLess' &&
                  <View class='todays oldtaodst'>已结束</View>
                 // <View class="today">{itemData.startLessTime}</View>
                }
                {/* {
                  itemData.lateState =='正点' && <View class="today Punctuality">{itemData.lateState}·下一站{itemData.nextStation}</View>
                }
                {
                  itemData.lateState =='晚点' && <View class="today bitlate">{itemData.lateState}·下一站{itemData.nextStation}</View>
                }
                {
                  itemData.lateState =='早点' && <View class="today bitearlier">{itemData.lateState}·下一站{itemData.nextStation}</View>
                }   */}
              </View>
              {/* <View class='rightBox' onClick={this.delet} data-index={index}>
                <Image src="https://www.cx9z.com/h5/taroVega/v1/usercenter/icon_detele.png" data-station={item.trainSchedule.startStation} data-datetime={item.trainSchedule.staTimeDate} data-datetime1={item.trainSchedule.staTimeHour} data-id={item.trainSchedule.id} data-trainno={item.trainSchedule.trainNo} onClick={this.delectSchedule}></Image>
                <Button id="shar" className="share" data-id={item.trainSchedule.id} openType='share'></Button>
              </View> */}
            </View>
            <View class='stationContent'>
              <View class={item == 'overLess'?'stationNew':'stationTime'}>  
                <Text className="bonld">{itemData.schedule.startTime}</Text>
                <Text className='stationLast' style='margin-left: 30rpx;'>{itemData.schedule.startStation}站</Text>
              </View>
              <View class='wholeTime'>
                <View class={item == 'overLess'?'lineArNew':'lineArrow'}>{itemData.schedule.trainNo}</View>
                <Image className="jiantou" src={getGlobalData('domain_h5') + '/h5/taroVega/v1/usercenter/zhixiang.png'}></Image>
                <Text className={item=='overLess'?'tranType':''}>{itemData.trainType == '--' ? '' : itemData.trainType}</Text>
              </View>
              <View class={item == 'overLess'?'stationNew':'stationTime'}>  
                <View style='text-align:right;position:relative;'><Text className="bonlds">{itemData.schedule.endTime}</Text><Text className="posit">{itemData.dateType == 0 ? '' : ('+' + itemData.dateType + '天')}</Text></View>
                <Text className="stationLast" style='text-align:right;margin-right: 30rpx;'>{itemData.schedule.endStation}站</Text>
              </View>
            </View>
            <View class='stationService'>
            {/* {
              itemData.poiid =="" || itemData.poiid =="[]"
              ?
            <View class='serviceItem'>
              <Text style="padding-left:34rpx;box-sizing:border-box;">检票口</Text>
              <View style="padding-left:34rpx;box-sizing:border-box;" class='itemName'>
              <Text className={itemData.schedule.ticketCheck=='' || itemData.schedule.ticketCheck=="--" ? 'check' :''}>
                {itemData.schedule.ticketCheck=='' || itemData.schedule.ticketCheck=="--"?'--':itemData.schedule.ticketCheck}
              </Text>            
              </View>
            </View>
              :
            <View class='serviceItem' onClick={this.toMap} data-stationid={itemData.schedule.startStationId} data-poiid={itemData.poiid}>
              <Text style="padding-left:34rpx;box-sizing:border-box;">检票口</Text>
              <View style="padding-left:34rpx;box-sizing:border-box;" class='itemName'>
              <Text className={itemData.schedule.ticketCheck=='' || itemData.schedule.ticketCheck=="--" ? 'check' :''}>
              {itemData.schedule.ticketCheck=='' || itemData.schedule.ticketCheck=="--"?'--':itemData.schedule.ticketCheck}
              </Text>
              <Image className="serviceImg" src={getGlobalData('domain_h5') + '/h5/taroVega/v1/usercenter/icon_daohang.png'}></Image>
              </View>
            </View>
            } */}
             {/* <View class='serviceItem'>
              <Text style="padding-left:34rpx;box-sizing:border-box;">检票口</Text>
              <View style="padding-left:34rpx;box-sizing:border-box;" class='itemName'>
              <View className={itemData.schedule.ticketCheck=='' || itemData.schedule.ticketCheck=="--" ? 'check' :'newcheck'}>
                {
                  itemData.schedule.ticketCheck=='' || itemData.schedule.ticketCheck=="--"?
                  <Text>--</Text>
                  :
                  <Text className={item=='overLess'?'lessover':''}>{itemData.schedule.ticketCheck}</Text>
                }
              </View>            
              </View>
            </View> */}
              {/* <View class='seatNumber serviceItem'>
                <Text>座位号</Text>              
                <View class='itemName'>      
                {
                  itemData.schedule.seatNumber ==''|| itemData.schedule.seatNumber =='--'?
                  <Text>--</Text>
                  :
                  <Text className={item=='overLess'?'lessover':'lessovers'}>{itemData.schedule.seatNumber}</Text>
                }
                </View>
                  
              </View> */}
              {/* <View class='exit serviceItem'>
                <Text>到达口</Text>
                <Text class='itemName'>{item.trainSchedule.exit==''?'--':item.trainSchedule.exit}</Text>
              </View> */}
               <View class='exit'>
                  <View className='eTicket' onClick={this.toEticket}>
                      <Image className="eimg" src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v2/add/dianzikp.png'} ></Image>
                      <View className='etext'>电子客票</View>
                  </View>
                  <View className='eline'></View>
                {
                  item != 'overLess' &&
                  <View className='deteleAll' id='detele' onClick={this.deleteSchedule} data-scheduleid={itemData.schedule.id} data-train={ itemData.schedule.trainNo} data-dept={itemData.schedule.startStation} data-date={itemData.schedule.deleteStartime}>
                    <Image   className='dimg' src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v2/schedule/detele.png'} ></Image>
                    <View className='dtext'>删除</View>
                  </View> 
                  
                }
                <View id={'ATtrain1_'+index1} className='shareAll' onClick={this.share} data-id={itemData.schedule.id} data-date={itemData.date} data-dept={itemData.schedule.startStation} data-to={itemData.schedule.endStation} data-train={itemData.schedule.trainNo} data-starttime={itemData.schedule.startTime}  data-arrivetime={itemData.schedule.endTime} data-time={itemData.lengthTime} data-xinqi={itemData.date}>
                  <Image className="simg" src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v2/add/icon_sy_fenx.png'} ></Image>
                  <View className='stext'>分享</View>
                </View>
               </View>
            </View>
              </View>
           
            {/* <View class='lineImage'>
              <Image src='https://www.cx9z.com/h5/vegaImg/travel/diw.png'></Image>
            </View> */}
          </View>
          })
          :null
        }
        {/* <View class='stationWeather'>
          <Text className="startTime">{item.trainSchedule.NewSetcitytime}</Text>   
        </View> */}
        
        {/* <View class='stationWeather endWeather' hidden={item.endWeather==null?true:false}>
          <Image src='https://www.cx9z.com/h5/vegaImg/travel/icon_tianqi.png'></Image>
          <Text>{item.endWeather.city} {item.endWeather.temperature}℃ {item.endWeather.weather}</Text>
        </View> */}
      </View>
    })

    return (         
      <View className={ is_show_Schedule ? 'newindex index_add_snew' : 'newindex'}>
        <lifestyle public-id={lifestyle_id}  onFollow={this.onsuccess}/>
        {thisPage && isRequest && <View className='thisPage'>     
          <View className={ is_show_Schedule ? 'index index_add_schedule' : 'index'}>
        {trip}
        <View className='default' hidden={!is_show_Schedule}>
          <Image className='defaultImg' src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v1/trip/xingcheng_img.png'}></Image>
          {/* <View className='tips'>{(flog3==1?'请登录,':'')+'开启你的新路程'}</View> */}
          <View className='defaultContent'>
            <Text className='tet1'>暂无行程</Text>
            <Text className='tet2'>添加行程，让出行更效率更贴心</Text>
          </View>
          
          <View className='addNow'>
            <CustomButton  
                  style='flex:1; width:100%; height:100%;'
                  authType={auth_need_enum.auth_mobile_user}// 需要 传递的  授权类型
                  onTry_userSuccess_Action={this.reloadUser}  // 第一次未拿到授权状态，后，重试获取用户信息成功-> 回调
                  isTryAuthSuccess_dispatchClick={true}
                  onClickAction={this.toAddTrain} // 无需授权或授权成功  点击事件
                  ref={this.refAddButton}> 
                   <Text className='add_now_text'>+添加行程</Text>
                  </CustomButton>
          </View>
        </View>
        {
            isOver? <View className='historyTrip' onClick={this.goHistoryTrip}>
                  {/* <View className='hisLine'></View> */}
                  <Text className='his'>更多历史足迹</Text>
                  <Image className='img' src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v1/userCenter/system_goto.png'}></Image>
                  {/* <View className='hisLine'></View> */}
                </View>
               :
               null
               
        }

        {(!is_show_Schedule && !isOver) && <View className='bottom'>-我也是有底线的-</View>}
        
        {/* <Image onClick={this.toqusetion} className="bannerSta" src="https://www.cx9z.com/h5/taroVega/banner1.png"></Image> */}
       {!is_show_Schedule &&  <View id='ATtrain2' className="addBtnImg" style={'background-image:url('+getGlobalData('domain_h5')+'/h5/vegaImg/travel/icon_add_blue.png)'+';border:none;background-size: 110rpx 110rpx;background-repeat:no-repeat;'}>
              <CustomButton  
                style='flex:1; widht:100%; height:100%;'
                authType={auth_need_enum.auth_mobile_user}// 需要 传递的  授权类型
                onTry_userSuccess_Action={this.reloadUser}  // 第一次未拿到授权状态，后，重试获取用户信息成功-> 回调
                isTryAuthSuccess_dispatchClick={true}
                onClickAction={this.toAddTrain} // 无需授权或授权成功  点击事件
                ref={this.refAuthButton}> </CustomButton>
        </View>}
        {showPag && <View className="showdeom" onClick={this.posfix}>
          <View className="shootShow" >
              <Image className="adImg" onClick={this.toAd} src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v2/add/banner3.png'}></Image>
              <View className='select'>
                <View className="hosAdd" onClick={this.synchronization}>
                  <Image style="width:40rpx,height:40rpx;" src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v1/trip/icon_tongb.png'}></Image>
                  <Text style="margin-left:24rpx">同步12306</Text>
                  {user12306 ?  <Text id='num'>{user12306}</Text>
                    :<View className='htext'>电子客票助手</View>
                  }
                </View>

                <View className="hosAdd" onClick={this.Manualaddition}>
                  <Image style="width:44rpx,height:44rpx;" src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v1/trip/icon_sdtj.png'}></Image>
                  <Text style="margin-left:22rpx">手动添加</Text>
                </View>
                
                <View className="hosAdd" onClick={this.scanTicket}>
                  <Image style="width:36rpx,height:36rpx;" src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v1/trip/icon_smcp.png'}></Image>
                  <Text style="margin-left:26rpx">扫描查票</Text>
                </View>
              </View>

              <View className='cancel'>取消</View>            
          </View>
        </View>}
        <ExpectMsg ref='popExpectMsg'/>
        </View>
        </View>}

        {!thisPage && <View> 
          <noPage hidden noPageText={noPageText} onInitData={this.initData}></noPage>
        </View>}

          {isShowShareDlg&& <View className='dlgMask'>
              <View className='dlgMain'>
                  <View className='dlgBody'>
                    <View className='imgContainer'>
                      <Image className='img' src={shareImg}></Image>
                    </View>
                  </View>
                  <View className='dlgFoot'>
                    <Button className='btn' id='shar' open-type='share'>分享</Button>
                  </View>
                <View id='ATtrain3' className='dlgClose' onClick={this.closeDlg}></View>
              </View>
            </View>
          }
          {isDialog && dialogInfo &&
            <View className='ST_BG'>
              <View className='dcont' onClick={this.onDialogClick.bind(this, dialogInfo)}>
                <Image className='dimg' mode="aspectFill" src={dialogInfo.linkPic}></Image>
              </View>
              <View className='bottom'>
                <Image className='tknow' onClick={this.cancel.bind(this, dialogInfo)} src={getGlobalData('domain_h5') + '/h5/taroVega/czt_v2/add/close.png'}></Image>
              </View>
            </View>
          }
        <View className="canvasContainer1">
          <Canvas className='canvas' id="Canvas" canvasId='Canvas' canvasid='Canvas'></Canvas>
        </View>
        <View className="canvasContainer1">
          <Canvas className='canvas1' id="Canvas1" canvasId='Canvas1' canvasid='Canvas1'></Canvas>
        </View>
      </View>
    )
  }
}