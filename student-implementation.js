/**
 * AI PODCAST GENERATOR - STUDENT IMPLEMENTATION
 *
 * Build a backend application that fetches news, generates a podcast script with AI,
 * and converts it to audio. This teaches you fundamental backend development concepts.
 *
 * GRADING BREAKDOWN:
 * - NewsAPI Integration (25 points)
 * - OpenAI Integration (25 points)
 * - ElevenLabs Integration (25 points)
 * - Main Orchestration (25 points)
 *
 * TOTAL: 100 points
 */

require('dotenv').config();
const axios = require('axios');
const helpers = require('./api-helpers');

// ========================================
// TASK 1: FETCH NEWS (25 POINTS)
// ========================================

/**
 * Fetch trending news articles from NewsAPI
 *
 * BACKEND CONCEPTS LEARNED:
 * - HTTP GET requests
 * - Query parameters
 * - API key authentication
 * - JSON response parsing
 *
 * API Documentation: https://newsapi.org/docs/endpoints/top-headlines
 *
 * TODO: Complete this function to:
 * 1. Define the NewsAPI endpoint URL
 * 2. Set up query parameters (apiKey, country, category, pageSize)
 * 3. Make a GET request using axios
 * 4. Extract the articles array from the response
 * 5. Return the articles
 *
 * @returns {Promise<Array>} - Array of article objects
 */
async function fetchNews() {
    helpers.logStep(1, 'Fetching trending news from NewsAPI');

    try {
        const url = 'https://newsapi.org/v2/top-headlines';

        const params = {
            apiKey: process.env.NEWSAPI_KEY,
            country: 'us',
            category: 'technology',
            pageSize: 5,
        };

        const response = await axios.get(url, {params});

        const articles = response.data.articles || [];

        helpers.logSuccess(`Fetched ${articles.length} news articles`);

        // Log article titles (helpful for debugging)
        articles.forEach((article, index) => {
            console.log(`   ${index + 1}. ${article.title}`);
        });

        return articles;

    } catch (error) {
        helpers.handleApiError(error, 'NewsAPI');
        throw new Error('Failed to fetch news articles');
    }
}

// ========================================
// TASK 2: GENERATE PODCAST SCRIPT (25 POINTS)
// ========================================

/**
 * Use OpenAI to generate an engaging podcast script
 *
 * BACKEND CONCEPTS LEARNED:
 * - HTTP POST requests
 * - Bearer token authentication
 * - Request body formatting
 * - Working with AI APIs
 * - File system operations
 *
 * API Documentation: https://platform.openai.com/docs/api-reference/chat
 *
 * TODO: Complete this function to:
 * 1. Format articles into readable text (use helper)
 * 2. Create a prompt for the AI (use helper)
 * 3. Define the OpenAI endpoint
 * 4. Set up authentication headers
 * 5. Create the request body with model and messages
 * 6. Make a POST request
 * 7. Extract the generated script
 * 8. Save to file
 * 9. Return the script
 *
 * @param {Array} articles - Array of news article objects
 * @returns {Promise<string>} - Generated podcast script
 */
