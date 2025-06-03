/**
 * Client-side Duplicate Question Checker Script
 * 
 * This script analyzes the pytania.txt file to find duplicate questions and answers.
 * It helps maintain the quality of the question database by identifying potential issues.
 */

// Configuration
const QUESTION_PATTERN = /^Pytanie (\d+)/;
const OPTION_PATTERN = /^([a-d])\) (.*)/i;
const CORRECT_ANSWER_PATTERN = /^Poprawna odpowiedź: ([a-d])/i;
const MEDIA_PATTERN = /^\[Zdjęcie\/Nagranie: (.*)\]/;

/**
 * Main function to analyze questions for duplicates
 * @param {string} content - The content of the pytania.txt file
 * @returns {Object} Object containing the analysis results
 */
function analyzeQuestionsForDuplicates(content) {
    console.log('Starting duplicate question analysis...');
    
    try {
        const lines = content.split('\n');
        
        // Parse questions and their components
        const questions = parseQuestionsWithDetails(lines);
        
        // Check for duplicate questions
        const duplicateQuestions = findDuplicateQuestions(questions);
        
        // Check for duplicate answers within questions
        const questionsWithDuplicateAnswers = findQuestionsWithDuplicateAnswers(questions);
        
        // Generate report
        const report = generateReport(duplicateQuestions, questionsWithDuplicateAnswers, questions.length);
        
        return {
            success: true,
            duplicateQuestions: duplicateQuestions,
            questionsWithDuplicateAnswers: questionsWithDuplicateAnswers,
            totalQuestions: questions.length,
            report: report
        };
    } catch (error) {
        console.error('Error:', error.message);
        return {
            success: false,
            message: `Wystąpił błąd: ${error.message}`
        };
    }
}

/**
 * Parse questions and their details from the file content
 * @param {string[]} lines - Array of lines from the file
 * @returns {Array} Array of question objects with details
 */
function parseQuestionsWithDetails(lines) {
    const questions = [];
    let currentQuestion = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this is a new question
        const questionMatch = line.match(QUESTION_PATTERN);
        if (questionMatch) {
            // Save previous question if exists
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            
            // Start new question
            currentQuestion = {
                number: parseInt(questionMatch[1], 10),
                lineNumber: i + 1,
                text: '',
                mediaUrl: '',
                options: [],
                correctAnswer: ''
            };
            continue;
        }
        
        // Skip if no current question
        if (!currentQuestion) continue;
        
        // Check if this is a media line
        const mediaMatch = line.match(MEDIA_PATTERN);
        if (mediaMatch) {
            currentQuestion.mediaUrl = mediaMatch[1];
            continue;
        }
        
        // Check if this is an option line
        const optionMatch = line.match(OPTION_PATTERN);
        if (optionMatch) {
            currentQuestion.options.push({
                letter: optionMatch[1].toLowerCase(),
                text: optionMatch[2]
            });
            continue;
        }
        
        // Check if this is the correct answer line
        const correctAnswerMatch = line.match(CORRECT_ANSWER_PATTERN);
        if (correctAnswerMatch) {
            currentQuestion.correctAnswer = correctAnswerMatch[1].toLowerCase();
            continue;
        }
        
        // If not empty and not already processed, it's part of the question text
        if (line && !currentQuestion.text && !OPTION_PATTERN.test(line) && !CORRECT_ANSWER_PATTERN.test(line)) {
            currentQuestion.text = line;
        }
    }
    
    // Add the last question if exists
    if (currentQuestion) {
        questions.push(currentQuestion);
    }
    
    return questions;
}

/**
 * Find duplicate questions based on text similarity
 * @param {Array} questions - Array of question objects
 * @returns {Array} Array of duplicate question groups
 */
function findDuplicateQuestions(questions) {
    const duplicateGroups = [];
    const processedIndices = new Set();
    
    for (let i = 0; i < questions.length; i++) {
        if (processedIndices.has(i)) continue;
        
        const duplicates = [i];
        const baseQuestion = questions[i];
        
        for (let j = i + 1; j < questions.length; j++) {
            if (processedIndices.has(j)) continue;
            
            const compareQuestion = questions[j];
            
            // Check for text similarity (exact match or very similar)
            if (areTextsSimilar(baseQuestion.text, compareQuestion.text)) {
                duplicates.push(j);
                processedIndices.add(j);
            }
        }
        
        if (duplicates.length > 1) {
            duplicateGroups.push(duplicates.map(idx => ({
                number: questions[idx].number,
                lineNumber: questions[idx].lineNumber,
                text: questions[idx].text
            })));
            processedIndices.add(i);
        }
    }
    
    return duplicateGroups;
}

