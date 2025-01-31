# Japanese Text Converter

A modern web application for converting Japanese text between different writing systems with additional features like text-to-speech and save history.

## Features

- Text conversion between different Japanese writing systems:
  - Hiragana (平假名)
  - Katakana (片假名)
  - Romaji (ローマ字)
- Multiple conversion modes:
  - Normal
  - Furigana (振假名)
  - Okurigana (送り仮名)
  - Spaced
- Text-to-speech functionality with adjustable speech rate
- Save and manage conversion history
- Copy converted text to clipboard
- Responsive design with a clean user interface

## Technologies Used

- React
- Kuroshiro (Japanese text converter)
- Browser-compatible Kuromoji Analyzer
- Web Speech API for text-to-speech
- Tailwind CSS for styling
- LocalStorage for persistent history

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Enter Japanese text in the input area
2. Select your desired conversion type (Hiragana, Katakana, or Romaji)
3. Choose a conversion mode (Normal, Furigana, Okurigana, or Spaced)
4. Click "Convert" to see the results
5. Use additional features:
   - Click "Speak" to hear the text pronounced
   - Adjust speech rate using the slider
   - Save conversions for later reference
   - Copy converted text to clipboard

## Note

The application requires initialization of the Kuromoji dictionary when first loaded. Please wait for the initialization to complete before using the converter.
