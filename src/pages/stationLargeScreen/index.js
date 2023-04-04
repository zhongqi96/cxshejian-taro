import Taro, { getCurrentInstance } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, Block, ScrollView, Image } from '@tarojs/components'
import {addTrip_sourcefrom_enum, queryParams, isNotEmptyObj} from '@/utils/common'
import Keyboard from '@/components/keyboard/keyboard'
import './index.scss'
import noPage from '@/components/noPage/noPage'
import { func } from 'prop-types';
import API from '@/api/index'

export default class LargeScreen extends Component {

  // config = {
  //   navigationBarTitleText: '车站大屏',
  //   navigationBarBackgroundColor: '#0196ff',
  //   navigationBarTextStyle: 'white',
  //   enablePullDownRefresh: true,
  //   backgroundTextStyle: "dark",   // 把显示的文本颜色改成暗色调,亮色的话.你背景不改看不到,因为同色
  //   backgroundColor:'#f7f7f7' // 页面的背景色
  // }

  constructor() {
    super(...arguments)
    this.state = {

      station: '',
      isNowDate: true, //true为现在，false为历史
      isIcon: true, //true为显示搜索图标和提示文字
      content: '请输入要查询的车次号',
      animation: '', //虚拟键盘_输入光标样式
      flag: true,   //true为乘车车或接车，false为缺省页
      isWait: true,  //true为乘车，false为接车
      pageNum: 1,  //乘车页码
      pageArriveNum: 1, //接站页码
      pageSearchNum: 1, //搜索页码
      waitList: [],  // 乘车列表
      arriveList: [], //接站列表
      hasBoard: false, // false不显示键盘
      isGaotie: false,//是否只查看高铁信息
      isPukuai: false,//是否只查看普快信息
      trainType: 2, //0 是高铁动车（包括gcd,三种车）  1 是非高铁    传2查全部
      shareData: {}, //分享数据
      isCheckG: false,//是否选择高铁
      isWaitFinish: false,
      isArriveFinish: false,
      noPageText:'',
      thisPage:true,
      pageSize:20, //一页数量
    }
    this.keyboardTime=0
  }

  componentWillMount() {
    let that = this
    let options = getCurrentInstance().router.params
    if(options){
      if(options.station){

        let opt_station = decodeURI(options.station)

        Taro.setNavigationBarTitle({
          title: opt_station
        })

        that.setState({
          station:opt_station
        })
      }
    }

    that.setState({
      isWait: options && decodeURI(options.type) === '0'? false:true //1为候车列表，0为接车列表
    })
  }

  componentDidMount() {

  }

  componentWillUnmount() { }

  componentDidShow() {
    this.initData()
   }

  componentDidHide() { }

  //下拉事件
  onPullDownRefresh(){
    this.initData()
    // 接口请求完毕后隐藏两个loading , 标题和下拉区域
    Taro.stopPullDownRefresh();
  }

  initData = () => {
    let that = this
    let {isWait} = this.state;

    this.setState({
      waitList: [],//候车列表
      arriveList: [],//接站列表
      isWait: isWait,//显示乘车或者接站
      pageNum: 1,//候车页码
      pageSearchNum: 1,//候车页码
      pageArriveNum: 1,//接站页码
      content: '请输入要查询的车次号',
      isIcon: true,
      hasBoard: false,
      animation: '',  //虚拟键盘_输入光标样式
    }, () => {
      if (isWait) {
        that.getWaitList()
      } else {
        that.getArriveList()
      }
    })
  }
  //获取乘车列表
  getWaitList = () => {
    let that = this
    let tT = that.state.trainType
    let url = '/vega-station'
    let { isNowDate } = this.state
    if (isNowDate) {
      url += '/vehiclenavigation/getScreenListNew'
    } else {
      url += '/vehiclenavigation/getWaitHistory'
    }
    let params = {
      stationName: that.state.station,
      currPage: that.state.pageNum,
      pageSize: that.state.pageSize,
      trainType: tT,
      type: 2,
    }

    API.StationService.getScreenListNew(url,params,false)
    .then(res => {
      if(res.code!=997 && res.code != '0'){// 997:查询数据中心接口无数据返回
        Taro.showToast({
          title:'搜索失败',
          icon:'none',
          duration:2000
        })
        return
    }
    let newList = res.data&&res.data.data || []

    if (newList == null || newList.length == 0) {

      if (that.state.pageNum != 1) {
        that.setState({
          flag:true,
          isWaitFinish: true
        })
      } else {
        that.setState({
          waitList: [],
          flag: false
        })
      }
    } else {
      if (that.state.pageNum === 1) {
        that.setState({
          pageNum: that.state.pageNum + 1,
          waitList: newList,
          flag: true
        })
      }else{
        that.setState({
          pageNum: that.state.pageNum + 1,
          waitList: that.state.waitList.concat(newList),
          flag: true,
          isWaitFinish: (newList.length<that.state.pageSize ? true :false)
        },()=>{

        })
      }
    }
    })
    .catch((e) => {

    })
  }

