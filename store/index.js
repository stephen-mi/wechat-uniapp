import Vue from 'vue'
import Vuex from 'vuex'
import user from '@/store/modules/user'
import photo from '@/store/modules/photo'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		user,
		photo
	},
	getters
})

export default store