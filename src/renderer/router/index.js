import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/PlayerPage',
      name: 'PlayerPage',
      component: require('@/components/PlayerPage').default,
    },
    {
      path: '/',
      name: 'DMPage',
      component: require('@/components/DMPage').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