  //获取接站列表
  getArriveList = () =>{
    let that = this
    let url = '/vega-station'
    let tT = that.state.trainType
    let { isNowDate } = this.state
    if (isNowDate) {
      url += '/vehiclenavigation/getScreenListNew'
    } else {
      url += '/vehiclenavigation/getArriveHistory'
    }
    let params = {
      stationName: that.state.station,
      currPage: that.state.pageArriveNum,
      pageSize: that.state.pageSize,
      trainType: tT,
      type: 1,
    }

    API.StationService.getScreenListNew(url,params,true)
    .then(res => {
      let newList = res.data&&res.data.data || []
      if(res.code!=997&&res.code != '0'){//997：查询数据中心接口无数据返回
        Taro.showToast({
          title:'搜索失败',
          icon:'none',
          duration:2000
        })
        return
      }

      if (newList == null || newList.length == 0 ) {
        if (that.state.pageArriveNum != 1) {
          that.setState({
            flag: true,
            isArriveFinish: true
          })
        } else {
          that.setState({
            arriveList: [],
            flag: false
          })
        }
      } else {
        if (that.state.pageArriveNum === 1) {
          that.setState({
            pageArriveNum: that.state.pageArriveNum + 1,
            arriveList: newList,
            flag: true
          })
        }else{
          that.setState({
            pageArriveNum: that.state.pageArriveNum + 1,
            arriveList: that.state.arriveList.concat(newList),
            flag: true,
            isArriveFinish: (newList.length<that.state.pageSize ? true :false)
          })
        }
      }
    })
    .catch((e) => {

    })
  }

  // 切换到候车列表,
  displayWait = () => {
    let that = this
    that.setState({
      isWait: true
    }, () => {
      if (that.state.content != '请输入要查询的车次号' && that.state.content != '') {
        that.setState({
          pageNum: 1,
        }, () => {
          that.getserchList(true)
        })
      } else {
        if (that.state.waitList.length === 0) {
          that.getWaitList()
        } else {
          that.setState({
            flag: true
          })
        }
      }
    })
  }

  // 切换到接车列表
  displayArrive = () => {
    let that = this
    that.setState({
      isWait: false
    }, () => {
      if (that.state.content != '请输入要查询的车次号' && that.state.content != '') {
        that.getserchList(true)
      } else {
        if (that.state.arriveList.length === 0) {
          that.getArriveList()
        } else {
          that.setState({
            flag: true
          })
        }
      }
    })
  }

  // 监听用户上拉触底事件
  refreshList = () => {
    let that = this
    let { isWait } = this.state
    if (that.state.content !== '请输入要查询的车次号' && that.state.content !== '') {
      that.getserchList()
    } else {
      if (isWait) {
        that.getWaitList()
      } else {
        that.getArriveList()
      }
    }
  }
  // 获取键盘焦点
  showKeyBoard = (e) => {
    e.stopPropagation()
    let currentContent = ''
    if (this.state.content === '请输入要查询的车次号') {
      currentContent = ''
    } else {
      currentContent = this.state.content
    }

    this.setState({
      content: currentContent,
      animation: 'animation',
      isIcon: false,
      hasBoard: true
    }, () => {})
  }

