import request from '@/utils/api'

export default {
  // 商品推荐列表
  changeMobile(data, loading) {
    const url = `/ziwoyou/mtourists-core/user/mobile`
    return request.get({ url, data, loading })
  },
  minappUserPhone(data,loading) {
    const url = `/ziwoyou/mtourists-core/user/minappUserPhone`
    return request.get({ url, data, loading })
  },
  savaLink(data,loading) {
    const url = `/ziwoyou/mtourists-core/wechat/message/outer-link/save`
    return request.post({ url, data, loading })
  },
  attentionCode(data,loading) {
    const url = `/ziwoyou/mtourists-api/pddapi/user/attentionCode`
    return request.post({ url, data, loading })
  }
}
