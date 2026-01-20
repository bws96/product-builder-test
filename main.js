document.addEventListener('DOMContentLoaded', async () => {
    // Sidebar elements
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const overlay = document.getElementById('overlay');

    // Function to load header actions dynamically
    async function loadHeaderActions() {
        try {
            const response = await fetch('_header_actions.html');
            const html = await response.text();
            document.querySelectorAll('#header-actions-placeholder').forEach(placeholder => {
                placeholder.innerHTML = html;
            });
            
            // Re-attach event listeners for dynamic elements
            const themeToggle = document.getElementById('theme-toggle');
            const languageBtn = document.getElementById('language-btn');
            const languageMenu = document.getElementById('language-menu');

            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    applyTheme(newTheme);
                });
            }

            if (languageBtn && languageMenu) {
                languageBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    languageMenu.classList.toggle('active');
                });

                languageMenu.querySelectorAll('li').forEach(item => {
                    item.addEventListener('click', () => {
                        const selectedLang = item.getAttribute('data-value');
                        setLanguage(selectedLang);
                        languageMenu.classList.remove('active');
                        
                        // Update UI to show selected state
                        languageMenu.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
                        item.classList.add('selected');
                    });
                });

                // Close menu when clicking outside
                document.addEventListener('click', () => {
                    languageMenu.classList.remove('active');
                });
                
                // Set initial selected state in menu
                const savedLang = localStorage.getItem('language') || 'ko';
                const initialItem = languageMenu.querySelector(`li[data-value="${savedLang}"]`);
                if (initialItem) initialItem.classList.add('selected');
            }

        } catch (error) {
            console.error('Error loading header actions:', error);
        }
    }

    // Load header actions
    await loadHeaderActions();

    // --- Sidebar Logic ---
    const openSidebar = () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };

    if (menuToggle) menuToggle.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // --- Theme Logic ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            const toggle = document.getElementById('theme-toggle');
            if (toggle) toggle.innerText = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            const toggle = document.getElementById('theme-toggle');
            if (toggle) toggle.innerText = '🌙';
        }
    };

    // --- Language Logic ---
    const setLanguage = (lang) => {
        const translation = translations[lang];
        if (!translation) return;

        // Update UI text
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            let translationText = '';
            
            if (translation.ui[key]) {
                translationText = translation.ui[key];
                elem.innerText = translationText;
            } else if (translation.pages && document.body.dataset.page && translation.pages[document.body.dataset.page] && translation.pages[document.body.dataset.page][key]) {
                translationText = translation.pages[document.body.dataset.page][key];
                elem.innerHTML = translationText;
            }

            // If it's the email link, also update the href
            if (key === 'emailLink' && elem.tagName === 'A') {
                elem.href = `mailto:${translationText}`;
            }
        });
        
        // Update Placeholders
        const recipientInput = document.getElementById('recipient');
        const keywordInput = document.getElementById('keyword');
        
        if (recipientInput && translation.ui.recipientPlaceholder) {
            recipientInput.placeholder = translation.ui.recipientPlaceholder;
        }
        if (keywordInput && translation.ui.keywordPlaceholder) {
            keywordInput.placeholder = translation.ui.keywordPlaceholder;
        }

        // Update Page Meta
        const pageKey = document.body.dataset.page;
        if (pageKey && translations[lang].pages && translations[lang].pages[pageKey]) {
            const pageTranslations = translations[lang].pages[pageKey];
            if (pageTranslations.title) {
                document.title = pageTranslations.title;
            }
            if (pageTranslations.description) {
                document.querySelector('meta[name="description"]').setAttribute('content', pageTranslations.description);
            }
        }

        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);

        // Update Sub-categories whenever language changes
        updateSubCategories();
    };

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Load saved language or default to Korean
    const savedLang = localStorage.getItem('language') || 'ko';
    setLanguage(savedLang);

    // Initial sub-category population
    updateSubCategories();
});

// Map of Category -> Sub-categories keys
// main.js의 subCategoryMap을 아래 코드로 교체