  //接收键盘值
  onGetCode = (e) => {
    let that = this
    let tex = e.val
    // if(timer) clearTimeout(timer)
    if (tex === 'del') {//清除
      tex = this.state.content.split("")
      let len = tex.length
      if (len === 0) {
        return
      } else {
        let newtex = []
        for (let i = 0; i < len - 1; i++) {
          newtex.push(tex[i])
        }
        tex = newtex.join("")
        that.setState({
          content: tex,
          waitList: [],
          arriveList: [],
          pageSearchNum: 1,
        }, () => {
          if (that.state.content === '请输入要查询的车次号' || that.state.content === '') {
            that.setState({
              pageNum: 1,
              pageArriveNum: 1,
              waitList: [],
              arriveList: []
            }, () => {
              that.getWaitList()
              that.getArriveList()
            })
          } else {
            // timer = setTimeout(() => {
            //   that.getserchList(true)
            // }, 800)
            that.getserchList(true)
          }
        })
      }
    } else if (tex === 'close') {//收起
      // that.keyboard.hideKeyBoard();
      if (that.state.content) {
        that.setState({
          hasBoard: false,
          animation: '',
        })
      } else {
        that.setState({
          hasBoard: false,
          isIcon: true,  //虚拟键盘_前面搜索图标
          content: '请输入要查询的车次号',  //虚拟键盘_输入提醒文本
          animation: '',  //虚拟键盘_输入光标样式
        })
      }
    } else { //输入
      that.toTop()
      if (that.state.content.length > 8) {
        return false
      }
      that.setState({
        content: that.state.content + tex,
      }, () => {
        // timer = setTimeout(() => {
        //   that.getserchList(true)
        // }, 800)

        that.getserchList(true)
      })
    }
  }
  // 搜索列表
  getserchList = (p=false) => {
    let that = this
    if(p){ //快速搜索的时候 无法将pageSearchNum置为1  在此做这边操作
      that.setState({
        waitList: [],
        arriveList: [],
        pageArriveNum:1,
        pageSearchNum: 1,
        pageNum: 1,
        isArriveFinish:false,
        isWaitFinish:false
      })
    }

    let type = that.state.isWait ? 2 : 1
    let params = {
      stationName: that.state.station,
      search: that.state.content,
      type,
      currPage: (p?1:that.state.pageSearchNum),
      pageSize:  that.state.pageSize,
      trainType:that.state.trainType
    }

    API.StationService.getScreenList(params, false)
    .then(res => {
      if(res.code!=997&&res.code != '0'){//997:查询数据中心接口无数据返回
        Taro.hideLoading()
        Taro.showToast({
          title:'搜索失败',
          icon:'none',
          duration:2000
        })
        return
      }

      let newList = res.data&&res.data.data || []
      if (p) { //第一页
        setTimeout(()=>{ //用定时器解决连续快速输入搜索的时候，setState数据错乱的问题 https://www.imooc.com/wenda/detail/402528（个人理解是多次发起setState 并不是依次执行-zj）
          that.setState({
            waitList: newList,
            arriveList: newList,
            flag: (newList.length?true:false),
            pageSearchNum: (newList.length ? that.state.pageSearchNum + 1 : that.state.pageSearchNum)
          },()=>{
            if(that.state.flag && that.state.isWait){
              that.setState({
                isWaitFinish:(newList.length<that.state.pageSize ? true :false)
              })
            }else if(that.state.flag && !that.state.isWait){
              that.setState({
                isArriveFinish:(newList.length<that.state.pageSize ? true :false)
              })
            }
          })
        },0);
      }else { //上拉加载
        that.setState({
          waitList: that.state.waitList.concat(newList),
          arriveList: that.state.waitList.concat(newList),
          flag: true,
          pageSearchNum: (newList.length? that.state.pageSearchNum + 1 : that.state.pageSearchNum)
        },()=>{
          if(that.state.flag && that.state.isWait){
            that.setState({
              isWaitFinish:(newList.length<that.state.pageSize ? true :false)
            })
          }else if(that.state.flag && !that.state.isWait){
            that.setState({
              isArriveFinish:(newList.length<that.state.pageSize ? true :false)
            })
          }
        })
      }
    })
    .catch((e) => {

    })
  }
  // 收起键盘
  onHiddenKeyBoard = (e) => {
    this.setState({
      hasBoard: false,
    })
  }
  // 现在与历史切换
  tohisCur = () => {
    let that = this
    let isNowDate = ''
    if (this.state.isNowDate === true) {
      isNowDate = false
    } else {
      isNowDate = true
    }
    this.setState({
      isNowDate,
      isWait: true,
      waitList: [], //候车列表
      arriveList: [], //接站列表
      pageNum: 1, //候车页码
      pageArriveNum: 1, //接车页码
      content: '请输入要查询的车次号',
      animation: '',
      isIcon: true,  // 显示搜索图标
      hasBoard: false, // 隐藏键盘
    }, () => {
      that.getWaitList()
    })
  }

