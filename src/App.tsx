import React, { useState, useEffect } from 'react';
import { generateCurriculumQuiz } from './lib/quizGeneratorEngine.ts';

// Types
interface Question {
  id: number;
  pertanyaan: string;
  opsi: string[];
  kunci: string;
  pembahasan: string;
  kategoriLevel?: string;
}

interface GeneratedQuiz {
  id: string;
  timestamp: string;
  jenjang: string;
  kelas: string;
  mapel: string;
  topik: string;
  tipeSoal: string;
  jumlahSoal: number;
  levelKesulitan: string;
  distribusi: string;
  soal: Question[];
}

// Master Data Kurikulum Indonesia
const dataMaster: Record<string, { kelas: string[]; mapel: string[]; topik: Record<string, string[]> }> = {
  "SD / MI": {
    kelas: ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"],
    mapel: [
      "Matematika",
      "Bahasa Indonesia",
      "IPAS (Science & Social)",
      "Pendidikan Pancasila",
      "Pendidikan Agama Islam & Budi Pekerti",
      "Al-Qur'an Hadis (MI)",
      "Akidah Akhlak (MI)",
      "Fikih (MI)",
      "Sejarah Kebudayaan Islam / SKI (MI)",
      "Bahasa Arab",
      "Bahasa Inggris"
    ],
    topik: {
      "Matematika": [
        "Penjumlahan & Pengurangan Bilangan 1-20 (Kelas 1-2)",
        "Perkalian & Pembagian Dasar (Kelas 2-3)",
        "Pecahan Sederhana & Sudut (Kelas 3-4)",
        "FPB dan KPK (Kelas 4)",
        "Bangun Datar: Keliling & Luas (Kelas 4-5)",
        "Operasi Hitung Pecahan & Kecepatan (Kelas 5)",
        "Geometri Lingkaran & Volume Ruang (Kelas 5-6)",
        "Pengumpulan & Rata-rata Data (Kelas 5-6)"
      ],
      "Bahasa Indonesia": [
        "Membaca Kata & Huruf Kapital (Kelas 1-2)",
        "Tanda Baca & Suku Kata (Kelas 1-2)",
        "Kosa Kata Baru & Sinonim/Antonim (Kelas 2-4)",
        "Menemukan Ide Pokok Paragraf (Kelas 4-6)",
        "Kata Baku & Kalimat Efektif (Kelas 5-6)",
        "Teks Eksplanasi & Puisi Anak (Kelas 5-6)"
      ],
      "IPAS (Science & Social)": [
        "Mengenal Tubuh & Benda Hidup (Kelas 1-2)",
        "Wujud Benda dan Perubahannya (Kelas 3-4)",
        "Bagian Tumbuhan & Daur Hidup Hewan (Kelas 3-4)",
        "Rantai Makanan & Ekosistem (Kelas 5)",
        "Sistem Pernapasan & Tata Surya (Kelas 5-6)",
        "Magnet & Sifat-Sifat Cahaya (Kelas 5-6)",
        "Peta, Skala & Pahlawan Kemerdekaan (Kelas 5-6)"
      ],
      "Pendidikan Pancasila": [
        "Simbol dan Sila Pancasila (Kelas 1-2)",
        "Aturan Hidup Tertib di Rumah & Sekolah (Kelas 1-2)",
        "Keragaman Budaya & Suku Bangsa (Kelas 3-4)",
        "Hak dan Kewajiban Anak (Kelas 4-5)",
        "Norma Masyarakat & Sejarah Pancasila (Kelas 5-6)"
      ],
      "Pendidikan Agama Islam & Budi Pekerti": [
        "Rukun Islam & Rukun Iman (Kelas 1-2)",
        "Perilaku Jujur & Adab Sehari-hari (Kelas 1-2)",
        "Tata Cara Wudhu & Shalat Fardhu (Kelas 2-3)",
        "Mengenal Asmaul Husna Pilihan (Kelas 3-4)",
        "Ketentuan Zakat Fitrah & Sedekah (Kelas 5-6)",
        "Kisah Teladan Nabi & Rasul (Kelas 1-6)"
      ],
      "Al-Qur'an Hadis (MI)": [
        "Hafalan Surat Pendek Pilihan (Ad-Duha s.d. An-Nas)",
        "Mengenal Huruf Hijaiyah Bersambung (Kelas 1-2)",
        "Hukum Bacaan Qalqalah & Mad Tabi'i (Kelas 4-5)",
        "Hadis tentang Kebersihan & Menyayangi Yatim"
      ],
      "Akidah Akhlak (MI)": [
        "Mengenal Allah melalui Asmaul Husna (Ar-Rahman, Ar-Rahim, Al-Malik)",
        "Mengenal Malaikat dan Tugasnya (Kelas 1-3)",
        "Akhlak Terpuji kepada Orang Tua & Guru (Kelas 1-4)",
        "Menghindari Sifat Tercela (Boikot, Bohong, Sombong)"
      ],
      "Fikih (MI)": [
        "Ketentuan Thaharah (Wudhu, Tayamum, & Mandi Wajib)",
        "Tata Cara Shalat Fardhu & Dzikir Sesudahnya",
        "Puasa Wajib Ramadhan & Shalat Tarawih (Kelas 3-5)",
        "Ketentuan Zakat Fitrah & Sedekah (Kelas 5-6)"
      ],
      "Sejarah Kebudayaan Islam / SKI (MI)": [
        "Kondisi Masyarakat Arab Sebelum Islam",
        "Kisah Kelahiran & Masa Kecil Nabi Muhammad SAW",
        "Peristiwa Isra' Mi'raj Nabi Muhammad SAW",
        "Hijrah Nabi Muhammad SAW ke Madinah"
      ],
      "Bahasa Arab": [
        "Mufrodat (Kosakata) Anggota Tubuh & Kelas (Kelas 1-3)",
        "Perkenalan (Ta'aruf) & Kata ganti (Dhamir) (Kelas 3-5)",
        "Nama-nama Hari, Bulan, dan Jam dalam Bahasa Arab"
      ],
      "Bahasa Inggris": [
        "Alphabet & Numbers 1-20 (Kelas 1-2)",
        "Family Members & Greetings (Kelas 1-3)",
        "Things in the Classroom & Colors (Kelas 2-4)",
        "Animals, Fruits & Simple Activities (Kelas 3-6)"
      ]
    }
  },
  "SMP / MTs": {
    kelas: ["Kelas 7", "Kelas 8", "Kelas 9"],
    mapel: [
      "Matematika",
      "IPA (Fisika, Biologi, Kimia)",
      "IPS (Sejarah, Geografi, Ekonomi)",
      "Bahasa Indonesia",
      "Pendidikan Agama Islam & Budi Pekerti",
      "Al-Qur'an Hadis (MTs)",
      "Akidah Akhlak (MTs)",
      "Fikih (MTs)",
      "Sejarah Kebudayaan Islam / SKI (MTs)",
      "Bahasa Arab",
      "Bahasa Inggris",
      "Informatika"
    ],
    topik: {
      "Matematika": [
        "Bilangan Bulat & Pecahan (Kelas 7)",
        "Bentuk Aljabar & PLSV (Kelas 7)",
        "Teorema Pythagoras (Kelas 8)",
        "Sistem Persamaan Linear Dua Variabel / SPLDV (Kelas 8)",
        "Persamaan Garis Lurus (Kelas 8)",
        "Aritmatika Sosial: Untung, Rugi, Diskon (Kelas 8)",
        "Perpangkatan & Bentuk Akar (Kelas 9)",
        "Persamaan Kuadrat & Transformasi Geometri (Kelas 9)",
        "Bangun Ruang Sisi Lengkung (Kelas 9)"
      ],
      "IPA (Fisika, Biologi, Kimia)": [
        "Sel dan Mikroskop (Kelas 7)",
        "Suhu, Kalor, dan Wujud Zat (Kelas 7)",
        "Gaya, Usaha, dan Hukum Newton (Kelas 8)",
        "Tekanan Zat Cair & Hukum Archimedes (Kelas 8)",
        "Sistem Pencernaan & Pernapasan Manusia (Kelas 8)",
        "Listrik Statis & Dinamis (Hukum Ohm) (Kelas 9)",
        "Kemagnetan & Induksi Elektromagnetik (Kelas 9)",
        "Pewarisan Sifat / Genetika Mendel (Kelas 9)"
      ],
      "IPS (Sejarah, Geografi, Ekonomi)": [
        "Interaksi Sosial dan Lembaga Sosial",
        "Kondisi Geografis Indonesia",
        "Kegiatan Ekonomi (Produksi, Distribusi, Konsumsi)",
        "Masa Kerajaan Hindu-Buddha & Islam"
      ],
      "Bahasa Indonesia": [
        "Teks Laporan Hasil Observasi",
        "Teks Eksposisi & Edukasi",
        "Teks Puisi & Teks Drama",
        "Teks Tanggapan & Kritis"
      ],
      "Pendidikan Agama Islam & Budi Pekerti": [
        "Iman kepada Hari Kiamat & Qadha Qadar",
        "Hukum Bacaan Tajwid (Idgham, Iqlab, Ikhfa)",
        "Menghindari Perilaku Tercela (Ghibah, Fitnah, Ananiah)",
        "Zakat, Infaq, dan Sedekah",
        "Sejarah Masuknya Islam di Nusantara"
      ],
      "Al-Qur'an Hadis (MTs)": [
        "Hukum Bacaan Nun Sukun/Tanwin & Mim Sukun",
        "Analisis Kandungan Surah Pilihan tentang Toleransi & Infak",
        "Hadis tentang Menuntut Ilmu & Mencintai Anak Yatim",
        "Ilmu Tajwid Tingkat Lanjut (Mad Far'i)"
      ],
      "Akidah Akhlak (MTs)": [
        "Iman kepada Kitab-Kitab Allah & Rasul Ulul Azmi",
        "Sifat Wajib, Jaiz, dan Mustahil bagi Allah",
        "Akhlak Sosial (Tawadhu, Tasamuh, & Ta'awun)",
        "Menghindari Sifat Iri, Dengki, & Ghidhab (Pemarah)"
      ],
      "Fikih (MTs)": [
        "Ketentuan Shalat Berjamaah, Jumat, & Jamak Qashar",
        "Ketentuan Jenazah (Memandikan, Mengkafani, & Menshalatkan)",
        "Macam-macam Sujud (Sujud Sahwi, Tilawah, & Syukur)",
        "Ketentuan Hewan Sembelihan, Qurban, & Aqiqah",
        "Ketentuan Makanan & Minuman yang Halal serta Haram"
      ],
      "Sejarah Kebudayaan Islam / SKI (MTs)": [
        "Perjuangan Dakwah Nabi Muhammad SAW di Makkah & Madinah",
        "Pemerintahan Khulafaur Rasyidin",
        "Perkembangan Islam Masa Bani Umayyah & Abbasiyah",
        "Sejarah Masuk & Berkembangnya Islam di Nusantara"
      ],
      "Bahasa Arab": [
        "At-Ta'aruf & Al-Madrasah (Percakapan Sehari-hari)",
        "Fi'il Madhi, Mudhari', & Amar (Tata Bahasa Dasar)",
        "Qawaid & Tarkib (Kalimat Isim Isyarah & Na'at Man'ut)"
      ],
      "Bahasa Inggris": [
        "Descriptive Text",
        "Recount Text",
        "Narrative Text",
        "Simple Present & Past Tense"
      ],
      "Informatika": [
        "Berpikir Komputasional",
        "Teknologi Informasi dan Komunikasi (TIK)",
        "Algoritma dan Pemrograman Dasar",
        "Analisis Data Sederhana"
      ]
    }
  },
  "SMA / MA": {
    kelas: ["Kelas 10", "Kelas 11", "Kelas 12"],
    mapel: [
      "Matematika Wajib",
      "Matematika Tingkat Lanjut",
      "Fisika",
      "Kimia",
      "Biologi",
      "Ekonomi",
      "Sejarah",
      "Sosiologi",
      "Pendidikan Agama Islam & Budi Pekerti",
      "Al-Qur'an Hadis (MA)",
      "Akidah Akhlak (MA)",
      "Fikih - Ushul Fikih (MA)",
      "Sejarah Kebudayaan Islam / SKI (MA)",
      "Bahasa Arab Tingkat Lanjut",
      "Bahasa Indonesia",
      "Bahasa Inggris"
    ],
    topik: {
      "Matematika Wajib": [
        "Persamaan & Pertidaksamaan Nilai Mutlak (Kelas 10)",
        "Sistem Persamaan Linear Tiga Variabel / SPLTV (Kelas 10)",
        "Trigonometri Dasar Sudut Istimewa (Kelas 10)",
        "Fungsi Komposisi dan Invers (Kelas 10-11)",
        "Matriks dan Operasinya (Kelas 11)",
        "Barisan dan Deret Aritmatika serta Geometri (Kelas 11)",
        "Limit & Turunan Pertama Fungsi (Kelas 11-12)",
        "Integral Tentu & Tak Tentu (Kelas 12)",
        "Kaidah Pencacahan & Peluang (Kelas 12)"
      ],
      "Fisika": [
        "Kinematika Gerak Lurus & Parabola (Kelas 10)",
        "Hukum-Hukum Newton tentang Gerak (Kelas 10)",
        "Fluida Statis & Dinamis (Kelas 11)",
        "Termodinamika & Teori Kinetik Gas (Kelas 11)",
        "Gelombang Bunyi & Efek Doppler (Kelas 11)",
        "Rangkaian Arus Listrik AC & DC (Kelas 12)",
        "Fisika Kuantum & Efek Fotolistrik (Kelas 12)"
      ],
      "Kimia": [
        "Struktur Atom & Tabel Periodik (Kelas 10)",
        "Ikatan Kimia & Bentuk Molekul (Kelas 10)",
        "Stoikiometri & Konsep Mol (Kelas 10)",
        "Termokimia & Laju Reaksi (Kelas 11)",
        "Asam Basa, Titrasi & pH (Kelas 11)",
        "Sifat Koligatif Larutan & Elektrokimia (Kelas 12)",
        "Kimia Unsur & Senyawa Karbon/Benzena (Kelas 12)"
      ],
      "Biologi": [
        "Keanekaragaman Hayati & Virus (Kelas 10)",
        "Struktur dan Fungsi Sel/Jaringan (Kelas 11)",
        "Sistem Organ Manusia Lanjut (Kelas 11)",
        "Metabolisme (Enzim, Katabolisme, Anabolisme) (Kelas 12)",
        "Genetika Molekuler, DNA & Sintesis Protein (Kelas 12)",
        "Pembelahan Sel (Mitosis/Meiosis) & Bioteknologi (Kelas 12)"
      ],
      "Ekonomi": [
        "Kelangkaan & Skala Prioritas",
        "Terbentuknya Keseimbangan Pasar",
        "Akuntansi Dasar & Jurnal Umum",
        "Kebijakan Moneter & Fiskal"
      ],
      "Pendidikan Agama Islam & Budi Pekerti": [
        "Sumber Hukum Islam (Al-Qur'an, Hadis, Ijtihad)",
        "Etika Pergaulan & Komitmen terhadap Janji",
        "Pernikahan dalam Islam & Hak Kewajiban Keluarga",
        "Peradaban Islam pada Masa Kejayaan & Modern",
        "Muamalah (Jual Beli, Riba, & Perbankan Syariah)"
      ],
      "Al-Qur'an Hadis (MA)": [
        "Ayat-ayat tentang Kewajiban Menuntut Ilmu & Etos Kerja",
        "Konsep Demokrasi & Musyawarah dalam Al-Qur'an",
        "Ilmu Tafsir & Metodologi Penafsiran Ayat",
        "Hadis tentang Ekonomi Islam & Tanggung Jawab Sosial"
      ],
      "Akidah Akhlak (MA)": [
        "Pemikiran Kalam dalam Islam (Khawarij, Murjiah, Mu'tazilah, Asy'ariyah)",
        "Tasawuf & Tarekat dalam Perkembangan Islam",
        "Menghindari Perilaku Radikalisme & Aliran Sesat",
        "Akhlak Berorganisasi & Kepemimpinan Islami"
      ],
      "Fikih - Ushul Fikih (MA)": [
        "Qawaid Fiqhiyyah (Kaidah-Kaidah Fikih Dasar)",
        "Muamalah Kontemporer (Asuransi Syariah, E-Commerce, Pasar Modal)",
        "Jinayah (Hukum Pidana Islam: Qisas, Hudud, Ta'zir)",
        "Ilmu Ushul Fikih (Ijma', Qiyas, Istihsan, Maslahah Mursalah)"
      ],
      "Sejarah Kebudayaan Islam / SKI (MA)": [
        "Peradaban Islam Masa Dinasti Abbasiyah & Fatimiyah",
        "Perkembangan Islam di Spanyol (Andalusia) & Pengaruhnya pada Dunia",
        "Tokoh-tokoh Ilmuwan Muslim Klasik (Ibnu Sina, Al-Khwarizmi, Al-Biruni)",
        "Gerakan Pembaruan Dunia Islam (Muhammad Abduh, Jamaluddin al-Afghani)"
      ],
      "Bahasa Arab Tingkat Lanjut": [
        "I'rab (Rafab, Nashab, Khafadh, Jazm) & Nahwu Sharaf",
        "Insya' (Menulis Karangan Arab) & Balaghah (Bayan, Ma'ani, Badi')",
        "Qira'ah & Terjemah Kitab Kuning / Teks Klasik"
      ]
    }
  },
  "SMK": {
    kelas: ["Kelas 10", "Kelas 11", "Kelas 12"],
    mapel: ["Matematika Terapan", "Pendidikan Agama & Budi Pekerti", "Bahasa Inggris Produk Industri", "Kewirausahaan (PKK)", "Informatika & Jaringan", "Dasar Kejuruan / Kompetensi"],
    topik: {
      "Matematika Terapan": [
        "Vektor & Trigonometri Teknik",
        "Statistik & Pengolahan Data",
        "Program Linear Industri",
        "Kalkulus Dasar & Turunan"
      ],
      "Pendidikan Agama & Budi Pekerti": [
        "Etos Kerja & Profesionalisme dalam Islam",
        "Toleransi & Moderasi Beragama dalam Masyarakat",
        "Penerapan Prinsip Syariah di Lingkungan Kerja",
        "Integritas, Kejujuran, & Amanah di Dunia Industri"
      ],
      "Kewirausahaan (PKK)": [
        "Peluang Usaha & Analisis SWOT",
        "Hak Atas Kekayaan Intelektual (HAKI)",
        "Desain / Prototype Produk",
        "Laporan Keuangan Sederhana"
      ],
      "Informatika & Jaringan": [
        "Jaringan Komputer Dasar & IP Addressing",
        "Keamanan Siber & Firewall",
        "Pemrograman Web & Basis Data",
        "Troubleshooting Hardware & Software"
      ]
    }
  }
};

