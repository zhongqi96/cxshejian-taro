import Taro, { getCurrentInstance } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, ScrollView, Block, Image} from '@tarojs/components'
import {addTrip_sourcefrom_enum, isNotEmptyObj, isEmptyObj, select_station_status,queryParams, getRandomColor} from '@/utils/common'
// import TrainUtil from '../../../../service/apiCommon'
import './index.scss'
import dayjs from 'dayjs'
import API from '@/api/index'

export default class Index extends Component {
// 车次结果页面
    constructor(){
        super(...arguments)
        this.state = {
            shareData: '',
            stationList: [],
            selectStations:[], //选择出发站点
            befort_status_expant:false, //前序站：展开状态, false:未展开(提示：展开) true:1 已展开(提示：收起)
            after_status_expant:false, //后序站：展开状态, 同上
            bottom_btn_enable: true,

            show_arriveOntimeRate: false,//是否显示正点率
            train_check_status: -1,
        }
        this.path=getCurrentInstance().router.path
        this.collectPageName='行程确认添加页'

        this.dateC = ''
        this.sourcefrom = addTrip_sourcefrom_enum.momentSearch_trainSearch //来源
        this.trainNo = ''//车次号 Z384 上海关 佛山
        this.from_station ='',//页面传递过来的出发站 长春
        this.to_station ='',//页面传递过来的到达站   北京
        this.check_status = -1 // 是否结束与绑定状态 ,  0 可绑定(未结束或未绑定) 2已经绑定 3已结束   -1: fail
        // this.arriveOntimeRate =''//到达正点率
        this.toast = ''
      }

      // config = {
      //    navigationBarTitleText: '选择出发站'
      // }

      loadData(params=null){
        if(params && (isEmptyObj(this.trainNo) || isEmptyObj(this.dateC))){
          if(params.sourcefrom){
            this.sourcefrom = decodeURI(params.sourcefrom)
          }
          if(params.trainNo){
            this.trainNo = decodeURI(params.trainNo)
          }

          if(params.from_station){
            this.from_station = decodeURI(params.from_station)
          }

          if(params.to_station){
            this.to_station = decodeURI(params.to_station)
          }

          if(params.dateC){
            this.dateC = decodeURI(params.dateC)
          }

          if(params.check_status){
            this.check_status = decodeURI(params.check_status)
          }
          if(isNotEmptyObj(params.toast)){
            this.toast = params.toast
          }
          Taro.setNavigationBarTitle({
            title: this.trainNo+' '+this.from_station+"-"+this.to_station // G20 武汉-贵州
          })
        }
      }

      componentWillMount(){

        this.loadData(getCurrentInstance().router.params)
        Taro.removeStorage('isSourceYuyue')
      }

      componentDidMount(){

      }

      componentDidHide(){
        Taro.removeStorage('isSourceYuyue')
      }

      componentDidShow () {
        this.loadData(getCurrentInstance().router.params)
        if(isNotEmptyObj(this.trainNo) && isNotEmptyObj(this.dateC)){
          this.getTicket(this.dateC)
        }
      }

