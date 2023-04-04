import Taro, { showToast } from '@tarojs/taro'
import dayjs from 'dayjs'

// 添加行程类型 来源
export const addTrip_sourcefrom_enum = {
    /** 时刻查询下   扫描车次查询 （
        -> 扫描 api，
          state != 1 toast 提示失败
          state = 1 结束未结束 -> 跳转车次结果页  ( state 未返回车次是否绑定状态) 
           -> 1、 若此车次结束或已绑定, 不显示立即添加按钮  
           -> 2、 若未结束与未绑定 -> 点击立即添加按钮 -> api绑定行程 -> 绑定行程成功 -> 跳转车次详情  
     */
    momentSearch_scanTicket: '0',  // (车次结果页, 车次详情）
  
    /** 时刻查询下   车次查询 （
        -> 跳转选择出发站(填充发/到站) -> 选择完出发站  ----------- 1
        -> 立即进行跨天判断后(本地)                                   ----------- 3
        -> 立即判断是否结束与绑定(api) -> 判断成功                           ----------- 4
  ----------- 5      
        -> 跳转车次结果页 
           -> 1、 若此车次结束或已绑定, 不显示立即添加按钮  
           -> 2、 若未结束与未绑定 -> 点击立即添加按钮 -> api绑定行程 -> 绑定行程成功 -> 跳转车次详情  
     */
    momentSearch_trainSearch: '1',  // (跳转选择出发站，车次结果页, 车次详情）
    
    /**  时刻查询下 站站查询（跳转车次结果页）
         站站查询 -> 跳转车次选择页 -> 选择车次后                   ----------- 2
         -> 立即判断是否结束与绑定(api) -> 判断成功                          ----------- 4
  ----------- 5 
         -> 后续同上
     */
    momentSearch_stationSearch:'2',  // (跳转车次选择页，车次结果页, 车次详情）
    
    /** 车站大屏     
        -> 跳转选择出发站(填充发/到站) -> 选择完出发站  ----------- 1
        -> 点击 选择出发站页 确定添加按钮 ( ****** 注 ****** )
        -> 立即进行跨天判断后(本地)                                   ----------- 3
        -> 立即判断是否结束与绑定(api) -> 判断成功                          ----------- 4
  ----------- 6
           1、 若此车次结束或已绑定，toast提示用户，不跳转
           2、 若未结束与未绑定，请求api去绑定行程，绑定成功跳转车次详情  
     */
    largeScreenQuery: '3',  // (跳转选择出发站， 车次详情）
  
    /** 添加行程下  车次查询 
        -> 跳转选择出发站(填充发/到站) -> 选择完出发站  ----------- 1
        -> 点击 选择出发站页 确定添加按钮 ( ****** 注 ****** )
        -> 立即进行跨天判断后(本地)                                   ----------- 3
        -> 立即判断是否结束与绑定(api) -> 判断成功                          ----------- 4
  ----------- 6
        ->  后续同上（同候车大屏）
     */
    addTrain_trainSearch: '4',// (跳转选择出发站，车次详情）
    
     /** 添加行程下，
       站站查询 -> 跳转车次选择页 -> 选择车次后                   ----------- 2
       -> 点击 选择页 底部 确定添加按钮 ( ****** 注 ****** )
       -> 立即判断是否结束与绑定(api) -> 判断成功                          ----------- 4
  ----------- 6
       ->  后续同上
     */
    addTrain_stationSearch: '5', // (跳转车次选择页，车次详情）
  
    /** 行程下，扫码添加行程 （
        -> 同 : 时刻查询下，扫描车次查询
     */
    addTrain_scanTicket:'6', // (车次结果页, 车次详情)
  }
