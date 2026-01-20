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

    // Load saved language or default to Korean
    const savedLang = localStorage.getItem('language') || 'ko';
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
        faqTitle: "❓ 자주 묻는 질문 (FAQ)",
        infoTitle2: "비즈니스와 일상, 모두를 위한 대화 가이드",
        infoDesc2: "상황별 맞춤 문장 생성기는 13가지 이상의 다양한 말투와 50개 이상의 세부 상황을 지원합니다. 직장 상사에게 보고할 때의 정중함, 친구에게 서운함을 전할 때의 부드러움, 거래처와의 단호한 협상 등 당신이 처한 모든 순간에 가장 적절한 '첫 마디'를 찾아드립니다. 지금 바로 선택하고 대화를 시작해 보세요.",

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
            article1Content: "텍스트 기반의 대화는 비언어적 요소(표정, 목소리 톤)가 배제되어 오해의 소지가 많습니다. 이를 극복하기 위해서는 '쿠션어'의 사용이 필수적입니다. '안 돼요'라고 말하기보다 '정말 도와드리고 싶지만, 현재 상황상...'과 같은 표현을 사용하는 것만으로도 대화의 온도가 달라집니다. 특히 상대방이 내 표정을 볼 수 없는 온라인 환경에서는 문장의 끝맺음 하나에도 신경을 써야 합니다.",
            article2Title: "2. 관계를 망치지 않는 건강한 거절",
            article2Content: "거절은 '상대방'을 거절하는 것이 아니라 '요청'을 거절하는 것임을 명확히 해야 합니다. 미안한 마음을 충분히 표현하되, 불가능한 이유를 간결하게 덧붙이세요. 우리 서비스의 '단호하게' 또는 '구구절절하게' 옵션을 활용하면 상황에 맞는 적절한 거절 문구를 찾을 수 있습니다. 또한, 대안을 제시하는 거절은 상대방으로 하여금 존중받고 있다는 느낌을 줍니다.",
            article3Title: "3. 사과의 정석: 변명 없는 진심",
            article3Content: "좋은 사과에는 세 가지 요소가 필요합니다: 유감 표명, 책임 인정, 보상 방안 제시입니다. '만약 기분이 나빴다면 미안해'라는 식의 가정법 사과는 오히려 관계를 악화시킵니다. '내 실수가 너에게 상처가 되었을 것 같아 미안해'라는 식의 직접적인 표현이 필요합니다. 사과는 타이밍이 생명이지만, 감정이 격앙된 상태보다는 차분히 정돈된 문장으로 전달하는 것이 더 효과적입니다.",
            article4Title: "4. 직장 내 소통: 보고와 피드백의 기술",
            article4Content: "상사나 동료와의 대화에서는 '결론부터' 말하는 두괄식 화법이 핵심입니다. 하지만 결론만 말하면 자칫 공격적으로 보일 수 있으므로, 상황별 맞춤 문장 생성기의 '정중하게' 옵션을 활용해 앞뒤에 적절한 인사와 양해를 구하는 문구를 배치하는 것이 좋습니다. 명확한 데이터와 근거를 바탕으로 하되, 상대방의 업무 스타일을 존중하는 태도가 수반되어야 합니다."
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
            privacyIntro: "'상황별 맞춤 문장 생성기'(이하 '서비스')는 사용자의 개인정보 보호를 최우선으로 여기며, 관련 법령을 준수합니다. 본 방침은 사용자의 소중한 정보가 어떻게 취급되는지 투명하게 공개하기 위해 작성되었습니다.",
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
        heroDescription: "We create proper sentences for any situation instantly!",
        navHome: "Home",
        navTips: "Guide",
        navAbout: "About",
        navContact: "Contact",
        navPrivacy: "Privacy Policy",
        
        infoTitle1: "Why Situation-Based Sentences?",
        infoDesc1: "As online communication grows, choosing the right words determines relationship success. Our AI analyzes distance and context to suggest the best expressions.",
        tipTitle1: "💡 Core Principles",
        tipSub1: "A single word can change a relationship. Our service suggests sentences based on the following psychological principles.",
        tip1: "<strong>Empathy:</strong> Read the sentence from the other person's view.",
        tip2: "<strong>Tone:</strong> Setting the right tone (formal, casual) is key.",
        tip3: "<strong>Clarity:</strong> Convey your intent politely and clearly.",
        faqTitle: "❓ FAQ",
        infoTitle2: "Dialogue Guide for Business and Daily Life",
        infoDesc2: "We support 13+ tones and 50+ situations. Find the perfect 'first word' for reporting to a boss, expressing disappointment to a friend, or negotiating firmly with a client.",

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
          },
          tips: {
            tipsTitle: "In-depth Communication Guide",
            tipsIntro: "We have countless conversations daily, but in crucial moments, we often struggle to find words. this guide covers how to convey sincerity and politeness simultaneously.",
            article1Title: "1. Overcoming Digital Limits",
            article1Content: "Text lacks non-verbal cues (expressions, tone). Use 'cushion words' to soften impact. Instead of saying 'No,' say 'I'd love to help, but currently...'",
            article2Title: "2. Healthy Rejection",
            article2Content: "Make it clear you are rejecting the 'request,' not the 'person.' Express regret and add a brief reason. Our 'Firm' or 'Detailed' options can help.",
            article3Title: "3. The Art of Apology",
            article3Content: "Three elements are needed: regret, admitting responsibility, and offering compensation. Avoid 'if' statements like 'If you felt bad, I'm sorry.'",
            article4Title: "4. Workplace Communication",
            article4Content: "The key is the 'conclusion first' method. Use the 'Polite' option to add appropriate greetings and requests for understanding to avoid appearing aggressive."
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
            privacyIntro: "The 'Situation-Based Sentence Generator' (hereinafter 'Service') prioritizes the protection of user personal information and complies with relevant laws. This policy is written to transparently disclose how your valuable information is handled.",
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
        faqTitle: "❓ よくある質問 (FAQ)",
        infoTitle2: "ビジネスと日常、すべてのための対話ガイド",
        infoDesc2: "13種類以上のトーンと50以上のシチュエーションをサポート。上司への報告、友人への不満、取引先との交渉など、あらゆる瞬間に最適な「最初の一言」を見つけます。",

        categoryLabel: "状況を選択",
        categoryLove: "恋愛 / 썸",
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
          },
          tips: {
            tipsTitle: "コミュニケーション深層ガイド",
            tipsIntro: "毎日多くの会話を交わしますが、重要な瞬間に言葉に詰まることがあります。本ガイドでは真実味と礼儀を同時に込める方法を扱います。",
            article1Title: "1. デジタル制限の克服",
            article1Content: "テキストには非言語的要素がありません。影響を和らげるために「クッション言葉」を使用してください。「できません」より「お役に立ちたいのですが、現在は…」のような表現が効果的です。",
            article2Title: "2. 健康的な拒絶",
            article2Content: "「相手」ではなく「リクエスト」を拒否していることを明確にしてください。弊社の「断固として」や「詳細に」オプションを活用すれば、状況に合わせた適切な拒絶文を見つけられます。",
            article3Title: "3. 謝죄の技術",
            article3Content: "3つの要素が必要です：遺憾の表明、責任の承認、補償案の提示。「もし気分を害したなら」のような仮定法は避け、責任を認める直接的な表現を使いましょう。",
            article4Title: "4. 職場での対話",
            article4Content: "結論から話すのが鍵です。「丁寧に」オプションを使用して、前後に適切な挨拶や配慮を加えることで、攻撃的に見えるのを防ぎます。"
          },
          about: {
            title: "紹介 - メッセージ生成AI",
            description: "プロジェクトのミッションとビジョン",
            aboutTitle: "紹介",
            aboutSubTitle1: "私たちのミッション",
            aboutMission: "「シチュエーション別メッセージ生成AI」は、デジタル時代のコミュニケーションをより簡単で温かいものにすることを目指しています。重要な瞬間に適切な言葉が見つからず悩んだ経験は誰にでもあります。私たちはAI技術を活用してその悩みを解決し、人と人との関係をより円滑にする架け橋となりたいと考えています。",
            aboutSubTitle2: "主な機能と特徴",
            aboutOffer: "本サービスは、恋愛、ビジネス、家族関係など、日常の様々な状況に特化した文章をリアルタイムで生成します。<br><br>1. <strong>多様なペルソナ:</strong> 丁寧なビジネス用語から親しみやすい口調、時代劇風まで、状況に合ったトーン＆マナーを選択できます。<br>2. <strong>カスタマイ즈:</strong> 相手（聞き手）を指定し、含めたいキーワードを入力することで、より精巧でパーソナライズされた文章が完成します。<br>3. <strong>リアルタイムAIエンジン:</strong> 最新のAIモデルが入力条件を分析し、毎回新しい文章を創作します。",
            aboutSubTitle3: "開発者について",
            aboutDeveloper: "このプロジェクトは「技術で人々の心をつなぐ」というビジョンを持つ個人の開発者によって運営されています。ユーザーの皆様のフィードバックがサービス発展の大きな原動力となります。"
          },
          contact: {
            title: "お問い合わせ - メッセージ生成AI",
            description: "フィードバックと提案",
            contactTitle: "お問い合わせ",
            contactSubTitle: "フィードバック・提案",
            contactDescription: "サービス利用中に不便な点や改善のアイデア、あるいは面白い提案はありますか？皆様の声はいつでも歓迎します。",
            contactEmail: "以下のメールアドレスにご連絡いただければ、確認後迅速に回答いたします。",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "プライバシーポリシー - メッセージ生成AI",
            description: "個人情報の収集と利用について",
            privacyTitle: "プライバシーポリシー",
            privacyIntro: "「状況別メッセージ生成AI」（以下「本サービス」）は、ユーザーの個人情報保護を最優先に考え、関連法令を遵守します。",
            privacySubTitle1: "1. 収集する個人情報項目",
            privacyItem1: "本サービスは会員登録なしで利用可能であり、サービス提供のために最小限の情報のみを収集します。<br><br><strong>[自動収集情報]</strong><br>- クッキー、利用記録、アクセスログ、IPアドレス、端末情報。<br><br><strong>[ユーザー入力情報]</strong><br>- 文章生成のために入力されたデータはAI処理のために一時的に送信されますが、保存はされません。",
            privacyItem1_2: "<strong>[ローカルストレージ]</strong><br>- 「テーマ設定」および「言語設定」はブラウザのlocalStorageに保存され、サーバーには送信されません。",
            privacySubTitle2: "2. 利用目的",
            privacyPurpose: "AI文章生成サービスの提供、利用統計の分析、広告配信、セキュリティ強化のためにのみ使用されます。",
            privacySubTitle3: "3. 第三者への提供",
            privacyRetention: "統計分析および広告配信のためにGoogleやMicrosoftの外部ツールを使用する場合があります。",
            privacySubTitle4: "4. 個人情報の破棄",
            privacyChanges: "個人情報は、収集および利用目的が達成された後は遅滞なく破棄することを原則とします。",
            privacyEffectiveDate: "施行日: 2026年1月20일"
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
        faqTitle: "❓ 常见问题 (FAQ)",
        infoTitle2: "商务与日常生活对话指南",
        infoDesc2: "支持13种以上语调和50多种场景。无论是向老板汇报、向朋友表达不满，还是与客户谈判，都能找到最完美的“第一句话”。",

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
        toneWitty: "幽머风趣",
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
          },
          tips: {
            tipsTitle: "沟通深度指南",
            tipsIntro: "我们每天进行无数次对话，但在关键时刻往往难以开口。本指南涵盖了如何同时表达诚意和礼貌。",
            article1Title: "1. 克服数字限制",
            article1Content: "文字缺乏非语言因素。使用“垫后语”来软和冲击。与其说“不行”，不如说“我很想帮忙，但目前……”",
            article2Title: "2. 健康的拒绝",
            article2Content: "明确表示你是在拒绝“请求”而非“人”。我们的“坚决”或“详细”选项可以提供帮助。",
            article3Title: "3. 道歉的艺术",
            article3Content: "需要三个要素：表示遗憾、承认责任、提供补偿。避免使用“如果”之类的陈述。",
            article4Title: "4. 职场沟通",
            article4Content: "关键是“结论先行”。使用“礼貌”选项添加适当的问候，避免显得过于强势。"
          },
          about: {
            title: "关于 - 话术生成器",
            description: "项目介绍与愿景",
            aboutTitle: "关于我们",
            aboutSubTitle1: "我们的使命",
            aboutMission: "“场景化话术生成器”旨在让数字时代的沟通变得更简单、更温暖。每个人都有在关键时刻找不到合适措辞的经历。我们利用AI技术来解决这些困扰，成为连接人与人之间关系的桥梁。",
            aboutSubTitle2: "功能特色",
            aboutOffer: "本服务实时生成针对恋爱、商务、家庭关系等各种话术。<br><br>1. <strong>多样化角色:</strong> 从正式语气到日常用语。<br>2. <strong>个性化定制:</strong> 指定接收对象和关键词。<br>3. <strong>实时AI引擎:</strong> 每次创作新的句子。",
            aboutSubTitle3: "开发者故事",
            aboutDeveloper: "该项目由一位怀揣“用技术连接人心”愿景的独立开发者运营。"
          },
          contact: {
            title: "联系我们 - 话术生成器",
            description: "咨询与反馈",
            contactTitle: "联系我们",
            contactSubTitle: "咨询与反馈",
            contactDescription: "在使用服务过程中有任何不便或建议吗？我们随时欢迎您的声音。",
            contactEmail: "请通过以下电子邮件联系我们，我们将尽快答复。",
            emailLink: "bws96g@gmail.com"
          },
          privacy: {
            title: "隐私政策 - 话术生成器",
            description: "个人信息收集与使用",
            privacyTitle: "隐私政策",
            privacyIntro: "“场景化话术生成器”（以下简称“服务”）将保护用户的个人信息放在首位。",
            privacySubTitle1: "1. 信息收集",
            privacyItem1: "本服务无需注册，仅收集最少的信息。<br><br><strong>[自动收集]</strong><br>- Cookie、访问日志、IP地址、设备信息。<br><br><strong>[用户输入]</strong><br>- 数据会暂时传输以进行AI处理，但不会存储。",
            privacyItem1_2: "<strong>[本地存储]</strong><br>- 设置存储在localStorage中，不会发送到服务器。",
            privacySubTitle2: "2. 使用目的",
            privacyPurpose: "仅用于提供AI句子生成、统计分析、广告投放及安全强化。",
            privacySubTitle3: "3. 第三方提供",
            privacyRetention: "为分析和广告可能使用Google或Microsoft的外部工具。",
            privacySubTitle4: "4. 数据销毁",
            privacyChanges: "信息在达到目的后将立即销毁。",
            privacyEffectiveDate: "生效日期：2026年1月20일"
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
