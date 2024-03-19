import { App, ColorComponent, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Workspace,setIcon } from 'obsidian';
import quizPlugin from '../main'

type Question = {
  text: string;
  answers: string[];
  correct: string[];
  selected: string[];
}
const questionArr: Question[] = [];
var currQuestion = 0;

export default class QuestionsModal extends Modal {
  contentEl: HTMLElement;
  currQuestion: Question;
  pluginn: quizPlugin;
  
	constructor(app: App,pluginn: quizPlugin) {
		super(app);
    this.pluginn = pluginn;
	}

	onOpen() {
    const activeEditor = this.app.workspace.getActiveViewOfType(MarkdownView);
    const content = activeEditor?.editor.getValue();
    
    if(this.pluginn.settings.format1){
      extractQuestion(content?.toString() ?? "");
    }
    if(this.pluginn.settings.format2){
      extractQuestion2(content?.toString() ?? "");
    }
    this.currQuestion = questionArr[0];
    this.makeQuestion(this.currQuestion);
    this.containerEl.classList.add("large");
  }

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
    let size = questionArr.length;
    for(let i = 0; i<size; i++){
      questionArr.pop();
    }
	}
  makeQuestion(question: Question){

    this.contentEl.createEl("h1", { text: "Question " + (currQuestion + 1) + " out of " + questionArr.length });
    this.contentEl.createEl("p", { text: question.text });
    let randomDiv = this.contentEl.createEl("div",{attr:{class: "clickable-icon side-dock-ribbon-action"}});
    setIcon(randomDiv, "save-all");
    let circleFlag: boolean = question.correct.length == 1;
  
    const answers: HTMLElement[] = [];
    for(const ans of question.answers){
      const answerElem = this.contentEl.createEl("div",{attr:{class: "answer"}});
      let circle = answerElem.createEl("div");
      circle.createEl("div");
      answerElem.createEl("p",{text:ans});
      if(question.selected.contains(ans)){
        answerElem.classList.add("selected");
        if(circleFlag){
          answerElem.firstElementChild?.firstElementChild?.classList.add("selected-dot");
        }else{
          answerElem.firstElementChild?.firstElementChild?.classList.add("selected-square");
        }
      }
      answers.push(answerElem);
    }
    if(question.correct.length > 1){
      this.makeMultipleAnswerQuestion(answers);
    }else{
      this.makeSingleAnswerQuestion(answers);
    }
    const buttonContainer = this.contentEl.createEl("div",{attr:{class:"button-container"}})
    if(currQuestion != 0){
      const buttonElement = buttonContainer.createEl("button", { text: "previous", attr:{class:"button"}});
      buttonElement.onclick = () => this.previousQuestion();
    }else{
      buttonContainer.createEl("div", { attr:{class:"button"}});
    }
    const buttonElement = buttonContainer.createEl("button", { text: "Finish", attr:{class:"button"} });
    buttonElement.onclick = () => this.finishQuiz();
    if(currQuestion != questionArr.length-1){
      const buttonElement = buttonContainer.createEl("button", { text: "next", attr:{class:"button"} });
      buttonElement.onclick = () => this.nextQuestion();
    }else{
      buttonContainer.createEl("div", { attr:{class:"button"}});
    }
  }
  nextQuestion() {
    this.contentEl.empty();
    this.currQuestion = questionArr[++currQuestion];
    this.makeQuestion(this.currQuestion);
  }
  previousQuestion(){
    this.contentEl.empty();
    this.currQuestion = questionArr[--currQuestion];
    this.makeQuestion(this.currQuestion);
  }
  isCorrect(){
    const correctAnswers = Array.from(document.getElementsByClassName("myClass correct"));
    const selectedAnswers = Array.from(document.getElementsByClassName("selected"));
    return correctAnswers.length === selectedAnswers.length &&
    correctAnswers.every((value, index) => value === selectedAnswers[index]);
  }
  makeMultipleAnswerQuestion(answers: HTMLElement[]){
    answers.forEach(answer => {
      answer.firstElementChild?.classList.toggle("square");
      answer.addEventListener('click',() => {
        answer.classList.toggle("selected");
        answer.firstElementChild?.firstElementChild?.classList.toggle("selected-square");
        if(answer.hasClass("selected")){
          this.currQuestion.selected.push(answer.textContent || "");
        }else{
          this.currQuestion.selected.remove(answer.textContent || "");
        }
      })
    })
  }
  makeSingleAnswerQuestion(answers: HTMLElement[]){
    answers.forEach(answer => {
      answer.firstElementChild?.classList.toggle("dot");
      answer.addEventListener('click',() => {
        answers.forEach(otherElement => {
          if (otherElement !== answer) {
            otherElement.classList.remove('selected');
            otherElement.firstElementChild?.firstElementChild?.classList.remove("selected-dot");
          }
        });
        this.currQuestion.selected = [];
        answer.classList.toggle("selected");
        answer.firstElementChild?.firstElementChild?.classList.toggle("selected-dot");
        this.currQuestion.selected.push(answer.textContent || "");
      })
    })
  }
  finishQuiz(){
    let correct = 0;
    for(let question of questionArr){
      if(question.correct.length === question.selected.length && question.selected.every((value) => question.correct.contains(value))){
        correct++;
      }
    }
    // check-circle
    // x-circle
    this.contentEl.empty();
    this.contentEl.createEl("h1", { text: "You finished the quiz" });
    this.contentEl.createEl("h2", { text:  "you got " + correct + " out of " + questionArr.length + " answers correct."});
    for(let question of questionArr){
      this.contentEl.createEl("p", { text: question.text });
      for(let answer of question.answers){
          let answerEl: HTMLElement = this.contentEl.createEl("div",{ attr:{class: "answer"}})
          answerEl.createEl("p",{text:answer});
          if(question.selected.contains(answer) && !question.correct.includes(answer)){
              answerEl.classList.toggle("incorrect");
              let divEl = answerEl.createEl("div");
              setIcon(divEl,"x-circle");
          }
          if(question.correct.includes(answer)){
              if(question.selected.includes(answer)){
              answerEl.classList.toggle("selected");

              }
              answerEl.classList.toggle("correct");
              let divEl = answerEl.createEl("div");
              setIcon(divEl,"check-circle");
          }
      }
    }
    currQuestion = 0;
    
  }
}