  //点击只看高铁
  checkG = () => {
    let that = this
    if (that.state.isCheckG) {
      that.setState({
        isGaotie: false,
        isPukuai: false,
        trainType: 2,
        pageNum: 1,  //乘车页码
        pageArriveNum: 1, //接站页码
        waitList: [],  // 乘车列表
        arriveList: [], //接站列表
        hasBoard: false,
        isIcon: true,  //虚拟键盘_前面搜索图标
        content: '请输入要查询的车次号',  //虚拟键盘_输入提醒文本
        animation: '',  //虚拟键盘_输入光标样式
        isCheckG: false,
        isWaitFinish: false,
        isArriveFinish: false,
      }, () => {
        if (that.state.isWait) {
          that.getWaitList()
        } else {
          that.getArriveList()
        }
      })
    } else {
      that.setState({
        isGaotie: true,
        isPukuai: false,
        trainType: 0,
        pageNum: 1,  //乘车页码
        pageArriveNum: 1, //接站页码
        waitList: [],  // 乘车列表
        arriveList: [], //接站列表
        hasBoard: false,
        isIcon: true,  //虚拟键盘_前面搜索图标
        content: '请输入要查询的车次号',  //虚拟键盘_输入提醒文本
        animation: '',  //虚拟键盘_输入光标样式
        isCheckG: true,
        isWaitFinish: false,
        isArriveFinish: false,
      }, () => {
        if (that.state.isWait) {
          that.getWaitList()
        } else {
          that.getArriveList()
        }
      })
    }
  }

  //点击只看普快
  checkK = () => {
    let that = this
    if (that.state.isPukuai) {
      that.setState({
        isPukuai: false,
        isGaotie: false,
        trainType: 2,
        pageNum: 1,  //乘车页码
        pageArriveNum: 1, //接站页码
        waitList: [],  // 乘车列表
        arriveList: [], //接站列表
        hasBoard: false,
        isIcon: true,  //虚拟键盘_前面搜索图标
        content: '请输入要查询的车次号',  //虚拟键盘_输入提醒文本
        animation: '',  //虚拟键盘_输入光标样式
      }, () => {
        if (that.state.isWait) {
          that.getWaitList()
        } else {
          that.getArriveList()
        }
      })
    } else {
      that.setState({
        isPukuai: true,
        isGaotie: false,
        trainType: 1,
        pageNum: 1,  //乘车页码
        pageArriveNum: 1, //接站页码
        waitList: [],  // 乘车列表
        arriveList: [], //接站列表
        hasBoard: false,
        isIcon: true,  //虚拟键盘_前面搜索图标
        content: '请输入要查询的车次号',  //虚拟键盘_输入提醒文本
        animation: '',  //虚拟键盘_输入光标样式
      }, () => {
        if (that.state.isWait) {
          that.getWaitList()
        } else {
          that.getArriveList()
        }
      })
    }
  }

  toTop = () => {
    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  }

