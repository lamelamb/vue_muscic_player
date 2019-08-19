import jsonp from 'common/js/jsonp'
import { commonParams, opts } from '@/api/config'
import axios from 'axios'


/**
 * jsonp 抓取推荐页轮播图数据
 * 接口：https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg
 */
export function getRecommend() {
 
  let url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  let data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })
  return jsonp(url, data, opts)
}

/**
 * axios 抓取推荐页列表数据
 * 接口：https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg
 * 接口提供方使用了 referer:https://y.qq.com/portal/playlist.html
 * axios 结合 node.js 代理后端请求
 *  sin ， esin 是分页参数，标识从第0 个获取到第29 个 ，一共30 个
 */
export function getList() {
  let url = '/api/getList'
  let data = Object.assign({}, commonParams, {
    rnd: Math.random(),
    hostUin: 0,
    format: 'json',
    platform: 'yqq',
    needNewCode: 0,
    categoryId: 10000000,
    sortId: 5,
    sin: 0,
    ein: 29
  })
  return axios.get(url, {
    params: data
  })   
        
  .then(function(response) {
  	  //  将数据或者方法进行Promsie转换，使他成为promise的一个实例，能被对应的.then和.catch捕获
  	  // 这里就是ajax 成功后可以对response.data 使用then 方法进行处理
  	  // 直接使用 Promise 类上的resolve 方法，立刻变更状态，传入 response.data去除的数据
    return Promise.resolve(response.data)
  })
  .catch(function(error) {
    console.log(error)
  })
}

/**
 * jsonp 抓取推荐页歌单数据
 * 
 * 接口：https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg
 * 提供方：https://y.qq.com/n/yqq/playlist/1471714611.html#
 * 这一段代码已经qq 做了host 和 refer 验证，所以得使用代理的方式axios ,不能直接童年过jsonp 获取了
 * 原来的接口已经不可用了。返回的是一个错误的字符串
 */
export function getSongList(disstid) {
   let url = '/api/getDisc'
  let data = Object.assign({}, commonParams, {
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    new_format: 1,
    disstid,
    g_tk: 5381,
    loginUin: 0,
    hostUin: 0,
    format: 'json',
    inCharset: 'json',
    outCharset: 'utf-8',
    notice: 0,
    platform:'yqq.json' ,
    needNewCode: 0
  })
  
			return axios.get(url, {
				params: data
			})   
			.then(function(response) {
				return Promise.resolve(response.data)
			})
			.catch(function(error) {
				console.log(error)
			})
}
