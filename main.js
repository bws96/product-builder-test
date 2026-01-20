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
    sentences: {
        love: {
            general: {
                polite: [ "갑작스럽게 연락드려서 놀라셨을 수도 있을 것 같아요.", "천천히 알아가고 싶은 마음이 있어서 용기 내어 말씀드려요." ],
                casual: [ "요즘 자꾸 생각나서 그냥 한 번 연락해봤어.", "괜히 설레서 먼저 메시지 보내게 됐어." ],
                honest: [ "좋아하는 마음이 있어서 숨기고 싶지 않았어.", "계속 혼자 고민하다가 이렇게 말해." ]
            },
            confession: {
                polite: ["혹시 실례가 안 된다면, 이번 주말에 식사라도 한번 대접하고 싶습니다.", "조심스럽지만, 제 마음을 전하고 싶어 연락드렸습니다."],
                casual: ["나 너랑 더 친해지고 싶어. 우리 만나볼래?", "솔직히 말해서 처음 봤을 때부터 마음에 들었어."],
                cute: ["나랑 밥 먹으러 갈래? 응? 응?", "너랑 노는 게 제일 재밌어!"]
            },
            conflict: {
                polite: ["제가 생각이 짧았던 것 같습니다. 진심으로 사과드립니다.", "서로 오해가 있었던 것 같은데, 대화로 풀고 싶습니다."],
                honest: ["나는 이 부분이 서운했어. 너는 어떻게 생각했는지 궁금해."],
                firm: ["이 문제는 확실히 짚고 넘어가야 할 것 같아."]
            }
        },
        work: {
            general: {
                polite: ["말씀해주신 부분 충분히 이해하고 있습니다.", "확인해보니 해당 부분에 대해 몇 가지 고려할 점이 있는 것 같습니다."],
                casual: ["말씀 주신 내용 한번 더 정리해서 공유드릴게요.", "이 부분은 조금만 조정하면 더 좋을 것 같아요."]
            },
            request: {
                polite: ["바쁘시겠지만, 잠시 시간 내주시면 감사하겠습니다.", "번거로우시겠지만, 해당 자료 확인 부탁드립니다."],
                polite_plus: ["정말 죄송하지만, 혹시 가능하시다면 이 부분 검토를 부탁드려도 될까요?", "바쁘신 와중에 염치없지만 도움을 청합니다."],
                concise: ["금일 중 확인 부탁드립니다.", "자료 송부드립니다. 검토 바랍니다."]
            },
            refusal: {
                polite: ["제안 주신 내용은 감사하나, 현재 일정상 진행이 어려울 것 같습니다.", "내부 논의 결과, 이번에는 함께하기 어려울 것 같습니다."],
                firm: ["해당 요청은 수용하기 어렵습니다.", "원칙상 불가능한 사항입니다."],
                detailed: ["제안해주신 A안은 훌륭합니다만, 현재 저희 팀의 리소스 부족과 B프로젝트의 우선순위로 인해 부득이하게 참여가 어렵습니다."]
            }
        },
        family: {
            holiday: {
                polite: ["어머니, 아버지, 올 한 해도 건강하시고 새해 복 많이 받으세요.", "찾아뵙지 못해 죄송합니다. 마음만은 항상 곁에 있습니다."],
                casual: ["엄마 아빠! 추석 잘 보내고 맛있는 거 많이 드세요~", "새해 복 많이 받아! 올 한 해도 건강하자!"],
                mz: ["즐추! 용돈은 계좌로 쏴주심 감삼다~", "새해 복 마니 받으세여!"]
            },
            request: {
                polite: ["어머니, 혹시 이번 주말에 아이들을 잠시 봐주실 수 있으실까요?", "죄송하지만 급한 사정이 생겨 금전적인 도움을 부탁드려도 될까요?"],
                cute: ["엄마~ 나 이번달만 좀 도와주라 ㅠㅠ 알라뷰!", "아빠! 나 사고 싶은 거 있는데... 헤헤"]
            },
            conflict: {
                polite: ["걱정해주시는 마음은 알겠지만, 저를 믿고 지켜봐 주셨으면 좋겠습니다.", "어제는 제가 감정적이었던 것 같아요. 죄송합니다."],
                firm: ["제 인생은 제가 결정하고 싶습니다. 강요하지 말아주세요.", "이 이야기는 그만했으면 좋겠습니다."]
            }
        },
        school: {
            professor: {
                polite: ["교수님, 안녕하세요. OO학번 OOO입니다. 성적 관련하여 문의드릴 것이 있어 메일 드립니다.", "교수님, 수업 시간에 언급하신 내용에 대해 추가로 여쭙고 싶습니다."],
                polite_plus: ["존경하는 교수님, 바쁘신 와중에 메일 드려 죄송합니다. 다름이 아니오라...", "교수님, 평소 교수님의 강의를 감명 깊게 듣고 있는 학생입니다."]
            },
            team: {
                polite: ["다들 바쁘시겠지만, 회의 시간 정해서 공유 부탁드립니다.", "자료 조사는 제가 맡아서 하겠습니다."],
                firm: ["무임승차는 곤란합니다. 맡은 역할은 기한 내에 해주시길 바랍니다.", "참여하지 않으시면 이름 뺄 수밖에 없습니다."],
                casual: ["우리 이번 과제 빡세게 해서 A+ 받자!", "내가 PPT 만들게, 자료만 좀 잘 찾아줘."]
            }
        },
        transaction: {
            used: {
                polite: ["안녕하세요, 당근 보고 연락드렸습니다. 물건 아직 있나요?", "죄송하지만 가격 네고는 어려울 것 같습니다."],
                concise: ["구매 원합니다.", "팔렸나요?", "네고 불가."],
                firm: ["무리한 네고 요구는 사양합니다.", "약속 시간 꼭 지켜주세요."]
            },
            review: {
                polite: ["음식이 정말 맛있었습니다. 다음에 또 주문할게요.", "배송이 조금 늦었지만 상품은 만족합니다."],
                firm: ["음식 상태가 좋지 않습니다. 환불 요청합니다.", "약속된 서비스와 다릅니다. 조치 바랍니다."],
                witty: ["사장님, 여기에 꿀 바르셨나요? 너무 맛있어서 기절...", "배달 속도 무엇? 빛의 속도인 줄 알았습니다."]
            }
        },
        friend: {
            congrats: {
                casual: ["결혼 진짜 축하해! 꽃길만 걷자!", "생일 축하해! 맛있는 거 많이 먹고 행복한 하루 보내~"],
                witty: ["너가 결혼을 하다니... 지구 멸망의 징조인가? ㅋㅋ 축하해!", "생일 축하! 나이는 숫자에 불과한 거 알지? (근데 좀 많긴 하다 ㅋ)"],
                supportive: ["힘든 일 있더라도 넌 잘 이겨낼 거야. 결혼 축하해.", "항상 널 응원해. 태어나줘서 고마워."]
            },
            refusal: {
                polite: ["마음은 고마운데, 내가 요즘 사정이 좀 있어서 어려울 것 같아.", "그 날은 선약이 있어서 가기 힘들 것 같아. 미안해."],
                firm: ["돈 거래는 안 하는 게 내 원칙이야. 미안.", "다단계나 보험 권유는 정중히 사양할게."],
                casual: ["아 미안, 그날 안됨 ㅠ", "돈 없어... 나도 빌려줘..."]
            }
        }
    }
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
    sentences: {
         // Placeholder for English
         love: { general: { polite: ["I'd like to get to know you better."] } }
    }
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

