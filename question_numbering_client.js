/**
 * Client-side Question Numbering Script
 * 
 * This script analyzes and fixes the numbering in the pytania.txt file.
 * It ensures that all questions are numbered sequentially.
 * This is a browser-compatible version of the question_numbering.js script.
 */

// Configuration
const QUESTION_PATTERN = /^Pytanie (\d+)/;

/**
 * Main function to analyze and fix question numbering
 * @param {string} content - The content of the pytania.txt file
 * @returns {Object} Object containing the fixed content and statistics
 */
function analyzeAndFixQuestionNumbering(content) {
    console.log('Starting question numbering analysis...');
    
    try {
        const lines = content.split('\n');
        
        // Parse questions and their numbering
        const { questions, questionLines } = parseQuestions(lines);
        
        // Check if there are any numbering issues
        const hasNumberingIssues = checkNumberingIssues(questions);
        
        if (hasNumberingIssues) {
            console.log('Numbering issues detected. Fixing...');
            
            // Fix the numbering
            const fixedContent = fixNumbering(lines, questionLines);
            
            return {
                fixed: true,
                content: fixedContent,
                totalQuestions: questionLines.length,
                message: `Numeracja pytań została poprawiona. Łączna liczba pytań: ${questionLines.length}`
            };
        } else {
            console.log('No numbering issues detected. All questions are numbered correctly.');
            
            return {
                fixed: false,
                content: content,
                totalQuestions: questionLines.length,
                message: `Nie wykryto problemów z numeracją. Łączna liczba pytań: ${questionLines.length}`
            };
        }
    } catch (error) {
        console.error('Error:', error.message);
        return {
            fixed: false,
            content: content,
            totalQuestions: 0,
            message: `Wystąpił błąd: ${error.message}`
        };
    }
}

/**
 * Parse questions and their numbering from the file content
 * @param {string[]} lines - Array of lines from the file
 * @returns {Object} Object containing questions and their line numbers
 */
function parseQuestions(lines) {
    const questions = [];
    const questionLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(QUESTION_PATTERN);
        
        if (match) {
            const questionNumber = parseInt(match[1], 10);
            questions.push(questionNumber);
            questionLines.push(i);
        }
    }
    
    return { questions, questionLines };
}

/**
 * Check if there are any numbering issues
 * @param {number[]} questions - Array of question numbers
 * @returns {boolean} True if there are numbering issues, false otherwise
 */
function checkNumberingIssues(questions) {
    // Check if questions are numbered sequentially starting from 1
    for (let i = 0; i < questions.length; i++) {
        if (questions[i] !== i + 1) {
            return true;
        }
    }
    
    return false;
}

/**
 * Fix the numbering of questions
 * @param {string[]} lines - Array of lines from the file
 * @param {number[]} questionLines - Array of line numbers where questions start
 * @returns {string} Fixed content
 */
function fixNumbering(lines, questionLines) {
    const fixedLines = [...lines];
    
    for (let i = 0; i < questionLines.length; i++) {
        const lineIndex = questionLines[i];
        const newQuestionNumber = i + 1;
        
        // Replace the question number
        fixedLines[lineIndex] = `Pytanie ${newQuestionNumber}`;
    }
    
    return fixedLines.join('\n');
}