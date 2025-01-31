import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT_FILES = [
  'base.dat.gz',
  'cc.dat.gz',
  'tid.dat.gz'
];

const DICT_URL_BASE = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'dict');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${outputPath}`);
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded ${url}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete the file if download failed
      reject(err);
    });
  });
}

async function downloadDictFiles() {
  for (const filename of DICT_FILES) {
    const url = DICT_URL_BASE + filename;
    const outputPath = path.join(OUTPUT_DIR, filename);
    
    try {
      await downloadFile(url, outputPath);
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
      process.exit(1);
    }
  }
  
  console.log('All dictionary files downloaded successfully!');
}

downloadDictFiles();
