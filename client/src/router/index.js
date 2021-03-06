import Vue from 'vue'
import VueRouter from 'vue-router'
import League from '@/components/League'
import Team from '@/components/Team'
import DailySchedule from '@/components/DailySchedule'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/league/:league', component: League, props: true },
    { path: '/league/:league/schedule*', component: DailySchedule, props: true },
    { path: '/team/:league/:teamid', component: Team, props: true },
    { path: '*', component: League }
  ]
})
