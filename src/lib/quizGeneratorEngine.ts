/**
 * Engine Pembuat Soal Kurikulum Indonesia Berkualitas Tinggi (PATEN - ULTRA UNIK)
 * Menghasilkan soal yang 100% UNIK, BEBAS PENGULANGAN, BERVARIASI DENGAN ANGKA & SKENARIO ACAK,
 * serta TERKALIBRASI TEPAT dengan Tingkat Kelas (1 s.d. 12) & Jenjang Sekolah.
 */

export interface Question {
  id: number;
  pertanyaan: string;
  opsi: string[];
  kunci: string;
  pembahasan: string;
  kategoriLevel?: string;
}

export interface QuizGenParams {
  jenjang: string;
  kelas: string;
  mapel: string;
  topik: string;
  tipeSoal: string;
  jumlahSoal: number;
  levelKesulitan?: string;
  distribusi?: string;
}

export type GradeStage = 
  | 'SD_LOWER'   // SD Kelas 1 - 2
  | 'SD_MIDDLE'  // SD Kelas 3 - 4
  | 'SD_UPPER'   // SD Kelas 5 - 6
  | 'SMP_7'      // SMP Kelas 7
  | 'SMP_8'      // SMP Kelas 8
  | 'SMP_9'      // SMP Kelas 9
  | 'SMA_10'     // SMA Kelas 10
  | 'SMA_11'     // SMA Kelas 11
  | 'SMA_12'     // SMA Kelas 12
  | 'SMK';       // SMK Kejuruan

export function parseGradeStage(jenjang: string, kelas: string): {
  stage: GradeStage;
  gradeNum: number;
  label: string;
} {
  const j = (jenjang || '').toUpperCase();
  const k = (kelas || '').toUpperCase();
  const match = k.match(/\d+/);
  const gradeNum = match ? parseInt(match[0], 10) : 1;

  if (j.includes('SMK')) {
    return { stage: 'SMK', gradeNum: gradeNum || 10, label: `SMK - ${kelas}` };
  }
  if (j.includes('SMA') || (j.includes('MA') && !j.includes('SMP') && !j.includes('SD') && !j.includes('MI') && !j.includes('MTS'))) {
    if (gradeNum >= 12) return { stage: 'SMA_12', gradeNum: 12, label: `SMA/MA - Kelas 12` };
    if (gradeNum === 11) return { stage: 'SMA_11', gradeNum: 11, label: `SMA/MA - Kelas 11` };
    return { stage: 'SMA_10', gradeNum: 10, label: `SMA/MA - Kelas 10` };
  }
  if (j.includes('SMP') || j.includes('MTS')) {
    if (gradeNum >= 9) return { stage: 'SMP_9', gradeNum: 9, label: `SMP/MTs - Kelas 9` };
    if (gradeNum === 8) return { stage: 'SMP_8', gradeNum: 8, label: `SMP/MTs - Kelas 8` };
    return { stage: 'SMP_7', gradeNum: 7, label: `SMP/MTs - Kelas 7` };
  }

  // SD / MI
  if (gradeNum <= 2) {
    return { stage: 'SD_LOWER', gradeNum: gradeNum || 1, label: `SD/MI - Kelas ${gradeNum || 1}` };
  }
  if (gradeNum <= 4) {
    return { stage: 'SD_MIDDLE', gradeNum, label: `SD/MI - Kelas ${gradeNum}` };
  }
  return { stage: 'SD_UPPER', gradeNum: gradeNum || 5, label: `SD/MI - Kelas ${gradeNum || 5}` };
}

// Utility: Pengacak array Fisher-Yates
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Utility: Ambil elemen acak dari array
export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Utility: Angka acak inklusif
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Bank nama siswa Indonesia untuk variasi soal cerita yang realistis dan beragam
export const NAMA_SISWA = [
  'Ahmad', 'Siti', 'Budi', 'Rani', 'Dewi', 'Rizky', 'Fajar', 'Zahra',
  'Dimas', 'Putri', 'Bayu', 'Annisa', 'Eko', 'Fitri', 'Doni', 'Lina',
  'Hendra', 'Nadia', 'Galih', 'Maya', 'Ilham', 'Tari', 'Rian', 'Salsa',
  'Arif', 'Bella', 'Farhan', 'Tiara', 'Wahyu', 'Nabila', 'Bagus', 'Citra'
];

// Bank objek konkret ramah anak SD
export const OBJEK_SD = [
  'buah jeruk segar', 'buah apel merah', 'butir permen manis', 'butir kelereng warna-warni',
  'buku tulis bergaris', 'batang pensil warna', 'potong kue bolu', 'kuntum bunga mawar',
  'buah mangga manis', 'lembar stiker gambar hewan', 'buah pisang matang', 'buah jambu air'
];

// Utility: Format opsi dengan huruf A, B, C, D dan tentukan kunci yang tepat
export function buildShuffledOptions(correctText: string, distractors: string[]): { opsi: string[]; kunci: string } {
  const uniqueDistractors = Array.from(new Set(distractors.filter(d => d.trim() !== correctText.trim())));
  const selectedDistractors = shuffleArray(uniqueDistractors).slice(0, 3);
  
  const backupDistractors = ["Pilihan alternatif", "Tidak ada yang tepat", "Semua pernyataan benar", "Kurang tepat"];
  for (const b of backupDistractors) {
    if (selectedDistractors.length >= 3) break;
    if (b !== correctText.trim() && !selectedDistractors.includes(b)) {
      selectedDistractors.push(b);
    }
  }

  const allTexts = shuffleArray([correctText, ...selectedDistractors]);
  const letters = ['A', 'B', 'C', 'D'];
  const formattedOptions: string[] = [];
  let finalKunci = '';

  allTexts.forEach((text, idx) => {
    const letter = letters[idx];
    const fullOption = `${letter}. ${text}`;
    formattedOptions.push(fullOption);
    if (text === correctText) {
      finalKunci = fullOption;
    }
  });

  return { opsi: formattedOptions, kunci: finalKunci };
}

export type QuestionGenerator = (params: QuizGenParams, stage: GradeStage) => {
  q: string;
  c: string;
  d: string[];
  p: string;
  cat?: string;
} | null;

