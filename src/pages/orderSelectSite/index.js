import Taro, { getCurrentInstance } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, ScrollView, Block, Image } from '@tarojs/components'
import dayjs from 'dayjs'
// import {get as getGlobalData } from '../../../../service/config'
import {get_crossDatas, check_isCrossDay, addTrip_sourcefrom_enum, isNotEmptyObj, isEmptyObj, queryParams, get_stationSelect_status, select_station_status} from '@/utils/common'

import { connect } from 'react-redux'
import { setUserStation, setTicketList } from '@/store/actions'
// import TrainUtil from '../../../../service/apiCommon'
import './index.scss'
import API from '@/api/index'
// import CreateOrder from "../createOrder";
let today_date = dayjs().format('YYYY-MM-DD')
// import CustomButton from '../../../../components/customButton/customButton'
// import {auth_need_enum, request_UserInfo} from '../../../../utils/authUtil'
// import jumpUtil from '../../../../utils/jumpUtil'

class OrderSelectSite extends Component {
// 选择出发站页面
  constructor(){
    super(...arguments)
    this.state = {
        toView: 'inToView_0',
        stationList: [],
        selectStations:[], //选择出发站点
        is_show_crossDay_modal: false, // 是否显示跨天弹框
        dateC: '',
        timeCC:'',
        weekDay:'',

        is_send_from: false, //记录是否传入出发站
        is_send_to: false, //记录是否传入到达站
        do_select_click: false, //是否进行了选择操作，选择或取消选择，如：车次大屏进入，传入了武汉出发站点后，武汉前面车次不可选，若进行了到达北京选择后，进入选中两个状态，此时再取消北京，则其他就都可选状态，而不是传入时状态变化

        bottom_btn_enable: true,
    }

    this.path= getCurrentInstance().router.path
    this.collectPageName='行程确认添加页2'

    this.base_img_url = "https://www.cx9z.com/h5/tarocx9z/czt_v1/chooseStation/" //图片地址

    this.sourcefrom = addTrip_sourcefrom_enum.momentSearch_trainSearch //来源
    this.trainNo = ''//车次号
    this.from_station = '',//页面传递过来的出发站 武汉
    this.to_station = '',//页面传递过来的到达站   北京
    this.isload_success = false

    this.is_from_currentDate = true // 默认是，选择日期7.12，true：7.12号从济南出发(算出到达时间)，false 7.12到济南(算出出发时间)
    //  this.code= '1' //1默认行程  12接人  13送人
    this.jumpCode = ''// 接人 送人 进站指引 出站指引code标识
    this.registerType = '' //境外旅客信息流程
  }

   //  config = {
   //    navigationBarTitleText: '选择出发站'
   // }

      UNSAFE_componentWillMount(){

        let params = getCurrentInstance().router.params
        this.trainNo = params.trainNo
        this.setState({
          dateC: today_date,
          timeCC: dayjs(today_date).format('MM月DD日'),
          weekDay: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][new Date().getDay()]
        })
        Taro.setNavigationBarTitle({
          title: this.trainNo
        })
        // if(params){
        //   if(params.sourcefrom){
        //     this.sourcefrom = params.sourcefrom
        //   }
        //   if(params.trainNo){
        //     this.trainNo = params.trainNo
        //   }
        //   if(params.from_station){
        //     this.from_station = params.from_station
        //   }
        //   if(params.to_station){
        //     this.to_station = params.to_station
        //   }
        //   if (params.registerType){
        //     this.registerType = params.registerType
        //   }
        //   this.jumpCode = params.jumpCode || ''
        // }

