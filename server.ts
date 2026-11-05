import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCliArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return undefined;
}

import { generateCurriculumQuiz } from './src/lib/quizGeneratorEngine.ts';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini AI SDK if API key is present
  const hasValidApiKey = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY.trim() !== '' && 
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );
  const ai = hasValidApiKey
    ? new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Endpoint for testing user-provided Gemini API key
  app.post('/api/test-key', async (req, res) => {
    try {
      const apiKey = (req.body.apiKey || req.headers['x-api-key'] || '').toString().trim();
      if (!apiKey) {
        return res.status(400).json({ success: false, message: 'API Key tidak boleh kosong.' });
      }

      const client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping',
      });

      if (response && response.text) {
        return res.json({ success: true, message: 'API Key Gemini valid dan terhubung dengan sukses!' });
      } else {
        return res.status(400).json({ success: false, message: 'Respon dari Gemini API kosong.' });
      }
    } catch (err: any) {
      const errStr = String(err?.message || err || '');
      console.log('[API Key Test Info]', errStr.slice(0, 150));

      let userMsg = 'Gagal terhubung ke Gemini API. Pastikan API Key valid.';
      if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota')) {
        userMsg = 'Kuota harian gratis API Key ini telah habis (429 Exceeded Quota). Anda dapat menggunakan Engine Kurikulum Otomatis tanpa API Key.';
      } else if (errStr.includes('API_KEY_INVALID') || errStr.includes('400') || errStr.includes('not valid')) {
        userMsg = 'Kode API Key Gemini tidak valid. Silakan periksa kembali kode dari Google AI Studio.';
      }

      return res.status(400).json({
        success: false,
        message: userMsg,
      });
    }
  });

  // API endpoint for generating questions
  app.post('/api/generate-questions', async (req, res) => {
    try {
      const { jenjang, kelas, mapel, topik, tipeSoal, jumlahSoal, levelKesulitan, distribusi, userApiKey } = req.body;
      const finalCount = Math.min(20, Math.max(1, Number(jumlahSoal) || 5));

      // Priority: User-provided API key from UI > Server Environment Key
      const customKey = (userApiKey || req.headers['x-api-key'] || '').toString().trim();
      const effectiveKey = customKey || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' ? process.env.GEMINI_API_KEY : '');
      const hasKey = Boolean(effectiveKey && effectiveKey.trim() !== '');

      const activeAi = hasKey
        ? new GoogleGenAI({
            apiKey: effectiveKey,
            httpOptions: {
              headers: { 'User-Agent': 'aistudio-build' },
            },
          })
        : null;

      const randomSeed = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      const userPrompt = `[Sesi Generasi Unik #${randomSeed}] Buatkan ${finalCount} butir soal ${tipeSoal || 'Pilihan Ganda'} yang 100% UNIK, SANGAT BERVARIASI (gunakan nama siswa, skenario cerita, dan angka yang berbeda), dan SESUAI dengan jenjang "${jenjang || 'SMP / MTs'}" dan tingkat "${kelas || 'Kelas 8'}", mata pelajaran "${mapel || 'Matematika'}", topik materi "${topik || 'Umum'}".
Tingkat kesulitan: ${levelKesulitan || 'Level 2: Sedang (Aplikasi)'}.
Distribusi: ${distribusi || 'Proporsional (Normal)'}.

PANDUAN KELAS & TINGKAT KOGNITIF (SANGAT PENTING):
- Jika jenjang SD Kelas 1-2: WAJIB gunakan bahasa ramah anak, kalimat singkat, angka kecil (1-20), objek konkret (buah, kelereng, pensil, keluarga). JANGAN berikan rumus aljabar atau konsep abstrak.
- Jika jenjang SD Kelas 3-4: Gunakan konsep dasar konkret-ke-abstrak, perkalian/pembagian bilangan bulat, pecahan sederhana (1/2, 1/4), wujud benda, pengenalan FPB/KPK.
- Jika jenjang SD Kelas 5-6: Sesuai kurikulum akhir SD, operasi pecahan, bangun ruang dasar, rantai makanan ekosistem, tata surya, sistem organ dasar manusia.
- Jika SMP (Kelas 7-9): Sesuai capaian pembelajaran SMP, bilangan bulat negatif, aljabar linear, pythagoras, gaya & hukum Newton, organ tubuh & sel, teks LHO, tajwid lengkap.
- Jika SMA/SMK (Kelas 10-12): Standar SMA/SMK, rumus formal (trigonometri, kalkulus, kinetika, stoikiometri, genetika DNA, matriks), analisis wacana kritis, atau matematika industri terapan.

ATURAN WAJIB (PATEN):
1. Setiap soal WAJIB unik, kontekstual, dan bervariasi sesuai tingkatan kelas ${kelas}. DILARANG MENAMPILKAN SOAL DENGAN KALIMAT ATAU BENTUK YANG SAMA DENGAN GENERASI SEBELUMNYA.
2. DILARANG KERAS menggunakan kalimat template berulang atau opsi klise seperti "Menjalankan tahapan analisis...".
3. KUNCI JAWABAN HARUS TERSEBAR ACAK SECARA MERATA di antara pilihan A, B, C, dan D (JANGAN semuanya A atau menumpuk di satu huruf).
4. Sediakan PEMBAHASAN yang detail, edukatif, dan sesuai dengan cara berpikir peserta didik kelas ${kelas}.
5. Format output WAJIB JSON murni tanpa markdown, dengan struktur:
{"soal": [{"id": 1, "pertanyaan": "...", "opsi": ["A. ...", "B. ...", "C. ...", "D. ..."], "kunci": "C. ...", "pembahasan": "..."}]}`;

      let responseText = '';
      if (activeAi) {
        const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
        
        for (const modelName of candidateModels) {
          try {
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Generation timeout')), 7000)
            );

            const response = await Promise.race([
              activeAi.models.generateContent({
                model: modelName,
                contents: userPrompt,
                config: {
                  systemInstruction: `Anda adalah pakar kurikulum Indonesia (K13 & Kurikulum Merdeka) yang menyusun soal ujian nasional terstandar. Anda WAJIB menyesuaikan bahasa, konsep, dan tingkat kesulitan 100% tepat dengan jenjang dan kelas yang diminta (${jenjang} - ${kelas}). Hasilkan soal yang autentik dengan kunci jawaban teracak merata (A, B, C, D) dan pembahasan edukatif. Output wajib JSON valid.`,
                  responseMimeType: "application/json",
                },
              }),
              timeoutPromise
            ]);

            if (response && response.text && response.text.trim()) {
              responseText = response.text;
              break;
            }
          } catch {
            // Smoothly move to next candidate model
          }
        }
      }

      if (responseText) {
        try {
          let cleanJson = responseText.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          const parsed = JSON.parse(cleanJson);
          if (parsed && Array.isArray(parsed.soal) && parsed.soal.length > 0) {
            return res.json(parsed);
          }
        } catch (parseErr) {
          console.error("Failed to parse AI JSON response:", parseErr);
        }
      }

      // Gunakan Engine Pembuat Soal Kurikulum Berkualitas Tinggi (PATEN)
      const generated = generateCurriculumQuiz({
        jenjang: jenjang || 'SMP / MTs',
        kelas: kelas || 'Kelas 8',
        mapel: mapel || 'Matematika',
        topik: topik || 'Teorema Pythagoras',
        tipeSoal: tipeSoal || 'Pilihan Ganda',
        jumlahSoal: finalCount,
        levelKesulitan: levelKesulitan || 'Level 2: Sedang (Aplikasi)',
        distribusi: distribusi || 'Proporsional (Normal)'
      });

      return res.json({ soal: generated });

    } catch (error: any) {
      console.error("Error in /api/generate-questions:", error);
      const generated = generateCurriculumQuiz(req.body);
      return res.json({ soal: generated });
    }
  });

  // Setup Vite in development or static serving in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Determine port and host:
  // When running in dev mode via `tsx server.ts --port 3000 --host 0.0.0.0`,
  // extract CLI arguments to ensure binding to port 3000 even if environment PORT is 8080.
  const cliPort = getCliArg('--port');
  const cliHost = getCliArg('--host');
  const PORT = Number(cliPort || (isProduction ? process.env.PORT : 3000)) || 3000;
  const HOST = cliHost || '0.0.0.0';

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error(`Server error on port ${PORT}:`, err);
  });
}

startServer();
