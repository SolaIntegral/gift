import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // トップページ
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'GIFTS - 健康ギフト提案・購入プラットフォーム'
    }
  },

  // GIFTER（ギフトを贈る人）の画面フロー
  {
    path: '/gifts',
    name: 'Gifts',
    component: () => import('@/views/GiftsView.vue'),
    meta: {
      title: 'ギフト一覧 - GIFTS'
    }
  },
  {
    path: '/gifts/:id',
    name: 'GiftDetail',
    component: () => import('@/views/GiftDetailView.vue'),
    meta: {
      title: 'ギフト詳細 - GIFTS'
    }
  },
  {
    path: '/purchase/:id',
    name: 'Purchase',
    component: () => import('@/views/PurchaseView.vue'),
    meta: {
      title: 'ギフト購入 - GIFTS'
    }
  },
  {
    path: '/complete',
    name: 'Complete',
    component: () => import('@/views/CompleteView.vue'),
    meta: {
      title: '購入完了 - GIFTS'
    }
  },
  {
    path: '/my-page',
    name: 'MyPage',
    component: () => import('@/views/MyPageView.vue'),
    meta: {
      title: 'マイページ - GIFTS'
    }
  },

  // SELECTER（ギフトを受け取った人）の画面フロー
  {
    path: '/gift/:uniqueId',
    name: 'GiftReceive',
    component: () => import('@/views/GiftReceiveView.vue'),
    meta: {
      title: 'ギフト受け取り - GIFTS'
    }
  },
  {
    path: '/booking/:uniqueId',
    name: 'Booking',
    component: () => import('@/views/BookingView.vue'),
    meta: {
      title: '利用予約 - GIFTS'
    }
  },
  {
    path: '/booking/complete',
    name: 'BookingComplete',
    component: () => import('@/views/BookingCompleteView.vue'),
    meta: {
      title: '予約完了 - GIFTS'
    }
  },
  {
    path: '/journey-log',
    name: 'JourneyLog',
    component: () => import('@/views/JourneyLogView.vue'),
    meta: {
      title: 'ウェルネス・ジャーニー記録 - GIFTS'
    }
  },

  // ウェルネス・ジャーニー（モーダルまたは画面遷移）
  {
    path: '/wellness-journey',
    name: 'WellnessJourney',
    component: () => import('@/components/WellnessJourney.vue'),
    meta: {
      title: 'ウェルネス・ジャーニー - GIFTS'
    }
  },

  // 404ページ
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

// ナビゲーションガード（認証チェックなし）
router.beforeEach((to, from, next) => {
  // ページタイトルの設定
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  next()
})

export default router
