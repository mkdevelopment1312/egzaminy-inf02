document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const currentDateEl = document.getElementById('current-date');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentPanels = document.querySelectorAll('.content-area .content-panel');
    const questionsAnsweredDisplay = document.getElementById('questions-answered-display');
    const answerQuestionBtn = document.getElementById('answer-question-btn');
    const totalQuestionsDbInfo = document.getElementById('total-questions-db-info');
    const startExamBtn = document.getElementById('start-exam-btn');
    const startNewExamBtn = document.getElementById('start-new-exam-btn');
    const fixQuestionNumberingBtn = document.getElementById('fix-question-numbering-btn');
    const headerTitle = document.querySelector('.main-header h1');

    // --- State Variables ---
    let questionsAnswered = 0;
    const QUESTIONS_ANSWERED_KEY = 'questionsAnsweredCount';
    const ACTIVITY_DATA_KEY = 'activityData';
    const USER_DATA_KEY = 'userData';
    const USER_SETTINGS_KEY = 'userSettings';
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1379541597829468170/HUNFGWiL5rP4Pg0ufYqnetA537FgY8QTu4GnyFqw19gdrZdnXi1q2eQiDnJETzi9wqYE';
    let allQuestions = [];
    let currentQuestion = null;
    let examStartTime = null;
    let userData = {
        name: '',
        lastLogin: null,
        answeredQuestions: [],
        completedExams: [],
        favorites: []
    };
    let userSettings = {
        theme: 'dark',
        fontSize: 'normal',
        notifications: true
    };

    // Create loading animation
    createLoadingAnimation();

    // --- Initialization ---
    setTimeout(() => {
        // Remove loading animation after 3 seconds
        const loadingElement = document.getElementById('loading-animation');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.remove();

                // Initialize the application
                initDate();
                loadUserData();
                initNavigation();
                initQuestionTracker();
                loadTotalQuestionsFromDB();
                initActivityChart();
                initTabSwitching();
                createNotificationSystem();
                initQuestionNumberingFix();
                initDuplicateChecker();

                // Log user visit to Discord webhook
                logUserVisit();

                // Add animation libraries for desktop
                if (!isMobileDevice()) {
                    loadAnimationLibraries();
                }
            }, 300);
        }
    }, 3000);

    // Save user data on page unload
    window.addEventListener('beforeunload', saveUserData);

    // --- Functions ---

    // Loading Animation
    function createLoadingAnimation() {
        const loadingElement = document.createElement('div');
        loadingElement.id = 'loading-animation';
        loadingElement.innerHTML = `
            <div class="loading-circle"></div>
            <p>Ładowanie...</p>
        `;
        document.body.appendChild(loadingElement);

        // Add CSS for loading animation
        const style = document.createElement('style');
        style.textContent = `
            #loading-animation {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: var(--bg-color);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                transition: opacity 0.3s ease;
            }
            .loading-circle {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                border: 4px solid rgba(48, 192, 16, 0.2);
                border-top: 4px solid var(--neon-green);
                animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
                margin-bottom: 20px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 5px var(--neon-green); }
                50% { box-shadow: 0 0 20px var(--neon-green); }
                100% { box-shadow: 0 0 5px var(--neon-green); }
            }
            #loading-animation p {
                color: var(--neon-green);
                font-size: 1.2em;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }

    // Discord Webhook Logging
    function logUserVisit() {
        try {
            // Collect user data
            const userAgent = navigator.userAgent;
            const language = navigator.language;
            const screenSize = `${window.screen.width}x${window.screen.height}`;
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const referrer = document.referrer || 'Direct';
            const visitTime = new Date().toISOString();

            // Create payload
            const payload = {
                embeds: [{
                    title: "Nowy użytkownik odwiedził stronę",
                    color: 3066993, // Green color
                    fields: [
                        { name: "Czas wizyty", value: visitTime, inline: true },
                        { name: "Przeglądarka", value: userAgent, inline: false },
                        { name: "Język", value: language, inline: true },
                        { name: "Rozmiar ekranu", value: screenSize, inline: true },
                        { name: "Strefa czasowa", value: timeZone, inline: true },
                        { name: "Źródło", value: referrer, inline: true }
                    ],
                    footer: { text: "XAXA-SOLUTIONS - System Egzaminów INF.02" }
                }]
            };

            // Send data to Discord webhook
            fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Error logging user visit:', error);
        }
    }

    // Check if device is mobile
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    }

    // Load animation libraries for desktop
    function loadAnimationLibraries() {
        try {
            // Load GSAP (GreenSock Animation Platform)
            const gsapScript = document.createElement('script');
            gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
            document.head.appendChild(gsapScript);

            // Load Anime.js
            const animeScript = document.createElement('script');
            animeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
            document.head.appendChild(animeScript);

            // Load Particles.js
            const particlesScript = document.createElement('script');
            particlesScript.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
            document.head.appendChild(particlesScript);

            // Initialize animations when libraries are loaded
            gsapScript.onload = () => {
                initGSAPAnimations();
            };

            animeScript.onload = () => {
                initAnimeAnimations();
            };

            particlesScript.onload = () => {
                initParticlesJS();
            };
        } catch (error) {
            console.error('Error loading animation libraries:', error);
        }
    }

    // Initialize GSAP animations
    function initGSAPAnimations() {
        if (typeof gsap !== 'undefined') {
            // Animate stat cards
            gsap.from('.stat-card', {
                duration: 0.8,
                opacity: 0,
                y: 30,
                stagger: 0.2,
                ease: 'power2.out'
            });

            // Animate progress bars
            gsap.from('.progress-bar', {
                duration: 1.5,
                width: 0,
                ease: 'power2.inOut',
                delay: 0.5
            });
        }
    }

    // Initialize Anime.js animations
    function initAnimeAnimations() {
        if (typeof anime !== 'undefined') {
            // Animate buttons
            anime({
                targets: '.btn-primary',
                scale: [1, 1.05, 1],
                duration: 2000,
                loop: true,
                easing: 'easeInOutQuad'
            });
        }
    }

    // Initialize Particles.js
    function initParticlesJS() {
        if (typeof particlesJS !== 'undefined') {
            // Create container for particles
            const particlesContainer = document.createElement('div');
            particlesContainer.id = 'particles-js';
            particlesContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;';
            document.body.appendChild(particlesContainer);

            // Initialize particles
            particlesJS('particles-js', {
                particles: {
                    number: { value: 50, density: { enable: true, value_area: 800 } },
                    color: { value: '#30c010' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.1, random: true },
                    size: { value: 3, random: true },
                    line_linked: { enable: true, distance: 150, color: '#30c010', opacity: 0.1, width: 1 },
                    move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out' }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } },
                    modes: { grab: { distance: 140, line_linked: { opacity: 0.3 } }, push: { particles_nb: 3 } }
                }
            });
        }
    }

    // Initialize tab switching
    function initTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;

                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and target content
                button.classList.add('active');
                document.getElementById(targetId).classList.add('active');

                // Initialize interactive learning if that tab is selected
                if (targetId === 'interactive-tab') {
                    initInteractiveLearning();
                }
            });
        });
    }

    // Interactive Learning Functionality
    function initInteractiveLearning() {
        try {
            // Topic selection
            const topicCards = document.querySelectorAll('.topic-card');
            const nextStepBtn = document.querySelector('#step-1 .next-step');
            let selectedTopic = null;

            // Clear any previous selections
            topicCards.forEach(card => {
                card.classList.remove('selected');
                card.addEventListener('click', () => {
                    // Remove selected class from all cards
                    topicCards.forEach(c => c.classList.remove('selected'));

                    // Add selected class to clicked card
                    card.classList.add('selected');
                    selectedTopic = card.dataset.topic;

                    // Enable next button
                    nextStepBtn.disabled = false;
                });
            });

            // Step navigation
            const steps = document.querySelectorAll('.step');
            const stepPanels = document.querySelectorAll('.step-panel');
            const nextButtons = document.querySelectorAll('.next-step');
            const prevButtons = document.querySelectorAll('.prev-step');
            const finishTestBtn = document.querySelector('.finish-test');
            const restartBtn = document.querySelector('.restart-learning');

            // Next step buttons
            nextButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Find current step
                    const currentStep = document.querySelector('.step.active');
                    const currentStepNumber = parseInt(currentStep.dataset.step);
                    const nextStepNumber = currentStepNumber + 1;

                    // Move to next step
                    goToStep(nextStepNumber);

                    // If moving to step 2, load learning material
                    if (nextStepNumber === 2 && selectedTopic) {
                        loadLearningMaterial(selectedTopic);
                    }

                    // If moving to step 3, generate test
                    if (nextStepNumber === 3) {
                        generateInteractiveTest(selectedTopic);
                    }
                });
            });

            // Previous step buttons
            prevButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Find current step
                    const currentStep = document.querySelector('.step.active');
                    const currentStepNumber = parseInt(currentStep.dataset.step);
                    const prevStepNumber = currentStepNumber - 1;

                    // Move to previous step
                    goToStep(prevStepNumber);
                });
            });

            // Finish test button
            if (finishTestBtn) {
                finishTestBtn.addEventListener('click', () => {
                    evaluateTest();
                    goToStep(4);
                });
            }

            // Restart button
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    resetInteractiveLearning();
                });
            }

            // Function to navigate to a specific step
            function goToStep(stepNumber) {
                // Update step indicators
                steps.forEach(step => {
                    const stepNum = parseInt(step.dataset.step);
                    step.classList.remove('active');

                    if (stepNum < stepNumber) {
                        step.classList.add('completed');
                    } else if (stepNum === stepNumber) {
                        step.classList.add('active');
                    } else {
                        step.classList.remove('completed');
                    }
                });

                // Update step panels
                stepPanels.forEach(panel => {
                    panel.classList.remove('active');
                });
                document.getElementById(`step-${stepNumber}`).classList.add('active');
            }

            // Reset interactive learning
            function resetInteractiveLearning() {
                // Reset step indicators
                steps.forEach((step, index) => {
                    step.classList.remove('active', 'completed');
                    if (index === 0) step.classList.add('active');
                });

                // Reset step panels
                stepPanels.forEach((panel, index) => {
                    panel.classList.remove('active');
                    if (index === 0) panel.classList.add('active');
                });

                // Reset topic selection
                topicCards.forEach(card => {
                    card.classList.remove('selected');
                });
                selectedTopic = null;
                nextStepBtn.disabled = true;

                // Clear containers
                document.getElementById('learning-material-container').innerHTML = `
                    <div class="loading-placeholder">
                        <div class="spinner"></div>
                        <p>Ładowanie materiału...</p>
                    </div>
                `;
                document.getElementById('interactive-test-container').innerHTML = '';
                document.getElementById('test-results-container').innerHTML = '';
            }
        } catch (error) {
            console.error('Error initializing interactive learning:', error);
            showNotification('Wystąpił błąd podczas inicjalizacji nauki interaktywnej.', 'error');
        }
    }

    // Load learning material based on selected topic
    function loadLearningMaterial(topic) {
        try {
            const container = document.getElementById('learning-material-container');

            // Show loading placeholder
            container.innerHTML = `
                <div class="loading-placeholder">
                    <div class="spinner"></div>
                    <p>Ładowanie materiału...</p>
                </div>
            `;

            // Simulate loading delay
            setTimeout(() => {
                let content = '';

                // Generate content based on topic
                switch(topic) {
                    case 'networking':
                        content = `
                            <h3>Podstawy Sieci Komputerowych</h3>
                            <div class="material-content">
                                <img src="baza_danych_2022/Multimedia/24480000-5d64-0015-1c7b-08d912ff011d.PNG" alt="Schemat sieci" style="max-width: 100%; margin-bottom: 20px;">
                                <p>Sieć komputerowa to zbiór komputerów i innych urządzeń połączonych ze sobą w celu wymiany danych i zasobów.</p>
                                <h4>Podstawowe pojęcia:</h4>
                                <ul>
                                    <li><strong>LAN</strong> (Local Area Network) - sieć lokalna, obejmująca niewielki obszar, np. dom, biuro.</li>
                                    <li><strong>WAN</strong> (Wide Area Network) - sieć rozległa, obejmująca duży obszar, np. miasto, kraj.</li>
                                    <li><strong>Router</strong> - urządzenie łączące różne sieci komputerowe.</li>
                                    <li><strong>Switch</strong> - urządzenie łączące urządzenia w sieci lokalnej.</li>
                                    <li><strong>Protokół</strong> - zestaw reguł określających sposób komunikacji w sieci.</li>
                                </ul>
                                <h4>Adresowanie IP:</h4>
                                <p>Każde urządzenie w sieci posiada unikalny adres IP, który identyfikuje je w sieci. Adresy IP dzielą się na:</p>
                                <ul>
                                    <li><strong>Adresy publiczne</strong> - używane w internecie, np. 8.8.8.8 (Google DNS)</li>
                                    <li><strong>Adresy prywatne</strong> - używane w sieciach lokalnych, np. 192.168.1.1</li>
                                </ul>
                                <p>Zakresy adresów prywatnych:</p>
                                <ul>
                                    <li>10.0.0.0 - 10.255.255.255</li>
                                    <li>172.16.0.0 - 172.31.255.255</li>
                                    <li>192.168.0.0 - 192.168.255.255</li>
                                </ul>
                            </div>
                        `;
                        break;
                    case 'hardware':
                        content = `
                            <h3>Sprzęt Komputerowy</h3>
                            <div class="material-content">
                                <img src="baza_danych_2022/Multimedia/24480000-5d64-0015-36a9-08d912f62a1a.PNG" alt="Komponenty komputera" style="max-width: 100%; margin-bottom: 20px;">
                                <p>Komputer składa się z wielu komponentów, które współpracują ze sobą, aby wykonywać zadania.</p>
                                <h4>Główne komponenty komputera:</h4>
                                <ul>
                                    <li><strong>Procesor (CPU)</strong> - "mózg" komputera, wykonuje instrukcje programów.</li>
                                    <li><strong>Pamięć RAM</strong> - pamięć tymczasowa, przechowuje dane aktualnie używanych programów.</li>
                                    <li><strong>Dysk twardy/SSD</strong> - pamięć trwała, przechowuje system operacyjny, programy i dane.</li>
                                    <li><strong>Płyta główna</strong> - łączy wszystkie komponenty komputera.</li>
                                    <li><strong>Karta graficzna</strong> - odpowiada za generowanie obrazu na monitorze.</li>
                                    <li><strong>Zasilacz</strong> - dostarcza energię elektryczną do komponentów.</li>
                                </ul>
                                <h4>Diagnostyka i naprawa:</h4>
                                <p>Podstawowe kroki diagnostyki problemów ze sprzętem:</p>
                                <ol>
                                    <li>Sprawdzenie połączeń kabli i zasilania</li>
                                    <li>Sprawdzenie wskaźników LED na urządzeniach</li>
                                    <li>Nasłuchiwanie nietypowych dźwięków</li>
                                    <li>Sprawdzenie temperatury komponentów</li>
                                    <li>Uruchomienie narzędzi diagnostycznych</li>
                                </ol>
                            </div>
                        `;
                        break;
                    case 'software':
                        content = `
                            <h3>Oprogramowanie</h3>
                            <div class="material-content">
                                <img src="baza_danych_2022/Multimedia/24480000-5d64-0015-482d-08d912ff47f8.PNG" alt="Systemy operacyjne" style="max-width: 100%; margin-bottom: 20px;">
                                <p>Oprogramowanie to programy komputerowe, które wykonują określone zadania na komputerze.</p>
                                <h4>Rodzaje oprogramowania:</h4>
                                <ul>
                                    <li><strong>System operacyjny</strong> - podstawowe oprogramowanie zarządzające zasobami komputera (Windows, Linux, macOS).</li>
                                    <li><strong>Oprogramowanie użytkowe</strong> - programy służące do wykonywania konkretnych zadań (edytory tekstu, przeglądarki internetowe).</li>
                                    <li><strong>Oprogramowanie systemowe</strong> - programy wspomagające działanie systemu operacyjnego (sterowniki, narzędzia systemowe).</li>
                                </ul>
                                <h4>Zabezpieczenia:</h4>
                                <p>Podstawowe metody zabezpieczania systemu:</p>
                                <ul>
                                    <li>Regularne aktualizacje systemu i programów</li>
                                    <li>Używanie programów antywirusowych</li>
                                    <li>Korzystanie z zapory sieciowej (firewall)</li>
                                    <li>Tworzenie kopii zapasowych danych</li>
                                    <li>Używanie silnych haseł</li>
                                </ul>
                            </div>
                        `;
                        break;
                    default:
                        content = `
                            <h3>Wybierz temat</h3>
                            <p>Proszę wybrać temat z listy, aby zobaczyć materiały do nauki.</p>
                        `;
                }

                // Update container with content
                container.innerHTML = content;

            }, 1500); // Simulate loading delay

        } catch (error) {
            console.error('Error loading learning material:', error);
            showNotification('Wystąpił błąd podczas ładowania materiału.', 'error');

            // Show error message in container
            const container = document.getElementById('learning-material-container');
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle" style="color: #c62828; font-size: 2em; margin-bottom: 15px;"></i>
                    <h4 style="color: #c62828;">Wystąpił błąd podczas ładowania materiału</h4>
                    <p>Spróbuj odświeżyć stronę lub wybrać inny temat.</p>
                </div>
            `;
        }
    }

    // Generate interactive test based on selected topic
    function generateInteractiveTest(topic) {
        try {
            const container = document.getElementById('interactive-test-container');

            // Show loading placeholder
            container.innerHTML = `
                <div class="loading-placeholder">
                    <div class="spinner"></div>
                    <p>Generowanie testu...</p>
                </div>
            `;

            // Simulate loading delay
            setTimeout(() => {
                // Generate questions based on topic
                let questions = [];

                switch(topic) {
                    case 'networking':
                        questions = [
                            {
                                question: 'Który z poniższych adresów IP jest adresem publicznym?',
                                options: [
                                    { letter: 'a', text: '192.168.1.1' },
                                    { letter: 'b', text: '10.0.0.1' },
                                    { letter: 'c', text: '8.8.8.8' },
                                    { letter: 'd', text: '172.16.0.1' }
                                ],
                                correctAnswer: 'c'
                            },
                            {
                                question: 'Które urządzenie służy do łączenia różnych sieci komputerowych?',
                                options: [
                                    { letter: 'a', text: 'Switch' },
                                    { letter: 'b', text: 'Router' },
                                    { letter: 'c', text: 'Hub' },
                                    { letter: 'd', text: 'Repeater' }
                                ],
                                correctAnswer: 'b'
                            },
                            {
                                question: 'Co oznacza skrót LAN?',
                                options: [
                                    { letter: 'a', text: 'Local Area Network' },
                                    { letter: 'b', text: 'Large Area Network' },
                                    { letter: 'c', text: 'Linked Access Network' },
                                    { letter: 'd', text: 'Long Access Node' }
                                ],
                                correctAnswer: 'a'
                            },
                            {
                                question: 'Który protokół jest używany do tłumaczenia adresów IP na adresy MAC?',
                                options: [
                                    { letter: 'a', text: 'DHCP' },
                                    { letter: 'b', text: 'DNS' },
                                    { letter: 'c', text: 'ARP' },
                                    { letter: 'd', text: 'HTTP' }
                                ],
                                correctAnswer: 'c'
                            },
                            {
                                question: 'Który zakres adresów IP jest zarezerwowany dla sieci prywatnych?',
                                options: [
                                    { letter: 'a', text: '1.0.0.0 - 1.255.255.255' },
                                    { letter: 'b', text: '192.168.0.0 - 192.168.255.255' },
                                    { letter: 'c', text: '200.0.0.0 - 200.255.255.255' },
                                    { letter: 'd', text: '11.0.0.0 - 11.255.255.255' }
                                ],
                                correctAnswer: 'b'
                            }
                        ];
                        break;
                    case 'hardware':
                        questions = [
                            {
                                question: 'Który komponent komputera jest odpowiedzialny za wykonywanie instrukcji programów?',
                                options: [
                                    { letter: 'a', text: 'Pamięć RAM' },
                                    { letter: 'b', text: 'Dysk twardy' },
                                    { letter: 'c', text: 'Procesor (CPU)' },
                                    { letter: 'd', text: 'Karta graficzna' }
                                ],
                                correctAnswer: 'c'
                            },
                            {
                                question: 'Która pamięć jest ulotna (traci dane po wyłączeniu zasilania)?',
                                options: [
                                    { letter: 'a', text: 'Dysk twardy' },
                                    { letter: 'b', text: 'Pamięć RAM' },
                                    { letter: 'c', text: 'Dysk SSD' },
                                    { letter: 'd', text: 'Pamięć ROM' }
                                ],
                                correctAnswer: 'b'
                            },
                            {
                                question: 'Co łączy wszystkie komponenty komputera?',
                                options: [
                                    { letter: 'a', text: 'Procesor' },
                                    { letter: 'b', text: 'Zasilacz' },
                                    { letter: 'c', text: 'Płyta główna' },
                                    { letter: 'd', text: 'Karta graficzna' }
                                ],
                                correctAnswer: 'c'
                            },
                            {
                                question: 'Który port jest najczęściej używany do podłączania monitorów?',
                                options: [
                                    { letter: 'a', text: 'USB' },
                                    { letter: 'b', text: 'Ethernet' },
                                    { letter: 'c', text: 'HDMI' },
                                    { letter: 'd', text: 'Audio jack' }
                                ],
                                correctAnswer: 'c'
                            },
                            {
                                question: 'Co oznacza skrót BIOS?',
                                options: [
                                    { letter: 'a', text: 'Basic Input Output System' },
                                    { letter: 'b', text: 'Binary Input Output System' },
                                    { letter: 'c', text: 'Basic Internal Operating System' },
                                    { letter: 'd', text: 'Built-In Operating System' }
                                ],
                                correctAnswer: 'a'
                            }
                        ];
                        break;
                    case 'software':
                        questions = [
                            {
                                question: 'Który z poniższych jest systemem operacyjnym?',
                                options: [
                                    { letter: 'a', text: 'Microsoft Office' },
                                    { letter: 'b', text: 'Adobe Photoshop' },
                                    { letter: 'c', text: 'Linux' },
                                    { letter: 'd', text: 'Google Chrome' }
                                ],
                                correctAnswer: 'c'
                            },
                            {
                                question: 'Co to jest sterownik?',
                                options: [
                                    { letter: 'a', text: 'Program antywirusowy' },
                                    { letter: 'b', text: 'Program umożliwiający komunikację systemu operacyjnego z urządzeniem' },
                                    { letter: 'c', text: 'Program do edycji tekstu' },
                                    { letter: 'd', text: 'Program do zarządzania plikami' }
                                ],
                                correctAnswer: 'b'
                            },
                            {
                                question: 'Który program służy do przeglądania stron internetowych?',
                                options: [
                                    { letter: 'a', text: 'Microsoft Word' },
                                    { letter: 'b', text: 'Adobe Photoshop' },
                                    { letter: 'c', text: 'Mozilla Firefox' },
                                    { letter: 'd', text: 'Microsoft Excel' }
                                ],
                                correctAnswer: 'c'
                            },
                            {
                                question: 'Co to jest malware?',
                                options: [
                                    { letter: 'a', text: 'Złośliwe oprogramowanie' },
                                    { letter: 'b', text: 'Program do tworzenia kopii zapasowych' },
                                    { letter: 'c', text: 'System operacyjny' },
                                    { letter: 'd', text: 'Program do edycji grafiki' }
                                ],
                                correctAnswer: 'a'
                            },
                            {
                                question: 'Który program służy do kompresji plików?',
                                options: [
                                    { letter: 'a', text: 'Notepad' },
                                    { letter: 'b', text: 'WinRAR' },
                                    { letter: 'c', text: 'Paint' },
                                    { letter: 'd', text: 'Calculator' }
                                ],
                                correctAnswer: 'b'
                            }
                        ];
                        break;
                    default:
                        questions = [];
                }

                // Store questions for later evaluation
                window.interactiveTestQuestions = questions;
                window.interactiveTestAnswers = new Array(questions.length).fill(null);

                // Generate HTML for questions
                let html = '';

                questions.forEach((q, index) => {
                    html += `
                        <div class="interactive-question" data-index="${index}">
                            <h5>${index + 1}. ${q.question}</h5>
                            <div class="interactive-options">
                    `;

                    q.options.forEach(option => {
                        html += `
                            <div class="interactive-option" data-letter="${option.letter}">
                                <span class="option-letter">${option.letter.toUpperCase()})</span>
                                <span class="option-text">${option.text}</span>
                            </div>
                        `;
                    });

                    html += `
                            </div>
                        </div>
                    `;
                });

                // Update container with questions
                container.innerHTML = html;

                // Add event listeners to options
                const options = document.querySelectorAll('.interactive-option');
                options.forEach(option => {
                    option.addEventListener('click', () => {
                        const questionIndex = parseInt(option.parentElement.parentElement.dataset.index);
                        const letter = option.dataset.letter;

                        // Remove selected class from all options in this question
                        const questionOptions = option.parentElement.querySelectorAll('.interactive-option');
                        questionOptions.forEach(opt => opt.classList.remove('selected'));

                        // Add selected class to clicked option
                        option.classList.add('selected');

                        // Save answer
                        window.interactiveTestAnswers[questionIndex] = letter;

                        // Enable finish button if all questions are answered
                        const finishTestBtn = document.querySelector('.finish-test');
                        if (window.interactiveTestAnswers.every(answer => answer !== null)) {
                            finishTestBtn.disabled = false;
                        }
                    });
                });

            }, 1500); // Simulate loading delay

        } catch (error) {
            console.error('Error generating interactive test:', error);
            showNotification('Wystąpił błąd podczas generowania testu.', 'error');

            // Show error message in container
            const container = document.getElementById('interactive-test-container');
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle" style="color: #c62828; font-size: 2em; margin-bottom: 15px;"></i>
                    <h4 style="color: #c62828;">Wystąpił błąd podczas generowania testu</h4>
                    <p>Spróbuj odświeżyć stronę lub wybrać inny temat.</p>
                </div>
            `;
        }
    }

    // Evaluate interactive test
    function evaluateTest() {
        try {
            const container = document.getElementById('test-results-container');

            // Show loading placeholder
            container.innerHTML = `
                <div class="loading-placeholder">
                    <div class="spinner"></div>
                    <p>Obliczanie wyników...</p>
                </div>
            `;

            // Simulate loading delay
            setTimeout(() => {
                const questions = window.interactiveTestQuestions;
                const answers = window.interactiveTestAnswers;

                if (!questions || !answers) {
                    throw new Error('Test data not found');
                }

                // Calculate score
                let correctCount = 0;
                answers.forEach((answer, index) => {
                    if (answer === questions[index].correctAnswer) {
                        correctCount++;
                    }
                });

                const totalQuestions = questions.length;
                const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

                // Generate results HTML
                let html = `
                    <div class="results-summary">
                        <div class="results-score-circle">
                            ${correctCount}/${totalQuestions}
                        </div>
                        <div class="results-message">
                            ${getResultMessage(scorePercentage)}
                        </div>
                        <div class="results-details">
                            Twój wynik: ${scorePercentage}%
                        </div>
                    </div>

                    <div class="results-questions">
                        <h5>Szczegółowe wyniki:</h5>
                `;

                // Add details for each question
                questions.forEach((q, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === q.correctAnswer;

                    html += `
                        <div class="result-question">
                            <h6>${index + 1}. ${q.question}</h6>
                            <div class="result-options">
                    `;

                    q.options.forEach(option => {
                        let optionClass = '';
                        let icon = '';

                        if (option.letter === q.correctAnswer) {
                            optionClass = 'correct';
                            icon = '<i class="fas fa-check"></i>';
                        } else if (option.letter === userAnswer && option.letter !== q.correctAnswer) {
                            optionClass = 'incorrect';
                            icon = '<i class="fas fa-times"></i>';
                        }

                        html += `
                            <div class="result-option ${optionClass}">
                                ${icon} ${option.letter.toUpperCase()}) ${option.text}
                            </div>
                        `;
                    });

                    html += `
                            </div>
                        </div>
                    `;
                });

                html += `
                    </div>
                `;

                // Update container with results
                container.innerHTML = html;

                // Show notification with result
                if (scorePercentage >= 70) {
                    showNotification(`Gratulacje! Uzyskałeś ${scorePercentage}% punktów.`, 'success');
                } else {
                    showNotification(`Uzyskałeś ${scorePercentage}% punktów. Spróbuj jeszcze raz!`, 'error');
                }

            }, 1500); // Simulate loading delay

        } catch (error) {
            console.error('Error evaluating test:', error);
            showNotification('Wystąpił błąd podczas obliczania wyników.', 'error');

            // Show error message in container
            const container = document.getElementById('test-results-container');
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle" style="color: #c62828; font-size: 2em; margin-bottom: 15px;"></i>
                    <h4 style="color: #c62828;">Wystąpił błąd podczas obliczania wyników</h4>
                    <p>Spróbuj odświeżyć stronę lub rozpocząć test od nowa.</p>
                </div>
            `;
        }
    }

    // Get result message based on score
    function getResultMessage(score) {
        if (score >= 90) {
            return 'Doskonały wynik! Świetnie opanowałeś materiał!';
        } else if (score >= 70) {
            return 'Dobry wynik! Dobrze znasz materiał.';
        } else if (score >= 50) {
            return 'Przeciętny wynik. Warto powtórzyć materiał.';
        } else {
            return 'Słaby wynik. Koniecznie powtórz materiał.';
        }
    }

    // Create notification system
    function createNotificationSystem() {
        // Create notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
        `;
        document.body.appendChild(notificationContainer);
    }

    // Show notification
    function showNotification(message, type = 'success', duration = 3000) {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) return;

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Set background color based on type
        const bgColor = type === 'success' ? '#2e7d32' : '#c62828';

        notification.style.cssText = `
            background-color: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            margin-bottom: 10px;
            transform: translateY(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            display: flex;
            align-items: center;
            min-width: 280px;
            max-width: 400px;
        `;

        // Add icon based on type
        const icon = type === 'success' ? 'check-circle' : 'times-circle';

        notification.innerHTML = `
            <i class="fas fa-${icon}" style="margin-right: 10px; font-size: 1.2em;"></i>
            <div>${message}</div>
        `;

        // Add to container
        notificationContainer.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);

        // Remove after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    // 1. Date Display
    function initDate() {
        if (currentDateEl) {
            const today = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            currentDateEl.textContent = today.toLocaleDateString('pl-PL', options);
        }
    }

    // 2. Sidebar Navigation
    function initNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.dataset.target;

                // Check if we're in an exam and trying to navigate away
                if (document.body.classList.contains('exam-in-progress') && !targetId.includes('egzaminy-section')) {
                    if (confirm('Jesteś w trakcie egzaminu. Czy na pewno chcesz opuścić egzamin? Twój postęp zostanie utracony.')) {
                        // If confirmed, reset exam and continue navigation
                        resetExam();
                    } else {
                        // If cancelled, stay in exam
                        return;
                    }
                }

                // Remove active class from all nav items and panels
                navItems.forEach(nav => nav.classList.remove('active'));
                contentPanels.forEach(panel => panel.classList.remove('active'));

                // Add active class to the clicked nav item and target panel
                item.classList.add('active');
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');

                    // Update header title based on current section
                    updateHeaderTitle(targetId);
                }
            });
        });

        // Set initial header title
        const activeNavItem = document.querySelector('.nav-item.active');
        if (activeNavItem) {
            updateHeaderTitle(activeNavItem.dataset.target);
        }
    }

    // Update header title based on current section
    function updateHeaderTitle(sectionId) {
        if (!headerTitle) return;

        switch(sectionId) {
            case 'dashboard-section':
                headerTitle.textContent = 'Dashboard';
                break;
            case 'egzaminy-section':
                headerTitle.textContent = 'Egzaminy';
                break;
            case 'nauka-section':
                headerTitle.textContent = 'Materiały do Nauki';
                break;
            case 'autor-section':
                headerTitle.textContent = 'Autor';
                break;
            default:
                headerTitle.textContent = 'Dashboard';
        }
    }

    // 3. Question Tracker
    function initQuestionTracker() {
        // Load from localStorage
        const storedCount = localStorage.getItem(QUESTIONS_ANSWERED_KEY);
        if (storedCount) {
            questionsAnswered = parseInt(storedCount, 10);
        }
        updateQuestionsAnsweredDisplay();

        // Button click handler removed as per requirements
    }

    function updateQuestionsAnsweredDisplay() {
        if (questionsAnsweredDisplay) {
            questionsAnsweredDisplay.textContent = questionsAnswered;
        }
    }

    // Initialize question numbering fix functionality
    function initQuestionNumberingFix() {
        if (fixQuestionNumberingBtn) {
            fixQuestionNumberingBtn.addEventListener('click', () => {
                // Show loading notification
                showNotification('Analizowanie numeracji pytań...', 'success', 2000);

                // Fetch the pytania.txt file
                fetch('pytania.txt')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Błąd HTTP! Status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(text => {
                        // Run the question numbering script
                        const result = analyzeAndFixQuestionNumbering(text);

                        // Show notification with the result
                        showNotification(result.message, result.fixed ? 'success' : 'error', 5000);

                        // If the numbering was fixed, download the fixed file
                        if (result.fixed) {
                            // Create a blob with the fixed content
                            const blob = new Blob([result.content], { type: 'text/plain' });

                            // Create a download link
                            const downloadLink = document.createElement('a');
                            downloadLink.href = URL.createObjectURL(blob);
                            downloadLink.download = 'pytania_fixed.txt';

                            // Append the link to the body, click it, and remove it
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);

                            // Show additional notification about the download
                            setTimeout(() => {
                                showNotification('Plik z poprawioną numeracją został pobrany. Zastąp nim oryginalny plik pytania.txt.', 'success', 8000);
                            }, 2000);
                        }
                    })
                    .catch(error => {
                        console.error('Błąd podczas analizy numeracji pytań:', error);
                        showNotification(`Wystąpił błąd: ${error.message}`, 'error', 5000);
                    });
            });
        }
    }

    // Initialize duplicate question checker functionality
    function initDuplicateChecker() {
        const checkDuplicateQuestionsBtn = document.getElementById('check-duplicate-questions-btn');
        const duplicateQuestionsModal = document.getElementById('duplicate-questions-modal');
        const closeDuplicateModalBtn = document.getElementById('close-duplicate-modal');
        const closeDuplicateAnalysisBtn = document.getElementById('close-duplicate-analysis-btn');
        const duplicateAnalysisLoading = document.getElementById('duplicate-analysis-loading');
        const duplicateAnalysisResults = document.getElementById('duplicate-analysis-results');

        if (checkDuplicateQuestionsBtn && duplicateQuestionsModal) {
            // Add event listener to the button
            checkDuplicateQuestionsBtn.addEventListener('click', () => {
                // Show the modal
                duplicateQuestionsModal.style.display = 'block';

                // Show loading, hide results
                duplicateAnalysisLoading.style.display = 'flex';
                duplicateAnalysisResults.style.display = 'none';

                // Show notification
                showNotification('Analizowanie duplikatów pytań...', 'success', 2000);

                // Fetch the pytania.txt file
                fetch('pytania.txt')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Błąd HTTP! Status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(text => {
                        // Run the duplicate checker script
                        const result = analyzeQuestionsForDuplicates(text);

                        // Hide loading, show results
                        duplicateAnalysisLoading.style.display = 'none';
                        duplicateAnalysisResults.style.display = 'block';

                        // Display the results
                        if (result.success) {
                            duplicateAnalysisResults.innerHTML = result.report;

                            // Add CSS for the report
                            const style = document.createElement('style');
                            style.textContent = `
                                .analysis-results {
                                    max-height: 70vh;
                                    overflow-y: auto;
                                    padding: 15px;
                                }
                                .duplicate-groups, .duplicate-answers {
                                    margin-bottom: 20px;
                                }
                                .duplicate-group, .question-with-duplicates {
                                    background-color: rgba(255, 255, 255, 0.05);
                                    border-radius: 5px;
                                    padding: 10px;
                                    margin-bottom: 15px;
                                }
                                .summary {
                                    font-weight: bold;
                                    padding: 10px;
                                    border-radius: 5px;
                                    text-align: center;
                                }
                                .summary.success {
                                    background-color: rgba(46, 125, 50, 0.2);
                                    color: #4caf50;
                                }
                                .summary.warning {
                                    background-color: rgba(237, 108, 2, 0.2);
                                    color: #ff9800;
                                }
                            `;
                            document.head.appendChild(style);

                            // Show notification
                            const totalIssues = result.duplicateQuestions.length + result.questionsWithDuplicateAnswers.length;
                            if (totalIssues === 0) {
                                showNotification('Nie znaleziono żadnych duplikatów pytań.', 'success', 5000);
                            } else {
                                showNotification(`Znaleziono ${totalIssues} potencjalnych problemów z pytaniami.`, 'error', 5000);
                            }
                        } else {
                            duplicateAnalysisResults.innerHTML = `
                                <div class="error-message">
                                    <i class="fas fa-exclamation-triangle" style="color: #c62828; font-size: 2em; margin-bottom: 15px;"></i>
                                    <h4 style="color: #c62828;">Wystąpił błąd podczas analizy</h4>
                                    <p>${result.message}</p>
                                </div>
                            `;

                            // Show notification
                            showNotification(`Wystąpił błąd: ${result.message}`, 'error', 5000);
                        }
                    })
                    .catch(error => {
                        // Hide loading, show results with error
                        duplicateAnalysisLoading.style.display = 'none';
                        duplicateAnalysisResults.style.display = 'block';

                        duplicateAnalysisResults.innerHTML = `
                            <div class="error-message">
                                <i class="fas fa-exclamation-triangle" style="color: #c62828; font-size: 2em; margin-bottom: 15px;"></i>
                                <h4 style="color: #c62828;">Wystąpił błąd podczas analizy</h4>
                                <p>${error.message}</p>
                            </div>
                        `;

                        console.error('Błąd podczas analizy duplikatów pytań:', error);
                        showNotification(`Wystąpił błąd: ${error.message}`, 'error', 5000);
                    });
            });

            // Add event listeners to close buttons
            if (closeDuplicateModalBtn) {
                closeDuplicateModalBtn.addEventListener('click', () => {
                    duplicateQuestionsModal.style.display = 'none';
                });
            }

            if (closeDuplicateAnalysisBtn) {
                closeDuplicateAnalysisBtn.addEventListener('click', () => {
                    duplicateQuestionsModal.style.display = 'none';
                });
            }

            // Close modal when clicking outside of it
            window.addEventListener('click', (event) => {
                if (event.target === duplicateQuestionsModal) {
                    duplicateQuestionsModal.style.display = 'none';
                }
            });
        }
    }

    // 4. Total Questions from DB
    function loadTotalQuestionsFromDB() {
        if (totalQuestionsDbInfo) {
            totalQuestionsDbInfo.textContent = 'Ładowanie...';
            fetch('pytania.txt')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Błąd HTTP! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(text => {
                    allQuestions = parseQuestions(text);

                    // Verify correct answers in questions
                    verifyCorrectAnswers(allQuestions);

                    const questionCount = allQuestions.length;

                    // Round the question count to the nearest 10 for display
                    const roundedCount = Math.round(questionCount / 10) * 10;
                    totalQuestionsDbInfo.textContent = `Pytania w bazie: ${roundedCount}`;

                    // Update dashboard total questions display
                    const dashboardTotalQuestions = document.getElementById('dashboard-total-questions');
                    if (dashboardTotalQuestions) {
                        dashboardTotalQuestions.textContent = roundedCount;
                        dashboardTotalQuestions.classList.add('question-count-highlight');
                    }

                    // Update exam setup total questions display
                    const totalQuestionsCount = document.getElementById('total-questions-count');
                    if (totalQuestionsCount) {
                        totalQuestionsCount.textContent = roundedCount;
                    }

                    // Initialize question display functionality
                    initQuestionDisplay();
                })
                .catch(error => {
                    console.error('Błąd wczytywania pliku pytania.txt:', error);
                    totalQuestionsDbInfo.textContent = 'Błąd ładowania pytań';
                });
        }
    }

    // Helper to count questions in pytania.txt
    function countQuestionsInText(text) {
        if (!text) return 0;
        // Matches "Pytanie " followed by a number, at the beginning of a line or after newlines.
        const questionRegex = /(?:^|\n\s*\n)Pytanie \d+/g;
        const matches = text.match(questionRegex);
        return matches ? matches.length : 0;
    }

    // Generate text for missing options
    function generateOptionText(questionText, existingOptions, letter, shouldBeCorrect) {
        try {
            // Common incorrect answers for different question types
            const commonIncorrectAnswers = {
                ip: [
                    "127.0.0.1",
                    "192.168.1.1",
                    "10.0.0.1",
                    "172.16.0.1",
                    "169.254.0.1"
                ],
                hardware: [
                    "Karta graficzna",
                    "Procesor",
                    "Pamięć RAM",
                    "Dysk twardy",
                    "Płyta główna",
                    "Zasilacz"
                ],
                software: [
                    "System operacyjny",
                    "Program antywirusowy",
                    "Przeglądarka internetowa",
                    "Edytor tekstu",
                    "Arkusz kalkulacyjny"
                ],
                network: [
                    "Router",
                    "Switch",
                    "Hub",
                    "Firewall",
                    "Access Point",
                    "Kabel UTP"
                ],
                protocols: [
                    "HTTP",
                    "FTP",
                    "SMTP",
                    "POP3",
                    "IMAP",
                    "SSH",
                    "Telnet"
                ]
            };

            // If this should be a correct answer (rare case)
            if (shouldBeCorrect) {
                // Look at the question to determine what might be a correct answer
                if (questionText.includes("IP") || questionText.includes("adres")) {
                    return "8.8.8.8"; // Google DNS - a public IP
                } else if (questionText.includes("protokół")) {
                    return "TCP/IP";
                } else if (questionText.includes("system")) {
                    return "Windows 10";
                } else {
                    return "Wszystkie powyższe odpowiedzi są poprawne.";
                }
            }

            // For incorrect answers
            // First, determine the question type
            let category = "general";
            if (questionText.includes("IP") || questionText.includes("adres") || questionText.includes("sieć")) {
                category = "ip";
            } else if (questionText.includes("sprzęt") || questionText.includes("urządzenie") || questionText.includes("komputer")) {
                category = "hardware";
            } else if (questionText.includes("program") || questionText.includes("system")) {
                category = "software";
            } else if (questionText.includes("sieć") || questionText.includes("LAN") || questionText.includes("WAN")) {
                category = "network";
            } else if (questionText.includes("protokół") || questionText.includes("HTTP") || questionText.includes("FTP")) {
                category = "protocols";
            }

            // Get answers from the appropriate category
            const possibleAnswers = commonIncorrectAnswers[category] || [
                "Żadna z powyższych odpowiedzi nie jest poprawna.",
                "Wszystkie powyższe odpowiedzi są poprawne.",
                "Nie można jednoznacznie określić.",
                "Zależy od konfiguracji systemu."
            ];

            // Avoid duplicating existing options
            const existingTexts = existingOptions.map(opt => opt.text);
            const availableAnswers = possibleAnswers.filter(answer => !existingTexts.includes(answer));

            // If we have available answers, pick one randomly
            if (availableAnswers.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableAnswers.length);
                return availableAnswers[randomIndex];
            }

            // Fallback if no suitable answer found
            return `Opcja ${letter.toUpperCase()}: wygenerowana automatycznie`;
        } catch (error) {
            console.error('Error generating option text:', error);
            return `Opcja ${letter.toUpperCase()}`;
        }
    }

    // Parse questions from text file with proper Polish character encoding
    function parseQuestions(text) {
        if (!text) return [];

        try {
            // Replace HTML entities with their Polish character equivalents
            text = text.replace(/&oacute;/g, 'ó')
                       .replace(/&Oacute;/g, 'Ó')
                       .replace(/&aacute;/g, 'á')
                       .replace(/&Aacute;/g, 'Á')
                       .replace(/&eacute;/g, 'é')
                       .replace(/&Eacute;/g, 'É')
                       .replace(/&iacute;/g, 'í')
                       .replace(/&Iacute;/g, 'Í')
                       .replace(/&ntilde;/g, 'ñ')
                       .replace(/&Ntilde;/g, 'Ñ')
                       .replace(/&uacute;/g, 'ú')
                       .replace(/&Uacute;/g, 'Ú')
                       .replace(/&auml;/g, 'ä')
                       .replace(/&Auml;/g, 'Ä')
                       .replace(/&euml;/g, 'ë')
                       .replace(/&Euml;/g, 'Ë')
                       .replace(/&iuml;/g, 'ï')
                       .replace(/&Iuml;/g, 'Ï')
                       .replace(/&ouml;/g, 'ö')
                       .replace(/&Ouml;/g, 'Ö')
                       .replace(/&uuml;/g, 'ü')
                       .replace(/&Uuml;/g, 'Ü')
                       .replace(/&acirc;/g, 'â')
                       .replace(/&Acirc;/g, 'Â')
                       .replace(/&ecirc;/g, 'ê')
                       .replace(/&Ecirc;/g, 'Ê')
                       .replace(/&icirc;/g, 'î')
                       .replace(/&Icirc;/g, 'Î')
                       .replace(/&ocirc;/g, 'ô')
                       .replace(/&Ocirc;/g, 'Ô')
                       .replace(/&ucirc;/g, 'û')
                       .replace(/&Ucirc;/g, 'Û')
                       .replace(/&agrave;/g, 'à')
                       .replace(/&Agrave;/g, 'À')
                       .replace(/&egrave;/g, 'è')
                       .replace(/&Egrave;/g, 'È')
                       .replace(/&igrave;/g, 'ì')
                       .replace(/&Igrave;/g, 'Ì')
                       .replace(/&ograve;/g, 'ò')
                       .replace(/&Ograve;/g, 'Ò')
                       .replace(/&ugrave;/g, 'ù')
                       .replace(/&Ugrave;/g, 'Ù')
                       .replace(/&szlig;/g, 'ß')
                       .replace(/&aring;/g, 'å')
                       .replace(/&Aring;/g, 'Å')
                       // Polish specific characters
                       .replace(/&aogon;/g, 'ą')
                       .replace(/&Aogon;/g, 'Ą')
                       .replace(/&cogon;/g, 'ć')
                       .replace(/&Cogon;/g, 'Ć')
                       .replace(/&eogon;/g, 'ę')
                       .replace(/&Eogon;/g, 'Ę')
                       .replace(/&lstrok;/g, 'ł')
                       .replace(/&Lstrok;/g, 'Ł')
                       .replace(/&nacute;/g, 'ń')
                       .replace(/&Nacute;/g, 'Ń')
                       .replace(/&sacute;/g, 'ś')
                       .replace(/&Sacute;/g, 'Ś')
                       .replace(/&zacute;/g, 'ź')
                       .replace(/&Zacute;/g, 'Ź')
                       .replace(/&zdot;/g, 'ż')
                       .replace(/&Zdot;/g, 'Ż');

            const questions = [];
            const questionBlocks = text.split(/\n\s*\n(?=Pytanie \d+)/);

            questionBlocks.forEach(block => {
                if (!block.trim().startsWith('Pytanie')) return;

                const lines = block.split('\n');
                // We'll renumber the questions later, but keep the original number for reference
                const originalNumber = lines[0].replace('Pytanie ', '').trim();
                let questionText = lines[1] ? lines[1].trim() : '';
                let mediaUrl = null;
                let options = [];
                let correctAnswer = null;

                let currentLine = 2;

                // Check for media URL
                if (lines[currentLine] && lines[currentLine].includes('[Zdjęcie/Nagranie:')) {
                    const mediaMatch = lines[currentLine].match(/\[Zdjęcie\/Nagranie: (.*?)\]/);
                    if (mediaMatch && mediaMatch[1]) {
                        mediaUrl = mediaMatch[1].trim();
                    }
                    currentLine++;
                }

                // Get answer options
                while (currentLine < lines.length) {
                    const line = lines[currentLine].trim();

                    // Check if this is an answer option
                    const optionMatch = line.match(/^([a-d])\) (.*)/i);
                    if (optionMatch) {
                        // Only add options with letters a, b, c, d
                        const letter = optionMatch[1].toLowerCase();
                        if (letter === 'a' || letter === 'b' || letter === 'c' || letter === 'd') {
                            options.push({
                                letter: letter,
                                text: optionMatch[2]
                            });
                        }
                    }

                    // Check if this is the correct answer
                    const correctMatch = line.match(/^Poprawna odpowiedź: ([a-d])/i);
                    if (correctMatch) {
                        correctAnswer = correctMatch[1].toLowerCase();
                    }

                    currentLine++;
                }

                // Sort options by letter to ensure they're in order a, b, c, d
                options.sort((a, b) => a.letter.localeCompare(b.letter));

                // Check for missing options and generate them if needed
                const requiredLetters = ['a', 'b', 'c', 'd'];
                const existingLetters = options.map(opt => opt.letter);

                // Find missing letters
                const missingLetters = requiredLetters.filter(letter => !existingLetters.includes(letter));

                // Generate missing options
                missingLetters.forEach(letter => {
                    // Generate text based on existing options and question
                    let generatedText = generateOptionText(questionText, options, letter, correctAnswer === letter);

                    options.push({
                        letter: letter,
                        text: generatedText
                    });
                });

                // Sort again after adding missing options
                options.sort((a, b) => a.letter.localeCompare(b.letter));

                // Limit to 4 options (a, b, c, d)
                if (options.length > 4) {
                    options = options.slice(0, 4);
                }

                // Only add questions with text and options
                if (questionText && options.length > 0) {
                    questions.push({
                        originalNumber: originalNumber, // Keep the original number for reference
                        number: 0, // Will be set to sequential number later
                        text: questionText,
                        mediaUrl: mediaUrl,
                        options: options,
                        correctAnswer: correctAnswer
                    });
                }
            });

            // Renumber questions sequentially
            questions.forEach((question, index) => {
                question.number = (index + 1).toString();
            });

            return questions;
        } catch (error) {
            console.error('Error parsing questions:', error);
            alert('Wystąpił błąd podczas przetwarzania pytań. Niektóre pytania mogą nie być dostępne.');
            return [];
        }
    }

    // Initialize question display functionality
    function initQuestionDisplay() {
        // Create modal for displaying questions - removed as per requirements
        // createQuestionModal();

        // Event listener for "Rozwiąż kolejne pytanie" button removed as per requirements

        // Add event listener to the "Rozpocznij nowy egzamin" button on dashboard
        if (startNewExamBtn) {
            startNewExamBtn.addEventListener('click', () => {
                // Navigate to Egzaminy section
                const egzaminyNavItem = document.querySelector('.nav-item[data-target="egzaminy-section"]');
                if (egzaminyNavItem) {
                    egzaminyNavItem.click();
                }
            });
        }

        // Add event listener to the "Rozpocznij Egzamin" button in Egzaminy section
        if (startExamBtn) {
            startExamBtn.addEventListener('click', () => {
                startExam();
            });
        }
    }

    // Create modal for displaying questions - removed as per requirements
    function createQuestionModal() {
        // Function disabled as per requirements
        console.log('Question modal functionality has been disabled');
    }

    // Show a random question in the modal
    function showRandomQuestion() {
        if (allQuestions.length === 0) return;

        // Get a random question
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        currentQuestion = allQuestions[randomIndex];

        // Update modal with question data
        const modal = document.getElementById('question-modal');
        const questionNumber = document.getElementById('modal-question-number');
        const questionText = document.getElementById('modal-question-text');
        const questionMedia = document.getElementById('modal-question-media');
        const questionOptions = document.getElementById('modal-question-options');

        questionNumber.textContent = `Pytanie ${currentQuestion.number}`;
        questionText.textContent = currentQuestion.text;

        // Display media if available
        if (currentQuestion.mediaUrl) {
            const isVideo = currentQuestion.mediaUrl.endsWith('.mp4');
            if (isVideo) {
                questionMedia.innerHTML = `
                    <video controls>
                        <source src="${currentQuestion.mediaUrl}" type="video/mp4">
                        Twoja przeglądarka nie obsługuje odtwarzania wideo.
                    </video>
                `;
            } else {
                questionMedia.innerHTML = `<img src="${currentQuestion.mediaUrl}" alt="Obrazek do pytania" onerror="this.onerror=null; this.src=''; this.alt='Nie można załadować obrazka'; this.style.border='1px solid red'; this.style.padding='10px';">`;
            }
            questionMedia.style.display = 'block';
        } else {
            questionMedia.innerHTML = '';
            questionMedia.style.display = 'none';
        }

        // Display options
        questionOptions.innerHTML = '';
        currentQuestion.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'question-option';
            optionElement.dataset.letter = option.letter;
            optionElement.innerHTML = `
                <span class="option-letter">${option.letter})</span>
                <span class="option-text">${option.text}</span>
            `;

            // Add click event to select option
            optionElement.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('.question-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // Add selected class to clicked option
                optionElement.classList.add('selected');
            });

            questionOptions.appendChild(optionElement);
        });

        // Reset show answer button
        const showAnswerBtn = document.getElementById('modal-show-answer');
        showAnswerBtn.textContent = 'Pokaż odpowiedź';
        showAnswerBtn.disabled = false;

        // Show modal
        modal.style.display = 'block';

        // Increment questions answered counter
        questionsAnswered++;
        localStorage.setItem(QUESTIONS_ANSWERED_KEY, questionsAnswered.toString());
        updateQuestionsAnsweredDisplay();

        // Update activity data
        updateActivityData();
    }

    // Show the correct answer in the modal
    function showCorrectAnswer() {
        if (!currentQuestion || !currentQuestion.correctAnswer) return;

        const options = document.querySelectorAll('.question-option');
        let isCorrect = false;
        let selectedOption = null;

        options.forEach(option => {
            const letter = option.dataset.letter;

            if (letter === currentQuestion.correctAnswer) {
                option.classList.add('correct');
                if (option.classList.contains('selected')) {
                    isCorrect = true;
                }
            } else if (option.classList.contains('selected')) {
                option.classList.add('incorrect');
                selectedOption = option;
            }
        });

        // Show notification based on answer correctness
        if (selectedOption) {
            if (isCorrect) {
                showNotification('Gratulacje! Wybrałeś poprawną odpowiedź.', 'success');
            } else {
                const correctLetter = currentQuestion.correctAnswer.toUpperCase();
                showNotification(`Przykro mi! Poprawna odpowiedź to: ${correctLetter}`, 'error');
            }
        }

        // Disable show answer button
        const showAnswerBtn = document.getElementById('modal-show-answer');
        showAnswerBtn.textContent = 'Odpowiedź wyświetlona';
        showAnswerBtn.disabled = true;
    }

    // Start an exam with random questions
    function startExam() {
        try {
            // Get exam configuration
            const questionCount = parseInt(document.getElementById('question-count').value, 10);
            const category = document.getElementById('question-category').value;
            const timeLimit = parseInt(document.getElementById('time-limit').value, 10);

            // Record exam start time
            examStartTime = new Date();

            // Hide exam setup panel and show exam interface
            document.getElementById('exam-setup').style.display = 'none';
            document.getElementById('exam-interface').style.display = 'block';

            // Update exam interface with configuration
            document.getElementById('total-questions').textContent = questionCount;

            // Set up timer if time limit is set
            if (timeLimit > 0) {
                setupExamTimer(timeLimit);
            } else {
                document.getElementById('exam-timer').style.display = 'none';
            }

            // Disable navigation during exam
            disableNavigation();

            // Load random questions for the exam
            loadExamQuestions(questionCount, category);
        } catch (error) {
            console.error('Błąd podczas rozpoczynania egzaminu:', error);
            alert('Wystąpił błąd podczas rozpoczynania egzaminu. Spróbuj ponownie.');
        }
    }

    // Disable navigation during exam
    function disableNavigation() {
        // Add exam-in-progress class to body
        document.body.classList.add('exam-in-progress');

        // Disable navigation items
        navItems.forEach(item => {
            if (!item.dataset.target.includes('egzaminy-section')) {
                item.classList.add('disabled');

                // Store original click handler
                const originalClickHandler = item.onclick;

                // Replace with warning handler
                item.onclick = function(e) {
                    e.preventDefault();
                    if (confirm('Jesteś w trakcie egzaminu. Czy na pewno chcesz opuścić egzamin? Twój postęp zostanie utracony.')) {
                        resetExam();
                        // Restore original behavior
                        if (originalClickHandler) {
                            originalClickHandler.call(this, e);
                        } else {
                            // Default navigation behavior
                            navItems.forEach(nav => nav.classList.remove('active'));
                            contentPanels.forEach(panel => panel.classList.remove('active'));

                            this.classList.add('active');
                            const targetPanel = document.getElementById(this.dataset.target);
                            if (targetPanel) {
                                targetPanel.classList.add('active');
                            }
                        }
                    }
                    return false;
                };
            }
        });
    }

    // Enable navigation after exam
    function enableNavigation() {
        // Remove exam-in-progress class from body
        document.body.classList.remove('exam-in-progress');

        // Enable navigation items
        navItems.forEach(item => {
            item.classList.remove('disabled');
            // Remove warning handler
            item.onclick = null;
        });

        // Reinitialize navigation
        initNavigation();
    }

    // Set up exam timer
    function setupExamTimer(minutes) {
        const timerElement = document.getElementById('time-remaining');
        let totalSeconds = minutes * 60;

        const timerInterval = setInterval(() => {
            const minutesLeft = Math.floor(totalSeconds / 60);
            const secondsLeft = totalSeconds % 60;

            timerElement.textContent = `${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;

            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                finishExam();
            }

            totalSeconds--;
        }, 1000);
    }

    // Load random questions for the exam
    function loadExamQuestions(count, category) {
        // Filter questions by category if needed
        let filteredQuestions = [...allQuestions];
        if (category !== 'all') {
            // This is a placeholder - in a real implementation, you would filter by category
            // For now, we'll just use all questions
        }

        // Shuffle and select the requested number of questions
        const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, count);

        // Store selected questions in a global variable for the exam
        window.examQuestions = selectedQuestions;
        window.currentExamQuestionIndex = 0;
        window.examAnswers = new Array(selectedQuestions.length).fill(null);

        // Display the first question
        displayExamQuestion(0);

        // Set up navigation buttons
        document.getElementById('next-question-btn').addEventListener('click', () => {
            // Save current answer
            saveCurrentAnswer();

            // Go to next question
            if (window.currentExamQuestionIndex < window.examQuestions.length - 1) {
                window.currentExamQuestionIndex++;
                displayExamQuestion(window.currentExamQuestionIndex);
            } else {
                finishExam();
            }
        });

        document.getElementById('prev-question-btn').addEventListener('click', () => {
            // Save current answer
            saveCurrentAnswer();

            // Go to previous question
            if (window.currentExamQuestionIndex > 0) {
                window.currentExamQuestionIndex--;
                displayExamQuestion(window.currentExamQuestionIndex);
            }
        });

        document.getElementById('show-answer-btn').addEventListener('click', () => {
            showExamAnswer();
        });

        document.getElementById('finish-exam-btn').addEventListener('click', () => {
            if (confirm('Czy na pewno chcesz zakończyć egzamin?')) {
                finishExam();
            }
        });
    }

    // Display a specific exam question
    function displayExamQuestion(index) {
        const question = window.examQuestions[index];

        // Update question number
        document.getElementById('current-question').textContent = `Pytanie ${index + 1}`;

        // Update question text
        const questionTextElement = document.getElementById('question-text');
        questionTextElement.textContent = question.text;

        // Update question media if available
        const questionMediaElement = document.getElementById('question-media');
        if (question.mediaUrl) {
            const isVideo = question.mediaUrl.endsWith('.mp4');
            if (isVideo) {
                questionMediaElement.innerHTML = `
                    <video controls>
                        <source src="${question.mediaUrl}" type="video/mp4">
                        Twoja przeglądarka nie obsługuje odtwarzania wideo.
                    </video>
                `;
            } else {
                questionMediaElement.innerHTML = `<img src="${question.mediaUrl}" alt="Obrazek do pytania" onerror="this.onerror=null; this.src=''; this.alt='Nie można załadować obrazka'; this.style.border='1px solid red'; this.style.padding='10px';">`;
            }
            questionMediaElement.style.display = 'block';
        } else {
            questionMediaElement.innerHTML = '';
            questionMediaElement.style.display = 'none';
        }

        // Update answer options
        const answerOptionsElement = document.getElementById('answer-options');
        answerOptionsElement.innerHTML = '';

        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'answer-option';
            optionElement.dataset.letter = option.letter;

            // Check if this option was previously selected
            if (window.examAnswers[index] === option.letter) {
                optionElement.classList.add('selected');
            }

            optionElement.innerHTML = `
                <span class="option-letter">${option.letter})</span>
                <span class="option-text">${option.text}</span>
            `;

            // Add click event to select option
            optionElement.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('.answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // Add selected class to clicked option
                optionElement.classList.add('selected');

                // Save the answer
                window.examAnswers[index] = option.letter;
            });

            answerOptionsElement.appendChild(optionElement);
        });

        // Reset show answer button
        document.getElementById('show-answer-btn').textContent = 'Pokaż odpowiedź';
        document.getElementById('show-answer-btn').disabled = false;

        // Disable previous button on first question
        const prevButton = document.getElementById('prev-question-btn');
        if (index === 0) {
            prevButton.disabled = true;
            prevButton.classList.add('disabled');
        } else {
            prevButton.disabled = false;
            prevButton.classList.remove('disabled');
        }
    }

    // Save the current answer
    function saveCurrentAnswer() {
        const selectedOption = document.querySelector('.answer-option.selected');
        if (selectedOption) {
            window.examAnswers[window.currentExamQuestionIndex] = selectedOption.dataset.letter;
        }
    }

    // Show the correct answer for the current exam question
    function showExamAnswer() {
        const currentQuestion = window.examQuestions[window.currentExamQuestionIndex];
        if (!currentQuestion || !currentQuestion.correctAnswer) return;

        const options = document.querySelectorAll('.answer-option');
        let isCorrect = false;
        let selectedOption = null;

        options.forEach(option => {
            const letter = option.dataset.letter;

            if (letter === currentQuestion.correctAnswer) {
                option.classList.add('correct');
                if (option.classList.contains('selected')) {
                    isCorrect = true;
                }
            } else if (option.classList.contains('selected')) {
                option.classList.add('incorrect');
                selectedOption = option;
            }
        });

        // Show notification based on answer correctness
        if (selectedOption) {
            if (isCorrect) {
                showNotification('Gratulacje! Wybrałeś poprawną odpowiedź.', 'success');
            } else {
                const correctLetter = currentQuestion.correctAnswer.toUpperCase();
                showNotification(`Przykro mi! Poprawna odpowiedź to: ${correctLetter}`, 'error');
            }
        }

        // Disable show answer button
        document.getElementById('show-answer-btn').textContent = 'Odpowiedź wyświetlona';
        document.getElementById('show-answer-btn').disabled = true;
    }

    // Finish the exam and show results
    function finishExam() {
        try {
            // Save the last answer
            saveCurrentAnswer();

            // Calculate results
            let correctCount = 0;
            let answeredCount = 0;
            for (let i = 0; i < window.examQuestions.length; i++) {
                if (window.examAnswers[i] !== null) {
                    answeredCount++;
                    if (window.examAnswers[i] === window.examQuestions[i].correctAnswer) {
                        correctCount++;
                    }
                }
            }

            const totalQuestions = window.examQuestions.length;
            // Calculate score based on all questions in the exam
            const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

            // Calculate elapsed time
            let elapsedTimeText = "00:00";
            if (examStartTime) {
                const endTime = new Date();
                const elapsedMilliseconds = endTime - examStartTime;
                const elapsedMinutes = Math.floor(elapsedMilliseconds / 60000);
                const elapsedSeconds = Math.floor((elapsedMilliseconds % 60000) / 1000);
                elapsedTimeText = `${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')}`;
            }

            // Update results panel
            document.getElementById('correct-answers').textContent = correctCount;
            document.getElementById('total-answers').textContent = totalQuestions;
            document.getElementById('score-percentage').textContent = `${scorePercentage}%`;
            document.getElementById('correct-count').textContent = correctCount;
            document.getElementById('incorrect-count').textContent = totalQuestions - correctCount;
            document.getElementById('exam-time').textContent = elapsedTimeText;

            // Hide exam interface and show results
            document.getElementById('exam-interface').style.display = 'none';
            document.getElementById('exam-results').style.display = 'block';

            // Re-enable navigation
            enableNavigation();

            // Update dashboard stats
            updateDashboardStats(scorePercentage);

            // Add event listener to new exam button
            document.getElementById('new-exam-btn').addEventListener('click', () => {
                resetExam();
            });
        } catch (error) {
            console.error('Błąd podczas kończenia egzaminu:', error);
            alert('Wystąpił błąd podczas kończenia egzaminu. Odśwież stronę i spróbuj ponownie.');
            // Try to re-enable navigation in case of error
            enableNavigation();
        }
    }

    // Reset exam to start a new one
    function resetExam() {
        try {
            // Hide results and show setup
            document.getElementById('exam-results').style.display = 'none';
            document.getElementById('exam-interface').style.display = 'none';
            document.getElementById('exam-setup').style.display = 'flex';

            // Reset exam variables
            window.examQuestions = null;
            window.currentExamQuestionIndex = 0;
            window.examAnswers = null;
            examStartTime = null;

            // Re-enable navigation
            enableNavigation();
        } catch (error) {
            console.error('Błąd podczas resetowania egzaminu:', error);
            alert('Wystąpił błąd podczas resetowania egzaminu. Odśwież stronę i spróbuj ponownie.');
        }
    }

    // Verify and fix questions to ensure they have correct answers and all required options
    function verifyCorrectAnswers(questions) {
        try {
            console.log('Verifying and fixing questions for', questions.length, 'questions');

            // Database of known correct answers for common questions
            const knownCorrectAnswers = {
                // Linux commands
                "Do wyświetlenia zawartości katalogu w systemie Linux służy polecenie": {
                    correctText: "ls",
                    explanation: "Polecenie 'ls' (list) służy do wyświetlania zawartości katalogu w systemie Linux."
                },
                "W systemie Linux polecenie chmod umożliwia": {
                    correctText: "ustawienie praw dostępu do pliku",
                    explanation: "Polecenie 'chmod' (change mode) służy do zmiany uprawnień dostępu do plików i katalogów."
                },
                "W systemie operacyjnym Linux do utworzenia archiwum danych należy wykorzystać program": {
                    correctText: "tar",
                    explanation: "Program 'tar' (tape archive) służy do tworzenia archiwów w systemie Linux."
                },
                "Do aktualizacji systemów Linux można wykorzystać programy": {
                    correctText: "apt-get i zypper",
                    explanation: "apt-get (Debian/Ubuntu) i zypper (SUSE) to menedżery pakietów używane do aktualizacji systemów Linux."
                },
                "Dla danego użytkownika w systemie Linux polecenie usermod -s pozwala na": {
                    correctText: "zmianę jego powłoki systemowej",
                    explanation: "Opcja -s (shell) polecenia usermod służy do zmiany powłoki systemowej użytkownika."
                },
                "W systemie Linux odpowiednikiem programu Windows o nazwie chkdsk jest program": {
                    correctText: "fsck",
                    explanation: "Program fsck (file system check) służy do sprawdzania i naprawy systemów plików w Linux, podobnie jak chkdsk w Windows."
                },

                // Networking
                "Który adres IP należy do klasy A?": {
                    correctText: "125.11.0.7",
                    explanation: "Adresy klasy A mają pierwszy oktet w zakresie 1-126."
                },
                "Który protokół umożliwia hostom uzyskanie z serwera danych konfiguracyjnych interfejsu sieciowego, takich jak np. adres IP, brama domyślna?": {
                    correctText: "DHCP",
                    explanation: "DHCP (Dynamic Host Configuration Protocol) służy do automatycznej konfiguracji interfejsu sieciowego."
                },
                "Narzędziem blokującym ataki hakerskie z zewnątrz jest": {
                    correctText: "zapora sieciowa",
                    explanation: "Zapora sieciowa (firewall) służy do blokowania nieautoryzowanego dostępu do sieci."
                },
                "Sieć o adresie 192.168.1.128/29 pozwala na zaadresowanie": {
                    correctText: "6 hostów",
                    explanation: "Maska /29 daje 3 bity dla hostów, co pozwala na 2^3-2=6 adresów hostów."
                },
                "Który protokół nie funkcjonuje w warstwie aplikacji modelu ISO/OSI?": {
                    correctText: "IP",
                    explanation: "Protokół IP działa w warstwie sieci (3), a nie w warstwie aplikacji (7) modelu ISO/OSI."
                },
                "Który protokół jest wykorzystywany do transmisji danych w warstwie transportowej modelu ISO/OSI?": {
                    correctText: "TCP",
                    explanation: "TCP (Transmission Control Protocol) działa w warstwie transportowej (4) modelu ISO/OSI."
                },
                "Jaką nazwę nosi identyfikator, który musi być identyczny, by urządzenia sieciowe mogły pracować w danej sieci bezprzewodowej?": {
                    correctText: "SSID",
                    explanation: "SSID (Service Set Identifier) to nazwa sieci bezprzewodowej, która musi być identyczna dla wszystkich urządzeń w tej sieci."
                },
                "Aby zabezpieczyć sieć bezprzewodową przed nieautoryzowanym dostępem, należy między innymi": {
                    correctText: "włączyć filtrowanie adresów MAC",
                    explanation: "Filtrowanie adresów MAC pozwala na ograniczenie dostępu do sieci tylko dla urządzeń o określonych adresach sprzętowych."
                },
                "Który typ zabezpieczeń w sieci WiFi posiada najlepszy poziom zabezpieczeń?": {
                    correctText: "WPA2",
                    explanation: "WPA2 (Wi-Fi Protected Access 2) oferuje najwyższy poziom zabezpieczeń spośród wymienionych."
                },
                "Cechą charakterystyczną topologii gwiazdy jest": {
                    correctText: "centralne zarządzanie siecią",
                    explanation: "W topologii gwiazdy wszystkie urządzenia są podłączone do centralnego punktu, co ułatwia zarządzanie siecią."
                },
                "Które urządzenie zastosowane w sieci komputerowej nie zmienia liczby domen kolizyjnych?": {
                    correctText: "Koncetrator",
                    explanation: "Koncentrator (hub) nie dzieli sieci na domeny kolizyjne, w przeciwieństwie do przełącznika (switch)."
                },

                // Hardware
                "Ktory typ złącza na płycie głównej umożliwia zamontowanie przedstawionej karty graficznej?": {
                    correctText: "PCIe x16",
                    explanation: "Nowoczesne karty graficzne wykorzystują złącze PCIe x16."
                },
                "Czynnym elementem elektronicznym jest": {
                    correctText: "tranzystor",
                    explanation: "Tranzystor jest aktywnym elementem elektronicznym, w przeciwieństwie do pasywnych jak rezystor czy kondensator."
                },
                "Rozdzielczość optyczna to jeden z parametrów": {
                    correctText: "skanera",
                    explanation: "Rozdzielczość optyczna określa liczbę punktów na cal (DPI), które skaner może odczytać, jest to jego podstawowy parametr."
                },
                "W układzie SI jednostką miary napięcia jest": {
                    correctText: "wolt",
                    explanation: "Wolt (V) jest jednostką napięcia elektrycznego w układzie SI."
                },
                "Stosunek ładunku zgromadzonego na przewodniku do potencjału tego przewodnika określa jego": {
                    correctText: "pojemność elektryczną",
                    explanation: "Pojemność elektryczna to stosunek ładunku do potencjału, mierzona w faradach (F)."
                },
                "Plik ma rozmiar 2 KiB. W przeliczeniu na bity jest to": {
                    correctText: "16384 bitów",
                    explanation: "2 KiB = 2 * 1024 bajty = 2048 bajtów, 2048 * 8 = 16384 bitów."
                },

                // Windows
                "Wydając w wierszu poleceń systemu Windows polecenie convert, można przeprowadzić": {
                    correctText: "zmianę systemu plików",
                    explanation: "Polecenie convert w Windows służy do konwersji partycji z FAT/FAT32 na NTFS."
                },
                "Za pomocą polecenia dxdiag wywołanego z wiersza poleceń systemu Windows można": {
                    correctText: "sprawdzić parametry karty graficznej",
                    explanation: "Narzędzie DirectX Diagnostic Tool (dxdiag) służy do sprawdzania informacji o komponentach systemu, w tym karty graficznej."
                },
                "Które narzędzie jest stosowane do weryfikacji sterowników w systemie Windows?": {
                    correctText: "verifier",
                    explanation: "Driver Verifier (verifier) to narzędzie do testowania sterowników w systemie Windows."
                },
                "Sprawdzenie minimalnego okresu ważności hasła w systemie Windows umożliwia polecenie": {
                    correctText: "net accounts",
                    explanation: "Polecenie net accounts wyświetla informacje o zasadach haseł, w tym minimalny okres ważności."
                },

                // Bezpieczeństwo
                "Który z symboli oznacza zastrzeżenie praw autorskich?": {
                    correctText: "C",
                    explanation: "Symbol © (Copyright) oznacza zastrzeżenie praw autorskich."
                },
                "Wskaż sygnał oznaczający błąd karty graficznej komputera wyposażonego w BIOS POST firmy AWARD.": {
                    correctText: "1 długi, 2 krótkie",
                    explanation: "W BIOS POST firmy AWARD, sekwencja 1 długi, 2 krótkie sygnały oznacza błąd karty graficznej."
                },

                // Specific questions from issue description
                "Który z adresów IP jest adresem publicznym?": {
                    correctText: "8.8.8.8",
                    explanation: "Adres 8.8.8.8 (Google DNS) jest adresem publicznym, adresy 10.x.x.x, 172.16-31.x.x i 192.168.x.x są adresami prywatnymi."
                },
                "Aby wyczyścić z kurzu wnętrze obudowy drukarki fotograficznej, należy użyć": {
                    correctText: "sprężonego powietrza w pojemniku z wydłużoną rurką",
                    explanation: "Sprężone powietrze jest bezpiecznym sposobem czyszczenia wnętrza urządzeń elektronicznych z kurzu."
                },
                "Na schemacie obrazującym zasadę działania monitora plazmowego numerem 6 oznaczono": {
                    correctText: "warstwę dielektryka",
                    explanation: "W monitorach plazmowych warstwa dielektryka jest jednym z kluczowych elementów konstrukcyjnych."
                },
                "Wskaż narzędzie służące do mocowania pojedynczych żył kabla miedzianego w złączach.": {
                    correctText: "C",
                    explanation: "Narzędzie oznaczone jako C na obrazku to narzędzie do mocowania żył kabla miedzianego w złączach."
                },
                "Wskaż adres rozgłoszeniowy sieci, do której należy host o adresie 88.89.90.91/6?": {
                    correctText: "91.255.255.255",
                    explanation: "Dla maski /6, adres rozgłoszeniowy to 91.255.255.255."
                },
                "Przedstawione polecenia, uruchomione w interfejsie CLI rutera firmy CISCO, spowodują": {
                    correctText: "ustawienie interfejsu wewnętrznego o adresie 10.0.0.1/24 dla technologii NAT",
                    explanation: "Polecenia konfigurują interfejs wewnętrzny dla NAT z adresem 10.0.0.1/24."
                },
                "Schemat przedstawia zasadę działania sieci VPN o nazwie": {
                    correctText: "Site - to - Site",
                    explanation: "Schemat przedstawia połączenie VPN typu Site-to-Site, które łączy dwie sieci lokalne przez Internet."
                },
                "Przedstawione narzędzie może być wykorzystane do": {
                    correctText: "sprawdzenia długości badanego kabla sieciowego",
                    explanation: "Narzędzie to tester kabli, który może być używany do sprawdzania długości kabla sieciowego."
                },
                "Wskaż program systemu Linux, służący do kompresji danych.": {
                    correctText: "gzip",
                    explanation: "Program gzip służy do kompresji danych w systemie Linux."
                },
                "SuperPi to program wykorzystywany do sprawdzenia": {
                    correctText: "wydajności procesorów o zwiększonej częstotliwości",
                    explanation: "SuperPi jest benchmarkiem używanym do testowania wydajności procesorów, szczególnie po podkręceniu."
                },
                "Konfigurację interfejsu sieciowego w systemie Linux można wykonać, edytując plik": {
                    correctText: "/ etc / network / interfaces",
                    explanation: "Plik /etc/network/interfaces zawiera konfigurację interfejsów sieciowych w systemie Linux."
                },
                "W systemie Linux polecenie touch służy do": {
                    correctText: "utworzenia pliku lub zmiany daty modyfikacji lub daty ostatniego dostępu",
                    explanation: "Polecenie touch tworzy pusty plik lub aktualizuje znaczniki czasu istniejącego pliku."
                },
                "Protokół RDP jest wykorzystywany w usłudze": {
                    correctText: "pulpitu zdalnego w systemie Windows",
                    explanation: "RDP (Remote Desktop Protocol) jest używany w usłudze pulpitu zdalnego Windows."
                }
            };

            // Group questions by text to identify duplicates
            const questionsByText = {};
            questions.forEach(q => {
                const key = q.text.trim();
                if (!questionsByText[key]) {
                    questionsByText[key] = [];
                }
                questionsByText[key].push(q);
            });

            // Fix duplicate questions by ensuring they have the same correct answer
            let duplicateQuestionCount = 0;
            Object.keys(questionsByText).forEach(key => {
                const duplicates = questionsByText[key];
                if (duplicates.length > 1) {
                    duplicateQuestionCount++;

                    // Find the duplicate with a valid correct answer
                    const validDuplicate = duplicates.find(d => 
                        d.correctAnswer && 
                        d.options.some(opt => opt.letter === d.correctAnswer)
                    );

                    if (validDuplicate) {
                        // Apply the valid correct answer to all duplicates
                        duplicates.forEach(d => {
                            if (d !== validDuplicate) {
                                console.log(`Fixing duplicate question ${d.number}: Setting correct answer to ${validDuplicate.correctAnswer}`);
                                d.correctAnswer = validDuplicate.correctAnswer;
                            }
                        });
                    }
                }
            });
            console.log(`Found and processed ${duplicateQuestionCount} questions with duplicates`);

            // Check questions against known correct answers database
            let fixedKnownAnswersCount = 0;
            questions.forEach(q => {
                const knownAnswer = knownCorrectAnswers[q.text.trim()];
                if (knownAnswer) {
                    // Find the option that matches the known correct answer
                    const correctOption = q.options.find(opt => 
                        opt.text.trim().toLowerCase() === knownAnswer.correctText.toLowerCase()
                    );

                    if (correctOption) {
                        // If the current correct answer is different from what we know is correct
                        if (q.correctAnswer !== correctOption.letter) {
                            console.log(`Question ${q.number}: Fixing known answer from ${q.correctAnswer || 'none'} to ${correctOption.letter} (${correctOption.text})`);
                            q.correctAnswer = correctOption.letter;
                            fixedKnownAnswersCount++;
                        }
                    } else {
                        // The correct answer text isn't in the options
                        // Look for partial matches
                        const partialMatches = q.options.filter(opt => 
                            knownAnswer.correctText.toLowerCase().includes(opt.text.trim().toLowerCase()) ||
                            opt.text.trim().toLowerCase().includes(knownAnswer.correctText.toLowerCase())
                        );

                        if (partialMatches.length === 1) {
                            if (q.correctAnswer !== partialMatches[0].letter) {
                                console.log(`Question ${q.number}: Fixing known answer from ${q.correctAnswer || 'none'} to ${partialMatches[0].letter} (partial match: ${partialMatches[0].text})`);
                                q.correctAnswer = partialMatches[0].letter;
                                fixedKnownAnswersCount++;
                            }
                        }
                    }
                }
            });
            console.log(`Fixed ${fixedKnownAnswersCount} questions based on known correct answers`);

            // Count questions without correct answers
            const questionsWithoutCorrectAnswers = questions.filter(q => !q.correctAnswer);

            if (questionsWithoutCorrectAnswers.length > 0) {
                console.warn(`Found ${questionsWithoutCorrectAnswers.length} questions without correct answers:`);
                questionsWithoutCorrectAnswers.forEach(q => {
                    console.warn(`Question ${q.number} (original ${q.originalNumber}): ${q.text.substring(0, 50)}...`);

                    // If no correct answer is specified but there are options, set the first option as correct
                    if (q.options.length > 0) {
                        q.correctAnswer = q.options[0].letter;
                        console.log(`Auto-assigned correct answer ${q.correctAnswer} for question ${q.number}`);
                    }
                });
            } else {
                console.log('All questions have correct answers specified.');
            }

            // Check for questions with invalid correct answers (not matching any option)
            const questionsWithInvalidCorrectAnswers = questions.filter(q => 
                q.correctAnswer && 
                !q.options.some(opt => opt.letter === q.correctAnswer)
            );

            if (questionsWithInvalidCorrectAnswers.length > 0) {
                console.warn(`Found ${questionsWithInvalidCorrectAnswers.length} questions with invalid correct answers:`);
                questionsWithInvalidCorrectAnswers.forEach(q => {
                    console.warn(`Question ${q.number} (original ${q.originalNumber}): Correct answer ${q.correctAnswer} not found in options`);

                    // Set the first option as correct
                    if (q.options.length > 0) {
                        q.correctAnswer = q.options[0].letter;
                        console.log(`Corrected answer to ${q.correctAnswer} for question ${q.number}`);
                    }
                });
            } else {
                console.log('All correct answers are valid.');
            }

            // Check for questions with missing options (should have a, b, c, d)
            const requiredLetters = ['a', 'b', 'c', 'd'];
            const questionsWithMissingOptions = questions.filter(q => {
                const letters = q.options.map(opt => opt.letter);
                return requiredLetters.some(letter => !letters.includes(letter));
            });

            if (questionsWithMissingOptions.length > 0) {
                console.warn(`Found ${questionsWithMissingOptions.length} questions with missing options:`);
                questionsWithMissingOptions.forEach(q => {
                    console.warn(`Question ${q.number} (original ${q.originalNumber}): Missing some options`);

                    // Get existing letters
                    const existingLetters = q.options.map(opt => opt.letter);

                    // Add missing options
                    requiredLetters.forEach(letter => {
                        if (!existingLetters.includes(letter)) {
                            console.log(`Adding missing option ${letter} to question ${q.number}`);

                            // Generate a plausible but incorrect answer
                            let newOptionText = '';
                            if (q.correctAnswer === letter) {
                                // This is the correct answer that was missing
                                // Try to find it in a duplicate question
                                const key = q.text.trim();
                                const duplicates = questionsByText[key] || [];
                                const duplicateWithOption = duplicates.find(d => 
                                    d !== q && 
                                    d.options.some(opt => opt.letter === letter)
                                );

                                if (duplicateWithOption) {
                                    const option = duplicateWithOption.options.find(opt => opt.letter === letter);
                                    newOptionText = option.text;
                                } else {
                                    // Generate a generic correct answer
                                    newOptionText = "Poprawna odpowiedź dla tego pytania";
                                }
                            } else {
                                // This is an incorrect option
                                // Generate a plausible but incorrect answer based on the question context
                                let incorrectAnswers = [
                                    "Niepoprawna odpowiedź",
                                    "Arkusz kalkulacyjny",
                                    "Edytor tekstu",
                                    "Przeglądarka internetowa",
                                    "System operacyjny",
                                    "Baza danych"
                                ];

                                // Add context-specific incorrect answers
                                if (q.text.toLowerCase().includes("linux")) {
                                    incorrectAnswers = [
                                        "grep", "sudo", "ping", "ifconfig", "man", "cd", "pwd", "rm", "cp", "mv"
                                    ];
                                } else if (q.text.toLowerCase().includes("windows")) {
                                    incorrectAnswers = [
                                        "ipconfig", "dir", "netstat", "tasklist", "regedit", "msconfig", "cmd", "powershell"
                                    ];
                                } else if (q.text.toLowerCase().includes("sieć") || q.text.toLowerCase().includes("network")) {
                                    incorrectAnswers = [
                                        "Router", "Switch", "Hub", "Bridge", "Gateway", "Firewall", "DNS", "DHCP", "NAT", "VPN"
                                    ];
                                } else if (q.text.toLowerCase().includes("sprzęt") || q.text.toLowerCase().includes("hardware")) {
                                    incorrectAnswers = [
                                        "Procesor", "Pamięć RAM", "Dysk twardy", "Karta graficzna", "Płyta główna", "Zasilacz"
                                    ];
                                }

                                newOptionText = incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)];
                            }

                            // Add the new option
                            q.options.push({
                                letter: letter,
                                text: newOptionText
                            });
                        }
                    });

                    // Sort options by letter
                    q.options.sort((a, b) => a.letter.localeCompare(b.letter));
                });
            } else {
                console.log('All questions have all required options (a, b, c, d).');
            }

            // Check for questions with duplicate options (same letter)
            const questionsWithDuplicateOptions = questions.filter(q => {
                const letters = q.options.map(opt => opt.letter);
                return letters.length !== new Set(letters).size;
            });

            if (questionsWithDuplicateOptions.length > 0) {
                console.warn(`Found ${questionsWithDuplicateOptions.length} questions with duplicate options:`);
                questionsWithDuplicateOptions.forEach(q => {
                    console.warn(`Question ${q.number} (original ${q.originalNumber}): Has duplicate options`);

                    // Get letter counts
                    const letterCounts = {};
                    q.options.forEach(opt => {
                        letterCounts[opt.letter] = (letterCounts[opt.letter] || 0) + 1;
                    });

                    // Find duplicate letters
                    const duplicateLetters = Object.keys(letterCounts).filter(letter => letterCounts[letter] > 1);

                    // Fix duplicate options
                    duplicateLetters.forEach(letter => {
                        // Find all options with this letter
                        const duplicateOptions = q.options.filter(opt => opt.letter === letter);

                        // Keep the first one, rename the others
                        for (let i = 1; i < duplicateOptions.length; i++) {
                            // Find an unused letter
                            const usedLetters = q.options.map(opt => opt.letter);
                            const unusedLetter = requiredLetters.find(l => !usedLetters.includes(l));

                            if (unusedLetter) {
                                console.log(`Renaming duplicate option ${letter} to ${unusedLetter} in question ${q.number}`);
                                duplicateOptions[i].letter = unusedLetter;

                                // If this was the correct answer, update it
                                if (q.correctAnswer === letter) {
                                    // Keep the correct answer as the first instance of the letter
                                    // No need to change q.correctAnswer
                                }
                            } else {
                                // If all letters are used, remove the duplicate
                                console.log(`Removing duplicate option ${letter} from question ${q.number}`);
                                q.options = q.options.filter(opt => opt !== duplicateOptions[i]);
                            }
                        }
                    });

                    // Sort options by letter
                    q.options.sort((a, b) => a.letter.localeCompare(b.letter));
                });
            } else {
                console.log('No questions with duplicate options found.');
            }

            // Final check for specific issues with common questions

            // Linux command question
            const linuxCommandQuestions = questions.filter(q => 
                q.text.includes("Do wyświetlenia zawartości katalogu w systemie Linux")
            );

            linuxCommandQuestions.forEach(q => {
                // Find the option with "ls"
                const lsOption = q.options.find(opt => opt.text.trim() === "ls");
                if (lsOption && q.correctAnswer !== lsOption.letter) {
                    console.warn(`Found Linux command question (${q.number}). Fixing correct answer from ${q.correctAnswer} to ${lsOption.letter} (ls)`);
                    q.correctAnswer = lsOption.letter;
                }
            });

            return questions;
        } catch (error) {
            console.error('Error verifying correct answers:', error);
            return questions;
        }
    }

    // Initialize activity chart
    function initActivityChart() {
        // Get activity data from localStorage or initialize it
        let activityData = JSON.parse(localStorage.getItem(ACTIVITY_DATA_KEY) || '{"days":[0,0,0,0,0,0,0],"total":0}');

        // Update the chart
        updateActivityChart(activityData);
    }

    // Update activity chart with new data
    function updateActivityChart(activityData) {
        try {
            const bars = document.querySelectorAll('.bar-chart .bar');
            const totalWeeklyQuestions = document.getElementById('total-weekly-questions');
            const activityStreak = document.getElementById('activity-streak');
            const activityBestDay = document.getElementById('activity-best-day');
            const activityAvgTime = document.getElementById('activity-avg-time');

            // Update bars
            if (bars.length === 7) {
                for (let i = 0; i < 7; i++) {
                    const height = activityData.days[i] > 0 ? Math.min(100, activityData.days[i] * 5) : 0;
                    bars[i].style.height = `${height}%`;
                    bars[i].querySelector('span').textContent = activityData.days[i];
                }
            }

            // Update total
            if (totalWeeklyQuestions) {
                totalWeeklyQuestions.textContent = activityData.total;
            }

            // Calculate streak (consecutive days with activity)
            let streak = 0;
            const today = new Date().getDay();
            const chartToday = today === 0 ? 6 : today - 1;

            // Start from today and go backwards
            for (let i = 0; i <= 6; i++) {
                const dayIndex = (chartToday - i + 7) % 7; // Ensure positive index
                if (activityData.days[dayIndex] > 0) {
                    streak++;
                } else {
                    break; // Break on first day with no activity
                }
            }

            if (activityStreak) {
                activityStreak.textContent = streak;
            }

            // Find best day (most questions answered)
            let bestDay = 0;
            for (let i = 0; i < 7; i++) {
                if (activityData.days[i] > bestDay) {
                    bestDay = activityData.days[i];
                }
            }

            if (activityBestDay) {
                activityBestDay.textContent = bestDay;
            }

            // Calculate average time per question (mock data - would be real in a full implementation)
            // For now, we'll use a random value between 1-3 minutes
            const avgTime = Math.round((Math.random() * 2 + 1) * 10) / 10;

            if (activityAvgTime) {
                activityAvgTime.textContent = avgTime;
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji wykresu aktywności:', error);
            // Fallback to default values
            const bars = document.querySelectorAll('.bar-chart .bar');
            if (bars.length === 7) {
                for (let i = 0; i < 7; i++) {
                    bars[i].style.height = '0%';
                    bars[i].querySelector('span').textContent = '0';
                }
            }

            const elements = [
                document.getElementById('total-weekly-questions'),
                document.getElementById('activity-streak'),
                document.getElementById('activity-best-day'),
                document.getElementById('activity-avg-time')
            ];

            elements.forEach(el => {
                if (el) el.textContent = '0';
            });
        }
    }

    // Update activity data when a question is answered
    function updateActivityData() {
        // Get current day of week (0 = Sunday, 1 = Monday, etc.)
        const today = new Date().getDay();
        // Convert to our chart order (0 = Monday, 6 = Sunday)
        const chartDay = today === 0 ? 6 : today - 1;

        // Get activity data from localStorage or initialize it
        let activityData = JSON.parse(localStorage.getItem(ACTIVITY_DATA_KEY) || '{"days":[0,0,0,0,0,0,0],"total":0}');

        // Increment count for today
        activityData.days[chartDay]++;
        activityData.total++;

        // Save updated data
        localStorage.setItem(ACTIVITY_DATA_KEY, JSON.stringify(activityData));

        // Update the chart
        updateActivityChart(activityData);
    }

    // Load user data from localStorage
    function loadUserData() {
        try {
            // Load user data
            const storedUserData = localStorage.getItem(USER_DATA_KEY);
            if (storedUserData) {
                userData = JSON.parse(storedUserData);
            }

            // Update last login
            userData.lastLogin = new Date().toISOString();

            // Load user settings
            const storedUserSettings = localStorage.getItem(USER_SETTINGS_KEY);
            if (storedUserSettings) {
                userSettings = JSON.parse(storedUserSettings);
            }

            // Initialize statistics
            initializeStatistics();

            console.log('User data loaded successfully');
        } catch (error) {
            console.error('Error loading user data:', error);
            // Use default values if there's an error
        }
    }

    // Initialize statistics displays
    function initializeStatistics() {
        try {
            // Get statistics from localStorage
            const completedExams = parseInt(localStorage.getItem('completedExams') || '0', 10);
            const totalScore = parseInt(localStorage.getItem('totalScore') || '0', 10);
            const averageScore = completedExams > 0 ? Math.round(totalScore / completedExams) : 0;
            const bestScore = parseInt(localStorage.getItem('bestScore') || '0', 10);

            // Update dashboard displays
            const dashboardCompletedExams = document.getElementById('dashboard-completed-exams');
            const dashboardAverageScore = document.getElementById('dashboard-average-score');
            const completedExamsElement = document.getElementById('completed-exams');
            const averageScoreElement = document.getElementById('average-score');
            const bestScoreElement = document.getElementById('best-score');

            if (dashboardCompletedExams) dashboardCompletedExams.textContent = completedExams;
            if (dashboardAverageScore) dashboardAverageScore.textContent = `${averageScore}%`;
            if (completedExamsElement) completedExamsElement.textContent = completedExams;
            if (averageScoreElement) averageScoreElement.textContent = `${averageScore}%`;
            if (bestScoreElement) bestScoreElement.textContent = `${bestScore}%`;

            // Update total questions count
            const dashboardTotalQuestions = document.getElementById('dashboard-total-questions');
            const totalQuestionsCount = document.getElementById('total-questions-count');
            if (dashboardTotalQuestions && allQuestions.length > 0) {
                dashboardTotalQuestions.textContent = allQuestions.length;
            }
            if (totalQuestionsCount && allQuestions.length > 0) {
                totalQuestionsCount.textContent = allQuestions.length;
            }

            // Update progress bars
            const progressOverall = document.getElementById('progress-overall');
            const progressLastExam = document.getElementById('progress-last-exam');
            const progressBest = document.getElementById('progress-best');

            if (progressOverall) {
                progressOverall.style.width = `${averageScore}%`;
                progressOverall.textContent = `${averageScore}%`;
            }
            if (progressLastExam) {
                const lastExamScore = userData.completedExams && userData.completedExams.length > 0 
                    ? userData.completedExams[userData.completedExams.length - 1].score 
                    : 0;
                progressLastExam.style.width = `${lastExamScore}%`;
                progressLastExam.textContent = `${lastExamScore}%`;
            }
            if (progressBest) {
                progressBest.style.width = `${bestScore}%`;
                progressBest.textContent = `${bestScore}%`;
            }
        } catch (error) {
            console.error('Error initializing statistics:', error);
        }
    }

    // Save user data to localStorage
    function saveUserData() {
        try {
            // Save user data
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

            // Save user settings
            localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(userSettings));

            console.log('User data saved successfully');
        } catch (error) {
            console.error('Error saving user data:', error);
            alert('Wystąpił błąd podczas zapisywania danych. Niektóre zmiany mogą nie zostać zachowane.');
        }
    }

    // Update user data with completed exam
    function updateUserDataWithExam(examData) {
        try {
            // Add exam to completed exams
            userData.completedExams.push({
                date: new Date().toISOString(),
                score: examData.score,
                questionsCount: examData.totalQuestions,
                answeredCount: examData.answeredCount,
                correctCount: examData.correctCount
            });

            // Save user data
            saveUserData();
        } catch (error) {
            console.error('Error updating user data with exam:', error);
        }
    }

    // Update dashboard stats with exam results
    function updateDashboardStats(scorePercentage) {
        try {
            // Increment completed exams count
            const completedExams = parseInt(localStorage.getItem('completedExams') || '0', 10) + 1;
            localStorage.setItem('completedExams', completedExams.toString());

            // Update average score
            const totalScore = parseInt(localStorage.getItem('totalScore') || '0', 10) + scorePercentage;
            localStorage.setItem('totalScore', totalScore.toString());
            const averageScore = Math.round(totalScore / completedExams);

            // Update best score
            const bestScore = Math.max(parseInt(localStorage.getItem('bestScore') || '0', 10), scorePercentage);
            localStorage.setItem('bestScore', bestScore.toString());

            // Update dashboard displays
            document.getElementById('dashboard-completed-exams').textContent = completedExams;
            document.getElementById('dashboard-average-score').textContent = `${averageScore}%`;
            document.getElementById('completed-exams').textContent = completedExams;
            document.getElementById('average-score').textContent = `${averageScore}%`;
            document.getElementById('best-score').textContent = `${bestScore}%`;
            document.getElementById('dashboard-total-questions').textContent = allQuestions.length;

            // Update progress bars
            document.getElementById('progress-overall').style.width = `${averageScore}%`;
            document.getElementById('progress-overall').textContent = `${averageScore}%`;
            document.getElementById('progress-last-exam').style.width = `${scorePercentage}%`;
            document.getElementById('progress-last-exam').textContent = `${scorePercentage}%`;
            document.getElementById('progress-best').style.width = `${bestScore}%`;
            document.getElementById('progress-best').textContent = `${bestScore}%`;

            // Update activity data
            updateActivityData();

            // Update user data
            updateUserDataWithExam({
                score: scorePercentage,
                totalQuestions: window.examQuestions.length,
                answeredCount: window.examAnswers.filter(answer => answer !== null).length,
                correctCount: window.examAnswers.filter((answer, index) => 
                    answer === window.examQuestions[index].correctAnswer).length
            });
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }
});
