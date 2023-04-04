export default {
  pages: [
      'pages/index/index',
      'pages/add/index',
      'pages/adPage/index',
      'pages/application/index',
      'pages/bindphone/index',
      'pages/calendar/index',
      'pages/carFood/index',
      'pages/city/index',
      'pages/createOrder/index',
      'pages/customer/index',
      'pages/findStation/index',
      'pages/guide/index',
      'pages/lateQueryResults/index',
      'pages/mall/index',
      'pages/onlineservice/index',
      'pages/orderDetail/index',
      'pages/orderList/index',
      'pages/orderSelectSite/index',
      'pages/payment/index',
      'pages/payResult/index',
      'pages/poster/index',
      'pages/rankList/index',
      'pages/selectSite/index',
      'pages/stationLargeScreen/index',
      'pages/switchStation/index',
      'pages/trainState/index',
      'pages/user/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '12306.舌尖上的旅途',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: "#2cb1fc",
    borderStyle: "black",
    backgroundColor: "#ffffff",
    list: [
      {
        text: "首页",
        pagePath: "pages/index/index",
        iconPath: "./static/img/tabBar/index.png",
        selectedIconPath: "./static/img/tabBar/index_active.png"
      },
      {
        text: "旅行商城",
        pagePath: "pages/mall/index",
        iconPath: "./static/img/tabBar/mall.png",
        selectedIconPath: "./static/img/tabBar/mall_active.png"
      },
      {
        text: "行程",
        pagePath: "pages/trainState/index",
        iconPath: "./static/img/tabBar/distance.png",
        selectedIconPath: "./static/img/tabBar/distance_active.png"
      },
      {
        text: "我的",
        pagePath: "pages/user/index",
        iconPath: "./static/img/tabBar/user.png",
        selectedIconPath: "./static/img/tabBar/user_active.png"
      }
    ]
  },
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于小程序',
    },
    // 'scope.userInfo': {
    //   desc: 'sdf'
    // }
  }
}
