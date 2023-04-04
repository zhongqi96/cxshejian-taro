import Taro, { getCurrentInstance, getCurrentPages } from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text } from '@tarojs/components'
import './calendar.scss'
import dayjs from 'dayjs'
export default class Calendar extends Component {
  constructor(){
    super(...arguments)
    this.state={
      dateData: [],
      weeks: [],
      shareData: ''
    }
    this.updateRef=''
  }

  config = {
    navigationBarTitleText: '选择日期'
  }

  UNSAFE_componentWillMount () {
    let params = getCurrentInstance().router.params
    if(params){
      if(params.updateRef){
        this.updateRef = params.updateRef
      }
    }
   }

  componentDidMount () {
    let that = this
    that.dateData()
  }

  componentWillUnmount () { }

  componentDidShow () {

  }

  componentDidHide () { }

  //生成日历
  dateData = () => {
    let dataAll = []//总日历数据
    let dataAll2 = []//总日历数据
    let dataMonth = []//月日历数据
    let date = new Date//当前日期
    let year = date.getFullYear()//当前年
    let week = date.getDay();//当天星期几
    let weeks = []
    let month = date.getMonth() + 1//当前月份
    let day = date.getDate()//当天
    let daysCount = 90 //一共显示多少天
    let dayscNow = 0//计数器
    let monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]//月份列表
    let nowMonthList = []//本年剩余年份
    for (let i = month; i < 13; i++) {
      nowMonthList.push(i)
    }
    let yearList = [year]//年份最大可能
    for (let i = 0; i < daysCount / 365 + 2; i++) {
      yearList.push(year + i + 1)
    }
    let leapYear = function (Year) {//判断是否闰年
      if (((Year % 4) == 0) && ((Year % 100) != 0) || ((Year % 400) == 0)) {
        return (true);
      } else { return (false); }
    }
    for (let i = 0; i < yearList.length; i++) {//遍历年
      let mList
      if (yearList[i] == year) {//判断当前年份
        mList = nowMonthList
      } else {
        mList = monthList
      }
      for (let j = 0; j < mList.length; j++) {//循环月份
        dataMonth = []
        let t_days = [31, 28 + leapYear(yearList[i]), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        let t_days_thisYear = []
        if (yearList[i] == year) {
          for (let m = 0; m < nowMonthList.length; m++) {
            t_days_thisYear.push(t_days[mList[m] - 1])
          }
          t_days = t_days_thisYear
        } else {
          t_days = [31, 28 + leapYear(yearList[i]), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        }
        for (let k = 0; k < t_days[j]; k++) {//循环每天
          dayscNow++
          let nowData
          if (dayscNow < daysCount) {//如果计数器没满
            let days = k + 1
            if (days < 10) {
              days = "0" + days
            }
            if (yearList[i] == year && mList[j] == month) {//判断当年当月
              if (k + 1 >= day) {
                nowData = {
                  year: yearList[i],
                  month: mList[j],
                  day: k + 1,
                  date: yearList[i] + "" + mList[j] + days,
                  selected: 0,
                  re: yearList[i] + "/" + mList[j] + "/" + days,
                }
                dataMonth.push(nowData)
                if (k + 1 == day) {
                  let date = new Date(yearList[i] + "/" + mList[j] + "/" + (k + 1))
                  let weekss = date.getDay()//获取每个月第一天是周几
                  weeks.push(weekss)
                }
              }
            } else {//其他情况
              nowData = {//组装自己需要的数据
                year: yearList[i],
                month: mList[j],
                day: k + 1,
                date: yearList[i] + "" + mList[j] + days,
                selected: 0,
                re: yearList[i] + "/" + mList[j] + "/" + days,
              }
              dataMonth.push(nowData)
              if (k == 0) {
                let date = new Date(yearList[i] + "/" + mList[j] + "/" + k + 1)
                let weekss = date.getDay()//获取每个月第一天是周几
                weeks.push(weekss)
              }
            }
          } else {
            break
          }
        }
        dataAll.push(dataMonth)
      }
    }
    for (let i = 0; i < dataAll.length; i++) {
      if (dataAll[i].length != 0) {
        dataAll2.push(dataAll[i]);
      }
    }
    this.setState({
      dateData: dataAll2,
      weeks: weeks
    })

  }

  //选择日期
  selectday = (e) => {

    let DATE = this.state.dateData;
    let monthArray = e.currentTarget.dataset.index;
    let dateArray = e.currentTarget.dataset.indexs;

    let toDay = new Date().getFullYear() + '-' +(new Date().getMonth()+1) + '-' + new Date().getDate();

    let weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][new Date(DATE[monthArray][dateArray].re).getDay()];
    let dateC = DATE[monthArray][dateArray].year + '-' + (DATE[monthArray][dateArray].month >= 10 ? DATE[monthArray][dateArray].month : '0' + DATE[monthArray][dateArray].month) + '-' + (DATE[monthArray][dateArray].day >= 10 ? DATE[monthArray][dateArray].day : '0' + DATE[monthArray][dateArray].day);

    let timeCC =  dayjs(dateC).format(('MM月DD日'))

    if (toDay != (DATE[monthArray][dateArray].year + '-' + DATE[monthArray][dateArray].month + '-' + DATE[monthArray][dateArray].day)) {
      toDay = ''
      Taro.setStorageSync('toDay','')
    }else{
      toDay = '今天'
      Taro.setStorageSync('toDay','今天')
    }

    let pages = getCurrentPages();//当前页面栈
    // $component $$refs
    if (pages.length >1) {

        var beforePage = pages[pages.length- 2];//获取上一个页面实例对象
        // beforePage.updateBackPageData()
        let data = {
          dateC: dateC,//2019-07-05
          timeCC: timeCC,//07月05日
          weekDay:weekDay, //星期五
          toDay: toDay // ''/今天
        }
        beforePage.setData(data)

        // beforePage.setData({
        //   // dateC:data.dateC,
        //   // timeCC: data.timeCC,
        //   // weekDay: data.weekDay,
        //   // toDay: data.toDay,
        //   dateC: '2020-08-12',
        //   timeCC: '08月12日',
        //   weekDay: '星期五',
        //   toDay: '今天',
        // })

        setTimeout(() => {
          Taro.navigateBack({delta: 1})
        })


      //  if(this.updateRef != ''){
      //     let refs = beforePage.$component.$$refs

      //     if(refs && refs.length > 0){
      //       for(var i = 0; i<refs.length; i++){
      //         let item = refs[i]
      //         if(item.refName == this.updateRef){//item.refName == 'tripCard'
      //           let target_component = item.target
      //           //触发父页面中 子组件的方法
      //           target_component && target_component.updateBackPageData && target_component.updateBackPageData('date',data)
      //           Taro.navigateBack({delta: 1})
      //           return
      //         }
      //       }
      //     }
      //   }else{//回退页面数据更新
      //     beforePage.$component.updateBackPageData && beforePage.$component.updateBackPageData('date',data)
      //     Taro.navigateBack({delta: 1})
      //  }
    }
  }