function generateText() {
    const lang = localStorage.getItem('language') || 'ko';
    
    const category = document.getElementById("category").value;
    const subCategory = document.getElementById("sub-category").value;
    const tone = document.getElementById("tone").value;
    const recipient = document.getElementById("recipient").value;
    const keywords = document.getElementById("keyword").value;

    // Fallback logic
    let list = [];
    
    // Try to find specific path: category -> subCategory -> tone
    try {
        if (translations[lang].sentences[category] && 
            translations[lang].sentences[category][subCategory] && 
            translations[lang].sentences[category][subCategory][tone]) {
            list = translations[lang].sentences[category][subCategory][tone];
        } 
        // Fallback to 'general' subcategory if specific not found
        else if (translations[lang].sentences[category] && 
                 translations[lang].sentences[category]['general'] && 
                 translations[lang].sentences[category]['general'][tone]) {
            list = translations[lang].sentences[category]['general'][tone];
        }
        // Fallback: Try to find ANY sentences in this category
        else if (translations[lang].sentences[category]) {
            // Flatten all sentences in this category
            Object.values(translations[lang].sentences[category]).forEach(sub => {
                if (sub[tone]) list = list.concat(sub[tone]);
                else if (sub['polite']) list = list.concat(sub['polite']); // super fallback
            });
        }
    } catch (e) {
        console.error("Error finding sentences", e);
    }

    if (list.length === 0) {
        // Generic fallback messages if nothing found
        if (lang === 'ko') {
            list = ["해당 상황에 맞는 문장을 준비 중입니다."];
        } else if (lang === 'ja') {
            list = ["この状況の文章はまだ準備中です。"];
        } else if (lang === 'zh') {
            list = ["这句话还没有准备好。"];
        } else {
            list = ["Sentence not available yet."];
        }
    }

    let randomText = list[Math.floor(Math.random() * list.length)];

    // Process Recipient
    if (recipient) {
        // Simple prepending for now as Korean grammar is complex
        // Ideally: "OO님,"
        if (lang === 'ko') {
            randomText = `${recipient}님, ${randomText}`;
        } else {
            randomText = `${recipient}, ${randomText}`;
        }
    }

    // Process Keywords
    if (keywords) {
        if (lang === 'ko') {
            randomText += `\n\n(참고 키워드: ${keywords})`;
        } else if (lang === 'ja') {
            randomText += `\n\n(キーワード: ${keywords})`;
        } else if (lang === 'zh') {
             randomText += `\n\n(关键词: ${keywords})`;
        } else {
            randomText += `\n\n(Keywords: ${keywords})`;
        }
    }

    const resultBox = document.getElementById("resultBox");
    const resultText = document.getElementById("resultText");
    
    resultText.innerText = randomText;
    resultBox.style.display = "block";
    
    // Scroll to result on mobile
    if (window.innerWidth < 768) {
        resultBox.scrollIntoView({ behavior: 'smooth' });
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