  //一键删除
  deleNum = (e) => {
    e.stopPropagation()
    let that = this
    that.setState({
      content:'',
      waitList: [],
      arriveList: [],
      pageSearchNum: 1,
    }, () => {
      if (that.state.content === '请输入要查询的车次号' || that.state.content === '') {
        that.setState({
          pageNum: 1,
          pageArriveNum: 1,
          waitList: [],
          arriveList: []
        }, () => {
          that.getWaitList()
          that.getArriveList()
        })
      }})
  }
  onReachBottom(){//下拉滚动到底部
     this.refreshList();
  }
  //点击其他区域关闭键盘
  bodyCloseKeyboard = (e) => {
    this.setState({
      hasBoard: false,
    })
  }

  // 跳转车次选择出发站页
  see (e) {

    // var {station, isWait} = this.state
    //跳转车次选择出发站页
    // var stationName = station
    // if(isNotEmptyObj(stationName) && stationName.indexOf("站") >= 0){
    //   stationName = stationName.split("站")[0]
    // }

    let dataset = e.currentTarget.dataset
    let trainNo = dataset.trainNo
     let jump_params = {
        // sourcefrom: addTrip_sourcefrom_enum.largeScreenQuery,
        trainNo: trainNo,
     }

    //  if(isWait){//候车
    //    jump_params.from_station = stationName
    //    jump_params.to_station = ''
    //  }else{
    //   jump_params.from_station = ''
    //   jump_params.to_station = stationName
    //  }

     let jumpUrl = '../selectSite/index?'+queryParams(jump_params)
     Taro.navigateTo({
       url: jumpUrl
     })
  }

