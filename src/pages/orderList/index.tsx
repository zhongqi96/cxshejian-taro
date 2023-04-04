import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Image, Button, ScrollView, Block } from '@tarojs/components'
import API from '@/api'

import OrderItem from "@/components/order_item/order_item";

// import { onChangeAuthType } from '@/store/actions'

import './index.scss'

type PageStateProps = {
  isShowAuthButton: boolean
}

type PageDispatchProps = {
  // onChangeAuthType: () => any
}

type PageOwnProps = {}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface OrderList {
  props: IProps;
}

const STATUS = ['', 0, 1, 2, 3]; // 订单状态编码

@connect(({ counter }) => ({
  ...counter
}), () => ({
  // onChangeAuthType(payload) {
  //   dispatch(onChangeAuthType(payload))
  // }
}))
class OrderList extends Component {
  state = {
    currentTab: 0,
    currentPage: 1,
    orderList: [],
    isRefresh: false,
    currentOrderType: 0
  }

  UNSAFE_componentWillMount(): void {
    this.getOrderList();
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {

    const { orderList, isRefresh, currentOrderType, currentTab } = this.state;
    const carriageTabList = [
      { title: '全部' },
      { title: '待付款' },
      { title: '待收货' },
      { title: '已完成' },
      { title: '已取消' }
    ];
    const orderTypes = ['车厢订单', '商城订单'];

    return (
      <View className='order-list'>
        <Block>
          <View className="order-type">
            {
              orderTypes.map((type, i) => {
                return (
                  <View
                    className={`type ${currentOrderType === i ? 'active' : ''}`}
                    key={i}
                    onClick={e => this.changeOrderType(e, i)}
                  >
                    {type}
                  </View>
                )
              })
            }
          </View>
          {
            // 车厢订单
            currentOrderType === 0 &&
            <View className="tab-box">
              {
                carriageTabList.map((item, index) => {
                  return <Text className={`tab-item ${currentTab === index ? 'active' : ''}`} key={'tab'+index} onClick={() => this.changeTab(index)}>{item.title}</Text>
                })
              }
            </View>
          }

          <ScrollView
            className='order-list-container'
            scrollY
            refresherEnabled
            refresherTriggered={isRefresh}
            onRefresherRefresh={this.refresh}
            onScrollToLower={this.reachBottom}
          >
            {
              orderList && orderList.length > 0 &&
              <View style="min-height: 100%">
                {
                  orderList.map((o, idx) => {
                    return (
                      <OrderItem
                        order={o}
                        key={idx}
                        afterUrgeOrder={this.getOrderList}
                      />
                    )
                  })
                }
              </View>
            }
          </ScrollView>
        </Block>
      </View>
    )
  }

  // isReachBottom ==> 为true说明是上拉加载请求, isPullDownRefresh ===> 为true说明是下拉刷新
  getOrderList = (isReachBottom = false, isPullDownRefresh = false) => {
    const data = {
      pageNumber: this.state.currentPage,
      pageSize: 10,
      status: STATUS[this.state.currentTab],
    };
    API.Order.getOrderList(data).then(orders => {
      if (orders.code === 1) {
        if (isPullDownRefresh) {
          this.setState({orderList: []}, () => {
            this.handleOrderList(orders.data.items, isReachBottom);
          });
        } else {
          this.handleOrderList(orders.data.items, isReachBottom);
        }
      } else {
        Taro.showToast({ title: orders.message, icon: "none", duration: 1500, mask: true });
      }
    }).catch(() => Taro.showToast({ title: '获取订单列表失败', icon: "none", duration: 1500, mask: true }));
  }

  // 处理订单信息
  handleOrderList = (orderList, isReachBottom) => {
    let newOrderList: any[] = [...this.state.orderList];
    // 如果订单列表为空，直接添加数据
    if (!this.state.orderList.length) {
      newOrderList = orderList;
    } else {
      // 如果是下拉加载，则直接在数组中添加数据
      if (isReachBottom) {
        orderList.forEach(item => newOrderList.push(item));
      } else {
        // 如果不是下拉加载，判断是否改变订单状态和催单状态
        newOrderList.forEach(orderItem => {
          orderList.forEach(item => {
            if (item.orderId === orderItem.orderId) {
              orderItem.status = item.status !== orderItem.status ? item.status : orderItem.status;
              orderItem.urged = item.urged !== orderItem.urged ? item.urged : orderItem.urged;
            }
          });
        });
      }
    }
    this.setState({
      orderList: newOrderList,
      isRefresh: false
    });
  }

  // 切换车厢订单类型
  changeTab = (index) => {
    this.setState({
      currentTab: index,
      currentPage: 1
    }, () => {
      this.getOrderList(false, true);
    });
  }

  // 切换订单列表类型
  changeOrderType = (e, type: number) => {
    this.setState({
      currentTab: 0,
      currentOrderType: type
    });
  }

  // 下拉刷新
  refresh = () => {
    this.setState({
      currentPage: 1,
      isRefresh: true
    }, () => {
      this.getOrderList(false, true);
    });
  }

  // 上拉加载更多
  reachBottom = () => {
    let page = this.state.currentPage + 1;
    this.setState({currentPage: page}, () => {
      this.getOrderList(true);
    });
  }

}

export default OrderList

