/**
 * Question Numbering Script
 * 
 * This script analyzes and fixes the numbering in the pytania.txt file.
 * It ensures that all questions are numbered sequentially.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const QUESTIONS_FILE = 'pytania.txt';
const BACKUP_FILE = 'pytania_backup.txt';
const QUESTION_PATTERN = /^Pytanie (\d+)/;
const EMPTY_LINE_PATTERN = /^\s*$/;

/**
 * Main function to analyze and fix question numbering
 */
function analyzeAndFixQuestionNumbering() {
    console.log('Starting question numbering analysis...');
    
    try {
        // Create a backup of the original file
        backupOriginalFile();
        
        // Read the questions file
        const content = fs.readFileSync(QUESTIONS_FILE, 'utf8');
        const lines = content.split('\n');
        
        // Parse questions and their numbering
        const { questions, questionLines } = parseQuestions(lines);
        
        // Check if there are any numbering issues
        const hasNumberingIssues = checkNumberingIssues(questions);
        
        if (hasNumberingIssues) {
            console.log('Numbering issues detected. Fixing...');
            
            // Fix the numbering
            const fixedContent = fixNumbering(lines, questionLines);
            
            // Write the fixed content back to the file
            fs.writeFileSync(QUESTIONS_FILE, fixedContent, 'utf8');
            
            console.log('Question numbering has been fixed successfully!');
            console.log(`Total questions: ${questionLines.length}`);
        } else {
            console.log('No numbering issues detected. All questions are numbered correctly.');
            console.log(`Total questions: ${questionLines.length}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

/**
 * Create a backup of the original file
 */
function backupOriginalFile() {
    try {
        const content = fs.readFileSync(QUESTIONS_FILE, 'utf8');
        fs.writeFileSync(BACKUP_FILE, content, 'utf8');
        console.log(`Backup created: ${BACKUP_FILE}`);
    } catch (error) {
        console.error('Error creating backup:', error.message);
        throw error;
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

/**
 * Function to analyze a file for question numbering issues without fixing them
 * @param {string} filePath - Path to the file to analyze
 */
function analyzeFile(filePath) {
    try {
        console.log(`Analyzing file: ${filePath}`);
        
        // Read the file
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Parse questions and their numbering
        const { questions, questionLines } = parseQuestions(lines);
        
        // Check if there are any numbering issues
        const hasNumberingIssues = checkNumberingIssues(questions);
        
        console.log(`Total questions: ${questionLines.length}`);
        
        if (hasNumberingIssues) {
            console.log('Numbering issues detected:');
            
            // Find and report specific issues
            let expectedNumber = 1;
            for (let i = 0; i < questions.length; i++) {
                if (questions[i] !== expectedNumber) {
                    console.log(`  - Question at line ${questionLines[i] + 1}: Expected number ${expectedNumber}, found ${questions[i]}`);
                }
                expectedNumber++;
            }
            
            return true;
        } else {
            console.log('No numbering issues detected. All questions are numbered correctly.');
            return false;
        }
    } catch (error) {
        console.error('Error analyzing file:', error.message);
        return false;
    }
}

/**
 * Function to fix question numbering in a specific file
 * @param {string} filePath - Path to the file to fix
 */
function fixFile(filePath) {
    try {
        console.log(`Fixing file: ${filePath}`);
        
        // Create a backup
        const backupPath = `${filePath}.backup`;
        fs.copyFileSync(filePath, backupPath);
        console.log(`Backup created: ${backupPath}`);
        
        // Read the file
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Parse questions and their numbering
        const { questionLines } = parseQuestions(lines);
        
        // Fix the numbering
        const fixedContent = fixNumbering(lines, questionLines);
        
        // Write the fixed content back to the file
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        
        console.log(`Question numbering has been fixed successfully in ${filePath}!`);
        console.log(`Total questions: ${questionLines.length}`);
        
        return true;
    } catch (error) {
        console.error('Error fixing file:', error.message);
        return false;
    }
}

/**
 * Function to check and fix numbering when new questions are added
 * This can be called when new questions are added to ensure proper numbering
 */
function checkAndFixNewQuestions() {
    try {
        console.log('Checking for new questions and fixing numbering...');
        
        // Read the questions file
        const content = fs.readFileSync(QUESTIONS_FILE, 'utf8');
        const lines = content.split('\n');
        
        // Parse questions and their numbering
        const { questions, questionLines } = parseQuestions(lines);
        
        // Check if there are any numbering issues
        const hasNumberingIssues = checkNumberingIssues(questions);
        
        if (hasNumberingIssues) {
            console.log('Numbering issues detected after adding new questions. Fixing...');
            
            // Fix the numbering
            const fixedContent = fixNumbering(lines, questionLines);
            
            // Write the fixed content back to the file
            fs.writeFileSync(QUESTIONS_FILE, fixedContent, 'utf8');
            
            console.log('Question numbering has been fixed successfully!');
            console.log(`Total questions: ${questionLines.length}`);
            
            return true;
        } else {
            console.log('No numbering issues detected. All questions are numbered correctly.');
            console.log(`Total questions: ${questionLines.length}`);
            
            return false;
        }
    } catch (error) {
        console.error('Error checking and fixing new questions:', error.message);
        return false;
    }
}

// Export functions for use in other scripts
module.exports = {
    analyzeFile,
    fixFile,
    checkAndFixNewQuestions
};

// Run the main function if this script is executed directly
if (require.main === module) {
    analyzeAndFixQuestionNumbering();
}