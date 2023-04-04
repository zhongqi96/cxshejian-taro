import request from '@/utils/api'

export default {
  // 车厢商品推荐
  getCarData(data, loading) {
      const url = `/api/miniapp/api/trainProduct/list`
      return request.get({ url, data, loading })
  },




}
