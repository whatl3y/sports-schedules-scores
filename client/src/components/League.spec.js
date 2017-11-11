import Vue from 'vue'
import Home from '@/components/Home'

describe('Home.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Home)
    const vm = new Constructor().$mount()
    // expect(vm.$el.querySelector('.main h3').textContent)
    //   .to.equal('Welcome to Your Vue.js App')
  })
})
