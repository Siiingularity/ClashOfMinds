import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Users, Grid3X3, HelpCircle, ShoppingCart, Plus, Edit, Trash2, TrendingUp, TrendingDown, Image as ImageIcon, Save, DollarSign, BarChart3, ChevronDown, Layers, X, Eye, EyeOff, Archive } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { powerUps } from '@/data/categories';
import { categoriesAPI, questionsAPI, usersAPI, sectionsAPI, siteSettingsAPI } from '@/services/api';
import { API_URL } from '@/config/api';
import { mapApiCategoryToUi } from '@/lib/categoryMapper';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardPageProps {
  onBack: () => void;
}

const COLORS = ['#8B5A2B', '#5D3A1A', '#D4A574', '#A67B5B', '#C49A6C', '#9C7650'];

export function DashboardPage({ onBack }: DashboardPageProps) {
  const { language, dir } = useLanguage();
  const { user } = useAuth();
  const isEditor = user?.role === 'editor';
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  type TabId = 'stats' | 'categories' | 'questions' | 'users' | 'orders' | 'images' | 'archive';
  const validTabs: TabId[] = ['stats', 'categories', 'questions', 'users', 'orders', 'images', 'archive'];
  const defaultTab: TabId = isEditor ? 'categories' : 'stats';
  const activeTab: TabId = validTabs.includes(tab as TabId) ? (tab as TabId) : defaultTab;
  const setActiveTab = (id: TabId) => navigate(`/dashboard/${id}`);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [prevStats, setPrevStats] = useState<any>(null);
  
  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [sectionForm, setSectionForm] = useState({ nameAr: '', nameEn: '', slug: '', displayOrder: 0 });
  const [sectionLoading, setSectionLoading] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ nameAr: '', nameEn: '', section: 'general', image: '' });
  const [questionForm, setQuestionForm] = useState({ 
    categoryId: '', 
    questionAr: '', 
    questionEn: '', 
    answerAr: '', 
    answerEn: '', 
    points: 200,
    questionImage: '',
    answerImage: ''
  });
  const [userForm, setUserForm] = useState({ gamesToAdd: 1 });
  const [imageForm, setImageForm] = useState({ type: 'category', id: '', imageUrl: '' });

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    // Load users from database
    usersAPI.getAll({ limit: 100 })
      .then((res: any) => {
        const apiUsers = res?.users || res?.data?.users || [];
        setUsers(apiUsers.map((u: any) => ({
          id: String(u.id),
          username: u.username,
          email: u.email,
          role: u.role || 'user',
          gamesPurchased: u.games_purchased ?? u.gamesPurchased ?? 0,
          gamesPlayed: u.games_played ?? u.gamesPlayed ?? 0,
          createdAt: u.created_at ?? u.createdAt ?? '',
        })));
      })
      .catch(() => setUsers([]));

    // Load orders
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);

        // Load categories from database
    categoriesAPI.getAll({ includeInactive: true } as any)
      .then((res) => {
        setCategories((res.data || []).map(mapApiCategoryToUi));
      })
      .catch((error) => {
        console.error('Failed to load categories:', error);
        setCategories([]);
      });

          // Load questions from database
    questionsAPI.getAll({ limit: 1000 })
      .then((res) => {
        const apiQuestions = res.data?.questions || [];

        setQuestions(apiQuestions.map((q: any) => ({
          id: String(q.id),
          categoryId: String(q.category_id),
          question: {
            ar: q.question_ar || '',
            en: q.question_en || ''
          },
          answer: {
            ar: q.answer_ar || '',
            en: q.answer_en || ''
          },
          points: Number(q.points),
          difficulty: q.difficulty,
          image: q.image_url || '',
          answerImage: q.answer_image_url || ''
        })));
      })
      .catch((error) => {
        console.error('Failed to load questions:', error);
        setQuestions([]);
      });

    // Load site images/settings
    siteSettingsAPI.getAll()
      .then((res: any) => {
        const map: Record<string, string> = {};
        (res.data || []).forEach((s: any) => { map[s.key] = s.value; });
        setSiteImages(map);
      })
      .catch(() => {});

    // Load sections from API
    sectionsAPI.getAll({ includeInactive: true })
      .then((res: any) => setSectionsList(res.data || []))
      .catch(() => setSectionsList([]));

    // Load previous stats
    const savedPrevStats = localStorage.getItem('prevStats');
    if (savedPrevStats) {
      setPrevStats(JSON.parse(savedPrevStats));
    }
  };

  // Collapse all categories by default when they load
  useEffect(() => {
    if (categories.length > 0) {
      setCollapsedCats(new Set(categories.map((c: any) => String(c.id))));
    }
  }, [categories]);

  // Calculate current stats
  const currentStats = {
    totalUsers: users.length,
    totalCategories: categories.length,
    totalQuestions: questions.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.price || 0), 0)
  };

  // Calculate growth percentages
  const getGrowth = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const stats = {
    ...currentStats,
    userGrowth: getGrowth(currentStats.totalUsers, prevStats?.totalUsers || 0),
    categoryGrowth: getGrowth(currentStats.totalCategories, prevStats?.totalCategories || 0),
    questionGrowth: getGrowth(currentStats.totalQuestions, prevStats?.totalQuestions || 0),
    orderGrowth: getGrowth(currentStats.totalOrders, prevStats?.totalOrders || 0),
    revenueGrowth: getGrowth(currentStats.totalRevenue, prevStats?.totalRevenue || 0)
  };

  // Save current stats for next comparison
  useEffect(() => {
    localStorage.setItem('prevStats', JSON.stringify(currentStats));
  }, [currentStats]);

  // Generate chart data
  const userGrowthData = [
    { name: 'Jan', users: Math.max(0, users.length - 5) },
    { name: 'Feb', users: Math.max(0, users.length - 4) },
    { name: 'Mar', users: Math.max(0, users.length - 3) },
    { name: 'Apr', users: Math.max(0, users.length - 2) },
    { name: 'May', users: Math.max(0, users.length - 1) },
    { name: 'Jun', users: users.length },
  ];

  const categoryData = categories.slice(0, 6).map(c => ({
    name: c.name.ar,
    questions: c.count || 6
  }));

  const pieData = [
    { name: language === 'ar' ? 'مستخدمين' : 'Users', value: users.length },
    { name: language === 'ar' ? 'فئات' : 'Categories', value: categories.length },
    { name: language === 'ar' ? 'أسئلة' : 'Questions', value: questions.length },
    { name: language === 'ar' ? 'طلبات' : 'Orders', value: orders.length },
  ];

  // Category Functions
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ nameAr: '', nameEn: '', section: 'general', image: '' });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({ 
      nameAr: cat.name.ar, 
      nameEn: cat.name.en, 
      section: cat.section,
      image: cat.image || ''
    });
    setShowCategoryModal(true);
  };

    const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await categoriesAPI.update(Number(editingCategory.id), {
        nameAr: categoryForm.nameAr,
        nameEn: categoryForm.nameEn,
        descriptionAr: editingCategory.description?.ar || '',
        descriptionEn: editingCategory.description?.en || '',
        section: categoryForm.section,
        imageUrl: categoryForm.image || 'question',
      } as any);
      } else {
          await categoriesAPI.create({
          nameAr: categoryForm.nameAr,
          nameEn: categoryForm.nameEn,
          descriptionAr: '',
          descriptionEn: '',
          section: categoryForm.section,
          imageUrl: categoryForm.image || 'question',
          questionCount: 6,
        } as any);
      }

      const res = await categoriesAPI.getAll({ includeInactive: true } as any);
      setCategories((res.data || []).map(mapApiCategoryToUi));
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      alert(
        error instanceof Error
          ? error.message
          : language === 'ar'
            ? 'فشل حفظ الفئة'
            : 'Failed to save category'
      );
    }
  };

    const handleDeleteCategory = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      try {
        await categoriesAPI.delete(Number(id));

        const res = await categoriesAPI.getAll({ includeInactive: true } as any);
        setCategories((res.data || []).map(mapApiCategoryToUi));
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert(language === 'ar' ? 'فشل حذف الفئة' : 'Failed to delete category');
      }
    }
  };


  // Section Functions
  const handleAddSection = () => {
    setEditingSection(null);
    setSectionForm({ nameAr: '', nameEn: '', slug: '', displayOrder: sectionsList.length });
    setShowSectionModal(true);
  };

  const handleEditSection = (sec: any) => {
    setEditingSection(sec);
    setSectionForm({ nameAr: sec.name_ar, nameEn: sec.name_en, slug: sec.slug, displayOrder: sec.display_order ?? 0 });
    setShowSectionModal(true);
  };

  const saveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSectionLoading(true);
    try {
      if (editingSection) {
        await sectionsAPI.update(editingSection.id, {
          nameAr: sectionForm.nameAr,
          nameEn: sectionForm.nameEn,
          slug: sectionForm.slug !== editingSection.slug ? sectionForm.slug : undefined,
          displayOrder: sectionForm.displayOrder,
        });
      } else {
        await sectionsAPI.create({
          nameAr: sectionForm.nameAr,
          nameEn: sectionForm.nameEn,
          slug: sectionForm.slug,
          displayOrder: sectionForm.displayOrder,
        });
      }
      const res: any = await sectionsAPI.getAll({ includeInactive: true });
      setSectionsList(res.data || []);
      setShowSectionModal(false);
    } catch (err: any) {
      alert(err?.message || (language === 'ar' ? 'فشل حفظ القسم' : 'Failed to save section'));
    } finally {
      setSectionLoading(false);
    }
  };

  const handleDeleteSection = async (sec: any) => {
    if (sec.category_count > 0) {
      const msg = language === 'ar'
        ? `هذا القسم يحتوي على ${sec.category_count} فئة. هل تريد حذفه وإلغاء تفعيل الفئات؟`
        : `This section has ${sec.category_count} categories. Delete and deactivate them?`;
      if (!confirm(msg)) return;
      await sectionsAPI.delete(sec.id, true);
    } else {
      if (!confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) return;
      await sectionsAPI.delete(sec.id);
    }
    const res: any = await sectionsAPI.getAll({ includeInactive: true });
    setSectionsList(res.data || []);
  };

  const handleToggleSection = async (id: number) => {
    await sectionsAPI.toggle(id);
    const res: any = await sectionsAPI.getAll({ includeInactive: true });
    setSectionsList(res.data || []);
  };

  const [togglingCatId, setTogglingCatId] = useState<string | null>(null);

  const handleToggleCategory = async (cat: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (togglingCatId === String(cat.id)) return;
    setTogglingCatId(String(cat.id));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/categories/${cat.id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Toggle failed');
      const allRes = await categoriesAPI.getAll({ includeInactive: true } as any);
      setCategories((allRes.data || []).map(mapApiCategoryToUi));
    } catch (err: any) {
      console.error('Toggle error:', err);
      alert(language === 'ar' ? `فشل: ${err?.message || 'خطأ غير معروف'}` : `Failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setTogglingCatId(null);
    }
  };

  const handleSaveImage = async (key: string, value: string) => {
    try {
      await siteSettingsAPI.set(key, value);
      setSiteImages(prev => ({ ...prev, [key]: value }));
    } catch {
      alert(language === 'ar' ? 'فشل حفظ الصورة' : 'Failed to save image');
    }
  };

  // Question Functions
  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ 
      categoryId: categories[0]?.id ? String(categories[0].id) : '', 
      questionAr: '', 
      questionEn: '', 
      answerAr: '', 
      answerEn: '', 
      points: 200,
      questionImage: '',
      answerImage: ''
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setQuestionForm({
      categoryId: q.categoryId ? String(q.categoryId) : '',
      questionAr: q.question?.ar || '',
      questionEn: q.question?.en || '',
      answerAr: q.answer?.ar || '',
      answerEn: q.answer?.en || '',
      points: q.points || 200,
      questionImage: q.image || '',
      answerImage: q.answerImage || ''
    });
    setShowQuestionModal(true);
  };

    const saveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    const difficulty =
      Number(questionForm.points) === 200
        ? 'easy'
        : Number(questionForm.points) === 400
          ? 'medium'
          : 'hard';

    try {
      if (editingQuestion) {
        await questionsAPI.update(Number(editingQuestion.id), {
          categoryId: Number(questionForm.categoryId),
          questionAr: questionForm.questionAr || '',
          questionEn: questionForm.questionEn || '',
          answerAr: questionForm.answerAr || '',
          answerEn: questionForm.answerEn || '',
          points: Number(questionForm.points),
          difficulty,
          imageUrl: questionForm.questionImage || '',
          answerImageUrl: questionForm.answerImage || '',
          groupId: null
        } as any);
      } else {
        await questionsAPI.create({
          categoryId: Number(questionForm.categoryId),
          questionAr: questionForm.questionAr || '',
          questionEn: questionForm.questionEn || '',
          answerAr: questionForm.answerAr || '',
          answerEn: questionForm.answerEn || '',
          points: Number(questionForm.points),
          difficulty,
          imageUrl: questionForm.questionImage || '',
          answerImageUrl: questionForm.answerImage || '',
          groupId: null
        } as any);
      }

      const res = await questionsAPI.getAll({ limit: 1000 });
      const apiQuestions = res.data?.questions || [];

      setQuestions(apiQuestions.map((q: any) => ({
        id: String(q.id),
        categoryId: String(q.category_id),
        question: {
          ar: q.question_ar || '',
          en: q.question_en || ''
        },
        answer: {
          ar: q.answer_ar || '',
          en: q.answer_en || ''
        },
        points: Number(q.points),
        difficulty: q.difficulty,
        image: q.image_url || '',
        answerImage: q.answer_image_url || ''
      })));

      setShowQuestionModal(false);
    } catch (error) {
      console.error('Failed to save question:', error);
      alert(
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as any).message)
          : language === 'ar'
            ? 'فشل حفظ السؤال في الداتا بيس'
            : 'Failed to save question in database'
      );
    }
  };
  const handleDeleteQuestion = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) {
      try {
        await questionsAPI.delete(Number(id));

        const res = await questionsAPI.getAll({ limit: 1000 });
        const apiQuestions = res.data?.questions || [];

        setQuestions(apiQuestions.map((q: any) => ({
          id: String(q.id),
          categoryId: String(q.category_id),
          question: {
            ar: q.question_ar || '',
            en: q.question_en || ''
          },
          answer: {
            ar: q.answer_ar || '',
            en: q.answer_en || ''
          },
          points: Number(q.points),
          difficulty: q.difficulty,
          image: q.image_url || '',
          answerImage: q.answer_image_url || ''
        })));
      } catch (error) {
        console.error('Failed to delete question:', error);
        alert(language === 'ar' ? 'فشل حذف السؤال من الداتا بيس' : 'Failed to delete question from database');
      }
    }
  };

  // User Functions
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({ gamesToAdd: 1 });
    setShowUserModal(true);
  };

  const saveUserGames = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && userForm.gamesToAdd > 0) {
      try {
        await usersAPI.update(editingUser.id, {
          games_purchased: (editingUser.gamesPurchased || 0) + userForm.gamesToAdd
        });
        setUsers(prev => prev.map(u =>
          u.id === editingUser.id
            ? { ...u, gamesPurchased: (u.gamesPurchased || 0) + userForm.gamesToAdd }
            : u
        ));
        setShowUserModal(false);
      } catch {
        alert(language === 'ar' ? 'فشل تحديث بيانات المستخدم' : 'Failed to update user');
      }
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(language === 'ar' 
      ? `هل أنت متأكد من حذف حساب "${username}"؟ هذا الإجراء لا يمكن التراجع عنه.`
      : `Are you sure you want to delete "${username}"? This cannot be undone.`)) return;
    try {
      await usersAPI.delete(Number(userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch {
      alert(language === 'ar' ? 'فشل حذف الحساب' : 'Failed to delete account');
    }
  };

  // Change user role
  const handleChangeRole = async (userId: string, username: string, currentRole: string) => {
    const newRole = currentRole === 'editor' ? 'user' : 'editor';
    const msg = language === 'ar'
      ? `تحويل "${username}" إلى ${newRole === 'editor' ? 'محرر' : 'مستخدم عادي'}؟`
      : `Change "${username}" to ${newRole}?`;
    if (!confirm(msg)) return;
    try {
      await usersAPI.update(Number(userId), { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch {
      alert(language === 'ar' ? 'فشل تغيير الدور' : 'Failed to change role');
    }
  };

  // Image Functions
  const handleImageEdit = (type: string, id: string, currentImage: string) => {
    setImageForm({ type, id, imageUrl: currentImage || '' });
    setShowImageModal(true);
  };

  const saveImage = (e: React.FormEvent) => {
    e.preventDefault();
    
      if (imageForm.type === 'category') {
        categoriesAPI.update(Number(imageForm.id), {
          imageUrl: imageForm.imageUrl,
      } as any)
        .then(async () => {
          const res = await categoriesAPI.getAll({ includeInactive: true } as any);
          setCategories((res.data || []).map(mapApiCategoryToUi));
        })
        .catch((error) => {
          console.error('Failed to update category image:', error);
          alert(language === 'ar' ? 'فشل تحديث صورة الفئة' : 'Failed to update category image');
        });
    } else if (imageForm.type === 'site') {
      handleSaveImage(imageForm.id, imageForm.imageUrl);
    } else if (imageForm.type === 'powerup') {
      const savedPowerups = JSON.parse(localStorage.getItem('powerUps') || '[]');
      const updated = savedPowerups.map((p: any) => 
        p.id === imageForm.id ? { ...p, icon: imageForm.imageUrl } : p
      );
      localStorage.setItem('powerUps', JSON.stringify(updated));
    }
    
    setShowImageModal(false);
  };

  const sections = [
    ...(!isEditor ? [{ id: 'stats', name: { ar: 'الإحصائيات', en: 'Statistics' }, icon: BarChart3 }] : []),
    { id: 'categories', name: { ar: 'الفئات', en: 'Categories' }, icon: Grid3X3 },
    { id: 'archive', name: { ar: 'الأرشيف', en: 'Archive' }, icon: Archive },
    { id: 'questions', name: { ar: 'الأسئلة', en: 'Questions' }, icon: HelpCircle },
    ...(!isEditor ? [
      { id: 'users', name: { ar: 'المستخدمين', en: 'Users' }, icon: Users },
      { id: 'orders', name: { ar: 'الطلبات', en: 'Orders' }, icon: ShoppingCart },
      { id: 'images', name: { ar: 'الصور', en: 'Images' }, icon: ImageIcon }
    ] : [])
  ];

  const renderGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return (
        <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
          <TrendingUp size={16} />
          +{growth}%
        </span>
      );
    } else if (growth < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600 text-sm font-bold">
          <TrendingDown size={16} />
          {growth}%
        </span>
      );
    }
    return <span className="text-gray-400 text-sm">0%</span>;
  };

  return (
    <div className="min-h-screen flex bg-[#F5E6D3]" dir={dir}>
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#5D3A1A] to-[#8B5A2B] text-white fixed right-0 top-0 min-h-screen overflow-y-auto z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-8">
            {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
          
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id as any)}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === section.id 
                    ? 'bg-white/30' 
                    : 'hover:bg-white/20'
                }`}
              >
                <section.icon size={20} />
                {section.name[language]}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-4">
          <button 
            onClick={onBack}
            className="w-full p-3 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={18} />
            {language === 'ar' ? 'رجوع للموقع' : 'Back to Site'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-64 p-8">
        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-3xl font-bold text-[#5D3A1A] mb-8">
              {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#8B5A2B]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#F5E6D3] rounded-xl">
                    <Users className="text-[#8B5A2B]" size={24} />
                  </div>
                  {renderGrowthIndicator(stats.userGrowth)}
                </div>
                <p className="text-gray-500 text-sm">{language === 'ar' ? 'المستخدمين' : 'Users'}</p>
                <p className="text-3xl font-bold text-[#5D3A1A]">{stats.totalUsers}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#5D3A1A]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#F5E6D3] rounded-xl">
                    <Grid3X3 className="text-[#5D3A1A]" size={24} />
                  </div>
                  {renderGrowthIndicator(stats.categoryGrowth)}
                </div>
                <p className="text-gray-500 text-sm">{language === 'ar' ? 'الفئات' : 'Categories'}</p>
                <p className="text-3xl font-bold text-[#5D3A1A]">{stats.totalCategories}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#D4A574]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#F5E6D3] rounded-xl">
                    <HelpCircle className="text-[#D4A574]" size={24} />
                  </div>
                  {renderGrowthIndicator(stats.questionGrowth)}
                </div>
                <p className="text-gray-500 text-sm">{language === 'ar' ? 'الأسئلة' : 'Questions'}</p>
                <p className="text-3xl font-bold text-[#5D3A1A]">{stats.totalQuestions}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                  {renderGrowthIndicator(stats.revenueGrowth)}
                </div>
                <p className="text-gray-500 text-sm">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* User Growth Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold text-[#5D3A1A] mb-4">
                  {language === 'ar' ? 'نمو المستخدمين' : 'User Growth'}
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5A2B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5A2B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="users" stroke="#8B5A2B" fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Distribution Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold text-[#5D3A1A] mb-4">
                  {language === 'ar' ? 'توزيع البيانات' : 'Data Distribution'}
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Questions Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-[#5D3A1A] mb-4">
                {language === 'ar' ? 'الأسئلة حسب الفئة' : 'Questions by Category'}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="questions" fill="#8B5A2B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#5D3A1A]">
                {language === 'ar' ? 'الفئات' : 'Categories'}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleAddSection}
                  className="bg-[#5D3A1A] text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-[#3d2510] transition-colors"
                >
                  <Layers size={20} />
                  {language === 'ar' ? 'إضافة قسم' : 'Add Section'}
                </button>
                <button 
                  onClick={handleAddCategory}
                  className="bg-[#8B5A2B] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#5D3A1A] transition-colors"
                >
                  <Plus size={20} />
                  {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
                </button>
              </div>
            </div>

            {/* Sections management strip */}
            {sectionsList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-[#E8D5C4]">
                <span className="text-[#8B5A2B] font-bold text-sm self-center ml-2">
                  {language === 'ar' ? 'الأقسام:' : 'Sections:'}
                </span>
                {sectionsList.map((sec: any) => (
                  <div key={sec.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${sec.is_active ? 'bg-[#F5E6D3] border-[#C4A882] text-[#5D3A1A]' : 'bg-gray-100 border-gray-300 text-gray-400 line-through'}`}>
                    <span>{sec.name_ar}</span>
                    <span className="text-xs text-gray-400 mx-1">({sec.category_count ?? 0})</span>
                    <button onClick={() => handleEditSection(sec)} className="hover:text-[#8B5A2B] p-0.5 rounded"><Edit size={12} /></button>
                    <button onClick={() => handleToggleSection(sec.id)} className={`p-0.5 rounded ${sec.is_active ? 'hover:text-orange-500' : 'hover:text-green-600'}`} title={sec.is_active ? 'إيقاف' : 'تفعيل'}>
                      {sec.is_active ? <X size={12} /> : <Plus size={12} />}
                    </button>
                    <button onClick={() => handleDeleteSection(sec)} className="hover:text-red-500 p-0.5 rounded"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Group categories by section */}
            {(() => {
              const sections = [...new Set(categories.filter((c: any) => c.is_active !== false).map((c: any) => c.section || 'general'))];
              return sections.map((section: string) => {
                const sectionCats = categories.filter((c: any) => (c.section || 'general') === section && c.is_active !== false);
                return (
                  <div key={section} className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-0.5 flex-1 bg-[#C4A882]" />
                      <span className="text-[#8B5A2B] font-bold text-lg px-3 bg-[#F5E6D3] rounded-full border border-[#C4A882]">
                        {section}
                      </span>
                      <div className="h-0.5 flex-1 bg-[#C4A882]" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {sectionCats.map((cat: any) => (
                        <div key={cat.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                          <div className="h-40 bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] flex items-center justify-center relative">
                            {cat.image === 'question' || !cat.image ? (
                              <span className="text-6xl">❓</span>
                            ) : (
                              <img src={cat.image} alt="" className="w-full h-full object-cover" />
                            )}
                            {/* Archive button — top right of image */}
                            <button
                              onClick={(e) => handleToggleCategory(cat, e)}
                              disabled={togglingCatId === String(cat.id)}
                              className="absolute top-2 right-2 bg-orange-400/90 hover:bg-orange-500 text-white p-1.5 rounded-full shadow-md transition-all hover:scale-110 z-10 disabled:opacity-50"
                              title={language === 'ar' ? 'أرشفة' : 'Archive'}
                            >
                              {togglingCatId === String(cat.id)
                                ? <span className="text-xs animate-spin block">⏳</span>
                                : <Archive size={14} />}
                            </button>
                            <button
                              onClick={() => handleImageEdit('category', cat.id, cat.image)}
                              className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white"
                            >
                              <ImageIcon size={16} />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg text-[#5D3A1A]">{cat.name.ar}</h3>
                            <p className="text-gray-500">{cat.name.en}</p>
                            <p className="text-sm text-[#8B5A2B] mt-2">{cat.count || 6} {language === 'ar' ? 'أسئلة' : 'Questions'}</p>
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => handleEditCategory(cat)}
                                className="flex-1 p-2 bg-[#8B5A2B] text-white rounded-lg hover:bg-[#5D3A1A] transition-colors flex items-center justify-center gap-1"
                              >
                                <Edit size={16} />
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                              >
                                <Trash2 size={16} />
                                {language === 'ar' ? 'حذف' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Questions Tab — grouped by category then by points */}
        {activeTab === 'questions' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#5D3A1A]">
                {language === 'ar' ? 'الأسئلة' : 'Questions'}
              </h2>
              <button 
                onClick={handleAddQuestion}
                className="bg-[#8B5A2B] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#5D3A1A] transition-colors"
              >
                <Plus size={20} />
                {language === 'ar' ? 'إضافة سؤال' : 'Add Question'}
              </button>
            </div>

            {questions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {language === 'ar' ? 'لا توجد أسئلة بعد' : 'No questions yet'}
              </p>
            ) : (() => {
              // Group by category
              const grouped: Record<string, any[]> = {};
              questions.forEach((q: any) => {
                const catId = String(q.categoryId);
                if (!grouped[catId]) grouped[catId] = [];
                grouped[catId].push(q);
              });

              return Object.entries(grouped).map(([catId, qs]) => {
                const cat = categories.find((c: any) => String(c.id) === catId);
                const catName = cat?.name?.ar || (language === 'ar' ? 'غير مصنف' : 'Uncategorized');
                const byPoints: Record<number, any[]> = { 200: [], 400: [], 600: [] };
                qs.forEach((q: any) => {
                  const p = Number(q.points);
                  if (byPoints[p]) byPoints[p].push(q);
                  else byPoints[600].push(q);
                });

                const QCard = ({ q }: { q: any }) => (
                  <div className="bg-white rounded-xl shadow p-4 flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#5D3A1A] truncate">{q.question?.ar}</p>
                      <p className="text-gray-500 text-sm truncate">{q.question?.en}</p>
                      <p className="text-[#8B5A2B] text-sm mt-1 font-semibold">
                        {language === 'ar' ? 'الجواب:' : 'Answer:'} {q.answer?.ar}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {q.image && <img src={q.image} alt="" className="w-12 h-12 object-cover rounded-lg" />}
                      <button onClick={() => handleEditQuestion(q)} className="p-2 bg-[#8B5A2B] text-white rounded-lg hover:bg-[#5D3A1A]"><Edit size={16}/></button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Trash2 size={16}/></button>
                    </div>
                  </div>
                );

                return (
                  <div key={catId} className="mb-10 bg-[#FAF3E8] rounded-2xl p-5 shadow-md">
                    {/* Category header with toggle */}
                    {(() => {
                      const isCollapsed = collapsedCats.has(catId);
                      const toggle = () => setCollapsedCats(prev => {
                        const next = new Set(prev);
                        isCollapsed ? next.delete(catId) : next.add(catId);
                        return next;
                      });
                      return (
                        <>
                          <button onClick={toggle} className="flex items-center gap-3 w-full text-right mb-2 group">
                            {cat?.image && <img src={cat.image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#C4A882]" />}
                            <h3 className="text-xl font-bold text-[#5D3A1A] flex-1">{catName}</h3>
                            <span className="text-sm text-[#8B5A2B] bg-[#C4A882]/20 px-2 py-0.5 rounded-full">{qs.length} {language === 'ar' ? 'سؤال' : 'questions'}</span>
                            <ChevronDown size={22} className={`text-[#8B5A2B] transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
                          </button>
                          {!isCollapsed && [200, 400, 600].map(pts => byPoints[pts].length > 0 && (
                      <div key={pts} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${pts === 200 ? 'bg-green-600' : pts === 400 ? 'bg-blue-600' : 'bg-[#8B5A2B]'}`}>
                            {pts} {language === 'ar' ? 'نقطة' : 'pts'}
                          </span>
                          <div className="h-px flex-1 bg-[#C4A882]/40"/>
                        </div>
                        <div className="space-y-2">
                          {byPoints[pts].map((q: any) => <QCard key={q.id} q={q} />)}
                        </div>
                      </div>
                    ))}
                        </>
                      );
                    })()}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-3xl font-bold text-[#5D3A1A] mb-8">
              {language === 'ar' ? 'المستخدمين' : 'Users'}
            </h2>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {users.length === 0 ? (
                <p className="p-8 text-center text-gray-500">
                  {language === 'ar' ? 'لا يوجد مستخدمين' : 'No users'}
                </p>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F5E6D3]">
                    <tr>
                      <th className="p-4 text-right">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                      <th className="p-4 text-right">{language === 'ar' ? 'البريد' : 'Email'}</th>
                      <th className="p-4 text-right">{language === 'ar' ? 'الألعاب' : 'Games'}</th>
                      <th className="p-4 text-right">{language === 'ar' ? 'تاريخ الانضمام' : 'Join Date'}</th>
                      <th className="p-4 text-right">{language === 'ar' ? 'الدور' : 'Role'}</th>
                      <th className="p-4 text-right">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-semibold">{u.username}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">{u.gamesPurchased || 0}</td>
                        <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-white text-sm ${
                            u.role === 'admin' ? 'bg-red-500' :
                            u.role === 'editor' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                            {u.role === 'admin' ? 'Admin' : u.role === 'editor' ? 'Editor' : 'User'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleEditUser(u)}
                              className="px-3 py-1 bg-[#8B5A2B] text-white rounded-lg text-sm hover:bg-[#5D3A1A] transition-colors"
                            >
                              {language === 'ar' ? 'إعطاء لعبة' : 'Give Game'}
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleChangeRole(u.id, u.username, u.role)}
                                className={`px-3 py-1 rounded-lg text-sm text-white transition-colors ${
                                  u.role === 'editor'
                                    ? 'bg-gray-500 hover:bg-gray-600'
                                    : 'bg-purple-500 hover:bg-purple-600'
                                }`}
                              >
                                {u.role === 'editor'
                                  ? (language === 'ar' ? 'إزالة Editor' : 'Remove Editor')
                                  : (language === 'ar' ? 'تعيين Editor' : 'Make Editor')}
                              </button>
                            )}
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                              >
                                {language === 'ar' ? 'حذف' : 'Delete'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-3xl font-bold text-[#5D3A1A] mb-8">
              {language === 'ar' ? 'الطلبات' : 'Orders'}
            </h2>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {orders.length === 0 ? (
                <p className="p-8 text-center text-gray-500">
                  {language === 'ar' ? 'لا توجد طلبات' : 'No orders'}
                </p>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F5E6D3]">
                    <tr>
                      <th className="p-4 text-right">{language === 'ar' ? 'الطلب' : 'Order'}</th>
                      <th className="p-4 text-right">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                      <th className="p-4 text-right">{language === 'ar' ? 'السعر' : 'Price'}</th>
                      <th className="p-4 text-right">{language === 'ar' ? 'الألعاب' : 'Games'}</th>
                      <th className="p-4 text-right">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{o.itemName?.ar || o.itemName}</td>
                        <td className="p-4">{o.userId}</td>
                        <td className="p-4 font-bold text-[#8B5A2B]">${o.price}</td>
                        <td className="p-4">{o.games}</td>
                        <td className="p-4">{new Date(o.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Archive Tab */}
        {activeTab === 'archive' && (
          <div>
            <h2 className="text-3xl font-bold text-[#5D3A1A] mb-8 flex items-center gap-3">
              <Archive size={32} />
              {language === 'ar' ? 'أرشيف الفئات المخفية' : 'Hidden Categories Archive'}
            </h2>
            {(() => {
              const archived = categories.filter((c: any) => c.is_active === false);
              if (archived.length === 0) return (
                <div className="text-center py-20 text-gray-400">
                  <Archive size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-xl font-bold">{language === 'ar' ? 'لا توجد فئات مخفية' : 'No hidden categories'}</p>
                </div>
              );
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {archived.map((cat: any) => (
                    <div key={cat.id} className="bg-white rounded-2xl shadow-lg overflow-hidden opacity-70 border-2 border-dashed border-gray-300">
                      <div className="h-32 relative">
                        {cat.image && cat.image !== 'question' ? (
                          <img src={cat.image} alt="" className="w-full h-full object-cover grayscale" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <HelpCircle size={40} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <EyeOff size={28} className="text-white" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-[#5D3A1A] truncate">{cat.name.ar}</p>
                        <p className="text-gray-400 text-sm truncate">{cat.name.en}</p>
                        <button
                          onClick={(e) => handleToggleCategory(cat, e)}
                          disabled={togglingCatId === String(cat.id)}
                          className="mt-3 w-full py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {togglingCatId === String(cat.id)
                            ? <span className="animate-spin">⏳</span>
                            : <><Eye size={16} />{language === 'ar' ? 'إظهار' : 'Show'}</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div>
            <h2 className="text-3xl font-bold text-[#5D3A1A] mb-8">
              {language === 'ar' ? 'إدارة الصور' : 'Image Management'}
            </h2>

            {/* Site Images (logo, icons, etc.) */}
            {(() => {
              const siteImagesList = [
                { key: 'logo_url', labelAr: 'لوقو الموقع', labelEn: 'Site Logo', defaultUrl: '/logo.png' },
                { key: 'report_icon_url', labelAr: 'أيقونة الابلاغ', labelEn: 'Report Icon', defaultUrl: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1779754523/ChatGPT_Image_May_26_2026_03_14_07_AM_ihw9fa.png' },
                { key: 'callfriend_icon_url', labelAr: 'أيقونة اتصل بصديق', labelEn: 'Call Friend Icon', defaultUrl: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1777546198/call_a_friend_bcblxt.png' },
              ];
              return (
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-[#5D3A1A] mb-4">{language === 'ar' ? 'صور الموقع العامة' : 'General Site Images'}</h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-5">
                    {siteImagesList.map(item => {
                      const currentUrl = siteImages[item.key] || item.defaultUrl;
                      return (
                        <div key={item.key} className="bg-white rounded-2xl shadow-lg p-4 text-center">
                          <div className="h-20 flex items-center justify-center mb-3">
                            <img src={currentUrl} alt={item.labelAr} className="max-h-full max-w-full object-contain rounded-lg" />
                          </div>
                          <p className="text-sm font-bold text-[#5D3A1A] mb-3">{language === 'ar' ? item.labelAr : item.labelEn}</p>
                          <button
                            onClick={() => handleImageEdit('site', item.key, currentUrl)}
                            className="w-full px-3 py-1.5 bg-[#8B5A2B] text-white rounded-lg text-sm hover:bg-[#5D3A1A] transition-colors"
                          >
                            {language === 'ar' ? 'تغيير' : 'Change'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Powerup Images */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-[#5D3A1A] mb-4">{language === 'ar' ? 'صور وسائل المساعدة' : 'Powerup Images'}</h3>
              <div className="grid grid-cols-5 gap-4">
                {powerUps.map((power) => {
                  const currentUrl = siteImages[`powerup_${power.id}`] || power.icon;
                  return (
                    <div key={power.id} className="bg-white rounded-2xl shadow-lg p-4 text-center">
                      <img src={currentUrl} alt="" className="w-16 h-16 mx-auto mb-2 object-contain" />
                      <p className="text-sm font-semibold text-[#5D3A1A]">{power.name.ar}</p>
                      <button
                        onClick={() => handleImageEdit('site', `powerup_${power.id}`, currentUrl)}
                        className="mt-2 w-full px-3 py-1 bg-[#8B5A2B] text-white rounded-lg text-sm hover:bg-[#5D3A1A] transition-colors"
                      >
                        {language === 'ar' ? 'تغيير' : 'Change'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={editingCategory 
          ? (language === 'ar' ? 'تعديل فئة' : 'Edit Category')
          : (language === 'ar' ? 'إضافة فئة' : 'Add Category')
        }
        icon="https://res.cloudinary.com/ddoa8gqdz/image/upload/v1779758502/edit_hpn6fw.png"
      >
        <form onSubmit={saveCategory}>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'اسم الفئة (عربي)' : 'Category Name (Arabic)'}
            </label>
            <input
              type="text"
              value={categoryForm.nameAr}
              onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'اسم الفئة (English)' : 'Category Name (English)'}
            </label>
            <input
              type="text"
              value={categoryForm.nameEn}
              onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'القسم' : 'Section'}
            </label>
            <select
              value={categoryForm.section}
              onChange={(e) => setCategoryForm({ ...categoryForm, section: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
            >
              {sectionsList.filter((s: any) => s.is_active).map((s: any) => (
                <option key={s.id} value={s.slug}>{s.name_ar}</option>
              ))}
              {sectionsList.filter((s: any) => s.is_active).length === 0 && (
                <option value="general">general</option>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
            </label>
            <input
              type="text"
              value={categoryForm.image}
              onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
              placeholder="https://..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              className="flex-1 p-3 bg-gray-300 rounded-xl"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-[#8B5A2B] text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {language === 'ar' ? 'حفظ' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Question Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title={editingQuestion 
          ? (language === 'ar' ? 'تعديل سؤال' : 'Edit Question')
          : (language === 'ar' ? 'إضافة سؤال' : 'Add Question')
        }
        icon="❓"
      >
        <form onSubmit={saveQuestion}>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'الفئة' : 'Category'}
            </label>
            <select
              value={questionForm.categoryId}
              onChange={(e) => setQuestionForm({ ...questionForm, categoryId: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name.ar}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'السؤال (عربي)' : 'Question (Arabic)'}
            </label>
            <textarea
              value={questionForm.questionAr}
              onChange={(e) => setQuestionForm({ ...questionForm, questionAr: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] h-24"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'السؤال (English)' : 'Question (English)'}
            </label>
            <textarea
              value={questionForm.questionEn}
              onChange={(e) => setQuestionForm({ ...questionForm, questionEn: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] h-24"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'صورة السؤال (رابط)' : 'Question Image (URL)'}
            </label>
            <input
              type="text"
              value={questionForm.questionImage}
              onChange={(e) => setQuestionForm({ ...questionForm, questionImage: e.target.value })}
              placeholder="https://..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'الإجابة (عربي)' : 'Answer (Arabic)'}
            </label>
            <input
              type="text"
              value={questionForm.answerAr}
              onChange={(e) => setQuestionForm({ ...questionForm, answerAr: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'الإجابة (English)' : 'Answer (English)'}
            </label>
            <input
              type="text"
              value={questionForm.answerEn}
              onChange={(e) => setQuestionForm({ ...questionForm, answerEn: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'صورة الإجابة (رابط)' : 'Answer Image (URL)'}
            </label>
            <input
              type="text"
              value={questionForm.answerImage}
              onChange={(e) => setQuestionForm({ ...questionForm, answerImage: e.target.value })}
              placeholder="https://..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'النقاط' : 'Points'}
            </label>
            <select
              value={questionForm.points}
              onChange={(e) => setQuestionForm({ ...questionForm, points: Number(e.target.value) })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
            >
              <option value={200}>200</option>
              <option value={400}>400</option>
              <option value={600}>600</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowQuestionModal(false)}
              className="flex-1 p-3 bg-gray-300 rounded-xl"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-[#8B5A2B] text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {language === 'ar' ? 'حفظ' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Games Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={language === 'ar' ? 'إعطاء ألعاب للمستخدم' : 'Give Games to User'}
        icon="🎮"
      >
        {editingUser && (
          <form onSubmit={saveUserGames}>
            <div className="mb-4">
              <p className="text-[#5D3A1A] font-bold">{editingUser.username}</p>
              <p className="text-gray-500">{editingUser.email}</p>
              <p className="text-[#8B5A2B] mt-2">
                {language === 'ar' ? 'الألعاب الحالية:' : 'Current Games:'} {editingUser.gamesPurchased || 0}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-[#5D3A1A] font-bold mb-2">
                {language === 'ar' ? 'عدد الألعاب لإضافتها' : 'Games to Add'}
              </label>
              <input
                type="number"
                min="1"
                value={userForm.gamesToAdd}
                onChange={(e) => setUserForm({ gamesToAdd: parseInt(e.target.value) || 1 })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="flex-1 p-3 bg-gray-300 rounded-xl"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 p-3 bg-[#8B5A2B] text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {language === 'ar' ? 'إعطاء' : 'Give'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title={language === 'ar' ? 'تغيير الصورة' : 'Change Image'}
        icon="🖼️"
      >
        <form onSubmit={saveImage}>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'رابط الصورة الجديدة' : 'New Image URL'}
            </label>
            <input
              type="text"
              value={imageForm.imageUrl}
              onChange={(e) => setImageForm({ ...imageForm, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
              required
            />
          </div>
          {imageForm.imageUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">{language === 'ar' ? 'معاينة:' : 'Preview:'}</p>
              <img src={imageForm.imageUrl} alt="" className="max-h-40 rounded-lg" />
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="flex-1 p-3 bg-gray-300 rounded-xl"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-[#8B5A2B] text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {language === 'ar' ? 'حفظ' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Section Modal */}
      <Modal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        title={editingSection
          ? (language === 'ar' ? 'تعديل قسم' : 'Edit Section')
          : (language === 'ar' ? 'إضافة قسم جديد' : 'Add New Section')
        }
        icon="https://res.cloudinary.com/ddoa8gqdz/image/upload/v1779758502/edit_hpn6fw.png"
      >
        <form onSubmit={saveSection}>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'اسم القسم (عربي)' : 'Section Name (Arabic)'}
            </label>
            <input
              type="text"
              value={sectionForm.nameAr}
              onChange={(e) => setSectionForm({ ...sectionForm, nameAr: e.target.value })}
              placeholder={language === 'ar' ? 'مثال: أنمي' : 'e.g. أنمي'}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'اسم القسم (English)' : 'Section Name (English)'}
            </label>
            <input
              type="text"
              value={sectionForm.nameEn}
              onChange={(e) => setSectionForm({ ...sectionForm, nameEn: e.target.value })}
              placeholder="e.g. Anime"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'المعرّف (Slug)' : 'Slug (ID)'}
              <span className="text-gray-400 font-normal text-xs mr-2">
                {language === 'ar' ? '(يُستخدم داخلياً، لا يتغير)' : '(used internally)'}
              </span>
            </label>
            <input
              type="text"
              value={sectionForm.slug}
              onChange={(e) => setSectionForm({ ...sectionForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="e.g. anime"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] outline-none font-mono"
              required
              disabled={!!editingSection}
            />
            {editingSection && (
              <p className="text-xs text-orange-500 mt-1">
                {language === 'ar' ? '⚠️ تغيير الـ Slug يؤثر على جميع الفئات المرتبطة' : '⚠️ Changing slug affects all linked categories'}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-[#5D3A1A] font-bold mb-2">
              {language === 'ar' ? 'ترتيب العرض' : 'Display Order'}
            </label>
            <input
              type="number"
              min="0"
              value={sectionForm.displayOrder}
              onChange={(e) => setSectionForm({ ...sectionForm, displayOrder: Number(e.target.value) })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] outline-none"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowSectionModal(false)}
              className="flex-1 p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={sectionLoading}
              className="flex-1 p-3 bg-[#5D3A1A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d2510] transition-colors disabled:opacity-60"
            >
              {sectionLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <><Save size={18} />{language === 'ar' ? 'حفظ' : 'Save'}</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