const subCategoryMap = {
    love: ['general', 'blind_date', 'confession', 'date', 'contact', 'jealousy', 'conflict', 'breakup', 'reunion'],
    work: ['general', 'interview', 'social', 'request', 'refusal', 'report', 'negotiation', 'leave', 'resignation'],
    family: ['general', 'holiday', 'celebration', 'health', 'request', 'allowance', 'conflict', 'in_laws'],
    school: ['general', 'professor', 'team', 'roommate', 'senior', 'club', 'scholarship'],
    friend: ['general', 'play', 'congrats', 'consolation', 'borrow', 'refusal', 'conflict', 'make_up'],
    transaction: ['used', 'reservation', 'order', 'refund', 'cs_inquiry'],
    neighbor: ['greeting', 'noise', 'parking', 'borrow', 'complaint'],
    sns: ['comment', 'dm', 'review_reply', 'post', 'admin'],
    service: ['restaurant', 'hair_shop', 'hospital', 'taxi', 'hotel']
};

function updateSubCategories() {
    const lang = localStorage.getItem('language') || 'ko';
    const categorySelect = document.getElementById("category");
    const subCategorySelect = document.getElementById("sub-category");
    
    if (!categorySelect || !subCategorySelect) return;

    const selectedCategory = categorySelect.value;
    const subCats = subCategoryMap[selectedCategory] || [];

    subCategorySelect.innerHTML = ''; // Clear existing

    subCats.forEach(subKey => {
        const option = document.createElement('option');
        option.value = subKey;
        // Construct i18n key: sub_{category}_{subKey}
        const i18nKey = `sub_${selectedCategory}_${subKey}`;
        // Fallback to subKey if translation missing
        option.innerText = (translations[lang] && translations[lang].ui[i18nKey]) ? translations[lang].ui[i18nKey] : subKey;
        subCategorySelect.appendChild(option);
    });
}

// main.js의 const translations = { ... } 전체를 아래 코드로 교체

