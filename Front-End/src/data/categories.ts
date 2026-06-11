// Static assets and data for Clash of Minds

// PowerUps with images
export const powerUps = [
  {
    id: 'steal',
    icon: 'https://i.imgur.com/e1Ywhk4.png',
    name: { ar: 'سرقة السؤال', en: 'Steal Question' },
    description: { ar: 'يمكنك سرقة سؤال الفريق الخصم والإجابة عليه', en: 'Steal opponent\'s question and answer it' }
  },
  {
    id: 'block',
    icon: 'https://i.imgur.com/VtMtaCu.png',
    name: { ar: 'منع الخصم', en: 'Block Opponent' },
    description: { ar: 'يمنع الفريق الخصم من الإجابة على السؤال القادم', en: 'Prevents opponent from answering next question' }
  },
  {
    id: 'double',
    icon: 'https://i.imgur.com/PdUyRQG.png',
    name: { ar: 'تدبيل النقاط', en: 'Double Points' },
    description: { ar: 'يتم تدبيل نقاط السؤال القادم', en: 'Doubles points for next question' }
  },
  {
    id: 'callfriend',
    icon: 'https://i.imgur.com/r2gvY0n.png',
    name: { ar: 'اتصال بصديق', en: 'Call a Friend' },
    description: { ar: 'اتصل بصديق للمساعدة في الإجابة', en: 'Call a friend for help' }
  },
  {
    id: 'twoanswers',
    icon: 'https://i.imgur.com/3R4plWC.png',
    name: { ar: 'إجابتين', en: 'Two Answers' },
    description: { ar: 'يمكنك تجربة إجابتين للسؤال', en: 'Try two answers for the question' }
  }
];

// Info Icon
export const infoIcon = 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774260414/info_s9gtjd.png';

// Game Logo
export const gameLogo = 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774260293/logo_dronvr.png';

// Game Favicon
export const gameIcon = 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774260293/logo_dronvr.png';

// Category Sections
export const categorySections = {
  anime: { id: 'anime', name: { ar: 'أنمي', en: 'Anime' } },
  movies: { id: 'movies', name: { ar: 'أفلام', en: 'Movies' } },
  tvshows: { id: 'tvshows', name: { ar: 'مسلسلات', en: 'TV Shows' } },
  general: { id: 'general', name: { ar: 'عام', en: 'General' } }
};

