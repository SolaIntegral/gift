import { ref, computed } from 'vue'

export interface HealthAwarenessQuestion {
  id: string
  question: string
  followUp: string
  category: 'motivation' | 'awareness' | 'action' | 'support'
  options: HealthAwarenessOption[]
}

export interface HealthAwarenessOption {
  value: string
  label: string
  icon: string
}

export interface HealthAwarenessAnswers {
  [key: string]: {
    value: string
    followUpAnswer?: string
  }
}

export interface HealthGoal {
  id: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
  deadline: Date
}

export interface HealthAction {
  id: string
  title: string
  description: string
  frequency: string
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  relatedGoal: string
}

export interface HealthPlan {
  id: string
  userId: string
  goals: HealthGoal[]
  actions: HealthAction[]
  timeline: HealthTimeline
  motivation: string
  createdAt: Date
}

export interface HealthTimeline {
  shortTerm: HealthAction[]
  mediumTerm: HealthAction[]
  longTerm: HealthGoal[]
}

export interface HealthProgress {
  completedActions: string[]
  currentStreak: number
  totalActions: number
  motivationLevel: number
}

// 健康意識向上質問セット
export const healthAwarenessQuestions: HealthAwarenessQuestion[] = [
  {
    id: 'life-goals',
    question: '死ぬまでに叶えたいことはありますか？',
    followUp: 'その目標を達成するために、健康はどのくらい重要ですか？',
    category: 'motivation',
    options: [
      { value: 'family', label: '家族との時間を大切にする', icon: '👨‍👩‍👧‍👦' },
      { value: 'travel', label: '世界中を旅する', icon: '✈️' },
      { value: 'career', label: 'キャリアで成功する', icon: '💼' },
      { value: 'hobby', label: '趣味を楽しむ', icon: '🎨' },
      { value: 'contribution', label: '社会に貢献する', icon: '🌍' }
    ]
  },
  {
    id: 'health-importance',
    question: '健康でいたい理由は何ですか？',
    followUp: '健康を失ったら、何が一番困りますか？',
    category: 'awareness',
    options: [
      { value: 'independence', label: '自立した生活を送りたい', icon: '🏠' },
      { value: 'family-support', label: '家族を支えたい', icon: '💪' },
      { value: 'enjoy-life', label: '人生を楽しみたい', icon: '😊' },
      { value: 'avoid-pain', label: '痛みや苦しみを避けたい', icon: '🛡️' },
      { value: 'achieve-goals', label: '目標を達成したい', icon: '🎯' }
    ]
  },
  {
    id: 'current-habits',
    question: '現在の健康習慣で改善したいことはありますか？',
    followUp: 'その改善のために、どんなサポートがあれば良いですか？',
    category: 'action',
    options: [
      { value: 'exercise', label: '運動習慣', icon: '🏃‍♂️' },
      { value: 'diet', label: '食生活', icon: '🥗' },
      { value: 'sleep', label: '睡眠', icon: '😴' },
      { value: 'stress', label: 'ストレス管理', icon: '🧘' },
      { value: 'checkup', label: '健康診断', icon: '🏥' }
    ]
  },
  {
    id: 'support-system',
    question: '健康管理をサポートしてくれる人はいますか？',
    followUp: 'その人にどんなサポートをしてもらいたいですか？',
    category: 'support',
    options: [
      { value: 'family', label: '家族', icon: '👨‍👩‍👧‍👦' },
      { value: 'friends', label: '友人', icon: '👥' },
      { value: 'colleagues', label: '同僚', icon: '💼' },
      { value: 'professionals', label: '専門家', icon: '👨‍⚕️' },
      { value: 'none', label: 'いない', icon: '😔' }
    ]
  }
]

