import { CategoryOption, TargetAudienceOption } from '@/types'

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: '服装', value: 'clothing' },
  { label: '鞋靴', value: 'shoes' },
  { label: '箱包', value: 'bags' },
  { label: '配饰', value: 'accessories' },
  { label: '家居', value: 'home' },
  { label: '数码', value: 'digital' },
  { label: '美妆', value: 'beauty' },
  { label: '食品', value: 'food' },
  { label: '运动', value: 'sports' },
  { label: '母婴', value: 'baby' }
]

export const TARGET_AUDIENCE_OPTIONS: TargetAudienceOption[] = [
  { label: '男士', value: 'men' },
  { label: '女士', value: 'women' },
  { label: '儿童', value: 'children' },
  { label: '老人', value: 'elderly' },
  { label: '青少年', value: 'teenagers' },
  { label: '通用', value: 'general' }
]

export const SELLING_POINT_TEMPLATES: Record<string, string[]> = {
  clothing: ['舒适面料', '经典款式', '时尚百搭', '透气亲肤'],
  shoes: ['舒适耐穿', '防滑耐磨', '轻便透气', '时尚设计'],
  bags: ['大容量', '耐用材质', '简约时尚', '多隔层设计'],
  accessories: ['精致工艺', '时尚百搭', '品质保证', '独特设计'],
  home: ['环保材质', '实用便捷', '简约美观', '耐用可靠'],
  digital: ['高性能', '智能便捷', '品质保证', '创新科技'],
  beauty: ['温和不刺激', '天然成分', '持久有效', '安全可靠'],
  food: ['新鲜美味', '营养健康', '口感丰富', '安全放心'],
  sports: ['专业运动', '舒适透气', '耐用可靠', '性能卓越'],
  baby: ['安全无毒', '柔软舒适', '可爱设计', '易于清洗']
}