        // if(params && params.dateC){
        //   this.state.dateC = params.dateC
        //   if(params.timeCC){
        //     this.state.timeCC = decodeURI(params.timeCC)
        //   }
        //   if(params.weekDay){
        //     this.state.weekDay = decodeURI(params.weekDay)
        //   }
        // }else{
        //   this.state.dateC = today_date
        //   this.state.timeCC = dayjs(today_date).format('MM月DD日')
        //   this.state.weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][new Date().getDay()]
        // }
      }

      componentDidMount(){

      }

      componentDidShow () {
        const {dateC, stationList} = this.state
        if(!this.isload_success && isNotEmptyObj(dateC) && (isEmptyObj(stationList) || stationList.length === 0)){
          this.getTicket(dateC)
        }
      }
      /**
       * 初始化数据
       */
      init_data = (stationList, date) => {

        var that = this
        var {do_select_click} = this.state
        var is_from_station = isNotEmptyObj(that.from_station)//传入出发站
        var is_to_station = isNotEmptyObj(that.to_station) //传入到达站
        var is_send_from = false
        var is_send_to = false

        this.is_from_currentDate = true // 重置为当前日期出发，若有弹框，从新选择后赋值更新

        let timeCC = dayjs(date).format('MM月DD日')
        let weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][new Date(date).getDay()]

        var selects = []
        for(let i = 0; i < stationList.length; i++){
          if(selects.length >= 2){
            break
          }
          let item = stationList[i]
          var is_from  = is_from_station && (item.stationName == that.from_station)
          var is_to = is_to_station && (item.stationName == that.to_station)

          if(is_from){
            is_send_from = true
          }
          if(is_to){
            is_send_to = true
          }

          if(is_from || is_to){
             // 初始化出发站  到达站
             if(selects.length <= 0){
               selects[0] = item
             }else if(selects.length == 1){
              selects[1] = item
             }
          }
        }
        stationList.map((item, index) => {
          // 跨天显示
          // var afterItem = index < stationList.length - 1 ? stationList[index+1] : null // 跨天向下+1显示 -> length-1
          var crossDay_text = ''
          // if(isNotEmptyObj(afterItem)){
          //   if(afterItem.dayType != item.dayType){
          //     crossDay_text = (afterItem.dayType > 0 ? '+'+afterItem.dayType+'天' : '')
          //   }
          // }
          item.crossDay_text = crossDay_text

          // 车次变更
          var nowTrainNo_text = ''
          // if(index == 0){
          //   if(isNotEmptyObj(that.trainNo) && that.trainNo != item.nowTrainNo){
          //     nowTrainNo_text = '车次号：'+item.nowTrainNo
          //   }
          // }else{
          //   var preItem = stationList[index-1]
          //   if(preItem && preItem.nowTrainNo != item.nowTrainNo){
          //     nowTrainNo_text = '车次变更：'+item.nowTrainNo
          //   }
          // }
          item.nowTrainNo_text = nowTrainNo_text
        })

        let state_obj = {
          stationList: stationList,
          dateC: date,
          timeCC:timeCC,
          weekDay: weekDay,
          bottom_btn_enable: true,
        }
        var to_view_flag = 'inToView_0'
        if((is_from_station || is_to_station) || !do_select_click){ //第一次进入传入出发到达站 且 未点击事件->未选择，要初始化选中出发与到达站点
           state_obj.is_send_from = is_send_from
           state_obj.is_send_to = is_send_to

           let to_view_distance = 3
           if(selects.length > 0){
             to_view_flag = 'inToView_'+selects[0].stationIndex

             if(is_from_station){//传入出发站
                if(selects[0].stationIndex > to_view_distance){
                  to_view_flag = 'inToView_'+(selects[0].stationIndex-to_view_distance)
                }else{
                  to_view_flag = 'inToView_0'
                }
             }else if(is_to_station){//只传入到达站
                if(stationList.length > to_view_distance){
                  to_view_flag = 'inToView_'+(selects[0].stationIndex-to_view_distance)
                }
             }
           }
        }
        if(!do_select_click){
          state_obj.selectStations = selects
         }else{
           //更新之前选择 站数据
          let before_selectStations = this.state.selectStations
          if(isNotEmptyObj(before_selectStations) && before_selectStations.length > 0){
            //找到 出发 或 到达站
            var from_item = null
            var to_item = null
            if(before_selectStations.length == 1){
               from_item = before_selectStations[0]
            }else if(before_selectStations.length >= 2){
              if(before_selectStations[0].stationIndex > before_selectStations[1].stationIndex){ //  0站点 > 1站点   交换位置 -> 使  0 起点， 1 终点
                var temp = before_selectStations[0];
                before_selectStations[0] = before_selectStations[1];
                before_selectStations[1] = temp;
              }
              from_item = before_selectStations[0]
              to_item = before_selectStations[1]
            }

            //更新出发与到达站 日期 最新数据
            for(let i = 0; i < stationList.length; i++){
              let item = stationList[i]
              if(from_item && item.stationName == from_item.stationName){
                from_item = item
              }
              if(to_item && item.stationName == to_item.stationName){
                to_item = item
              }
            }

            let new_before_selectStations = []
            if(from_item){
              new_before_selectStations.push(from_item)
            }
            if(to_item){
              new_before_selectStations.push(to_item)
            }
            state_obj.selectStations = new_before_selectStations
          }
         }
         state_obj.toView = to_view_flag
        this.setState(state_obj)
      }

       /**
       * 回退页面，数据更新方法
       * @param {*} type 更新数据类型定义
       * @param {*} data 更新数据
       */
      updateBackPageData = (type, data) => { // refs: tripCard
        if(type === 'date'){ // 更新日期
          // let data = {
          //   dateC: dateC,//2019-07-05
          //   timeCC: timeCC,//7月5日
          //   weekDay:weekDay, //星期五
          //   toDay: toDay // ''/今天
          // }
          if(isNotEmptyObj(data.dateC) && data.dateC != this.state.dateC){
            this.getTicket(data.dateC)
          }
        }
      }

      /**
       * 获取车次详情
       */
      getTicket = (dateC) => {
        if (!this.props.trainInfo.train) {
          Taro.showToast({
            title: '无车次信息',
            icon: 'none',
            duration: 2000,
            complete: () => {
              Taro.navigateBack({delta: 1})
            }
          })
        }
        var that = this
        this.isload_success = false
        // API.StationService.getStationToStationByTrainNo({strokeTime:dateC,trainNo:that.trainNo})
        API.Order.getStations({train: this.props.trainInfo.train})
          .then(res => {
            // Taro.setStorageSync('dateC', dateC)
            this.props.setTicketList(res.data)
            let data = res.data || []
            let list  = data.map((item, index) => {
              item.stationIndex = index
              return item
            })
            that.init_data(list, dateC)
            that.isload_success = true
          })
          .catch(() => {
            that.isload_success = false
          })
      }

      /**
       *  显示 跨天底部弹框选择，
       */
      show_crossDayModal = () => {
        if(this.state.is_show_crossDay_modal == false){
          this.setState({
              is_show_crossDay_modal: true
          })
        }
      }

      /**
       *  隐藏 跨天底部弹框选择，
       */
      hide_crossDayModal = (e) => {
          e &&  e.stopPropagation &&  e.stopPropagation()
          if(this.state.is_show_crossDay_modal == true){
            this.setState({
                is_show_crossDay_modal: false
            })
          }
      }

      /**
       * 处理完，跨天后，-> 立即判断是否结束与绑定(api)
       */
      handle_check_tripisEndorBinded = () => {
        let that = this
        var {dateC, selectStations} = that.state
        that.hide_crossDayModal()

        // 获取两个车次数据
        let crossData = get_crossDatas(dateC, selectStations)

        let trainNo = crossData.nowTrainNo // that.trainNo
        let startTime = this.is_from_currentDate ? crossData.from.startTime : crossData.to.startTime
        let endTime = this.is_from_currentDate ? crossData.from.endTime : crossData.to.endTime
        let from_name = crossData.from.from_name
        let to_name = crossData.from.to_name
        let sourcefrom = this.sourcefrom
        let depDate = this.is_from_currentDate ? crossData.from.depDate : crossData.to.depDate

        //车次号，选择日期，到达站名字 到达站到达时间 （yyyy-MM-dd HH:mm）
        let arrTime_ = dayjs(endTime).format('YYYY-MM-DD HH:mm')//到达站到达时间

        that.setState({
          bottom_btn_enable: true,
        })

        // Taro.removeStorageSync('search_monent_stationList')
        Taro.hideLoading()

        let jump_params = {
          'sourcefrom': that.sourcefrom,
          'trainNo':trainNo,
          'dateC':depDate,
          'from_station':from_name,
          'to_station':to_name,
          'check_status':'1' // 1: 结束或已绑定 (跳转到车次结果页 -> 不显示立即添加按钮)     0：未结束或未绑定(跳转到车次结果页 ->显示立即添加按钮) ， -1: fail
        }

        let jumpUrl = '../lateQueryResults/index?'+queryParams(jump_params)

          Taro.navigateTo({
            url: jumpUrl
          })


      }

      /**
       * 返回，出发站选择是否 完成
       */
      check_selectStationComplete = () => {
        var selectStations = this.state.selectStations
        return selectStations && selectStations.length >=2
      }

      /**
       * 选择车次 完成 后的处理： 跨天 、 是否结束与绑定判断
       */
      toHandle_selectStationsComplete = () => {
        let that = this
        //  时刻查询下 车次查询 、添加行程下 车次查询  、 车站大屏
        // 非 （时刻查询下 站站查询 或  添加行程下 站站查询, 扫描车次） ，都要进行跨天判断
        if(that.sourcefrom == addTrip_sourcefrom_enum.momentSearch_trainSearch ||
          that.sourcefrom == addTrip_sourcefrom_enum.addTrain_trainSearch ||
          that.sourcefrom == addTrip_sourcefrom_enum.largeScreenQuery){
          let is_cross_day = check_isCrossDay(that.state.selectStations)
          if(is_cross_day){
            that.show_crossDayModal()//显示跨天弹框
            return
          }
        }
      }

       /**
       * 点击事件：跨天选择
       * @param {*} e
       */
      onClick_crossDay_select = (e) => {
        e &&  e.stopPropagation &&  e.stopPropagation()
        let dataset = e.target.dataset
        this.is_from_currentDate = dataset.type == 'from' //是否是从当前日期出发, false:从当前时间为到达时间
        // 选择后 ，hide
        this.hide_crossDayModal()
        this.handle_check_tripisEndorBinded()
     }

      /**
       * 点击事件：确认添加
       */
      onClick_add = (type, e) => {
          e &&  e.stopPropagation &&  e.stopPropagation()
          if (!type) return
          if(this.check_selectStationComplete()){
            let list = this.state.selectStations
            this.props.setUserStation({
              startStation: list[0],
              endStation: list[1]
            })
            // Taro.navigateBack({
            //   delta: 1
            // })
            Taro.redirectTo({
              url: `/pages/createOrder/index`
            })
          }else{
              Taro.showToast({
                title: '请选择出发站',
                icon: 'none',
                duration: 1500
             })
          }
      }

      //点击事件：选择日期
      onClick_toDate = () => {
        Taro.navigateTo({
          url: '../calendar/index',
        })
      }

      /**
       * 点击事件：前一天
       * */
      prevDate = (e) => {
        e &&  e.stopPropagation &&  e.stopPropagation()
        let dateC = dayjs(this.state.dateC).add(-1, 'day').format('YYYY-MM-DD')//减一天
        this.getTicket(dateC)
      }

      /**
       * 点击事件：后一天
       * */
      nextDate = (e) => {

        e &&  e.stopPropagation &&  e.stopPropagation()
        let dateC = dayjs(this.state.dateC).add(1, 'day').format('YYYY-MM-DD')//加一天

        this.getTicket(dateC)
      }

      onClick_chooseStation = (selectItem) => {
        var that = this
        var selects = this.state.selectStations ? this.state.selectStations : []
        if(selects.length<=0){
          selects[0] = selectItem //添加
        }else{
          //包含移除
          var is_contain = false
          if(selects.length == 1){
            // is_contain = selects[0].stationIndex == selectItem.stationIndex
            if(selects[0].stationIndex == selectItem.stationIndex){
              is_contain = true
              selects.splice(0, 1);
            }
          }else if(selects.length == 2){
            // is_contain = selects[0].stationIndex == selectItem.stationIndex || selects[1].stationIndex == selectItem.stationIndex
            if(selects[0].stationIndex == selectItem.stationIndex){
              is_contain = true
              selects.splice(0, 1);
            }else  if(selects[1].stationIndex == selectItem.stationIndex){
              is_contain = true
              selects.splice(1, 1);
            }
          }


          if(is_contain){//已经选中站点 包含 当前点击item
          }else{
            if(selects.length == 0){
              selects[0] = selectItem //添加
            }else if(selects.length == 1){//添加
                selects[1] = selectItem
            }else if(selects.length == 2){
                var current_index = selectItem.stationIndex
                //之前已经选中2个，需要：排除其中一个，替换起点或终点
                if(selects[0].stationIndex > selects[1].stationIndex){ // 0站点 > 1站点   交换位置 -> 使  0 起点， 1 终点
                  var temp = selects[0];
                  selects[0] = selects[1];
                  selects[1] = temp;
                }

                var select_index_to = selects[1].stationIndex // 终点 索引
                if(current_index > select_index_to){
                  selects[1] = selectItem // 替换 终点
                }else{// 替换 起点
                  selects[0] = selectItem // 替换 起点
                }
            }
          }
        }

        if(selects && selects.length >=2){
          if(selects[0].stationIndex > selects[1].stationIndex){ // 0站点 > 1站点   交换位置 -> 使  0 起点， 1 终点
            var temp = selects[0];
            selects[0] = selects[1];
            selects[1] = temp;
          }
        }

        this.setState({
          selectStations: selects,
          do_select_click: true
        },()=>{
            // 时刻查询 下车次查询，选择完车次，立即处理，其他都是点击确认添加按钮才立即处理
            if(that.sourcefrom == addTrip_sourcefrom_enum.momentSearch_trainSearch){
              if(that.check_selectStationComplete()){  // 选择完出发站
                  that.toHandle_selectStationsComplete()
              }
            }
        })
      }

  // nextDay， 选择前一天 修复，日期比较不对
  // 前一天：今天时，不可选前一天，样式调整
      render(){
        var that = this
        const {dateC, stationList,  do_select_click, is_send_from, is_send_to, is_show_crossDay_modal} = this.state
        let date_pre_enable = false

        if(isNotEmptyObj(dateC)){
          if(dayjs(today_date).isBefore(dateC)) {//今天 2019-7-4 比 选择日期早 2019-7-5
            date_pre_enable = true
          }else{
          }
        }else{
        }

        var selects = this.state.selectStations
        var tip_start =  "出发站"
        var tip_end =  "到达站"
        var is_selected_from = false // 选中起点
        var is_selected_to =  false // 选中终点

        let current_status = get_stationSelect_status(this.state.selectStations, is_send_from, is_send_to, do_select_click)
        var station_html =  null
        /** select_no*/
        /** select_one  select_one_startStation  select_one_endStation*/
        var select_index_one = 0 // 索引为2选择
        /** select_two */
        var select_item1_index = 0; //选中两个时，第一个选中索引
        var select_item2_index = 0; //选中两个时，第二个选中索引

        let is_one = selects.length == 1 && (current_status == select_station_status.select_one || current_status == select_station_status.select_one_startStation || current_status == select_station_status.select_one_endStation)
        let is_two = selects.length == 2 && current_status == select_station_status.select_two
        if(is_one){
          select_index_one = selects[0].stationIndex
          if(!do_select_click){ // 未点击，候车大屏进入，填充出发或到达站
              if(current_status == select_station_status.select_one_startStation){
                tip_start = selects[0].stationName
                is_selected_from = true
              }else if(current_status == select_station_status.select_one_endStation){
                tip_end = selects[0].stationName
                is_selected_to = true
              }
          }
        }else if(is_two){
          if(selects[0].stationIndex > selects[1].stationIndex){ // 0 终点，1起点，交换位置
              var temp = selects[0];
              selects[0] = selects[1];
              selects[1] = temp;
          }

          select_item1_index = selects[0].stationIndex
          select_item2_index = selects[1].stationIndex

          tip_start = selects[0].stationName
          tip_end = selects[1].stationName
          is_selected_from = true
          is_selected_to = true
        }

       var line_list = []
       let html_1 = null
        // 线条
        let html_2 = null

       if(this.state.stationList && this.state.stationList.length > 0){
          html_1 = this.state.stationList.map((item, index) => {
            // 跨天显示
            let crossDay_text = item.crossDay_text
            // 车次变更
            let nowTrainNo_text = item.nowTrainNo_text

            var is_selected = false // 选中状态
            var is_middele_station = false // 是否为途径站点 select_two
            var circle_content_class = ''
            var cicle_class = ''
            var box_class = ''
            var time_class = 'time'
            var  isbefore = false // 之前 select_one_startStation
            var  isafter = false  // 之后 select_one_endStation
            var is_enable = false //是否可以点击 灰色不可点击

            if(index != stationList.length-1){ //去掉最后一个元素，最后一个无需line线条
              line_list.push(index)
            }

            if(current_status == select_station_status.select_no || current_status == select_station_status.select_one){
              is_selected = current_status == select_station_status.select_one ? select_index_one == index  : false
                // no 与 one : no所有都可选，one：当前选中，其他可选
              circle_content_class = is_selected ? 'circle_content_large' : ''
              cicle_class = is_selected ? 'circleImage_blue_large' : 'circleImage_blue'
              box_class = is_selected ? 'box_blue' : 'box_light_blue'
              is_enable = true

            }else if(current_status == select_station_status.select_two){

              // select_two:  select_item1_index选中状态而之前索引都为灰色, select_item2_index选中状态而之后都为灰色，两者之间为途径站点
              is_selected = (select_item1_index == index) || (select_item2_index == index) // 选中状态
              circle_content_class = is_selected ? 'circle_content_large' : ''

              is_middele_station = !(index < select_item1_index || index > select_item2_index)
              cicle_class = is_selected ? 'circleImage_blue_large' : (is_middele_station ? 'circleImage_middle_bgblue':'circleImage_gray')
              box_class = is_selected ? 'box_blue' : (is_middele_station ? 'box_middle_lightbg_blue' : 'box_gray')
              is_enable = is_selected // is_selected || is_middele_station

              if(is_selected || is_middele_station){
                time_class = 'time time_select'
              }

            }else if(current_status == select_station_status.select_one_startStation || current_status == select_station_status.select_one_endStation){
              // select_one_startStation: select_index_one 之前全不可行，之后都可选
              // select_one_endStation: select_index_one   之后全不可行，之前都可选
              is_selected = select_index_one == index
              isbefore = index < select_index_one // 之前
              isafter = index > select_index_one // 之后
              circle_content_class = is_selected ? 'circle_content_large':''

              if(current_status == select_station_status.select_one_startStation){
                cicle_class = is_selected ? 'circleImage_blue_large' : (isbefore ? 'circleImage_gray':'circleImage_blue')
                box_class = is_selected ? 'box_blue' : (isafter ? 'box_light_blue' : 'box_gray')
                is_enable = is_selected || isafter
              }else{
                cicle_class = is_selected ? 'circleImage_blue_large' : (isafter ? 'circleImage_gray':'circleImage_blue')
                box_class = is_selected ? 'box_blue' : (isbefore ? 'box_light_blue' : 'box_gray')
                is_enable = is_selected || isbefore
              }
            }

            var time_text = ''
            if((!is_send_from && !is_send_to) || is_send_from){// //未传入 或 只传入出发站 或 传入出发与到达站 ：显示出发时间
              // time_text = (index == stationList.length -1) ? item.arrTime : item.depTime
              time_text = (index == stationList.length -1) ? dayjs(item.arrivalTime).format('hh:mm') : dayjs(item.leaveTime).format('hh:mm')
            }else if(is_send_to){// 只传入到达站：显示到达时间
              time_text = (index == 0) ? dayjs(item.leaveTime).format('hh:mm') : dayjs(item.arrivalTime).format('hh:mm')
            }
            var station_text = item.stationName //+ " - " + item.dayType

              //  时间 圆 站点
              return (
                <View className='th' key={"th_"+index} id={'inToView_'+index}>
                     <View className={time_class}>
                        {time_text}
                        {/*<View className='crossDay'>{crossDay_text}</View>*/}
                     </View>
                    <View className='th_left'>
                      <View  className={'circle_content '+circle_content_class}>
                          <View className={cicle_class}></View>
                      </View>
                    </View>
                    {is_enable && <View className={'box '+box_class} onClick={this.onClick_chooseStation.bind(this, item)}>
                      {is_selected && <View style='display:flex;justify-content:center;align-items:center;'>
                        <Image style='width:17px; height:17px; margin-right:8px;' src={this.base_img_url+"icon_zuobiao.png"}></Image>
                        <Text>{station_text}</Text>
                        <Text className='boxNowTripNum'>{nowTrainNo_text}</Text>
                      </View>}

                      {!is_selected &&  <Block>
                        <Text>{station_text}</Text>
                        <Text className='boxNowTripNum' style='color:#666666'>{nowTrainNo_text}</Text>
                      </Block>}
                    </View>
                    }
                    {!is_enable && <View className={'box '+box_class}>
                      <Text>{station_text}</Text>
                      <Text className='boxNowTripNum'>{nowTrainNo_text}</Text>
                    </View>
                    }
                </View>
              )
            })
          html_2 = line_list.map((item, index) => {
            var line_class = 'line line_dash_gray'
            if(current_status == select_station_status.select_two){
              line_class = (index < select_item1_index || index > select_item2_index-1) ? 'line line_dash_gray' : 'line line_blue'
            }

            return (
              <View key={"line_"+index} className={line_class}></View>
            )
          })
       }

       station_html = (
        <View className='list_content'>
              { html_1}
              <View className='line_view'>
                {html_2}
              </View>
          </View>
        );

        var is_show_bottomBtn = true
        let is_bottomBtn_enable = this.state.bottom_btn_enable && this.state.selectStations && this.state.selectStations.length >= 2
        let top_time = this.state.timeCC +' '+this.state.weekDay

        let crossData = null
        var from_title = ""
        var to_title = ""
        if(is_show_crossDay_modal && this.state.selectStations.length >= 2){
          crossData = get_crossDatas(dateC, selects)
          from_title = crossData.titles[0]//06月12日 杭州东 → 济南 06月13日
          to_title = crossData.titles[1]//06月11日 杭州东 → 济南 06月12日
        }
        return (
              <View className='content'>
                {/* <View className='m_top'>*/}
                {/*    {date_pre_enable && <View className='beforeDay' onClick={this.prevDate}>前一天</View>}*/}
                {/*    {!date_pre_enable && <View className='beforeDay beforeDay_noEnable'>前一天</View>}*/}
                {/*    <View className='dateCenter' onClick={this.onClick_toDate}>*/}
                {/*      <Text className='datetext'>{top_time}</Text>*/}
                {/*      <Text className='line'> </Text>*/}
                {/*      <Image className='image' src={this.base_img_url+"icon_date.png"}></Image>*/}
                {/*    </View>*/}
                {/*    <View className='nextDay' onClick={this.nextDate}>后一天</View>*/}
                {/*</View>*/}

                <View className='m_station_tipView' >
                    <Text className='tip'>请选择出发站和到达站</Text>
                    <View className='station_text_view'>
                      <Text className={is_selected_from ? 'station_text_select' : 'station_text'}>{tip_start}</Text>
                      <Image className='jiantou' src={this.base_img_url+"icon_jiantou.png"}></Image>
                      <Text className={is_selected_to ?  'station_text_select' : 'station_text'}>{tip_end}</Text>
                    </View>
                    <View className='line'></View>
              </View>

                <View className={is_show_bottomBtn?'m_station_content':'m_station_content_noBottom'}>
                  <ScrollView  scrollY  scrollIntoView={this.state.toView}  style='width:100%; height:100%;'>
                        <View className='list' >
                          {station_html}
                       </View>
                  </ScrollView>
                </View>

                {is_show_bottomBtn && <View className='m_bottom confirmAdd'>
                   <View className='tipWrap'>
                    {/*<Image className='tipImg' src={getGlobalData('domain_h5')+"/h5/tarocx9z/czt_v1/searchResult/icon_tishi.png"}></Image>*/}
                      <Text className='tipText'>添加行程，列车动态实时提醒</Text>
                     <View className={`add ${!is_bottomBtn_enable && 'add_diable'}`} onClick={(e) => {this.onClick_add(is_bottomBtn_enable, e)}}>确定添加</View>
                   </View>
                </View>}

                {is_show_crossDay_modal && <View className="cross_modal">
                  <View className="bottom">
                       <View className='tip'>您查询的线路跨天，请选择具体出发/到达日期</View>
                       <View className="item" data-type='from' onClick={this.onClick_crossDay_select}>
                          {from_title}
                        </View>
                        <View className="item" data-type='to' onClick={this.onClick_crossDay_select}>
                          {to_title}
                        </View>
                        <View className="cancel" onClick={this.hide_crossDayModal}>
                           取消
                        </View>
                  </View>
                </View>
              }
              </View>
          )
      }
}

const mapStateToProps = (state) => {
  return {
    ...state.counter
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUserStation(state) {
      dispatch(setUserStation(state))
    },
    setTicketList(state) {
      dispatch(setTicketList(state))
    }
  }
}

const OrderSelectSiteComponent = connect(mapStateToProps, mapDispatchToProps)(OrderSelectSite)

export default OrderSelectSiteComponent