/**
   * 判断为空 => 为null unidefined ''
   * @param {*} obj
   */
  export const isEmptyObj = (obj) => {
    if(obj == null || obj == undefined || obj == ''){
      return true
    }
    return false
  }
  /**
   * 判断不为空 => 不为null unidefined ''
   * @param {*} obj
   */
  export const isNotEmptyObj = (obj) => {
    return !isEmptyObj(obj)
  }
  /**
 *  url 字符串 获取 参数对象
 * */
export function parseUrlStr2ParamsObj(url='') {
    if(!isNotEmptyObj(url)){
      return {}
    }

    var obj = {};
    var keyvalue = [];
    var key = "",
        value = "";
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    for (var i in paraString) {
        keyvalue = paraString[i].split("=");
        key = keyvalue[0];
        value = keyvalue[1];
        obj[key] = value;
    }
    return obj;
}

/**
   * 返回日期 年月日时分秒 之间的跨天天数
   * 
   */
  export function get_date_crossDay(beforeDate, afterDate){
    return dayjs(afterDate).diff(beforeDate, 'day')
}

/**
 * 选择车次 状态
 */
export const select_station_status = {
  'select_no': 0,//初始状态，一个都未选中，所有按钮都 可选状态
  'select_one': 1,//选中一个状态，不知道是出发站或到达站 ，则高亮此 按钮 -> 其他 按钮可选状态
  'select_one_startStation':2,//选中一个状态 且为出发站，则高亮此 按钮，之前按钮都不可选状态，之后按钮都可选状态
  'select_one_endStation':3,//选中一个状态 且为到达站，则高亮此 按钮，之前按钮都可选状态，之后按钮都不可选状态
  'select_two':4,// 选择两个状态， 则高亮两个按钮，之前按钮与之后按钮都不可选状态，中间按钮为途径站点(浅蓝色显示)
}

export function  get_stationSelect_status(select_Stations, is_send_from, is_send_to, do_select_click){
    
  var selectStations = select_Stations ? select_Stations : []
  let length_select = selectStations.length;

  var current_status = select_station_status.select_no
  let send_station_none = !is_send_from && !is_send_to// 未传入出发与到达站点
  if(length_select == 0){// 未选中站点，  
    if(do_select_click){
      current_status = select_station_status.select_no                  //都可选
    }else{//未做过选择站点操作
      if(send_station_none){//未传入出发与到达站点
        current_status = select_station_status.select_no                //都可选
      }else{
        if(is_send_from && is_send_to){ // 传入了出发与到达站点
          current_status = select_station_status.select_two               // 选择两个
        }else if(is_send_from){//只传入出发站点
          current_status = select_station_status.select_one_startStation  // 选择出发站
        }else if(is_send_to){//只传入到达站点
          current_status = select_station_status.select_one_endStation    //选择到达站
        }
      }
    }
  }else if(length_select == 1){//选中一个
    if(do_select_click){ //做了选择站点操作
        current_status= select_station_status.select_one                //选中一个，不知道出发还是到达站
    }else{//未做过选择站点操作
      if(is_send_from){
        current_status = select_station_status.select_one_startStation   // 选择出发站
      }else{ 
        current_status = select_station_status.select_one_endStation     //选择到达站
      }
    }
  }else if(length_select == 2){//选中两个
      current_status = select_station_status.select_two                  // 选择两个
  }
  return current_status;
}