export default function App() {
  // Navigation Tabs: 'generator' | 'history' | 'quiz'
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'quiz'>('generator');

  // Form State
  const [jenjang, setJenjang] = useState<string>("SMP / MTs");
  const [kelas, setKelas] = useState<string>("Kelas 8");
  const [mapel, setMapel] = useState<string>("Matematika");
  const [topikSelect, setTopikSelect] = useState<string>("Teorema Pythagoras");
  const [topikManual, setTopikManual] = useState<string>("");
  const [tipeSoal, setTipeSoal] = useState<string>("Pilihan Ganda");
  const [jumlahSoal, setJumlahSoal] = useState<number | string>(5);
  const [levelKesulitan, setLevelKesulitan] = useState<string>("Level 2: Sedang (Aplikasi)");
  const [distribusi, setDistribusi] = useState<string>("Proporsional (Normal)");

  // Dynamic options
  const currentJenjangData = dataMaster[jenjang] || dataMaster["SMP / MTs"];
  const currentMapelList = currentJenjangData.mapel;
  const currentTopikList = currentJenjangData.topik[mapel] || ["Konsep Dasar dan Teori Utama", "Penerapan Praktis"];

  // Update default mapel & kelas when jenjang changes
  const handleJenjangChange = (newJenjang: string) => {
    setJenjang(newJenjang);
    const jData = dataMaster[newJenjang];
    setKelas(jData.kelas[0] || "");
    const firstMapel = jData.mapel[0] || "";
    setMapel(firstMapel);
    const tList = jData.topik[firstMapel] || ["Konsep Dasar"];
    setTopikSelect(tList[0]);
  };

  const handleMapelChange = (newMapel: string) => {
    setMapel(newMapel);
    const tList = currentJenjangData.topik[newMapel] || ["Konsep Dasar"];
    setTopikSelect(tList[0]);
  };

  // Generation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentQuiz, setCurrentQuiz] = useState<GeneratedQuiz | null>(null);
  const [isAnswersVisible, setIsAnswersVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved History State
  const [savedQuizzes, setSavedQuizzes] = useState<GeneratedQuiz[]>([]);

  // Interactive Quiz Mode State
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // API Key Modal State
  const DEFAULT_USER_API_KEY = '';
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');

  // Load saved quizzes & saved API key from localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_key');
      const stored = localStorage.getItem('pembuat_soal_history');
      if (stored) {
        setSavedQuizzes(JSON.parse(stored));
      }
      const savedKey = localStorage.getItem('user_gemini_api_key') || '';
      if (savedKey) {
        setUserApiKey(savedKey);
        setApiKeyStatus('valid');
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Test & Save API Key
  const handleTestApiKey = async () => {
    if (!userApiKey.trim()) {
      showToast("Silakan masukkan API Key Gemini terlebih dahulu.");
      return;
    }
    setIsTestingKey(true);
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: userApiKey.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApiKeyStatus('valid');
        localStorage.setItem('user_gemini_api_key', userApiKey.trim());
        showToast("✅ API Key Gemini terhubung & tersimpan!");
        setIsApiKeyModalOpen(false);
      } else {
        setApiKeyStatus('invalid');
        showToast(`❌ ${data.message || 'Gagal menghubungkan API Key'}`);
      }
    } catch (err: any) {
      setApiKeyStatus('invalid');
      showToast("❌ Gagal terhubung ke server verifikasi API Key.");
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleResetApiKey = () => {
    setUserApiKey('');
    setApiKeyStatus('idle');
    localStorage.removeItem('user_gemini_api_key');
    showToast("Beralih ke Engine Kurikulum Otomatis.");
    setIsApiKeyModalOpen(false);
  };

  // High-Quality Patent Curriculum Generator
  const generateMockData = (m: string, t: string, j: string, k: string, type: string, count: number): Question[] => {
    return generateCurriculumQuiz({
      jenjang: j,
      kelas: k,
      mapel: m,
      topik: t,
      tipeSoal: type,
      jumlahSoal: count,
      levelKesulitan: levelKesulitan,
      distribusi: distribusi
    });
  };

  // Generate Questions handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTopik = topikSelect === "LAINNYA" ? (topikManual || "Topik Umum") : topikSelect;
    const finalJumlah = Math.min(20, Math.max(1, parseInt(String(jumlahSoal)) || 5));

    setIsLoading(true);
    let generatedSoal: Question[] = [];

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenjang,
          kelas,
          mapel,
          topik: finalTopik,
          tipeSoal,
          jumlahSoal: finalJumlah,
          levelKesulitan,
          distribusi,
          userApiKey: userApiKey.trim() || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.soal && Array.isArray(data.soal)) {
          generatedSoal = data.soal;
        }
      }
    } catch (err) {
      console.error("API call failed, using mock generator:", err);
    }

    if (generatedSoal.length === 0) {
      generatedSoal = generateMockData(mapel, finalTopik, jenjang, kelas, tipeSoal, finalJumlah);
    }

    const newQuiz: GeneratedQuiz = {
      id: 'quiz_' + Date.now(),
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      jenjang,
      kelas,
      mapel,
      topik: finalTopik,
      tipeSoal,
      jumlahSoal: finalJumlah,
      levelKesulitan,
      distribusi,
      soal: generatedSoal
    };

    setCurrentQuiz(newQuiz);
    setIsLoading(false);
    setIsAnswersVisible(false);
    setUserAnswers({});
    setQuizSubmitted(false);

    // Save to history automatically
    const updatedHistory = [newQuiz, ...savedQuizzes.slice(0, 19)];
    setSavedQuizzes(updatedHistory);
    try {
      localStorage.setItem('pembuat_soal_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Storage error", e);
    }

    showToast("Soal berhasil dibuat & disimpan!");
  };

  // Copy text handler
  const copyText = () => {
    if (!currentQuiz) return;
    let text = `SOAL ULANGAN ${currentQuiz.mapel.toUpperCase()}\n`;
    text += `Jenjang: ${currentQuiz.jenjang} (${currentQuiz.kelas})\n`;
    text += `Materi: ${currentQuiz.topik}\n`;
    text += `Tipe: ${currentQuiz.tipeSoal} | Kesulitan: ${currentQuiz.levelKesulitan}\n`;
    text += `==================================================\n\n`;

    currentQuiz.soal.forEach((item, idx) => {
      text += `${idx + 1}. ${item.pertanyaan}\n`;
      if (item.opsi && item.opsi.length > 0) {
        item.opsi.forEach(opt => text += `   ${opt}\n`);
      }
      text += `\n`;
    });

    if (isAnswersVisible) {
      text += `\n==================================================\n`;
      text += `KUNCI JAWABAN & PEMBAHASAN\n`;
      text += `==================================================\n\n`;
      currentQuiz.soal.forEach((item, idx) => {
        text += `${idx + 1}. Kunci: ${item.kunci}\n`;
        text += `   Pembahasan: ${item.pembahasan}\n\n`;
      });
    }

    navigator.clipboard.writeText(text);
    showToast("Teks soal berhasil disalin ke clipboard!");
  };

  // Delete saved quiz
  const deleteSavedQuiz = (id: string) => {
    const updated = savedQuizzes.filter(q => q.id !== id);
    setSavedQuizzes(updated);
    localStorage.setItem('pembuat_soal_history', JSON.stringify(updated));
    showToast("Riwayat soal dihapus");
  };

  // Interactive Quiz evaluation
  const handleAnswerSelect = (qid: number, opt: string) => {
    setUserAnswers(prev => ({ ...prev, [qid]: opt }));
  };

  const submitQuiz = () => {
    if (!currentQuiz) return;
    let correct = 0;
    currentQuiz.soal.forEach(q => {
      if (userAnswers[q.id] === q.kunci) {
        correct++;
      }
    });
    const score = Math.round((correct / currentQuiz.soal.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    showToast(`Ujian selesai! Skor Anda: ${score}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Inter',sans-serif]">
      
      {/* Top Navbar */}
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl shadow-inner">
              📝
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl tracking-tight">Pembuat Soal Otomatis</h1>
              <p className="text-xs text-indigo-100">Generator Ujian & Kunci Jawaban Instan Berbasis Kurikulum AI</p>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Gunakan API Key Pill Button */}
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-indigo-400/50 bg-indigo-700/60 hover:bg-indigo-700/90 text-xs sm:text-sm font-medium text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <i className="fa-solid fa-key text-indigo-200"></i>
              <span>Gunakan API Key</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  userApiKey.trim() ? 'bg-emerald-400 ring-2 ring-emerald-300/40 animate-pulse' : 'bg-amber-400 ring-2 ring-amber-300/40'
                }`}
                title={userApiKey.trim() ? "API Key Kustom Aktif" : "Menggunakan Engine Kurikulum Otomatis"}
              ></span>
            </button>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 bg-indigo-700/60 p-1 rounded-xl border border-indigo-500/50">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'generator' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>Generator</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>Riwayat ({savedQuizzes.length})</span>
              </button>
              {currentQuiz && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'quiz' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-play"></i>
                  <span>Mode Ujian</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* TAB 1: GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-8">
            
            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 no-print transition-all">
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 py-6 px-6 text-center text-white relative">
                <h2 className="text-xl sm:text-2xl font-bold">Buat Lembar Soal Baru</h2>
                <p className="text-indigo-100 text-xs sm:text-sm mt-1">Pilih parameter kurikulum dan tingkat kesulitan sesuai kebutuhan</p>
              </div>

              <form onSubmit={handleGenerate} className="p-6 sm:p-8 space-y-6">
                
                {/* Row 1: Jenjang, Kelas, Mapel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jenjang Pendidikan *</label>
                    <select
                      value={jenjang}
                      onChange={(e) => handleJenjangChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      {Object.keys(dataMaster).map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kelas *</label>
                    <select
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      {currentJenjangData.kelas.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mata Pelajaran *</label>
                    <select
                      value={mapel}
                      onChange={(e) => handleMapelChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      {currentMapelList.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Topik Spesifik */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Topik / Materi Spesifik *</label>
                  <select
                    value={topikSelect}
                    onChange={(e) => setTopikSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    {currentTopikList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="LAINNYA">✏️ Lainnya / Input Manual...</option>
                  </select>

                  {topikSelect === "LAINNYA" && (
                    <input
                      type="text"
                      placeholder="Tuliskan topik / materi spesifik secara manual..."
                      value={topikManual}
                      onChange={(e) => setTopikManual(e.target.value)}
                      required
                      className="mt-2.5 w-full px-3.5 py-2.5 bg-white border border-indigo-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  )}
                </div>

                {/* Row 3: Tipe Soal & Jumlah Soal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipe Soal</label>
                    <select
                      value={tipeSoal}
                      onChange={(e) => setTipeSoal(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="Pilihan Ganda">Pilihan Ganda</option>
                      <option value="Isian Singkat">Isian Singkat</option>
                      <option value="Uraian / Essay">Uraian / Essay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jumlah Soal (1 - 20)</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={jumlahSoal}
                      onChange={(e) => setJumlahSoal(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Parameter Kesulitan */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <span className="block text-xs font-bold text-gray-500 tracking-wider uppercase">PARAMETER KESULITAN & DISTRIBUSI</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={levelKesulitan}
                      onChange={(e) => setLevelKesulitan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 outline-none cursor-pointer"
                    >
                      <option value="Level 1: Mudah (Mengingat/C1-C2)">Level 1: Mudah (Mengingat)</option>
                      <option value="Level 2: Sedang (Aplikasi/C3)">Level 2: Sedang (Aplikasi)</option>
                      <option value="Level 3: Sukar (HOTS/C4-C6)">Level 3: Sukar (HOTS)</option>
                    </select>

                    <select
                      value={distribusi}
                      onChange={(e) => setDistribusi(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 outline-none cursor-pointer"
                    >
                      <option value="Proporsional (Normal)">Proporsional (Normal)</option>
                      <option value="Fokus HOTS">Fokus HOTS</option>
                      <option value="Seimbang">Seimbang</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Menyusun Soal dengan AI...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">🚀</span>
                      <span>Buat Soal Sekarang</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Loading Indicator when generating */}
            {isLoading && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center space-y-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                <div className="space-y-1">
                  <p className="text-indigo-900 font-semibold text-lg">Sedang Menyusun Soal...</p>
                  <p className="text-gray-500 text-xs">AI sedang merumuskan pertanyaan, pilihan opsi, dan pembahasan rinci.</p>
                </div>
              </div>
            )}

            {/* Output Quiz Display */}
            {currentQuiz && !isLoading && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all">
                
                {/* Control Header */}
                <div className="bg-slate-800 text-white p-4 sm:p-5 flex flex-wrap justify-between items-center gap-3 no-print">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-md font-semibold">Siap Ujian</span>
                    <h3 className="text-sm sm:text-base font-medium text-slate-200">Hasil Generasi: {currentQuiz.mapel}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsAnswersVisible(!isAnswersVisible)}
                      className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className={`fa-solid ${isAnswersVisible ? 'fa-eye-slash' : 'fa-eye'} text-indigo-400`}></i>
                      <span>{isAnswersVisible ? "Sembunyikan Kunci" : "Tampilkan Kunci"}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-play"></i>
                      <span>Uji Interaktif</span>
                    </button>

                    <button
                      onClick={copyText}
                      className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-regular fa-copy text-teal-400"></i>
                      <span>Salin Teks</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white px-3.5 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <i className="fa-solid fa-print"></i>
                      <span>Cetak / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Printable Exam Document */}
                <div id="printableArea" className="p-6 sm:p-10 space-y-6 bg-white">
                  
                  {/* Document KOP Header */}
                  <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
                    <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
                      SOAL ULANGAN HARIAN {currentQuiz.mapel.toUpperCase()}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      <span>{currentQuiz.jenjang}</span> &bull; <span>{currentQuiz.kelas}</span> | Topik: <span className="italic">{currentQuiz.topik}</span>
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2 px-2">
                      <span>Waktu: 45 Menit</span>
                      <span>Sifat Ujian: Tertutup</span>
                      <span>Tipe: <span>{currentQuiz.tipeSoal}</span></span>
                    </div>
                  </div>

                  {/* Student Identity Section */}
                  <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm pb-3 border-b border-dashed border-gray-300">
                    <div>
                      <p><span className="font-semibold">Nama Siswa :</span> ...........................................................</p>
                      <p className="mt-1"><span className="font-semibold">Nomor Absen:</span> ...........................................................</p>
                    </div>
                    <div className="text-right">
                      <p><span className="font-semibold">Hari/Tanggal :</span> ...........................................................</p>
                      <p className="mt-1"><span className="font-semibold">Nilai        :</span> ....................</p>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-6 pt-2">
                    {currentQuiz.soal.map((item, index) => (
                      <div key={item.id} className="space-y-2 text-slate-800 text-sm sm:text-base leading-relaxed">
                        <div className="flex items-start gap-2.5">
                          <span className="font-bold text-indigo-600 select-none">{index + 1}.</span>
                          <div className="flex-1 font-medium text-slate-900">
                            {item.pertanyaan}
                            {item.kategoriLevel && (
                              <span className="ml-2 inline-block text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full no-print">
                                <i className="fa-solid fa-graduation-cap mr-1 text-[10px]"></i>
                                {item.kategoriLevel}
                              </span>
                            )}
                          </div>
                        </div>

                        {item.opsi && item.opsi.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 pl-6">
                            {item.opsi.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-start gap-2">
                                <span className="text-xs sm:text-sm font-medium text-slate-700">{opt}</span>
                              </div>
                            ))}
                          </div>
                        ) : currentQuiz.tipeSoal === 'Isian Singkat' ? (
                          <div className="mt-3 pl-6 text-gray-400 italic text-xs sm:text-sm">
                            Jawaban: ............................................................................................
                          </div>
                        ) : (
                          <div className="mt-3 pl-6 border-l-2 border-slate-200 space-y-4 py-2">
                            <div className="h-4 border-b border-dashed border-slate-300 w-full"></div>
                            <div className="h-4 border-b border-dashed border-slate-300 w-full"></div>
                            <div className="h-4 border-b border-dashed border-slate-300 w-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Answer Key & Discussion Section */}
                  {isAnswersVisible && (
                    <div className="mt-10 pt-6 border-t-2 border-indigo-200 bg-indigo-50/40 p-4 sm:p-6 rounded-xl space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fa-solid fa-key text-indigo-600"></i>
                        <h3 className="font-bold text-base text-indigo-900">Kunci Jawaban & Pembahasan Detil</h3>
                      </div>
                      <div className="space-y-3 text-xs sm:text-sm text-slate-800">
                        {currentQuiz.soal.map((item, index) => (
                          <div key={item.id} className="bg-white p-3.5 rounded-lg border border-indigo-100 shadow-sm space-y-1.5">
                            <div className="font-semibold text-slate-900">Soal No. {index + 1}</div>
                            <div className="text-indigo-700 font-medium">
                              Kunci Jawaban: <span className="bg-indigo-100 px-2 py-0.5 rounded text-indigo-900">{item.kunci}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1">
                              <span className="font-semibold text-slate-700">Pembahasan:</span> {item.pembahasan}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Riwayat Soal Tersimpan</h2>
                  <p className="text-xs text-gray-500">Daftar lembar soal yang pernah Anda buat sebelumnya</p>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {savedQuizzes.length} Soal Tersimpan
                </span>
              </div>

              {savedQuizzes.length === 0 ? (
                <div className="text-center py-12 space-y-3 text-gray-400">
                  <i className="fa-solid fa-folder-open text-4xl"></i>
                  <p className="text-sm">Belum ada riwayat soal yang tersimpan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 hover:border-indigo-300 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 uppercase">{quiz.mapel}</span>
                          <h3 className="font-bold text-slate-900 text-base">{quiz.topik}</h3>
                        </div>
                        <button
                          onClick={() => deleteSavedQuiz(quiz.id)}
                          className="text-gray-400 hover:text-red-500 text-xs p-1"
                          title="Hapus"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <p><span className="font-semibold">Jenjang:</span> {quiz.jenjang} ({quiz.kelas})</p>
                        <p><span className="font-semibold">Tipe:</span> {quiz.tipeSoal} &bull; <span className="font-semibold">Jumlah:</span> {quiz.jumlahSoal} Soal</p>
                        <p><span className="font-semibold">Dibuat:</span> {quiz.timestamp}</p>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => {
                            setCurrentQuiz(quiz);
                            setActiveTab('generator');
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-lg font-medium transition-colors"
                        >
                          Buka Soal
                        </button>
                        <button
                          onClick={() => {
                            setCurrentQuiz(quiz);
                            setActiveTab('quiz');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors"
                        >
                          Ujian
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE QUIZ MODE */}
        {activeTab === 'quiz' && currentQuiz && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 space-y-8">
            <div className="border-b pb-4 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded font-semibold">Mode Ujian Interaktif</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{currentQuiz.mapel} - {currentQuiz.topik}</h2>
                <p className="text-xs text-gray-500">{currentQuiz.jenjang} &bull; {currentQuiz.kelas}</p>
              </div>

              {quizSubmitted && (
                <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-center">
                  <div className="text-xs text-indigo-600 font-semibold uppercase">Skor Akhir Anda</div>
                  <div className="text-2xl font-bold text-indigo-900">{quizScore} / 100</div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {currentQuiz.soal.map((q, idx) => {
                const isCorrect = userAnswers[q.id] === q.kunci;
                return (
                  <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600">{idx + 1}.</span>
                      <p className="font-medium text-slate-900 text-sm sm:text-base">{q.pertanyaan}</p>
                    </div>

                    {q.opsi && q.opsi.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                        {q.opsi.map((opt, oIdx) => {
                          const isSelected = userAnswers[q.id] === opt;
                          let btnStyle = "bg-white border-gray-200 text-slate-700 hover:border-indigo-300";
                          if (quizSubmitted) {
                            if (opt === q.kunci) {
                              btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 font-semibold";
                            } else if (isSelected && !isCorrect) {
                              btnStyle = "bg-red-100 border-red-400 text-red-900";
                            }
                          } else if (isSelected) {
                            btnStyle = "bg-indigo-600 border-indigo-600 text-white font-medium";
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleAnswerSelect(q.id, opt)}
                              className={`p-3 rounded-lg border text-left text-xs sm:text-sm transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="pl-6">
                        <input
                          type="text"
                          disabled={quizSubmitted}
                          placeholder="Tuliskan jawaban Anda di sini..."
                          value={userAnswers[q.id] || ""}
                          onChange={(e) => handleAnswerSelect(q.id, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    )}

                    {quizSubmitted && (
                      <div className="mt-3 pl-6 pt-3 border-t border-slate-200 text-xs sm:text-sm space-y-1">
                        <p className="font-semibold text-slate-800">
                          Kunci Jawaban: <span className="text-emerald-700">{q.kunci}</span>
                        </p>
                        <p className="text-gray-600"><span className="font-semibold">Pembahasan:</span> {q.pembahasan}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              {!quizSubmitted ? (
                <button
                  onClick={submitQuiz}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Selesaikan Ujian & Cek Hasil
                </button>
              ) : (
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setUserAnswers({});
                  }}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Ulangi Ujian
                </button>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 animate-bounce">
          <i className="fa-solid fa-circle-check text-emerald-400 text-base"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal Pengaturan API Key */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-100 relative">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
                  🔑
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pengaturan API Key Gemini</h3>
                  <p className="text-xs text-slate-500">Hubungkan AI Studio Gemini ke Aplikasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Status Card */}
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                userApiKey.trim()
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <span className="text-sm">
                {userApiKey.trim() ? '🟢' : '🟡'}
              </span>
              <div>
                <strong className="block font-semibold">
                  {userApiKey.trim() ? 'API Key Kustom Aktif' : 'Engine Kurikulum Otomatis Aktif'}
                </strong>
                <span className="opacity-90">
                  {userApiKey.trim()
                    ? 'Aplikasi terhubung langsung ke model Gemini 3.8 Flash'
                    : 'Soal dibuat menggunakan Engine Kurikulum Indonesia terstandar'}
                </span>
              </div>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Kode Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="Masukkan AIzaSy..."
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                >
                  <i className={`fa-solid ${showApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                API Key Anda disimpan secara aman di browser (localStorage) dan dikirim melalui proxy server lokal.
              </p>
            </div>

            {/* Helper Link */}
            <div className="pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1.5 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
              >
                <span>Dapatkan API Key gratis di Google AI Studio</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={isTestingKey || !userApiKey.trim()}
                className="w-full sm:flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTestingKey ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin"></i>
                    <span>Memverifikasi Key...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plug-circle-check"></i>
                    <span>Uji & Simpan Key</span>
                  </>
                )}
              </button>

              {userApiKey.trim() && (
                <button
                  type="button"
                  onClick={handleResetApiKey}
                  className="w-full sm:w-auto py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-all cursor-pointer"
                >
                  Reset Key
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(false)}
                className="w-full sm:w-auto py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium text-xs transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-500 border-t border-slate-200 no-print">
        <p>Pembuat Soal Otomatis &bull; Berbasis Kurikulum Nasional & AI &copy; 2026</p>
      </footer>

    </div>
  );
}
