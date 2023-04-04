import request from '@/utils/api'

export default {
  getCity(data) {
      const url = ``
      return request.get({ url, data})
  },
  changeUserInfo(data) {
    const url = ``
    return request.get({ url, data})
  },
  verifyAuth(data) {
    const url = ``
    return request.get({ url, data})
  },
  // 用户登录
  login(data) {
    const url = `/api/miniapp/api/login/wechatLogin`
    return request.post({ url, data, loading: false})
  },
  // 解密手机号
  getPhoneNumber(data) {
    const url = `/api/miniapp/api/member/wechatBindMobile`
    return request.post({ url, data })
  },
  // 会员信息添加手机号
  addPhoneToUser(data) {
    const url = `/api/miniapp/api/member/changeMemberInfo`
    return request.post({ url, data })
  },
  // 更改用户信息
  setUserInfo(data) {
    const url = `/api/miniapp/api/member/changeMemberInfo`
    return request.get({ url, data })
  },
  getUserInfo(data) {
    const url = `/api/miniapp//api/member/memberInfo`
    return request.get({ url, data })
  }




}