const translations = {
    ko: {
      ui: {
        siteTitle: "문장 생성기",
        heroTitle: "상황별 맞춤 문장 생성기",
        heroDescription: "어떠한 상황에서도 바로 쓸 수 있는 문장을 만들어드립니다!",
        navHome: "홈",
        navAbout: "소개",
        navContact: "연락처",
        navPrivacy: "개인정보처리방침",
        
        // 카테고리
        categoryLabel: "상황 선택",
        categoryLove: "연애 / 썸",
        categoryWork: "회사 / 사회생활",
        categoryFamily: "가족 / 친척",
        categorySchool: "학교 / 학업",
        categoryFriend: "친구 / 지인",
        categoryTransaction: "거래 / 소비",
        categoryNeighbor: "이웃 / 동네",
        categorySNS: "SNS / 온라인",
        categoryService: "매장 / 서비스",
  
        // 세부 상황 (Love)
        subCategoryLabel: "세부 상황",
        sub_love_general: "일반적인 상황",
        sub_love_blind_date: "소개팅 / 썸 / 첫 만남",
        sub_love_confession: "고백 / 호감 표현",
        sub_love_date: "데이트 신청 / 약속",
        sub_love_contact: "연락 문제 / 안부",
        sub_love_jealousy: "질투 / 서운함 표현",
        sub_love_conflict: "다툼 / 화해 요청",
        sub_love_breakup: "이별 / 거절 / 거리두기",
        sub_love_reunion: "재회 / 헤어진 후 연락",
  
        // 세부 상황 (Work)
        sub_work_general: "일반적인 업무",
        sub_work_interview: "면접 / 자기소개",
        sub_work_social: "회식 / 스몰토크 / 인사",
        sub_work_request: "업무 부탁 / 협조 요청",
        sub_work_refusal: "거절 / 난처함",
        sub_work_report: "보고 / 컨펌 / 피드백",
        sub_work_negotiation: "연봉 협상 / 면담",
        sub_work_leave: "휴가 / 조퇴 / 병가",
        sub_work_resignation: "퇴사 / 이직 / 작별",
  
        // 세부 상황 (Family)
        sub_family_general: "일상 대화",
        sub_family_holiday: "명절 / 새해 인사",
        sub_family_celebration: "생신 / 승진 축하",
        sub_family_health: "건강 / 안부 묻기",
        sub_family_request: "부탁 / 도움 요청",
        sub_family_allowance: "용돈 드림 / 받음",
        sub_family_conflict: "잔소리 대처 / 화해",
        sub_family_in_laws: "시댁 / 처가 / 사돈",
  
        // 세부 상황 (School)
        sub_school_general: "학교 생활",
        sub_school_professor: "교수님 / 선생님께",
        sub_school_team: "조별 과제 / 팀플",
        sub_school_roommate: "기숙사 / 룸메이트",
        sub_school_senior: "선후배 관계",
        sub_school_club: "동아리 / 학생회",
        sub_school_scholarship: "장학금 / 행정 문의",
  
        // 세부 상황 (Friend)
        sub_friend_general: "일상 수다",
        sub_friend_play: "약속 잡기 / 놀자",
        sub_friend_congrats: "결혼 / 축하 / 경조사",
        sub_friend_consolation: "위로 / 고민 상담",
        sub_friend_borrow: "돈/물건 빌리기 및 갚기",
        sub_friend_refusal: "거절 (돈/부탁/약속)",
        sub_friend_conflict: "서운함 / 싸움",
        sub_friend_make_up: "사과 / 화해",
  
        // 세부 상황 (Transaction)
        sub_transaction_used: "중고거래 (당근 등)",
        sub_transaction_reservation: "예약 / 변경 / 취소",
        sub_transaction_order: "주문 / 배달 요청",
        sub_transaction_refund: "환불 / 교환 요청",
        sub_transaction_cs_inquiry: "상품 / 서비스 문의",
  
        // 세부 상황 (Neighbor - 신규)
        sub_neighbor_greeting: "이사 인사 / 엘리베이터",
        sub_neighbor_noise: "층간소음 / 소음 항의",
        sub_neighbor_parking: "주차 문제",
        sub_neighbor_borrow: "잠시 빌리기 / 도움",
        sub_neighbor_complaint: "민원 / 건의사항",
  
        // 세부 상황 (SNS - 신규)
        sub_sns_comment: "댓글 / 답글 / 반응",
        sub_sns_dm: "DM 문의 / 협찬 제안",
        sub_sns_review_reply: "리뷰 답글 (사장님)",
        sub_sns_post: "게시물 멘트 / 캡션",
        sub_sns_admin: "커뮤니티 운영 / 공지",
  
        // 세부 상황 (Service - 신규)
        sub_service_restaurant: "식당 / 카페 주문",
        sub_service_hair_shop: "미용실 / 네일 요청",
        sub_service_hospital: "병원 증상 설명",
        sub_service_taxi: "택시 / 기사님께",
        sub_service_hotel: "호텔 / 숙소 프론트",
  
        recipientLabel: "듣는 사람 (선택)",
        recipientPlaceholder: "예: 썸녀, 부장님, 엄마",
        keywordLabel: "포함할 키워드 (선택)",
        keywordPlaceholder: "예: 미안해, 야근, 돈",
  
        politenessLabel: "높임말 선택",
        politenessAuto: "상대방에 맞춰서 (자동)",
        politenessHonorific: "존댓말 (해요/하십시오)",
        politenessInformal: "반말 (해/해라)",
  
        toneLabel: "말투 선택",
        tonePolite: "정중하게 (기본)",
        toneCasual: "부드럽게",
        toneHonest: "솔직하게",
        toneFirm: "단호하게",
        toneWitty: "재치있게",
        toneConcise: "짧고 굵게",
        toneDetailed: "구구절절하게",
        tonePolitePlus: "쿠션어 가득 (극존칭)",
        toneSupportive: "응원/우쭈쭈",
        toneCute: "애교 섞인",
        toneRobot: "AI/로봇 말투",
        toneHistorical: "사극 말투",
        toneMZ: "MZ/유행어",
  
        generateButton: "문장 생성하기",
        copyButton: "문장 복사하기",
        regenerateButton: "다시 생성하기",
        footer: "© 2026 문장 생성기",
        copySuccess: "문장이 복사되었습니다!",
        
        generating: "생성 중...",
        aiThinking: "AI가 문장을 고민하고 있습니다..."
      },
      pages: {
          index: {
              title: "상황별 맞춤 문장 생성기",
              description: "연애, 회사, 가족, 학교 등 다양한 상황에서 쓸 수 있는 문장을 생성합니다."
          }
      }
    },
    en: {
      ui: {
        siteTitle: "Sentence Generator",
        heroTitle: "Situation-Based Sentence Generator",
        heroDescription: "We create proper sentences for awkward situations instantly.",
        navHome: "Home",
        navAbout: "About",
        navContact: "Contact",
        navPrivacy: "Privacy Policy",
        
        categoryLabel: "Select Situation",
        categoryLove: "Dating / Love",
        categoryWork: "Work / Business",
        categoryFamily: "Family",
        categorySchool: "School / Academic",
        categoryFriend: "Friends",
        categoryTransaction: "Shopping / Trade",
        categoryNeighbor: "Neighbors",
        categorySNS: "Social Media / Online",
        categoryService: "Service / Stores",
  
        subCategoryLabel: "Specific Context",
        sub_love_general: "General",
        sub_love_blind_date: "Blind Date / First Meeting",
        sub_love_confession: "Confession / Flirting",
        sub_love_date: "Asking for a Date",
        sub_love_contact: "Contact Issues / Catching up",
        sub_love_jealousy: "Jealousy / Upset",
        sub_love_conflict: "Conflict / Apology",
        sub_love_breakup: "Breakup / Rejection",
        sub_love_reunion: "Reunion / Texting Ex",
  
        sub_work_general: "General Work",
        sub_work_interview: "Interview / Self-Intro",
        sub_work_social: "Socializing / Small Talk",
        sub_work_request: "Requesting Help",
        sub_work_refusal: "Refusal / Decline",
        sub_work_report: "Reporting / Feedback",
        sub_work_negotiation: "Salary Negotiation",
        sub_work_leave: "Leave / Sick Day",
        sub_work_resignation: "Resignation / Farewell",
  
        sub_family_general: "Daily Conversation",
        sub_family_holiday: "Holiday / New Year",
        sub_family_celebration: "Birthday / Promotion",
        sub_family_health: "Health Check / Regards",
        sub_family_request: "Request / Help",
        sub_family_allowance: "Allowance Issues",
        sub_family_conflict: "Nagging / Reconciliation",
        sub_family_in_laws: "In-laws",
  
        sub_school_general: "School Life",
        sub_school_professor: "To Professor/Teacher",
        sub_school_team: "Team Project",
        sub_school_roommate: "Dorm / Roommate",
        sub_school_senior: "Senior / Junior",
        sub_school_club: "Club Activities",
        sub_school_scholarship: "Scholarship / Admin",
  
        sub_friend_general: "Chit-chat",
        sub_friend_play: "Hanging Out",
        sub_friend_congrats: "Wedding / Congrats",
        sub_friend_consolation: "Consolation / Advice",
        sub_friend_borrow: "Borrowing / Lending",
        sub_friend_refusal: "Refusal (Money/Plans)",
        sub_friend_conflict: "Conflict / Upset",
        sub_friend_make_up: "Apology / Make up",
  
        sub_transaction_used: "Used Item Trade",
        sub_transaction_reservation: "Reservation / Cancel",
        sub_transaction_order: "Order / Delivery",
        sub_transaction_refund: "Refund / Exchange",
        sub_transaction_cs_inquiry: "Inquiry / CS",
  
        sub_neighbor_greeting: "Moving in / Greeting",
        sub_neighbor_noise: "Noise Complaint",
        sub_neighbor_parking: "Parking Issues",
        sub_neighbor_borrow: "Borrowing / Help",
        sub_neighbor_complaint: "Complaints",
  
        sub_sns_comment: "Comments / Replies",
        sub_sns_dm: "Direct Message (DM)",
        sub_sns_review_reply: "Reply to Review",
        sub_sns_post: "Post Caption",
        sub_sns_admin: "Admin / Announcement",
  
        sub_service_restaurant: "Restaurant / Cafe",
        sub_service_hair_shop: "Hair Salon / Nail",
        sub_service_hospital: "Hospital / Symptoms",
        sub_service_taxi: "Taxi / Driver",
        sub_service_hotel: "Hotel / Front Desk",
  
        recipientLabel: "Recipient (Optional)",
        recipientPlaceholder: "e.g., Crush, Boss, Mom",
        keywordLabel: "Keywords (Optional)",
        keywordPlaceholder: "e.g., Sorry, Late, Money",
  
        politenessLabel: "Politeness Level",
        politenessAuto: "Auto (Context-based)",
        politenessHonorific: "Formal (Polite)",
        politenessInformal: "Casual (Informal)",
  
        toneLabel: "Tone & Style",
        tonePolite: "Polite (Default)",
        toneCasual: "Soft / Casual",
        toneHonest: "Honest / Direct",
        toneFirm: "Firm / Stern",
        toneWitty: "Witty / Humorous",
        toneConcise: "Concise / Short",
        toneDetailed: "Detailed / Long",
        tonePolitePlus: "Extra Polite (Humble)",
        toneSupportive: "Supportive / Cheering",
        toneCute: "Cute / Playful",
        toneRobot: "Robot / AI Style",
        toneHistorical: "Old English / Historical",
        toneMZ: "Gen Z / Slang",
  
        generateButton: "Generate",
        copyButton: "Copy Text",
        regenerateButton: "Regenerate",
        footer: "© 2026 Sentence Generator",
        copySuccess: "Copied to clipboard!",
  
        generating: "Generating...",
        aiThinking: "AI is thinking..."
      },
      pages: {
          index: {
              title: "Situation-Based Sentence Generator",
              description: "Generate appropriate sentences for dating, work, family, and more."
          }
      }
    },
    ja: {
      ui: {
        siteTitle: "メッセージ生成AI",
        heroTitle: "シチュエーション別メッセージ生成",
        heroDescription: "気まずい状況ですぐに使える最適な文章を作成します。",
        navHome: "ホーム",
        navAbout: "紹介",
        navContact: "お問い合わせ",
        navPrivacy: "プライバシー",
  
        categoryLabel: "状況を選択",
        categoryLove: "恋愛",
        categoryWork: "仕事・職場",
        categoryFamily: "家族・親戚",
        categorySchool: "学校・学業",
        categoryFriend: "友人・知人",
        categoryTransaction: "取引・買い物",
        categoryNeighbor: "近所・ご近所",
        categorySNS: "SNS・オンライン",
        categoryService: "お店・サービス",
  
        subCategoryLabel: "詳細な状況",
        sub_love_general: "一般的",
        sub_love_blind_date: "合コン・初デート",
        sub_love_confession: "告白・好意",
        sub_love_date: "デートの誘い",
        sub_love_contact: "連絡・安否",
        sub_love_jealousy: "嫉妬・寂しさ",
        sub_love_conflict: "喧嘩・仲直り",
        sub_love_breakup: "別れ・お断り",
        sub_love_reunion: "復縁・久しぶりの連絡",
  
        sub_work_general: "一般的",
        sub_work_interview: "面接・自己紹介",
        sub_work_social: "飲み会・雑談",
        sub_work_request: "依頼・お願い",
        sub_work_refusal: "断る・辞退",
        sub_work_report: "報告・連絡",
        sub_work_negotiation: "給与交渉・面談",
        sub_work_leave: "休暇・早退",
        sub_work_resignation: "退職・転職",
  
        sub_family_general: "日常会話",
        sub_family_holiday: "祝日・年末年始",
        sub_family_celebration: "誕生日・お祝い",
        sub_family_health: "健康・安否確認",
        sub_family_request: "お願い・手伝い",
        sub_family_allowance: "お小遣い",
        sub_family_conflict: "小言・和解",
        sub_family_in_laws: "義実家",
  
        sub_school_general: "学校生活",
        sub_school_professor: "先生・教授へ",
        sub_school_team: "グループワーク",
        sub_school_roommate: "寮・ルームメイト",
        sub_school_senior: "先輩・後輩",
        sub_school_club: "サークル・部活",
        sub_school_scholarship: "奨学金・事務",
  
        sub_friend_general: "おしゃべり",
        sub_friend_play: "遊びの誘い",
        sub_friend_congrats: "結婚・お祝い",
        sub_friend_consolation: "慰め・相談",
        sub_friend_borrow: "貸し借り",
        sub_friend_refusal: "断る（金・誘い）",
        sub_friend_conflict: "喧嘩・不満",
        sub_friend_make_up: "謝罪・仲直り",
  
        sub_transaction_used: "フリマ取引",
        sub_transaction_reservation: "予約・変更・取消",
        sub_transaction_order: "注文・デリバリー",
        sub_transaction_refund: "返品・交換",
        sub_transaction_cs_inquiry: "問い合わせ",
  
        sub_neighbor_greeting: "引越し・挨拶",
        sub_neighbor_noise: "騒音トラブル",
        sub_neighbor_parking: "駐車問題",
        sub_neighbor_borrow: "貸し借り・助け",
        sub_neighbor_complaint: "苦情・要望",
  
        sub_sns_comment: "コメント・返信",
        sub_sns_dm: "DM・問い合わせ",
        sub_sns_review_reply: "レビュー返信（店側）",
        sub_sns_post: "投稿・キャプション",
        sub_sns_admin: "運営・告知",
  
        sub_service_restaurant: "飲食店・カフェ",
        sub_service_hair_shop: "美容室・ネイル",
        sub_service_hospital: "病院・症状説明",
        sub_service_taxi: "タクシー",
        sub_service_hotel: "ホテル・フロント",
  
        recipientLabel: "相手（任意）",
        recipientPlaceholder: "例：気になる人、部長、母",
        keywordLabel: "キーワード（任意）",
        keywordPlaceholder: "例：ごめん、残業、お金",
  
        politenessLabel: "言葉遣い",
        politenessAuto: "おまかせ（自動）",
        politenessHonorific: "敬語（丁寧）",
        politenessInformal: "タメ口（フレンドリー）",
  
        toneLabel: "口調・スタイル",
        tonePolite: "丁寧に（基本）",
        toneCasual: "柔らかく",
        toneHonest: "正直に",
        toneFirm: "きっぱりと",
        toneWitty: "ユーモアを交えて",
        toneConcise: "簡潔に",
        toneDetailed: "詳細に長文で",
        tonePolitePlus: "非常に丁寧に（謙譲）",
        toneSupportive: "励まし・応援",
        toneCute: "可愛らしく",
        toneRobot: "ロボット風",
        toneHistorical: "時代劇風",
        toneMZ: "流行語・若者言葉",
  
        generateButton: "作成する",
        copyButton: "コピーする",
        regenerateButton: "もう一度作成",
        footer: "© 2026 Message Generator",
        copySuccess: "コピーしました！",
  
        generating: "作成中...",
        aiThinking: "AIが最適な文章を考えています..."
      },
      pages: {
          index: {
              title: "シチュエーション別メッセージ生成",
              description: "恋愛、仕事、家族など、様々な状況に合わせた文章を自動生成します。"
          }
      }
    },
    zh: {
      ui: {
        siteTitle: "话术生成器",
        heroTitle: "场景化话术生成器",
        heroDescription: "为您立刻生成尴尬场合下恰当的回复。",
        navHome: "首页",
        navAbout: "关于",
        navContact: "联系我们",
        navPrivacy: "隐私政策",
  
        categoryLabel: "选择场景",
        categoryLove: "恋爱 / 情感",
        categoryWork: "职场 / 社交",
        categoryFamily: "家庭 / 亲戚",
        categorySchool: "校园 / 学业",
        categoryFriend: "朋友 / 熟人",
        categoryTransaction: "交易 / 消费",
        categoryNeighbor: "邻里 / 社区",
        categorySNS: "社交媒体 / 网路",
        categoryService: "商店 / 服务",
  
        subCategoryLabel: "具体情况",
        sub_love_general: "一般情况",
        sub_love_blind_date: "相亲 / 暧昧 / 初见",
        sub_love_confession: "表白 / 示好",
        sub_love_date: "邀约 / 约会",
        sub_love_contact: "联系 / 问候",
        sub_love_jealousy: "吃醋 / 表达不满",
        sub_love_conflict: "争吵 / 和解",
        sub_love_breakup: "分手 / 拒绝",
        sub_love_reunion: "复合 / 联系前任",
  
        sub_work_general: "一般工作",
        sub_work_interview: "面试 / 自我介绍",
        sub_work_social: "聚餐 / 闲聊",
        sub_work_request: "请求 / 拜托",
        sub_work_refusal: "拒绝 / 推辞",
        sub_work_report: "汇报 / 确认",
        sub_work_negotiation: "薪资谈判 / 面谈",
        sub_work_leave: "请假 / 早退",
        sub_work_resignation: "辞职 / 跳槽",
  
        sub_family_general: "日常对话",
        sub_family_holiday: "节日 / 拜年",
        sub_family_celebration: "生日 / 祝贺",
        sub_family_health: "健康 / 问候",
        sub_family_request: "请求 / 帮忙",
        sub_family_allowance: "零花钱",
        sub_family_conflict: "应对唠叨 / 和解",
        sub_family_in_laws: "婆家 / 岳家",
  
        sub_school_general: "校园生活",
        sub_school_professor: "联系老师 / 教授",
        sub_school_team: "小组作业",
        sub_school_roommate: "宿舍 / 室友",
        sub_school_senior: "前后辈关系",
        sub_school_club: "社团活动",
        sub_school_scholarship: "奖学金 / 行政",
  
        sub_friend_general: "闲聊",
        sub_friend_play: "约玩",
        sub_friend_congrats: "红白喜事 / 祝贺",
        sub_friend_consolation: "安慰 / 咨询",
        sub_friend_borrow: "借还物品 / 钱",
        sub_friend_refusal: "拒绝 (借钱/邀约)",
        sub_friend_conflict: "矛盾 / 争吵",
        sub_friend_make_up: "道歉 / 和好",
  
        sub_transaction_used: "二手交易",
        sub_transaction_reservation: "预约 / 更改 / 取消",
        sub_transaction_order: "下单 / 外卖",
        sub_transaction_refund: "退款 / 换货",
        sub_transaction_cs_inquiry: "咨询客服",
  
        sub_neighbor_greeting: "搬家 / 打招呼",
        sub_neighbor_noise: "噪音投诉",
        sub_neighbor_parking: "停车问题",
        sub_neighbor_borrow: "借东西 / 帮忙",
        sub_neighbor_complaint: "投诉 / 建议",
  
        sub_sns_comment: "评论 / 回复",
        sub_sns_dm: "私信 / 合作",
        sub_sns_review_reply: "回复评价 (商家)",
        sub_sns_post: "发帖文案",
        sub_sns_admin: "社群运营 / 公告",
  
        sub_service_restaurant: "餐厅 / 咖啡厅",
        sub_service_hair_shop: "理发 / 美甲",
        sub_service_hospital: "医院 / 描述症状",
        sub_service_taxi: "出租车 / 司机",
        sub_service_hotel: "酒店 / 前台",
  
        recipientLabel: "接收对象 (可选)",
        recipientPlaceholder: "例如：暧昧对象，部长，妈妈",
        keywordLabel: "包含关键词 (可选)",
        keywordPlaceholder: "例如：抱歉，加班，钱",
  
        politenessLabel: "语气敬意",
        politenessAuto: "自动匹配",
        politenessHonorific: "敬语 (正式)",
        politenessInformal: "平语 (随意)",
  
        toneLabel: "说话风格",
        tonePolite: "礼貌 (默认)",
        toneCasual: "温和",
        toneHonest: "坦诚",
        toneFirm: "坚决",
        toneWitty: "幽默风趣",
        toneConcise: "简短有力",
        toneDetailed: "详细说明",
        tonePolitePlus: "极度客气 (毕恭毕敬)",
        toneSupportive: "鼓励 / 安慰",
        toneCute: "可爱 / 撒娇",
        toneRobot: "机器人风格",
        toneHistorical: "古风 / 武侠",
        toneMZ: "网络流行语",
  
        generateButton: "生成回复",
        copyButton: "复制内容",
        regenerateButton: "重新生成",
        footer: "© 2026 话术生成器",
        copySuccess: "已复制到剪贴板！",
  
        generating: "生成中...",
        aiThinking: "AI正在思考最佳回复..."
      },
      pages: {
          index: {
              title: "场景化话术生成器",
              description: "自动生成适用于恋爱、职场、家庭等多种场合的回复。"
          }
      }
    }
  };