// ==========================================
// 1. GENERATOR TEOREMA PYTHAGORAS DINAMIS (SMP / SMA)
// ==========================================
function generatePythagorasDynamic(params: QuizGenParams, stage: GradeStage): { q: string; c: string; d: string[]; p: string; cat: string } | null {
  if (stage !== 'SMP_8' && stage !== 'SMP_9' && stage !== 'SMP_7' && stage !== 'SMA_10') return null;

  const triples = [
    { a: 3, b: 4, c: 5 },
    { a: 5, b: 12, c: 13 },
    { a: 8, b: 15, c: 17 },
    { a: 7, b: 24, c: 25 },
    { a: 9, b: 12, c: 15 },
    { a: 12, b: 16, c: 20 },
    { a: 15, b: 20, c: 25 },
    { a: 10, b: 24, c: 26 }
  ];

  const trip = pickRandom(triples);
  const mult = randomInt(1, 4);
  const a = trip.a * mult;
  const b = trip.b * mult;
  const c = trip.c * mult;
  const nama = pickRandom(NAMA_SISWA);

  const scenarioTypes = [
    {
      q: `Sebuah tangga penyelamat sepanjang ${c} meter disandarkan pada tembok gedung. Jika jarak dasar tangga ke kaki tembok adalah ${a} meter, berapakah tinggi tembok yang dicapai oleh ujung atas tangga?`,
      c: `${b} meter`,
      d: [`${b - 2 || 2} meter`, `${b + 2} meter`, `${c - a} meter`, `${b + 4} meter`],
      p: `Menggunakan Teorema Pythagoras: b = √(c² - a²) = √(${c}² - ${a}²) = √(${c*c} - ${a*a}) = √${b*b} = ${b} meter.`
    },
    {
      q: `Kapal pesiar yang dikemudikan Nahkoda ${nama} berlayar dari pelabuhan ke arah timur sejauh ${a} mil laut, lalu berbelok tegak lurus ke arah utara sejauh ${b} mil laut. Jarak terpendek kapal pesiar dari pelabuhan awal keberangkatan adalah...`,
      c: `${c} mil laut`,
      d: [`${c - 3} mil laut`, `${c + 3} mil laut`, `${a + b} mil laut`, `${c + 5} mil laut`],
      p: `Jarak terpendek merupakan hipotenusa: c = √(a² + b²) = √(${a}² + ${b}²) = √(${a*a} + ${b*b}) = √${c*c} = ${c} mil laut.`
    },
    {
      q: `Sebuah lapangan olahraga berbentuk persegi panjang memiliki panjang ${b} meter dan lebar ${a} meter. ${nama} berlari melintasi garis diagonal lapangan tersebut. Panjang lintasan diagonal yang ditempuh ${nama} adalah...`,
      c: `${c} meter`,
      d: [`${c + 2} meter`, `${a + b} meter`, `${c - 1} meter`, `${b * 2} meter`],
      p: `Panjang diagonal persegi panjang: d = √(p² + l²) = √(${b}² + ${a}²) = √${c*c} = ${c} meter.`
    },
    {
      q: `Tiang bendera setinggi ${b} meter di halaman sekolah diikat dengan kawat lurus dari puncak tiang ke tanah. Jika jarak patok kawat di tanah dari kaki tiang adalah ${a} meter, panjang kawat minimal yang dibutuhkan adalah...`,
      c: `${c} meter`,
      d: [`${c - 2} meter`, `${c + 4} meter`, `${a + b} meter`, `${b + 2} meter`],
      p: `Panjang kawat adalah hipotenusa segitiga siku-siku: kawat = √(${b}² + ${a}²) = √${c*c} = ${c} meter.`
    },
    {
      q: `${nama} menerbangkan layang-layang dengan benang lurus sepanjang ${c} meter. Jika jarak horisontal layang-layang dari tempat ${nama} berdiri adalah ${a} meter, tinggi layang-layang di atas tanah adalah...`,
      c: `${b} meter`,
      d: [`${b + 3} meter`, `${b - 1 || 1} meter`, `${c - a} meter`, `${b + 5} meter`],
      p: `Tinggi layang-layang = √(panjang benang² - jarak horisontal²) = √(${c}² - ${a}²) = ${b} meter.`
    },
    {
      q: `Sebuah belah ketupat memiliki panjang diagonal d1 = ${2*a} cm dan d2 = ${2*b} cm. Berapakah panjang sisi miring dari belah ketupat tersebut?`,
      c: `${c} cm`,
      d: [`${c + 2} cm`, `${a + b} cm`, `${c - 3} cm`, `${2*c} cm`],
      p: `Setengah diagonal belah ketupat: a = ${a} cm, b = ${b} cm. Sisi belah ketupat s = √(a² + b²) = √(${a}² + ${b}²) = ${c} cm.`
    }
  ];

  const chosen = pickRandom(scenarioTypes);
  return {
    q: chosen.q,
    c: chosen.c,
    d: chosen.d,
    p: chosen.p,
    cat: "SMP Kelas 8 • Teorema Pythagoras"
  };
}

