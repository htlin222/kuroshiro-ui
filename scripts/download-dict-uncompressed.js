import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createGunzip } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT_FILES = [
  'base.dat',
  'cc.dat',
  'tid.dat'
];

const DICT_URL_BASE = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'dict');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadAndDecompress(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading and decompressing ${url} to ${outputPath}`);
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const gunzip = createGunzip();
      response.pipe(gunzip).pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded and decompressed ${url}`);
        resolve();
      });

      gunzip.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function downloadDictFiles() {
  for (const filename of DICT_FILES) {
    const url = DICT_URL_BASE + filename + '.gz';
    const outputPath = path.join(OUTPUT_DIR, filename);
    
    try {
      await downloadAndDecompress(url, outputPath);
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
      process.exit(1);
    }
  }
  
  console.log('All dictionary files downloaded and decompressed successfully!');
}

downloadDictFiles();
