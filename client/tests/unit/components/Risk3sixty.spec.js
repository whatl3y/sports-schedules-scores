import assert from 'assert'
// import Vue from 'vue'
import App from '@/components/App.vue'

// Here are some Jasmine 2.0 tests, though you can
// use any test runner / assertion library combo you prefer
describe('App', function () {
  // Inspect the raw component options
  it('has a created hook', function () {
    assert.equal('function', typeof App.created)
  })

  // Evaluate the results of functions in
  // the raw component options
  it('sets the correct default data', () => {
    assert.equal('function', typeof App.data)
    const defaultData = App.data()
    // assert.equal(0, defaultData.stickyNotesBoard.notes.length)
  })

  // Inspect the component instance on mount
  // it('correctly sets the message when created', () => {
  //   const vm = new Vue(App).$mount()
  //   expect(vm.message).toBe('bye!')
  // })

  // Mount an instance and inspect the render output
  // it('renders the correct message', () => {
  //   const Constructor = Vue.extend(App)
  //   const vm = new Constructor().$mount()
  //   expect(vm.$el.textContent).toBe('bye!')
  // })
})
