import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import { mount, createLocalVue } from 'vue-test-utils'

import Login from '@/pages/login'

Vue.use(ElementUI)

// 独立 Vue 构造函数
const localVue = createLocalVue()

localVue.use(Vuex)

describe('login.vue', () => {
  let wrapper
  let actions
  let state
  let store

  afterEach(() => {
    wrapper.destroy()
  })

  beforeEach(() => {
    state = {
      loading: false
    }
    actions = {
      login: jest.fn(() => Promise.resolve({
        code: 1,
        message: '登录成功',
        result: ''
      }))
      .mockImplementationOnce(() => Promise.resolve({
        code: 0,
        message: '登录失败',
        result: ''
      }))
      .mockImplementationOnce(() => Promise.resolve({
        code: 1,
        message: '登录成功',
        result: ''
      }))
    }
    store = new Vuex.Store({
      state,
      actions
    })
  })

  it('Renders state.loading', () => {
    wrapper = mount(Login, { store, localVue })
    const btn = wrapper.find('.el-button')

    // btn class 没有 is-disabled
    expect(btn.classes()).not.toContain('is-disabled')

    wrapper.setComputed({
      logining: true
    })
    wrapper.update()
    expect(btn.classes()).toContain('is-disabled')
  })

  it('Username and password should in page', async () => {
    wrapper = mount(Login, {
      store,
      localVue
    })
    const input = wrapper.findAll('.el-input')
    expect(input.length).toBe(2)
    wrapper.setData({
      form: {
        username: 'test username',
        password: 'test password'
      }
    })
    expect(wrapper.vm.form.username).toBe('test username')
    expect(wrapper.vm.form.password).toBe('test password')
  })

  it('BuildBackground function should beCalled', done => {
    wrapper = mount(Login, {
      store,
      localVue
    })
    // 伪造一个jest的 mock funciton
    const stub = jest.fn()
    wrapper.setMethods({ buildBackground: stub })
    setTimeout(() => {
      expect(stub).toBeCalled()
      done()
    }, 300)
  })

  it('Submit function should beCalled', async () => {
    wrapper = mount(Login, {
      store,
      localVue
    })
    // 伪造一个jest的 mock funciton
    const stub = jest.fn()
    wrapper.setMethods({ submit: stub })

    // button 点击触发事件
    wrapper.find('.el-button').trigger('click')
    expect(stub).toBeCalled()

    // input 回车事件触发提交事件
    const input = wrapper.findAll('.el-input')
    input.at(1).trigger('keyup', { which: 13 })
    expect(stub).toBeCalled()
  })

  it('"actions.login" should beCalled when submit', async () => {
    // 声明一个 $router 对象
    const $router = {
      push: jest.fn()
    }

    // 声明一个 $route 对象
    const $route = {
      query: {}
    }

    wrapper = mount(Login, {
      store,
      localVue,
      mocks: {
        $router,
        $route
      }
    })

    wrapper.vm.submit()
    expect(actions.login).not.toHaveBeenCalled()

    wrapper.setData({
      form: {
        username: 'jkchao',
        password: '123456'
      }
    })
    wrapper.update()
    wrapper.vm.submit()
    // 第一次验证登录失败情景
    expect(actions.login).toHaveBeenCalled()

    wrapper.setData({
      form: {
        username: 'jkchao',
        password: 'hahaheiehi'
      }
    })
    wrapper.update()
    wrapper.vm.submit()
    // 第二次验证登录成功
    expect(actions.login).toHaveBeenCalled()
  })

  it('Has the expected html structure', () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
