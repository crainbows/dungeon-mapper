const state = {
    MapList: [
    ],
    newMapCounter: 0,
    selectedMap: 0
  };
  
  const mutations = {
    selectMap (state, payload) {
      state.selectedMap = payload.mapKey;
    },
    newMap (state, payload) {
      state.MapList.push({name: 'mapname', filename: payload.filename})
    }
  };
  
  const actions = {
    selectMap({ commit }, payload) {
      // do something async
      commit('selectMap', payload);
    },
    newMap({ commit }, payload) {
      // do something async
      commit('newMap', payload);
    },
  };
  
  export default {
    state,
    mutations,
    actions,
  };
  