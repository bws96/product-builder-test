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
            const languageSelector = document.getElementById('language-selector');

            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    applyTheme(newTheme);
                });
            }

            if (languageSelector) {
                languageSelector.addEventListener('change', (event) => {
                    setLanguage(event.target.value);
                });
                // Set initial value
                const savedLang = localStorage.getItem('language') || 'ko';
                languageSelector.value = savedLang;
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
            if (translation.ui[key]) {
                elem.innerText = translation.ui[key];
            }
        });
        
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
const subCategoryMap = {
    love: ['general', 'confession', 'conflict', 'breakup'],
    work: ['general', 'request', 'refusal', 'report'],
    family: ['holiday', 'request', 'conflict'],
    school: ['professor', 'team', 'senior'],
    transaction: ['used', 'review'],
    friend: ['congrats', 'refusal']
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

const translations = {
  ko: {
    ui: {
      siteTitle: "문장 생성기",
      heroTitle: "상황별 맞춤 문장 생성기",
      heroDescription: "어색한 상황에서 바로 써먹을 문장을 만들어드립니다",
      navHome: "홈",
      navAbout: "소개",
      navContact: "연락처",
      navPrivacy: "개인정보처리방침",
      
      categoryLabel: "상황 선택",
      categoryLove: "연애",
      categoryWork: "회사 / 사회생활",
      categoryFamily: "가족 / 친척",
      categorySchool: "학교 / 학업",
      categoryTransaction: "거래 / 소비",
      categoryFriend: "친구 / 지인",

      subCategoryLabel: "세부 상황",
      sub_love_general: "일반적인 상황",
      sub_love_confession: "고백 / 호감 표현",
      sub_love_conflict: "다툼 / 화해",
      sub_love_breakup: "이별 / 거절",
      sub_work_general: "일반적인 업무",
      sub_work_request: "부탁 / 요청",
      sub_work_refusal: "거절 / 난처함",
      sub_work_report: "보고 / 컨펌",
      sub_family_holiday: "명절 / 안부",
      sub_family_request: "부탁 / 용돈",
      sub_family_conflict: "잔소리 대처 / 화해",
      sub_school_professor: "교수님께 연락",
      sub_school_team: "조별 과제",
      sub_school_senior: "선후배 관계",
      sub_transaction_used: "중고거래 (당근 등)",
      sub_transaction_review: "리뷰 / 컴플레인",
      sub_friend_congrats: "경조사 (결혼/장례)",
      sub_friend_refusal: "거절 (돈/약속)",

      recipientLabel: "듣는 사람 (선택)",
      keywordLabel: "포함할 키워드 (선택)",

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
      aboutTitle: "소개",
    },
    pages: {
        index: {
            title: "상황별 맞춤 문장 생성기",
            description: "연애, 회사, 가족, 학교 등 다양한 상황에서 쓸 수 있는 문장을 생성합니다."
        }
    },
    sentences: {}
  },
  en: {
    ui: {
      siteTitle: "Sentence Generator",
      heroTitle: "Sentence Generator for Love & Work",
      heroDescription: "We create sentences you can use right away in awkward situations.",
      navHome: "Home",
      navAbout: "About",
      navContact: "Contact",
      navPrivacy: "Privacy Policy",
      categoryLabel: "Select Situation",
      categoryLove: "Love",
      categoryWork: "Work / Social Life",
      categoryFamily: "Family",
      categorySchool: "School",
      categoryTransaction: "Transaction",
      categoryFriend: "Friend",
      subCategoryLabel: "Specifics",
      sub_love_general: "General",
      sub_love_confession: "Confession",
      sub_love_conflict: "Conflict",
      sub_love_breakup: "Breakup",
      sub_work_general: "General",
      sub_work_request: "Request",
      sub_work_refusal: "Refusal",
      sub_work_report: "Report",
      sub_family_holiday: "Holiday",
      sub_family_request: "Request",
      sub_family_conflict: "Conflict",
      sub_school_professor: "Professor",
      sub_school_team: "Team Project",
      sub_school_senior: "Senior/Junior",
      sub_transaction_used: "Used Trade",
      sub_transaction_review: "Review",
      sub_friend_congrats: "Congrats",
      sub_friend_refusal: "Refusal",
      recipientLabel: "Recipient (Optional)",
      keywordLabel: "Keywords (Optional)",
      toneLabel: "Select Tone",
      tonePolite: "Polite",
      toneCasual: "Casual",
      toneHonest: "Honest",
      toneFirm: "Firm",
      toneWitty: "Witty",
      toneConcise: "Concise",
      toneDetailed: "Detailed",
      tonePolitePlus: "Extra Polite",
      toneSupportive: "Supportive",
      toneCute: "Cute",
      toneRobot: "Robot",
      toneHistorical: "Historical",
      toneMZ: "Slang/Trendy",
      generateButton: "Generate Sentence",
      copyButton: "Copy Sentence",
      regenerateButton: "Regenerate",
      footer: "© 2026 Sentence Generator",
      copySuccess: "Sentence copied!",
      aboutTitle: "About"
    },
    sentences: {}
  },
  ja: {
    ui: {
      siteTitle: "文章生成機",
      heroTitle: "恋愛・社会生活 文章生成機",
      heroDescription: "気まずい状況ですぐに使える文章を作成します。",
      navHome: "ホーム",
      navAbout: "紹介",
      navContact: "連絡先",
      navPrivacy: "プライバシーポリシー",
      categoryLabel: "状況選択",
      categoryLove: "恋愛",
      categoryWork: "会社 / 社会生活",
      categoryFamily: "家族",
      categorySchool: "学校",
      categoryTransaction: "取引",
      categoryFriend: "友達",
      subCategoryLabel: "詳細",
      recipientLabel: "受信者 (任意)",
      keywordLabel: "キーワード (任意)",
      toneLabel: "口調選択",
      tonePolite: "丁寧に",
      toneCasual: "柔らかく",
      toneHonest: "率直に",
      toneFirm: "断固として",
      toneWitty: "機知に富んだ",
      toneConcise: "簡潔に",
      toneDetailed: "詳細に",
      tonePolitePlus: "非常に丁寧に",
      toneSupportive: "協力的",
      toneCute: "可愛く",
      toneRobot: "ロボット",
      toneHistorical: "時代劇",
      toneMZ: "流行語",
      generateButton: "文章を生成する",
      copyButton: "文章をコピー",
      regenerateButton: "再生成",
      footer: "© 2026 文章生成機",
      copySuccess: "文章がコピーされました！",
      aboutTitle: "紹介"
    },
    sentences: {}
  },
  zh: {
    ui: {
      siteTitle: "语句生成器",
      heroTitle: "恋爱·职场语句生成器",
      heroDescription: "在尴尬的情况下，我们会立即为您创建可以使用的句子。",
      navHome: "首页",
      navAbout: "关于",
      navContact: "联系我们",
      navPrivacy: "隐私政策",
      categoryLabel: "选择情况",
      categoryLove: "恋爱",
      categoryWork: "公司/社交生活",
      categoryFamily: "家庭",
      categorySchool: "学校",
      categoryTransaction: "交易",
      categoryFriend: "朋友",
      subCategoryLabel: "具体情况",
      recipientLabel: "接收者 (可选)",
      keywordLabel: "关键词 (可选)",
      toneLabel: "选择语气",
      tonePolite: "郑重地",
      toneCasual: "柔和地",
      toneHonest: "坦率地",
      toneFirm: "坚决地",
      toneWitty: "风趣地",
      toneConcise: "简洁地",
      toneDetailed: "详细地",
      tonePolitePlus: "非常客气",
      toneSupportive: "支持",
      toneCute: "可爱",
      toneRobot: "机器人",
      toneHistorical: "古风",
      toneMZ: "网络用语",
      generateButton: "生成句子",
      copyButton: "复制句子",
      regenerateButton: "重新生成",
      footer: "© 2026 语句生成器",
      copySuccess: "句子已复制！",
      aboutTitle: "关于"
    },
    sentences: {}
  }
};

// main.js 의 기존 generateText 함수를 아래 코드로 교체하세요.

async function generateText() {
    const lang = localStorage.getItem('language') || 'ko';
    
    const category = document.getElementById("category").value;
    const subCategory = document.getElementById("sub-category").value;
    const tone = document.getElementById("tone").value;
    const recipient = document.getElementById("recipient").value;
    const keywords = document.getElementById("keyword").value;

    const resultBox = document.getElementById("resultBox");
    const resultText = document.getElementById("resultText");
    const generateBtn = document.getElementById("generate-btn");

    // 1. 로딩 상태 표시 (AI가 생각하는 동안)
    generateBtn.disabled = true;
    generateBtn.innerText = (lang === 'ko') ? "생성 중..." : "Generating...";
    resultBox.style.display = "block";
    resultText.innerText = (lang === 'ko') ? "AI가 문장을 고민하고 있습니다..." : "AI is thinking...";

    try {
        // 2. Cloudflare Worker로 요청 보내기
        // *** 중요: 아래 주소를 1단계에서 만든 본인의 Worker 주소로 꼭 바꿔주세요! ***
        const WORKER_URL = "https://usgetchat.bws96.workers.dev/"; 
        
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                category: category,
                subCategory: subCategory,
                tone: tone,
                recipient: recipient,
                keyword: keywords,
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