async function generateText() {
    const lang = localStorage.getItem('language') || 'ko';
    
    const category = document.getElementById("category").value;
    const subCategory = document.getElementById("sub-category").value;
    const tone = document.getElementById("tone").value;
    const recipient = document.getElementById("recipient").value;
    const keywords = document.getElementById("keyword").value;
    const politeness = document.getElementById("politeness")?.value || "auto";

    const resultBox = document.getElementById("resultBox");
    const resultText = document.getElementById("resultText");
    const generateBtn = document.getElementById("generate-btn");

    const generatingMsg = translations[lang]?.ui?.generating || "Generating...";
    const thinkingMsg = translations[lang]?.ui?.aiThinking || "AI is thinking...";

    // 1. 로딩 상태 표시 (스피너 포함)
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<div class="loading-container"><div class="spinner"></div> ${generatingMsg}</div>`;
    
    resultBox.style.display = "block";
    resultText.innerHTML = `<div class="loading-container" style="justify-content: flex-start;"><div class="spinner"></div> ${thinkingMsg}</div>`;

    try {
        const WORKER_URL = "https://usgetchat.bws96.workers.dev/"; 
        
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                category: category,
                subCategory: subCategory,
                tone: tone,
                recipient: recipient,
                keyword: keywords,
                politeness: politeness,
                lang: lang
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        
        // 3. 결과 출력
        resultText.innerText = data.result;

    } catch (error) {
        console.error("Error:", error);
        resultText.innerText = (lang === 'ko') 
            ? "오류가 발생했습니다. 잠시 후 다시 시도해주세요." 
            : "An error occurred. Please try again.";
    } finally {
        // 4. 버튼 원래대로 복구
        generateBtn.disabled = false;
        generateBtn.innerText = (translations[lang] && translations[lang].ui.generateButton) 
            ? translations[lang].ui.generateButton 
            : "문장 생성하기";
        
        // 모바일 화면 스크롤
        if (window.innerWidth < 768) {
            resultBox.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function copyText() {
  const lang = localStorage.getItem('language') || 'ko';
  const text = document.getElementById("resultText").innerText;
  
  // Use text content for copy success message
  const successMsg = (translations[lang] && translations[lang].ui.copySuccess) ? translations[lang].ui.copySuccess : "Copied!";

  navigator.clipboard.writeText(text).then(() => {
    alert(successMsg);
  });
}