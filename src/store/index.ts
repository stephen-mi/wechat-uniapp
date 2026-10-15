import { createStore } from 'vuex'
import user from '@/store/modules/user'
import photo from '@/store/modules/photo'
import task from '@/store/modules/task'
import getters from './getters'

export default createStore({
  modules: {
    user,
    photo,
    task
  },
  getters
})
