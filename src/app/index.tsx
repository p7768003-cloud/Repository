'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Plus, 
  Zap, 
  ArrowLeft, 
  Star, 
  MessageCircle,
  MessageSquare,
  Play,
  Gamepad2,
  Cpu,
  Lock,
  Loader2,
  Rocket,
  XCircle,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Camera,
  Trash2,
  Image as ImageIcon,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Heart,
  Volume2,
  VolumeX,
  Languages,
  Shield,
  Settings,
  Flame,
  Milestone,
  CheckCircle2,
  Gavel,
  Trophy,
  Users,
  Headphones,
  Share2,
  TrendingUp,
  Gem,
  BellRing,
  Bot,
  BarChart3,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { aiDescriptionGenerator } from '@/ai/flows/ai-description-generator';

const GAME_THEMES: Record<string, { gradient: string, initials: string, cats: string[] }> = {
  'Brawl Stars': { gradient: 'from-amber-500 via-orange-500 to-yellow-400', initials: 'BS', cats: ["АККАУНТЫ", "ГЕМЫ / ДОНАТ", "БУСТ КУБКОВ", "УСЛУГИ", "ПРОЧЕЕ"] },
  'Roblox': { gradient: 'from-zinc-700 via-slate-800 to-black', initials: 'RB', cats: ["АККАУНТЫ", "РОБУКСЫ", "ПРЕДМЕТЫ", "УСЛУГИ", "ПРОЧЕЕ"] },
  'Standoff 2': { gradient: 'from-orange-600 via-red-600 to-amber-500', initials: 'S2', cats: ["АККАУНТЫ", "ГОЛДА", "СКИНИ / НОЖИ", "УСЛУГИ", "ПРОЧЕЕ"] },
  'Steam': { gradient: 'from-blue-900 via-indigo-900 to-slate-900', initials: 'ST', cats: ["БАЛАНС", "КЛЮЧИ", "АККАУНТЫ", "ГИФТЫ / ПОДАРКИ", "УСЛУГИ", "ПРОЧЕЕ"] },
  'PUBG Mobile': { gradient: 'from-yellow-600 via-slate-700 to-zinc-900', initials: 'PM', cats: ["АККАУНТЫ", "UC", "БУСТ", "УСЛУГИ", "ПРОЧЕЕ"] },
  'Genshin Impact': { gradient: 'from-cyan-500 via-blue-600 to-indigo-700', initials: 'GI', cats: ["АККАУНТЫ", "ПРИМОГЕМЫ", "УСЛУГИ", "ПРОЧЕЕ"] },
  'Minecraft': { gradient: 'from-green-600 via-emerald-700 to-zinc-900', initials: 'MC', cats: ["ЛИЦЕНЗИИ", "СЕРВЕРА", "УСЛУГИ", "ПРОЧЕЕ"] },
  'Clash Royale': { gradient: 'from-blue-500 via-indigo-600 to-blue-800', initials: 'CR', cats: ["АККАУНТЫ", "ГЕМЫ", "УСЛУГИ", "ПРОЧЕЕ"] },
  'Mobile Legends': { gradient: 'from-purple-600 via-pink-600 to-blue-600', initials: 'ML', cats: ["АККАУНТЫ", "АЛМАЗЫ", "УСЛУГИ", "ПРОЧЕЕ"] },
  'TikTok': { gradient: 'from-pink-600 via-rose-500 to-black', initials: 'TT', cats: ["АККАУНТЫ", "НАКРУТКА", "УСЛУГИ", "ПРОЧЕЕ"] },
  'Spotify': { gradient: 'from-green-500 via-emerald-600 to-black', initials: 'SP', cats: ["PREMIUM", "ИНВАЙТЫ", "УСЛУГИ", "ПРОЧЕЕ"] },
  'Discord': { gradient: 'from-indigo-500 via-blue-600 to-indigo-700', initials: 'DC', cats: ["NITRO", "БУСТЫ", "УСЛУГИ", "ПРОЧЕЕ"] },
};

const ANALYTICS_MOCK = [
  { day: 'Пн', price: 0.22 }, { day: 'Вт', price: 0.24 }, { day: 'Ср', price: 0.21 },
  { day: 'Чт', price: 0.25 }, { day: 'Пт', price: 0.28 }, { day: 'Сб', price: 0.30 }, { day: 'Вс', price: 0.29 },
];

const INCOME_MOCK = [
  { day: 'Пн', income: 450 }, { day: 'Вт', income: 820 }, { day: 'Ср', income: 120 },
  { day: 'Чт', income: 940 }, { day: 'Пт', income: 1540 }, { day: 'Сб', income: 2400 }, { day: 'Вс', income: 1800 },
];

const GLOBAL_MESSAGES_MOCK = [
  { user: 'S02_King', text: 'Кого в лобби Standoff? Нужен +1 на турнир 🏆', color: 'text-orange-400' },
  { user: 'RobloxGirl_07', text: 'Кто знает, когда робуксы придут? Жду уже час ⏳', color: 'text-cyan-400' },
  { user: 'BrawlFan', text: 'Выбил Леона из обычного ящика! Шанс 0.0001% 💎', color: 'text-emerald-400' },
  { user: 'Trader_99', text: 'Продаю голду по 0.5, пишите в личку!', color: 'text-violet-400' },
  { user: 'Admin_Interval', text: 'Добро пожаловать во флудилку! Помните о правилах 🛡️', color: 'text-red-500' },
];