      /**
       * 初始化数据
       */
      init_data = (station_list, dateC) => {
        var that = this
        if(!station_list || station_list.length <= 0){
          return
        }
        var list = station_list ? station_list : []
        var is_from_station = isNotEmptyObj(this.from_station)//传入出发站
        var is_to_station = isNotEmptyObj(this.to_station) //传入到达站

        var from_index = -1 //出发站索引
        var to_index = -1 //到达站索引
        var selects = []

        //1.找出发站索引
        for(let i = 0; i < list.length; i++){
           //找到出发与到达站索引
          if(from_index != -1 && to_index != -1){
            break;
          }
          var is_from  = is_from_station && (list[i].stationName == this.from_station)
          var is_to = is_to_station && (list[i].stationName == this.to_station)
          if(is_from){
            from_index = i
          }
          if(is_to){
            to_index = i
          }
        }

        if(from_index == -1 || to_index == -1){//未找 出发/到达站 return
          return
        }

        /***   计算出所有的，出发时间，与到达时间*/
        // 1. 算出传入日期dateC(出发站日期)与 找出的list中出发站日期之间的差值
        // let diff_day = dayjs(dateC).diff(list[from_index].depDate, 'day')

        //2.1 list中每项加上差值=>推出相对 dateC为出发站日期的其他项的最新的出发站与到达站日期
        //2.2 根据出发日期，算出：日期是否分组
        let section_num = 0//日期分组数量：存入fromIndex选项中，若分组数<2则视图不展示日期分组
        for(let i = 0; i < list.length; i++){
          if (i != list[i].stationIndex){
            list[i].stationIndex = i
          }
          let item = list[i]
          //到达时间
          list[i].arrTime_text = i == 0 ? "--" : (isEmptyObj(item.arrTime) ? '--':item.arrTime)
          //出发时间
          list[i].depTime_text = (i == list.length-1) ? "--" : (isEmptyObj(item.depTime) ? '--':item.depTime)
          //停留时间
          list[i].expectedToStayTime_text = (i == 0 || i == list.length-1) ? '--' : (isEmptyObj(item.expectedToStayTime) ? '--':item.expectedToStayTime+'\'')
          /* 正晚点 需求
              1、对于行程已经经过的站点，全部都如实显示实际的正早晚点信息（有数据的显示实际数据，无数据的“--”显示）；
              2、对于即将到达的站点（下一站），如果可以获取到预计的正早晚点信息如实显示，获取不到为空即可，不显示
              3、对于后续到达的站点（还没到达，也不是即将到达的站点），全部不显示正早晚点信息，为空即可*/

          var status_text = '--'
          let lateStatus = item.lateStatus // 正晚点信息  0未知 1 正点 2 早点 3 晚点
          let trainArrStatus = isNotEmptyObj(item.trainArrStatus) ? item.trainArrStatus : 1 // 每个车次站点状态： trainArrStatus 1已到 2进行中 3未到
          let lateTime = (isNotEmptyObj(item.lateTime) && item.lateTime != 0) ? item.lateTime+'\'' : ''
          var lateStatusTip =  ''
          // 0 未知 : lateStatusTip->空'' status_text = '--'
          if(lateStatus == 1){
            lateStatusTip = '正点'
          }else if(lateStatus == 2){
            lateStatusTip = '早点'+lateTime
          }else if(lateStatus == 3){
            lateStatusTip = '晚点'+lateTime
          }

          if(trainArrStatus == 1){// 1 已到
            status_text = isNotEmptyObj(lateStatusTip) ? lateStatusTip : '--'
          }else if(trainArrStatus == 2){// 2 进行中
            status_text = isNotEmptyObj(lateStatusTip) ? '预计'+lateStatusTip : ''
          }else if(trainArrStatus == 3){// 3 未到
            status_text = ''
          }
          item.status_text = status_text

          // 2.1
          let deptDate = dayjs(list[i].depDate)//.add(diff_day, 'day')
          // if(i!=0){//除车次起点，起点 无到站时间
          //   list[i].arrDate = dayjs(list[i].arrDate).add(diff_day, 'day').format('YYYY-MM-DD')
          // }

          // if(i!=list.length-1){//车次终点无出站(发车)时间
          //   list[i].depDate = deptDate.format('YYYY-MM-DD')
          // }

          // 2.2 日期分组
          list[i].sectionTitle = ''//分组：默认标题
          list[i].section = false //分组：默认不分组
          if(i == from_index){//出发站默认 分组
            //  section = true
            //  section_num++
          }else if(i > from_index && i <= to_index){ //计算 出发站与到达站 之间 是否有分组

            var is_crossDay = isNotEmptyObj(list[i].depDate) && list[i].depDate != list[i-1].depDate //跨天分组 ：下一个出发日期日期年月日不同上一个
            var is_diff_trianNo = isNotEmptyObj(list[i].nowTrainNo) && list[i].nowTrainNo != list[i-1].nowTrainNo // 车次变更, 不同车次分组
            var crossDayTip = ''
            var diffTrianNoTip = ''
            if(is_crossDay || is_diff_trianNo){
              list[i].section = true
              section_num++

              if(is_diff_trianNo){
                diffTrianNoTip = list[i].stationName+' 车次变更为'+list[i].nowTrainNo
              }

              if(is_crossDay){
                let depTimeCC = deptDate.format('MM月DD日')
                let depWeekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][deptDate.toDate().getDay()]
                crossDayTip = depTimeCC+" "+depWeekDay
              }

              list[i].sectionTitle = is_crossDay ? (is_diff_trianNo ? (crossDayTip+"   |   "+diffTrianNoTip) : crossDayTip) : diffTrianNoTip
            }
          }

          if(i == from_index){//更新出发站 开始时间、加入selects
            list[i].startTime = dayjs(list[i].depDate+" "+list[i].depTime).format('YYYY-MM-DD HH:mm:ss')
            selects.push(list[i])
          }
          if(i==to_index){//更新到达站开始时间、加入selects
            list[i].endTime = dayjs(list[i].arrDate+" "+list[i].arrTime).format('YYYY-MM-DD HH:mm:ss')
            selects.push(list[i])
          }

          if(i>0 && list[i-1].section){
          }
        }
        list[from_index].section_num = section_num
        //到达正点率
        var arriveOntimeRate = ''
        if(isNotEmptyObj(list[to_index].arriveOntimeRate)){
          let rate = list[to_index].arriveOntimeRate
          if(rate != '--' && rate != '0' && rate != 0){
            arriveOntimeRate = rate+"%"
          }
        }
        // let befort_status_expant = false
        // if(from_index != -1 && from_index == 0){//有出发站，且选择第一个, 展开
        //   befort_status_expant = true
        // }
        if(this.state.dateC != dateC){
          this.setState({
            stationList: list,
            selectStations: selects,
            arriveOntimeRate:  arriveOntimeRate,
            dateC: dateC,
            bottom_btn_enable: true,
            train_check_status: this.check_status,
            show_arriveOntimeRate: isNotEmptyObj(arriveOntimeRate)
            // befort_status_expant,
          })
        }else{
          this.setState({
            stationList: list,
            selectStations: selects,
            arriveOntimeRate: arriveOntimeRate,
            bottom_btn_enable: true,
            train_check_status: this.check_status,
            show_arriveOntimeRate: isNotEmptyObj(arriveOntimeRate)
            // befort_status_expant:true
          })
        }