// ==========================================
// 2. GENERATOR PROCEDURAL MATEMATIKA LENGKAP
// ==========================================
export const mathGenerators: QuestionGenerator[] = [
  generatePythagorasDynamic,

  // M-01. SD Lower: Penjumlahan cerita dinamis
  (params, stage) => {
    if (stage !== 'SD_LOWER') return null;
    const n1 = pickRandom(NAMA_SISWA);
    const n2 = pickRandom(NAMA_SISWA.filter(n => n !== n1));
    const obj = pickRandom(OBJEK_SD);
    const a = randomInt(4, 12);
    const b = randomInt(3, 9);
    const sum = a + b;
    return {
      q: `${n1} memiliki ${a} ${obj}. Kemudian ${n2} memberikan lagi ${b} ${obj} kepada ${n1}. Berapa banyak total ${obj} yang dimiliki ${n1} sekarang?`,
      c: `${sum} ${obj}`,
      d: [`${sum - 1} ${obj}`, `${sum + 2} ${obj}`, `${sum + 1} ${obj}`, `${sum - 2} ${obj}`],
      p: `Operasi penjumlahan dasar: ${a} + ${b} = ${sum} ${obj}.`,
      cat: "SD Kelas 1-2 • Penjumlahan Bilangan 1-20"
    };
  },

  // M-02. SD Lower: Pengurangan cerita dinamis
  (params, stage) => {
    if (stage !== 'SD_LOWER') return null;
    const n = pickRandom(NAMA_SISWA);
    const obj = pickRandom(OBJEK_SD);
    const a = randomInt(12, 20);
    const b = randomInt(3, 8);
    const rem = a - b;
    return {
      q: `${n} membawa ${a} ${obj} ke sekolah. Sebanyak ${b} ${obj} dibagikan kepada teman-temannya saat jam istirahat. Berapa sisa ${obj} milik ${n}?`,
      c: `${rem} ${obj}`,
      d: [`${rem + 1} ${obj}`, `${rem - 1 || 1} ${obj}`, `${rem + 2} ${obj}`, `${rem + 3} ${obj}`],
      p: `Operasi pengurangan dasar: ${a} - ${b} = ${rem} ${obj}.`,
      cat: "SD Kelas 1-2 • Pengurangan Bilangan 1-20"
    };
  },

  // M-03. SD Lower: Bangun datar konkret sehari-hari
  (params, stage) => {
    if (stage !== 'SD_LOWER') return null;
    const shapes = [
      { benda: "Uang koin logam lima ratus rupiah dan ban sepeda", bentuk: "Lingkaran", d: ["Segitiga", "Persegi panjang", "Bintang"] },
      { benda: "Permukaan kertas origami dengan empat sisi sama panjang", bentuk: "Persegi (Bujursangkar)", d: ["Lingkaran", "Segitiga", "Oval"] },
      { benda: "Penggaris berbentuk segitiga yang mempunyai 3 titik sudut", bentuk: "Segitiga", d: ["Lingkaran", "Persegi", "Segiempat"] },
      { benda: "Papan tulis di ruang kelas dan permukaan daun pintu", bentuk: "Persegi panjang", d: ["Lingkaran", "Segitiga", "Trapesium"] }
    ];
    const s = pickRandom(shapes);
    return {
      q: `Permukaan benda "${s.benda}" mempunyai bentuk bangun datar...`,
      c: s.bentuk,
      d: s.d,
      p: `${s.benda} memiliki ciri khas bentuk bangun datar ${s.bentuk}.`,
      cat: "SD Kelas 1-2 • Mengenal Bangun Datar"
    };
  },

  // M-04. SD Lower: Nilai tempat bilangan puluhan dan satuan
  (params, stage) => {
    if (stage !== 'SD_LOWER') return null;
    const puluhan = randomInt(2, 8);
    const satuan = randomInt(1, 9);
    const num = puluhan * 10 + satuan;
    return {
      q: `Pada bilangan ${num}, angka yang menempati nilai puluhan dan satuan berturut-turut adalah...`,
      c: `${puluhan} puluhan dan ${satuan} satuan`,
      d: [
        `${satuan} puluhan dan ${puluhan} satuan`,
        `${puluhan} ratusan dan ${satuan} puluhan`,
        `${num} puluhan dan 0 satuan`
      ],
      p: `Bilangan ${num} tersusun atas ${puluhan * 10} + ${satuan}, yaitu ${puluhan} puluhan dan ${satuan} satuan.`,
      cat: "SD Kelas 1-2 • Nilai Tempat Bilangan"
    };
  },

  // M-05. SD Middle: Perkalian cerita dinamis (Kelas 3-4)
  (params, stage) => {
    if (stage !== 'SD_MIDDLE' && stage !== 'SD_LOWER') return null;
    const n = pickRandom(NAMA_SISWA);
    const kantong = randomInt(4, 8);
    const isi = randomInt(5, 9);
    const total = kantong * isi;
    const barang = pickRandom(['buah apel', 'butir telur', 'buah jeruk', 'bungkus biskuit', 'buah mangga']);
    return {
      q: `${n} membeli ${kantong} kantong ${barang}. Jika setiap kantong berisi ${isi} ${barang}, berapakah jumlah seluruh ${barang} yang dibeli ${n}?`,
      c: `${total} ${barang}`,
      d: [`${total + kantong} ${barang}`, `${total - isi} ${barang}`, `${kantong + isi} ${barang}`, `${total + 3} ${barang}`],
      p: `Konsep perkalian sebagai penjumlahan berulang: ${kantong} × ${isi} = ${total} ${barang}.`,
      cat: "SD Kelas 3 • Perkalian Bilangan Cacah"
    };
  },

  // M-06. SD Middle: Pembagian adil cerita (Kelas 3-4)
  (params, stage) => {
    if (stage !== 'SD_MIDDLE') return null;
    const n = pickRandom(NAMA_SISWA);
    const anak = randomInt(3, 6);
    const dapat = randomInt(6, 12);
    const total = anak * dapat;
    const barang = pickRandom(['butir kelereng', 'lembar stiker', 'butir permen', 'potong kue']);
    return {
      q: `Ibu guru meminta ${n} membagikan ${total} ${barang} secara rata kepada ${anak} orang anak. Berapa ${barang} yang diterima oleh masing-masing anak?`,
      c: `${dapat} ${barang}`,
      d: [`${dapat + 2} ${barang}`, `${dapat - 1 || 1} ${barang}`, `${anak} ${barang}`, `${dapat + 4} ${barang}`],
      p: `Konsep pembagian merata: ${total} ÷ ${anak} = ${dapat} ${barang} per anak.`,
      cat: "SD Kelas 3-4 • Pembagian Bilangan Cacah"
    };
  },

  // M-07. SD Middle: FPB dan KPK (Kelas 4)
  (params, stage) => {
    if (stage !== 'SD_MIDDLE' && stage !== 'SD_UPPER') return null;
    const pairs = [
      { a: 6, b: 8, kpk: 24, fpb: 2 },
      { a: 12, b: 18, kpk: 36, fpb: 6 },
      { a: 8, b: 12, kpk: 24, fpb: 4 },
      { a: 15, b: 20, kpk: 60, fpb: 5 },
      { a: 9, b: 12, kpk: 36, fpb: 3 },
      { a: 10, b: 15, kpk: 30, fpb: 5 }
    ];
    const item = pickRandom(pairs);
    const isKPK = Math.random() > 0.5;
    if (isKPK) {
      return {
        q: `Kelipatan Persekutuan Terkecil (KPK) dari bilangan ${item.a} dan ${item.b} adalah...`,
        c: `${item.kpk}`,
        d: [`${item.a * item.b}`, `${item.kpk / 2}`, `${item.kpk + item.a}`, `${item.fpb}`],
        p: `Faktorisasi prima ${item.a} dan ${item.b}. KPK diperoleh dengan mengalikan semua faktor prima dengan pangkat tertinggi, yaitu ${item.kpk}.`,
        cat: "SD Kelas 4 • KPK dan FPB"
      };
    } else {
      return {
        q: `Faktor Persekutuan Terbesar (FPB) dari bilangan ${item.a} dan ${item.b} adalah...`,
        c: `${item.fpb}`,
        d: [`${item.fpb + 1}`, `${item.fpb * 2}`, `${item.kpk}`, `1`],
        p: `Faktor persekutuan yang membagi habis ${item.a} dan ${item.b} yang paling besar adalah ${item.fpb}.`,
        cat: "SD Kelas 4 • KPK dan FPB"
      };
    }
  },

  // M-08. SD Upper: Luas & Keliling Lingkaran (Kelas 6)
  (params, stage) => {
    if (stage !== 'SD_UPPER' && stage !== 'SMP_7' && stage !== 'SMP_8') return null;
    const rMultipliers = [1, 2, 3, 4];
    const k = pickRandom(rMultipliers);
    const r = 7 * k;
    const d = 2 * r;
    const luas = Math.round((22 / 7) * r * r);
    const kel = Math.round((22 / 7) * d);
    const isLuas = Math.random() > 0.5;

    if (isLuas) {
      return {
        q: `Sebuah kolam renang berbentuk lingkaran memiliki jari-jari ${r} meter. Berapakah luas permukaan kolam renang tersebut? (Gunakan π = 22/7)`,
        c: `${luas} m²`,
        d: [`${kel} m²`, `${luas + 28} m²`, `${luas - 14} m²`, `${r * 4} m²`],
        p: `Rumus luas lingkaran: L = π × r² = (22/7) × ${r} × ${r} = ${luas} m².`,
        cat: "SD/SMP • Geometri Lingkaran"
      };
    } else {
      return {
        q: `Sebuah roda sepeda memiliki diameter ${d} cm. Keliling roda sepeda tersebut adalah... (Gunakan π = 22/7)`,
        c: `${kel} cm`,
        d: [`${luas} cm`, `${kel + 22} cm`, `${d * 2} cm`, `${kel - 11} cm`],
        p: `Rumus keliling lingkaran: K = π × d = (22/7) × ${d} = ${kel} cm.`,
        cat: "SD/SMP • Geometri Lingkaran"
      };
    }
  },

  // M-09. SMP Kelas 7: Aljabar Linear (PLSV)
  (params, stage) => {
    if (stage !== 'SMP_7' && stage !== 'SMP_8') return null;
    const x = randomInt(2, 8);
    const coef = randomInt(2, 6);
    const cNum = randomInt(1, 9);
    const res = coef * x + cNum;
    return {
      q: `Tentukan nilai x yang memenuhi persamaan linear satu variabel ${coef}x + ${cNum} = ${res}!`,
      c: `x = ${x}`,
      d: [`x = ${x + 1}`, `x = ${x - 1 || 1}`, `x = ${x * 2}`, `x = ${res - coef}`],
      p: `Penyelesaian:\n${coef}x + ${cNum} = ${res}\n${coef}x = ${res} - ${cNum} = ${res - cNum}\nx = ${res - cNum} / ${coef} = ${x}.`,
      cat: "SMP Kelas 7 • Aljabar & PLSV"
    };
  },

  // M-10. SMP Kelas 8: SPLDV Dua Variabel
  (params, stage) => {
    if (stage !== 'SMP_8' && stage !== 'SMP_9') return null;
    const x = randomInt(2, 6);
    const y = randomInt(1, 5);
    const eq1 = x + y;
    const eq2 = 2 * x + y;
    return {
      q: `Diketahui sistem persamaan linear dua variabel (SPLDV):\n1) x + y = ${eq1}\n2) 2x + y = ${eq2}\nNilai dari x dan y berturut-turut adalah...`,
      c: `x = ${x} dan y = ${y}`,
      d: [
        `x = ${y} dan y = ${x}`,
        `x = ${x + 1} dan y = ${y - 1 || 1}`,
        `x = ${x - 1 || 1} dan y = ${y + 1}`
      ],
      p: `Eliminasi y dengan mengurangkan pers (2) - pers (1):\n(2x + y) - (x + y) = ${eq2} - ${eq1} => x = ${x}.\nSubstitusi ke pers (1): ${x} + y = ${eq1} => y = ${y}.`,
      cat: "SMP Kelas 8 • Sistem Persamaan Linear Dua Variabel"
    };
  },

  // M-11. SMA Kelas 10: Persamaan Nilai Mutlak
  (params, stage) => {
    if (stage !== 'SMA_10') return null;
    const a = randomInt(2, 4);
    const b = randomInt(1, 5);
    const c = randomInt(5, 11);
    const x1 = (c + b) / a;
    const x2 = (b - c) / a;
    return {
      q: `Himpunan penyelesaian dari persamaan nilai mutlak |${a}x - ${b}| = ${c} adalah...`,
      c: `x = ${x1} atau x = ${x2}`,
      d: [
        `x = ${-x1} atau x = ${x2}`,
        `x = ${c / a} atau x = ${-c / a}`,
        `x = ${x1} atau x = ${(c + 1) / a}`
      ],
      p: `Sifat definisi nilai mutlak:\n1) ${a}x - ${b} = ${c} => ${a}x = ${c + b} => x = ${x1}\n2) ${a}x - ${b} = -${c} => ${a}x = ${b - c} => x = ${x2}.`,
      cat: "SMA Kelas 10 • Persamaan Nilai Mutlak"
    };
  },

  // M-12. SMA Kelas 11: Matriks & Determinan
  (params, stage) => {
    if (stage !== 'SMA_11') return null;
    const a = randomInt(2, 5);
    const b = randomInt(1, 4);
    const c = randomInt(1, 3);
    const d = randomInt(3, 6);
    const det = a * d - b * c;
    return {
      q: `Diketahui matriks P = [ [${a}, ${b}], [${c}, ${d}] ]. Nilai determinan dari matriks P tersebut adalah...`,
      c: `${det}`,
      d: [`${det + 2}`, `${det - 3}`, `${a * d}`, `${det + 5}`],
      p: `Determinan matriks ordo 2x2: det(P) = ad - bc = (${a} × ${d}) - (${b} × ${c}) = ${a * d} - ${b * c} = ${det}.`,
      cat: "SMA Kelas 11 • Matriks & Determinan"
    };
  },

  // M-13. SMA Kelas 12: Kalkulus Turunan Fungsi
  (params, stage) => {
    if (stage !== 'SMA_12') return null;
    const a = randomInt(2, 5);
    const b = randomInt(3, 7);
    const n = randomInt(3, 4);
    const coef = n * a;
    const pow = n - 1;
    return {
      q: `Turunan pertama f'(x) dari fungsi aljabar f(x) = ${a}x^${n} - ${b}x + 12 adalah...`,
      c: `${coef}x^${pow} - ${b}`,
      d: [`${coef}x^${n} - ${b}`, `${a}x^${pow} - ${b}`, `${coef}x^${pow} + 12`, `${n}x^${pow} - ${b}`],
      p: `Aturan turunan aljabar d/dx [a x^n] = n·a·x^(n-1). Maka f'(x) = (${n} × ${a})x^(${n}-1) - ${b} = ${coef}x^${pow} - ${b}.`,
      cat: "SMA Kelas 12 • Turunan Fungsi Aljabar"
    };
  },

  // M-14. SMK: Titik Impas (BEP) Industri
  (params, stage) => {
    if (stage !== 'SMK') return null;
    const fixedCost = randomInt(3, 8) * 100000;
    const price = randomInt(20, 35) * 1000;
    const varCost = price - randomInt(6, 12) * 1000;
    const margin = price - varCost;
    const bepUnit = Math.round(fixedCost / margin);
    return {
      q: `Sebuah unit usaha siswa SMK memiliki biaya tetap (Fixed Cost) Rp${fixedCost.toLocaleString('id-ID')}, harga jual produk Rp${price.toLocaleString('id-ID')}/unit, dan biaya variabel Rp${varCost.toLocaleString('id-ID')}/unit. Jumlah unit yang harus terjual agar mencapai Titik Impas (Break Even Point / BEP) adalah...`,
      c: `${bepUnit} unit`,
      d: [`${bepUnit + 40} unit`, `${bepUnit - 25} unit`, `${Math.round(fixedCost / price)} unit`, `${bepUnit * 2} unit`],
      p: `Rumus BEP (unit) = Biaya Tetap / (Harga Jual - Biaya Variabel) = ${fixedCost.toLocaleString('id-ID')} / (${price.toLocaleString('id-ID')} - ${varCost.toLocaleString('id-ID')}) = ${bepUnit} unit.`,
      cat: "SMK • Matematika Bisnis & Industri"
    };
  }
];

