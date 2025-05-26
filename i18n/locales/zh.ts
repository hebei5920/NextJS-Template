export default {
  // 导航
  nav: {
    chat: '对话',
    image: '图像', 
    video: '视频',
    music: '音乐',
    audio: '音频',
    pricing: '定价',
    login: '登录',
    logout: '退出',
    profile: '个人资料',
    settings: '设置',
    billing: '账单',
    credits: '积分'
  },
  
  // 首页
  home: {
    title: 'Next.js 基础框架',
    subtitle: '包含用户认证、国际化、主题切换等基础功能的 Next.js 项目模板',
    features: {
      title: '功能特性：',
      auth: 'NextAuth.js 认证系统',
      oauth: 'Google & GitHub OAuth',
      database: 'MongoDB 数据库集成',
      i18n: '国际化支持',
      theme: '深色/浅色主题',
      styling: 'Tailwind CSS 样式',
      typescript: 'TypeScript 支持'
    },
    buttons: {
      login: '登录',
      profile: '个人资料'
    },
    language: {
      label: '语言',
      english: 'English',
      chinese: '中文'
    }
  },
  
  // 英雄区块
  hero: {
    title: 'NexusAI',
    subtitle: '在一个强大的平台体验AI的未来',
    description: '使用我们的前沿AI技术生成图像、视频、音乐，并进行智能对话。',
    startCreating: '开始创作',
    exploreFeatures: '探索功能',
    watchDemo: '观看演示',
    getStarted: '免费开始'
  },
  
  // 功能特性
  features: {
    title: '探索我们的AI功能',
    subtitle: '发现您可以使用我们的先进AI技术创建什么',
    tryNow: '立即尝试',
    learnMore: '了解更多',
    
    chat: {
      title: 'AI对话助手',
      description: '与我们的先进AI助手进行智能对话。获得写作、编程、分析和创意任务的帮助。',
      features: ['自然对话', '代码协助', '创意写作', '问题解决']
    },
    
    image: {
      title: 'AI图像生成',
      description: '从文本描述创建令人惊叹的高质量图像。完美适用于艺术、设计和创意项目。',
      features: ['文本转图像', '多种风格', '高分辨率', '商业使用']
    },
    
    video: {
      title: 'AI视频创作',
      description: '从文本提示生成专业视频。创建动画、演示和营销内容。',
      features: ['文本转视频', '高清质量', '多种格式', '快速生成']
    },
    
    music: {
      title: 'AI音乐作曲',
      description: '创作任何风格或流派的原创音乐曲目。完美适用于内容创作者和音乐家。',
      features: ['定制作曲', '多种风格', '免版税', '专业品质']
    },
    
    audio: {
      title: 'AI语音合成',
      description: '将文本转换为自然语音。创建配音、播客和音频内容。',
      features: ['自然语音', '多种语言', '自定义语调', '高质量音频']
    }
  },
  
  // 积分系统
  credits: {
    title: 'AI积分系统',
    subtitle: '使用积分为您的AI创作提供动力',
    currentBalance: '当前余额',
    credits: '积分',
    purchaseCredits: '购买积分',
    viewHistory: '查看使用记录',
    howItWorks: '积分工作原理',
    
    usage: {
      chat: '对话消息',
      image: '图像生成',
      video: '视频创作', 
      music: '音乐作曲',
      audio: '语音合成'
    },
    
    plans: {
      free: {
        title: '免费计划',
        price: '¥0',
        credits: '每月100积分',
        features: ['基础AI功能', '标准质量', '社区支持']
      },
      pro: {
        title: '专业计划', 
        price: '¥149',
        credits: '每月2000积分',
        features: ['高级AI功能', '高质量输出', '优先支持', '商业许可']
      },
      enterprise: {
        title: '企业版',
        price: '定制',
        credits: '无限积分',
        features: ['所有功能', '定制模型', '专属支持', '企业安全']
      }
    }
  },
  
  // 聊天功能
  chat: {
    title: 'AI对话',
    subtitle: '与先进AI模型对话',
    history: '对话历史',
    newChat: '新对话',
    startConversation: '开始对话',
    placeholder: '向{model}发送消息...',
    thinking: 'AI正在思考...',
    typing: '正在输入...',
    send: '发送',
    
    // 模型
    models: {
      'deepseek-chat': {
        name: 'DeepSeek-V3',
        description: '最先进的推理模型'
      },
      'deepseek-reasoner': {
        name: 'DeepSeek-R1', 
        description: '专业推理模型'
      }
    },
    
    // 操作
    actions: {
      rename: '重命名',
      delete: '删除',
      archive: '归档',
      unarchive: '取消归档',
      copy: '复制',
      share: '分享',
      export: '导出'
    },
    
    // 消息
    messages: {
      welcomeTitle: '开始对话',
      welcomeDescription: '问任何您想了解的问题。我可以帮助您进行问答、创意任务、分析等等。',
      noChats: '还没有对话',
      loadingChats: '加载对话中...',
      messageSent: '消息已发送',
      messageError: '发送消息失败',
      chatCreated: '新对话已创建',
      chatDeleted: '对话已删除',
      chatRenamed: '对话已重命名',
      insufficientCredits: '积分不足',
      needMoreCredits: '请购买更多积分以继续对话',
      signInRequired: '需要登录',
      pleaseSignIn: '请登录以使用对话功能'
    },
    
    // 状态
    status: {
      characters: '字符',
      tokens: 'tokens',
      credits: '积分',
      estimatedCost: '约{cost}积分',
      usedCredits: '使用了{cost}积分（{tokens} tokens）',
      poweredBy: '由DeepSeek AI驱动',
      advancedModels: '与先进AI模型对话'
    },
    
    // 错误
    errors: {
      networkError: '网络错误，请重试',
      apiError: 'API错误，请联系支持',
      validationError: '请输入有效消息',
      rateLimitError: '请求频率超限，请稍候',
      serverError: '服务器错误，请稍后重试'
    }
  },
  
  // 身份验证
  auth: {
    signIn: '登录',
    signUp: '注册',
    signOut: '退出',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    forgotPassword: '忘记密码？',
    rememberMe: '记住我',
    createAccount: '创建账户',
    alreadyHaveAccount: '已有账户？',
    dontHaveAccount: '还没有账户？',
    continueWith: '继续使用',
    or: '或',
    welcomeBack: '欢迎回来！',
    getStarted: '今天就开始',
    signInToContinue: '登录您的账户以继续',
    createYourAccount: '创建您的账户开始使用'
  },
  
  // 个人资料和设置
  profile: {
    title: '个人资料',
    personalInfo: '个人信息',
    name: '姓名',
    email: '邮箱地址',
    avatar: '头像',
    changeAvatar: '更换头像',
    updateProfile: '更新资料',
    accountSettings: '账户设置',
    preferences: '偏好设置',
    language: '语言',
    theme: '主题',
    notifications: '通知',
    privacy: '隐私',
    security: '安全',
    deleteAccount: '删除账户'
  },
  
  // 账单
  billing: {
    title: '账单和订阅',
    currentPlan: '当前计划',
    billingHistory: '账单记录',
    paymentMethod: '支付方式',
    upgradeplan: '升级计划',
    cancelSubscription: '取消订阅',
    renewalDate: '下次续费',
    invoice: '发票',
    amount: '金额',
    date: '日期',
    status: '状态',
    download: '下载',
    addPaymentMethod: '添加支付方式',
    updatePaymentMethod: '更新支付方式'
  },
  
  // 通用UI
  common: {
    save: '保存',
    cancel: '取消',
    edit: '编辑',
    delete: '删除',
    confirm: '确认',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    close: '关闭',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    continue: '继续',
    back: '返回',
    submit: '提交',
    reset: '重置',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    refresh: '刷新',
    copy: '复制',
    paste: '粘贴',
    cut: '剪切',
    undo: '撤销',
    redo: '重做',
    select: '选择',
    upload: '上传',
    download: '下载',
    share: '分享',
    print: '打印',
    export: '导出',
    import: '导入'
  },
  
  // 消息和通知
  messages: {
    welcomeMessage: '欢迎来到NexusAI！今天就开始使用AI创作吧。',
    profileUpdated: '资料更新成功',
    settingsSaved: '设置保存成功',
    paymentProcessed: '支付处理成功',
    subscriptionUpdated: '订阅更新成功',
    errorOccurred: '发生错误，请重试。',
    invalidCredentials: '邮箱或密码无效',
    accountCreated: '账户创建成功',
    passwordReset: '密码重置链接已发送到您的邮箱',
    loggedOut: '您已成功退出登录'
  }
}; 