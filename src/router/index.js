import Vue from 'vue'
import Router from 'vue-router'


import rank from '@/components/rank/rank'
import singer from '@/components/singer/singer'
import recommend from '@/components/recommend/recommend'
import search from '@/components/search/search'
import songListDetail from '@/components/songListDetail/songListDetail'
import singerListDetail from '@/components/singerListDetail/singerListDetail'
import rankListDetail from '@/components/rankListDetail/rankListDetail'
import MyUser from '@/components/MyUser/MyUser'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect:'/recommend'
    },
     {
      path: '/user',
      name: 'user',
      component: MyUser
      },
    {
      path: '/rank',
      name: 'rank',
      component: rank,
      children: [
        {
          path: ':id',
          name: 'ranklistdetail',
          component: rankListDetail
        }
      ]
    },
    
    {
      path: '/singer',
      name: 'singer',
      component: singer,
      children: [
        {
          path: ':id',
          name: 'singerListDetail',
          component: singerListDetail
        }
      ]
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: recommend,
      children: [
        {
          path: ':id',
          name: 'songlistdetail',
          component: songListDetail
        }
      ]
    },
    {
      path: '/search',
      name: 'search',
      component: search,
      children: [
        {
          path: ':id',
          name: 'searchSingerListDatail',
          component: singerListDetail
        }
      ]
    },
    
  ]
})