// Categories - ONLY with images
export const allCategories = [
  // Anime - 6 categories
  { id: 'an1', name: { ar: 'Attack on Titan', en: 'Attack on Titan' }, description: { ar: 'أسئلة عن Attack on Titan', en: 'Attack on Titan questions' }, section: 'anime', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1775223976/eren-attack-on-titan-final-season-2-phone-wallpaper-4k-uhdpaper.com-871_0_e_imz3no.jpg', count: 6 },
  { id: 'an2', name: { ar: 'Death Note', en: 'Death Note' }, description: { ar: 'أسئلة عن Death Note', en: 'Death Note questions' }, section: 'anime', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774264776/Gemini_Generated_Image_6lxhpl6lxhpl6lxh_pfe3u0.png', count: 6 },
  { id: 'an3', name: { ar: 'Hunter x Hunter', en: 'Hunter x Hunter' }, description: { ar: 'أسئلة عن Hunter x Hunter', en: 'Hunter x Hunter questions' }, section: 'anime', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1775223972/wp4990975_tcymg3.jpg', count: 6 },
  { id: 'an4', name: { ar: 'Naruto', en: 'Naruto' }, description: { ar: 'أسئلة عن Naruto', en: 'Naruto questions' }, section: 'anime', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1775223978/HD-wallpaper-naruto-team-anime-apple-iphone-kids-naruto-shippuden-samsung-ultra-team_iqwgq0.jpg', count: 6 },
  { id: 'an5', name: { ar: 'One Piece', en: 'One Piece' }, description: { ar: 'أسئلة عن One Piece', en: 'One Piece questions' }, section: 'anime', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1775223982/laughing-luffy-5k-wallpaper-1290x2796-15645_naaswh.png', count: 6 },
  
  // Movies - 5 categories
  { id: 'mov1', name: { ar: 'Harry Potter', en: 'Harry Potter' }, description: { ar: 'أسئلة عن Harry Potter', en: 'Harry Potter questions' }, section: 'movies', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774264796/Gemini_Generated_Image_pkcslrpkcslrpkcs_yo14jq.png', count: 6 },
  { id: 'mov2', name: { ar: 'Lord of the Rings', en: 'Lord of the Rings' }, description: { ar: 'أسئلة عن Lord of the Rings', en: 'Lord of the Rings questions' }, section: 'movies', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774264954/Gemini_Generated_Image_azfomgazfomgazfo_yzmeka.png', count: 6 },
  { id: 'mov3', name: { ar: 'Marvel', en: 'Marvel' }, description: { ar: 'أسئلة عن Marvel', en: 'Marvel questions' }, section: 'movies', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1775223970/4k-marvel-iphone_qvcb7a.jpg', count: 6 },
  { id: 'mov4', name: { ar: 'Star Wars', en: 'Star Wars' }, description: { ar: 'أسئلة عن Star Wars', en: 'Star Wars questions' }, section: 'movies', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774264792/Gemini_Generated_Image_fp5fy0fp5fy0fp5f_ky5d20.png', count: 6 },
  { id: 'mov5', name: { ar: 'أفلام عام', en: 'General Movies' }, description: { ar: 'أسئلة عامة عن الأفلام', en: 'General movies questions' }, section: 'movies', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774264943/Gemini_Generated_Image_uv4crbuv4crbuv4c_eettbk.png', count: 6 },
  
  // TV Shows - 2 categories
  { id: 'tv1', name: { ar: 'Game of Thrones', en: 'Game of Thrones' }, description: { ar: 'أسئلة عن Game of Thrones', en: 'Game of Thrones questions' }, section: 'tvshows', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1775223732/125827-1080x1920-mobile-full-hd-game-of-thrones-wallpaper-image_pxyrns.jpg', count: 6 },
  { id: 'tv2', name: { ar: 'Stranger Things', en: 'Stranger Things' }, description: { ar: 'أسئلة عن Stranger Things', en: 'Stranger Things questions' }, section: 'tvshows', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1775223729/81U0-cRG34S_yhdamn.jpg', count: 6 },
  
  // General - 4 categories
  { id: 'gen1', name: { ar: 'تاريخ', en: 'History' }, description: { ar: 'أسئلة في التاريخ', en: 'History questions' }, section: 'general', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774265031/Gemini_Generated_Image_dehjkjdehjkjdehj_kzhi5z.png', count: 6 },
  { id: 'gen2', name: { ar: 'جغرافيا', en: 'Geography' }, description: { ar: 'أسئلة في الجغرافيا', en: 'Geography questions' }, section: 'general', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774265039/Gemini_Generated_Image_lkcaemlkcaemlkca_mjaxer.png', count: 6 },
  { id: 'gen3', name: { ar: 'سيارات', en: 'Cars' }, description: { ar: 'أسئلة عن السيارات', en: 'Cars questions' }, section: 'general', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774265336/Gemini_Generated_Image_tsrulztsrulztsru_zsymoj.png', count: 6 },
  { id: 'gen4', name: { ar: 'علوم', en: 'Science' }, description: { ar: 'أسئلة في العلوم', en: 'Science questions' }, section: 'general', image: 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774265034/Gemini_Generated_Image_m2c7vtm2c7vtm2c7_e3hdfn.png', count: 6 }
];

// Questions Database - 200=easy, 400=hard, 600=extremely hard
export const questionsDB: Record<string, Array<{
  id: string;
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
  points: 200 | 400 | 600;
  image?: string;
  answerImage?: string;
}>> = {
  // ==================== ANIME ====================
  'Attack on Titan': [
    // 200 - Easy
    { id: 'aot1', question: { ar: 'من هو البطل الرئيسي في Attack on Titan؟', en: 'Who is the main protagonist of Attack on Titan?' }, answer: { ar: 'إرين ييغر', en: 'Eren Yeager' }, points: 200 },
    { id: 'aot2', question: { ar: 'ما هي المخلوقات العملاقة في الأنمي؟', en: 'What are the giant creatures in the anime?' }, answer: { ar: 'العمالقة', en: 'Titans' }, points: 200 },
    // 400 - Hard
    { id: 'aot3', question: { ar: 'ما هو اسم الجدار الذي يعيش فيه البشر؟', en: 'What is the name of the wall where humans live?' }, answer: { ar: 'ماريا / روز / سينا', en: 'Maria / Rose / Sina' }, points: 400 },
    { id: 'aot4', question: { ar: 'من هو قائد فرقة الاستطلاع؟', en: 'Who is the Survey Corps commander?' }, answer: { ar: 'إيروين سميث', en: 'Erwin Smith' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'aot5', question: { ar: 'ما هو القدر الخاص بـ Founding Titan؟', en: 'What is the special ability of the Founding Titan?' }, answer: { ar: 'التحكم في جميع العمالقة وتعديل ذكريات الألديان', en: 'Control all Titans and alter Eldian memories' }, points: 600 },
    { id: 'aot6', question: { ar: 'كم سنة استغرق إصدار الموسم الأخير؟', en: 'How many years did the final season take to release?' }, answer: { ar: '4 سنوات', en: '4 years' }, points: 600 }
  ],
  
  'Death Note': [
    // 200 - Easy
    { id: 'dn1', question: { ar: 'من هو بطل Death Note؟', en: 'Who is the protagonist of Death Note?' }, answer: { ar: 'لايت ياجامي', en: 'Light Yagami' }, points: 200 },
    { id: 'dn2', question: { ar: 'ما هو اسم المحقق الشهير؟', en: 'What is the name of the famous detective?' }, answer: { ar: 'L', en: 'L' }, points: 200 },
    // 400 - Hard
    { id: 'dn3', question: { ar: 'ما هو اسم شينيغامي الذي أعطى لايت الدفتر؟', en: 'What is the name of the Shinigami who gave Light the notebook?' }, answer: { ar: 'ريوك', en: 'Ryuk' }, points: 400 },
    { id: 'dn4', question: { ar: 'كيف يمكن قتل شخص باستخدام Death Note؟', en: 'How can you kill someone using the Death Note?' }, answer: { ar: 'كتابة اسمه والتفكير في وجهه', en: 'Writing their name and picturing their face' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'dn5', question: { ar: 'ما هي القاعدة التي تمنع كتابة اسم الشينيغامي؟', en: 'What is the rule that prevents writing a Shinigami\'s name?' }, answer: { ar: 'لا يمكن قتل الشينيغامي بالدفتر', en: 'Shinigami cannot be killed by the notebook' }, points: 600 },
    { id: 'dn6', question: { ar: 'كم عمر لايت ياجامي في بداية القصة؟', en: 'How old is Light Yagami at the beginning of the story?' }, answer: { ar: '17 سنة', en: '17 years old' }, points: 600 }
  ],
  
  'Hunter x Hunter': [
    // 200 - Easy
    { id: 'hxh1', question: { ar: 'من هو البطل الرئيسي في Hunter x Hunter؟', en: 'Who is the main protagonist of Hunter x Hunter?' }, answer: { ar: 'غون فريكس', en: 'Gon Freecss' }, points: 200 },
    { id: 'hxh2', question: { ar: 'من هو أفضل صديق لـ غون؟', en: 'Who is Gon\'s best friend?' }, answer: { ar: 'كيلوا', en: 'Killua' }, points: 200 },
    // 400 - Hard
    { id: 'hxh3', question: { ar: 'ما هو اسم والد غون؟', en: 'What is Gon\'s father\'s name?' }, answer: { ar: 'جين فريكس', en: 'Ging Freecss' }, points: 400 },
    { id: 'hxh4', question: { ar: 'ما هي Nen؟', en: 'What is Nen?' }, answer: { ar: 'طاقة حيوية يمكن استخدامها في القتال', en: 'Life energy that can be used in combat' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'hxh5', question: { ar: 'ما هي فئات النين الست؟', en: 'What are the six Nen categories?' }, answer: { ar: 'تقوية، تحويل، مادة، إطلاق، تلاعب، تخصص', en: 'Enhancement, Transmutation, Conjuration, Emission, Manipulation, Specialization' }, points: 600 },
    { id: 'hxh6', question: { ar: 'من هو رئيس زودياك؟', en: 'Who is the Zodiac leader?' }, answer: { ar: 'كاكين', en: 'Cheadle' }, points: 600 }
  ],
  
  'Naruto': [
    // 200 - Easy
    { id: 'nar1', question: { ar: 'من هو بطل Naruto؟', en: 'Who is the protagonist of Naruto?' }, answer: { ar: 'ناروتو أوزوماكي', en: 'Naruto Uzumaki' }, points: 200 },
    { id: 'nar2', question: { ar: 'ما هي قرية ناروتو؟', en: 'What is Naruto\'s village?' }, answer: { ar: 'كونوها', en: 'Konoha' }, points: 200 },
    // 400 - Hard
    { id: 'nar3', question: { ar: 'من هو معلم ناروتو؟', en: 'Who is Naruto\'s teacher?' }, answer: { ar: 'كاكاشي هاتاكي', en: 'Kakashi Hatake' }, points: 400 },
    { id: 'nar4', question: { ar: 'ما هو حلم ناروتو؟', en: 'What is Naruto\'s dream?' }, answer: { ar: 'أن يكون هوكاجي', en: 'To become Hokage' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'nar5', question: { ar: 'من هو والد ناروتو؟', en: 'Who is Naruto\'s father?' }, answer: { ar: 'ميناتو ناميكازي - الهوكاجي الرابع', en: 'Minato Namikaze - Fourth Hokage' }, points: 600 },
    { id: 'nar6', question: { ar: 'ما هو اسم الوحش داخل ناروتو؟', en: 'What is the name of the beast inside Naruto?' }, answer: { ar: 'كيوبي / كوراما', en: 'Kurama / Nine-Tails' }, points: 600 }
  ],
  
  'One Piece': [
    // 200 - Easy
    { id: 'op1', question: { ar: 'من هو قائد طاقم القبعة القش؟', en: 'Who is the captain of the Straw Hat Pirates?' }, answer: { ar: 'مونكي دي لوفي', en: 'Monkey D. Luffy' }, points: 200 },
    { id: 'op2', question: { ar: 'ما هو هدف لوفي؟', en: 'What is Luffy\'s goal?' }, answer: { ar: 'أن يكون ملك القراصنة', en: 'To become Pirate King' }, points: 200 },
    // 400 - Hard
    { id: 'op3', question: { ar: 'من هو أول فرد انضم لطاقم لوفي؟', en: 'Who was the first member to join Luffy\'s crew?' }, answer: { ar: 'رورونوا زورو', en: 'Roronoa Zoro' }, points: 400 },
    { id: 'op4', question: { ar: 'ما هي قدرة فاكهة لوفي؟', en: 'What is Luffy\'s Devil Fruit ability?' }, answer: { ar: 'فاكهة المطاط', en: 'Gomu Gomu no Mi (Rubber)' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'op5', question: { ar: 'ما هو اسم السفينة الحالية للطاقم؟', en: 'What is the crew\'s current ship name?' }, answer: { ar: 'ألف ساني', en: 'Thousand Sunny' }, points: 600 },
    { id: 'op6', question: { ar: 'من كتب مانغا One Piece؟', en: 'Who wrote the One Piece manga?' }, answer: { ar: 'إييتشيرو أودا', en: 'Eiichiro Oda' }, points: 600 }
  ],
  
  // ==================== MOVIES ====================
  'Harry Potter': [
    // 200 - Easy
    { id: 'hp1', question: { ar: 'من كتب سلسلة هاري بوتر؟', en: 'Who wrote the Harry Potter series?' }, answer: { ar: 'جي كي رولينغ', en: 'J.K. Rowling' }, points: 200 },
    { id: 'hp2', question: { ar: 'كم جزء في السلسلة؟', en: 'How many books are in the series?' }, answer: { ar: '7', en: '7' }, points: 200 },
    // 400 - Hard
    { id: 'hp3', question: { ar: 'ما هو اسم المدرسة؟', en: 'What is the school name?' }, answer: { ar: 'هوجوورتس', en: 'Hogwarts' }, points: 400 },
    { id: 'hp4', question: { ar: 'من هو مدير المدرسة؟', en: 'Who is the headmaster?' }, answer: { ar: 'ألباس دمبلدور', en: 'Albus Dumbledore' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'hp5', question: { ar: 'ما هي التعويذة القاتلة؟', en: 'What is the killing curse?' }, answer: { ar: 'أفادا كيدافرا', en: 'Avada Kedavra' }, points: 600 },
    { id: 'hp6', question: { ar: 'ما هي مكونات عصا هاري؟', en: 'What are the components of Harry\'s wand?' }, answer: { ar: 'خشب القيقب وريشة العنقاء', en: 'Holly and phoenix feather' }, points: 600 }
  ],
  
  'Lord of the Rings': [
    // 200 - Easy
    { id: 'lotr1', question: { ar: 'من كتب Lord of the Rings؟', en: 'Who wrote Lord of the Rings?' }, answer: { ar: 'جي آر آر تولكين', en: 'J.R.R. Tolkien' }, points: 200 },
    { id: 'lotr2', question: { ar: 'من هو البطل الرئيسي؟', en: 'Who is the main protagonist?' }, answer: { ar: 'فرودو باجينز', en: 'Frodo Baggins' }, points: 200 },
    // 400 - Hard
    { id: 'lotr3', question: { ar: 'ما هو اسم الساحر؟', en: 'What is the wizard\'s name?' }, answer: { ar: 'غاندالف', en: 'Gandalf' }, points: 400 },
    { id: 'lotr4', question: { ar: 'ما هي اللغة التي يتحدث بها الأورك؟', en: 'What language do Orcs speak?' }, answer: { ar: 'اللغة السوداء', en: 'Black Speech' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'lotr5', question: { ar: 'كم عمر الأقزام عادةً؟', en: 'How long do Dwarves typically live?' }, answer: { ar: '250 سنة', en: '250 years' }, points: 600 },
    { id: 'lotr6', question: { ar: 'ما هو اسم السيف الذي يحمله أراغورن؟', en: 'What is the name of Aragorn\'s sword?' }, answer: { ar: 'أندوريل', en: 'Anduril' }, points: 600 }
  ],
  
  'Marvel': [
    // 200 - Easy
    { id: 'mar1', question: { ar: 'من هو مؤسس مارفل؟', en: 'Who founded Marvel?' }, answer: { ar: 'ستان لي', en: 'Stan Lee' }, points: 200 },
    { id: 'mar2', question: { ar: 'من هو أشهر بطل خارق في مارفل؟', en: 'Who is Marvel\'s most famous superhero?' }, answer: { ar: 'سبايدرمان', en: 'Spider-Man' }, points: 200 },
    // 400 - Hard
    { id: 'mar3', question: { ar: 'ما هو اسم عالم مارفل الرئيسي؟', en: 'What is Marvel\'s main universe called?' }, answer: { ar: 'Earth-616', en: 'Earth-616' }, points: 400 },
    { id: 'mar4', question: { ar: 'من هو ثانوس؟', en: 'Who is Thanos?' }, answer: { ar: 'الشرير الأقوى الذي يسعى لجمع الأحجار', en: 'The Mad Titan seeking the Infinity Stones' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'mar5', question: { ar: 'كم فيلماً في المرحلة الأولى من MCU؟', en: 'How many films are in MCU Phase 1?' }, answer: { ar: '6', en: '6' }, points: 600 },
    { id: 'mar6', question: { ar: 'ما هو معدن درع كابتن أمريكا؟', en: 'What is Captain America\'s shield made of?' }, answer: { ar: 'فيبريانيوم', en: 'Vibranium' }, points: 600 }
  ],
  
  'Star Wars': [
    // 200 - Easy
    { id: 'sw1', question: { ar: 'من هو بطل الثلاثية الأصلية؟', en: 'Who is the original trilogy hero?' }, answer: { ar: 'لوك سكايووكر', en: 'Luke Skywalker' }, points: 200 },
    { id: 'sw2', question: { ar: 'من هو الشرير الأسود؟', en: 'Who is the black villain?' }, answer: { ar: 'دارث فيدر', en: 'Darth Vader' }, points: 200 },
    // 400 - Hard
    { id: 'sw3', question: { ar: 'ما هي القوة؟', en: 'What is the Force?' }, answer: { ar: 'طاقة تربط المجرة', en: 'Energy binding the galaxy' }, points: 400 },
    { id: 'sw4', question: { ar: 'كم فيلماً في السلسلة الرئيسية؟', en: 'How many films in the main saga?' }, answer: { ar: '9', en: '9' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'sw5', question: { ar: 'من هو يودا؟', en: 'Who is Yoda?' }, answer: { ar: 'جيداي أسطوري', en: 'Legendary Jedi Master' }, points: 600 },
    { id: 'sw6', question: { ar: 'ما هو Death Star؟', en: 'What is the Death Star?' }, answer: { ar: 'محطة فضاء قتالية', en: 'Battle space station' }, points: 600 }
  ],
  
  'أفلام عام': [
    // 200 - Easy
    { id: 'gm1', question: { ar: 'ما هو أشهر فيلم رسوم متحركة؟', en: 'What is the most famous animated movie?' }, answer: { ar: 'ذا ليون كينج', en: 'The Lion King' }, points: 200 },
    { id: 'gm2', question: { ar: 'من هو أشهر ممثل في العالم؟', en: 'Who is the most famous actor in the world?' }, answer: { ar: 'توم كروز', en: 'Tom Cruise' }, points: 200 },
    // 400 - Hard
    { id: 'gm3', question: { ar: 'كم جائزة أوسكار فاز بها تيتانيك؟', en: 'How many Oscars did Titanic win?' }, answer: { ar: '11', en: '11' }, points: 400 },
    { id: 'gm4', question: { ar: 'من أخرج فيلم Inception؟', en: 'Who directed Inception?' }, answer: { ar: 'كريستوفر نولان', en: 'Christopher Nolan' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'gm5', question: { ar: 'ما هو أول فيلم صوتي في التاريخ؟', en: 'What is the first sound film in history?' }, answer: { ar: 'المغني الجاز', en: 'The Jazz Singer' }, points: 600 },
    { id: 'gm6', question: { ar: 'كم دقيقة فيلم Gone with the Wind؟', en: 'How long is Gone with the Wind?' }, answer: { ar: '238 دقيقة', en: '238 minutes' }, points: 600 }
  ],
  
  // ==================== TV SHOWS ====================
  'Game of Thrones': [
    // 200 - Easy
    { id: 'got1', question: { ar: 'من هي أم التنانين؟', en: 'Who is the Mother of Dragons?' }, answer: { ar: 'دينيريس تارغيريان', en: 'Daenerys Targaryen' }, points: 200 },
    { id: 'got2', question: { ar: 'ما هي عاصمة الشمال؟', en: 'What is the capital of the North?' }, answer: { ar: 'وينترفيل', en: 'Winterfell' }, points: 200 },
    // 400 - Hard
    { id: 'got3', question: { ar: 'كم موسماً للمسلسل؟', en: 'How many seasons?' }, answer: { ar: '8 مواسم', en: '8 seasons' }, points: 400 },
    { id: 'got4', question: { ar: 'ما هي عبارة بيت ستارك؟', en: 'What is House Stark\'s motto?' }, answer: { ar: 'الشتاء قادم', en: 'Winter is Coming' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'got5', question: { ar: 'من كتب الروايات الأصلية؟', en: 'Who wrote the original novels?' }, answer: { ar: 'جورج آر آر مارتن', en: 'George R.R. Martin' }, points: 600 },
    { id: 'got6', question: { ar: 'من يجلس على العرش الحديدي في النهاية؟', en: 'Who sits on the Iron Throne at the end?' }, answer: { ar: 'بران ستارك', en: 'Bran Stark' }, points: 600 }
  ],
  
  'Stranger Things': [
    // 200 - Easy
    { id: 'st1', question: { ar: 'في أي عام يدور المسلسل؟', en: 'In what year is the show set?' }, answer: { ar: '1983', en: '1983' }, points: 200 },
    { id: 'st2', question: { ar: 'ما هي قدرة إيليفن؟', en: 'What is Eleven\'s power?' }, answer: { ar: 'القوى الذهنية', en: 'Telekinesis' }, points: 200 },
    // 400 - Hard
    { id: 'st3', question: { ar: 'ما هو اسم العالم المقلوب؟', en: 'What is the Upside Down?' }, answer: { ar: 'عالم موازي مظلم', en: 'A dark parallel dimension' }, points: 400 },
    { id: 'st4', question: { ar: 'من هو الوحش الرئيسي؟', en: 'Who is the main monster?' }, answer: { ar: 'ديماجورغون', en: 'Demogorgon' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'st5', question: { ar: 'ما هو اسم المختبر؟', en: 'What is the lab called?' }, answer: { ar: 'هوكينز ناشونال', en: 'Hawkins National Laboratory' }, points: 600 },
    { id: 'st6', question: { ar: 'من هي والدة إيليفن؟', en: 'Who is Eleven\'s mother?' }, answer: { ar: 'تيري آيفز', en: 'Terry Ives' }, points: 600 }
  ],
  
  // ==================== GENERAL ====================
  'تاريخ': [
    // 200 - Easy
    { id: 'his1', question: { ar: 'في أي عام تأسست المملكة العربية السعودية؟', en: 'In what year was Saudi Arabia founded?' }, answer: { ar: '1932', en: '1932' }, points: 200 },
    { id: 'his2', question: { ar: 'من هو مؤسس الدولة الأموية؟', en: 'Who founded the Umayyad Caliphate?' }, answer: { ar: 'معاوية بن أبي سفيان', en: 'Muawiyah ibn Abi Sufyan' }, points: 200 },
    // 400 - Hard
    { id: 'his3', question: { ar: 'متى وقعت غزوة بدر؟', en: 'When did the Battle of Badr occur?' }, answer: { ar: '2 هـ', en: '2 AH' }, points: 400 },
    { id: 'his4', question: { ar: 'من هو قائد المسلمين في فتح مصر؟', en: 'Who led the Muslim conquest of Egypt?' }, answer: { ar: 'عمرو بن العاص', en: 'Amr ibn al-As' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'his5', question: { ar: 'كم استمرت الخلافة العباسية؟', en: 'How long did the Abbasid Caliphate last?' }, answer: { ar: '508 سنوات', en: '508 years' }, points: 600 },
    { id: 'his6', question: { ar: 'من هو صاحب فكرة الصفر؟', en: 'Who invented the concept of zero?' }, answer: { ar: 'الخوارزمي', en: 'Al-Khwarizmi' }, points: 600 }
  ],
  
  'جغرافيا': [
    // 200 - Easy
    { id: 'geo1', question: { ar: 'ما هي عاصمة فرنسا؟', en: 'What is the capital of France?' }, answer: { ar: 'باريس', en: 'Paris' }, points: 200 },
    { id: 'geo2', question: { ar: 'كم قارة في العالم؟', en: 'How many continents?' }, answer: { ar: '7', en: '7' }, points: 200 },
    // 400 - Hard
    { id: 'geo3', question: { ar: 'ما هو أطول نهر في العالم؟', en: 'What is the longest river?' }, answer: { ar: 'النيل', en: 'Nile' }, points: 400 },
    { id: 'geo4', question: { ar: 'كم محيطاً في العالم؟', en: 'How many oceans?' }, answer: { ar: '5', en: '5' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'geo5', question: { ar: 'ما هي أعمق نقطة في المحيط؟', en: 'What is the deepest point in the ocean?' }, answer: { ar: 'خندق ماريانا', en: 'Mariana Trench' }, points: 600 },
    { id: 'geo6', question: { ar: 'كم دولة في العالم؟', en: 'How many countries?' }, answer: { ar: '195', en: '195' }, points: 600 }
  ],
  
  'سيارات': [
    // 200 - Easy
    { id: 'car1', question: { ar: 'ما هي أشهر شركة سيارات ألمانية؟', en: 'What is the most famous German car company?' }, answer: { ar: 'مرسيدس', en: 'Mercedes' }, points: 200 },
    { id: 'car2', question: { ar: 'ما هو شعار فيراري؟', en: 'What is Ferrari\'s logo?' }, answer: { ar: 'حصان', en: 'Horse' }, points: 200 },
    // 400 - Hard
    { id: 'car3', question: { ar: 'ما هي أسرع سيارة في العالم؟', en: 'What is the fastest car in the world?' }, answer: { ar: 'بوغاتي شيرون', en: 'Bugatti Chiron' }, points: 400 },
    { id: 'car4', question: { ar: 'من اخترع السيارة؟', en: 'Who invented the car?' }, answer: { ar: 'كارل بنز', en: 'Karl Benz' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'car5', question: { ar: 'كم سلندر في محرك V12؟', en: 'How many cylinders in a V12 engine?' }, answer: { ar: '12', en: '12' }, points: 600 },
    { id: 'car6', question: { ar: 'ما هي أول سيارة كهربائية ناجحة؟', en: 'What was the first successful electric car?' }, answer: { ar: 'نيسان ليف', en: 'Nissan Leaf' }, points: 600 }
  ],
  
  'علوم': [
    // 200 - Easy
    { id: 'sci1', question: { ar: 'ما هو العنصر الكيميائي الذي رمزه O؟', en: 'What is the chemical element with symbol O?' }, answer: { ar: 'الأكسجين', en: 'Oxygen' }, points: 200 },
    { id: 'sci2', question: { ar: 'كم عدد كواكب المجموعة الشمسية؟', en: 'How many planets are in the solar system?' }, answer: { ar: '8', en: '8' }, points: 200 },
    // 400 - Hard
    { id: 'sci3', question: { ar: 'ما هو أكبر عضو في جسم الإنسان؟', en: 'What is the largest organ in the human body?' }, answer: { ar: 'الجلد', en: 'Skin' }, points: 400 },
    { id: 'sci4', question: { ar: 'ما هي وحدة قياس القوة؟', en: 'What is the unit of force?' }, answer: { ar: 'نيوتن', en: 'Newton' }, points: 400 },
    // 600 - Extremely Hard
    { id: 'sci5', question: { ar: 'ما هي سرعة الضوء؟', en: 'What is the speed of light?' }, answer: { ar: '299,792 كم/ث', en: '299,792 km/s' }, points: 600 },
    { id: 'sci6', question: { ar: 'من اكتشف قانون الجاذبية؟', en: 'Who discovered the law of gravity?' }, answer: { ar: 'إسحاق نيوتن', en: 'Isaac Newton' }, points: 600 }
  ]
};