export const useHealthAwareness = () => {
  const currentQuestion = ref(0)
  const answers = ref<HealthAwarenessAnswers>({})
  const showFollowUp = ref(false)
  const followUpAnswer = ref('')
  const selectedOption = ref<string>('')
  const isGeneratingPlan = ref(false)
  const healthPlan = ref<HealthPlan | null>(null)
  const progress = ref<HealthProgress>({
    completedActions: [],
    currentStreak: 0,
    totalActions: 0,
    motivationLevel: 0
  })

  // 現在の質問を取得
  const currentQuestionData = computed(() => {
    return healthAwarenessQuestions[currentQuestion.value]
  })

  // 質問の進捗を計算
  const progressPercentage = computed(() => {
    return Math.round((currentQuestion.value / healthAwarenessQuestions.length) * 100)
  })

  // 全ての質問に回答済みかチェック
  const isComplete = computed(() => {
    return currentQuestion.value >= healthAwarenessQuestions.length
  })

  // オプション選択
  const selectOption = (value: string) => {
    selectedOption.value = value
    showFollowUp.value = true
  }

  // 次の質問に進む
  const nextQuestion = () => {
    if (selectedOption.value) {
      // 現在の回答を保存
      answers.value[currentQuestionData.value.id] = {
        value: selectedOption.value,
        followUpAnswer: followUpAnswer.value
      }
      
      // 次の質問に進む
      if (currentQuestion.value < healthAwarenessQuestions.length - 1) {
        currentQuestion.value++
        resetCurrentQuestion()
      } else {
        // 全ての質問が完了
        generateHealthPlan()
      }
    }
  }

  // 前の質問に戻る
  const previousQuestion = () => {
    if (currentQuestion.value > 0) {
      currentQuestion.value--
      loadCurrentQuestion()
    }
  }

  // 現在の質問をリセット
  const resetCurrentQuestion = () => {
    selectedOption.value = ''
    showFollowUp.value = false
    followUpAnswer.value = ''
  }

  // 現在の質問を読み込み
  const loadCurrentQuestion = () => {
    const questionId = currentQuestionData.value.id
    const savedAnswer = answers.value[questionId]
    
    if (savedAnswer) {
      selectedOption.value = savedAnswer.value
      followUpAnswer.value = savedAnswer.followUpAnswer || ''
      showFollowUp.value = true
    } else {
      resetCurrentQuestion()
    }
  }

  // 健康プラン生成
  const generateHealthPlan = async () => {
    isGeneratingPlan.value = true
    
    try {
      // 回答に基づいて健康プランを生成
      const plan = createPersonalizedHealthPlan(answers.value)
      healthPlan.value = plan
      
      // 進捗を初期化
      progress.value = {
        completedActions: [],
        currentStreak: 0,
        totalActions: plan.actions.length,
        motivationLevel: calculateInitialMotivationLevel(answers.value)
      }
      
      // ローカルストレージに保存
      saveHealthPlan(plan)
      saveProgress(progress.value)
      
    } catch (error) {
      console.error('Health plan generation error:', error)
    } finally {
      isGeneratingPlan.value = false
    }
  }

  // パーソナライズされた健康プラン作成
  const createPersonalizedHealthPlan = (answers: HealthAwarenessAnswers): HealthPlan => {
    const goals: HealthGoal[] = []
    const actions: HealthAction[] = []
    
    // 人生目標に基づく健康目標の設定
    if (answers['life-goals']) {
      const lifeGoal = answers['life-goals'].value
      const goalTitle = getLifeGoalTitle(lifeGoal)
      
      goals.push({
        id: generateId(),
        title: `${goalTitle}を叶えるための健康維持`,
        description: '人生目標を達成するために必要な健康状態を維持する',
        category: 'motivation',
        priority: 'high',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年後
      })
    }
    
    // 現在の習慣に基づく具体的なアクション
    if (answers['current-habits']) {
      const habit = answers['current-habits'].value
      const habitActions = getHabitActions(habit)
      actions.push(...habitActions)
    }
    
    // サポートシステムに基づくアクション
    if (answers['support-system']) {
      const support = answers['support-system'].value
      const supportActions = getSupportActions(support)
      actions.push(...supportActions)
    }
    
    return {
      id: generateId(),
      userId: 'test-user', // 後で実際のユーザーIDに変更
      goals,
      actions,
      timeline: generateTimeline(goals, actions),
      motivation: generateMotivation(answers),
      createdAt: new Date()
    }
  }

  // 人生目標のタイトルを取得
  const getLifeGoalTitle = (goal: string): string => {
    const titles = {
      family: '家族との時間',
      travel: '世界旅行',
      career: 'キャリア成功',
      hobby: '趣味の充実',
      contribution: '社会貢献'
    }
    return titles[goal as keyof typeof titles] || '人生目標'
  }

  // 習慣に基づくアクションを取得
  const getHabitActions = (habit: string): HealthAction[] => {
    const actions: HealthAction[] = []
    
    switch (habit) {
      case 'exercise':
        actions.push(
          {
            id: generateId(),
            title: '毎日30分の散歩',
            description: '軽い運動から始めて、運動習慣を身につける',
            frequency: '毎日',
            duration: '30分',
            difficulty: 'easy',
            relatedGoal: '運動習慣の改善'
          },
          {
            id: generateId(),
            title: '週2回の筋力トレーニング',
            description: '自宅でできる簡単な筋力トレーニング',
            frequency: '週2回',
            duration: '20分',
            difficulty: 'medium',
            relatedGoal: '運動習慣の改善'
          }
        )
        break
      case 'diet':
        actions.push(
          {
            id: generateId(),
            title: '野菜を毎食取り入れる',
            description: '1日3食、必ず野菜を食べる習慣をつける',
            frequency: '毎日',
            duration: '継続',
            difficulty: 'easy',
            relatedGoal: '食生活の改善'
          },
          {
            id: generateId(),
            title: '水分補給を意識する',
            description: '1日2リットルの水を飲む',
            frequency: '毎日',
            duration: '継続',
            difficulty: 'easy',
            relatedGoal: '食生活の改善'
          }
        )
        break
      case 'sleep':
        actions.push(
          {
            id: generateId(),
            title: '就寝時間を固定する',
            description: '毎日同じ時間に寝る習慣をつける',
            frequency: '毎日',
            duration: '継続',
            difficulty: 'medium',
            relatedGoal: '睡眠の改善'
          },
          {
            id: generateId(),
            title: '就寝前のスマートフォン使用を控える',
            description: '就寝1時間前からスマートフォンの使用を控える',
            frequency: '毎日',
            duration: '1時間前',
            difficulty: 'medium',
            relatedGoal: '睡眠の改善'
          }
        )
        break
      case 'stress':
        actions.push(
          {
            id: generateId(),
            title: '深呼吸の習慣',
            description: '1日3回、5分間の深呼吸を行う',
            frequency: '毎日',
            duration: '5分×3回',
            difficulty: 'easy',
            relatedGoal: 'ストレス管理の改善'
          },
          {
            id: generateId(),
            title: '趣味の時間を作る',
            description: '週に1回、自分の趣味に没頭する時間を作る',
            frequency: '週1回',
            duration: '2時間',
            difficulty: 'medium',
            relatedGoal: 'ストレス管理の改善'
          }
        )
        break
      case 'checkup':
        actions.push(
          {
            id: generateId(),
            title: '年1回の健康診断',
            description: '定期的な健康診断を受ける',
            frequency: '年1回',
            duration: '1日',
            difficulty: 'easy',
            relatedGoal: '健康管理の改善'
          }
        )
        break
    }
    
    return actions
  }

  // サポートシステムに基づくアクションを取得
  const getSupportActions = (support: string): HealthAction[] => {
    const actions: HealthAction[] = []
    
    switch (support) {
      case 'family':
        actions.push({
          id: generateId(),
          title: '家族と一緒に運動する',
          description: '家族と一緒に散歩や運動を楽しむ',
          frequency: '週2回',
          duration: '30分',
          difficulty: 'easy',
          relatedGoal: '家族との健康活動'
        })
        break
      case 'friends':
        actions.push({
          id: generateId(),
          title: '友人と健康目標を共有する',
          description: '友人と健康目標を共有し、お互いに励まし合う',
          frequency: '週1回',
          duration: '継続',
          difficulty: 'medium',
          relatedGoal: '友人との健康サポート'
        })
        break
      case 'professionals':
        actions.push({
          id: generateId(),
          title: '専門家に相談する',
          description: '定期的に専門家に健康相談をする',
          frequency: '月1回',
          duration: '1時間',
          difficulty: 'medium',
          relatedGoal: '専門的な健康サポート'
        })
        break
    }
    
    return actions
  }

  // タイムライン生成
  const generateTimeline = (goals: HealthGoal[], actions: HealthAction[]): HealthTimeline => {
    const shortTerm = actions.filter(action => action.difficulty === 'easy')
    const mediumTerm = actions.filter(action => action.difficulty === 'medium')
    const longTerm = goals
    
    return {
      shortTerm,
      mediumTerm,
      longTerm
    }
  }

  // モチベーションメッセージ生成
  const generateMotivation = (answers: HealthAwarenessAnswers): string => {
    const motivations = []
    
    if (answers['life-goals']) {
      const goal = answers['life-goals'].value
      const goalTitle = getLifeGoalTitle(goal)
      motivations.push(`${goalTitle}を叶えるために、健康を大切にしましょう。`)
    }
    
    if (answers['health-importance']) {
      const importance = answers['health-importance'].value
      if (importance === 'family-support') {
        motivations.push('家族を支えるために、まずは自分の健康を大切にしましょう。')
      } else if (importance === 'enjoy-life') {
        motivations.push('人生を楽しむために、健康な体を維持しましょう。')
      }
    }
    
    return motivations.join(' ') || '健康な生活を送るために、小さな一歩から始めましょう。'
  }

  // 初期モチベーションレベル計算
  const calculateInitialMotivationLevel = (answers: HealthAwarenessAnswers): number => {
    let level = 50 // 基本レベル
    
    // 人生目標がある場合は+20
    if (answers['life-goals']) level += 20
    
    // 健康の重要性を認識している場合は+15
    if (answers['health-importance']) level += 15
    
    // 改善したい習慣がある場合は+10
    if (answers['current-habits']) level += 10
    
    // サポートシステムがある場合は+5
    if (answers['support-system'] && answers['support-system'].value !== 'none') level += 5
    
    return Math.min(100, level)
  }

  // 進捗更新
  const updateProgress = (actionId: string, completed: boolean) => {
    if (completed) {
      if (!progress.value.completedActions.includes(actionId)) {
        progress.value.completedActions.push(actionId)
        progress.value.currentStreak++
      }
    } else {
      progress.value.currentStreak = 0
    }
    
    // モチベーションレベルの更新
    progress.value.motivationLevel = calculateMotivationLevel(progress.value)
    
    // ローカルストレージに保存
    saveProgress(progress.value)
  }

  // モチベーションレベル計算
  const calculateMotivationLevel = (progress: HealthProgress): number => {
    const completionRate = progress.totalActions > 0 ? progress.completedActions.length / progress.totalActions : 0
    const streakBonus = Math.min(progress.currentStreak * 5, 30)
    
    return Math.min(100, Math.round(completionRate * 70 + streakBonus))
  }

  // モチベーションメッセージ取得
  const getMotivationalMessage = (): string => {
    const level = progress.value.motivationLevel
    
    if (level >= 80) return '素晴らしい！健康習慣が身についています！'
    if (level >= 60) return '順調です！継続が大切です。'
    if (level >= 40) return '少しずつでも続けることが大切です。'
    return '今日から始めましょう！小さな一歩が大きな変化につながります。'
  }

  // ローカルストレージに保存
  const saveHealthPlan = (plan: HealthPlan) => {
    localStorage.setItem('health-plan', JSON.stringify(plan))
  }

  const saveProgress = (progress: HealthProgress) => {
    localStorage.setItem('health-progress', JSON.stringify(progress))
  }

  // ローカルストレージから読み込み
  const loadHealthPlan = (): HealthPlan | null => {
    const saved = localStorage.getItem('health-plan')
    return saved ? JSON.parse(saved) : null
  }

  const loadProgress = (): HealthProgress | null => {
    const saved = localStorage.getItem('health-progress')
    return saved ? JSON.parse(saved) : null
  }

  // ID生成
  const generateId = () => {
    return `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 初期化
  const initialize = () => {
    const savedPlan = loadHealthPlan()
    const savedProgress = loadProgress()
    
    if (savedPlan) {
      healthPlan.value = savedPlan
    }
    
    if (savedProgress) {
      progress.value = savedProgress
    }
  }

  return {
    currentQuestion,
    answers,
    showFollowUp,
    followUpAnswer,
    selectedOption,
    isGeneratingPlan,
    healthPlan,
    progress,
    currentQuestionData,
    progressPercentage,
    isComplete,
    selectOption,
    nextQuestion,
    previousQuestion,
    resetCurrentQuestion,
    loadCurrentQuestion,
    generateHealthPlan,
    updateProgress,
    getMotivationalMessage,
    initialize
  }
} 