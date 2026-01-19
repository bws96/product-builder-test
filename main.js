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
        } catch (error) {
            console.error('Error loading header actions:', error);
        }
    }

    // Load header actions before other elements that depend on them
    await loadHeaderActions();

    // Theme and language elements
    const themeToggle = document.getElementById('theme-toggle');
    const languageSelector = document.getElementById('language-selector');

    // --- Sidebar Logic ---
    const openSidebar = () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };

    menuToggle.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // --- Theme Logic ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.innerText = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.innerText = '🌙';
        }
    };

    // --- Language Logic ---
    const setLanguage = (lang) => {
        const translation = translations[lang];
        if (!translation) return;

        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            if (translation.ui[key]) {
                elem.innerText = translation.ui[key];
            }
        });
        
        const pageKey = document.body.dataset.page;
        if (pageKey && translations[lang].pages[pageKey]) {
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
    };

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
    }

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Load saved language or default to Korean
    const savedLang = localStorage.getItem('language') || 'ko';
    if (languageSelector) {
        languageSelector.value = savedLang;
    }
    setLanguage(savedLang);
});

const translations = {
  ko: {
    ui: {
      siteTitle: "문장 생성기",
      heroTitle: "연애 · 사회생활 문장 생성기",
      heroDescription: "어색한 상황에서 바로 써먹을 문장을 만들어드립니다",
      navHome: "홈",
      navAbout: "소개",
      navContact: "연락처",
      navPrivacy: "개인정보처리방침",
      categoryLabel: "상황 선택",
      categoryLove: "연애",
      categoryWork: "회사 / 사회생활",
      toneLabel: "말투 선택",
      tonePolite: "정중하게",
      toneCasual: "부드럽게",
      toneHonest: "솔직하게",
      generateButton: "문장 생성하기",
      copyButton: "문장 복사하기",
      regenerateButton: "다시 생성하기",
      footer: "© 2026 문장 생성기",
      copySuccess: "문장이 복사되었습니다!",
      aboutTitle: "소개",
      aboutSubTitle1: "우리의 미션",
      aboutMission: "'연애 · 사회생활 문장 생성기'는 단순한 문장 제공을 넘어, 사람들 사이의 소통을 더 쉽고 자신감 있게 만들어주는 것을 목표로 합니다. 우리는 많은 사람들이 중요한 순간에 적절한 표현을 찾지 못해 어려움을 겪는다는 것을 알고 있습니다. 저희는 이러한 장벽을 허물고, 사용자가 자신의 생각과 감정을 효과적으로 전달할 수 있도록 돕고자 합니다.",
      aboutSubTitle2: "무엇을 제공하나요?",
      aboutOffer: "저희 서비스는 '연애'와 '회사/사회생활'이라는 두 가지 주요 상황에 맞춰, '정중하게', '부드럽게', '솔직하게' 등 다양한 톤의 문장을 제공합니다. 각 문장은 심리학적, 사회적 맥락을 고려하여 신중하게 작성되었으며, 사용자가 어떤 상황에서도 자연스럽고 적절하게 소통할 수 있도록 설계되었습니다. 저희는 자동 생성된 콘텐츠가 아닌, 실제적인 가치를 제공하는 고품질의 콘텐츠를 제공하기 위해 노력합니다.",
      aboutSubTitle3: "개발자 소개",
      aboutDeveloper: "이 프로젝트는 1인 개발자에 의해 시작되었습니다. 사람들의 소통 방식에 깊은 관심을 가지고 있으며, 기술을 통해 긍정적인 사회적 변화를 만들 수 있다고 믿습니다. 사용자의 피드백을 소중히 여기며, 지속적인 업데이트를 통해 더 나은 서비스를 제공하기 위해 최선을 다하고 있습니다.",
      contactTitle: "연락처",
      contactSubTitle: "피드백 및 문의",
      contactDescription: "'연애 · 사회생활 문장 생성기'에 대한 소중한 의견을 기다립니다. 서비스 개선을 위한 아이디어나 제안, 불편한 점, 또는 파트너십 문의 등 어떤 내용이든 환영합니다.",
      contactEmail: "아래 이메일로 연락주시면 최대한 빠른 시일 내에 답변드리겠습니다.",
      privacyTitle: "개인정보처리방침",
      privacyIntro: "'연애 · 사회생활 문장 생성기'(이하 '서비스')는 사용자의 개인정보를 소중하게 생각하며, 정보통신망 이용촉진 및 정보보호 등에 관한 법률을 준수하고 있습니다. 본 개인정보처리방침을 통해 사용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.",
      privacySubTitle1: "1. 수집하는 개인정보 항목",
      privacyItem1: "저희 서비스는 별도의 회원가입 절차 없이 대부분의 콘텐츠에 자유롭게 접근할 수 있습니다. 다만, 일부 기능 이용 시 다음과 같은 정보들이 자동으로 생성되어 수집될 수 있습니다.\n- 쿠키, 접속 로그, 서비스 이용 기록, 기기 정보",
      privacyItem1_2: "테마 및 언어 설정 저장을 위해 브라우저의 `localStorage`를 사용합니다. 이 정보는 사용자의 기기에만 저장되며, 저희 서버로 전송되지 않습니다.",
      privacySubTitle2: "2. 개인정보의 수집 및 이용 목적",
      privacyPurpose: "서비스는 수집한 정보를 다음의 목적을 위해 활용합니다.\n- 서비스 이용에 대한 통계 및 분석을 통한 서비스 개선 및 신규 서비스 개발\n- Google AdSense 등 광고 파트너를 통한 맞춤형 광고 제공",
      privacySubTitle3: "3. 개인정보의 보유 및 이용기간",
      privacyRetention: "사용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우, 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.",
      privacySubTitle4: "4. 개인정보 처리방침의 변경",
      privacyChanges: "본 개인정보처리방침은 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 웹사이트 공지사항(또는 개별공지)을 통하여 공지할 것입니다.",
      privacyEffectiveDate: "시행일자: 2026년 1월 19일"
    },
    pages: {
        index: {
            title: "연애 · 사회생활 문장 생성기",
            description: "연애, 회사, 인간관계에서 바로 써먹는 문장을 랜덤으로 생성해드립니다."
        },
        about: {
            title: "소개 - 연애 · 사회생활 문장 생성기",
            description: "연애 · 사회생활 문장 생성기 프로젝트의 목적과 비전에 대해 알아보세요."
        },
        contact: {
            title: "연락처 - 연애 · 사회생활 문장 생성기",
            description: "피드백, 제안, 문의사항이 있으시면 언제든지 연락주세요."
        },
        privacy: {
            title: "개인정보처리방침 - 연애 · 사회생활 문장 생성기",
            description: "저희 서비스의 개인정보 수집 및 이용 방침에 대해 안내합니다."
        }
    },
    sentences: {
        love: {
            polite: [
                "갑작스럽게 연락드려서 놀라셨을 수도 있을 것 같아요. 그래도 이렇게 이야기할 수 있어서 좋습니다.",
                "천천히 알아가고 싶은 마음이 있어서 용기 내어 말씀드려요.",
                "부담 드리려는 건 아니고, 제 마음만 솔직하게 전하고 싶었습니다.",
                "혹시 괜찮으시다면, 주말에 잠시 시간 괜찮으신지 여쭤봐도 될까요?",
                "덕분에 오늘 하루가 정말 즐거웠습니다. 감사해요.",
                "말씀하시는 모습이 멋져서 저도 모르게 시선이 갔어요.",
                "다음에 기회가 된다면 같이 식사 한번 하고 싶습니다.",
                "오늘 입으신 옷, 정말 잘 어울리세요.",
                "이야기를 나누다 보니 시간이 가는 줄도 몰랐네요.",
                "조심스럽지만, 다음에도 또 뵐 수 있었으면 좋겠습니다.",
                "혹시 실례가 안 된다면, 연락처를 알 수 있을까요?",
                "좋은 하루 보내시고, 오늘 일도 힘내세요.",
                "관심사가 비슷한 것 같아서 더 이야기해보고 싶어요.",
                "웃는 모습이 정말 매력적이시네요.",
                "편안한 저녁 시간 보내시길 바랍니다.",
                "다음에 또 이런 자리가 있었으면 좋겠네요.",
                "오늘 만나서 정말 반가웠습니다.",
                "생각이 깊으신 것 같아서 대화하는 게 즐거웠어요.",
                "제가 너무 제 이야기만 했나요? 당신 이야기도 궁금해요.",
                "먼저 들어가보겠습니다. 다음에 또 봬요."
            ],
            casual: [
                "요즘 자꾸 생각나서 그냥 한 번 연락해봤어.",
                "괜히 설레서 먼저 메시지 보내게 됐어.",
                "너랑 이야기하면 기분이 좋아져서.",
                "주말에 뭐해? 시간 되면 같이 영화 볼래?",
                "오늘따라 더 예뻐 보이네.",
                "너랑 있으면 시간 가는 줄 모르겠어.",
                "우리 다음에 맛있는 거 먹으러 가자.",
                "네 생각 나서 잠이 안 와.",
                "오늘 하루도 수고했어. 잘 자.",
                "너 목소리 들으니까 좋다.",
                "이따가 잠깐 얼굴 볼 수 있을까?",
                "네가 좋아하는 카페, 나도 가보고 싶어.",
                "추운데 따뜻하게 입고 다녀.",
                "점심은 먹었어? 챙겨 먹어.",
                "나 지금 너네 집 앞인데, 잠깐 나올래?",
                "네 인스타그램 사진 봤어. 여행 재밌었겠다.",
                "우리 취향 진짜 잘 맞는 것 같아.",
                "무슨 일 있어? 내가 들어줄게.",
                "보고 싶어서 연락했어.",
                "너는 웃는 게 제일 예뻐."
            ],
            honest: [
                "좋아하는 마음이 있어서 숨기고 싶지 않았어.",
                "계속 혼자 고민하다가 이렇게 말해.",
                "너한테 솔직해지고 싶었어.",
                "나는 너랑 더 가까워지고 싶어.",
                "솔직히 말해서, 첫인상 때부터 마음에 들었어.",
                "다른 사람이랑 있을 때랑 너랑 있을 때랑 내가 너무 달라.",
                "네가 다른 사람이랑 얘기할 때 질투 났어.",
                "나한테는 네가 제일 특별해.",
                "앞으로 그냥 친구로만 지내기는 어려울 것 같아.",
                "너의 모든 게 궁금해.",
                "이 관계를 더 이상 애매하게 두고 싶지 않아.",
                "네가 나를 어떻게 생각하는지 알려줄 수 있어?",
                "나는 너를 진지하게 생각하고 있어.",
                "내 마음이 가는 대로 행동하고 싶어.",
                "우리가 잘 될 수 있을 거라고 믿어.",
                "시간 낭비하고 싶지 않아. 우리 만나볼래?",
                "내 대답, 지금 바로 듣고 싶어?",
                "너의 대답이 어떻든, 후회는 없어.",
                "나 지금 너한테 고백하는 거야.",
                "우리 그냥 연애하자."
            ]
        },
        work: {
            polite: [
                "말씀해주신 부분 충분히 이해하고 있습니다. 다만 일정상 조금만 조정이 가능할지 여쭤보고 싶습니다.",
                "확인해보니 해당 부분에 대해 몇 가지 고려할 점이 있는 것 같습니다.",
                "조금 더 검토 후 다시 말씀드려도 괜찮을지 문의드립니다.",
                "이 부분에 대한 자료를 추가로 요청드려도 될까요?",
                "제가 이해한 내용이 맞는지 한번 더 확인 부탁드립니다.",
                "좋은 의견 감사드립니다. 팀원들과 함께 논의해보겠습니다.",
                "혹시 관련해서 참고할 만한 자료가 있다면 공유해주실 수 있으실까요?",
                "제가 놓친 부분이 있을 수 있으니, 편하게 말씀해주시면 감사하겠습니다.",
                "해당 업무는 제가 담당해서 처리하도록 하겠습니다.",
                "바쁘시겠지만, 이 건에 대해 잠시 이야기 나눌 수 있을까요?",
                "검토 후 내일 오전까지 회신드리겠습니다.",
                "항상 저희 프로젝트에 많은 도움을 주셔서 진심으로 감사합니다.",
                "긍정적으로 검토해주셔서 감사합니다.",
                "궁금한 점이 있는데, 언제쯤 시간이 괜찮으신가요?",
                "제가 잠시 착각했습니다. 다시 확인하고 말씀드리겠습니다.",
                "피드백 주신 내용 반영하여 수정하도록 하겠습니다.",
                "혹시 제가 도와드릴 부분이 있다면 언제든지 말씀해주세요.",
                "이번 프로젝트를 통해 많이 배울 수 있었습니다.",
                "팀장님 덕분에 업무를 잘 마무리할 수 있었습니다.",
                "다음 주 회의 전까지 자료 준비해서 공유드리겠습니다."
            ],
            casual: [
                "말씀 주신 내용 한번 더 정리해서 공유드릴게요.",
                "이 부분은 조금만 조정하면 더 좋을 것 같아요.",
                "지금 방향 괜찮은 것 같아서 이어서 진행해볼게요.",
                "혹시 이 부분, 어떻게 생각하세요?",
                "아, 제가 이 부분은 미처 확인을 못 했네요. 죄송해요.",
                "이따 커피 한잔하면서 잠깐 얘기할까요?",
                "이거 제가 한번 해볼게요.",
                "자료 찾으시는 거, 제가 도와드릴까요?",
                "혹시 점심 약속 없으시면 같이 식사해요.",
                "오늘따라 일이 손에 잘 안 잡히네요.",
                "역시 OO님이시네요. 일 처리 정말 빠르세요.",
                "피곤해 보이는데, 어제 야근하셨어요?",
                "주말에 푹 쉬셨어요?",
                "이 부분은 아이디어가 잘 안 떠오르네요. 같이 고민해봐요.",
                "궁금한 거 있으면 언제든지 물어보세요.",
                "내일 오전에 잠깐 시간 괜찮으세요?",
                "오늘 회식, 참석하시죠?",
                "퇴근 후에 약속 있으세요?",
                "먼저 퇴근하겠습니다. 내일 봬요!",
                "오늘 하루도 고생 많으셨습니다."
            ],
            honest: [
                "현재 상황에서는 해당 일정이 현실적으로 어려울 것 같습니다.",
                "이 부분은 제 판단으로는 리스크가 있다고 생각합니다.",
                "조금 더 명확한 기준이 있으면 좋겠습니다.",
                "솔직히 말씀드리면, 이 방식은 비효율적이라고 생각합니다.",
                "제 책임 하에, 다른 방식으로 진행해보겠습니다.",
                "이 업무는 현재 제 우선순위가 아닙니다.",
                "이 부분은 제가 동의하기 어렵습니다.",
                "이 프로젝트의 목표가 무엇인지 다시 한번 명확히 해야 합니다.",
                "제 생각은 조금 다릅니다. 왜냐하면...",
                "이 문제를 해결하기 위한 다른 대안을 찾아봐야 합니다.",
                "현재의 계획으로는 예상되는 문제점들이 있습니다.",
                "이 건은 제 전문 분야가 아니라서, 다른 분께 요청하는 것이 좋을 것 같습니다.",
                "이대로 진행하면 나중에 분명 문제가 될 겁니다.",
                "이 결정에 대한 책임을 누가 질 것인지 명확히 해야 합니다.",
                "저는 이 의견에 반대합니다.",
                "지금 우리에게 필요한 것은 속도가 아니라 방향입니다.",
                "다시 원점에서 검토해야 할 필요가 있습니다.",
                "이 업무는 제 역할이 아닌 것 같습니다.",
                "이건 단순히 실수가 아니라, 시스템의 문제입니다.",
                "결론부터 말씀드리면, 저는 안 된다고 생각합니다."
            ]
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
      toneLabel: "Select Tone",
      tonePolite: "Polite",
      toneCasual: "Casual",
      toneHonest: "Honest",
      generateButton: "Generate Sentence",
      copyButton: "Copy Sentence",
      regenerateButton: "Regenerate",
      footer: "© 2026 Sentence Generator",
      copySuccess: "Sentence copied!",
      aboutTitle: "About",
      aboutSubTitle1: "Our Mission",
      aboutMission: "The 'Sentence Generator for Love & Work' aims to do more than just provide sentences; it aims to make communication between people easier and more confident. We know that many people struggle to find the right words at important moments. We want to break down these barriers and help users effectively convey their thoughts and feelings.",
      aboutSubTitle2: "What We Offer",
      aboutOffer: "Our service provides sentences in various tones, such as 'Polite,' 'Casual,' and 'Honest,' for two main situations: 'Love' and 'Work/Social Life.' Each sentence is carefully crafted considering psychological and social contexts, designed to help users communicate naturally and appropriately in any situation. We strive to provide high-quality content that offers real value, not just auto-generated content.",
      aboutSubTitle3: "About the Developer",
      aboutDeveloper: "This project was started by a solo developer who is deeply interested in how people communicate and believes that technology can create positive social change. We value user feedback and are committed to providing a better service through continuous updates.",
      contactTitle: "Contact",
      contactSubTitle: "Feedback and Inquiries",
      contactDescription: "We welcome your valuable feedback on the 'Sentence Generator for Love & Work.' Whether you have ideas for improving the service, suggestions, complaints, or partnership inquiries, we are open to hearing them.",
      contactEmail: "Please contact us at the email below, and we will respond as soon as possible.",
      privacyTitle: "Privacy Policy",
      privacyIntro: "The 'Sentence Generator for Love & Work' (hereinafter 'the Service') values your privacy and complies with the Act on Promotion of Information and Communications Network Utilization and Information Protection, etc. This Privacy Policy informs you of the purposes and methods of using the personal information you provide and the measures taken to protect your personal information.",
      privacySubTitle1: "1. Personal Information We Collect",
      privacyItem1: "Most of our content is freely accessible without a separate membership registration process. However, the following information may be automatically generated and collected when using some features:\n- Cookies, access logs, service usage records, device information.",
      privacyItem1_2: "We use your browser's `localStorage` to save your theme and language settings. This information is stored only on your device and is not sent to our servers.",
      privacySubTitle2: "2. Purpose of Collection and Use of Personal Information",
      privacyPurpose: "The Service uses the collected information for the following purposes:\n- Service improvement and new service development through statistics and analysis of service use.\n- Providing customized advertisements through advertising partners such as Google AdSense.",
      privacySubTitle3: "3. Period of Retention and Use of Personal Information",
      privacyRetention: "In principle, your personal information is destroyed without delay when the purpose of its collection and use has been achieved. However, if it is necessary to preserve it in accordance with the provisions of relevant laws and regulations, the company shall store member information for a certain period of time as stipulated by the relevant laws and regulations.",
      privacySubTitle4: "4. Changes to the Privacy Policy",
      privacyChanges: "Any additions, deletions, or corrections to this Privacy Policy in accordance with changes in laws and policies will be announced through the website's notice board (or individual notices).",
      privacyEffectiveDate: "Effective Date: January 19, 2026"
    },
    pages: {
        index: {
            title: "Sentence Generator for Love & Work",
            description: "We create sentences you can use right away in awkward situations."
        },
        about: {
            title: "About - Sentence Generator for Love & Work",
            description: "Learn about the purpose and vision of the Sentence Generator project."
        },
        contact: {
            title: "Contact - Sentence Generator for Love & Work",
            description: "Feel free to contact us with any feedback, suggestions, or inquiries."
        },
        privacy: {
            title: "Privacy Policy - Sentence Generator for Love & Work",
            description: "This page outlines our policies regarding the collection, use, and disclosure of personal information."
        }
    },
    sentences: {
        love: {
            polite: [
                "I might have surprised you by contacting you so suddenly. But I'm glad we can talk like this.",
                "I'm telling you this because I want to get to know you slowly.",
                "I don't mean to pressure you, I just wanted to be honest about my feelings.",
                "If you don't mind, could I ask if you're free this weekend?",
                "Thanks to you, I had a really great day today. Thank you.",
                "You looked so cool when you were talking, I couldn't help but stare.",
                "I'd love to have a meal with you sometime if I get the chance.",
                "That outfit you're wearing today looks really good on you.",
                "I didn't even realize how much time has passed while talking to you.",
                "This might be a bit forward, but I hope I can see you again.",
                "If it's not too much trouble, could I get your number?",
                "Have a great day and good luck with your work.",
                "I think we have similar interests, so I'd like to talk more.",
                "Your smile is really charming.",
                "I hope you have a relaxing evening.",
                "I hope we have another chance like this again.",
                "It was really nice meeting you today.",
                "I enjoyed our conversation, you seem very thoughtful.",
                "Have I been talking too much about myself? I'm curious about you too.",
                "I'll get going now. See you next time."
            ],
            casual: [
                "I've been thinking about you lately, so I just contacted you.",
                "I got excited and just sent you a message.",
                "Talking with you makes me feel good.",
                "What are you doing this weekend? Wanna watch a movie together if you have time?",
                "You look extra pretty today.",
                "I lose track of time when I'm with you.",
                "Let's go get something delicious next time.",
                "I can't sleep because I'm thinking of you.",
                "You worked hard today. Sleep well.",
                "It's good to hear your voice.",
                "Can I see you for a bit later?",
                "I want to go to that cafe you like.",
                "It's cold, so make sure you dress warmly.",
                "Did you have lunch? Make sure you eat.",
                "I'm in front of your house right now, can you come out for a sec?",
                "I saw your Instagram picture. Your trip must have been fun.",
                "I think we have really similar tastes.",
                "Is something wrong? I'm here to listen.",
                "I missed you, so I called.",
                "Your smile is the prettiest."
            ],
            honest: [
                "I didn't want to hide my feelings for you.",
                "I've been thinking about it alone, and now I'm telling you.",
                "I wanted to be honest with you.",
                "I want to get closer to you.",
                "To be honest, I liked you from the first impression.",
                "I'm so different when I'm with you compared to when I'm with others.",
                "I was jealous when you were talking to someone else.",
                "To me, you are the most special.",
                "I don't think I can just be friends with you anymore.",
                "I'm curious about everything about you.",
                "I don't want to leave this relationship ambiguous anymore.",
                "Can you tell me how you feel about me?",
                "I'm serious about you.",
                "I want to act on my feelings.",
                "I believe we can be good together.",
                "I don't want to waste time. Do you want to go out with me?",
                "Do you want to hear my answer right now?",
                "Whatever your answer is, I have no regrets.",
                "I'm confessing to you right now.",
                "Let's just date."
            ]
        },
        work: {
            polite: [
                "I fully understand the part you mentioned. However, I'd like to ask if it's possible to adjust the schedule slightly.",
                "After checking, it seems there are a few things to consider regarding that part.",
                "I'd like to inquire if it's okay to get back to you after a bit more review.",
                "Could I request additional data for this part?",
                "Could you please double-check if what I understood is correct?",
                "Thank you for your valuable input. I will discuss it with the team.",
                "If you have any reference materials, could you please share them?",
                "I may have missed something, so please feel free to let me know.",
                "I will take charge of this task.",
                "I know you're busy, but could we talk about this matter for a moment?",
                "I will review it and get back to you by tomorrow morning.",
                "Thank you always for your great help on our project.",
                "Thank you for your positive consideration.",
                "I have a question, when would be a good time for you?",
                "I was mistaken for a moment. I will double-check and let you know.",
                "I will revise the document to reflect your feedback.",
                "If there is anything I can help with, please let me know anytime.",
                "I was able to learn a lot through this project.",
                "I was able to finish the work well thanks to you, team leader.",
                "I will prepare and share the materials before next week's meeting."
            ],
            casual: [
                "I'll summarize what you said and share it again.",
                "I think this part would be better with a little adjustment.",
                "The current direction seems fine, so I'll keep going with it.",
                "What do you think about this part?",
                "Oh, I didn't check this part. I'm sorry.",
                "Should we talk for a bit over coffee later?",
                "I'll give this a try.",
                "Are you looking for some data? Can I help?",
                "If you don't have lunch plans, let's eat together.",
                "I can't seem to focus on work today.",
                "You're amazing, as always. You work so fast.",
                "You look tired. Did you work overtime yesterday?",
                "Did you have a restful weekend?",
                "I'm stuck for ideas on this part. Let's brainstorm together.",
                "If you have any questions, feel free to ask anytime.",
                "Do you have a moment tomorrow morning?",
                "You're coming to the company dinner tonight, right?",
                "Do you have plans after work?",
                "I'm heading out first. See you tomorrow!",
                "You've worked hard today."
            ],
            honest: [
                "In the current situation, that schedule seems realistically difficult.",
                "In my judgment, I think this part has some risks.",
                "I wish there were clearer standards.",
                "Frankly, I think this method is inefficient.",
                "I will proceed in a different way under my responsibility.",
                "This task is not my priority right now.",
                "I find it difficult to agree with this part.",
                "We need to clarify the goal of this project once again.",
                "I think a little differently. Because...",
                "We need to find another alternative to solve this problem.",
                "There are potential problems with the current plan.",
                "This is not my area of expertise, so it would be better to ask someone else.",
                "If we proceed like this, it will definitely become a problem later.",
                "We need to clarify who will take responsibility for this decision.",
                "I object to this opinion.",
                "What we need now is not speed, but direction.",
                "We need to review this from scratch.",
                "I don't think this task is part of my role.",
                "This is not just a mistake, it's a system problem.",
                "To get straight to the point, I don't think it's possible."
            ]
        }
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
      toneLabel: "口調選択",
      tonePolite: "丁寧に",
      toneCasual: "柔らかく",
      toneHonest: "率直に",
      generateButton: "文章を生成する",
      copyButton: "文章をコピー",
      regenerateButton: "再生成",
      footer: "© 2026 文章生成機",
      copySuccess: "文章がコピーされました！",
      aboutTitle: "紹介",
      aboutSubTitle1: "私たちの使命",
      aboutMission: "「恋愛・社会生活 文章生成機」は、単に文章を提供するだけでなく、人々のコミュニケーションをより簡単で自信のあるものにすることを目指しています。私たちは、多くの人々が重要な瞬間に適切な表現を見つけられずに苦労していることを知っています。私たちは、これらの障壁を取り除き、ユーザーが自分の考えや感情を効果的に伝えられるよう支援したいと考えています。",
      aboutSubTitle2: "何を提供していますか？",
      aboutOffer: "当社のサービスは、「恋愛」と「会社/社会生活」という2つの主要な状況に合わせて、「丁寧」、「柔らかく」、「率直」など、さまざまなトーンの文章を提供します。各文章は、心理的および社会的文脈を考慮して慎重に作成されており、ユーザーがどのような状況でも自然かつ適切にコミュニケーションできるように設計されています。私たちは、自動生成されたコンテンツではなく、真の価値を提供する高品質のコンテンツを提供することに努めています。",
      aboutSubTitle3: "開発者について",
      aboutDeveloper: "このプロジェクトは、人々のコミュニケーション方法に深く関心を持ち、テクノロジーが前向きな社会的変化を生み出すことができると信じている一人の開発者によって開始されました。私たちはユーザーのフィードバックを大切にし、継続的な更新を通じてより良いサービスを提供することに尽力しています。",
      contactTitle: "連絡先",
      contactSubTitle: "フィードバックと問い合わせ",
      contactDescription: "「恋愛・社会生活 文章生成機」に関する貴重なご意見をお待ちしております。サービスの改善のためのアイデアや提案、苦情、またはパートナーシップに関する問い合わせなど、何でも歓迎します。",
      contactEmail: "下記のメールアドレスまでご連絡いただければ、できるだけ早く返信いたします。",
      privacyTitle: "プライバシーポリシー",
      privacyIntro: "「恋愛・社会生活 文章生成機」（以下「本サービス」）は、お客様のプライバシーを尊重し、情報通信網利用促進及び情報保護等に関する法律を遵守します。本プライバシーポリシーは、お客様が提供する個人情報がどのような目的と方法で使用されているか、また個人情報を保護するためにどのような措置が講じられているかをお知らせするものです。",
      privacySubTitle1: "1. 収集する個人情報の項目",
      privacyItem1: "当社のコンテンツのほとんどは、別途会員登録をしなくても自由にアクセスできます。ただし、一部の機能をご利用になる際に、以下の情報が自動的に生成・収集される場合があります。\n- クッキー、アクセスログ、サービス利用記録、端末情報",
      privacyItem1_2: "テーマと言語の設定を保存するために、ブラウザの「localStorage」を使用します。この情報は、お客様のデバイスにのみ保存され、当社のサーバーには送信されません。",
      privacySubTitle2: "2. 個人情報の収集・利用目的",
      privacyPurpose: "本サービスは、収集した情報を以下の目的で利用します。\n- サービス利用に関する統計・分析によるサービス改善及び新規サービス開発\n- Google AdSenseなどの広告パートナーによるカスタマイズ広告の提供",
      privacySubTitle3: "3. 個人情報の保有・利用期間",
      privacyRetention: "原則として、お客様の個人情報は、その収集・利用目的が達成された時点で遅滞なく破棄されます。ただし、関連法令の規定により保存する必要がある場合は、当社は関連法令で定められた一定期間、会員情報を保管します。",
      privacySubTitle4: "4. プライバシーポリシーの変更",
      privacyChanges: "法令及び方針の変更に伴う本プライバシーポリシーの追加、削除、修正があった場合は、ウェブサイトのお知らせ（または個別のお知らせ）にてお知らせいたします。",
      privacyEffectiveDate: "施行日: 2026年1月19日"
    },
    pages: {
        index: {
            title: "恋愛・社会生活 文章生成機",
            description: "気まずい状況ですぐに使える文章を作成します。"
        },
        about: {
            title: "紹介 - 恋愛・社会生活 文章生成機",
            description: "「恋愛・社会生活 文章生成機」プロジェクトの目的とビジョンについてご紹介します。"
        },
        contact: {
            title: "連絡先 - 恋愛・社会生活 文章生成機",
            description: "フィードバック、提案、お問い合わせなど、お気軽にご連絡ください。"
        },
        privacy: {
            title: "プライバシーポリシー - 恋愛・社会生活 文章生成機",
            description: "当社の個人情報の収集、使用、開示に関する方針について説明します。"
        }
    },
    sentences: {
        love: {
            polite: [
                "突然連絡して驚かれたかもしれません。でも、こうしてお話しできて嬉しいです。",
                "ゆっくりと知っていきたいという気持ちがあって、勇気を出して申し上げます。",
                "負担をかけたいわけではなく、私の気持ちだけ率直に伝えたかったです。",
                "もしよろしければ、週末にお時間はありますでしょうか？",
                "おかげで今日は本当に楽しかったです。ありがとうございます。",
                "話している姿が素敵で、思わず見とれてしまいました。",
                "今度機会があれば、一緒にお食事でもいかがですか。",
                "今日のお洋服、とてもお似合いですね。",
                "お話していたら、時間の経つのも忘れてしまいました。",
                "少し気が早いかもしれませんが、またお会いできたら嬉しいです。",
                "もしご迷惑でなければ、連絡先を教えていただけますか？",
                "良い一日をお過ごしください。お仕事も頑張ってくださいね。",
                "趣味が似ているようなので、もっとお話ししてみたいです。",
                "笑顔が本当に魅力的ですね。",
                "どうぞ、ごゆっくり夜をお過ごしください。",
                "またこのような機会があれば嬉しいです。",
                "今日はお会いできて本当に嬉しかったです。",
                "考えが深い方だなと思って、お話しするのが楽しかったです。",
                "私ばかり話してしまいましたか？あなたのことも気になります。",
                "お先に失礼します。また今度。"
            ],
            casual: [
                "最近、つい思い出してしまって、一度連絡してみました。",
                "なんだかドキドキして、先にメッセージを送ってしまいました。",
                "君と話していると気分が良くなります。",
                "週末、何してる？時間があったら一緒に映画でもどう？",
                "今日、いつもより可愛く見えるね。",
                "君といると時間があっという間だよ。",
                "今度、美味しいもの食べに行こうよ。",
                "君のこと考えたら眠れなくなっちゃった。",
                "今日もお疲れ様。おやすみ。",
                "君の声が聞けて嬉しいな。",
                "後で少しだけ会えるかな？",
                "君が好きだっていうカフェ、私も行ってみたいな。",
                "寒いから、暖かくしてね。",
                "お昼食べた？ちゃんと食べてね。",
                "今、家の前にいるんだけど、少しだけ出てこれる？",
                "インスタの写真見たよ。旅行、楽しそうだったね。",
                "私たち、趣味が本当に合うよね。",
                "何かあったの？話、聞くよ。",
                "会いたくて連絡しちゃった。",
                "君は笑っているのが一番かわいいよ。"
            ],
            honest: [
                "好きな気持ちがあって、隠したくありませんでした。",
                "ずっと一人で悩んで、こうして話します。",
                "君に正直になりたかったんです。",
                "私は、君ともっと親しくなりたい。",
                "正直に言うと、第一印象から気になってた。",
                "他の人といる時と、君といる時の自分が全然違うんだ。",
                "君が他の人と話してると、嫉妬しちゃう。",
                "私にとっては、君が一番特別だよ。",
                "これから、ただの友達でいるのは難しいと思う。",
                "君の全部が知りたい。",
                "この関係を、これ以上あいまいにしておきたくない。",
                "君が私のこと、どう思ってるか教えてくれる？",
                "私は、君のことを真剣に考えてる。",
                "自分の気持ちに素直に行動したい。",
                "私たちは、きっとうまくいくと信じてる。",
                "時間を無駄にしたくない。私たち、付き合ってみない？",
                "私の返事、今すぐ聞きたい？",
                "君の答えがどうであれ、後悔はないよ。",
                "今、君に告白してるんだ。",
                "私たち、付き合おうよ。"
            ]
        },
        work: {
            polite: [
                "おっしゃっていただいた部分は十分に理解しております。ただ、日程上、少しだけ調整は可能かお伺いしたいです。",
                "確認したところ、その部分についていくつか考慮すべき点があるようです。",
                "もう少し検討してから改めてお話ししてもよろしいでしょうか。",
                "この部分に関する資料を追加でお願いできますでしょうか？",
                "私の理解が正しいか、再度ご確認いただけますでしょうか。",
                "貴重なご意見ありがとうございます。チームで話し合ってみます。",
                "もし参考になる資料がございましたら、共有いただけますでしょうか？",
                "私が見落としている点があるかもしれませんので、お気軽にお申し付けください。",
                "この業務は私が担当いたします。",
                "お忙しいところ恐縮ですが、この件について少しお話しさせていただけますでしょうか？",
                "検討の上、明日の午前中までにご返信いたします。",
                "いつも私たちのプロジェクトにご協力いただき、誠にありがとうございます。",
                "前向きにご検討いただき、ありがとうございます。",
                "ご質問があるのですが、いつ頃お時間がよろしいでしょうか？",
                "失礼いたしました、私の勘違いでした。再度確認してご報告します。",
                "フィードバックいただいた内容を反映し、修正いたします。",
                "もし何かお手伝いできることがあれば、いつでもお声がけください。",
                "今回のプロジェクトを通じて、多くのことを学ばせていただきました。",
                "チーム長のおかげで、無事に業務を終えることができました。",
                "来週の会議までに資料を準備し、共有いたします。"
            ],
            casual: [
                "お話しいただいた内容をもう一度まとめて共有しますね。",
                "この部分は少し調整すればもっと良くなると思います。",
                "今の方向で大丈夫そうなので、続けて進めてみます。",
                "この部分、どう思いますか？",
                "あ、すみません、この部分は確認漏れでした。",
                "後でコーヒーでも飲みながら少し話しませんか？",
                "これ、私がやってみます。",
                "何か資料をお探しですか？お手伝いしましょうか？",
                "もし昼食の予定がなければ、ご一緒しませんか？",
                "今日はどうも仕事が手に付きませんね。",
                "さすが〇〇さんですね。仕事が本当に早い。",
                "お疲れのようですね。昨日、残業でしたか？",
                "週末はゆっくり休めましたか？",
                "この部分は良いアイデアが浮かびませんね。一緒に考えてみましょう。",
                "何か分からないことがあれば、いつでも聞いてくださいね。",
                "明日の午前中、少しお時間ありますか？",
                "今夜の飲み会、参加しますよね？",
                "仕事の後、何か予定はありますか？",
                "お先に失礼します。また明日！",
                "今日一日、お疲れ様でした。"
            ],
            honest: [
                "現在の状況では、その日程は現実的に難しいと思われます。",
                "この部分は、私の判断ではリスクがあると思います。",
                "もう少し明確な基準があると嬉しいです。",
                "率直に申し上げて、この方法は非効率的だと思います。",
                "私の責任で、別の方法で進めさせていただきます。",
                "この業務は、現在私の優先事項ではありません。",
                "この点については、同意しかねます。",
                "このプロジェクトの目標が何であるか、再度明確にする必要があります。",
                "私の考えは少し違います。なぜなら…",
                "この問題を解決するために、別の代替案を探すべきです。",
                "現在の計画では、予想される問題点がいくつかあります。",
                "この件は私の専門分野ではないので、他の方にお願いするのが良いかと思います。",
                "このまま進めると、後で必ず問題になります。",
                "この決定に対して誰が責任を負うのか、明確にすべきです。",
                "私はこの意見に反対です。",
                "今私たちに必要なのは、スピードではなく方向性です。",
                "もう一度、原点に立ち返って検討する必要があります。",
                "この業務は私の役割ではないと思います。",
                "これは単なるミスではなく、システムの問題です。",
                "結論から申し上げますと、私は不可能だと考えます。"
            ]
        }
    }
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
      toneLabel: "选择语气",
      tonePolite: "郑重地",
      toneCasual: "柔和地",
      toneHonest: "坦率地",
      generateButton: "生成句子",
      copyButton: "复制句子",
      regenerateButton: "重新生成",
      footer: "© 2026 语句生成器",
      copySuccess: "句子已复制！",
      aboutTitle: "关于",
      aboutSubTitle1: "我们的使命",
      aboutMission: "“恋爱·职场语句生成器”的目标不仅仅是提供句子，更是为了让人们之间的交流更轻松、更自信。我们知道，很多人在重要时刻难以找到合适的表达方式。我们希望打破这些障碍，帮助用户有效地传达他们的想法和感受。",
      aboutSubTitle2: "我们提供什么？",
      aboutOffer: "我们的服务针对“恋爱”和“工作/社交生活”这两种主要情况，提供“郑重”、“柔和”、“坦率”等多种语气的句子。每句话都经过精心制作，考虑了心理和社会背景，旨在帮助用户在任何情况下都能自然、恰当地进行交流。我们致力于提供具有真正价值的高质量内容，而不仅仅是自动生成的内容。",
      aboutSubTitle3: "关于开发者",
      aboutDeveloper: "这个项目是由一位对人们的交流方式深感兴趣的独立开发者发起的，他相信技术可以创造积极的社会变革。我们重视用户的反馈，并致力于通过不断更新提供更好的服务。",
      contactTitle: "联系我们",
      contactSubTitle: "反馈和咨询",
      contactDescription: "我们欢迎您对“恋爱·职场语句生成器”提出宝贵意见。无论您是对改进服务的想法、建议、投诉，还是合作咨询，我们都乐于倾听。",
      contactEmail: "请通过以下电子邮件与我们联系，我们将尽快给您答复。",
      privacyTitle: "隐私政策",
      privacyIntro: "“恋爱·职场语句生成器”（以下简称“本服务”）重视您的隐私，并遵守《促进信息通信网络利用和信息保护等相关法律》。本隐私政策旨在告知您，您提供的个人信息将用于何种目的、以何种方式使用，以及为保护您的个人信息采取了哪些措施。",
      privacySubTitle1: "1. 我们收集的个人信息项目",
      privacyItem1: "我们的大部分内容无需单独注册即可免费访问。但是，在使用某些功能时，可能会自动生成并收集以下信息：\n- Cookie、访问日志、服务使用记录、设备信息。",
      privacyItem1_2: "我们使用您浏览器的 `localStorage` 来保存您的主题和语言设置。此信息仅存储在您的设备上，不会发送到我们的服务器。",
      privacySubTitle2: "2. 个人信息的收集和使用目的",
      privacyPurpose: "本服务将收集的信息用于以下目的：\n- 通过对服务使用的统计和分析来改进服务和开发新服务。\n- 通过 Google AdSense 等广告合作伙伴提供定制广告。",
      privacySubTitle3: "3. 个人信息的保留和使用期限",
      privacyRetention: "原则上，您的个人信息在其收集和使用目的实现后将立即销毁。但是，如果根据相关法律法规的规定有必要保存，本公司将按照相关法律法规规定的期限保存会员信息。",
      privacySubTitle4: "4. 隐私政策的变更",
      privacyChanges: "如果本隐私政策根据法律和政策的变化进行任何增删改动，我们将通过网站公告（或单独通知）予以公布。",
      privacyEffectiveDate: "生效日期：2026年1月19日"
    },
    pages: {
        index: {
            title: "恋爱·职场语句生成器",
            description: "在尴尬的情况下，我们会立即为您创建可以使用的句子。"
        },
        about: {
            title: "关于 - 恋爱·职场语句生成器",
            description: "了解“恋爱·职场语句生成器”项目的目的和愿景。"
        },
        contact: {
            title: "联系我们 - 恋爱·职场语句生成器",
            description: "如有任何反馈、建议或咨询，请随时与我们联系。"
        },
        privacy: {
            title: "隐私政策 - 恋爱·职场语句生成器",
            description: "本页概述了我们关于收集、使用和披露个人信息的政策。"
        }
    },
    sentences: {
        love: {
            polite: [
                "突然联系您，您可能会感到惊讶。但能这样交谈，我很高兴。",
                "我想慢慢了解你，所以鼓起勇气告诉你。",
                "我不是想给你压力，我只是想坦诚我的感受。",
                "如果您不介意的话，我能问一下您这个周末有空吗？",
                "托您的福，我今天过得很愉快。谢谢您。",
                "您说话的样子太帅了，我不知不觉地就被吸引了。",
                "下次有机会的话，我想和您一起吃顿饭。",
                "您今天穿的衣服真合身。",
                "和您聊天，我都没注意到时间过得这么快。",
                "虽然可能有点冒昧，但我希望下次还能见到您。",
                "如果不太麻烦的话，我能要您的联系方式吗？",
                "祝您有美好的一天，工作也请加油。",
                "我觉得我们的兴趣爱好很相似，所以想和您多聊聊。",
                "您的笑容真有魅力。",
                "希望您有一个轻松的夜晚。",
                "希望下次还有这样的机会。",
                "今天很高兴见到您。",
                "我觉得您是一个很有思想的人，和您聊天很愉快。",
                "我是不是光顾着说自己的事了？我也很好奇您的故事。",
                "我先走了。下次再见。"
            ],
            casual: [
                "我最近一直在想你，所以我联系了你。",
                "我很兴奋，给你发了条信息。",
                "和你聊天让我感觉很好。",
                "这个周末你干什么？有时间的话要不要一起看电影？",
                "你今天看起来格外漂亮。",
                "和你在一起，我都感觉不到时间的流逝。",
                "我们下次去吃点好吃的吧。",
                "我想你想得睡不着觉。",
                "今天也辛苦了。晚安。",
                "听到你的声音真好。",
                "待会儿能见一面吗？",
                "我也想去你喜欢的那家咖啡馆看看。",
                "天冷了，多穿点衣服。",
                "吃午饭了吗？一定要按时吃饭。",
                "我现在就在你家门口，能出来一下吗？",
                "我看到你的Instagram照片了。旅行一定很有趣吧。",
                "我觉得我们的品味真的很合拍。",
                "出什么事了吗？我可以听你倾诉。",
                "因为想你所以联系了你。",
                "你笑起来最好看。"
            ],
            honest: [
                "我不想隐藏对你的感情。",
                "我一个人想了很久，现在我告诉你。",
                "我想对你诚实。",
                "我想和你走得更近。",
                "老实说，我从第一眼就喜欢上你了。",
                "我和别人在一起的时候，和和你在一起的时候完全不一样。",
                "你和别人说话的时候，我会嫉妒。",
                "对我来说，你是最特别的。",
                "我觉得以后很难再和你只做朋友了。",
                "我好奇你的一切。",
                "我不想再让我们的关系这么模棱两可了。",
                "你能告诉我你是怎么看我的吗？",
                "我是认真地在考虑你。",
                "我想跟着我的感觉走。",
                "我相信我们可以在一起。",
                "我不想浪费时间。我们交往吧？",
                "你想现在就听到我的答复吗？",
                "不管你的回答是什么，我都不后悔。",
                "我现在是在向你表白。",
                "我们交往吧。"
            ]
        },
        work: {
            polite: [
                "我完全理解你提到的部分。但是，我想问一下是否可以稍微调整一下时间表。",
                "经查，该部分似乎有几点需要考虑。",
                "我想问一下，我是否可以在稍作审查后回复您。",
                "我可以请求这部分的额外资料吗？",
                "能否请您再次确认我的理解是否正确？",
                "谢谢您的宝贵意见。我会和团队成员讨论一下。",
                "如果您有任何可以参考的资料，可以分享一下吗？",
                "我可能遗漏了什么，所以请随时告诉我。",
                "这项工作将由我负责处理。",
                "我知道您很忙，但我们能谈谈这件事吗？",
                "我将在审查后于明天上午给您答复。",
                "非常感谢您一直以来对我们项目的大力帮助。",
                "感谢您的积极考虑。",
                "我有一个问题，您什么时候有空？",
                "我一时搞错了。我会再次确认后告诉您。",
                "我将根据您的反馈进行修改。",
                "如果有什么我可以帮忙的，请随时告诉我。",
                "通过这个项目我学到了很多。",
                "多亏了组长，我才能顺利完成工作。",
                "我将在下周会议前准备好资料并分享给大家。"
            ],
            casual: [
                "我将再次总结您所说的并分享。",
                "我认为这部分稍作调整会更好。",
                "目前的方向似乎不错，所以我会继续下去。",
                "关于这部分，您怎么看？",
                "哦，我没检查这部分。对不起。",
                "我们待会儿边喝咖啡边聊会儿天怎么样？",
                "这个我来试试。",
                "您在找资料吗？需要我帮忙吗？",
                "如果您没有午餐约会，我们一起吃饭吧。",
                "我今天好像不太能集中精力工作。",
                "不愧是您，处理事情真快。",
                "您看起来很累。昨天加班了吗？",
                "您周末休息得好吗？",
                "这部分我没什么好主意。我们一起想想吧。",
                "如果您有任何问题，请随时问我。",
                "您明天上午有空吗？",
                "您会参加今晚的公司聚餐，对吧？",
                "您下班后有安排吗？",
                "我先下班了。明天见！",
                "今天也辛苦了。"
            ],
            honest: [
                "在目前的情况下，那个日程似乎不现实。",
                "在我看来，我认为这部分存在一些风险。",
                "我希望有更明确的标准。",
                "坦白说，我认为这种方法效率低下。",
                "我将由我负责，以不同的方式进行。",
                "这项任务目前不是我的首要任务。",
                "我很难同意这部分。",
                "我们需要再次明确这个项目的目标。",
                "我的想法有点不同。因为……",
                "我们需要找到另一个替代方案来解决这个问题。",
                "目前的计划存在一些潜在问题。",
                "这不是我的专业领域，所以最好请别人来做。",
                "如果我们这样进行下去，以后肯定会出问题。",
                "我们需要明确谁将为这个决定负责。",
                "我反对这个意见。",
                "我们现在需要的不是速度，而是方向。",
                "我们需要从头开始重新审查。",
                "我认为这项任务不属于我的职责范围。",
                "这不仅仅是一个错误，这是一个系统性问题。",
                "开门见山地说，我认为这是不可能的。"
            ]
        }
    }
  }
};



function generateText() {
  const lang = localStorage.getItem('language') || 'ko';
  const category = document.getElementById("category").value;
  const tone = document.getElementById("tone").value;

  if (translations[lang] && translations[lang].sentences[category] && translations[lang].sentences[category][tone]) {
    const list = translations[lang].sentences[category][tone];
    const randomText = list[Math.floor(Math.random() * list.length)];
    document.getElementById("resultText").innerText = randomText;
    document.getElementById("resultBox").style.display = "block";
  }
}

function copyText() {
  const lang = localStorage.getItem('language') || 'ko';
  const text = document.getElementById("resultText").innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert(translations[lang].ui.copySuccess);
  });
}
