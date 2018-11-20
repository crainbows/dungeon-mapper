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
      let mapName = payload.filename.split('\\');
      state.MapList.push({name: mapName[mapName.length-1], filename: payload.filename})
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
  