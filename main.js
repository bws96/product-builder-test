document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const languageSelector = document.getElementById('language-selector');

    // Load saved theme from localStorage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerText = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerText = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerText = '🌙';
        }
    });

    // Function to set the language
    const setLanguage = (lang) => {
        const translation = translations[lang];
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            elem.innerText = translation.ui[key];
        });
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);
    };

    languageSelector.addEventListener('change', (event) => {
        setLanguage(event.target.value);
    });

    // Load saved language or default to Korean
    const savedLang = localStorage.getItem('language') || 'ko';
    languageSelector.value = savedLang;
    setLanguage(savedLang);
});

const translations = {
  ko: {
    ui: {
      title: "연애 · 사회생활 문장 생성기",
      description: "어색한 상황에서 바로 써먹을 문장을 만들어드립니다",
      adTop: "광고 영역 (상단)",
      adMiddle: "광고 영역 (중간)",
      adBottom: "광고 영역 (하단)",
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
      copySuccess: "문장이 복사되었습니다!"
    },
    sentences: {
      love: {
        polite: [
          "갑작스럽게 연락드려서 놀라셨을 수도 있을 것 같아요.\n그래도 이렇게 이야기할 수 있어서 좋습니다.",
          "천천히 알아가고 싶은 마음이 있어서 용기 내어 말씀드려요.",
          "부담 드리려는 건 아니고, 제 마음만 솔직하게 전하고 싶었습니다."
        ],
        casual: [
          "요즘 자꾸 생각나서 그냥 한 번 연락해봤어.",
          "괜히 설레서 먼저 메시지 보내게 됐어.",
          "너랑 이야기하면 기분이 좋아져서."
        ],
        honest: [
          "좋아하는 마음이 있어서 숨기고 싶지 않았어.",
          "계속 혼자 고민하다가 이렇게 말해.",
          "너한테 솔직해지고 싶었어."
        ]
      },
      work: {
        polite: [
          "말씀해주신 부분 충분히 이해하고 있습니다.\n다만 일정상 조금만 조정이 가능할지 여쭤보고 싶습니다.",
          "확인해보니 해당 부분에 대해 몇 가지 고려할 점이 있는 것 같습니다.",
          "조금 더 검토 후 다시 말씀드려도 괜찮을지 문의드립니다."
        ],
        casual: [
          "말씀 주신 내용 한번 더 정리해서 공유드릴게요.",
          "이 부분은 조금만 조정하면 더 좋을 것 같아요.",
          "지금 방향 괜찮은 것 같아서 이어서 진행해볼게요."
        ],
        honest: [
          "현재 상황에서는 해당 일정이 현실적으로 어려울 것 같습니다.",
          "이 부분은 제 판단으로는 리스크가 있다고 생각합니다.",
          "조금 더 명확한 기준이 있으면 좋겠습니다."
        ]
      }
    }
  },
  en: {
    ui: {
      title: "Sentence Generator for Love & Work",
      description: "We create sentences you can use right away in awkward situations.",
      adTop: "Ad Area (Top)",
      adMiddle: "Ad Area (Middle)",
      adBottom: "Ad Area (Bottom)",
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
      copySuccess: "Sentence copied!"
    },
    sentences: {
      love: {
        polite: [
          "I might have surprised you by contacting you so suddenly.\nBut I'm glad we can talk like this.",
          "I'm telling you this because I want to get to know you slowly.",
          "I don't mean to pressure you, I just wanted to be honest about my feelings."
        ],
        casual: [
          "I've been thinking about you lately, so I just contacted you.",
          "I got excited and just sent you a message.",
          "Talking with you makes me feel good."
        ],
        honest: [
          "I didn't want to hide my feelings for you.",
          "I've been thinking about it alone, and now I'm telling you.",
          "I wanted to be honest with you."
        ]
      },
      work: {
        polite: [
          "I fully understand the part you mentioned.\nHowever, I'd like to ask if it's possible to adjust the schedule slightly.",
          "After checking, it seems there are a few things to consider regarding that part.",
          "I'd like to inquire if it's okay to get back to you after a bit more review."
        ],
        casual: [
          "I'll summarize the content you mentioned and share it again.",
          "I think this part would be better with a little adjustment.",
          "The current direction seems fine, so I'll continue with it."
        ],
        honest: [
          "In the current situation, that schedule seems realistically difficult.",
          "In my judgment, I think this part has some risks.",
          "I wish there were clearer standards."
        ]
      }
    }
  },
  ja: {
    ui: {
      title: "恋愛・社会生活 文章生成機",
      description: "気まずい状況ですぐに使える文章を作成します。",
      adTop: "広告エリア (上部)",
      adMiddle: "広告エリア (中間)",
      adBottom: "広告エリア (下部)",
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
      copySuccess: "文章がコピーされました！"
    },
    sentences: {
      love: {
        polite: [
          "突然連絡して驚かれたかもしれません。\nでも、こうしてお話しできて嬉しいです。",
          "ゆっくりと知っていきたいという気持ちがあって、勇気を出して申し上げます。",
          "負担をかけたいわけではなく、私の気持ちだけ率直に伝えたかったです。"
        ],
        casual: [
          "最近、つい思い出してしまって、一度連絡してみました。",
          "なんだかドキドキして、先にメッセージを送ってしまいました。",
          "君と話していると気分が良くなります。"
        ],
        honest: [
          "好きな気持ちがあって、隠したくありませんでした。",
          "ずっと一人で悩んで、こうして話します。",
          "君に正直になりたかったんです。"
        ]
      },
      work: {
        polite: [
          "おっしゃっていただいた部分は十分に理解しております。\nただ、日程上、少しだけ調整は可能かお伺いしたいです。",
          "確認したところ、その部分についていくつか考慮すべき点があるようです。",
          "もう少し検討してから改めてお話ししてもよろしいでしょうか。"
        ],
        casual: [
          "お話しいただいた内容をもう一度まとめて共有しますね。",
          "この部分は少し調整すればもっと良くなると思います。",
          "今の方向で大丈夫そうなので、続けて進めてみます。"
        ],
        honest: [
          "現在の状況では、その日程は現実的に難しいと思われます。",
          "この部分は、私の判断ではリスクがあると思います。",
          "もう少し明確な基準があると嬉しいです。"
        ]
      }
    }
  },
  zh: {
    ui: {
      title: "恋爱·职场语句生成器",
      description: "在尴尬的情况下，我们会立即为您创建可以使用的句子。",
      adTop: "广告区（上）",
      adMiddle: "广告区（中）",
      adBottom: "广告区（下）",
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
      footer: "© 2026 句子生成器",
      copySuccess: "句子已复制！"
    },
    sentences: {
      love: {
        polite: [
          "突然联系您，您可能会感到惊讶。\n但能这样交谈，我很高兴。",
          "我想慢慢了解你，所以鼓起勇气告诉你。",
          "我不是想给你压力，我只是想坦诚我的感受。"
        ],
        casual: [
          "我最近一直在想你，所以我联系了你。",
          "我很兴奋，给你发了条信息。",
          "和你聊天让我感觉很好。"
        ],
        honest: [
          "我不想隐藏对你的感情。",
          "我一个人想了很久，现在我告诉你。",
          "我想对你诚实。"
        ]
      },
      work: {
        polite: [
          "我完全理解你提到的部分。\n但是，我想问一下是否可以稍微调整一下时间表。",
          "经查，该部分似乎有几点需要考虑。",
          "我想问一下，我是否可以在稍作审查后回复您。"
        ],
        casual: [
          "我将再次总结您所说的并分享。",
          "我认为这部分稍作调整会更好。",
          "目前的方向似乎不错，所以我会继续下去。"
        ],
        honest: [
          "在目前的情况下，那个日程似乎不现实。",
          "在我看来，我认为这部分存在一些风险。",
          "我希望有更明确的标准。"
        ]
      }
    }
  }
};


function generateText() {
  const lang = localStorage.getItem('language') || 'ko';
  const category = document.getElementById("category").value;
  const tone = document.getElementById("tone").value;

  const list = translations[lang].sentences[category][tone];
  const randomText = list[Math.floor(Math.random() * list.length)];

  document.getElementById("resultText").innerText = randomText;
  document.getElementById("resultBox").style.display = "block";
}

function copyText() {
  const lang = localStorage.getItem('language') || 'ko';
  const text = document.getElementById("resultText").innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert(translations[lang].ui.copySuccess);
  });
}