/**
 * Find questions with duplicate answer options
 * @param {Array} questions - Array of question objects
 * @returns {Array} Array of questions with duplicate answers
 */
function findQuestionsWithDuplicateAnswers(questions) {
    return questions.filter(question => {
        const optionTexts = question.options.map(opt => opt.text.toLowerCase().trim());
        const uniqueOptions = new Set(optionTexts);
        return uniqueOptions.size < optionTexts.length;
    }).map(question => ({
        number: question.number,
        lineNumber: question.lineNumber,
        text: question.text,
        options: question.options
    }));
}

/**
 * Check if two texts are similar
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {boolean} True if texts are similar, false otherwise
 */
function areTextsSimilar(text1, text2) {
    // Normalize texts for comparison
    const normalized1 = text1.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalized2 = text2.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Exact match
    if (normalized1 === normalized2) return true;
    
    // Similarity check (Levenshtein distance)
    const maxLength = Math.max(normalized1.length, normalized2.length);
    if (maxLength === 0) return true;
    
    const distance = levenshteinDistance(normalized1, normalized2);
    const similarity = 1 - distance / maxLength;
    
    // Consider similar if 80% or more similar
    return similarity >= 0.8;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @returns {number} Levenshtein distance
 */
function levenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    
    // Create matrix
    const d = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;
    
    // Fill the matrix
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            d[i][j] = Math.min(
                d[i - 1][j] + 1,      // deletion
                d[i][j - 1] + 1,      // insertion
                d[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    return d[m][n];
}

/**
 * Generate a human-readable report of the analysis
 * @param {Array} duplicateQuestions - Array of duplicate question groups
 * @param {Array} questionsWithDuplicateAnswers - Array of questions with duplicate answers
 * @param {number} totalQuestions - Total number of questions analyzed
 * @returns {string} HTML formatted report
 */
function generateReport(duplicateQuestions, questionsWithDuplicateAnswers, totalQuestions) {
    let report = `<h3>Raport analizy pytań</h3>`;
    report += `<p>Przeanalizowano łącznie ${totalQuestions} pytań.</p>`;
    
    // Duplicate questions section
    report += `<h4>Znaleziono ${duplicateQuestions.length} grup podobnych pytań:</h4>`;
    if (duplicateQuestions.length === 0) {
        report += `<p>Nie znaleziono podobnych pytań.</p>`;
    } else {
        report += `<div class="duplicate-groups">`;
        duplicateQuestions.forEach((group, groupIndex) => {
            report += `<div class="duplicate-group">`;
            report += `<h5>Grupa ${groupIndex + 1}:</h5>`;
            report += `<ul>`;
            group.forEach(question => {
                report += `<li>Pytanie ${question.number} (linia ${question.lineNumber}): ${question.text}</li>`;
            });
            report += `</ul>`;
            report += `</div>`;
        });
        report += `</div>`;
    }
    
    // Duplicate answers section
    report += `<h4>Znaleziono ${questionsWithDuplicateAnswers.length} pytań z powtarzającymi się odpowiedziami:</h4>`;
    if (questionsWithDuplicateAnswers.length === 0) {
        report += `<p>Nie znaleziono pytań z powtarzającymi się odpowiedziami.</p>`;
    } else {
        report += `<div class="duplicate-answers">`;
        questionsWithDuplicateAnswers.forEach(question => {
            report += `<div class="question-with-duplicates">`;
            report += `<p>Pytanie ${question.number} (linia ${question.lineNumber}): ${question.text}</p>`;
            report += `<ul>`;
            question.options.forEach(option => {
                report += `<li>${option.letter}) ${option.text}</li>`;
            });
            report += `</ul>`;
            report += `</div>`;
        });
        report += `</div>`;
    }
    
    // Summary
    const totalIssues = duplicateQuestions.length + questionsWithDuplicateAnswers.length;
    if (totalIssues === 0) {
        report += `<p class="summary success">Nie znaleziono żadnych problemów z pytaniami.</p>`;
    } else {
        report += `<p class="summary warning">Znaleziono ${totalIssues} potencjalnych problemów z pytaniami.</p>`;
    }
    
    return report;
}