/**
   * 对象转url参数 url
   * @param {*} data
   * @param {*} isPrefix
   */
  export function queryParams (data, isPrefix = false) {
    let prefix = isPrefix ? '?' : ''
    let _result = []
    for (let key in data) {
      let value = data[key]
      // 去掉为空的参数
      if (['', undefined, null].includes(value)) {
        continue
      }
      _result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
    }
 
    return _result.length ? prefix + _result.join('&') : ''
  }

  /**
       * 返回出发站(出发日期) 与 到达站(到达日期) 之间的跨天天数
       * @param {*} selectStations 选择出发站与到达站对象
       */
      export function get_fromToStation_crossDay(selectStations=[]){
        return dayjs(selectStations[1].arrDate).diff(selectStations[0].depDate, 'day')
   }

   /**
    * 是否跨天
    * @param {*} selectStations 选择出发站与到达站对象
    */
   export function check_isCrossDay(selectStations=[]){
    // debugger
    // 到达站到达日期 - 出发站出发日期 > 0 ? 跨天 : 为跨天
    let diff_day = get_fromToStation_crossDay(selectStations)//跨天天数
    let is_crossDay = diff_day > 0
    return is_crossDay
  }

  /**
     * 添加行程，跨天时，返回跨天时 选择7.12日期（需用户确定是7.12从A出发，还是7.12号到B）
     * @param {*} dateC 用户选择日期 
     * @param {*} selectStations 
     * 7.12 , 从A出发:   7.12 A->B 7.14
     * 7.12，到B ：      7.10 A->B 7.12
     * 对象返回:from_name to_name depDate depTime arrDate arrTime startTime endTime from_timeCC to_timeCC title
     */
    export function get_crossDatas(dateC,selectStations=[]){
    
      // 7.12从北京出发，还是 7.13号到上海
     var from_day = {}
     var to_day = {}

     let from_station = selectStations[0]
     let to_station = selectStations[1]
     let diff_day = get_fromToStation_crossDay(selectStations)
     //计算从出发：
     let get_obj = (is_from) => {
       let dateObj = {}

       dateObj.from_name = from_station.stationName
       dateObj.to_name = to_station.stationName
       dateObj.depTime = from_station.depTime
       dateObj.arrTime = to_station.arrTime
       if(is_from){//从当前日期出发 -> 7.12从 北京- 7.13上海
         dateObj.depDate = dateC,// 7.12   
         dateObj.arrDate = dayjs(dateObj.depDate).add(diff_day,'day').format('YYYY-MM-DD') // 7.13  -> 7.12 + 1(两者间跨天天数) = 7.12 通过出发站日期，加上 选择日期时出发站与到站站之间跨了几天，计算出最新到达站日期
         
       }else{// 当前日期为到达站日期, 7.12到， 需要算出(通过两者间的跨天时间与所选择) 7.11号从出发站北京出发 ->  从7.11 北京  - 7.12上海
         dateObj.arrDate = dateC // 7.13
         dateObj.depDate = dayjs(dateObj.arrDate).add(-diff_day, 'day').format('YYYY-MM-DD')  // 7.12 -> 7.13 - 1(两者间跨天天数) = 7.12
       }
   
       dateObj.startTime = dayjs(dateObj.depDate+ ' '+dateObj.depTime).format('YYYY-MM-DD HH:mm:ss')
       dateObj.endTime = dayjs(dateObj.arrDate+ ' '+dateObj.arrTime).format('YYYY-MM-DD HH:mm:ss')
       
       dateObj.from_timeCC = dayjs(dateObj.depDate).format('MM月DD日')
       dateObj.to_timeCC = dayjs(dateObj.arrDate).format('MM月DD日')

        // 06月12日 北京 → 上海 06月13日
       dateObj.title = dateObj.from_timeCC+" "+dateObj.from_name+ " → "+dateObj.to_name+" "+dateObj.to_timeCC
       return dateObj//from_name to_name depDate depTime arrDate arrTime startTime endTime from_timeCC to_timeCC title
     }

     from_day = get_obj(true)
     to_day = get_obj(false)
     let obj = {
       from:from_day, 
       to:to_day,
       titles:[from_day.title, to_day.title],
       nowTrainNo: from_station.nowTrainNo,
       diff_dayNum:diff_day,
     }
     return obj
   }
  
   export const getRandomColor = function() {
    return "rgb(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 10) + ')';
}

export function toast(title='加载中'){
  Taro.showLoading({ //显示loading
    title: title,
    mask: true,
  })
}

//判断为空
export const isEmptyObject = (obj) => {
  for(let key in obj){
    return false
  }
  return true
}