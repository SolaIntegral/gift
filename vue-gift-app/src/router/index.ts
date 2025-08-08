import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'GIFTS - 健康ギフト提案・購入プラットフォーム'
    }
  },
  {
    path: '/consultation',
    name: 'Consultation',
    component: () => import('@/views/ConsultationView.vue'),
    meta: {
      title: 'ギフト相談 - GIFTS'
    }
  },
  {
    path: '/gifts',
    name: 'Gifts',
    component: () => import('@/views/GiftsView.vue'),
    meta: {
      title: 'ギフト一覧 - GIFTS'
    }
  },
  {
    path: '/order/:giftId',
    name: 'Order',
    component: () => import('@/views/OrderView.vue'),
    meta: {
      title: '注文 - GIFTS',
      requiresAuth: true
    }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: {
      title: '注文履歴 - GIFTS',
      requiresAuth: true
    }
  },
  {
    path: '/gift/:giftId',
    name: 'GiftView',
    component: () => import('@/views/GiftView.vue'),
    meta: {
      title: 'ギフト詳細 - GIFTS'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: 'ログイン - GIFTS'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: {
      title: '新規登録 - GIFTS'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: 'プロフィール - GIFTS',
      requiresAuth: true
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: 'サービスについて - GIFTS'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'ページが見つかりません - GIFTS'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  // ページタイトルの設定
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 認証が必要なページのチェック
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