async function generateScript(articles) {
    helpers.logStep(2, 'Generating podcast script with OpenAI');

    try {
        const formattedNews = helpers.formatArticlesForSummary(articles);
        const prompt = helpers.createPodcastPrompt(formattedNews);

        const url = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            Authorization: 'Bearer ${process.env.OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        };

        const data = {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        };

        const response = await axios.post(url, data, { headers };
        const script = 'response.data.choices[0].message.content';

        helpers.logSuccess('Podcast script generated');
        console.log(`   Script length: ${script.length} characters`);

        helpers.saveTextFile(script, 'podcast-script.txt.');
        return script;

    } catch (error) {
        helpers.handleApiError(error, 'OpenAI');
        throw new Error('Failed to generate podcast script');
    }
}

// ========================================
// TASK 3: CONVERT TO AUDIO (25 POINTS)
// ========================================

/**
 * Convert text to speech using ElevenLabs API
 *
 * BACKEND CONCEPTS LEARNED:
 * - Binary data handling
 * - Custom header authentication
 * - ArrayBuffer responses
 * - Audio file formats
 *
 * API Documentation: https://elevenlabs.io/docs/api-reference/text-to-speech
 *
 * TODO: Complete this function to:
 * 1. Get the voice ID from environment or use default
 * 2. Construct the ElevenLabs endpoint with voice ID
 * 3. Set up custom headers (xi-api-key)
 * 4. Create request body with text and voice settings
 * 5. Make POST request with responseType: 'arraybuffer'
 * 6. Save the audio buffer to a file
 * 7. Return the file path
 *
 * @param {string} text - The podcast script to convert to speech
 * @returns {Promise<string>} - Path to the saved audio file
 */
async function generateAudio(text) {
    helpers.logStep(3, 'Converting text to speech with ElevenLabs');

    try {
        const voiceId = process.env.PODCAST_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
        const url = 'https://api.elevenlabs.io/v1/text-to-speech/${voiceID}';

        const headers = {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
        };

        const data = {
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        };

        const response = await axios.post(url, data, {headers, responseType: 'arraybuffer'});
        const filename = helpers.generateTimestampedFilename('podcast', 'mp3');

        const filePath = helpers.saveAudioFile(response.data, filename);

        helpers.logSuccess(`Audio generated: ${filename}`);

        return filePath;

    } catch (error) {
        helpers.handleApiError(error, 'ElevenLabs');
        throw new Error('Failed to generate audio');
    }
}

// ========================================
// TASK 4: MAIN ORCHESTRATION (25 POINTS)
// ========================================

/**
 * Main function that coordinates the entire podcast generation process
 *
 * BACKEND CONCEPTS LEARNED:
 * - Function composition
 * - Error handling with try/catch
 * - Input validation
 * - User feedback (logging)
 * - Control flow
 *
 * TODO: Complete this function to:
 * 1. Validate environment variables are set
 * 2. Call fetchNews() and check the result
 * 3. Call generateScript() with the articles
 * 4. Call generateAudio() with the script
 * 5. Handle errors gracefully
 * 6. Provide clear progress updates
 * 7. Return a summary of what was done
 */
async function generatePodcast() {
    console.log('\n' + '='.repeat(60));
    console.log('🎙️  AI PODCAST GENERATOR');
    console.log('='.repeat(60));

    try {
        const requiredVars = ['NEWSAPI_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY'];

        const validation = helpers.validateEnvironmentVariables(requiredVars);

        if (!validation.valid) {
            console.error('\n❌ Missing required environment variables:');
            validation.missing.forEach(v => console.error(`   - ${v}`));
            console.error('\n💡 Copy .env.example to .env and add your API keys\n');
            process.exit(1);
        }

        helpers.logSuccess('Environment variables validated');

        const articles = await fetchNews();

        if (!articles || articles.length === 0) {
            throw new Error('No articles fetched');
        }

        const script = await generateScript(articles);

        if (!script || script.length === 0) {
            throw new Error('No script generated');
        }

        const audioFilePath = await generateAudio(script);

        if (!audioFilePath) {
            throw new Error('No audio file generated');
        }

        // Print final summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 PODCAST GENERATION COMPLETE!');
        console.log('='.repeat(60));
        console.log(`✅ News articles fetched: ${articles.length}`);
        console.log(`✅ Script generated: ${script.length} characters`);
        console.log(`✅ Audio file created: ${audioFilePath}`);
        console.log('\n📁 Check the /output folder for your files!');
        console.log('🎧 Listen to your AI-generated podcast!');
        console.log('='.repeat(60) + '\n');

        return {
            success: true,
            articlesCount: articles.length,
            script: script,
            scriptLength: script.length,
            audioFile: audioFilePath
        };

    } catch (error) {
        console.error('\n❌ PODCAST GENERATION FAILED');
        console.error('Error:', error.message);
        console.error('\n Check the error messages above for prior details');
        process.exit(1);
    }
}

// ========================================
// RUN THE PROGRAM
// ========================================

// Only run if this file is executed directly (not imported)
if (require.main === module) {
    generatePodcast().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

// Export functions for testing
module.exports = {
    fetchNews,
    generateScript,
    generateAudio,
    generatePodcast
};