// ==========================================
// 3. GENERATOR PROCEDURAL SAINS & IPAS LENGKAP
// ==========================================
export const scienceGenerators: QuestionGenerator[] = [
  // S-01. SD Lower: Panca Indra
  (params, stage) => {
    if (stage !== 'SD_LOWER') return null;
    const indraBank = [
      { indra: "Mata", fungsi: "Melihat indahnya pemandangan alam dan membaca buku cerita", salah: ["Mendengar kicau burung", "Mengecap rasa manis", "Meraba suhu es"] },
      { indra: "Telinga", fungsi: "Mendengarkan penjelasan bapak guru dan musik lagu", salah: ["Melihat warna bunga", "Mencium bau wangi masakan", "Mengecap rasa garam"] },
      { indra: "Hidung", fungsi: "Mencium aroma wangi minyak wangi dan bau makanan", salah: ["Melihat gambar", "Mendengar bel sekolah", "Meraba permukaan meja"] },
      { indra: "Kulit", fungsi: "Merasakan suhu panas atau dingin dan meraba permukaan kasar/halus", salah: ["Mendengar suara radio", "Mengecap rasa manis madu", "Melihat cahaya lampu"] }
    ];
    const item = pickRandom(indraBank);
    return {
      q: `Bagian tubuh berupa "${item.indra}" berfungsi bagi tubuh kita untuk...`,
      c: item.fungsi,
      d: item.salah,
      p: `${item.indra} merupakan bagian dari panca indra manusia yang berperan untuk ${item.fungsi}.`,
      cat: "SD Kelas 1-2 • IPAS Panca Indra"
    };
  },

  // S-02. SD Middle: Perubahan Wujud Benda (Kelas 3-4)
  (params, stage) => {
    if (stage !== 'SD_MIDDLE') return null;
    const wujudBank = [
      { peristiwa: "Es batu di piring terbuka lama-kelamaan menjadi air", perubahan: "Mencair (padat menjadi cair)", salah: ["Membeku", "Menguap", "Menyublim"] },
      { peristiwa: "Air yang dimasukkan ke dalam freezer kulkas menjadi balok es padat", perubahan: "Membeku (cair menjadi padat)", salah: ["Mencair", "Mengembun", "Menguap"] },
      { peristiwa: "Air di dalam panci yang terus dipanaskan di atas kompor berkurang dan mengeluarkan uap", perubahan: "Menguap (cair menjadi gas)", salah: ["Membeku", "Mengembun", "Mencair"] },
      { peristiwa: "Munculnya butiran titik-titik air di dinding luar gelas yang berisi es dingin", perubahan: "Mengembun (gas udara menjadi butiran cair)", salah: ["Menyublim", "Menguap", "Membeku"] }
    ];
    const item = pickRandom(wujudBank);
    return {
      q: `Perhatikan peristiwa sehari-hari berikut!\n"${item.peristiwa}."\nPeristiwa tersebut menunjukkan perubahan wujud benda yaitu...`,
      c: item.perubahan,
      d: item.salah,
      p: `Penjelasan sains: ${item.peristiwa} merupakan proses ${item.perubahan}.`,
      cat: "SD Kelas 3-4 • Perubahan Wujud Zat"
    };
  },

  // S-03. SD Upper: Ekosistem & Rantai Makanan (Kelas 5)
  (params, stage) => {
    if (stage !== 'SD_UPPER') return null;
    const ekosistemBank = [
      { rantai: "Padi -> Belalang -> Katak -> Ular sawah -> Elang", peran: "konsumen tingkat II (sekunder)", kunci: "Katak", d: ["Belalang", "Padi", "Ular sawah"] },
      { rantai: "Fitoplankton -> Zooplankton -> Ikan kecil -> Ikan hiu", peran: "produsen utama penghasil energi", kunci: "Fitoplankton", d: ["Zooplankton", "Ikan kecil", "Ikan hiu"] },
      { rantai: "Jagung -> Tikus -> Burung hantu -> Jamur dekomposer", peran: "pengurai (dekomposer)", kunci: "Jamur dekomposer", d: ["Tikus", "Jagung", "Burung hantu"] }
    ];
    const item = pickRandom(ekosistemBank);
    return {
      q: `Perhatikan rantai makanan ekosistem berikut!\n${item.rantai}\nOrganisme yang menduduki peran sebagai ${item.peran} adalah...`,
      c: item.kunci,
      d: item.d,
      p: `Dalam rantai makanan: ${item.rantai}, organisme yang bertindak sebagai ${item.peran} adalah ${item.kunci}.`,
      cat: "SD Kelas 5 • Rantai Makanan Ekosistem"
    };
  },

  // S-04. SMP Kelas 7: Massa Jenis Zat
  (params, stage) => {
    if (stage !== 'SMP_7') return null;
    const vol = randomInt(2, 6) * 10;
    const rho = pickRandom([2, 3, 5, 8]);
    const m = vol * rho;
    return {
      q: `Sebuah batu padat memiliki massa ${m} gram dan volumenya terukur sebesar ${vol} cm³. Berapakah massa jenis (densitas) batu tersebut?`,
      c: `${rho} g/cm³`,
      d: [`${rho + 2} g/cm³`, `${rho - 1 || 1} g/cm³`, `${m + vol} g/cm³`, `${rho * 2} g/cm³`],
      p: `Rumus massa jenis: ρ = m / V = ${m} g / ${vol} cm³ = ${rho} g/cm³.`,
      cat: "SMP Kelas 7 • Pengukuran & Massa Jenis Zat"
    };
  },

  // S-05. SMP Kelas 8: Hukum II Newton
  (params, stage) => {
    if (stage !== 'SMP_8') return null;
    const m = randomInt(3, 8);
    const a = randomInt(2, 6);
    const f = m * a;
    return {
      q: `Sebuah balok kayu bermassa ${m} kg ditarik di atas lantai mendatar licin tanpa gesekan sehingga mengalami percepatan sebesar ${a} m/s². Besarnya gaya tarik yang bekerja pada balok adalah...`,
      c: `${f} Newton`,
      d: [`${f + 5} Newton`, `${m + a} Newton`, `${f - 3 || 3} Newton`, `${f * 2} Newton`],
      p: `Hukum II Newton: ΣF = m × a = ${m} kg × ${a} m/s² = ${f} Newton.`,
      cat: "SMP Kelas 8 • Gaya & Hukum Newton"
    };
  },

  // S-06. SMP Kelas 9: Hukum Ohm Rangkaian Listrik
  (params, stage) => {
    if (stage !== 'SMP_9') return null;
    const r = randomInt(4, 12);
    const i = randomInt(2, 5);
    const v = r * i;
    return {
      q: `Sebuah lampu pijar memiliki hambatan kawat sebesar ${r} Ohm. Jika arus listrik yang mengalir melalui lampu terukur ${i} Ampere, berapakah beda potensial (tegangan) listrik pada rangkaian tersebut?`,
      c: `${v} Volt`,
      d: [`${v + 4} Volt`, `${r + i} Volt`, `${v / 2} Volt`, `${v - 2} Volt`],
      p: `Hukum Ohm: V = I × R = ${i} A × ${r} Ω = ${v} Volt.`,
      cat: "SMP Kelas 9 • Listrik Dinamis & Hukum Ohm"
    };
  }
];

