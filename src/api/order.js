import request from '@/utils/api'

export default {
  // 获取订单列表
  getOrderList(data, loading) {
    const url = `/api/miniapp/api/trainOrder/page`
    return request.get({ url, data, loading })
  },
  // 用户授权
  verifyAuth(data) {
    const url = `/auth`
    return request.get({ url, data })
  },
  // 催单
  reminder(data) {
    const url = `/api/miniapp/api/trainOrder/urge`
    return request.get({ url, data })
  },
  // 提交订单
  createOrder(data) {
    const url = `/api/miniapp/api/trainOrder/create`
    return request.post({ url, data })
  },
  // 发起支付
  createPayment(data) {
    const url = `/api/miniapp/api/payment/pay`
    return request.post({ url, data })
  },
  // 获取送餐时间列表
  getDeliveryTime(data) {
    const url = `/api/miniapp/api/train/listDeliverTime`
    return request.get({ url, data })
  },
  // 订单详情
  getOrderDetail(data, loading) {
    const url = `/api/miniapp/api/trainOrder/detail`
    return request.get({ url, data, loading })
  },
  // 获取车次途径站点列表
  getStations(data) {
    const url = `/api/miniapp/api/train/listStation`
    return request.get({ url, data })
  }


}
