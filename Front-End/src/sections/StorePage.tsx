import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, Check, Gamepad2 } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface StorePageProps {
  onBack: () => void;
  user: { id?: string | number; username: string; gamesPurchased?: number } | null;
}

const storeItems = [
  { id: 1, name: { ar: 'لعبة واحدة', en: '1 Game' }, price: 2, games: 1, icon: '🎮' },
  { id: 2, name: { ar: 'لعبتين', en: '2 Games' }, price: 3.5, games: 2, icon: '🎮🎮' },
  { id: 3, name: { ar: '4 ألعاب', en: '4 Games' }, price: 5, games: 4, icon: '🎮🎮🎮🎮' }
];

export function StorePage({ onBack, user }: StorePageProps) {
  const { language, dir } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<typeof storeItems[0] | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const handleCheckout = (item: typeof storeItems[0]) => {
    setSelectedItem(item);
    setShowCheckout(true);
  };

  const completeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update user games in localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.gamesPurchased = (currentUser.gamesPurchased || 0) + (selectedItem?.games || 0);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Save order
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
      id: Date.now(),
      userId: currentUser.id,
      itemName: selectedItem?.name,
      price: selectedItem?.price,
      games: selectedItem?.games,
      date: new Date().toISOString()
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    
    setShowCheckout(false);
    setShowSuccess(true);
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardName('');
  };

  const userGames = user?.gamesPurchased || 0;

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {/* Header */}
      <header className="bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </button>
          
          <img 
            src="https://i.imgur.com/bOiiY4V.png" 
            alt="Clash of Minds" 
            className="w-32 md:w-48"
          />
          
          <div className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
            <Gamepad2 size={18} />
            <span className="font-bold">{userGames} {language === 'ar' ? 'لعبة' : 'Games'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#5D3A1A] text-center mb-4">
            {language === 'ar' ? 'المتجر' : 'Store'}
          </h1>
          <p className="text-center text-gray-600 mb-12">
            {language === 'ar' 
              ? 'اشترِ ألعاباً إضافية واستمتع بتحديات أكثر'
              : 'Buy additional games and enjoy more challenges'}
          </p>

          {/* Products */}
          <div className="grid md:grid-cols-3 gap-8">
            {storeItems.map((item, index) => (
              <div 
                key={item.id}
                className={`bg-white rounded-3xl shadow-xl p-8 text-center transition-all hover:-translate-y-2 hover:shadow-2xl ${
                  index === 1 ? 'border-4 border-[#8B5A2B] relative' : ''
                }`}
              >
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#8B5A2B] text-white px-4 py-1 rounded-full text-sm font-bold">
                    {language === 'ar' ? 'الأكثر مبيعاً' : 'Best Seller'}
                  </div>
                )}
                
                <div className="w-24 h-24 bg-[#8B5A2B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">{item.icon}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-[#5D3A1A] mb-2">{item.name[language]}</h3>
                <p className="text-gray-500 mb-6">
                  {index === 1 
                    ? (language === 'ar' ? 'وفر $0.5 مع الباقة المزدوجة' : 'Save $0.5 with double pack')
                    : index === 2
                    ? (language === 'ar' ? 'وفر $3 مع الباقة الكبيرة' : 'Save $3 with large pack')
                    : (language === 'ar' ? 'استمتع بلعبة واحدة إضافية' : 'Enjoy one additional game')
                  }
                </p>
                
                <div className="text-4xl font-bold text-[#8B5A2B] mb-6">${item.price}</div>
                
                <button 
                  onClick={() => handleCheckout(item)}
                  className="w-full py-4 bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  {language === 'ar' ? 'شراء الآن' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>

          {/* My Orders */}
          {user && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-[#5D3A1A] mb-6">
                {language === 'ar' ? 'مشترياتي' : 'My Purchases'}
              </h2>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {(() => {
                  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
                  const userOrders = orders.filter((o: any) => o.userId === user?.id);
                  
                  if (userOrders.length === 0) {
                    return (
                      <p className="p-8 text-center text-gray-500">
                        {language === 'ar' ? 'لا توجد مشتريات بعد' : 'No purchases yet'}
                      </p>
                    );
                  }
                  
                  return (
                    <table className="w-full">
                      <thead className="bg-[#F5E6D3]">
                        <tr>
                          <th className="p-4 text-right">{language === 'ar' ? 'المنتج' : 'Product'}</th>
                          <th className="p-4 text-right">{language === 'ar' ? 'السعر' : 'Price'}</th>
                          <th className="p-4 text-right">{language === 'ar' ? 'الألعاب' : 'Games'}</th>
                          <th className="p-4 text-right">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.map((order: any) => (
                          <tr key={order.id} className="border-b">
                            <td className="p-4">{order.itemName?.ar || order.itemName}</td>
                            <td className="p-4 font-bold text-[#8B5A2B]">${order.price}</td>
                            <td className="p-4">{order.games}</td>
                            <td className="p-4 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title={language === 'ar' ? 'إتمام الشراء' : 'Complete Purchase'}
        icon="💳"
      >
        {selectedItem && (
          <>
            <div className="bg-[#F5E6D3] rounded-xl p-4 mb-6 text-center">
              <p className="text-lg font-bold text-[#5D3A1A]">{selectedItem.name[language]}</p>
              <p className="text-2xl font-bold text-[#8B5A2B]">${selectedItem.price}</p>
              <p className="text-sm text-gray-600">{selectedItem.games} {language === 'ar' ? 'ألعاب' : 'Games'}</p>
            </div>
            
            <form onSubmit={completeOrder}>
              <div className="mb-4">
                <label className="block text-[#5D3A1A] font-bold mb-2">
                  {language === 'ar' ? 'رقم البطاقة' : 'Card Number'}
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
                  required
                />
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-[#5D3A1A] font-bold mb-2">
                    {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[#5D3A1A] font-bold mb-2">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-[#5D3A1A] font-bold mb-2">
                  {language === 'ar' ? 'الاسم على البطاقة' : 'Name on Card'}
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B]"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 p-3 bg-gray-300 rounded-xl"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 bg-[#8B5A2B] text-white rounded-xl font-bold"
                >
                  {language === 'ar' ? 'دفع' : 'Pay'}
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title=""
        icon=""
      >
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#5D3A1A] mb-4">
            {language === 'ar' ? 'تم الشراء بنجاح!' : 'Purchase Successful!'}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === 'ar' ? 'تم إضافة الألعاب إلى حسابك' : 'Games have been added to your account'}
          </p>
          <button 
            onClick={() => setShowSuccess(false)}
            className="px-8 py-3 bg-[#8B5A2B] text-white rounded-xl font-bold"
          >
            {language === 'ar' ? 'موافق' : 'OK'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
