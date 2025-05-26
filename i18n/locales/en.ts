export default {
  // Navigation
  nav: {
    chat: 'Chat',
    image: 'Image', 
    video: 'Video',
    music: 'Music',
    audio: 'Audio',
    pricing: 'Pricing',
    login: 'Sign In',
    logout: 'Sign Out',
    profile: 'Profile',
    settings: 'Settings',
    billing: 'Billing',
    credits: 'Credits'
  },
  
  // Home Page
  home: {
    title: 'Next.js Base Framework',
    subtitle: 'A Next.js project template with user authentication, internationalization, theme switching and other essential features',
    features: {
      title: 'Features:',
      auth: 'NextAuth.js Authentication System',
      oauth: 'Google & GitHub OAuth',
      database: 'MongoDB Database Integration', 
      i18n: 'Internationalization Support',
      theme: 'Dark/Light Theme',
      styling: 'Tailwind CSS Styling',
      typescript: 'TypeScript Support'
    },
    buttons: {
      login: 'Login',
      profile: 'Profile'
    },
    language: {
      label: 'Language',
      english: 'English',
      chinese: 'Chinese'
    }
  },
  
  // Hero Section
  hero: {
    title: 'NexusAI',
    subtitle: 'Experience the future of AI in one powerful platform',
    description: 'Generate images, videos, music, and engage in intelligent conversations with our cutting-edge AI technology.',
    startCreating: 'Start Creating',
    exploreFeatures: 'Explore Features',
    watchDemo: 'Watch Demo',
    getStarted: 'Get Started Free'
  },
  
  // Features
  features: {
    title: 'Explore Our AI Capabilities',
    subtitle: 'Discover what you can create with our advanced AI technologies',
    tryNow: 'Try Now',
    learnMore: 'Learn More',
    
    chat: {
      title: 'AI Chat Assistant',
      description: 'Engage in intelligent conversations with our advanced AI assistant. Get help with writing, coding, analysis, and creative tasks.',
      features: ['Natural conversations', 'Code assistance', 'Creative writing', 'Problem solving']
    },
    
    image: {
      title: 'AI Image Generation',
      description: 'Create stunning, high-quality images from text descriptions. Perfect for art, design, and creative projects.',
      features: ['Text-to-image', 'Multiple styles', 'High resolution', 'Commercial use']
    },
    
    video: {
      title: 'AI Video Creation',
      description: 'Generate professional videos from text prompts. Create animations, presentations, and marketing content.',
      features: ['Text-to-video', 'HD quality', 'Multiple formats', 'Quick generation']
    },
    
    music: {
      title: 'AI Music Composer',
      description: 'Compose original music tracks in any style or genre. Perfect for content creators and musicians.',
      features: ['Custom compositions', 'Multiple genres', 'Royalty-free', 'Professional quality']
    },
    
    audio: {
      title: 'AI Voice Synthesis',
      description: 'Convert text to natural-sounding speech. Create voiceovers, podcasts, and audio content.',
      features: ['Natural voices', 'Multiple languages', 'Custom tones', 'High quality audio']
    }
  },
  
  // Credit System
  credits: {
    title: 'AI Credits System',
    subtitle: 'Use credits to power your AI creations',
    currentBalance: 'Current Balance',
    credits: 'Credits',
    purchaseCredits: 'Purchase Credits',
    viewHistory: 'View Usage History',
    howItWorks: 'How Credits Work',
    
    usage: {
      chat: 'Chat messages',
      image: 'Image generation',
      video: 'Video creation', 
      music: 'Music composition',
      audio: 'Voice synthesis'
    },
    
    plans: {
      free: {
        title: 'Free Plan',
        price: '$0',
        credits: '100 credits/month',
        features: ['Basic AI features', 'Standard quality', 'Community support']
      },
      pro: {
        title: 'Pro Plan', 
        price: '$19',
        credits: '2,000 credits/month',
        features: ['Advanced AI features', 'High quality outputs', 'Priority support', 'Commercial license']
      },
      enterprise: {
        title: 'Enterprise',
        price: 'Custom',
        credits: 'Unlimited credits',
        features: ['All features', 'Custom models', 'Dedicated support', 'Enterprise security']
      }
    }
  },
  
  // Chat Feature
  chat: {
    title: 'AI Chat',
    subtitle: 'Chat with advanced AI models',
    history: 'Chat History',
    newChat: 'New Chat',
    startConversation: 'Start a conversation',
    placeholder: 'Message {model}...',
    thinking: 'AI is thinking...',
    typing: 'Typing...',
    send: 'Send',
    
    // Models
    models: {
      'deepseek-chat': {
        name: 'DeepSeek-V3',
        description: 'Most advanced reasoning model'
      },
      'deepseek-reasoner': {
        name: 'DeepSeek-R1', 
        description: 'Specialized reasoning model'
      }
    },
    
    // Actions
    actions: {
      rename: 'Rename',
      delete: 'Delete',
      archive: 'Archive',
      unarchive: 'Unarchive',
      copy: 'Copy',
      share: 'Share',
      export: 'Export'
    },
    
    // Messages
    messages: {
      welcomeTitle: 'Start a conversation',
      welcomeDescription: 'Ask anything you\'d like to know. I\'m here to help with questions, creative tasks, analysis, and more.',
      noChats: 'No chats yet',
      loadingChats: 'Loading chats...',
      messageSent: 'Message sent',
      messageError: 'Failed to send message',
      chatCreated: 'New chat created',
      chatDeleted: 'Chat deleted',
      chatRenamed: 'Chat renamed',
      insufficientCredits: 'Insufficient Credits',
      needMoreCredits: 'Please purchase more credits to continue chatting',
      signInRequired: 'Sign in required',
      pleaseSignIn: 'Please sign in to use the chat feature'
    },
    
    // Status
    status: {
      characters: 'characters',
      tokens: 'tokens',
      credits: 'credits',
      estimatedCost: '~{cost} credits',
      usedCredits: 'Used {cost} credits ({tokens} tokens)',
      poweredBy: 'Powered by DeepSeek AI',
      advancedModels: 'Chat with advanced AI models'
    },
    
    // Errors
    errors: {
      networkError: 'Network error, please try again',
      apiError: 'API error, please contact support',
      validationError: 'Please enter a valid message',
      rateLimitError: 'Rate limit exceeded, please wait',
      serverError: 'Server error, please try again later'
    }
  },
  
  // Auth
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember me',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    continueWith: 'Continue with',
    or: 'or',
    welcomeBack: 'Welcome back!',
    getStarted: 'Get started today',
    signInToContinue: 'Sign in to your account to continue',
    createYourAccount: 'Create your account to get started'
  },
  
  // Profile & Settings
  profile: {
    title: 'Profile',
    personalInfo: 'Personal Information',
    name: 'Name',
    email: 'Email Address',
    avatar: 'Avatar',
    changeAvatar: 'Change Avatar',
    updateProfile: 'Update Profile',
    accountSettings: 'Account Settings',
    preferences: 'Preferences',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    privacy: 'Privacy',
    security: 'Security',
    deleteAccount: 'Delete Account'
  },
  
  // Billing
  billing: {
    title: 'Billing & Subscription',
    currentPlan: 'Current Plan',
    billingHistory: 'Billing History',
    paymentMethod: 'Payment Method',
    upgradeplan: 'Upgrade Plan',
    cancelSubscription: 'Cancel Subscription',
    renewalDate: 'Next Renewal',
    invoice: 'Invoice',
    amount: 'Amount',
    date: 'Date',
    status: 'Status',
    download: 'Download',
    addPaymentMethod: 'Add Payment Method',
    updatePaymentMethod: 'Update Payment Method'
  },
  
  // Common UI
  common: {
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    close: 'Close',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    continue: 'Continue',
    back: 'Back',
    submit: 'Submit',
    reset: 'Reset',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo',
    select: 'Select',
    upload: 'Upload',
    download: 'Download',
    share: 'Share',
    print: 'Print',
    export: 'Export',
    import: 'Import'
  },
  
  // Messages & Notifications
  messages: {
    welcomeMessage: 'Welcome to NexusAI! Start creating with AI today.',
    profileUpdated: 'Profile updated successfully',
    settingsSaved: 'Settings saved successfully',
    paymentProcessed: 'Payment processed successfully',
    subscriptionUpdated: 'Subscription updated successfully',
    errorOccurred: 'An error occurred. Please try again.',
    invalidCredentials: 'Invalid email or password',
    accountCreated: 'Account created successfully',
    passwordReset: 'Password reset link sent to your email',
    loggedOut: 'You have been logged out successfully'
  }
}; 