        if(this.sourcefrom == addTrip_sourcefrom_enum.addTrain_scanTicket && isNotEmptyObj(that.toast)){
          setTimeout(() => {
            Taro.showToast({//弹框一次：行程已结束或已绑定
              title: that.toast,
              icon:'none',
              duration: 2000,
              complete: function(){
                that.toast = ''
              }
            })
          }, 500);
        }
      }

      /**
       * 获取车次详情
       */
      getTicket = (dateC) => {
        var that = this
        API.StationService.getStationToStationByTrainNo({strokeTime:dateC,trainNo:that.trainNo,startStation:this.from_station,endStation:this.to_station})
        .then(res => {
          Taro.setStorageSync('dateC', dateC)
          that.init_data(res.data.data, dateC)
        })
        .catch((e) => {

        })
      }

      /**
       * 返回，出发站选择是否 完成
       */
      check_selectStationComplete = () => {
        var selectStations = this.state.selectStations ? this.state.selectStations : []
        return selectStations && selectStations.length >=2
      }

      /**
       * 处理完，跨天后，-> 立即判断是否结束与绑定(api)
       */
      handle_check_tripisEndorBinded = () => {
        let that = this
        var {dateC, selectStations} = that.state

        let startTime = selectStations[0].startTime
        let endTime = selectStations[1].endTime
        let from_name = selectStations[0].stationName
        let to_name = selectStations[1].stationName
        let depDate = selectStations[0].depDate
        that.setState({
          bottom_btn_enable: true,
        })
      }

      /**
       * 点击事件：正点率
       */
      jump_ontimeRate = (e) => {
        var that = this
        if(that.trainNo && that.trainNo!=''){
          Taro.navigateTo({
            url: '../stationSchedule/index?trainNo=' + that.trainNo + '&departStation='+this.from_station +'&arriveStation='+this.to_station
          })
        }
      }

      beforeAfterClick = (e) => {

        const {selectStations} = this.state
        let p = e.currentTarget.dataset.t
        let section_num = selectStations[0].section_num
        if(p == 'before' && selectStations[0].stationIndex == 0){//选择起点
          return
        }

        if(p == 'before'){
         this.setState({
           befort_status_expant: !this.state.befort_status_expant
         })
        }else if(p == 'after'){
          this.setState({
            after_status_expant: !this.state.after_status_expant
          })
        }
      }

  // nextDay， 选择前一天 修复，日期比较不对
  // 前一天：今天时，不可选前一天，样式调整
      render(){
        var that = this
        var {stationList} = this.state

        let base_img_url = "https://www.cx9z.com/h5/tarocx9z/czt_v1/searchResult/" //图片地址
        var selects = this.state.selectStations
        let current_status = select_station_status.select_two
        var station_html =  null
        var select_item1_index = -1; //选中两个时，第一个选中索引
        var select_item2_index = -1; //选中两个时，第二个选中索引

        let is_two = selects.length == 2 && current_status == select_station_status.select_two
        var is_has_before = false
        var is_has_after = false

        var tip_before = ''//3个前序站
        var tip_after = ''//2个后序站

        var sectionNum = 0 //分组数量
        var is_show_section = false

        if(is_two){
          if(selects[0].stationIndex > selects[1].stationIndex){ // 0 终点，1起点，交换位置
              var temp = selects[0];
              selects[0] = selects[1];
              selects[1] = temp;
          }
          select_item1_index = selects[0].stationIndex
          select_item2_index = selects[1].stationIndex

          is_has_before = select_item1_index > 0 // 有前序站
          is_has_after = select_item2_index < (this.state.stationList.length-1) // 有后序站

          if(is_has_before){
            tip_before = select_item1_index+'个前序站'
          }

          if(is_has_after){
            tip_after = (this.state.stationList.length-select_item2_index-1)+'个后序站'
          }
        }

        if(selects && selects.length > 0){
          sectionNum = selects[0].section_num
          if(sectionNum >= 1){
            is_show_section = true
          }
        }

       var befort_status_expant = this.state.befort_status_expant
       let is_section_date_line_img = (index) => {
        return  is_show_section && this.state.stationList[index].section
       }

       let html_1 = this.state.stationList.map((item, index) => {
            var is_selected = false // 选中状态
            var is_middele_station = false // 是否为途径站点 select_two
            var circle_content_class = ''
            var cicle_class = ''
            var th_right_class = ''

            //前序未展开，收起时 、 后序未展开，收起时
            let display = (index < select_item1_index && !befort_status_expant) || (index > select_item2_index && !this.state.after_status_expant) ? false:true
            if(current_status == select_station_status.select_two){
              // select_two:  select_item1_index选中状态而之前索引都为灰色, select_item2_index选中状态而之后都为灰色，两者之间为途径站点
              is_selected = (select_item1_index == index) || (select_item2_index == index) // 选中状态
              circle_content_class = is_selected ? 'circle_content_large' : ''

              is_middele_station = !(index < select_item1_index || index > select_item2_index)
              cicle_class = is_selected ? 'circleImage_blue_large' : (is_middele_station ? 'circleImage_blue':'circleImage_gray')
              th_right_class = is_selected ? 'th_right_select' : (is_middele_station ? 'th_right_middele':'th_right_gray')
            }

            //前后序，展示的文字提示语图片
            var tip_expant_txt = index == 0 ? (befort_status_expant ? '收起':'展开') : (this.state.after_status_expant ? '收起':'展开')
            var tip_expant_img = index == 0 ? (befort_status_expant ? 'icon_zhankai.png' : 'icon_shouqi.png') : (this.state.after_status_expant ? 'icon_zhankai.png' : 'icon_shouqi.png')
            var tip_text = index == 0 ? tip_before : tip_after
            var befort_after_html = null // 保存展示第一个前站view  与  终点位置 后序站 view

            if((is_has_before && index == 0) || (is_has_after && (select_item2_index == index-1))){// 前后序站 -> 视图添加
              befort_after_html =  (
                <View className='th' style='z-index:10;'>
                        <View className='th_circle'>
                            <View  className={'circle_content'}>
                                <View className={'circleImage_small_bg_gray'}></View>
                            </View>
                        </View>
                        <View className='th_right'>
                          <Text style='font-size: 13px;color:#333333;'>{tip_text}</Text>
                          <View style='display: flex;align-items: center;padding-left:10px; padding-top:10px;padding-bottom:10px;'
                            data-t={index == 0 ?'before':'after'} onClick={this.beforeAfterClick}>
                            <Text style='font-size: 13px;color:#0196ff;'>{tip_expant_txt}</Text>
                            <Image style='width:17px;height:17px;margin-left:5px;' src={base_img_url+tip_expant_img}></Image>
                          </View>
                        </View>
                </View>
              )
            }

            var is_section_date = is_section_date_line_img(index)
            var tip_style = ' '//  ((is_selected || is_middele_station) && item.lateStatus == 2) ? 'color: #f95353;':(item.lateStatus==3 ? 'color:#2ab575;':'')
            if((is_selected || is_middele_station) && item.lateStatus == 2){
              tip_style += ' color: #2ab575;'
            }else if(is_middele_station && item.lateStatus==3){
              tip_style += ' color: #f95353;'
            }



            var line_class = ''
            if(index == 0){
              line_class = ''
            }else {// 出发与到达站点 蓝色线条
              let preIndex = index - 1
              line_class = (preIndex < select_item1_index || preIndex > select_item2_index-1) ? '' : 'line line_blue'
              if((!befort_status_expant && preIndex > 0) || (befort_status_expant)){
                if(is_section_date){
                  line_class = line_class + " line_large_h"
                }
              }
            }

            let is_show_line = isNotEmptyObj(line_class)
            return (
              <Block key={'th_'+index}>
                  {befort_after_html}
                  <View className='th_content'>
                    {display && <Block>
                          {is_show_line ?  <View key={"line_"+index} className='line_split'>
                             <View className={line_class}></View>
                           </View> : null
                          }
                          <View className={(is_section_date)?'th th_large_h':'th'}>
                            <View className='th_circle'>
                              <View  className={'circle_content '+circle_content_class}>
                                  <View className={cicle_class}></View>
                              </View>
                          </View>
                             <View className={'th_right '+th_right_class}>
                              <View className='tip'>{item.stationName}</View>
                              <View className='tip' style="width:16%">{item.arrTime_text}</View>
                              <View className='tip' >{item.expectedToStayTime_text}</View>
                              <View className='tip' >{item.depTime_text}</View>
                              <View className='tip' style={tip_style+' width:28%;'}>
                                  {item.status_text}
                              </View>

                          </View>
                          </View>
                         {is_section_date ? <View className='section_date'>
                                {item.sectionTitle}
                          </View> : null}
                    </Block>}
                  </View>
              </Block>
          )
        })

        station_html = (
          <View className='list_content'>
              { html_1}
          </View>
        );

        //0 可绑定(未结束或未绑定) 2已经绑定 3已结束   -1: fail
        var is_show_bottomBtn = true
        let is_monment_enter = (this.sourcefrom == addTrip_sourcefrom_enum.addTrain_scanTicket) || (this.sourcefrom == addTrip_sourcefrom_enum.momentSearch_scanTicket) || (this.sourcefrom == addTrip_sourcefrom_enum.momentSearch_trainSearch) || (this.sourcefrom == addTrip_sourcefrom_enum.momentSearch_stationSearch)
        if(is_monment_enter){//扫描或时刻查询进入
          is_show_bottomBtn = this.state.train_check_status == '0'
        }
        let is_bottomBtn_enable =   this.state.bottom_btn_enable && this.state.selectStations && this.state.selectStations.length >= 2
        let show_rate = this.state.show_arriveOntimeRate || isNotEmptyObj(this.state.arriveOntimeRate)
        var m_station_content_class = is_show_bottomBtn?'m_station_content':'m_station_content_noBottom'
        if(!show_rate){
          m_station_content_class += ' m_station_content_noRate'
        }

          return (
              <View className='content_box'>
                 <View className='m_top'>
                    {show_rate ? <View className='rate_content'  onClick={this.jump_ontimeRate}>
                        <View className='rateTip'>到达正点率</View>
                        <View className='rateRight' >
                          {this.state.arriveOntimeRate}
                          <Image className='arr_right' src={base_img_url+"icon_xiangyou.png"}></Image>
                        </View>
                      </View> : null
                    }
                    <View className={'content2' + (show_rate ? '' : ' content2_noRate')}>
                        <View className='wrap'>
                          <Text className='tip'>站名</Text>
                          <Text className='tip' style='width:16%;'>到站</Text>
                          <Text className='tip'>停留</Text>
                          <Text className='tip'>出发</Text>
                          <Text className='tip' style="width:28%;text-align:right;">状态</Text>
                          <View className='line'></View>
                        </View>
                    </View>
                 </View>

                  <View className={m_station_content_class}>
                      <ScrollView  scrollY  style='width:100%; height:100%;'>
                            <View className='list'  style='position:relative;'>
                            <View className={'line_all '+(select_item1_index == 0 ? 'line_all_selectFirstFrom':'')}>
                              <View className='line_all_content'></View>
                            </View>
                            {station_html}
                          </View>
                      </ScrollView>
                    </View>
                  </View>
          )
      }
}
