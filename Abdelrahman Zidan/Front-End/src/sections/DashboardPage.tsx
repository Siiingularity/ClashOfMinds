import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, Users, Grid3X3, HelpCircle, ShoppingCart, Plus, Edit, Trash2, TrendingUp, TrendingDown, Image as ImageIcon, Save, DollarSign, BarChart3 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { powerUps, categorySections } from '@/data/categories';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardPageProps {
  onBack: () => void;
}

const COLORS = ['#8B5A2B', '#5D3A1A', '#D4A574', '#A67B5B', '#C49A6C', '#9C7650'];

export function DashboardPage({ onBack }: DashboardPageProps) {
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<'stats' | 'categories' | 'questions' | 'users' | 'orders' | 'images'>('stats');
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
    // Load users
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (!savedUsers.find((u: any) => u.email === 'admin@clashofminds.com')) {
      savedUsers.push({
        id: 'admin-1',
        username: 'admin',
        email: 'admin@clashofminds.com',
        password: 'TheGreatestAdminOfAllTime2164661726%%%$%^',
        role: 'admin',
        gamesPurchased: 999,
        gamesPlayed: 0,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('users', JSON.stringify(savedUsers));
    }
    setUsers(savedUsers);

    // Load orders
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);

    // Load categories
    const savedCategories = JSON.parse(localStorage.getItem('allCategories') || '[]');
    if (savedCategories.length === 0) {
      const defaultCategories = [
        { id: '1', name: { ar: 'علوم', en: 'Science' }, section: 'general', image: 'question', count: 6 },
        { id: '2', name: { ar: 'تاريخ', en: 'History' }, section: 'general', image: 'question', count: 6 },
        { id: '3', name: { ar: 'جغرافيا', en: 'Geography' }, section: 'general', image: 'question', count: 6 },
        { id: '4', name: { ar: 'أسئلة عامة', en: 'General' }, section: 'general', image: 'question', count: 6 },
      ];
      localStorage.setItem('allCategories', JSON.stringify(defaultCategories));
      setCategories(defaultCategories);
    } else {
      setCategories(savedCategories);
    }

    // Load questions
    const savedQuestions = JSON.parse(localStorage.getItem('allQuestions') || '[]');
    setQuestions(savedQuestions);

    // Load previous stats
    const savedPrevStats = localStorage.getItem('prevStats');
    if (savedPrevStats) {
      setPrevStats(JSON.parse(savedPrevStats));
    }
  };

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

  const saveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      const updated = categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, name: { ar: categoryForm.nameAr, en: categoryForm.nameEn }, section: categoryForm.section, image: categoryForm.image || c.image }
          : c
      );
      setCategories(updated);
      localStorage.setItem('allCategories', JSON.stringify(updated));
    } else {
      const newCategory = {
        id: Date.now().toString(),
        name: { ar: categoryForm.nameAr, en: categoryForm.nameEn },
        description: { ar: '', en: '' },
        section: categoryForm.section,
        image: categoryForm.image || 'question',
        count: 6
      };
      const updated = [...categories, newCategory];
      setCategories(updated);
      localStorage.setItem('allCategories', JSON.stringify(updated));
    }
    
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem('allCategories', JSON.stringify(updated));
    }
  };

  // Question Functions
  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ 
      categoryId: categories[0]?.id || '', 
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
      categoryId: q.categoryId || '',
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

  const saveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newQuestion = {
      id: editingQuestion ? editingQuestion.id : Date.now().toString(),
      categoryId: questionForm.categoryId,
      question: { ar: questionForm.questionAr, en: questionForm.questionEn },
      answer: { ar: questionForm.answerAr, en: questionForm.answerEn },
      points: questionForm.points,
      image: questionForm.questionImage,
      answerImage: questionForm.answerImage
    };
    
    let updated;
    if (editingQuestion) {
      updated = questions.map(q => q.id === editingQuestion.id ? newQuestion : q);
    } else {
      updated = [...questions, newQuestion];
    }
    
    setQuestions(updated);
    localStorage.setItem('allQuestions', JSON.stringify(updated));
    setShowQuestionModal(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      localStorage.setItem('allQuestions', JSON.stringify(updated));
    }
  };

  // User Functions
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({ gamesToAdd: 1 });
    setShowUserModal(true);
  };

  const saveUserGames = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && userForm.gamesToAdd > 0) {
      const updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, gamesPurchased: (u.gamesPurchased || 0) + userForm.gamesToAdd }
          : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setShowUserModal(false);
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
      const updated = categories.map(c => 
        c.id === imageForm.id 
          ? { ...c, image: imageForm.imageUrl }
          : c
      );
      setCategories(updated);
      localStorage.setItem('allCategories', JSON.stringify(updated));
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
    { id: 'stats', name: { ar: 'الإحصائيات', en: 'Statistics' }, icon: BarChart3 },
    { id: 'categories', name: { ar: 'الفئات', en: 'Categories' }, icon: Grid3X3 },
    { id: 'questions', name: { ar: 'الأسئلة', en: 'Questions' }, icon: HelpCircle },
    { id: 'users', name: { ar: 'المستخدمين', en: 'Users' }, icon: Users },
    { id: 'orders', name: { ar: 'الطلبات', en: 'Orders' }, icon: ShoppingCart },
    { id: 'images', name: { ar: 'الصور', en: 'Images' }, icon: ImageIcon }
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
              <button 
                onClick={handleAddCategory}
                className="bg-[#8B5A2B] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#5D3A1A] transition-colors"
              >
                <Plus size={20} />
                {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] flex items-center justify-center relative">
                    {cat.image === 'question' || !cat.image ? (
                      <span className="text-6xl">❓</span>
                    ) : (
                      <img src={cat.image} alt="" className="w-full h-full object-cover" />
                    )}
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
        )}

        {/* Questions Tab */}
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
            
            <div className="space-y-4">
              {questions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {language === 'ar' ? 'لا توجد أسئلة بعد' : 'No questions yet'}
                </p>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="text-sm text-gray-500">{q.points} {language === 'ar' ? 'نقطة' : 'points'}</span>
                        <p className="font-bold mt-2 text-lg text-[#5D3A1A]">{q.question?.ar}</p>
                        <p className="text-gray-600 text-sm">{q.question?.en}</p>
                        <p className="text-[#8B5A2B] mt-2 font-semibold">
                          {language === 'ar' ? 'الجواب:' : 'Answer:'} {q.answer?.ar}
                        </p>
                      </div>
                      <div className="flex gap-2 mr-4">
                        {q.image && (
                          <img src={q.image} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        )}
                        <button 
                          onClick={() => handleEditQuestion(q)}
                          className="p-2 bg-[#8B5A2B] text-white rounded-lg hover:bg-[#5D3A1A] transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
                            u.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="px-3 py-1 bg-[#8B5A2B] text-white rounded-lg text-sm hover:bg-[#5D3A1A]"
                          >
                            {language === 'ar' ? 'إعطاء لعبة' : 'Give Game'}
                          </button>
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

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div>
            <h2 className="text-3xl font-bold text-[#5D3A1A] mb-8">
              {language === 'ar' ? 'إدارة الصور' : 'Image Management'}
            </h2>
            
            {/* Powerup Images */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#5D3A1A] mb-4">{language === 'ar' ? 'صور الوسائل المساعدة' : 'Powerup Images'}</h3>
              <div className="grid grid-cols-5 gap-4">
                {powerUps.map((power) => (
                  <div key={power.id} className="bg-white rounded-2xl shadow-lg p-4 text-center">
                    <img src={power.icon} alt="" className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm font-semibold">{power.name.ar}</p>
                    <button
                      onClick={() => handleImageEdit('powerup', power.id, power.icon)}
                      className="mt-2 px-3 py-1 bg-[#8B5A2B] text-white rounded-lg text-sm"
                    >
                      {language === 'ar' ? 'تغيير' : 'Change'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Images */}
            <div>
              <h3 className="text-xl font-bold text-[#5D3A1A] mb-4">{language === 'ar' ? 'صور الفئات' : 'Category Images'}</h3>
              <div className="grid grid-cols-6 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-2xl shadow-lg p-4 text-center">
                    <div className="h-24 bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] rounded-lg flex items-center justify-center mb-2">
                      {cat.image === 'question' || !cat.image ? (
                        <span className="text-4xl">❓</span>
                      ) : (
                        <img src={cat.image} alt="" className="w-full h-full object-cover rounded-lg" />
                      )}
                    </div>
                    <p className="text-xs font-semibold truncate">{cat.name.ar}</p>
                    <button
                      onClick={() => handleImageEdit('category', cat.id, cat.image)}
                      className="mt-2 px-3 py-1 bg-[#8B5A2B] text-white rounded-lg text-sm"
                    >
                      {language === 'ar' ? 'تغيير' : 'Change'}
                    </button>
                  </div>
                ))}
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
        icon="📁"
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
              {Object.values(categorySections).map((s: any) => (
                <option key={s.id} value={s.id}>{s.name.ar}</option>
              ))}
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
    </div>
  );
}
