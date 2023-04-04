import request from '@/utils/api'

export default {
  // 商品推荐列表
  getListData(data, loading) {
      const url = `/ziwoyou/mtourists-core/product/12306/products`
      return request.get({ url, data, loading })
  },
  // 获取定位
  getLocationCity(data) {
    const url = `/ziwoyou/mtourists-api/pddapi/index/getLocationCity`
    return request.get({ url, data })
  },
  // 获取城市列表
  getCityList(data) {
    const url = `/api/miniapp/api/train/listCity`
    return request.get({ url, data })
  },
  // 广告管理
  /**
   * 广告标识code定义
     首页顶部：home-head
     首页中部：home-middle
     下单支付成功页面：pay-success
     车厢美食：train-banner
   * */
  getAdData(data) {
    const url = `/api/miniapp/api/banner/list`
    return request.get({ url, data })
  },
  // 获取车次信息
  getTrain(data) {
    const url = `/api/miniapp/api/train/getByQrcode`
    return request.get({ url, data, toast: false })
  },
  // 获取用户已绑定行程信息
  getDistance(data) {
    const url = `/api/miniapp/api/schedule/nearest`
    return request.get({ url, data})
  },
  // 城市景点榜单
  getRankList(data) {
    const url = `/api/miniapp/api/placard/info`
    return request.get({ url, data })
  },
  // 查询列成途径城市
  getTrainCityList(data) {
    const url = `/api/miniapp/api/train/listStrok`
    return request.get({ url, data })
  }





}
