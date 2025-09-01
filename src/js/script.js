class QuizApp {
  constructor() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.score = 0;
    
    this.initializeElements();
    this.loadQuestions();
    this.setupEventListeners();
  }

  initializeElements() {
    this.progressBar = document.getElementById('progress');
    this.currentQuestionSpan = document.getElementById('current-question');
    this.totalQuestionsSpan = document.getElementById('total-questions');
    this.questionText = document.getElementById('question-text');
    this.optionsContainer = document.getElementById('options-container');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.submitBtn = document.getElementById('submit-btn');
    this.quizContainer = document.querySelector('.quiz-container');
    this.resultsContainer = document.getElementById('results-container');
    this.scorePercentage = document.getElementById('score-percentage');
    this.scoreText = document.getElementById('score-text');
    this.detailedResults = document.getElementById('detailed-results');
    this.restartBtn = document.getElementById('restart-btn');
  }

  async loadQuestions() {
    try {
      const response = await fetch('../questions.json');
      this.questions = await response.json();
      this.totalQuestionsSpan.textContent = this.questions.length;
      this.userAnswers = new Array(this.questions.length).fill(null);
      this.displayQuestion();
    } catch (error) {
      console.error('Error loading questions:', error);
      this.questionText.innerHTML = '<p style="color: red;">Error al cargar las preguntas. Por favor, recarga la página.</p>';
    }
  }

  setupEventListeners() {
    this.prevBtn.addEventListener('click', () => this.previousQuestion());
    this.nextBtn.addEventListener('click', () => this.nextQuestion());
    this.submitBtn.addEventListener('click', () => this.submitQuiz());
    this.restartBtn.addEventListener('click', () => this.restartQuiz());
  }

  displayQuestion() {
    if (this.questions.length === 0) return;

    const question = this.questions[this.currentQuestionIndex];
    this.questionText.textContent = question.question;
    
    // Update progress
    const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    this.progressBar.style.width = `${progress}%`;
    this.currentQuestionSpan.textContent = this.currentQuestionIndex + 1;

    // Clear previous options
    this.optionsContainer.innerHTML = '';

    // Create option elements
    question.options.forEach((option, index) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option';
      optionElement.innerHTML = `<span class="option-text">${option}</span>`;
      
      // Mark as selected if user has previously selected this option
      if (this.userAnswers[this.currentQuestionIndex] === index) {
        optionElement.classList.add('selected');
      }

      optionElement.addEventListener('click', () => this.selectOption(index));
      this.optionsContainer.appendChild(optionElement);
    });

    // Update navigation buttons
    this.updateNavigationButtons();
  }

  selectOption(optionIndex) {
    // Remove previous selection
    this.optionsContainer.querySelectorAll('.option').forEach(opt => {
      opt.classList.remove('selected');
    });

    // Add selection to clicked option
    this.optionsContainer.children[optionIndex].classList.add('selected');
    
    // Store user answer
    this.userAnswers[this.currentQuestionIndex] = optionIndex;

    // Update navigation buttons
    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    // Previous button
    this.prevBtn.disabled = this.currentQuestionIndex === 0;

    // Next/Submit button logic
    const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
    const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== null;

    if (isLastQuestion) {
      this.nextBtn.style.display = 'none';
      this.submitBtn.style.display = 'block';
      this.submitBtn.disabled = !this.allQuestionsAnswered();
    } else {
      this.nextBtn.style.display = 'block';
      this.submitBtn.style.display = 'none';
      this.nextBtn.disabled = !hasAnswer;
    }
  }

  allQuestionsAnswered() {
    return this.userAnswers.every(answer => answer !== null);
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.displayQuestion();
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.displayQuestion();
    }
  }

  submitQuiz() {
    this.calculateScore();
    this.showResults();
  }

  calculateScore() {
    this.score = 0;
    this.userAnswers.forEach((userAnswer, index) => {
      if (userAnswer === this.questions[index].correct_answer) {
        this.score++;
      }
    });
  }

  showResults() {
    this.quizContainer.style.display = 'none';
    this.resultsContainer.style.display = 'block';

    const percentage = Math.round((this.score / this.questions.length) * 100);
    this.scorePercentage.textContent = `${percentage}%`;

    // Set score circle class based on percentage
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.className = 'score-circle';
    if (percentage >= 90) {
      scoreCircle.classList.add('excellent');
    } else if (percentage >= 70) {
      scoreCircle.classList.add('good');
    } else if (percentage >= 50) {
      scoreCircle.classList.add('fair');
    } else {
      scoreCircle.classList.add('poor');
    }

    // Set score text
    let scoreMessage = '';
    if (percentage >= 90) {
      scoreMessage = '¡Excelente! Dominas muy bien el tema.';
    } else if (percentage >= 70) {
      scoreMessage = '¡Bien hecho! Tienes un buen conocimiento.';
    } else if (percentage >= 50) {
      scoreMessage = 'Aprobado, pero puedes mejorar.';
    } else {
      scoreMessage = 'Necesitas estudiar más el tema.';
    }
    
    this.scoreText.textContent = `${this.score} de ${this.questions.length} respuestas correctas - ${scoreMessage}`;

    // Show detailed results
    this.showDetailedResults();
  }

  showDetailedResults() {
    this.detailedResults.innerHTML = '<h3 style="margin-bottom: 20px; color: #2c3e50;">Revisión Detallada:</h3>';

    this.questions.forEach((question, index) => {
      const userAnswer = this.userAnswers[index];
      const correctAnswer = question.correct_answer;
      const isCorrect = userAnswer === correctAnswer;

      const resultItem = document.createElement('div');
      resultItem.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;

      const questionDiv = document.createElement('div');
      questionDiv.className = 'result-question';
      questionDiv.textContent = `${index + 1}. ${question.question}`;

      const answerDiv = document.createElement('div');
      answerDiv.className = 'result-answer';
      
      if (isCorrect) {
        answerDiv.innerHTML = `
          <strong style="color: #4CAF50;">✓ Correcto:</strong> ${question.options[correctAnswer]}
        `;
      } else {
        answerDiv.innerHTML = `
          <strong style="color: #f44336;">✗ Tu respuesta:</strong> ${question.options[userAnswer] || 'No respondida'}<br>
          <strong style="color: #4CAF50;">✓ Respuesta correcta:</strong> ${question.options[correctAnswer]}
        `;
      }

      resultItem.appendChild(questionDiv);
      resultItem.appendChild(answerDiv);
      this.detailedResults.appendChild(resultItem);
    });
  }

  restartQuiz() {
    this.currentQuestionIndex = 0;
    this.userAnswers = new Array(this.questions.length).fill(null);
    this.score = 0;
    
    this.resultsContainer.style.display = 'none';
    this.quizContainer.style.display = 'block';
    
    this.displayQuestion();
  }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new QuizApp();
});