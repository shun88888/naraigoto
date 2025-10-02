export const dummyExperiences = [
  {
    id: 'exp_001',
    title: '木工ワークショップ',
    description: '親子で木工を体験。安全な道具で作品づくり。',
    category: '工作',
    type: '体験',
    genre: 'ものづくり',
    method: 'ハンズオン',
    min_age: 5,
    max_age: 12,
    price: 1500,
    location: '渋谷',
    image_url: 'https://picsum.photos/400/400?random=1',
    school_name: 'クリエイティブキッズラボ',
    school_icon: 'https://picsum.photos/50/50?random=101'
  },
  {
    id: 'exp_002',
    title: 'キッズクッキング',
    description: '簡単パン作り体験。食育も学べる。',
    category: '料理',
    type: '習い事',
    genre: 'クッキング',
    method: '実技',
    min_age: 6,
    max_age: 12,
    price: 1800,
    location: '中目黒',
    image_url: 'https://picsum.photos/400/400?random=2',
    school_name: 'リトルシェフスクール',
    school_icon: 'https://picsum.photos/50/50?random=102'
  },
  {
    id: 'exp_003',
    title: '科学実験ラボ',
    description: '楽しい理科実験で学びのきっかけを。',
    category: '科学',
    type: 'イベント',
    genre: 'STEM',
    method: '実験',
    min_age: 7,
    max_age: 13,
    price: 2000,
    location: '品川',
    image_url: 'https://picsum.photos/400/400?random=3',
    school_name: 'サイエンスワークス',
    school_icon: 'https://picsum.photos/50/50?random=103'
  },
  {
    id: 'exp_004',
    title: 'プログラミング講座',
    description: 'Scratchでゲーム作り。論理的思考を育む。',
    category: 'プログラミング',
    type: '習い事',
    genre: 'STEM',
    method: 'デジタル',
    min_age: 8,
    max_age: 15,
    price: 2500,
    location: '新宿',
    image_url: 'https://picsum.photos/400/400?random=4',
    school_name: 'コードキッズアカデミー',
    school_icon: 'https://picsum.photos/50/50?random=104'
  },
  {
    id: 'exp_005',
    title: 'アート教室',
    description: '絵画と工作で創造力を伸ばそう。',
    category: 'アート',
    type: '習い事',
    genre: 'クリエイティブ',
    method: '制作',
    min_age: 4,
    max_age: 10,
    price: 1200,
    location: '原宿',
    image_url: 'https://picsum.photos/400/400?random=5',
    school_name: 'アートスタジオPalette',
    school_icon: 'https://picsum.photos/50/50?random=105'
  },
  {
    id: 'exp_006',
    title: 'ダンスレッスン',
    description: 'リズム感と表現力を身につける。',
    category: 'ダンス',
    type: '習い事',
    genre: 'パフォーマンス',
    method: 'グループ',
    min_age: 6,
    max_age: 14,
    price: 2200,
    location: '池袋',
    image_url: 'https://picsum.photos/400/400?random=6',
    school_name: 'ダンススタジオMove',
    school_icon: 'https://picsum.photos/50/50?random=106'
  }
];

export const dummySlots = [
  { id: 's_001_1', experience_id: 'exp_001', date: '2025-10-01', remaining: 5, status: 'open' },
  { id: 's_001_2', experience_id: 'exp_001', date: '2025-10-02', remaining: 0, status: 'open' },
  { id: 's_002_1', experience_id: 'exp_002', date: '2025-10-01', remaining: 3, status: 'open' },
  { id: 's_002_2', experience_id: 'exp_002', date: '2025-10-03', remaining: 2, status: 'open' },
  { id: 's_003_1', experience_id: 'exp_003', date: '2025-10-02', remaining: 4, status: 'open' },
  { id: 's_003_2', experience_id: 'exp_003', date: '2025-10-05', remaining: 1, status: 'open' }
];