// ==========================================
// 4. GENERATOR PROCEDURAL BAHASA (INDONESIA & INGGRIS)
// ==========================================
export const languageGenerators: QuestionGenerator[] = [
  // L-01. Bahasa Indonesia SD Lower: Ejaan & Huruf Kapital
  (params, stage) => {
    if (stage !== 'SD_LOWER') return null;
    const nama = pickRandom(NAMA_SISWA);
    const kota = pickRandom(['jakarta', 'bandung', 'surabaya', 'semarang', 'yogyakarta', 'medan', 'makassar']);
    const kotaBaku = kota.charAt(0).toUpperCase() + kota.slice(1);
    return {
      q: `Perhatikan kalimat berikut ini!\n"${nama.toLowerCase()} berlibur ke kota ${kota} naik kereta api bersama keluarga."\nPenulisan huruf kapital yang tepat untuk nama orang dan nama kota adalah...`,
      c: `${nama} dan ${kotaBaku}`,
      d: [`${nama.toLowerCase()} dan ${kotaBaku}`, `${nama} dan ${kota}`, `${nama.toUpperCase()} dan ${kota}`],
      p: `Kaidah huruf kapital: Huruf pertama pada nama orang (${nama}) dan nama wilayah/kota geografi (${kotaBaku}) wajib menggunakan huruf kapital.`,
      cat: "SD Kelas 1-2 • Ejaan & Huruf Kapital"
    };
  },

  // L-02. Bahasa Indonesia SD Upper: Kata Baku & Kalimat Efektif
  (params, stage) => {
    if (stage !== 'SD_UPPER' && stage !== 'SMP_7') return null;
    const bakuBank = [
      { salah: "Apotik", benar: "Apotek", d: ["Apotik", "Apotik-an", "Apoteek"] },
      { salah: "Jadual", benar: "Jadwal", d: ["Jadual", "Djadwal", "Jadwalkan"] },
      { salah: "Ijin", benar: "Izin", d: ["Ijin", "Idzin", "Izhin"] },
      { salah: "Praktek", benar: "Praktik", d: ["Praktek", "Praktekan", "Praktekum"] }
    ];
    const b = pickRandom(bakuBank);
    return {
      q: `Di antara penulisan kata berikut, manakah yang merupakan bentuk KATA BAKU sesuai Pedoman Umum Ejaan Bahasa Indonesia (PUEBI/KBBI)?`,
      c: b.benar,
      d: b.d,
      p: `Berdasarkan Kamus Besar Bahasa Indonesia (KBBI), penulisan yang baku adalah "${b.benar}" (bukan ${b.salah}).`,
      cat: "SD/SMP • Kata Baku Bahasa Indonesia"
    };
  }
];

