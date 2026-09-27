import { createStore } from 'vuex'
import user from '@/store/modules/user'
import photo from '@/store/modules/photo'
import getters from './getters'

export default createStore({
  modules: {
    user,
    photo
  },
  getters
})