  render() {
    let { isWaitFinish,isArriveFinish, isWait, flag, station, isNowDate, isIcon, animation, content, waitList, arriveList, hasBoard, isGaotie, isPukuai, isCheckG } = this.state
    let waitListItem = waitList.map((item, index) => {
      return (
        <Block key={index}>
          <View id={'ATscreen3' + (index + 1)} className={'tr ' + ((index % 2 == 0) ? '' : 'backgary')} data-train-no={item.stationTrainCode} data-from-station={''} data-to-station={item.endStation} data-type='2' onClick={this.see}>
            <View className='td w18'>
              {/* <Text className='tip'>{item.trainTit}</Text> */}
              <View className='tNo'>{item.stationTrainCode}</View>
            </View>
            {/* <View className='td w15 hui'>{item.route[0]}</View> */}
            {/* <View className='td w15 hui'>{item.route[1]}</View> */}
            <View className='td w15 hui'>{item.endStation || '--'}</View>
            <View className='td w15 hui'>{item.normalStartDateTime || '--'}</View>
            <View className='td w15 hui'>{item.ticketCheck || '--'}</View>
            {/* {(item.departLateType === 0 || item.departLateType === 1) && <View className='td w22' style='color:#333333'>{item.status}</View>} */}
            {(item.departLateType === 0 || !item.departLateTyp) && <View className='td w22' style='color:#333333'>--</View>}
            {(item.departLateType === 1) && <View className='td w22' style='color:#333333'>正点</View>}
            {(item.departLateType === 2) && <View className='td w22' style='color:#23eaa4'>{item.departLateInfo == '0' ? '早点' : '早点'+ item.departLateInfo +"'"}</View>}
            {(item.departLateType === 3) && <View className='td w22' style='color:#ff6b69'>{item.departLateInfo == '0' ? '晚点' : '晚点'+ item.departLateInfo +"'"}</View>}
          </View>
        </Block>
      )
    })
    let arriveListItem = arriveList.map((item, index) => {
      return (
        <Block key={index}>
          <View id={'ATscreen4' + (index + 1)} className={'tr ' + ((index % 2 == 0) ? '' : 'backgary')} data-train-no={item.stationTrainCode} data-from-station={item.startStation} data-to-staion={''} data-type='1' onClick={this.see}>
            <View className='td w18'>
              {/* <Text className='tip'>{item.trainTit}</Text> */}
              <View className='tNo'>{item.stationTrainCode}</View>
            </View>
            <View className='td w15 hui'>{item.startStation}</View>
            {/* <View className='td w15 hui'>{item.route[0]}</View> */}
            {/* <View className='td w15 hui'>{item.route[1]}</View> */}
            <View className='td w15 hui'>{item.normalArriveTime}</View>
            <View className='td w15 hui'>{item.ticketCheckOut || '--'}</View>
            {/* {(item.departLateType === 0 || item.departLateType === 1) && <View className='td w22' style='color:#333333'>{item.status}</View>} */}
            {(item.arriveLateType === 0) && <View className='td w22' style='color:#333333'>--</View>}
            {(item.arriveLateType === 1) && <View className='td w22' style='color:#333333'>正点</View>}
            {(item.arriveLateType === 2) && <View className='td w22' style='color:#23eaa4'>{item.arriveLateInfo == '0' ? '早点' : '早点'+ item.arriveLateInfo +"'"}</View>}
            {(item.arriveLateType === 3) && <View className='td w22' style='color:#ff6b69'>{item.arriveLateInfo == '0' ? '晚点' : '晚点'+ item.arriveLateInfo +"'"}</View>}
          </View>
        </Block>
      )
    })
    return (
      <View className='largeScreen' onClick={this.bodyCloseKeyboard}>
        <View className='topFill'>
          <View className='wrap'>
            <View className='topBox'>
              <View className='top_left'>
                <Image className='topimg' src={'https://imgczt.weitaikeji.com/h5/taroVega/czt_v1/largeScreen/icon_tix.png'}></Image>
                <Text className='toptet'>点击车次 查看详情</Text>
              </View>
              <View className='top_right'>
                <View className={isWait ? 'cur' : ''} onClick={this.displayWait}>候车</View>
                <View className={!isWait ? 'cur' : ''} onClick={this.displayArrive}>到达</View>
              </View>
            </View>
            <View className='searchBox' id='m_search'>
              <View id='ATscreen1' className='search' onClick={this.showKeyBoard}>
                {isIcon && <Image className='img' src={'https://imgczt.weitaikeji.com/h5/taroVega/czt_v1/largeScreen/search_btn_3.png'}></Image>}
                <View className={'txt ' + animation}>{content}</View>
                {!isIcon && <Image id='ATscreen2' className='deleImg' src={'https://imgczt.weitaikeji.com/h5/taroVega/czt_v1/stationChange/icon_kdetele.png'} onClick={this.deleNum}></Image>}
              </View>
              <View className='gaotie' onClick={this.checkG}>
                <Image className='gaoimg' src={isCheckG ? 'https://imgczt.weitaikeji.com/h5/taroVega/czt_v1/largeScreen/czdp_xuanze.png' : 'https://imgczt.weitaikeji.com/h5/taroVega/czt_v1/largeScreen/czdp_weixuan.png'}></Image>
                <View className='gaotet'>高铁动车</View>
              </View>
            </View>
          </View>
          <View className='tr'>
            <View className='w18'>车次</View>
            <View className='w15'>{isWait ? '终到站' : '始发站'}</View>
            <View className='w15'>{isWait ? '发车' : '到本站'}</View>
            <View className='w15'>{isWait ? '检票口' : '出站口'}</View>
            <View className='w22'>状态</View>
          </View>
        </View>

        {flag && <View className='trainList'>
          <View className='table'>
            {isWait && <View  className='tbody'>
              {waitListItem}
              { isWaitFinish  && <View className="bottom">-我也是有底线的-</View>}
            </View>}

            {!isWait && <View  className='tbody'>
              {arriveListItem}
              { isArriveFinish  && <View className="bottom">-我也是有底线的-</View>}
            </View>}
          </View>

        </View>}
        {!flag && <View className='noData'>暂无相关数据</View>}
        <View className='tips'>以上信息仅供参考，实际情况以车站公告为准</View>
        {hasBoard && <Keyboard onGetCode={this.onGetCode} onHidden={this.onHiddenKeyBoard.bind(this)}></Keyboard>}
      </View>
    )
  }
}