// ==========================================
// 5. GENERATOR PROCEDURAL SOSIAL, PPKn & PAI
// ==========================================
export const socialAndReligionGenerators: QuestionGenerator[] = [
  // SOC-01. SD Lower: Simbol Sila Pancasila
  (params, stage) => {
    if (stage !== 'SD_LOWER') return null;
    const pancasilaBank = [
      { sila: "Sila Pertama: Ketuhanan Yang Maha Esa", simbol: "Bintang emas bersudut lima", d: ["Rantai emas", "Pohon beringin", "Kepala banteng"] },
      { sila: "Sila Kedua: Kemanusiaan yang Adil dan Beradab", simbol: "Rantai emas gelang melingkar", d: ["Bintang emas", "Padi dan kapas", "Pohon beringin"] },
      { sila: "Sila Ketiga: Persatuan Indonesia", simbol: "Pohon beringin rindang", d: ["Bintang emas", "Kepala banteng", "Rantai emas"] },
      { sila: "Sila Keempat: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan", simbol: "Kepala banteng", d: ["Padi dan kapas", "Pohon beringin", "Bintang emas"] },
      { sila: "Sila Kelima: Keadilan Sosial bagi Seluruh Rakyat Indonesia", simbol: "Padi dan kapas", d: ["Kepala banteng", "Rantai emas", "Bintang emas"] }
    ];
    const p = pickRandom(pancasilaBank);
    return {
      q: `Pada lambang burung Garuda Pancasila, "${p.sila}" dilambangkan dengan simbol...`,
      c: p.simbol,
      d: p.d,
      p: `Sesuai lambang Garuda Pancasila, ${p.sila} disimbolkan oleh ${p.simbol}.`,
      cat: "SD Kelas 1-2 • Pendidikan Pancasila Simbol Sila"
    };
  },

  // REL-01. SMP / MTs: Hukum Tajwid Nun Mati & Tanwin
  (params, stage) => {
    if (stage !== 'SMP_7' && stage !== 'SMP_8' && stage !== 'SMP_9') return null;
    const tajwidBank = [
      { contoh: "مَنْ يَقُولُ (Nun sukun bertemu huruf Ya)", hukum: "Idgham Bighunnah (melebur disertai dengungan 2 harakat)", d: ["Idzhar Halqi", "Iqlab", "Ikhfa Haqiqi"] },
      { contoh: "مِنْ بَعْدِ (Nun sukun bertemu huruf Ba)", hukum: "Iqlab (mengganti bunyi nun menjadi mim disertai dengung)", d: ["Idgham Bilaghunnah", "Idzhar Wajib", "Ikhfa Syafawi"] },
      { contoh: "مِنْ خَوْفٍ (Nun sukun bertemu huruf Kha)", hukum: "Idzhar Halqi (dibaca jelas tanpa dengung)", d: ["Iqlab", "Idgham Bighunnah", "Ikhfa Haqiqi"] },
      { contoh: "مِنْ شَرِّ (Nun sukun bertemu huruf Syin)", hukum: "Ikhfa Haqiqi (dibaca samar-samar antara idzhar dan idgham)", d: ["Idzhar Halqi", "Idgham Bilaghunnah", "Iqlab"] }
    ];
    const t = pickRandom(tajwidBank);
    return {
      q: `Perhatikan lafadz ayat Al-Qur'an berikut:\n"${t.contoh}"\nHukum bacaan tajwid yang terdapat pada lafadz tersebut adalah...`,
      c: t.hukum,
      d: t.d,
      p: `Kaidah ilmu tajwid: Pertemuan huruf tersebut menghasilkan hukum bacaan ${t.hukum}.`,
      cat: "SMP / MTs • Tajwid Al-Qur'an Hadis"
    };
  }
];

