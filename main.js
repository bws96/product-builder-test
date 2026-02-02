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
                    if (languageMenu) languageMenu.classList.remove('active');
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
                if (translationText.includes('<')) {
                    elem.innerHTML = translationText;
                } else {
                    elem.innerText = translationText;
                }
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
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.setAttribute('content', pageTranslations.description);
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

    // Load saved language or detect automatically
    let savedLang = localStorage.getItem('language');
    
    if (!savedLang) {
        // First time visitor: Detect browser language
        const browserLang = navigator.language.toLowerCase();
        
        if (browserLang.startsWith('ko')) {
            savedLang = 'ko';
        } else if (browserLang.startsWith('ja')) {
            savedLang = 'ja';
        } else if (browserLang.startsWith('zh')) {
            savedLang = 'zh';
        } else {
            savedLang = 'en'; // Default for other countries
        }
        localStorage.setItem('language', savedLang);
    }
    
    setLanguage(savedLang);

    // Initial sub-category population
    updateSubCategories();
});

// Map of Category -> Sub-categories keys
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
        const i18nKey = `sub_${selectedCategory}_${subKey}`;
        option.innerText = (translations[lang] && translations[lang].ui[i18nKey]) ? translations[lang].ui[i18nKey] : subKey;
        subCategorySelect.appendChild(option);
    });
}

