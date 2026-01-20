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
        recipientPlaceholder: "예: 엄마, 김대리님, 교수님",
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
        aiThinking: "AI가 문장을 고민하고 있습니다"
      },
      pages: {
          index: {
              title: "상황별 맞춤 문장 생성기",
              description: "연애, 회사, 가족, 학교 등 다양한 상황에서 쓸 수 있는 문장을 생성합니다."
          },
          about: {
            title: "소개 - 상황별 문장 생성기",
            description: "프로젝트 소개 및 비전",
            aboutTitle: "소개",
            aboutSubTitle1: "우리의 미션",
            aboutMission: "'상황별 문장 생성기'는 디지털 시대의 소통을 더 쉽고 따뜻하게 만드는 것을 목표로 합니다. 중요한 순간, 적절한 단어가 떠오르지 않아 고민했던 경험은 누구에게나 있습니다. 우리는 AI 기술을 활용하여 이러한 고민을 해결하고, 사람과 사람 사이의 관계를 더욱 부드럽게 이어주는 다리가 되고자 합니다. 단순한 텍스트 생성을 넘어, 상황의 맥락과 감정선까지 고려한 최적의 표현을 제안함으로써 사용자 여러분의 소중한 의사소통을 지원합니다.",
            aboutSubTitle2: "주요 기능 및 특징",
            aboutOffer: "본 서비스는 연애, 비즈니스, 가족 관계 등 일상 속 다양한 상황에 특화된 문장을 실시간으로 생성합니다. <br><br>1. <strong>다양한 페르소나:</strong> 정중한 비즈니스 화법부터 친근한 MZ 말투, 사극 말투까지 상황에 맞는 톤 앤 매너를 선택할 수 있습니다.<br>2. <strong>맞춤형 옵션:</strong> 상대방(청자)을 지정하고 포함하고 싶은 핵심 키워드를 입력하면, 더욱 정교하고 개인화된 문장이 완성됩니다.<br>3. <strong>실시간 AI 엔진:</strong> 정해진 템플릿을 무작위로 보여주는 것이 아니라, 최신 AI 모델이 입력된 조건을 분석하여 매번 새로운 문장을 창작합니다.",
            aboutSubTitle3: "개발자 이야기",
            aboutDeveloper: "이 프로젝트는 '기술로 사람들의 마음을 잇는다'는 비전을 가진 1인 개발자에 의해 운영되고 있습니다. 사용자의 피드백 하나하나가 서비스 발전의 큰 원동력이 됩니다. 앞으로도 지속적인 업데이트를 통해 더 많은 상황과 감정을 아우르는 서비스로 성장해 나가겠습니다."
          },
          contact: {
            title: "연락처 - 상황별 문장 생성기",
            description: "문의 및 제안",
            contactTitle: "연락처",
            contactSubTitle: "문의 및 피드백",
            contactDescription: "서비스 이용 중 불편한 점이나 개선 아이디어, 혹은 재미있는 제안이 있으신가요? 여러분의 목소리는 언제나 환영입니다. 보내주신 의견은 꼼꼼히 검토하여 서비스에 반영하도록 노력하겠습니다.",
            contactEmail: "아래 이메일로 연락주시면 확인 후 신속하게 답변 드리겠습니다.",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "개인정보처리방침 - 상황별 문장 생성기",
            description: "개인정보 수집 및 이용 안내",
            privacyTitle: "개인정보처리방침",
            privacyIntro: "'문장 생성기'(이하 '서비스')는 사용자의 개인정보 보호를 최우선으로 여기며, '정보통신망 이용촉진 및 정보보호 등에 관한 법률' 등 관련 법령을 준수합니다. 본 방침은 사용자의 소중한 정보가 어떻게 취급되는지 투명하게 공개하기 위해 작성되었습니다.",
            privacySubTitle1: "1. 수집하는 개인정보 항목 및 방법",
            privacyItem1: "본 서비스는 별도의 회원가입 없이 이용 가능하며, 서비스 제공을 위해 최소한의 정보만을 수집합니다.<br><br><strong>[자동 수집 정보]</strong><br>- 쿠키(Cookie), 서비스 이용 기록, 접속 로그, IP 주소, 기기 정보(브라우저 종류 및 OS 버전 등)<br>- Google Analytics, Microsoft Clarity 등의 분석 도구를 통해 익명화된 이용 행태 정보가 수집될 수 있습니다.<br><br><strong>[사용자 입력 정보]</strong><br>- 문장 생성을 위해 입력한 '대상(듣는 사람)', '키워드', '상황 설정' 등의 데이터는 AI 모델 처리를 위해 일시적으로 전송되나, 서버에 영구 저장되지 않고 휘발됩니다.",
            privacyItem1_2: "<strong>[로컬 저장소]</strong><br>- 사용자의 편의를 위해 설정한 '테마(다크모드 여부)' 및 '언어' 설정은 브라우저의 localStorage에 저장되며, 이는 서버로 전송되지 않고 사용자의 기기에만 남습니다.",
            privacySubTitle2: "2. 개인정보의 이용 목적",
            privacyPurpose: "수집된 정보는 다음의 목적을 위해서만 이용됩니다.<br>- AI 문장 생성 서비스 제공 및 품질 향상<br>- 접속 빈도 파악 및 서비스 이용 통계 분석<br>- Google AdSense를 통한 광고 게재 (쿠키 기반 맞춤형 광고 포함)<br>- 서비스 오류 수정 및 보안 강화",
            privacySubTitle3: "3. 개인정보의 제3자 제공 및 위탁",
            privacyRetention: "서비스는 원칙적으로 사용자의 개인정보를 외부에 제공하지 않습니다. 다만, 통계 분석 및 광고 게재를 위해 다음과 같은 외부 전문 업체의 도구를 사용하고 있습니다.<br>- <strong>Google LLC:</strong> Google Analytics (웹사이트 방문 분석), Google AdSense (광고 게재)<br>- <strong>Microsoft:</strong> Microsoft Clarity (사용자 경험 분석)<br><br>이러한 도구들은 익명화된 정보를 수집하며, 사용자는 브라우저 설정을 통해 쿠키 수집을 거부할 수 있습니다.",
            privacySubTitle4: "4. 개인정보의 파기 절차 및 방법",
            privacyChanges: "사용자의 개인정보는 수집 및 이용 목적이 달성된 후에는 지체 없이 파기하는 것을 원칙으로 합니다. 전자적 파일 형태로 저장된 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.",
            privacyEffectiveDate: "시행일자: 2026년 1월 20일"
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
        recipientPlaceholder: "e.g., Mom, Boss, Professor",
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
        aiThinking: "AI is thinking"
      },
      pages: {
          index: {
              title: "Situation-Based Sentence Generator",
              description: "Generate appropriate sentences for dating, work, family, and more."
          },
          about: {
            title: "About - Sentence Generator",
            description: "Mission and Vision of the Project",
            aboutTitle: "About Us",
            aboutSubTitle1: "Our Mission",
            aboutMission: "The 'Situation-Based Sentence Generator' aims to make digital communication easier and warmer. Everyone has experienced the struggle of finding the right words at crucial moments. We leverage AI technology to solve these dilemmas and bridge the gap between people. Beyond simple text generation, we support your valuable communication by suggesting optimal expressions considering the context and emotional tone.",
            aboutSubTitle2: "Features",
            aboutOffer: "Our service generates sentences tailored to various daily situations such as dating, business, and family relationships in real-time. <br><br>1. <strong>Diverse Personas:</strong> Choose from various tones ranging from formal business polite to friendly casual, or even historical styles.<br>2. <strong>Custom Options:</strong> Specify the recipient and include key keywords to create more sophisticated and personalized sentences.<br>3. <strong>Real-time AI Engine:</strong> Instead of random fixed templates, our latest AI engine creates new sentences every time based on your input.",
            aboutSubTitle3: "Developer Story",
            aboutDeveloper: "This project is run by a solo developer with a vision to 'connect people's hearts through technology.' Every piece of user feedback drives the improvement of this service. We commit to continuous updates to cover more situations and emotions."
          },
          contact: {
            title: "Contact - Sentence Generator",
            description: "Inquiries and Feedback",
            contactTitle: "Contact",
            contactSubTitle: "Inquiries & Feedback",
            contactDescription: "Do you have any inconveniences, improvement ideas, or fun suggestions while using the service? Your voice is always welcome. We will carefully review your feedback and strive to reflect it in the service.",
            contactEmail: "Please contact us at the email below for a prompt response.",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "Privacy Policy - Sentence Generator",
            description: "Privacy Policy and Data Usage",
            privacyTitle: "Privacy Policy",
            privacyIntro: "The 'Sentence Generator' (hereinafter 'Service') prioritizes the protection of user personal information and complies with relevant laws. This policy is written to transparently disclose how your valuable information is handled.",
            privacySubTitle1: "1. Information Collection",
            privacyItem1: "This Service is available without registration and collects minimal information for service provision.<br><br><strong>[Automatically Collected]</strong><br>- Cookies, usage records, access logs, IP address, device info.<br>- Anonymous usage behavior data via tools like Google Analytics and Microsoft Clarity.<br><br><strong>[User Input]</strong><br>- Data such as 'Recipient', 'Keywords', and 'Situation' entered for sentence generation are transmitted temporarily for AI processing but are NOT permanently stored on the server.",
            privacyItem1_2: "<strong>[Local Storage]</strong><br>- 'Theme' and 'Language' settings are stored in your browser's localStorage for convenience and are not sent to the server.",
            privacySubTitle2: "2. Purpose of Use",
            privacyPurpose: "Collected information is used solely for:<br>- AI sentence generation and quality improvement<br>- Analyzing usage statistics<br>- Providing customized ads via Google AdSense<br>- Fixing errors and enhancing security",
            privacySubTitle3: "3. Third-Party Provision",
            privacyRetention: "We do not share personal information externally, except for statistical analysis and ad serving via:<br>- <strong>Google LLC:</strong> Analytics, AdSense<br>- <strong>Microsoft:</strong> Clarity<br><br>Users can refuse cookie collection via browser settings.",
            privacySubTitle4: "4. Data Destruction",
            privacyChanges: "Personal information is destroyed without delay once the purpose of collection and use is achieved.",
            privacyEffectiveDate: "Effective Date: January 20, 2026"
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
        recipientPlaceholder: "例：お母さん、部長、先生",
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
        aiThinking: "AIが最適な文章を考えています"
      },
      pages: {
          index: {
              title: "シチュエーション別メッセージ生成",
              description: "恋愛、仕事、家族など、様々な状況に合わせた文章を自動生成します。"
          },
          about: {
            title: "紹介 - メッセージ生成AI",
            description: "プロジェクトのミッションとビジョン",
            aboutTitle: "紹介",
            aboutSubTitle1: "私たちのミッション",
            aboutMission: "「シチュエーション別メッセージ生成AI」は、デジタル時代のコミュニケーションをより簡単で温かいものにすることを目指しています。重要な瞬間に適切な言葉が見つからず悩んだ経験は誰にでもあります。私たちはAI技術を活用してその悩みを解決し、人と人との関係をより円滑にする架け橋となりたいと考えています。",
            aboutSubTitle2: "主な機能と特徴",
            aboutOffer: "本サービスは、恋愛、ビジネス、家族関係など、日常の様々な状況に特化した文章をリアルタイムで生成します。<br><br>1. <strong>多様なペルソナ:</strong> 丁寧なビジネス用語から親しみやすい口調、時代劇風まで、状況に合ったトーン＆マナーを選択できます。<br>2. <strong>カスタマイズ:</strong> 相手（聞き手）を指定し、含めたいキーワードを入力することで、より精巧でパーソナライズされた文章が完成します。<br>3. <strong>リアルタイムAIエンジン:</strong> 定型文をランダムに表示するのではなく、最新のAIモデルが入力条件を分析し、毎回新しい文章を創作します。",
            aboutSubTitle3: "開発者について",
            aboutDeveloper: "このプロジェクトは「技術で人々の心をつなぐ」というビジョンを持つ個人の開発者によって運営されています。ユーザーの皆様のフィードバックがサービス発展の大きな原動力となります。今後も継続的なアップデートを通じて、より多くの状況と感情をカバーするサービスへと成長させていきます。"
          },
          contact: {
            title: "お問い合わせ - メッセージ生成AI",
            description: "フィードバックと提案",
            contactTitle: "お問い合わせ",
            contactSubTitle: "フィードバック・提案",
            contactDescription: "サービス利用中に不便な点や改善のアイデア、あるいは面白い提案はありますか？皆様の声はいつでも歓迎します。お送りいただいたご意見は慎重に検討し、サービスに反映できるよう努めます。",
            contactEmail: "以下のメールアドレスにご連絡いただければ、確認後迅速に回答いたします。",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "プライバシーポリシー - メッセージ生成AI",
            description: "個人情報の収集と利用について",
            privacyTitle: "プライバシーポリシー",
            privacyIntro: "「メッセージ生成AI」（以下「本サービス」）は、ユーザーの個人情報保護を最優先に考え、関連法令を遵守します。本方針は、ユーザーの大切な情報がどのように扱われるかを透明に公開するために作成されました。",
            privacySubTitle1: "1. 収集する個人情報項目",
            privacyItem1: "本サービスは会員登録なしで利用可能であり、サービス提供のために最小限の情報のみを収集します。<br><br><strong>[自動収集情報]</strong><br>- クッキー(Cookie)、利用記録、アクセスログ、IPアドレス、端末情報。<br>- Google AnalyticsやMicrosoft Clarity等の分析ツールを通じて匿名化された利用行動情報が収集される場合があります。<br><br><strong>[ユーザー入力情報]</strong><br>- 文章生成のために入力された「相手」、「キーワード」、「状況設定」などのデータは、AI処理のために一時的に送信されますが、サーバーに永久保存されることはありません。",
            privacyItem1_2: "<strong>[ローカルストレージ]</strong><br>- 「テーマ設定」および「言語設定」はブラウザのlocalStorageに保存され、サーバーには送信されません。",
            privacySubTitle2: "2. 利用目的",
            privacyPurpose: "収集された情報は以下の目的でのみ使用されます。<br>- AI文章生成サービスの提供および品質向上<br>- 利用統計の分析<br>- Google AdSenseを通じた広告配信<br>- サービスのエラー修正およびセキュリティ強化",
            privacySubTitle3: "3. 第三者への提供",
            privacyRetention: "統計分析および広告配信のために以下の外部ツールを使用する場合を除き、個人情報を外部に提供しません。<br>- <strong>Google:</strong> Analytics, AdSense<br>- <strong>Microsoft:</strong> Clarity<br><br>ユーザーはブラウザの設定でクッキーの収集を拒否できます。",
            privacySubTitle4: "4. 個人情報の破棄",
            privacyChanges: "個人情報は、収集および利用目的が達成された後は遅滞なく破棄することを原則とします。",
            privacyEffectiveDate: "施行日: 2026年1月20日"
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
        recipientPlaceholder: "例如：妈妈，金经理，教授",
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
        aiThinking: "AI正在思考最佳回复"
      },
      pages: {
          index: {
              title: "场景化话术生成器",
              description: "自动生成适用于恋爱、职场、家庭等多种场合的回复。"
          },
          about: {
            title: "关于 - 话术生成器",
            description: "项目介绍与愿景",
            aboutTitle: "关于我们",
            aboutSubTitle1: "我们的使命",
            aboutMission: "“场景化话术生成器”旨在让数字时代的沟通变得更简单、更温暖。每个人都有在关键时刻找不到合适措辞的经历。我们利用AI技术来解决这些困扰，成为连接人与人之间关系的桥梁。除了简单的文本生成，我们还通过建议考虑上下文和情感基调的最佳表达方式，来支持您宝贵的沟通。",
            aboutSubTitle2: "功能特色",
            aboutOffer: "本服务实时生成针对恋爱、商务、家庭关系等日常各种情况的话术。<br><br>1. <strong>多样化角色:</strong> 从正式的商务语气到亲切的日常用语，甚至古风，您可以选择适合情况的语调。<br>2. <strong>个性化定制:</strong> 指定接收对象并包含关键词，即可生成更精致、更个性化的句子。<br>3. <strong>实时AI引擎:</strong> 并非随机显示固定模板，而是由最新的AI引擎根据您输入的条件每次创作新的句子。",
            aboutSubTitle3: "开发者故事",
            aboutDeveloper: "该项目由一位怀揣“用技术连接人心”愿景的独立开发者运营。用户的每一个反馈都是服务发展的巨大动力。我们将持续更新，努力成长为涵盖更多场景和情感的服务。"
          },
          contact: {
            title: "联系我们 - 话术生成器",
            description: "咨询与反馈",
            contactTitle: "联系我们",
            contactSubTitle: "咨询与反馈",
            contactDescription: "在使用服务过程中有任何不便、改进想法或有趣的建议吗？我们随时欢迎您的声音。我们将仔细审查您的反馈，并努力将其反映在服务中。",
            contactEmail: "请通过以下电子邮件联系我们，我们将尽快答复。",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "隐私政策 - 话术生成器",
            description: "个人信息收集与使用",
            privacyTitle: "隐私政策",
            privacyIntro: "“话术生成器”（以下简称“服务”）将保护用户的个人信息放在首位，并遵守相关法律法规。本政策旨在透明地公开您的宝贵信息是如何被处理的。",
            privacySubTitle1: "1. 信息收集",
            privacyItem1: "本服务无需注册即可使用，仅收集最少的信息以提供服务。<br><br><strong>[自动收集]</strong><br>- Cookie、使用记录、访问日志、IP地址、设备信息。<br>- 通过Google Analytics和Microsoft Clarity等工具收集匿名的使用行为信息。<br><br><strong>[用户输入]</strong><br>- 为生成句子而输入的“接收对象”、“关键词”、“场景设置”等数据会暂时传输以进行AI处理，但不会永久存储在服务器上。",
            privacyItem1_2: "<strong>[本地存储]</strong><br>- “主题”和“语言”设置存储在您浏览器的localStorage中，不会发送到服务器。",
            privacySubTitle2: "2. 使用目的",
            privacyPurpose: "收集的信息仅用于：<br>- 提供AI句子生成服务并提高质量<br>- 分析使用统计<br>- 通过Google AdSense投放广告<br>- 修复错误并加强安全性",
            privacySubTitle3: "3. 第三方提供",
            privacyRetention: "除用于统计分析和广告投放外，我们不向外部提供个人信息。<br>- <strong>Google:</strong> Analytics, AdSense<br>- <strong>Microsoft:</strong> Clarity<br><br>用户可以通过浏览器设置拒绝Cookie收集。",
            privacySubTitle4: "4. 数据销毁",
            privacyChanges: "个人信息在达到收集和使用目的后，原则上将立即销毁。",
            privacyEffectiveDate: "生效日期：2026年1月20日"
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