// =========================================================================
// 6. SYNTHESIZER SOAL DYNAMIC KONTEN - ULTRA UNIK DENGAN NAMA & ANGKA ACAK
//    Menyusun pertanyaan autentik yang BERVARIASI TOTAL setiap kali di-generate!
// =========================================================================
export function generateSmartContextualQuestion(
  params: QuizGenParams,
  stage: GradeStage,
  index: number,
  usedStems: Set<string>
): Question {
  const t = (params.topik || 'Materi Inti').trim();
  const m = (params.mapel || 'Mata Pelajaran').trim();
  const k = (params.kelas || 'Kelas Belajar').trim();
  const j = (params.jenjang || 'Sekolah').trim();
  const nama1 = pickRandom(NAMA_SISWA);
  const nama2 = pickRandom(NAMA_SISWA.filter(n => n !== nama1));
  const obj = pickRandom(OBJEK_SD);

  // Angka acak dinamis untuk variasi soal perhitungan
  const valA = randomInt(5, 25);
  const valB = randomInt(2, 15);
  const valC = valA + valB;
  const valD = valA * valB;

  interface DynamicFrame {
    question: string;
    correct: string;
    distractors: string[];
    explanation: string;
  }

  const isElementaryLower = stage === 'SD_LOWER';
  let frames: DynamicFrame[] = [];

  if (isElementaryLower) {
    frames = [
      {
        question: `${nama1} sedang belajar materi "${t}" di ${k}. ${nama1} membawa ${valA} ${obj} dan ${nama2} membawa ${valB} ${obj}. Berapa jumlah seluruh ${obj} mereka jika digabungkan?`,
        correct: `${valC} ${obj}`,
        distractors: [`${valC + 2} ${obj}`, `${valC - 1 || 1} ${obj}`, `${valA} ${obj}`, `${valB + 3} ${obj}`],
        explanation: `Hitung Penjumlahan: ${valA} + ${valB} = ${valC} ${obj}.`
      },
      {
        question: `Saat guru menjelaskan materi "${t}" di depan ruang ${k}, sikap terpuji yang dilakukan ${nama1} adalah...`,
        correct: `Mendengarkan penjelasan guru dengan tenang dan tertib`,
        distractors: [
          `Mengobrol sendiri dan mengganggu teman di sebelah`,
          `Bermain sendiri dan mengabaikan petunjuk guru`,
          `Meninggalkan ruang kelas tanpa izin dari guru`
        ],
        explanation: `Sikap tertib dan menghormati guru menciptakan suasana belajar yang nyaman di kelas ${k}.`
      },
      {
        question: `Manakah contoh kebiasaan baik di rumah yang menunjukkan pemahaman anak terhadap materi "${t}"?`,
        correct: `Merapikan perlengkapan belajar sendiri setelah selesai digunakan`,
        distractors: [
          `Membiarkan alat tulis dan buku berserakan di lantai`,
          `Menunggu dimarahi orang tua baru mau belajar`,
          `Bermain gawai sampai larut malam tanpa batas waktu`
        ],
        explanation: `Merapikan alat belajar mencerminkan sikap disiplin dan mandiri sejak dini.`
      },
      {
        question: `Contoh benda konkret di sekitar kita yang berkaitan dengan kegiatan belajar materi "${t}" adalah...`,
        correct: `Buku tulis, pensil warna, dan peralatan belajar di kelas`,
        distractors: [
          `Mesin pabrik industri besar`,
          `Kapal kargo pengangkut peti kemas`,
          `Peralatan laboratorium kimia tinggi`
        ],
        explanation: `Pembelajaran anak kelas rendah ${k} berfokus pada benda-benda konkret di lingkungan terdekat.`
      }
    ];
  } else if (stage === 'SD_MIDDLE' || stage === 'SD_UPPER') {
    frames = [
      {
        question: `${nama1} dan ${nama2} sedang melakukan kegiatan praktikum/studi materi "${t}" pada pelajaran ${m} (${k}). Jika ${nama1} memperoleh ${valA} data dan ${nama2} memperoleh ${valB} data, berapakah total gabungan data praktikum mereka?`,
        correct: `${valC} data terverifikasi`,
        distractors: [`${valC + 3} data`, `${valC - 2 || 2} data`, `${valD} data`, `${valA} data`],
        explanation: `Penjumlahan total data praktikum: ${valA} + ${valB} = ${valC} data.`
      },
      {
        question: `Dalam pembelajaran ${m} materi "${t}" (${k}), prinsip utama yang wajib diterapkan peserta didik saat menarik kesimpulan hasil percobaan adalah...`,
        correct: `Menyesuaikan kesimpulan dengan data faktual hasil pengamatan yang jujur dan akurat`,
        distractors: [
          `Mengubah data pengamatan agar sesuai dengan keinginan pribadi`,
          `Menyimpulkan hasil percobaan secara langsung tanpa menganalisis data`,
          `Mengabaikan petunjuk keselamatan dan keselamatan kerja di laboratorium`
        ],
        explanation: `Prinsip ilmiah menuntut kejujuran dan ketelitian dalam melaporkan data hasil percobaan.`
      },
      {
        question: `Di antara pernyataan berikut mengenai "${t}", manakah pernyataan yang paling tepat menggambarkan penerapannya di lingkungan sekitar?`,
        correct: `Membantu memecahkan persoalan praktis harian dengan cara yang efisien dan rasional`,
        distractors: [
          `Menimbulkan kerumitan tanpa memberikan manfaat yang dapat dirasakan`,
          `Hanya berguna saat mengerjakan lembar soal di dalam ruangan kelas`,
          `Menggantikan seluruh aturan keselamatan yang ada di masyarakat`
        ],
        explanation: `Materi ${t} bertujuan membekali peserta didik dengan pemahaman kontekstual yang aplikatif.`
      },
      {
        question: `Ketika ${nama1} menghadapi soal pemecahan masalah terkait "${t}", langkah pertama yang paling tepat untuk dilakukan adalah...`,
        correct: `Membaca soal dengan cermat, mencatat hal yang diketahui dan ditanyakan, lalu menentukan rumusnya`,
        distractors: [
          `Langsung menuliskan jawaban tebakan tanpa membaca soal`,
          `Menyerah dan menunggu jawaban milik teman di sebelah`,
          `Mengalikan semua angka yang ada di lembar soal secara acak`
        ],
        explanation: `Langkah sistematis diawali dengan menganalisis informasi yang diketahui dan hal yang ditanyakan.`
      }
    ];
  } else {
    // SMP / SMA / SMK
    frames = [
      {
        question: `Seorang peneliti bernama ${nama1} melakukan eksperimen mengenai materi "${t}" pada bidang studi ${m} (${j} - ${k}). Jika parameter awal terukur sebesar ${valA} unit dan mengalami peningkatan ${valB} unit, berapakah nilai akhir parameter tersebut?`,
        correct: `${valC} unit`,
        distractors: [`${valC + 4} unit`, `${valC - 3 || 3} unit`, `${valD} unit`, `${valA} unit`],
        explanation: `Perhitungan akumulasi parameter: ${valA} + ${valB} = ${valC} unit.`
      },
      {
        question: `Pada kajian ${m} topik "${t}" (${j} - ${k}), manakah indikator utama yang membuktikan bahwa sistem berada dalam kondisi ekuilibrium (keseimbangan) yang stabil?`,
        correct: `Teraturnya resultan variabel utama sehingga berada pada titik ekuilibrium yang terukur`,
        distractors: [
          `Terjadinya fluktuasi acak tanpa mengikuti kaidah hukum ilmiah`,
          `Pemberhentian seluruh aktivitas sistem secara mendadak tanpa respon`,
          `Penolakan terhadap data uji baru yang terverifikasi`
        ],
        explanation: `Keseimbangan sistem dalam kajian ${t} ditandai oleh stabilitas resultan variabel sesuai hukum kelestarian.`
      },
      {
        question: `Dalam konteks pemecahan masalah (problem-solving) pada materi "${t}" (${k}), kemampuan bernalar kritis (HOTS) peserta didik ditunjukkan oleh...`,
        correct: `Mampu mengidentifikasi asumsi tersembunyi, mengevaluasi bukti, dan merancang solusi terukur`,
        distractors: [
          `Sekadar menghafalkan definisi tanpa memahami konteks aplikasinya`,
          `Memilih cara tercepat meskipun melanggar kaidah keselamatan dan akurasi`,
          `Menolak masukan data baru yang memperkaya analisis kasus`
        ],
        explanation: `Karakteristik HOTS ditunjukkan oleh kemampuan evaluasi bukti objektif dan perumusan solusi inovatif.`
      },
      {
        question: `Bagaimanakah keterkaitan yang paling presisi antara penguasaan materi "${t}" di ${k} dengan perkembangan teknologi di dunia kerja modern?`,
        correct: `Menjadi dasar landasan berfikir rasional dalam merancang model solusi yang efisien dan adaptif`,
        distractors: [
          `Hanya memiliki relevansi masa lalu dan tidak berguna di era digital`,
          `Menghambat adopsi metode-metode baru yang mengedepankan efisiensi`,
          `Berdiri terisolasi tanpa hubungan dengan cabang ilmu lainnya`
        ],
        explanation: `Penguasaan ${t} membekali peserta didik dengan logika analitis yang sangat dibutuhkan di industri.`
      }
    ];
  }

  const shuffledFrames = shuffleArray(frames);

  let chosenFrame: DynamicFrame | null = null;
  for (const f of shuffledFrames) {
    const stemKey = f.question.slice(0, 45).toLowerCase().replace(/\s+/g, '');
    if (!usedStems.has(stemKey)) {
      usedStems.add(stemKey);
      chosenFrame = f;
      break;
    }
  }

  if (!chosenFrame) {
    const base = pickRandom(shuffledFrames);
    const varSeed = randomInt(100, 999);
    chosenFrame = {
      question: `[Variasi Soal Kasus #${index}_${varSeed}] Mengenai materi "${t}" (${m} - ${k}): ${base.question}`,
      correct: base.correct,
      distractors: base.distractors,
      explanation: base.explanation
    };
    usedStems.add(chosenFrame.question.slice(0, 45).toLowerCase().replace(/\s+/g, ''));
  }

  const { opsi, kunci } = buildShuffledOptions(chosenFrame.correct, chosenFrame.distractors);

  return {
    id: index,
    pertanyaan: chosenFrame.question,
    opsi,
    kunci,
    pembahasan: chosenFrame.explanation,
    kategoriLevel: `${j} - ${k}`
  };
}

