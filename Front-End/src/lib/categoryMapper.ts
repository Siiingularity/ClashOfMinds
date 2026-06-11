import type { Category } from '@/types';
import type { Category as ApiCategory } from '@/services/api';

export function mapApiCategoryToUi(cat: ApiCategory): Category {
  return {
    id: String(cat.id),
    name: {
      ar: cat.name_ar,
      en: cat.name_en,
    },
    description: {
      ar: cat.description_ar || '',
      en: cat.description_en || '',
    },
    section: cat.section || 'general',
    image: cat.image_url || 'question',
    count: cat.actual_question_count ?? cat.question_count ?? 0,
    is_active: !!(cat as any).is_active,
  };
}
