const state = {
    deleteMode: false
  };
  
  const mutations = {
    toggleDeleteMode (state) {
      state.deleteMode = !state.deleteMode;
    }
  };
  
  const actions = {
    toggleDeleteMode({ commit }) {
      commit('toggleDeleteMode');
    },
  };
  
  export default {
    state,
    mutations,
    actions,
  };
  