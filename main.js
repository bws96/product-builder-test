const data = {
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
};

function generateText() {
  const category = document.getElementById("category").value;
  const tone = document.getElementById("tone").value;

  const list = data[category][tone];
  const randomText = list[Math.floor(Math.random() * list.length)];

  document.getElementById("resultText").innerText = randomText;
  document.getElementById("resultBox").style.display = "block";
}

function copyText() {
  const text = document.getElementById("resultText").innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert("문장이 복사되었습니다!");
  });
}