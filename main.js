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

/* main.js의 const translations = { ... } 부분을 아래 내용으로 전부 덮어씌우세요 */

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
  
        // ★ 추가된 높임말 번역
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
        
        // 로딩 메시지 추가
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
        categoryTransaction: "Shopping / Trade",
        categoryFriend: "Friends",
  
        subCategoryLabel: "Specific Context",
        sub_love_general: "General",
        sub_love_confession: "Confession / Flirting",
        sub_love_conflict: "Conflict / Apology",
        sub_love_breakup: "Breakup / Rejection",
        sub_work_general: "General Work",
        sub_work_request: "Requesting Help",
        sub_work_refusal: "Refusal / Decline",
        sub_work_report: "Reporting / Confirming",
        sub_family_holiday: "Holiday / Greetings",
        sub_family_request: "Request / Allowance",
        sub_family_conflict: "Conflict / Nagging",
        sub_school_professor: "To Professor",
        sub_school_team: "Team Project",
        sub_school_senior: "Senior / Junior",
        sub_transaction_used: "Used Item Trade",
        sub_transaction_review: "Review / Complaint",
        sub_friend_congrats: "Congratulations / Condolence",
        sub_friend_refusal: "Refusal (Money/Plans)",
  
        recipientLabel: "Recipient (Optional)",
        keywordLabel: "Keywords (Optional)",
  
        // ★ English Politeness
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
        categoryTransaction: "取引・買い物",
        categoryFriend: "友人・知人",
  
        subCategoryLabel: "詳細な状況",
        sub_love_general: "一般的",
        sub_love_confession: "告白・好意",
        sub_love_conflict: "喧嘩・仲直り",
        sub_love_breakup: "別れ・お断り",
        sub_work_general: "一般的",
        sub_work_request: "依頼・お願い",
        sub_work_refusal: "断る・辞退",
        sub_work_report: "報告・連絡",
        sub_family_holiday: "祝日・挨拶",
        sub_family_request: "お願い・お小遣い",
        sub_family_conflict: "小言への対処・和解",
        sub_school_professor: "教授への連絡",
        sub_school_team: "グループワーク",
        sub_school_senior: "先輩・後輩",
        sub_transaction_used: "フリマ・中古取引",
        sub_transaction_review: "レビュー・苦情",
        sub_friend_congrats: "冠婚葬祭",
        sub_friend_refusal: "断る（金銭・約束）",
  
        recipientLabel: "相手（任意）",
        keywordLabel: "キーワード（任意）",
  
        // ★ Japanese Politeness
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
        categoryTransaction: "交易 / 消费",
        categoryFriend: "朋友 / 熟人",
  
        subCategoryLabel: "具体情况",
        sub_love_general: "一般情况",
        sub_love_confession: "表白 / 示好",
        sub_love_conflict: "争吵 / 和解",
        sub_love_breakup: "分手 / 拒绝",
        sub_work_general: "一般工作",
        sub_work_request: "请求 / 拜托",
        sub_work_refusal: "拒绝 / 推辞",
        sub_work_refusal: "汇报 / 确认",
        sub_family_holiday: "节日 / 问候",
        sub_family_request: "请求 / 要零花钱",
        sub_family_conflict: "应对唠叨 / 和解",
        sub_school_professor: "联系教授",
        sub_school_team: "小组作业",
        sub_school_senior: "前后辈关系",
        sub_transaction_used: "二手交易",
        sub_transaction_review: "评价 / 投诉",
        sub_friend_congrats: "红白喜事",
        sub_friend_refusal: "拒绝 (借钱/邀约)",
  
        recipientLabel: "接收对象 (可选)",
        keywordLabel: "包含关键词 (可选)",
  
        // ★ Chinese Politeness
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

// main.js 의 기존 generateText 함수를 아래 코드로 교체하세요.

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

    // ★ 수정된 부분: 언어별 로딩 텍스트 적용
    const generatingMsg = translations[lang]?.ui?.generating || "Generating...";
    const thinkingMsg = translations[lang]?.ui?.aiThinking || "AI is thinking...";

    // 1. 로딩 상태 표시
    generateBtn.disabled = true;
    generateBtn.innerText = generatingMsg;
    resultBox.style.display = "block";
    resultText.innerText = thinkingMsg;

    try {
        // 2. Cloudflare Worker로 요청 보내기
        // *** 중요: 아래 주소를 1단계에서 만든 본인의 Worker 주소로 꼭 바꿔주세요! ***
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
                politeness: politeness, // ★ 이 값을 서버로 보냅니다!
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