export default function IntervalMasterpiece() {
  const { toast } = useToast();
  
  const [tab, setTab] = useState<'home' | 'sell' | 'chats' | 'profile' | 'arbitrage' | 'product_view'>('home');
  const [siteTheme, setSiteTheme] = useState<'space' | 'phoenix'>('space');
  const [isMuted, setIsMuted] = useState(false);
  const [showAllGames, setShowAllGames] = useState(false);
  const [activeGameDir, setActiveGameDir] = useState<string | null>(null);
  const [activeSubCatFilter, setActiveSubCatFilter] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'global' | 'support' | 'deal'>('global');

  const [balance, setBalance] = useState(15420);
  const [jackpot, setJackpot] = useState(24840);
  const [userStatus] = useState({ username: 'GAMERPRO_2024', isVerified: true });
  const [favorites, setFavorites] = useState<any[]>([]);

  // Marketing & AI Settings
  const [isAiResponderActive, setIsAiResponderActive] = useState(false);
  const [isTgLinked, setIsTgLinked] = useState(false);
  const [arbitrageTimer, setArbitrageTimer] = useState(900); // 15 mins in seconds

  const [sellGame, setSellGame] = useState('Brawl Stars');
  const [sellCategory, setSellCategory] = useState('АККАУНТЫ');
  const [sellTitle, setSellTitle] = useState('');
  const [sellDesc, setSellDesc] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellImages, setSellImages] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [useAutoDelivery, setUseAutoDelivery] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [listings, setListings] = useState([
    { id: 1, game: 'Roblox', title: '10,000 Робуксов | Моментально', category: 'РОБУКСЫ', seller: 'RobuxKing', sellerStatus: 'В игре 🟢', price: 2500, rating: 4.9, reviews: 154, images: ["https://picsum.photos/seed/rb1/800/600"], description: "Лучшее предложение на рынке! Быстрая выдача." },
    { id: 2, game: 'Brawl Stars', title: 'Аккаунт 60+ бойцов | Full Access', category: 'АККАУНТЫ', seller: 'BrawlMaster', sellerStatus: 'Авто-бот ⚡', price: 4200, rating: 5.0, reviews: 42, images: ["https://picsum.photos/seed/bs1/800/600", "https://picsum.photos/seed/bs2/800/600"], description: "Личный аккаунт, почта в комплекте. Все скины 2021 года." },
    { id: 3, game: 'Steam', title: 'Steam Balance | 1000 TL Gift', category: 'БАЛАНС', seller: 'SteamHub', sellerStatus: 'На уроках 🟡', price: 1800, rating: 4.8, reviews: 92, images: ["https://picsum.photos/seed/st1/800/600"], description: "Пополнение турецкого региона Steam. Безопасно." },
    { id: 4, game: 'Standoff 2', title: 'M9 Bayonet Blue Blood | Чистый', category: 'СКИНИ / НОЖИ', seller: 'S02Gamer', sellerStatus: 'Сплю 🔴', price: 9500, rating: 4.7, reviews: 12, images: ["https://picsum.photos/seed/so2/800/600"], description: "Передача через рынок. Скин чистый." },
  ]);
  const [orders, setOrders] = useState<any[]>([]);

  const [supportMessages, setSupportMessages] = useState<any[]>([
    { user: 'Manager Interval #001', text: 'Здравствуйте! Я ваш персональный юридический помощник. Ознакомьтесь с регламентом (Введите: "вывод", "комиссия", "правила" или "гарантия")', isSystem: true }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (tab === 'arbitrage' && arbitrageTimer > 0) {
      const timer = setInterval(() => {
        setArbitrageTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [tab, arbitrageTimer]);

  const playSound = (type: 'click' | 'success') => {
    if (isMuted) return;
    const audio = new Audio(type === 'click' ? '/click.mp3' : '/success_chime.mp3');
    audio.volume = 0.08;
    audio.play().catch(() => {});
  };

  const handleMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (sellImages.length + files.length > 5) {
      toast({ variant: "destructive", title: "Лимит!", description: "Максимум 5 скриншотов." });
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setSellImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = () => {
    if (!sellTitle || !sellPrice) return;
    const newLot = {
      id: Date.now(),
      game: sellGame,
      title: sellTitle,
      category: sellCategory,
      seller: userStatus.username,
      sellerStatus: 'В игре 🟢',
      price: parseFloat(sellPrice),
      images: sellImages.length > 0 ? sellImages : [],
      rating: 5.0,
      reviews: 0,
      description: sellDesc
    };
    setListings([newLot, ...listings]);
    setTab('home');
    setSellImages([]); setSellTitle(''); setSellDesc(''); setSellPrice('');
    playSound('success');
    toast({ title: "Успешно!", description: "Ваш лот опубликован согласно P2P-регламенту." });
  };

  const handleBuy = (item: any) => {
    if (balance < item.price) {
      toast({ variant: "destructive", title: "Недостаточно средств" });
      return;
    }
    setBalance(prev => prev - item.price);
    const newOrder = {
      id: Date.now(),
      title: item.title,
      seller: item.seller,
      price: item.price,
      status: 'active',
      game: item.game,
      credentials: { login: 'testing_gamer_pro', pass: 'interval_pass_999' }
    };
    setOrders([newOrder, ...orders]);
    setActiveOrderId(newOrder.id);
    setChatMode('deal');
    setTab('chats');
    playSound('success');
  };

  const handleOrderConfirm = () => {
    if (!activeOrderId) return;
    setOrders(prev => prev.map(o => o.id === activeOrderId ? { ...o, status: 'completed' } : o));
    setShowReviewModal(true);
    playSound('success');
  };

  const toggleFavorite = (item: any) => {
    const isFav = favorites.find(f => f.id === item.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== item.id));
    } else {
      setFavorites(prev => [...prev, item]);
      toast({ title: "❤️ В избранном" });
    }
    playSound('click');
  };

  const handleShare = (item: any) => {
    navigator.clipboard.writeText(`https://interval.pro/item/${item.id}`).then(() => {
      toast({ title: "🔗 Ссылка скопирована!", description: "Поделитесь ссылкой: при покупке вы получите 2% вознаграждения на баланс!" });
      playSound('success');
    });
  };

  const isAutoDeliveryBlocked = useMemo(() => {
    return sellCategory !== 'АККАУНТЫ';
  }, [sellCategory]);

  useEffect(() => {
    if (isAutoDeliveryBlocked) setUseAutoDelivery(false);
  }, [isAutoDeliveryBlocked]);

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const lowerInput = chatInput.toLowerCase();
    
    if (lowerInput.includes('тг') || lowerInput.includes('tg') || lowerInput.includes('дискорд') || lowerInput.includes('discord')) {
      toast({ variant: "destructive", title: "Защита INTERVAL", description: "Обмен внешними контактами запрещен. Попытка обхода эскроу-системы ведет к бану." });
      return;
    }

    if (chatMode === 'support') {
      const newUserMsg = { user: userStatus.username, text: chatInput, isSystem: false };
      setSupportMessages(prev => [...prev, newUserMsg]);
      
      setTimeout(() => {
        let reply = "Ваш запрос передан в отдел финансового контроля. Ожидайте ответа специалиста.";
        
        if (lowerInput.includes('вывод') || lowerInput.includes('холд')) {
          reply = "💳 СЛУЖБА ПОДДЕРЖКИ: Согласно регламенту финансовой безопасности INTERVAL, для учетных записей категории 'Новичок' применяется стандартный холд (период удержания средств) длительностью 12 часов с момента завершения сделки. Данный временной буфер необходим для предотвращения чарджбэков и проверки легитимности проданного товара. Для верифицированных продавцов период холда может быть аннулирован.";
        }
        else if (lowerInput.includes('правила') || lowerInput.includes('безопасность')) {
          reply = "🛡️ СЛУЖБА ПОДДЕРЖКИ: На платформе действует строгий регламент P2P-экосистемы. Категорически воспрещается любая деанонимизация, обмен внешними контактными данными (Telegram, Discord) или проведение сделок мимо кассы. Данные действия ведут к перманентной блокировке аккаунта. Безопасность транзакций обеспечивается автоматическим протоколом эскроу-удержания.";
        }
        else if (lowerInput.includes('комиссия')) {
          reply = "📊 Комиссия площадки составляет фиксированные 8% для стороны продавца. Данные средства направляются на развитие эскроу-протоколов и призовой фонд Кибер-Джекпота.";
        }
        else if (lowerInput.includes('гарантия')) {
          reply = "🛡️ ГАРАНТИЯ: INTERVAL выступает в роли эскроу-агента. Средства покупателя депонируются на системном счете до момента фактического подтверждения получения товара и отсутствия претензий в рамках арбитражного периода.";
        }
        
        setSupportMessages(prev => [...prev, { user: 'Manager Interval #001', text: reply, isSystem: true }]);
        playSound('success');
      }, 1000);
    }

    setChatInput('');
    playSound('click');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderIcon = (name: string, size: 'lg' | 'sm' = 'lg') => {
    const theme = GAME_THEMES[name];
    const dim = size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';
    if (theme) return (
      <div className={cn(dim, "rounded-full bg-gradient-to-tr flex items-center justify-center border border-white/10 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer", theme.gradient)}>
        <span className="font-black text-white text-lg italic tracking-tighter drop-shadow-md">{theme.initials}</span>
      </div>
    );
    return <div className={cn(dim, "rounded-full bg-[#12141c] flex items-center justify-center")}><span className="text-xs text-muted-foreground">{name[0]}</span></div>;
  };

  const accentColor = siteTheme === 'space' ? 'text-cyan-400' : 'text-orange-500';
  const accentBg = siteTheme === 'space' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-orange-600 hover:bg-orange-500';
  const accentBorder = siteTheme === 'space' ? 'border-cyan-400/30' : 'border-orange-500/30';

  return (
    <div className={cn("min-h-screen bg-[#08090d] text-white flex flex-col font-body transition-colors duration-500", siteTheme === 'phoenix' ? "selection:bg-orange-500/30" : "selection:bg-cyan-500/30")}>
      
      <header className="h-20 border-b border-[#222634] bg-[#08090d] sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-6">
          <button onClick={() => { setTab('home'); setActiveGameDir(null); }} className="flex items-center gap-2">
            <span className={cn("text-2xl font-black italic tracking-tighter bg-gradient-to-r bg-clip-text text-transparent", siteTheme === 'phoenix' ? "from-orange-500 to-red-600" : "from-violet-400 to-cyan-400")}>INTERVAL</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1 bg-[#12141c] p-1 rounded-xl border border-[#222634]">
            {[
              { id: 'home', label: 'Купить', icon: ShoppingCart },
              { id: 'sell', label: 'Продать', icon: Plus },
              { id: 'chats', label: 'Чаты', icon: MessageSquare },
              { id: 'profile', label: 'Профиль', icon: User }
            ].map(nav => (
              <button key={nav.id} onClick={() => { setTab(nav.id as any); playSound('click'); }} className={cn("px-5 h-9 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all", tab === nav.id ? "bg-[#222634] text-white shadow-lg" : "text-muted-foreground hover:text-white")}>
                <nav.icon className="w-4 h-4" /> {nav.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => { setSiteTheme(prev => prev === 'space' ? 'phoenix' : 'space'); playSound('click'); }} className="p-2.5 rounded-xl border border-[#222634] bg-[#12141c]">
              {siteTheme === 'space' ? <Milestone className="w-5 h-5 text-cyan-400" /> : <Flame className="w-5 h-5 text-orange-500 animate-pulse" />}
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 rounded-xl bg-[#12141c] border border-[#222634]">
              {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className={cn("w-5 h-5", accentColor)} />}
            </button>
            <div className="hidden sm:flex items-center gap-3 px-4 h-11 bg-[#12141c] border border-[#222634] rounded-xl">
               <span className={cn("text-sm font-black", accentColor)}>{balance} ₽</span>
               <Plus className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        
        {tab === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {!activeGameDir ? (
              <>
                <div className="relative w-full aspect-[21/6] rounded-[2rem] overflow-hidden bg-[#12141c] border border-[#222634] shadow-2xl">
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/cyber/1200/400')] bg-cover opacity-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/60 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center px-12">
                    <h1 className="text-4xl sm:text-6xl font-black italic uppercase leading-none mb-6">P2P БИРЖА <br/> <span className={accentColor}>INTERVAL</span></h1>
                    <Button onClick={() => setTab('sell')} className={cn("w-fit px-8 h-12 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest", accentBg)}>Начать продажи</Button>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-[#12141c] border border-[#222634] flex items-center justify-between shadow-xl">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-violet-600/10 rounded-2xl"><TrendingUp className="w-8 h-8 text-violet-400" /></div>
                      <div>
                         <h3 className="text-xl font-black italic uppercase tracking-tighter">🎰 КИБЕР-ДЖЕКПОТ ПЛОЩАДКИ</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Каждая покупка на сайте увеличивает джекпот!</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className={cn("text-4xl font-black italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]", accentColor)}>{jackpot.toLocaleString()} ₽</div>
                      <p className="text-[9px] font-black text-slate-500 uppercase mt-1">Средства заблокированы Кибер-Судьей ИИ</p>
                   </div>
                </div>

                <div className="space-y-8">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">КАТЕГОРИИ ИГР</h2>
                   <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-6 gap-y-10">
                      {Object.keys(GAME_THEMES).slice(0, showAllGames ? 100 : 7).map(g => (
                        <div key={g} onClick={() => { setActiveGameDir(g); setActiveSubCatFilter(null); playSound('click'); }} className="flex flex-col items-center gap-3 cursor-pointer group animate-in fade-in duration-300">
                          {renderIcon(g)}
                          <span className="text-[10px] font-black text-center uppercase text-slate-400 group-hover:text-white transition-colors">{g}</span>
                        </div>
                      ))}
                      <div onClick={() => { setShowAllGames(!showAllGames); playSound('click'); }} className="flex flex-col items-center gap-3 cursor-pointer group">
                        <div className={cn("w-16 h-16 rounded-full bg-[#12141c] border border-[#222634] flex items-center justify-center transition-all hover:border-white/20 active:scale-95", accentBorder)}>
                           {showAllGames ? <ChevronUp className="w-6 h-6 text-slate-400 group-hover:text-white" /> : <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />}
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400">{showAllGames ? 'СКРЫТЬ' : 'ЕЩЁ'}</span>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="animate-in slide-in-from-right-8 duration-500 space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => { setActiveGameDir(null); playSound('click'); }} className="p-3 bg-[#12141c] border border-[#222634] rounded-xl hover:border-white/20 transition-all"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                      <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">{activeGameDir} {renderIcon(activeGameDir, 'sm')}</h2>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Лучшие предложения от проверенных продавцов</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {GAME_THEMES[activeGameDir].cats.map(cat => (
                      <button key={cat} onClick={() => { setActiveSubCatFilter(activeSubCatFilter === cat ? null : cat); playSound('click'); }} className={cn("px-5 py-2.5 text-[10px] font-black uppercase rounded-xl border transition-all", activeSubCatFilter === cat ? accentBg + " text-slate-950 border-transparent shadow-lg" : "bg-[#12141c] border-[#222634] text-muted-foreground hover:text-white")}>{cat}</button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#12141c] border border-[#222634] p-8 rounded-[2.5rem] shadow-2xl">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-6 flex items-center gap-2">📊 АНАЛИТИКА РЫНКА: {activeGameDir}</h3>
                   <div className="h-[200px] w-full transform-gpu">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={ANALYTICS_MOCK}>
                            <defs>
                               <linearGradient id="colorPrice" x1="0" x1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={siteTheme === 'phoenix' ? '#f97316' : '#06b6d4'} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={siteTheme === 'phoenix' ? '#f97316' : '#06b6d4'} stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="price" stroke={siteTheme === 'phoenix' ? '#f97316' : '#06b6d4'} fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} />
                            <Tooltip content={({ active, payload }) => {
                               if (active && payload && payload.length) {
                                  return (
                                     <div className="bg-[#08090d] border border-white/10 p-3 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        <p>{payload[0].payload.day}: Спрос 🔥 ВЫСОКИЙ</p>
                                        <p className={accentColor}>Средняя цена: {payload[0].value} ₽</p>
                                     </div>
                                  );
                               }
                               return null;
                            }} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              </div>
            )}

            <div className="space-y-6 pt-10 border-t border-[#222634]">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{activeGameDir ? `ТОВАРЫ ${activeGameDir}` : 'ПОСЛЕДНИЕ ОБЪЯВЛЕНИЯ'}</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {listings.filter(i => {
                   const gameMatch = activeGameDir ? i.game === activeGameDir : true;
                   const catMatch = activeSubCatFilter ? i.category === activeSubCatFilter : true;
                   return gameMatch && catMatch;
                 }).map(item => {
                   const isFast = item.sellerStatus === 'Авто-бот ⚡' || item.sellerStatus === 'В игре 🟢';
                   return (
                    <div key={item.id} onClick={() => { setSelectedProduct(item); setActivePhotoIndex(0); setTab('product_view'); playSound('click'); }} className={cn("bg-[#12141c] border rounded-2xl p-4 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-[0_4px_20px_rgba(0,240,255,0.15)] transition-all duration-300 ease-in-out cursor-pointer h-full group", isFast ? "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-[#222634]")}>
                       <div className="flex flex-col">
                         <div className="w-full h-40 bg-[#1a1d29] rounded-xl overflow-hidden mb-3 border border-[#2c313f] relative flex items-center justify-center">
                            {item.images && item.images[0] ? (
                              <img src={item.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#1a1d29] to-[#242936] flex items-center justify-center"><span className="text-[10px] font-black uppercase text-muted-foreground opacity-30">{item.game}</span></div>
                            )}
                            {item.price < 3000 && <div className="absolute top-2 left-2 bg-emerald-500 text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg">🔥 Выгодно</div>}
                            {isFast && <div className="absolute top-2 right-2 bg-emerald-600 text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg flex items-center gap-1"><Zap className="w-2 h-2" /> СУПЕРБЫСТРО</div>}
                         </div>
                         <div className="flex items-center gap-1.5 mb-1.5">
                            <span className={cn("text-[9px] font-black uppercase", accentColor)}>{item.game}</span>
                            <span className="text-[9px] font-black text-slate-500 uppercase opacity-60">• {item.category}</span>
                         </div>
                         <h4 className="text-base font-bold text-white tracking-tight line-clamp-2 mb-2 leading-tight">{item.title}</h4>
                         
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">{item.seller[0]}</div>
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-300">{item.seller}</span>
                                  <span className={cn("text-[8px] font-bold", isFast ? "text-emerald-400" : "text-amber-500")}>{item.sellerStatus}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold"><Star className="w-3 h-3 fill-amber-500" /> {item.rating}</div>
                         </div>
                       </div>

                       <div className="space-y-3">
                          <div className={cn("text-[9px] font-bold px-2 py-1 rounded-md w-fit", item.price < 3000 ? "text-emerald-400 bg-emerald-950/30" : "text-slate-400 bg-slate-900/40")}>
                             {item.price < 3000 ? "🔥 Выгодно на 15%" : "⭐ Отличная цена"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-tighter opacity-80"><Shield className="w-3 h-3" /> Гарантия INTERVAL</div>
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                             <div className="text-xl font-black text-white italic">{item.price} ₽</div>
                             <Button onClick={(e) => { e.stopPropagation(); handleBuy(item); }} className={cn("h-10 px-6 text-slate-950 font-black uppercase rounded-xl", accentBg)}>Купить</Button>
                          </div>
                       </div>
                    </div>
                  );
                 })}
               </div>
            </div>
          </div>
        )}

        {tab === 'product_view' && selectedProduct && (
          <div className="animate-in fade-in duration-500 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
               <button onClick={() => { setTab('home'); playSound('click'); }} className="flex items-center gap-2 px-6 h-10 bg-[#12141c] border border-[#222634] rounded-xl text-[10px] font-black uppercase hover:border-white/20 transition-all"><ArrowLeft className="w-4 h-4" /> Назад в каталог</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#12141c] border border-[#222634] rounded-[2.5rem] aspect-video relative overflow-hidden group shadow-2xl flex items-center justify-center">
                   {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <img src={selectedProduct.images[activePhotoIndex]} className="w-full h-full object-cover transition-all duration-500 transform-gpu" />
                   ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1d29] to-[#242936] flex items-center justify-center"><span className="text-2xl font-black uppercase text-muted-foreground opacity-20">{selectedProduct.game}</span></div>
                   )}
                   {selectedProduct.images && selectedProduct.images.length > 1 && (
                     <>
                        <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(p => (p - 1 + selectedProduct.images.length) % selectedProduct.images.length); playSound('click'); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft className="w-6 h-6" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(p => (p + 1) % selectedProduct.images.length); playSound('click'); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-6 h-6" /></button>
                     </>
                   )}
                </div>
                <div className="flex gap-4 justify-center">
                   {selectedProduct.images && selectedProduct.images.map((_, i) => (
                     <div key={i} onClick={() => { setActivePhotoIndex(i); playSound('click'); }} className={cn("w-10 h-2 rounded-full cursor-pointer transition-all", activePhotoIndex === i ? (siteTheme === 'phoenix' ? "bg-orange-500 shadow-[0_0_10px_#f97316]" : "bg-cyan-400 shadow-[0_0_10px_#22d3ee]") : "bg-[#222634]")} />
                   ))}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-[#12141c] border border-[#222634] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl space-y-8 text-white">
                  <div className="space-y-4">
                    <span className="px-3 py-1 bg-violet-600/10 text-violet-400 text-[9px] font-black uppercase rounded-lg border border-violet-500/20">{selectedProduct.category}</span>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase italic leading-tight">{selectedProduct.title}</h1>
                  </div>

                  <div className="flex items-center gap-4 p-5 sm:p-6 bg-[#08090d] rounded-3xl border border-[#222634]">
                    <div className="w-12 h-12 rounded-full bg-[#12141c] flex items-center justify-center border border-white/5"><User className="w-6 h-6 text-muted-foreground" /></div>
                    <div>
                      <div className="flex items-center gap-1.5"><span className="text-sm font-black uppercase">{selectedProduct.seller}</span> <span className="text-[8px] bg-white/5 px-1.5 rounded-sm">{selectedProduct.sellerStatus}</span></div>
                      <div className="flex items-center gap-1 mt-0.5"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /><span className="text-[10px] font-black text-amber-500">{selectedProduct.rating}</span></div>
                    </div>
                    <button onClick={() => toggleFavorite(selectedProduct)} className="ml-auto p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                       <Heart className={cn("w-5 h-5 transition-all", favorites.find(f => f.id === selectedProduct.id) ? "fill-red-500 text-red-500" : "text-slate-400")} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Описание</Label>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedProduct.description || "Нет описания."}</p>
                  </div>

                  <div className="pt-6 space-y-4 border-t border-[#222634]">
                    <div className="flex justify-between items-end px-2"><span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Цена</span><div className="text-4xl font-black italic">{selectedProduct.price} ₽</div></div>
                    <div className="flex gap-4">
                      <Button onClick={() => handleBuy(selectedProduct)} className={cn("flex-1 h-16 text-lg font-black uppercase rounded-2xl shadow-xl text-slate-950", accentBg)}>Оплатить и купить</Button>
                      <Button onClick={() => handleShare(selectedProduct)} variant="outline" className="w-16 h-16 rounded-2xl border-[#222634] bg-[#08090d] hover:border-cyan-400 transition-all"><Share2 className="w-6 h-6 text-cyan-400" /></Button>
                    </div>
                    <div className="text-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter flex items-center justify-center gap-1.5 opacity-85">🛡️ Гарантия INTERVAL: Средства удерживаются до проверки</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'sell' && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
             <div className="bg-[#12141c] border border-[#222634] p-8 sm:p-16 rounded-[2.5rem] space-y-10 shadow-2xl">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Создать лот</h2>
                
                <div className="space-y-10">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">1. ИГРА И КАТЕГОРИЯ</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(GAME_THEMES).map(g => (
                          <button key={g} onClick={() => { setSellGame(g); setSellCategory(GAME_THEMES[g].cats[0]); playSound('click'); }} className={cn("px-5 py-3 text-[10px] font-black uppercase rounded-xl border transition-all", sellGame === g ? accentBg + " border-transparent text-slate-950" : "bg-[#08090d] border-[#222634] text-muted-foreground hover:border-white/20")}>{g}</button>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#222634] animate-in fade-in">
                        {GAME_THEMES[sellGame].cats.map(cat => (
                          <button key={cat} onClick={() => { setSellCategory(cat); playSound('click'); }} className={cn("px-4 py-2 text-[9px] font-black uppercase rounded-lg border transition-all", sellCategory === cat ? "bg-white/10 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]" : "bg-[#08090d] border-[#222634] text-muted-foreground")}>{cat}</button>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">2. СКРИНШОТЫ (ДО 5 ШТУК)</Label>
                      <input type="file" multiple ref={fileInputRef} onChange={handleMultipleImages} className="hidden" accept="image/*" />
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {sellImages.map((img, idx) => (
                          <div key={idx} className="aspect-square rounded-xl overflow-hidden relative border border-[#222634]">
                             <img src={img} className="w-full h-full object-cover" />
                             <button onClick={() => setSellImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-600 p-1 rounded text-white"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                        {sellImages.length < 5 && (
                          <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-[#222634] flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:border-cyan-400 transition-colors">
                             <Camera className="w-8 h-8 mb-2" /><span className="text-[8px] font-black uppercase tracking-tighter">Загрузить</span>
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <Input placeholder="Название лота..." value={sellTitle} onChange={e => setSellTitle(e.target.value)} className="bg-[#08090d] border-[#222634] h-14" />
                      <div className="relative">
                        <Textarea placeholder="Описание товара..." value={sellDesc} onChange={e => setSellDesc(e.target.value)} className="bg-[#08090d] border-[#222634] min-h-[120px]" />
                        <Button onClick={async () => {
                           if (!sellTitle) return;
                           setIsAiLoading(true);
                           try {
                              const res = await aiDescriptionGenerator({ game: sellGame, category: sellCategory, features: sellTitle });
                              setSellDesc(res.description);
                              playSound('success');
                           } catch (e) {
                              setSellDesc("🔥 ПРЕМИУМ ЛОТ! Быстрая выдача, полная защита INTERVAL 🛡️. Продавец в сети!");
                           } finally { setIsAiLoading(false); }
                        }} className="absolute bottom-4 right-4 h-8 text-[9px] font-black uppercase bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600 hover:text-white transition-all">
                           {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} ИИ-Описание
                        </Button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label className="text-[10px] font-black text-muted-foreground uppercase ml-1">ЦЕНА (₽)</Label><Input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} className="bg-[#08090d] border-[#222634] h-14 text-xl font-black" /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-black text-muted-foreground uppercase ml-1">ВЫ ПОЛУЧИТЕ (-8%)</Label><div className={cn("bg-[#1a1d26] border border-[#222634] h-14 rounded-xl flex items-center px-6 text-xl font-black", accentColor)}>{(parseFloat(sellPrice || '0') * 0.92).toFixed(0)} ₽</div></div>
                   </div>

                   <div className={cn("p-6 rounded-2xl border transition-all", useAutoDelivery ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "bg-white/5 border-white/10")}>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Zap className={cn("w-5 h-5", useAutoDelivery ? "text-emerald-400" : "text-slate-500")} />
                            <div>
                               <div className="text-[11px] font-black uppercase">{useAutoDelivery ? '⚡ Авто-выдача данных' : '🤝 Ручная передача'}</div>
                               <div className="text-[9px] text-muted-foreground">{useAutoDelivery ? 'Робот INTERVAL моментально передаст данные' : 'Вы должны будете передать данные лично'}</div>
                            </div>
                         </div>
                         <button onClick={() => !isAutoDeliveryBlocked && setUseAutoDelivery(!useAutoDelivery)} className={cn("w-12 h-6 rounded-full relative transition-all", useAutoDelivery ? "bg-emerald-600" : "bg-slate-700", isAutoDeliveryBlocked && "opacity-30 cursor-not-allowed")}>
                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all transform-gpu", useAutoDelivery ? "left-7" : "left-1")} />
                         </button>
                      </div>
                      {isAutoDeliveryBlocked && <div className="mt-2 text-[8px] text-red-400 font-black uppercase tracking-widest">Недоступно для категории "{sellCategory}"</div>}
                      {useAutoDelivery && !isAutoDeliveryBlocked && (
                        <div className="space-y-4 mt-4 p-5 bg-[#08090d] border border-white/5 rounded-2xl animate-in slide-in-from-top-2">
                           <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">Логин</Label><Input placeholder="E-mail или ID" className="bg-[#12141c] border-[#222634]" /></div>
                           <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">Пароль</Label><Input type="password" placeholder="Ваш пароль" className="bg-[#12141c] border-[#222634]" /></div>
                        </div>
                      )}
                   </div>

                   <Button onClick={handlePublish} className={cn("w-full h-16 text-slate-950 font-black uppercase rounded-2xl shadow-xl", accentBg)}>Выставить на продажу</Button>
                </div>
             </div>
          </div>
        )}

        {tab === 'chats' && (
          <div className="max-w-5xl mx-auto h-[650px] bg-[#12141c] border border-[#222634] rounded-[2.5rem] flex flex-col sm:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-full sm:w-[300px] border-b sm:border-b-0 sm:border-r border-[#222634] bg-[#08090d]/40 flex flex-col p-6 space-y-4">
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">Сделки</h2>
               <div onClick={() => { setChatMode('support'); setActiveOrderId(null); playSound('click'); }} className={cn("p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3", chatMode === 'support' ? "bg-cyan-600/20 border-cyan-500/30" : "bg-[#08090d] border-[#222634]")}>
                  <Headphones className="w-5 h-5 text-cyan-400" />
                  <div className="text-[10px] font-black uppercase">🎧 ТЕХПОДДЕРЖКА</div>
               </div>
               <div onClick={() => { setChatMode('global'); setActiveOrderId(null); playSound('click'); }} className={cn("p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3", chatMode === 'global' ? "bg-violet-600/20 border-violet-500/30" : "bg-[#08090d] border-[#222634]")}>
                  <MessageCircle className="w-5 h-5 text-violet-400" />
                  <div className="text-[10px] font-black uppercase">💬 ОБЩИЙ ЧАТ</div>
               </div>
               {orders.map(o => (
                 <div key={o.id} onClick={() => { setActiveOrderId(o.id); setChatMode('deal'); playSound('click'); }} className={cn("p-4 rounded-2xl border cursor-pointer transition-all", activeOrderId === o.id ? "bg-[#222634] border-white/10" : "bg-[#08090d] border-[#222634]")}>
                    <div className="text-[10px] font-black uppercase mb-1">{o.seller}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{o.title}</div>
                    <div className={cn("text-[8px] font-black uppercase mt-1", o.status === 'completed' ? "text-emerald-400" : "text-amber-500")}>{o.status === 'completed' ? 'Завершено' : 'В работе'}</div>
                 </div>
               ))}
            </div>
            <div className="flex-1 flex flex-col bg-[#08090d]/20 relative">
              {chatMode === 'global' ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-6 border-b border-[#222634] flex items-center justify-between"><span className="text-sm font-black uppercase flex items-center gap-2"><Users className="w-4 h-4" /> Флудилка Игроков INTERVAL</span></div>
                  <div className="flex-1 p-8 space-y-4 overflow-y-auto">
                     {GLOBAL_MESSAGES_MOCK.map((m, idx) => (
                       <div key={idx} className="animate-in fade-in slide-in-from-bottom-2">
                          <span className={cn("text-[10px] font-black uppercase", m.color)}>{m.user}:</span>
                          <span className="ml-2 text-[11px] font-medium text-slate-300">{m.text}</span>
                       </div>
                     ))}
                  </div>
                  <div className="p-6 border-t border-[#222634] flex items-center gap-4 bg-[#08090d]/40">
                     <Input placeholder="Напишите во флудилку..." className="bg-[#08090d] border-[#222634] h-12 flex-1" />
                     <Button className={cn("h-12 w-12 rounded-xl text-slate-950", accentBg)}><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              ) : chatMode === 'support' ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-6 border-b border-[#222634] flex items-center justify-between"><span className="text-sm font-black uppercase flex items-center gap-2"><Headphones className="w-4 h-4" /> Юридический отдел INTERVAL</span></div>
                  <div className="flex-1 p-8 space-y-4 overflow-y-auto">
                     {supportMessages.map((m, idx) => (
                       <div key={idx} className={cn("flex flex-col animate-in fade-in", m.isSystem ? "items-start" : "items-end")}>
                          <div className={cn("p-4 rounded-2xl max-w-[80%] text-[11px] font-medium", m.isSystem ? "bg-[#12141c] border border-cyan-500/20 text-slate-300" : "bg-cyan-600 text-white")}>
                             <p className="text-[9px] font-black uppercase mb-1 opacity-60">{m.user}</p>
                             {m.text}
                          </div>
                       </div>
                     ))}
                  </div>
                  <div className="p-6 border-t border-[#222634] flex items-center gap-4 bg-[#08090d]/40">
                     <Input placeholder="Опишите проблему или введите команду..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} className="bg-[#08090d] border-[#222634] h-12 flex-1" />
                     <Button onClick={handleChatSend} className={cn("h-12 w-12 rounded-xl text-slate-950", accentBg)}><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              ) : activeOrderId ? (
                <>
                  <div className="p-6 border-b border-[#222634] flex items-center justify-between"><span className="text-sm font-black uppercase">Сделка #{activeOrderId}</span><Button onClick={() => setTab('arbitrage')} variant="ghost" className="text-red-500 text-[10px] font-black uppercase border border-red-500/20 px-4 h-9 rounded-xl">Арбитраж</Button></div>
                  <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                       <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2"><Shield className="w-3 h-3" /> Сделка защищена эскроу-агентом INTERVAL</div>
                       <p className="text-[11px] text-muted-foreground">Средства продавца удержаны до подтверждения. Передайте товар.</p>
                    </div>
                    <div className="bg-[#222634] p-5 rounded-2xl max-w-[80%] border border-white/5 space-y-3">
                       <div className="flex items-center gap-2 text-violet-400"><Zap className="w-4 h-4 fill-current" /><span className="text-[10px] font-black uppercase">РОБОТ INTERVAL: АВТОВЫДАЧА</span></div>
                       <div className="space-y-1 font-mono text-xs">
                          <p>👤 ЛОГИН: testing_gamer_pro</p>
                          <p>🔑 ПАРОЛЬ: interval_pass_999</p>
                       </div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-[#222634] flex flex-col gap-4 bg-[#08090d]/40">
                    <Button onClick={handleOrderConfirm} className="h-12 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black uppercase px-8 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">Подтвердить получение</Button>
                    <div className="flex items-center gap-4">
                       <Input placeholder="Напишите сообщение..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} className="bg-[#08090d] border-[#222634] h-12 flex-1" />
                       <Button onClick={handleChatSend} className={cn("h-12 w-12 rounded-xl text-slate-950", accentBg)}><Send className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </>
              ) : <div className="flex-1 flex flex-col items-center justify-center opacity-10"><MessageCircle className="w-16 h-16" /></div>}
            </div>
          </div>
        )}

        {tab === 'profile' && (
           <div className="max-w-7xl mx-auto animate-in fade-in duration-500 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#12141c] border border-[#222634] p-10 rounded-[2.5rem] text-center space-y-8 shadow-2xl">
                       <div className="w-32 h-32 rounded-full border-2 border-cyan-400/20 bg-cyan-400/5 flex items-center justify-center mx-auto"><User className="w-14 h-14 text-cyan-400" /></div>
                       <div className="space-y-2">
                          <h2 className="text-3xl font-black uppercase italic">{userStatus.username}</h2>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest"><BadgeCheck className="w-3 h-3" /> Верифицирован</div>
                       </div>
                       <div className="p-6 bg-[#08090d] border border-[#222634] rounded-2xl flex items-center justify-between">
                          <div className="text-left"><div className="text-[9px] font-black text-muted-foreground uppercase">Баланс</div><div className={cn("text-2xl font-black", accentColor)}>{balance} ₽</div></div>
                          <Button size="sm" className="bg-[#1a1d26] border border-white/10 text-white" onClick={() => {
                             toast({
                                title: "⚠️ ОБНАРУЖЕНО НОВОЕ УСТРОЙСТВО",
                                description: "В целях финансовой безопасности подтвержите операцию кодом из СМС."
                             });
                          }}><Plus className="w-4 h-4" /></Button>
                       </div>
                       <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                          <Shield className="w-5 h-5 text-emerald-400" />
                          <div className="text-left"><div className="text-[10px] font-black uppercase">P2P БЕЗОПАСНОСТЬ</div><div className="text-[9px] text-muted-foreground">Эскроу-удержание активно (IP + SMS)</div></div>
                       </div>

                       {/* AI Auto Responder Toggle */}
                       <div className="flex items-center justify-between p-4 bg-violet-600/5 border border-violet-500/20 rounded-2xl transition-all">
                          <div className="flex items-center gap-3">
                             <Bot className={cn("w-5 h-5", isAiResponderActive ? "text-violet-400" : "text-slate-500")} />
                             <div className="text-left"><div className="text-[10px] font-black uppercase">ИИ-АВТООТВЕТЧИК</div><div className="text-[8px] text-muted-foreground">Симуляция фоновой обработки ответов</div></div>
                          </div>
                          <button onClick={() => { setIsAiResponderActive(!isAiResponderActive); playSound('click'); }} className={cn("w-10 h-5 rounded-full relative transition-all", isAiResponderActive ? "bg-violet-600" : "bg-slate-700")}>
                             <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", isAiResponderActive ? "left-6" : "left-1")} />
                          </button>
                       </div>

                       {/* TG Linking */}
                       <div className="flex items-center justify-between p-4 bg-[#0088cc]/5 border border-[#0088cc]/20 rounded-2xl transition-all">
                          <div className="flex items-center gap-3">
                             <BellRing className={cn("w-5 h-5", isTgLinked ? "text-[#0088cc]" : "text-slate-500")} />
                             <div className="text-left"><div className="text-[10px] font-black uppercase">УВЕДОМЛЕНИЯ В ТГ</div><div className="text-[8px] text-muted-foreground">Мгновенные алерты о транзакциях</div></div>
                          </div>
                          {!isTgLinked ? (
                             <Button size="sm" onClick={() => { setIsTgLinked(true); playSound('success'); toast({ title: "🤖 БОТ INTERVAL", description: "Ваш профиль успешно сопряжен с Telegram-ботом!" }); }} className="h-7 text-[8px] font-black bg-[#0088cc] hover:bg-[#0077bb]">ПРИВЯЗАТЬ</Button>
                          ) : (
                             <CheckCircle2 className="w-4 h-4 text-[#0088cc]" />
                          )}
                       </div>
                    </div>

                    <div className="bg-[#12141c] border border-[#222634] p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                       <h3 className="text-sm font-black uppercase italic flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> СИСТЕМА ДОСТИЖЕНИЙ</h3>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-300">🛍️ КУПЕЦ (ПОКУПКИ)</span><span className="text-violet-400">2 / 5</span></div>
                             <Progress value={40} className="h-2 bg-slate-800" />
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-300">💰 МАГНАТ (ПРОДАЖИ)</span><span className="text-emerald-400">1200 / 5000 ₽</span></div>
                             <Progress value={24} className="h-2 bg-slate-800" />
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-300">🔥 ЛЕГЕНДА (ОТЗЫВЫ)</span><span className="text-amber-500">8 / 20</span></div>
                             <Progress value={40} className="h-2 bg-slate-800" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-8 space-y-8">
                    {/* Weekly Income Analytics */}
                    <div className="bg-[#12141c] border border-[#222634] p-10 rounded-[2.5rem] shadow-2xl space-y-6">
                       <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3"><BarChart3 className={cn("w-6 h-6", accentColor)} /> АНАЛИТИКА ДОХОДОВ ЗА НЕДЕЛЮ</h3>
                       <div className="h-[180px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={INCOME_MOCK}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} />
                                <YAxis hide />
                                <Tooltip content={({ active, payload }) => {
                                   if (active && payload && payload.length) {
                                      return <div className="bg-[#08090d] border border-white/10 p-2 rounded-lg text-[10px] font-black uppercase"><p className={accentColor}>+{payload[0].value} ₽</p></div>
                                   }
                                   return null;
                                }} />
                                <Bar dataKey="income" fill={siteTheme === 'phoenix' ? '#f97316' : '#06b6d4'} radius={[4, 4, 0, 0]} />
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    <div className="bg-[#12141c] border border-[#222634] p-10 rounded-[2.5rem] space-y-8 shadow-2xl">
                       <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3"><Heart className="w-6 h-6 text-red-500 fill-red-500" /> ИЗБРАННЫЕ ТОВАРЫ ({favorites.length})</h3>
                       {favorites.length === 0 ? <div className="py-20 text-center opacity-20"><Heart className="w-16 h-16 mx-auto mb-4" /><p className="text-[10px] font-black uppercase">Список пуст</p></div> : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {favorites.map(f => (
                             <div key={f.id} onClick={() => { setSelectedProduct(f); setTab('product_view'); playSound('click'); }} className="p-4 bg-[#08090d] border border-[#222634] rounded-2xl flex items-center justify-between group cursor-pointer transition-all hover:border-red-500/30">
                                <div className="flex items-center gap-3">
                                   <div className="w-12 h-10 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center">
                                      {f.images && f.images[0] ? <img src={f.images[0]} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 opacity-20" />}
                                   </div>
                                   <div>
                                      <div className="text-[10px] font-bold truncate max-w-[120px]">{f.title}</div>
                                      <div className="text-xs font-black text-cyan-400">{f.price} ₽</div>
                                   </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(f); }} className="p-2 text-red-500"><Heart className="w-4 h-4 fill-red-500" /></button>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {tab === 'arbitrage' && (
           <div className="max-w-3xl mx-auto h-[600px] bg-[#12141c] border border-red-500/30 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center space-y-10 animate-in zoom-in-95">
              <div className="relative">
                 <div className="w-24 h-24 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
                 <Gavel className="w-10 h-10 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-4">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-500">ПРОТОКОЛ КИБЕР-АРБИТРАЖА</h2>
                 <div className="flex items-center justify-center gap-2 text-red-400 font-mono text-2xl animate-pulse">
                    <Clock className="w-6 h-6" />
                    <span>{formatTime(arbitrageTimer)}</span>
                 </div>
                 <div className="max-w-xl bg-red-950/20 border border-red-500/20 p-6 rounded-2xl text-left">
                    <p className="text-[11px] font-bold text-red-200 leading-relaxed uppercase">
                       ⚙️ ПРОТОКОЛ КИБЕР-АРБИТРАЖА INTERVAL AI: Инициировано официальное разбирательство по факту нарушения условий P2P-контракта сделки. Продавцу вменяется жесткое регламентированное обязательство осуществить прямую ручную передачу цифровых активов в течение 15-минутного тайм-лимита. Стороны обязаны предоставить верифицированные медиа-доказательства (скриншоты/видеозаписи фиксации привязок). В случае истечения тайм-лимита или выявления признаков мошенничества, система активирует принудительный реверс (возврат) средств на баланс покупателя, а профиль нарушителя будет заблокирован по аппаратному ID.
                    </p>
                 </div>
              </div>
              <Button onClick={() => setTab('chats')} variant="outline" className="border-red-500/30 text-red-500 text-[10px] font-black uppercase px-8 h-12 rounded-xl">Вернуться в чат сделки</Button>
           </div>
        )}

      </main>

      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-[#12141c] border border-[#222634] p-10 rounded-[2.5rem] w-full max-w-md text-center space-y-8 shadow-2xl text-white">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10 text-emerald-400" /></div>
              <div className="space-y-2"><h2 className="text-2xl font-black uppercase italic">Транзакция завершена</h2><p className="text-sm text-muted-foreground">Верифицируйте качество обслуживания продавца</p></div>
              <div className="flex justify-center gap-2">{[1,2,3,4,5].map(s => <Star key={s} className="w-8 h-8 text-amber-500 fill-amber-500 cursor-pointer hover:scale-110" />)}</div>
              <Button onClick={() => { setShowReviewModal(false); playSound('click'); }} className={cn("w-full h-14 text-slate-950 font-black uppercase rounded-xl", accentBg)}>Подтвердить и оценить</Button>
           </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-in-out; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #08090d; }
        ::-webkit-scrollbar-thumb { background: #222634; border-radius: 10px; }
      `}</style>
    </div>
  );
}