const translations = {
    ko: {
      ui: {
        siteTitle: "문장 생성기",
        heroTitle: "상황별 맞춤 문장 생성기",
        heroDescription: "어떠한 상황에서도 바로 쓸 수 있는 문장을 만들어드립니다!",
        navHome: "홈",
        navTips: "소개 및 가이드",
        navAbout: "소개",
        navContact: "연락처",
        navPrivacy: "개인정보처리방침",
        infoTitle1: "왜 상황별 맞춤 문장이 필요한가요?",
        infoDesc1: "현대 사회에서 비대면 소통(카톡, DM, 메일)의 비중이 높아지면서, 적절한 단어 선택 하나가 관계의 성패를 결정짓기도 합니다. '상황별 맞춤 문장 생성기'는 단순한 텍스트 전달을 넘어, 상대방과의 심리적 거리와 상황의 맥락과 감정선까지 고려한 최적의 표현을 제안함으로써 사용자 여러분의 소중한 의사소통을 지원합니다.",
        tipTitle1: "💡 소통의 핵심 원칙",
        tipSub1: "말투 하나가 관계를 바꿉니다. 저희 서비스는 다음과 같은 심리학적 원칙을 바탕으로 문장을 제안합니다.",
        tip1: "<strong>역지사지:</strong> 상대방의 입장에서 문장을 다시 한번 읽어보세요.",
        tip2: "<strong>톤 앤 매너:</strong> 상황에 맞는 말투(정중함, 친근함 등) 설정이 중요합니다.",
        tip3: "<strong>명확한 의도:</strong> 돌려 말하기보다는 핵심을 예의 바르게 전달하세요.",
        howToUseTitle: "📝 생성기 200% 활용하기",
        howToUseDesc: "단순한 문장 생성을 넘어, 상황에 딱 맞는 결과를 얻는 팁을 알려드립니다.",
        howToUse1: "<strong>키워드는 구체적으로:</strong> '미안해'보다는 '늦어서 미안해'처럼 구체적인 상황을 키워드로 넣으면 더 자연스러운 문장이 나옵니다.",
        howToUse2: "<strong>상대방 호칭 입력:</strong> '김대리님', '자기야' 등 평소 부르는 호칭을 입력하면 AI가 문맥을 더 잘 파악합니다.",
        howToUse3: "<strong>여러 말투 시도해보기:</strong> 같은 상황이라도 '재치있게'와 '진지하게'의 결과는 전혀 다릅니다. 관계의 깊이에 따라 다양한 톤을 실험해보세요.",
        faqTitle: "❓ 자주 묻는 질문 (FAQ)",
        faqQ1: "Q: AI가 만든 문장을 그대로 써도 되나요?",
        faqA1: "A: 네, 하지만 입력하신 '듣는 사람'과 '키워드'를 바탕으로 생성되므로, 마지막에 자신의 진심을 한 스푼 더하는 것을 권장합니다.",
        faqQ2: "Q: 어떤 상황에서 가장 효과적인가요?",
        faqA2: "A: 거절하기 어려운 부탁을 받았을 때나, 서운함을 표현해야 하는 미묘한 관계에서 특히 빛을 발합니다.",
        faqQ3: "Q: 다국어 지원은 어떻게 활용하나요?",
        faqA3: "A: 외국인 친구나 비즈니스 파트너에게 메신저를 보낼 때, 각 언어별 뉘앙스에 맞는 정중한 표현을 얻을 수 있습니다.",
        infoTitle2: "비즈니스와 일상, 모두를 위한 대화 가이드",
        infoDesc2: "상황별 맞춤 문장 생성기는 13가지 이상의 다양한 말투와 50개 이상의 세부 상황을 지원합니다. 직장 상사에게 보고할 때의 정중함, 친구에게 서운함을 전할 때의 부드러움, 거래처와의 단호한 협상 등 당신이 처한 모든 순간에 가장 적절한 '첫 마디'를 찾아드립니다.",
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
        sub_work_general: "일반적인 업무",
        sub_work_interview: "면접 / 자기소개",
        sub_work_social: "회식 / 스몰토크 / 인사",
        sub_work_request: "업무 부탁 / 협조 요청",
        sub_work_refusal: "거절 / 난처함",
        sub_work_report: "보고 / 컨펌 / 피드백",
        sub_work_negotiation: "연봉 협상 / 면담",
        sub_work_leave: "휴가 / 조퇴 / 병가",
        sub_work_resignation: "퇴사 / 이직 / 작별",
        sub_family_general: "일상 대화",
        sub_family_holiday: "명절 / 새해 인사",
        sub_family_celebration: "생신 / 승진 축하",
        sub_family_health: "건강 / 안부 묻기",
        sub_family_request: "부탁 / 도움 요청",
        sub_family_allowance: "용돈 드림 / 받음",
        sub_family_conflict: "잔소리 대처 / 화해",
        sub_family_in_laws: "시댁 / 처가 / 사돈",
        sub_school_general: "학교 생활",
        sub_school_professor: "교수님 / 선생님께",
        sub_school_team: "조별 과제 / 팀플",
        sub_school_roommate: "기숙사 / 룸메이트",
        sub_school_senior: "선후배 관계",
        sub_school_club: "동아리 / 학생회",
        sub_school_scholarship: "장학금 / 행정 문의",
        sub_friend_general: "일상 수다",
        sub_friend_play: "약속 잡기 / 놀자",
        sub_friend_congrats: "결혼 / 축하 / 경조사",
        sub_friend_consolation: "위로 / 고민 상담",
        sub_friend_borrow: "돈/물건 빌리기 및 갚기",
        sub_friend_refusal: "거절 (돈/부탁/약속)",
        sub_friend_conflict: "서운함 / 싸움",
        sub_friend_make_up: "사과 / 화해",
        sub_transaction_used: "중고거래 (당근 등)",
        sub_transaction_reservation: "예약 / 변경 / 취소",
        sub_transaction_order: "주문 / 배달 요청",
        sub_transaction_refund: "환불 / 교환 요청",
        sub_transaction_cs_inquiry: "상품 / 서비스 문의",
        sub_neighbor_greeting: "이사 인사 / 엘리베이터",
        sub_neighbor_noise: "층간소음 / 소음 항의",
        sub_neighbor_parking: "주차 문제",
        sub_neighbor_borrow: "잠시 빌리기 / 도움",
        sub_neighbor_complaint: "민원 / 건의사항",
        sub_sns_comment: "댓글 / 답글 / 반응",
        sub_sns_dm: "DM 문의 / 협찬 제안",
        sub_sns_review_reply: "리뷰 답글 (사장님)",
        sub_sns_post: "게시물 멘트 / 캡션",
        sub_sns_admin: "커뮤니티 운영 / 공지",
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
          },
          tips: {
            tipsTitle: "완벽한 소통을 위한 심층 가이드",
            tipsIntro: "우리는 매일 수많은 대화를 나누지만, 정작 중요한 순간에는 입이 떨어지지 않거나 잘못된 단어 선택으로 관계를 그르치기도 합니다. 본 가이드는 당신의 메시지에 진심과 예의를 동시에 담는 법을 다룹니다.",
            article1Title: "1. 비대면 대화의 한계를 극복하는 법",
            article1Content: "텍스트 기반의 대화는 비언어적 요소(표정, 목소리 톤)가 배제되어 오해의 소지가 많습니다. 이를 극복하기 위해서는 '쿠션어'의 사용이 필수적입니다. '안 돼요'라고 말하기보다 '정말 도와드리고 싶지만, 현재 상황상...'과 같은 표현을 사용하는 것만으로도 대화의 온도가 달라집니다.",
            article2Title: "2. 관계를 망치지 않는 건강한 거절",
            article2Content: "거절은 '상대방'을 거절하는 것이 아니라 '요청'을 거절하는 것임을 명확히 해야 합니다. 미안한 마음을 충분히 표현하되, 불가능한 이유를 간결하게 덧붙이세요. 우리 서비스의 '단호하게' 또는 '구구절절하게' 옵션을 활용하면 상황에 맞는 적절한 거절 문구를 찾을 수 있습니다.",
            article3Title: "3. 사과의 정석: 변명 없는 진심",
            article3Content: "좋은 사과에는 세 가지 요소가 필요합니다: 유감 표명, 책임 인정, 보상 방안 제시입니다. '만약 기분이 나빴다면 미안해'라는 식의 가정법 사과는 오히려 관계를 악화시킵니다.",
            article4Title: "4. 직장 내 소통: 보고와 피드백의 기술",
            article4Content: "상사나 동료와의 대화에서는 '결론부터' 말하는 두괄식 화법이 핵심입니다. 하지만 결론만 말하면 자칫 공격적으로 보일 수 있으므로, 상황별 맞춤 문장 생성기의 '정중하게' 옵션을 활용해 앞뒤에 적절한 인사와 양해를 구하는 문구를 배치하는 것이 좋습니다.",
            article5Title: "5. 메시지 전송의 골든타임: 타이밍이 반이다",
            article5Content: "아무리 좋은 내용이라도 언제 보내느냐에 따라 결과는 천지차이입니다. 중요한 부탁이나 사과 메시지는 상대방이 여유로운 시간대를 공략하는 것이 좋습니다. 반면, 늦은 밤이나 이른 아침의 연락은 긴급한 일이 아니라면 피해야 하며, 불가피할 경우 쿠션어를 반드시 포함해야 합니다."
          },
          about: {
            title: "소개 - 상황별 문장 생성기",
            description: "프로젝트 소개 및 비전",
            aboutTitle: "소개",
            aboutSubTitle1: "우리의 미션: 소통의 문턱을 낮추다",
            aboutMission: "'상황별 문장 생성기'는 디지털 시대의 소통을 더 쉽고 따뜻하게 만드는 것을 목표로 합니다. 중요한 순간, 적절한 단어가 떠오르지 않아 고민했던 경험은 누구에게나 있습니다. 우리는 AI 기술을 활용하여 이러한 고민을 해결하고, 사람과 사람 사이의 관계를 더욱 부드럽게 이어주는 다리가 되고자 합니다.",
            aboutSubTitle2: "주요 기능 및 기술적 특징",
            aboutOffer: "본 서비스는 연애, 비즈니스, 가족 관계 등 일상 속 다양한 상황에 특화된 문장을 최신 AI 엔진을 통해 실시간으로 생성합니다. <br><br>1. <strong>지능형 컨텍스트 분석:</strong> 정해진 템플릿을 무작위로 보여주는 것이 아니라, 사용자가 입력한 상대방과의 관계와 키워드를 분석하여 상황에 가장 적합한 문장을 창작합니다.<br>2. <strong>다양한 언어 및 페르소나 지원:</strong> 한국어, 영어, 일본어, 중국어 등 다국어 지원은 물론, 13가지 이상의 말투(페르소나)를 통해 상황에 맞는 완벽한 톤 앤 매너를 제공합니다.<br>3. <strong>사용자 중심 UI/UX:</strong> 복잡한 절차 없이 몇 번의 선택만으로 고품질의 문장을 얻을 수 있도록 직관적으로 설계되었습니다.",
            aboutSubTitle3: "개발자 이야기와 비전",
            aboutDeveloper: "이 프로젝트는 '기술로 사람들의 마음을 잇는다'는 비전을 가진 1인 개발자에 의해 시작되었습니다. 파편화된 디지털 소통 속에서 우리가 잃어버리기 쉬운 '예의'와 '진심'을 기술적으로 보완하고자 했습니다. 사용자의 피드백 하나하나가 서비스 발전의 큰 원동력이 됩니다. 앞으로도 지속적인 업데이트를 통해 더 많은 상황과 미묘한 감정까지 아우르는 '인생의 소통 파트너'로 성장해 나가겠습니다."
          },
          contact: {
            title: "연락처 - 상황별 문장 생성기",
            description: "문의 및 제안",
            contactTitle: "연락처",
            contactSubTitle: "문의 및 피드백",
            contactDescription: "서비스 이용 중 불편한 점이나 개선 아이디어, 혹은 새로운 카테고리 추가 제안이 있으신가요? 여러분의 목소리는 본 서비스를 발전시키는 가장 소중한 자산입니다. 보내주신 의견은 24시간 이내에 검토하여 서비스에 적극적으로 반영하도록 노력하겠습니다. 파트너십이나 협업 문의도 언제나 환영합니다.",
            contactEmail: "아래 이메일로 연락주시면 담당자가 확인 후 신속하게 답변 드리겠습니다.",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "개인정보처리방침 - 상황별 문장 생성기",
            description: "개인정보 수집 및 이용 안내",
            privacyTitle: "개인정보처리방침",
            privacyIntro: "'상황별 맞춤 문장 생성기'(이하 '서비스')는 사용자의 개인정보 보호를 최우선으로 여기며, '정보통신망 이용촉진 및 정보보호 등에 관한 법률' 및 '개인정보보호법' 등 관련 법령을 철저히 준수합니다. 본 방침은 사용자의 소중한 정보가 어떠한 용도와 방식으로 이용되고 있는지 투명하게 공개하기 위해 마련되었습니다.",
            privacySubTitle1: "1. 개인정보의 수집 항목 및 방법",
            privacyItem1: "본 서비스는 별도의 회원가입 없이 모든 기능을 자유롭게 이용할 수 있는 비회원제 서비스로, 개인을 식별할 수 있는 정보를 직접 수집하지 않습니다.<br><br><strong>[자동 수집 정보]</strong><br>서비스 이용 과정에서 브라우저 정보, 운영체제 버전, 접속 로그, IP 주소, 쿠키(Cookie) 등 서비스 이용 기록이 자동으로 생성되어 수집될 수 있습니다. 이는 Google Analytics 및 Microsoft Clarity와 같은 분석 도구를 통해 서비스 품질 개선 및 통계 분석 목적으로 활용됩니다.<br><br><strong>[사용자 입력 데이터]</strong><br>문장 생성을 위해 입력하시는 '상대방 명칭'이나 '키워드'는 AI 모델 연산을 위해 일시적으로 전송되나, 연산 완료 후 즉시 파기되며 서버에 영구적으로 저장되지 않습니다.",
            privacyItem1_2: "<strong>[로컬 저장소(localStorage) 활용]</strong><br>사용자가 설정한 언어 환경 및 테마(다크모드 설정) 정보는 브라우저의 로컬 저장소에 저장됩니다. 이는 서버로 전송되지 않으며 오직 사용자의 편의를 위해 기기에만 남습니다.",
            privacySubTitle2: "2. 개인정보의 이용 목적",
            privacyPurpose: "수집된 최소한의 정보는 오직 다음의 목적을 위해서만 이용됩니다.<br>- AI 문장 생성 서비스의 원활한 제공 및 기능 개선<br>- 접속 빈도 파악 및 서비스 이용 통계 분석을 통한 사용자 경험 최적화<br>- 구글 애드센스(Google AdSense)를 통한 맞춤형 광고 게재 및 서비스 유지<br>- 부정 이용 방지 및 보안 사고 예방",
            privacySubTitle3: "3. 개인정보의 제3자 제공 및 위탁에 관한 사항",
            privacyRetention: "서비스는 사용자의 정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 전문적인 서비스 분석 및 광고 게재를 위해 아래와 같은 외부 플랫폼의 기술을 활용하고 있습니다.<br>- <strong>Google LLC:</strong> Google Analytics(웹사이트 로그 분석), Google AdSense(광고 서빙)<br>- <strong>Microsoft:</strong> Microsoft Clarity(사용자 행동 패턴 분석)<br><br>위 플랫폼들은 익명화된 정보를 수집하며, 사용자는 브라우저 설정을 통해 쿠키 수집을 거부함으로써 정보 수집을 차단할 수 있습니다.",
            privacySubTitle4: "4. 개인정보의 파기 절차 및 방법",
            privacyChanges: "본 서비스는 이용 목적이 달성된 정보는 지체 없이 파기하는 것을 원칙으로 합니다. 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 완전히 삭제하며, 어떠한 경우에도 용도 외로 활용하지 않습니다.",
            privacyEffectiveDate: "시행일자: 2026년 1월 20일"
          }
      }
    },
    en: {
      ui: {
        siteTitle: "Sentence Generator",
        heroTitle: "Situation-Based Sentence Generator",
        heroDescription: "We create proper sentences for any situation instantly!",
        navHome: "Home",
        navTips: "Guide",
        navAbout: "About",
        navContact: "Contact",
        navPrivacy: "Privacy Policy",
        infoTitle1: "Why Situation-Based Sentences?",
        infoDesc1: "In today's digital world, choosing the right words determines relationship success. Our AI analyzes distance and context to suggest the best expressions.",
        tipTitle1: "💡 Core Principles",
        tipSub1: "A single word can change a relationship. We suggest sentences based on these psychological principles.",
        tip1: "<strong>Empathy:</strong> Put yourself in their shoes before sending.",
        tip2: "<strong>Tone:</strong> Setting the right tone (formal, casual) is vital.",
        tip3: "<strong>Clarity:</strong> Convey your intent politely and directly.",
        howToUseTitle: "📝 Tips for Best Results",
        howToUseDesc: "Here are some tips to get the perfect sentence for your situation.",
        howToUse1: "<strong>Be Specific with Keywords:</strong> Instead of just 'Sorry', try 'Sorry for being late' to get more natural results.",
        howToUse2: "<strong>Enter Recipient:</strong> Inputting a name or title (e.g., 'Mr. Kim', 'Honey') helps AI understand the context better.",
        howToUse3: "<strong>Try Different Tones:</strong> The same situation can sound very different depending on the tone. Experiment with 'Witty' or 'Serious' options.",
        faqTitle: "❓ FAQ",
        faqQ1: "Q: Can I use AI-generated sentences as they are?",
        faqA1: "A: Yes, but since they are based on your input, we recommend adding a touch of your own sincerity.",
        faqQ2: "Q: When is it most effective?",
        faqA2: "A: It shines when you need to refuse a request or express disappointment in a delicate relationship.",
        faqQ3: "Q: How do I use multilingual support?",
        faqA3: "A: When messaging foreign friends or business partners, you can get polite expressions suitable for each language's nuances.",
        infoTitle2: "Dialogue Guide for Business and Daily Life",
        infoDesc2: "We support 13+ tones and 50+ situations. Find the perfect 'first word' for any moment.",
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
        politenessAuto: "Auto",
        politenessHonorific: "Formal",
        politenessInformal: "Casual",
        toneLabel: "Tone & Style",
        tonePolite: "Polite",
        toneCasual: "Soft",
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
        toneMZ: "Trendy",
        generateButton: "Generate",
        copyButton: "Copy",
        regenerateButton: "Regenerate",
        footer: "© 2026 Sentence Generator",
        copySuccess: "Copied!",
        generating: "Generating...",
        aiThinking: "AI is thinking..."
      },
      pages: {
          index: {
              title: "Situation-Based Sentence Generator",
              description: "Generate appropriate sentences for any situation."
          },
          tips: {
            tipsTitle: "In-depth Communication Guide",
            tipsIntro: "This guide covers how to convey sincerity and politeness simultaneously in crucial moments.",
            article1Title: "1. Overcoming Digital Limits",
            article1Content: "Text lacks non-verbal cues. Use 'cushion words' to soften impact. Instead of saying 'No,' say 'I'd love to help, but currently...'",
            article2Title: "2. Healthy Rejection",
            article2Content: "Make it clear you are rejecting the 'request,' not the 'person.'",
            article3Title: "3. The Art of Apology",
            article3Content: "Three elements are needed: regret, admitting responsibility, and offering compensation.",
            article4Title: "4. Workplace Communication",
            article4Content: "The key is the 'conclusion first' method. Use the 'Polite' option to avoid appearing aggressive.",
            article5Title: "5. The Golden Time for Messaging",
            article5Content: "Timing is everything. Send important requests or apologies when the recipient is likely relaxed. Avoid late nights or early mornings unless urgent, and always apologize for the intrusion if you must."
          },
          about: {
            title: "About Us - Sentence Generator",
            description: "Mission and Vision of the Project",
            aboutTitle: "About Us",
            aboutSubTitle1: "Our Mission: Lowering Communication Barriers",
            aboutMission: "The 'Situation-Based Sentence Generator' aims to make digital communication easier and warmer. Everyone has experienced the struggle of finding the right words at crucial moments. We leverage AI technology to solve these dilemmas and bridge the gap between people. Beyond simple text generation, we support your valuable communication by suggesting optimal expressions considering the context and emotional tone. We hope our technology serves as a tool to better deliver your sincerity.",
            aboutSubTitle2: "Features and Technical Highlights",
            aboutOffer: "Our service generates sentences tailored to various daily situations in real-time using the latest AI engine. <br><br>1. <strong>Intelligent Context Analysis:</strong> Instead of fixed templates, it analyzes relationships and keywords to create the most suitable sentence.<br>2. <strong>Multilingual and Persona Support:</strong> Supports Korean, English, Japanese, and Chinese, with 13+ personas for perfect tone and manner.<br>3. <strong>User-Centric Design:</strong> Intuitively designed to provide high-quality results with just a few clicks.",
            aboutSubTitle3: "Developer Story",
            aboutDeveloper: "This project was started by a solo developer with a vision to 'connect people's hearts through technology.' In an era of fragmented digital communication, we aim to technically supplement the 'politeness' and 'sincerity' we often lose. User feedback is our greatest engine for growth."
          },
          contact: {
            title: "Contact - Sentence Generator",
            description: "Inquiries and Feedback",
            contactTitle: "Contact",
            contactSubTitle: "Inquiries & Feedback",
            contactDescription: "Inconveniences or fun suggestions? Your voice is the most valuable asset for improving this service. We strive to review and reflect your opinions within 24 hours. Partnership inquiries are always welcome.",
            contactEmail: "Please contact us at the email below for a prompt response.",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "Privacy Policy - Sentence Generator",
            description: "Privacy Policy and Data Usage",
            privacyTitle: "Privacy Policy",
            privacyIntro: "The 'Situation-Based Sentence Generator' (hereinafter 'Service') prioritizes the protection of user personal information and complies with relevant laws. This policy is written to transparently disclose how your valuable information is handled.",
            privacySubTitle1: "1. Information Collection",
            privacyItem1: "This is a non-membership service and we do not directly collect personally identifiable information.<br><br><strong>[Automatically Collected]</strong><br>- Cookies, access logs, IP address, etc. collected via Google Analytics and Microsoft Clarity for service optimization.<br><br><strong>[User Input]</strong><br>- Data such as 'Recipient' and 'Keywords' are transmitted temporarily for AI processing and are NOT permanently stored on the server.",
            privacyItem1_2: "<strong>[Local Storage]</strong>- 'Theme' and 'Language' settings are stored only on your device via browser localStorage.",
            privacySubTitle2: "2. Purpose of Use",
            privacyPurpose: "Collected information is used for:<br>- AI generation and quality improvement<br>- Analyzing usage statistics<br>- Customized ads via Google AdSense<br>- Preventing misuse and enhancing security",
            privacySubTitle3: "3. Third-Party Provision",
            privacyRetention: "We do not share personal information externally, except for statistical analysis via Google LLC and Microsoft tools. Users can refuse cookie collection via browser settings.",
            privacySubTitle4: "4. Data Destruction",
            privacyChanges: "Information is destroyed without delay once the purpose is achieved.",
            privacyEffectiveDate: "Effective Date: January 20, 2026"
          }
      }
    },
    ja: {
      ui: {
        siteTitle: "メッセージ生成AI",
        heroTitle: "シチュエーション别メッセージ生成",
        heroDescription: "気まずい状況ですぐに使える最适な文章を作成します。",
        navHome: "ホーム",
        navTips: "ガイド",
        navAbout: "紹介",
        navContact: "お問い合わせ",
        navPrivacy: "プライバシー",
        infoTitle1: "なぜ状況別メッセージが必要なのですか？",
        infoDesc1: "オンラインコミュニケーションが増える中、適切な言葉選びが関係の成否を分けます。当サービスはAIを活用し、最適な表現を提案します。",
        tipTitle1: "💡 コミュニケーションの原則",
        tipSub1: "一言が関係を変えます。当サービスは以下の心理学的原則に基づいた文章を提案します。",
        tip1: "<strong>思いやり:</strong> 相手の立場で文章を読み返してみましょう。",
        tip2: "<strong>トーン:</strong> 正しいトーン（丁寧、カジュアル）の設定が重要です。",
        tip3: "<strong>明快さ:</strong> 意図を丁寧に、かつはっきりと伝えましょう。",
        howToUseTitle: "📝 活用へのヒント",
        howToUseDesc: "単なる文章生成を超えて、状況にぴったりの結果を得るためのコツをお教えします。",
        howToUse1: "<strong>キーワードは具体的に:</strong> 「ごめん」より「遅れてごめん」のように具体的な状況を入れると、より自然な文章になります。",
        howToUse2: "<strong>相手の呼び名を入力:</strong> 「〇〇さん」「あなた」など、普段呼んでいる名前を入れると、AIが文脈をよりよく理解します。",
        howToUse3: "<strong>様々なトーンを試す:</strong> 同じ状況でも「ユーモア」と「真剣」では結果が全く異なります。関係の深さに応じて試してみてください。",
        faqTitle: "❓ よくある質問 (FAQ)",
        faqQ1: "Q: AIが生成した文章をそのまま使ってもいいですか？",
        faqA1: "A: はい、可能ですが、入力した条件に基づいているため、最後に一言真心を添えることをお勧めします。",
        faqQ2: "Q: どのような状況で最も効果的ですか？",
        faqA2: "A: 断りにくいお願いをされた時や、微妙な関係で不満を伝えたい時に特に役立ちます。",
        faqQ3: "Q: 多言語サポートはどのように活用しますか？",
        faqA3: "A: 外国人の友人やビジネスパートナーに連絡する際、各言語のニュアンスに合わせた丁寧な表現を得られます。",
        infoTitle2: "ビジネスと日常、すべてのための対話ガイド",
        infoDesc2: "13種類以上のトーンと50以上のシチュエーションをサポート。あらゆる瞬間に最適な「最初の一言」を見つけます。",
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
        politenessAuto: "自動",
        politenessHonorific: "敬語",
        politenessInformal: "タメ口",
        toneLabel: "口調・スタイル",
        tonePolite: "丁寧",
        toneCasual: "柔らかい",
        toneHonest: "率直",
        toneFirm: "断固",
        toneWitty: "ユーモア",
        toneConcise: "簡潔",
        toneDetailed: "詳細",
        tonePolitePlus: "非常に丁寧",
        toneSupportive: "応援",
        toneCute: "可愛い",
        toneRobot: "ロボット",
        toneHistorical: "時代劇",
        toneMZ: "流行語",
        generateButton: "作成する",
        copyButton: "コピー",
        regenerateButton: "再作成",
        footer: "© 2026 Message Generator",
        copySuccess: "コピーしました！",
        generating: "作成中...",
        aiThinking: "AIが最適な文章を考えています..."
      },
      pages: {
          index: {
              title: "メッセージ生成AI",
              description: "様々な状況に合わせた文章を自動生成します。"
          },
          tips: {
            tipsTitle: "コミュニケーション深層ガイド",
            tipsIntro: "このガイドでは、重要な瞬間に真実味と礼儀を同時に込める方法を扱います。",
            article1Title: "1. デジタル制限の克服",
            article1Content: "テキストには非言語的要素がありません。影響を和らげるために「クッション言葉」を使用してください。「できません」より「お役に立ちたいのですが、現在は…」のような表現が効果的です。",
            article2Title: "2. 健康的な拒絶",
            article2Content: "「相手」ではなく「リクエスト」を拒否していることを明確にしてください。弊社の「断固として」や「詳細に」オプションを活用すれば、状況に合わせた適切な拒絶文を見つけられます。",
            article3Title: "3. 謝罪の技術",
            article3Content: "3つの要素が必要です：遺憾の表明、責任の承認、補償案の提示。「もし気分を害したなら」のような仮定法は避け、責任を認める直接的な表現を使いましょう。",
            article4Title: "4. 職場での対話",
            article4Content: "結論から話すのが鍵です。「丁寧」オプションを使用して、前後に適切な挨拶や配慮を加えることで、攻撃的に見えるのを防ぎます。",
            article5Title: "5. メッセージ送信のゴールデンタイム",
            article5Content: "タイミングが全てです。重要な依頼や謝罪は、相手がリラックスしている時間帯に送りましょう。深夜や早朝は緊急でない限り避け、やむを得ない場合は必ずクッション言葉を添えましょう。"
          },
          about: {
            title: "紹介 - メッセージ生成AI",
            description: "プロジェクトのミッションとビジョン",
            aboutTitle: "紹介",
            aboutSubTitle1: "私たちのミッション: 心理的距離を縮める",
            aboutMission: "「シチュエーション別メッセージ生成AI」は、デジタル時代のコミュニケーションをより円滑にすることを目指しています。重要な瞬間に適切な言葉が見つからず悩んだ経験は誰にでもあります。私たちはAI技術を活用してその悩みを解決し、人と人との関係をより円滑にする架け橋となりたいと考えています。最新のAIモデルが、あなたの真心を最適な言葉で伝えるお手伝いをします。",
            aboutSubTitle2: "主な機能と技術的特徴",
            aboutOffer: "本サービスは、日常の様々な状況に特化した文章を最新のAIエンジンを通じてリアルタイムで生成します。<br><br>1. <strong>高度な文脈分析:</strong> 入力された関係性やキーワードを分析し、最適な文章を創作します。<br>2. <strong>多言語とスタイルのサポート:</strong> 4ヶ国語と13種類のスタイルに対応し、完璧なトーンを提供します。<br>3. <strong>直感的なデザイン:</strong> 複雑な手順なしで、誰でも簡単に高品質な文章を作成できるよう設計されています。",
            aboutSubTitle3: "開発者について",
            aboutDeveloper: "このプロジェクトは「技術で人々の心をつなぐ」というビジョンを持つ個人の開発者によって運営されています。デジタル化が進む中で失われがちな「礼儀」と「真心」を技術で補完したいと考えています。ユーザーの皆様のフィード백が成長の大きな原動力となります。"
          },
          contact: {
            title: "お問い合わせ - メッセージ生成AI",
            description: "フィードバックと提案",
            contactTitle: "お問い合わせ",
            contactSubTitle: "フィードバック・提案",
            contactDescription: "不便な点や改善のアイデア、新しいカテゴリの提案はありますか？皆様の声はサービス向上のための貴重な財産です。24時間以内に確認し、迅速に回答できるよう努めます。パートナーシップのお問い合わせも歓迎します。",
            contactEmail: "以下のメールアドレスにご連絡ください。担当者が順次対応いたします。",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "プライバシーポリシー - メッセージ生成AI",
            description: "個人情報の収集と利用について",
            privacyTitle: "プライバシーポリシー",
            privacyIntro: "「メッセージ生成AI」（以下「本サービス」）は、ユーザーの個人情報保護を最優先に考え、関連法令を徹底して遵守します。本方針は、ユーザーの大切な情報がどのように扱われるかを透明に公開するために作成されました。",
            privacySubTitle1: "1. 収集する個人情報項目と方法",
            privacyItem1: "本サービスは会員登録なしで利用可能であり、特定の個人を識別する情報は収集しません。<br><br><strong>[自動収集情報]</strong><br>利用過程で、ブラウザ情報、OS、IPアドレス、クッキー(Cookie)などが自動的に収集される場合があります。これはGoogle AnalyticsやMicrosoft Clarity等のツールを通じて、サービス向上や統計分析のために使用されます。<br><br><strong>[ユーザー入力データ]</strong><br>入力された「相手」や「キーワード」はAI処理のために一時的に送信されますが、完了後は直ちに破棄され、サーバーに保存されることはありません。",
            privacyItem1_2: "<strong>[ローカルストレージの活用]</strong><br>言語設定やテーマ設定はブラウザのlocalStorageに保存されます。これはサーバーには送信されず、ユーザーの利便性のためにデバイスにのみ残ります。",
            privacySubTitle2: "2. 利用目的",
            privacyPurpose: "収集された情報は以下の目的でのみ使用されます。<br>- AI文章生成サービスの提供および品質向上<br>- 利用統計の分析を通じたユーザー体験の最適化<br>- Google AdSenseを通じた広告配信およびサービス維持<br>- 不正利用の防止とセキュリティ強化",
            privacySubTitle3: "3. 第三者提供について",
            privacyRetention: "統計分析および広告配信のために以下の外部プラットフォームを使用します。<br>- <strong>Google:</strong> Analytics, AdSense<br>- <strong>Microsoft:</strong> Clarity<br><br>ユーザーはブラウザの設定でクッキーの収集を拒否できます。",
            privacySubTitle4: "4. 個人情報の破棄",
            privacyChanges: "目的達成後は遅滞なく情報を破棄します。電子的なファイルは復元不可能な方法で完全に削除します。",
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
        navTips: "指南",
        navAbout: "关于",
        navContact: "联系我们",
        navPrivacy: "隐私政策",
        infoTitle1: "为什么需要场景化话术？",
        infoDesc1: "随着在线沟通的增加，选择合适的词汇决定了关系的成败。我们的AI通过分析语境提供最佳表达。",
        tipTitle1: "💡 沟通原则",
        tipSub1: "一句话可以改变一段关系。我们的服务根据以下心理学原则提供话术建议。",
        tip1: "<strong>共情:</strong> 从对方的角度重新阅读句子。",
        tip2: "<strong>语气:</strong> 设定正确的语气（正式、随意）是关键。",
        tip3: "<strong>清晰:</strong> 礼貌且清晰地传达你的意图。",
        howToUseTitle: "📝 使用技巧",
        howToUseDesc: "不仅仅是生成句子，这里有一些获得完美结果的小贴士。",
        howToUse1: "<strong>关键词要具体:</strong> 输入“迟到抱歉”比单纯的“抱歉”能生成更自然的句子。",
        howToUse2: "<strong>输入称呼:</strong> 输入“金经理”、“亲爱的”等平时使用的称呼，有助于AI更好地理解语境。",
        howToUse3: "<strong>尝试不同语气:</strong> 即使是相同的情况，使用“幽默”或“真诚”的语气，结果也会截然不同。",
        faqTitle: "❓ 常见问题 (FAQ)",
        faqQ1: "Q: 我可以直接使用AI生成的句子吗？",
        faqA1: "A: 是的，但由于它们是根据您的输入生成的，我们建议加入一点您自己的真心。",
        faqQ2: "Q: 什么时候最有效？",
        faqA2: "A: 当您需要拒绝请求或在微妙的关系中表达不满时，它会大放异彩。",
        faqQ3: "Q: 如何使用多语言支持？",
        faqA3: "A: 在给外国朋友或业务伙伴发消息时，您可以获得适合每种语言细微差别的礼貌表达。",
        infoTitle2: "商务与日常生活对话指南",
        infoDesc2: "支持13种以上语调和50多种场景。为您在任何时刻找到最完美的“第一句话”。",
        categoryLabel: "选择场景",
        categoryLove: "恋爱",
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
        politenessAuto: "自动",
        politenessHonorific: "敬语",
        politenessInformal: "平语",
        toneLabel: "说话风格",
        tonePolite: "礼貌",
        toneCasual: "温和",
        toneHonest: "坦诚",
        toneFirm: "坚决",
        toneWitty: "幽默",
        toneConcise: "简短",
        toneDetailed: "详细",
        tonePolitePlus: "极度客气",
        toneSupportive: "鼓励",
        toneCute: "可爱",
        toneRobot: "机器人",
        toneHistorical: "古风",
        toneMZ: "流行语",
        generateButton: "生成回复",
        copyButton: "复制内容",
        regenerateButton: "重新生成",
        footer: "© 2026 话术生成器",
        copySuccess: "已复制！",
        generating: "生成中...",
        aiThinking: "AI正在思考最佳回复..."
      },
      pages: {
          index: {
              title: "话术生成器",
              description: "自动生成适用于多种场合的回复。"
          },
          tips: {
            tipsTitle: "沟通深度指南",
            tipsIntro: "本指南涵盖了如何同时表达诚意和礼貌。",
            article1Title: "1. 克服数字限制",
            article1Content: "文字缺乏非语言因素。使用“垫后语”来软和冲击。与其说“不行”，不如说“我很想帮忙，但目前……”",
            article2Title: "2. 健康的拒绝",
            article2Content: "明确表示你是在拒绝“请求”而非“人”。我们的“坚决”或“详细”选项可以提供帮助。",
            article3Title: "3. 道歉的艺术",
            article3Content: "需要三个要素：表示遗憾、承认责任、提供补偿。避免使用“如果”之类的陈述。",
            article4Title: "4. 职场沟通",
            article4Content: "关键是“结论先行”。使用“礼貌”选项添加适当的问候。",
            article5Title: "5. 发送消息的黄金时间",
            article5Content: "时机就是一切。在对方放松的时候发送重要的请求或道歉。除非紧急情况，否则避免在深夜或清晨发送，如果必须发送，一定要加上歉意。"
          },
          about: {
            title: "关于 - 话术生成器",
            description: "项目介绍与愿景",
            aboutTitle: "关于我们",
            aboutSubTitle1: "我们的使命: 降低沟通门槛",
            aboutMission: "“场景化话术生成器”旨在让数字时代的沟通变得更简单、更温暖。我们利用最新的AI引擎，通过分析语境和情感，为您提供最佳表达方式。我们希望技术能成为更好地传递您真心的工具。",
            aboutSubTitle2: "功能特色与技术亮点",
            aboutOffer: "1. <strong>智能语境分析:</strong> 根据关系和关键词实时创作新句子。<br>2. <strong>多语言与角色支持:</strong> 支持4种语言和13种风格，提供完美语调。<br>3. <strong>用户中心设计:</strong> 只需点击几次即可获得高质量话术。",
            aboutSubTitle3: "开发者故事",
            aboutDeveloper: "由怀揣“用技术连接人心”愿景的独立开发者运营。在碎片化的数字时代，我们希望通过技术补充被忽略的“礼貌”与“真心”。用户的反馈是我们发展的最大动力。"
          },
          contact: {
            title: "联系我们 - 话术生成器",
            description: "咨询与反馈",
            contactTitle: "联系我们",
            contactSubTitle: "咨询与反馈",
            contactDescription: "在使用服务过程中有任何建议吗？您的声音是改进服务的宝贵财富。我们承诺在24小时内审查并回复。欢迎各类合作或伙伴关系咨询。",
            contactEmail: "请通过以下电子邮件联系我们，我们将尽快答复。",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "隐私政策 - 话术生成器",
            description: "个人信息收集与使用",
            privacyTitle: "隐私政策",
            privacyIntro: "“场景化话术生成器”（以下简称“服务”）将保护用户的个人信息放在首位，严格遵守相关法律法规。本政策旨在透明地公开您的信息是如何被处理的。",
            privacySubTitle1: "1. 信息收集项目及方法",
            privacyItem1: "本服务无需注册，不直接收集个人身份信息。<br><br><strong>[自动收集]</strong><br>在过程中可能自动收集浏览器信息、IP地址、Cookie等。这些数据通过Google Analytics和Microsoft Clarity用于优化服务和统计分析。<br><br><strong>[用户输入数据]</strong><br>您输入的对象名或关键词仅用于AI计算，处理完毕后立即销毁，不会永久存储在服务器上。",
            privacyItem1_2: "<strong>[本地存储]</strong><br>您的语言和主题设置存储在浏览器的localStorage中。这些数据不会发送到服务器，仅保存在您的设备上。",
            privacySubTitle2: "2. 使用目的",
            privacyPurpose: "仅用于提供AI话术生成、优化用户体验、通过Google AdSense展示广告以及强化安全性。",
            privacySubTitle3: "3. 关于第三方提供",
            privacyRetention: "原则上不向第三方提供信息。但为了分析和广告展示，可能使用以下平台的工具：<br>- <strong>Google:</strong> Analytics, AdSense<br>- <strong>Microsoft:</strong> Clarity<br><br>用户可以通过浏览器设置拒绝Cookie。",
            privacySubTitle4: "4. 数据销毁",
            privacyChanges: "目的达成后立即销毁信息。电子文件将以不可恢复的方式彻底删除。",
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
        
        // Ensure subCategory is not empty if possible
        let finalSubCategory = subCategory;
        if (!finalSubCategory && subCategoryMap[category] && subCategoryMap[category].length > 0) {
             finalSubCategory = subCategoryMap[category][0];
        }

        const payload = {
            category: category,
            subCategory: finalSubCategory,
            tone: tone,
            recipient: recipient,
            keywords: keywords, // Changed key to 'keywords' (plural)
            politeness: politeness,
            lang: lang
        };

        console.log("Sending payload:", payload);

        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
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