function extractQuestion(text: string){
  const regexForQs = /> \[!question\]-? (.+?)\n(?:> - .+\n)+>> \[!success\]- Answer\n(?:>> - .+\n)+/g
  const matchQs: string[] = text.match(regexForQs) ?? [];
  for(let Qs of matchQs){
    const regex = />> - (.+)/g;
    const match = Qs.match(regex);
    const regex2 = /[^>]> - (.+)/g;
    const match2 = Qs.match(regex2)
    const regex3 = /(?:\[!question\])-? (.+)\?/g;
    const match3 = Qs.match(regex3)

    if (match) {
    const answer: string[] = match ?? [""];
    const answer2: string[] = match2 ?? [""];
    const answer3: string[] = match3 ?? [""];
    questionArr.push({text: answer3[0].replace("[!question]","").replace("-",""),answers: answer2.map(item => item.split(" - ")[1]),correct: answer.map(item => item.split(" - ")[1]),selected: []});

    }
  }
}

function extractQuestion2(text: string){
  const regexForQs = />\[!question]-? (.+?)\n(?:> - .+\n)+/g
  const matchQs: string[] = text.match(regexForQs) ?? [];

  for(let Qs of matchQs){
    const regex = /> - \[(x)](.+?)\n/g;
    const match = Qs.match(regex);
    const regex2 = /> - \[(x| )](.+?)\n/g;
    const match2 = Qs.match(regex2)
    const regex3 = /(?:\[!question\])-? (.+)\?/g;
    const match3 = Qs.match(regex3)

    if (match) {
    const answer: string[] = match ?? [""];
    const answer2: string[] = match2 ?? [""];
    const answer3: string[] = match3 ?? [""];
    questionArr.push({text: answer3[0].replace("[!question]","").replace("-",""),answers: answer2.map(item => item.split(" - ")[1]),correct: answer.map(item => item.split(" - ")[1]),selected: []});

    }
  }
}