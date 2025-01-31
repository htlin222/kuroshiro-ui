import { useState, useEffect, useCallback } from 'react';
import Kuroshiro from 'kuroshiro';
import { BrowserKuromojiAnalyzer } from './BrowserKuromojiAnalyzer.ts';
import { SaveHistory } from './components/SaveHistory';

interface SavedItem {
  id: string;
  content: string;
  timestamp: string;
}

function App() {
  const [inputText, setInputText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversionType, setConversionType] = useState('hiragana');
  const [conversionMode, setConversionMode] = useState('furigana');
  const [kuroshiro, setKuroshiro] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    const saved = localStorage.getItem('savedItems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Starting initialization...');

        // Initialize Kuroshiro with browser-compatible analyzer
        const analyzer = new BrowserKuromojiAnalyzer();
        const kuroshiroInstance = new Kuroshiro();
        
        await analyzer.init();
        await kuroshiroInstance.init(analyzer);

        setKuroshiro(kuroshiroInstance);
        setIsInitialized(true);
        setInitError(null);
        console.log('Initialization complete');
      } catch (error) {
        console.error('Initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize');
        setIsInitialized(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
  }, [savedItems]);

  const handleConvert = async () => {
    if (!kuroshiro || !inputText || !isInitialized) {
      console.log('Convert blocked:', { hasKuroshiro: !!kuroshiro, hasInputText: !!inputText, isInitialized });
      return;
    }
    setIsLoading(true);
    
    try {
      const result = await kuroshiro.convert(inputText, {
        mode: conversionMode,
        to: conversionType as 'hiragana' | 'katakana' | 'romaji',
      });
      setConvertedText(result);
    } catch (error) {
      console.error('Conversion error:', error);
      setInitError(error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAsHTML = async () => {
    try {
      await navigator.clipboard.writeText(convertedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const speakText = useCallback(() => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance();
      // Use the raw input text for speech, as converted text might contain HTML
      utterance.text = inputText;
      utterance.lang = 'ja-JP'; // Set language to Japanese
      utterance.rate = speechRate;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [inputText, speechRate]);

  const handleSave = useCallback(() => {
    if (!convertedText) return;
    
    const newItem: SavedItem = {
      id: Date.now().toString(),
      content: convertedText,
      timestamp: new Date().toISOString(),
    };
    
    setSavedItems(prev => [newItem, ...prev]);
  }, [convertedText]);

  const handleDelete = useCallback((id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Japanese Text Converter</h1>
        
        {initError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            Error: {initError}
          </div>
        )}

        {!isInitialized && !initError && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-md">
            Initializing dictionary... Please wait.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Text
            </label>
            <textarea
              className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter Japanese text here..."
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
            <select
              className="p-2 border rounded-md"
              value={conversionType}
              onChange={(e) => setConversionType(e.target.value)}
            >
              <option value="hiragana">平假名 Hiragana</option>
              <option value="katakana">片假名 Katakana</option>
              <option value="romaji">ローマ字 Romaji</option>
            </select>

            <select
              className="p-2 border rounded-md"
              value={conversionMode}
              onChange={(e) => setConversionMode(e.target.value)}
            >
              <option value="normal">一般 Normal</option>
              <option value="furigana">振假名 Furigana</option>
              <option value="okurigana">送り仮名 Okurigana</option>
              <option value="spaced">スペース Spaced</option>
            </select>

            <button
              onClick={handleConvert}
              disabled={isLoading || !inputText || !isInitialized}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Converting...' : 'Convert'}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={speakText}
                disabled={!inputText || isSpeaking}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {isSpeaking ? 'Speaking...' : 'Speak'}
              </button>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-24"
                title="Speech Rate"
              />
              <span className="text-sm text-gray-600">{speechRate}x</span>
            </div>
          </div>

          {convertedText && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Converted Text
              </label>
              <div 
                className="p-4 bg-gray-50 rounded-md min-h-[100px] break-words"
                dangerouslySetInnerHTML={{ __html: convertedText }}
              />

              <div className="mt-4 flex flex-wrap gap-2 sm:gap-4">
                <button
                  onClick={copyAsHTML}
                  className={`px-4 py-2 text-white rounded-md disabled:opacity-50 transition-colors
                    ${copySuccess ? 'bg-green-500' : 'bg-purple-500 hover:bg-purple-600'}`}
                >
                  {copySuccess ? (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    'Copy as HTML'
                  )}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!convertedText}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <SaveHistory
        savedItems={savedItems}
        onDelete={handleDelete}
      />
      <div className="fixed bottom-4 w-full text-center text-gray-600">
        Ⓒ Hsieh-Ting Lin made with ❤️
      </div>
    </div>
  );
}

export default App;