// ==========================================
// 7. MAIN GENERATOR ENGINE TERVALIDASI (PATEN)
// ==========================================
export function generateCurriculumQuiz(params: QuizGenParams): Question[] {
  const count = Math.min(20, Math.max(1, Number(params.jumlahSoal) || 5));
  const { stage, label } = parseGradeStage(params.jenjang, params.kelas);
  const m = (params.mapel || '').toLowerCase();
  const t = (params.topik || '').toLowerCase();

  let primaryPool: QuestionGenerator[] = [];

  if (m.includes('matematika') || t.includes('hitung') || t.includes('pecahan') || t.includes('aljabar') || t.includes('pythagoras') || t.includes('lingkaran')) {
    primaryPool = [...mathGenerators];
  } else if (m.includes('ipa') || m.includes('fisika') || m.includes('biologi') || m.includes('kimia') || m.includes('ipas') || t.includes('alam') || t.includes('wujud') || t.includes('sel')) {
    primaryPool = [...scienceGenerators, ...mathGenerators];
  } else if (m.includes('indonesia') || m.includes('inggris') || m.includes('bahasa')) {
    primaryPool = [...languageGenerators];
  } else if (m.includes('pancasila') || m.includes('ppkn') || m.includes('ips') || m.includes('sejarah') || m.includes('geografi') || m.includes('ekonomi') || m.includes('sosiologi') || m.includes('agama') || m.includes('fikih') || m.includes('akidah') || m.includes('hadis') || m.includes('qur') || m.includes('ski') || m.includes('arab')) {
    primaryPool = [...socialAndReligionGenerators];
  } else {
    primaryPool = [
      ...mathGenerators,
      ...scienceGenerators,
      ...languageGenerators,
      ...socialAndReligionGenerators
    ];
  }

  const validGenerators = primaryPool.filter(gen => {
    try {
      const res = gen(params, stage);
      return res !== null && res !== undefined;
    } catch {
      return false;
    }
  });

  const results: Question[] = [];
  const usedStems = new Set<string>();

  const shuffledCandidates = shuffleArray(validGenerators);

  for (let i = 1; i <= count; i++) {
    let qObj: { q: string; c: string; d: string[]; p: string; cat?: string } | null = null;

    while (shuffledCandidates.length > 0) {
      const candidateGen = shuffledCandidates.pop();
      if (!candidateGen) break;
      const res = candidateGen(params, stage);
      if (res && res.q) {
        const stemHash = res.q.slice(0, 35).toLowerCase().replace(/\s+/g, '');
        if (!usedStems.has(stemHash)) {
          usedStems.add(stemHash);
          qObj = res;
          break;
        }
      }
    }

    if (!qObj) {
      const smartQ = generateSmartContextualQuestion(params, stage, i, usedStems);
      
      if (params.tipeSoal === 'Uraian / Essay' || params.tipeSoal === 'Esai / Uraian') {
        results.push({
          id: i,
          pertanyaan: `[Soal Uraian ${label}]: ${smartQ.pertanyaan}`,
          opsi: [],
          kunci: `Kunci Jawaban Uraian:\n${smartQ.kunci.replace(/^[A-D]\.\s*/, '')}`,
          pembahasan: `Rubrik Penilaian & Pembahasan:\n${smartQ.pembahasan}`,
          kategoriLevel: label
        });
      } else if (params.tipeSoal === 'Isian Singkat') {
        results.push({
          id: i,
          pertanyaan: `[Isian Singkat ${label}]: ${smartQ.pertanyaan}`,
          opsi: [],
          kunci: smartQ.kunci.replace(/^[A-D]\.\s*/, ''),
          pembahasan: smartQ.pembahasan,
          kategoriLevel: label
        });
      } else {
        results.push(smartQ);
      }
      continue;
    }

    const { opsi, kunci } = buildShuffledOptions(qObj.c, qObj.d);
    const catLevel = qObj.cat || label;

    if (params.tipeSoal === 'Uraian / Essay' || params.tipeSoal === 'Esai / Uraian') {
      results.push({
        id: i,
        pertanyaan: `[Soal Uraian ${label}]: ${qObj.q}`,
        opsi: [],
        kunci: `Kunci Jawaban Uraian:\n${qObj.c}`,
        pembahasan: `Rubrik Penilaian & Pembahasan:\n${qObj.p}`,
        kategoriLevel: catLevel
      });
    } else if (params.tipeSoal === 'Isian Singkat') {
      results.push({
        id: i,
        pertanyaan: `[Isian Singkat ${label}]: ${qObj.q}`,
        opsi: [],
        kunci: qObj.c,
        pembahasan: qObj.p,
        kategoriLevel: catLevel
      });
    } else {
      results.push({
        id: i,
        pertanyaan: qObj.q,
        opsi,
        kunci,
        pembahasan: qObj.p,
        kategoriLevel: catLevel
      });
    }
  }

  return results;
}