  render () {
    let { dateData,weeks} = this.state
    const HaveDay = ({dated,index}) => {
      return (
        dated.map((item, idx) => {

          return <View className={`day ${+item.selected === 1 ? 'bc' : ''} ${+idx === 0 && +index === 0 ? 'todaySty' : ''}`} key={idx} data-index={index} data-indexs={idx} onClick={this.selectday}>
            <View className={`actname ${item.selected == 1 ? 'bc2' : ''}`}></View>
            {(idx == 0 && index==0) && <Text>今天</Text>}
            {!(idx == 0 && index==0) && <Text> {dated[idx].day}</Text>}
          </View>
        })
      )
    }
    const dates = dateData.map((dated, index) => {
      return <View className='mouth' key={index}>
        <View className='mouthhead'>{dated[index].year}年{dated[index].month}月</View>
        <View className='dayBox'>
          {weeks[index]>0 && <View className='day'></View>}
          {weeks[index]>1 && <View className='day'></View>}
          {weeks[index]>2 && <View className='day'></View>}
          {weeks[index]>3 && <View className='day'></View>}
          {weeks[index]>4 && <View className='day'></View>}
          {weeks[index]>5 && <View className='day'></View>}
          {/* {haveDay} */}
          <HaveDay dated={dated} index={index}/>
        </View>
      </View>
    })



    return (
      <View className='calendar'>
        <View className="headbox2">
          <View className="headdate">日</View>
          <View className="headdate">一</View>
          <View className="headdate">二</View>
          <View className="headdate">三</View>
          <View className="headdate">四</View>
          <View className="headdate">五</View>
          <View className="headdate">六</View>
        </View>
        <View className="headbox">
          <View className="headdate">日</View>
          <View className="headdate">一</View>
          <View className="headdate">二</View>
          <View className="headdate">三</View>
          <View className="headdate">四</View>
          <View className="headdate">五</View>
          <View className="headdate">六</View>
        </View>
        {dates}
      </View>
    )
  }
}
