/* ================= NAVIGASI HALAMAN ================= */
let dataPasien = [];
let dataMapping = [];

// Load semua data dari localStorage saat halaman dimuat
function loadAllData() {
  // Load data pasien
  const savedPasien = localStorage.getItem("dataPasien");
  if (savedPasien) {
    dataPasien = JSON.parse(savedPasien);
    nomorUrut = dataPasien.length + 1;
    renderTabelPasien();
  }

  // Load data mapping
  const savedMapping = localStorage.getItem("dataMapping");
  if (savedMapping) {
    dataMapping = JSON.parse(savedMapping);
    renderTabelMapping();
  }

  // Load data database
  loadDataFromStorage();

  // Update dashboard
  updateDashboard();
}

// Render tabel pasien dari localStorage
function renderTabelPasien() {
  const tabel = document.getElementById("tabelPasien");
  if (!tabel) return;

  tabel.innerHTML = "";

  dataPasien.forEach((pasien, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${pasien.noRM}</td>
      <td>${pasien.nama}</td>
      <td>${pasien.jk}</td>
      <td>${pasien.tgl}</td>
      <td>${pasien.alamat}</td>
      <td>${pasien.telp}</td>
      <td>${pasien.poli}</td>
      <td>${pasien.bayar}</td>
      <td>${pasien.daftar}</td>
      <td class="aksi">
        <button class="btn btn-lihat" onclick="lihatPasien(this)">Lihat</button>
        <button class="btn btn-edit" onclick="editPasien(this)">Edit</button>
        <button class="btn btn-hapus" onclick="hapusPasien(this)">Hapus</button>
      </td>
    `;
    tabel.appendChild(tr);
  });
}

// Render tabel mapping dari localStorage
function renderTabelMapping() {
  const tbody = document.querySelector("#mapping .table-resume tbody");
  if (!tbody) return;

  if (dataMapping.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Belum ada data</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  dataMapping.forEach((mapping, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${mapping.namaPasien}</td>
      <td>${mapping.jk}</td>
      <td>${mapping.usia}</td>
      <td>${mapping.diagnosisUtama || "-"}</td>
      <td>${mapping.tanggal}</td>
      <td class="aksi">
        <button class="btn btn-lihat" onclick="lihatMapping(${index})">Lihat</button>
        <button class="btn btn-edit" onclick="editMapping(${index})">Edit</button>
        <button class="btn btn-hapus" onclick="hapusMapping(${index})">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Update statistik dashboard
function updateDashboard() {
  const statCards = document.querySelectorAll("#dashboard .stat-card h1");
  if (statCards.length >= 5) {
    statCards[0].textContent = dataMapping.length;
    statCards[1].textContent = dataPasien.length;
    statCards[2].textContent = databaseData.diagnosis.count;
    statCards[3].textContent = databaseData.tindakan.count;
    statCards[4].textContent = databaseData.obat.count;
  }
}

function showPage(id, el) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));

  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add("active");

  document
    .querySelectorAll(".sidebar a")
    .forEach((a) => a.classList.remove("active"));
  if (el) el.classList.add("active");
}

/* ================= MODAL PASIEN BARU ================= */
function showPasienBaru() {
  document.getElementById("modalPasien").style.display = "flex";

  const prov = document.getElementById("modalProvinsi");
  prov.innerHTML = `<option value="">-- Pilih Provinsi --</option>`;

  Object.keys(wilayah).forEach((p) => {
    prov.innerHTML += `<option value="${p}">${p}</option>`;
  });

  document.getElementById(
    "modalKota"
  ).innerHTML = `<option value="">-- Pilih Kota --</option>`;
  document.getElementById(
    "modalKecamatan"
  ).innerHTML = `<option value="">-- Pilih Kecamatan --</option>`;
  document.getElementById(
    "modalKelurahan"
  ).innerHTML = `<option value="">-- Pilih Kelurahan --</option>`;
}

function loadKota() {
  const prov = document.getElementById("modalProvinsi").value;
  const kota = document.getElementById("modalKota");

  kota.innerHTML = `<option value="">-- Pilih Kota --</option>`;
  document.getElementById(
    "modalKecamatan"
  ).innerHTML = `<option value="">-- Pilih Kecamatan --</option>`;
  document.getElementById(
    "modalKelurahan"
  ).innerHTML = `<option value="">-- Pilih Kelurahan --</option>`;

  if (!prov) return;

  Object.keys(wilayah[prov]).forEach((k) => {
    kota.innerHTML += `<option value="${k}">${k}</option>`;
  });
}

function loadKecamatan() {
  const prov = document.getElementById("modalProvinsi").value;
  const kota = document.getElementById("modalKota").value;
  const kec = document.getElementById("modalKecamatan");

  kec.innerHTML = `<option value="">-- Pilih Kecamatan --</option>`;
  document.getElementById(
    "modalKelurahan"
  ).innerHTML = `<option value="">-- Pilih Kelurahan --</option>`;

  if (!prov || !kota) return;

  Object.keys(wilayah[prov][kota]).forEach((kc) => {
    kec.innerHTML += `<option value="${kc}">${kc}</option>`;
  });
}

function loadKelurahan() {
  const prov = document.getElementById("modalProvinsi").value;
  const kota = document.getElementById("modalKota").value;
  const kec = document.getElementById("modalKecamatan").value;
  const kel = document.getElementById("modalKelurahan");

  kel.innerHTML = `<option value="">-- Pilih Kelurahan --</option>`;

  if (!prov || !kota || !kec) return;

  wilayah[prov][kota][kec].forEach((k) => {
    kel.innerHTML += `<option value="${k}">${k}</option>`;
  });
}

function tutupModal() {
  document.getElementById("modalPasien").style.display = "none";

  [
    "modalNoRM",
    "modalNamaLengkap",
    "modalNoKTP",
    "modalTglLahir",
    "modalAlamat",
    "modalcaraBayar",
    "modalpoliTujuan",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* ================= FILTER PASIEN ================= */
let nomorUrut = 1;

function simpanPasien() {
  const noRM = modalNoRM.value.trim();
  const nama = modalNamaLengkap.value.trim();
  const ktp = modalNoKTP.value.trim();
  const jk = modalJK.value || "-";
  const tgl = modalTglLahir.value || "-";
  const alamat = modalAlamat.value || "-";
  const telp = modalNoTelp.value || "-";
  const poli = modalpoliTujuan.value || "-";
  const bayar = modalcaraBayar.value || "-";

  if (!noRM || !nama || !ktp) {
    alert("❗ No RM, Nama Lengkap, dan No KTP wajib diisi");
    return;
  }

  if (!/^\d{6}$/.test(noRM)) {
    alert("❗ No RM harus 6 digit angka");
    return;
  }

  if (!/^\d{16}$/.test(ktp)) {
    alert("❗ No KTP harus 16 digit angka");
    return;
  }

  const tabel = document.getElementById("tabelPasien");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${nomorUrut++}</td>
    <td>${noRM}</td>
    <td>${nama}</td>
    <td>${jk}</td>
    <td>${tgl}</td>
    <td>${alamat}</td>
    <td>${telp}</td>
    <td>${poli}</td>
    <td>${bayar}</td>
    <td>${new Date().toLocaleDateString("id-ID")}</td>
    <td class="aksi">
      <button class="btn btn-lihat" onclick="lihatPasien(this)">Lihat</button>
      <button class="btn btn-edit" onclick="editPasien(this)">Edit</button>
      <button class="btn btn-hapus" onclick="hapusPasien(this)">Hapus</button>
    </td>
  `;

  tabel.appendChild(tr);

  // simpan ke array (untuk mapping)
  let usia = "-";
  if (tgl !== "-") {
    const lahir = new Date(tgl);
    usia = new Date().getFullYear() - lahir.getFullYear();
  }

  dataPasien.push({
    noRM,
    nama,
    ktp,
    jk,
    tgl,
    alamat,
    telp,
    poli,
    bayar,
    daftar: new Date().toLocaleDateString("id-ID"),
    usia,
  });

  // SIMPAN KE LOCALSTORAGE
  localStorage.setItem("dataPasien", JSON.stringify(dataPasien));

  renderTabelPasien();

  tutupModal();
  alert("✅ Pasien berhasil disimpan");
  updateDashboard();
}

/* ================= LIHAT PASIEN ================= */
function lihatPasien(btn) {
  const row = btn.closest("tr");
  const noRM = row.cells[1].innerText;

  const pasien = dataPasien.find((p) => p.noRM === noRM);
  if (!pasien) return;

  document.getElementById("d-noRM").innerText = pasien.noRM;
  document.getElementById("d-nama").innerText = pasien.nama;
  document.getElementById("d-ktp").innerText = pasien.ktp;
  document.getElementById("d-jk").innerText = pasien.jk;
  document.getElementById("d-tgl").innerText = pasien.tgl;
  document.getElementById("d-alamat").innerText = pasien.alamat;
  document.getElementById("d-telp").innerText = pasien.telp;
  document.getElementById("d-poli").innerText = pasien.poli;
  document.getElementById("d-bayar").innerText = pasien.bayar;
  document.getElementById("d-daftar").innerText = pasien.daftar;

  document.getElementById("modalDetailPasien").style.display = "flex";
}

function tutupDetail() {
  document.getElementById("modalDetailPasien").style.display = "none";
}

/* ================= FILTER ================= */
function filterPasien() {
  const filter = document.getElementById("searchPasien").value.toLowerCase();
  document.querySelectorAll("#tabelPasien tr").forEach((row) => {
    const id = row.cells[1]?.innerText.toLowerCase() || "";
    const nama = row.cells[2]?.innerText.toLowerCase() || "";
    row.style.display =
      id.includes(filter) || nama.includes(filter) ? "" : "none";
  });
}

const wilayah = {
  "DKI Jakarta": {
    "Jakarta Selatan": {
      "Kebayoran Baru": [
        "Selong",
        "Gandaria Utara",
        "Cipete Utara",
        "Pulo",
        "Gunung",
        "Kramat Pela",
        "Melawai",
        "Senayan",
        "Petogogan",
        "Cipete Selatan",
        "Rawa Barat",
      ],
      Tebet: [
        "Manggarai",
        "Menteng Dalam",
        "Ragunan",
        "Tebet Timur",
        "Tebet Barat",
        "Bukit Duri",
        "Kebon Baru",
        "Manggarai Selatan",
      ],
      "Kebayoran Lama": [
        "Grogol Selatan",
        "Kebayoran Lama Selatan",
        "Kebayoran Lama Utara",
        "Pondok Pinang",
        "Cipulir",
      ],
      Pesanggrahan: [
        "Ulujami",
        "Petukangan Selatan",
        "Petukangan Utara",
        "Pesanggrahan",
        "Bintaro",
      ],
      Cilandak: [
        "Cilandak Barat",
        "Cilandak Timur",
        "Pondok Labu",
        "Lebak Bulus",
      ],
      "Pasar Minggu": [
        "Pejaten Timur",
        "Pejaten Barat",
        "Pasar Minggu",
        "Duren Tiga",
        "Kebagusan",
      ],
      Jagakarsa: [
        "Ciganjur",
        "Cipedak",
        "Jati Padang",
        "Lenteng Agung",
        "Srengseng Sawah",
      ],
      "Mampang Prapatan": ["Bangka", "Kuningan Barat", "Mampang Prapatan"],
      Pancoran: ["Cikoko", "Duren Tiga", "Kalibata", "Rawajati"],
      Setiabudi: [
        "Bendungan Hilir",
        "Karet",
        "Kuningan Timur",
        "Menteng Atas",
        "Setiabudi",
        "Sudirman",
      ],
    },

    "Jakarta Timur": {
      Matraman: ["Pal Meriam", "Utan Kayu"],
      Pulogadung: ["Kayu Putih", "Pulogadung", "Rawamangun", "Rawa Bunga"],
      Cakung: [
        "Cakung Barat",
        "Cakung Timur",
        "Jatinegara Kaum",
        "Pulo Gebang",
        "Penggilingan",
      ],
      Jatinegara: [
        "Bidara Cina",
        "Cipinang Besar Utara",
        "Cipinang Besar Selatan",
        "Cipinang Muara",
      ],
      "Kramat Jati": ["Cililitan", "Kramat Jati", "Makasar", "Cawang"],
      Makasar: ["Halim Perdanakusuma", "Makasar", "Cipinang Melayu"],
      "Duren Sawit": [
        "Duren Sawit",
        "Pondok Bambu",
        "Pondok Kelapa",
        "Klender",
      ],
      Cipayung: ["Cipayung", "Lubang Buaya", "Setu"],
      Ciracas: ["Cibubur", "Ciracas", "Kelapa Dua Wetan", "Susukan"],
      "Pasar Rebo": ["Cijantung", "Kalisari", "Pasar Rebo", "Pondok Ranggon"],
    },

    "Jakarta Pusat": {
      Menteng: ["Pegangsaan", "Cikini", "Menteng"],
      "Tanah Abang": ["Bendungan Hilir", "Karet Tengsin"],
      Senen: ["Kampung Bali", "Kenari", "Senen"],
      "Cempaka Putih": [
        "Cempaka Putih Timur",
        "Cempaka Putih Barat",
        "Rawasari",
      ],
      "Johar Baru": ["Galur", "Johar Baru", "Kampung Rawa"],
      Kemayoran: [
        "Cempaka Baru",
        "Gunung Sahari Selatan",
        "Kemayoran",
        "Serdang",
      ],
    },

    "Jakarta Utara": {
      "Tanjung Priok": [
        "Sunter Agung",
        "Sunter Jaya",
        "Tanjung Priok",
        "Warakas",
      ],
      Koja: ["Koja", "Rawa Badak Selatan", "Rawa Badak Utara", "Tugu"],
      Cilincing: ["Cilincing", "Marunda", "Semper Barat", "Semper Timur"],
      "Kelapa Gading": ["Kelapa Gading", "Pegangsaan Dua", "Cilincing"],
      Pademangan: ["Ancol", "Pademangan Barat", "Pademangan Timur"],
      penjaringan: ["Pluit", "Penjaringan", "Pejagalan", "Kamal Muara"],
    },

    "Jakarta Barat": {
      "Grogol Petamburan": [
        "Tomang",
        "Tanjung Duren Utara",
        "Tanjung Duren Selatan",
        "Grogol Selatan",
        "Grogol Utara",
      ],
      "Taman Sari": ["Glodok", "Kota", "Pinangsia", "Taman Sari"],
      Cengkareng: [
        "Cengkareng Barat",
        "Cengkareng Timur",
        "Kedaung Kali Angke",
        "Rawa Buaya",
      ],
      Kalideres: ["Kalideres", "Pegadungan", "Semanan"],
      Palmerah: ["Jatipulo", "Kemanggisan", "Palmerah", "Slipi"],
      Tambora: [
        "Angke",
        "Duri Kosambi",
        "Jembatan Lima",
        "Krendang",
        "Tambora",
      ],
      "Kebon Jeruk": ["Duri Kepa", "Kebon Jeruk", "Kelapa Dua", "Srengseng"],
      Cilincing: ["Cilincing", "Marunda", "Semper Barat", "Semper Timur"],
      palmerah: ["Jatipulo", "Kemanggisan", "Palmerah", "Slipi"],
      kembangan: ["Duren Sawit", "Pondok Bambu", "Pondok Kelapa", "Klender"],
    },
  },

  "Jawa Barat": {
    Depok: {
      Beji: [
        "Beji Timur",
        "Kukusan",
        "Tanah Baru",
        "Beji Barat",
        "Pondok Cina",
        "kemiri Muka",
      ],
      "Pancoran Mas": ["Depok", "Rangkapan Jaya"],
      Sukmajaya: ["Abadijaya", "Sukmajaya", "Tirtajaya"],
      Cimanggis: ["Cimanggis", "Mekarjaya", "Tugu"],
      Cinere: ["Limo", "Cinere", "Pondok Labu"],
      Sawangan: ["Sawangan Baru", "Sawangan Lama", "Pancoran Mas"],
      Cipayung: ["Cipayung", "Bojongsari", "Cilodong"],
    },

    Bogor: {
      "Bogor Selatan": [
        "Cilendek Barat",
        "Cilendek Timur",
        "Cimahpar",
        "Empang",
        "Tanah Sareal",
      ],
      "Bogor Timur": [
        "Bantarjati",
        "Cibuluh",
        "Ciwaringin",
        "Kedung Badak",
        "Mulyaharja",
      ],
      "Bogor Utara": [
        "Cibogo",
        "Cimanggis",
        "Gunung Batu",
        "Loji",
        "Tanah Baru",
      ],
      "Bogor Barat": [
        "Bojonggede",
        "Caringin",
        "Cibinong",
        "Citeureup",
        "Gunung Putri",
      ],
      "Bogor Tengah": [
        "Babakan Madang",
        "Bojong Salaka",
        "Dramaga",
        "Leuwiliang",
        "Sukajaya",
      ],
    },
    Sukabumi: {
      "Sukabumi Selatan": ["Cikole", "Ciwangun", "Lembursitu", "Warudoyong"],
      "Sukabumi Utara": ["Baros", "Gunungpuyuh", "Citamiang", "Cibeureum"],
      "Sukabumi Tengah": ["Cikembar", "Cisaat", "Nagrak", "Kebonpedes"],
      "Sukabumi Barat": [
        "Cisolok",
        "Curugkembar",
        "Kalapanunggal",
        "Parungkuda",
      ],
      "Sukabumi Timur": ["Caringin", "Cicurug", "Cidahu", "Nyalindung"],
    },
    Bandung: {
      "Bandung Selatan": [
        "Ciparay",
        "Margaasih",
        "Pangalengan",
        "Baleendah",
        "Arjasari",
      ],
      "Bandung Timur": [
        "Cileunyi",
        "Cimenyan",
        "Cilengkrang",
        "Cileunyi Kulon",
        "Rancaekek",
      ],
      "Bandung Utara": [
        "Cisarua",
        "Cimahi",
        "Lembang",
        "Parongpong",
        "Cisarua",
      ],
      "Bandung Barat": [
        "Cipatat",
        "Padalarang",
        "Ngamprah",
        "Cikalong Wetan",
        "Gununghalu",
      ],
      "Bandung Tengah": [
        "Andir",
        "Astanaanyar",
        "Batununggal",
        "Bojongloa Kaler",
        "Cibeunying Kidul",
        "Cicendo",
        "Coblong",
        "Lengkong",
        "Sumur Bandung",
        "Sukajadi",
      ],
    },
    Cimahi: {
      "Cimahi Selatan": ["Cibeber", "Cimahi Selatan", "Leuwigajah"],
      "Cimahi Tengah": ["Baros", "Cimahi Tengah", "Kampung Cibeureum"],
      "Cimahi Utara": ["Cimahi Utara", "Melong", "Padasuka"],
      "Cimahi Barat": ["Cimahi Barat", "Cibeber", "Cibabat"],
      "Cimahi Timur": ["Cimahi Timur", "Mekarwangi", "Setiamanah"],
    },
    Karawang: {
      "Karawang Selatan": ["Telukjambe Timur", "Telukjambe Barat", "Tirtajaya"],
      "Karawang Timur": ["Jayakerta", "Lemahabang", "Rengasdengklok"],
      "Karawang Utara": ["Cikampek", "Cilamaya Wetan", "Cilamaya Kulon"],
      "Karawang Barat": ["Cilebar", "Jatisari", "Kutawaluya"],
      "Karawang Tengah": ["Karawang", "Purwasari", "Tegalwaru"],
    },
    Bekasi: {
      "Bekasi Selatan": ["Jatiasih", "Marga Mulya", "Pondok Gede"],
      "Bekasi Timur": ["Bantar Gebang", "Mustikajaya", "Pekayon"],
      "Bekasi Utara": ["Babelan", "Tarumajaya", "Sumber Arta"],
      "Bekasi Barat": ["Medan Satria", "Bekasi Barat", "Duren Jaya"],
    },
    Cirebon: {
      "Cirebon Selatan": ["Kejaksan", "Lemahwungkuk", "Suranenggala"],
      "Cirebon Timur": ["Kedawung", "Pekalipan", "Harjamukti"],
      "Cirebon Utara": ["Kaliwedi", "Kapetakan", "Pangenan"],
      "Cirebon Barat": ["Arjawinangun", "Gegesik", "Plumbon"],
      "Cirebon Tengah": ["Astanajapura", "Kedaton", "Plered"],
    },
    garut: {
      "Garut Selatan": ["Cisewu", "Pamulihan", "Selaawi"],
      "Garut Timur": ["Kersamanah", "Karangpawitan", "Wanaraja"],
      "Garut Utara": ["Cibatu", "Cigedug", "Leles"],
      "Garut Barat": ["Cisompet", "Pameungpeuk", "Sukaresmi"],
      "Garut Tengah": [
        "Balubur Limbangan",
        "Cikalong",
        "Tarogong Kaler",
        "Tarogong Kidul",
      ],
    },
  },

  "Jawa Tengah": {
    Semarang: {
      "Semarang Selatan": ["Candisari", "Mijen", "Tembalang"],
      "Semarang Timur": ["Gayamsari", "Genuk", "Pedurungan"],
      "Semarang Utara": ["Banyumanik", "Gajah Mada", "Pekalongan"],
      "Semarang Barat": ["Cepu", "Kendal", "Pemalang"],
    },
    Surakarta: {
      "Surakarta Selatan": ["Banjarsari", "Jebres"],
      "Surakarta Timur": ["Pasar Kliwon", "Serengan"],
      "Surakarta Utara": ["Laweyan", "Colomadu"],
      "Surakarta Barat": ["Kartasura", "Grogol"],
    },
    Yogyakarta: {
      "Yogyakarta Selatan": ["Mantrijeron", "Kraton"],
      "Yogyakarta Timur": ["Gondokusuman", "Tegalrejo"],
      "Yogyakarta Utara": ["Ngampilan", "Wirobrajan"],
      "Yogyakarta Barat": ["Mergangsan", "Danurejan"],
    },
    Magelang: {
      "Magelang Selatan": ["Magelang Selatan", "Tegalrejo"],
      "Magelang Timur": ["Magelang Timur", "Cacaban"],
      "Magelang Utara": ["Magelang Utara", "Mertoyudan"],
      "Magelang Barat": ["Dukun", "Windusari"],
    },
    Surabaya: {
      "Surabaya Selatan": ["Wonokromo", "Dukuh Pakis"],
      "Surabaya Timur": ["Rungkut", "Gunung Anyar"],
      "Surabaya Utara": ["Sukolilo", "Tandes"],
      "Surabaya Barat": ["Lakarsantri", "Benowo"],
    },
    brebes: {
      "Brebes Selatan": ["Bumiayu", "Ketanggungan"],
      "Brebes Timur": ["Banjarharjo", "Kersana"],
      "Brebes Utara": ["Jatibarang", "Wanasari"],
      "Brebes Barat": ["Bantarkawung", "Sirampog"],
    },
    tegal: {
      "Tegal Selatan": ["Margadana", "Kramat"],
      "Tegal Timur": ["Tegal Timur", "Adiwerna"],
      "Tegal Utara": ["Dukuhturi", "Slawi"],
      "Tegal Barat": ["Balapulang", "Jatinegara"],
    },
    Jember: {
      "Jember Selatan": ["Semboro", "Tanggul"],
      "Jember Timur": ["Kalisat", "Sukorambi"],
      "Jember Utara": ["Kaliwates", "Patrang"],
      "Jember Barat": ["Ajung", "Puger"],
    },
  },

  "Jawa Timur": {
    Surabaya: {
      "Surabaya Selatan": ["Wonokromo", "Dukuh Pakis"],
      "Surabaya Timur": ["Rungkut", "Gunung Anyar"],
      "Surabaya Utara": ["Sukolilo", "Tandes"],
      "Surabaya Barat": ["Lakarsantri", "Benowo"],
    },

    Malang: {
      "Malang Selatan": ["Bantur", "Gedangan"],
      "Malang Timur": ["Kedungkandang", "Lowokwaru"],
      "Malang Utara": ["Blimbing", "Klojen"],
      "Malang Barat": ["Sukun", "Kediri"],
    },
  },
};

/* ================= MODAL PEMETAAN ================= */
function openMappingModal() {
  document.getElementById("modalMapping").style.display = "flex";

  const select = document.getElementById("mappingPasien");
  select.innerHTML = `<option value="">Pilih Pasien...</option>`;

  dataPasien.forEach((p, index) => {
    select.innerHTML += `
      <option value="${index}">
        ${p.nama} (RM: ${p.noRM})
      </option>
    `;
  });

  // Load data dari database untuk dropdown
  populateKeluhanDropdown();
  populateDiagnosisDropdown();
  populateTindakanDropdown();
  populateObatDropdown();
}

function isiDataMapping() {
  const idx = document.getElementById("mappingPasien").value;
  if (idx === "") return;

  const pasien = dataPasien[idx];

  document.getElementById("mappingJK").value = pasien.jk;
  document.getElementById("mappingUsia").value = pasien.usia;
}

// Fungsi untuk populate dropdown keluhan dari database
function populateKeluhanDropdown() {
  const select = document.getElementById("keluhanUtama");
  if (!select) return;

  select.innerHTML = `<option value="">-- Pilih Keluhan Utama --</option>`;

  // Ambil data keluhan dari databaseData
  const keluhanData = databaseData.keluhan.data || [];

  keluhanData.forEach((keluhan) => {
    select.innerHTML += `<option value="${keluhan.code}">${keluhan.name}</option>`;
  });
}

// Fungsi untuk populate dropdown diagnosis utama dari database
function populateDiagnosisDropdown() {
  const selectUtama = document.getElementById("diagnosisUtama");
  const selectSekunder = document.getElementById("diagnosisSekunder");

  const diagnosisData = databaseData.diagnosis.data || [];
  const options = diagnosisData
    .map(
      (diag) =>
        `<option value="${diag.code}">${diag.code} - ${diag.name}</option>`
    )
    .join("");

  if (selectUtama) {
    selectUtama.innerHTML = `<option value="">-- Pilih Diagnosis Utama --</option>${options}`;
  }

  if (selectSekunder) {
    selectSekunder.innerHTML = `<option value="">-- Pilih Diagnosis Sekunder --</option>${options}`;
  }
}

// Fungsi untuk populate dropdown tindakan dari database
function populateTindakanDropdown() {
  const select = document.getElementById("tindakanMedis");
  if (!select) return;

  select.innerHTML = `<option value="">-- Pilih Tindakan Medis --</option>`;

  const tindakanData = databaseData.tindakan.data || [];

  tindakanData.forEach((tindakan) => {
    select.innerHTML += `<option value="${tindakan.code}">${tindakan.name}</option>`;
  });
}

// Fungsi untuk populate dropdown obat dari database
function populateObatDropdown() {
  const select = document.getElementById("obatDiberikan");
  if (!select) return;

  select.innerHTML = `<option value="">-- Pilih Obat --</option>`;

  const obatData = databaseData.obat.data || [];

  obatData.forEach((obat) => {
    select.innerHTML += `<option value="${obat.code}">${obat.name}</option>`;
  });
}

// Fungsi untuk menampilkan detail dari pilihan dropdown
function showKeluhanDetail() {
  const select = document.getElementById("keluhanUtama");
  const kode = select.value;

  if (!kode) return;

  const keluhan = databaseData.keluhan.data.find((k) => k.code === kode);
  if (keluhan) {
    // Bisa tambahkan informasi detail jika diperlukan
    console.log("Keluhan dipilih:", keluhan);
  }
}

function showDiagnosisDetail(type) {
  const selectId = type === "utama" ? "diagnosisUtama" : "diagnosisSekunder";
  const select = document.getElementById(selectId);
  const kode = select.value;

  if (!kode) return;

  const diagnosis = databaseData.diagnosis.data.find((d) => d.code === kode);
  if (diagnosis) {
    console.log(`Diagnosis ${type} dipilih:`, diagnosis);
  }
}

function showTindakanDetail() {
  const select = document.getElementById("tindakanMedis");
  const kode = select.value;

  if (!kode) return;

  const tindakan = databaseData.tindakan.data.find((t) => t.code === kode);
  if (tindakan) {
    console.log("Tindakan dipilih:", tindakan);
  }
}

function showObatDetail() {
  const select = document.getElementById("obatDiberikan");
  const kode = select.value;

  if (!kode) return;

  const obat = databaseData.obat.data.find((o) => o.code === kode);
  if (obat) {
    console.log("Obat dipilih:", obat);
  }
}

function closeMappingModal() {
  document.getElementById("modalMapping").style.display = "none";
}

// Fungsi simpan mapping
function simpanMapping() {
  const pasienIdx = document.getElementById("mappingPasien").value;

  if (pasienIdx === "") {
    alert("⚠️ Silakan pilih pasien terlebih dahulu!");
    return;
  }

  const pasien = dataPasien[pasienIdx];
  const tanggal = document.getElementById("mappingTanggal").value;
  const keluhanUtama = document.getElementById("keluhanUtama").value;
  const riwayatPenyakit = document.getElementById("riwayatPenyakit").value;
  const diagnosisUtama = document.getElementById("diagnosisUtama").value;
  const diagnosisSekunder = document.getElementById("diagnosisSekunder").value;
  const tindakanMedis = document.getElementById("tindakanMedis").value;
  const obatDiberikan = document.getElementById("obatDiberikan").value;

  if (!tanggal) {
    alert("⚠️ Tanggal masuk wajib diisi!");
    return;
  }

  // Ambil nama lengkap dari database
  const keluhanNama = keluhanUtama
    ? databaseData.keluhan.data.find((k) => k.code === keluhanUtama)?.name
    : "-";
  const diagnosisUtamaNama = diagnosisUtama
    ? databaseData.diagnosis.data.find((d) => d.code === diagnosisUtama)?.name
    : "-";
  const diagnosisSekunderNama = diagnosisSekunder
    ? databaseData.diagnosis.data.find((d) => d.code === diagnosisSekunder)
        ?.name
    : "-";
  const tindakanNama = tindakanMedis
    ? databaseData.tindakan.data.find((t) => t.code === tindakanMedis)?.name
    : "-";
  const obatNama = obatDiberikan
    ? databaseData.obat.data.find((o) => o.code === obatDiberikan)?.name
    : "-";

  const newMapping = {
    namaPasien: pasien.nama,
    noRM: pasien.noRM,
    jk: pasien.jk,
    usia: pasien.usia,
    tanggal: tanggal,
    keluhanUtama: keluhanNama,
    keluhanKode: keluhanUtama,
    riwayatPenyakit: riwayatPenyakit || "-",
    diagnosisUtama: diagnosisUtamaNama,
    diagnosisUtamaKode: diagnosisUtama,
    diagnosisSekunder: diagnosisSekunderNama,
    diagnosisSekunderKode: diagnosisSekunder,
    tindakanMedis: tindakanNama,
    tindakanKode: tindakanMedis,
    obatDiberikan: obatNama,
    obatKode: obatDiberikan,
  };

  dataMapping.push(newMapping);

  // SIMPAN KE LOCALSTORAGE
  localStorage.setItem("dataMapping", JSON.stringify(dataMapping));

  renderTabelMapping();
  updateDashboard();
  closeMappingModal();
  resetFormMapping();

  alert("✅ Data mapping berhasil disimpan!");
}

// Reset form mapping
function resetFormMapping() {
  document.getElementById("mappingPasien").value = "";
  document.getElementById("mappingJK").value = "";
  document.getElementById("mappingUsia").value = "";
  document.getElementById("mappingTanggal").value = "";
  document.getElementById("keluhanUtama").value = "";
  document.getElementById("riwayatPenyakit").value = "";
  document.getElementById("diagnosisUtama").value = "";
  document.getElementById("diagnosisSekunder").value = "";
  document.getElementById("tindakanMedis").value = "";
  document.getElementById("obatDiberikan").value = "";
}

// Lihat detail mapping
function lihatMapping(index) {
  const mapping = dataMapping[index];

  const detailText = `
Detail Mapping Resume Medis

Nama Pasien: ${mapping.namaPasien}
No RM: ${mapping.noRM}
Jenis Kelamin: ${mapping.jk}
Usia: ${mapping.usia}
Tanggal: ${mapping.tanggal}
━━━━━━━━━━━━━━━━━━━━━
Keluhan Utama: ${mapping.keluhanUtama}
Riwayat Penyakit: ${mapping.riwayatPenyakit}
Diagnosis Utama: ${mapping.diagnosisUtama}
Diagnosis Sekunder: ${mapping.diagnosisSekunder}
Tindakan Medis: ${mapping.tindakanMedis}
Obat Diberikan: ${mapping.obatDiberikan}
  `;

  alert(detailText);
}

// Edit mapping
function editMapping(index) {
  alert("Fitur edit mapping akan segera hadir!");
}

// Hapus mapping
function hapusMapping(index) {
  if (!confirm("Yakin ingin menghapus data mapping ini?")) return;

  dataMapping.splice(index, 1);
  localStorage.setItem("dataMapping", JSON.stringify(dataMapping));
  renderTabelMapping();
  updateDashboard();

  alert("✅ Data mapping berhasil dihapus!");
}

// Hapus pasien
function hapusPasien(btn) {
  if (!confirm("Yakin ingin menghapus data pasien ini?")) return;

  const row = btn.closest("tr");
  const noRM = row.cells[1].innerText;

  const index = dataPasien.findIndex((p) => p.noRM === noRM);
  if (index !== -1) {
    dataPasien.splice(index, 1);
    localStorage.setItem("dataPasien", JSON.stringify(dataPasien));
    row.remove();
    updateDashboard();
    alert("✅ Data pasien berhasil dihapus!");
  }
}

// Edit pasien
function editPasien(btn) {
  alert("Fitur edit pasien akan segera hadir!");
}

document.addEventListener("DOMContentLoaded", () => {
  // LOAD SEMUA DATA DARI LOCALSTORAGE
  loadAllData();

  const defaultMenu = document.querySelector(".sidebar a");
  showPage("dashboard", defaultMenu);
});

// ========================================
// FUNGSI GANTI DATABASE
// ========================================
function changeDatabase() {
  const select = document.getElementById("selectDatabase");
  const value = select.value;

  // Sembunyikan semua tabel
  const allTables = document.querySelectorAll(".database-table");
  allTables.forEach((table) => {
    table.style.display = "none";
  });

  // Tampilkan tabel yang dipilih
  if (value) {
    const targetTable = document.getElementById("tabel-" + value);
    if (targetTable) {
      targetTable.style.display = "block";
    }
  }
}

// ========================================
// FUNGSI SHOW INPUT MODAL
// ========================================
function showInputModal(type) {
  alert("Modal untuk input " + type + " akan dibuat");
  // Nanti akan dibuat modal input sesuai type
}

// ========================================
// FUNGSI EDIT & HAPUS DATA
// ========================================
function editData(id, type) {
  alert("Edit data " + type + " dengan ID: " + id);
}

function hapusData(id, type) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    alert("Data " + type + " dengan ID " + id + " dihapus");
    // Implementasi hapus data di sini
  }
}

// ========================================
// JAVASCRIPT UNTUK SECTION DATABASE
// ========================================

// Sample data untuk setiap tipe database
const databaseData = {
  diagnosis: {
    icon: "🩺",
    label: "Diagnosis",
    count: 156,
    columns: ["No", "Kode ICD-10", "Nama Diagnosis", "Kategori"],
    data: [
      {
        no: 1,
        code: "A00.0",
        name: "Kolera karena Vibrio cholerae 01, biovar cholerae",
        category: "Penyakit Infeksi",
      },
      {
        no: 2,
        code: "A15.0",
        name: "Tuberkulosis paru",
        category: "Penyakit Infeksi",
      },
      {
        no: 3,
        code: "E11.9",
        name: "Diabetes Melitus Tipe 2",
        category: "Penyakit Metabolik",
      },
      {
        no: 4,
        code: "I10",
        name: "Hipertensi Esensial",
        category: "Penyakit Kardiovaskular",
      },
      {
        no: 5,
        code: "J45.9",
        name: "Asma Bronkial",
        category: "Penyakit Respirasi",
      },
      {
        no: 6,
        code: "K29.0",
        name: "Gastritis Akut",
        category: "Penyakit Pencernaan",
      },
    ],
  },
  keluhan: {
    icon: "💬",
    label: "Keluhan Pasien",
    count: 243,
    columns: ["No", "Kode Keluhan", "Keluhan Utama", "Tingkat Urgensi"],
    data: [
      {
        no: 1,
        code: "KEL-001",
        name: "Demam tinggi lebih dari 3 hari",
        category: '<span class="badge badge-active">Tinggi</span>',
      },
      {
        no: 2,
        code: "KEL-002",
        name: "Nyeri dada sebelah kiri",
        category: '<span class="badge badge-active">Tinggi</span>',
      },
      {
        no: 3,
        code: "KEL-003",
        name: "Batuk berdahak",
        category: '<span class="badge badge-inactive">Sedang</span>',
      },
      {
        no: 4,
        code: "KEL-004",
        name: "Sakit kepala berkepanjangan",
        category: '<span class="badge badge-inactive">Sedang</span>',
      },
      {
        no: 5,
        code: "KEL-005",
        name: "Mual dan muntah",
        category: '<span class="badge badge-inactive">Sedang</span>',
      },
      {
        no: 6,
        code: "KEL-006",
        name: "Sesak napas",
        category: '<span class="badge badge-active">Tinggi</span>',
      },
    ],
  },
  tindakan: {
    icon: "⚕️",
    label: "Tindakan Medis",
    count: 189,
    columns: ["No", "Kode Tindakan", "Nama Tindakan", "Durasi (menit)"],
    data: [
      {
        no: 1,
        code: "TND-001",
        name: "Pemeriksaan Fisik Umum",
        category: "30",
      },
      { no: 2, code: "TND-002", name: "Pemasangan Infus", category: "15" },
      {
        no: 3,
        code: "TND-003",
        name: "Pengambilan Sampel Darah",
        category: "10",
      },
      { no: 4, code: "TND-004", name: "Nebulizer Therapy", category: "20" },
      { no: 5, code: "TND-005", name: "Jahit Luka Ringan", category: "45" },
      { no: 6, code: "TND-006", name: "Pemasangan Kateter", category: "25" },
    ],
  },
  obat: {
    icon: "💊",
    label: "Obat",
    count: 327,
    columns: ["No", "Kode Obat", "Nama Obat", "Status Stok"],
    data: [
      {
        no: 1,
        code: "OBT-001",
        name: "Paracetamol 500mg (Tablet)",
        category: '<span class="badge badge-active">Tersedia</span>',
      },
      {
        no: 2,
        code: "OBT-002",
        name: "Amoxicillin 500mg (Kapsul)",
        category: '<span class="badge badge-active">Tersedia</span>',
      },
      {
        no: 3,
        code: "OBT-003",
        name: "Omeprazole 20mg (Kapsul)",
        category: '<span class="badge badge-inactive">Stok Rendah</span>',
      },
      {
        no: 4,
        code: "OBT-004",
        name: "Salbutamol Inhaler",
        category: '<span class="badge badge-active">Tersedia</span>',
      },
      {
        no: 5,
        code: "OBT-005",
        name: "Metformin 500mg (Tablet)",
        category: '<span class="badge badge-active">Tersedia</span>',
      },
      {
        no: 6,
        code: "OBT-006",
        name: "Amlodipine 10mg (Tablet)",
        category: '<span class="badge badge-inactive">Stok Rendah</span>',
      },
    ],
  },
};

// Fungsi untuk update statistik
function updateStats(type = null) {
  const statsGrid = document.getElementById("statsGrid");

  if (!type) {
    // Tampilan default ketika belum memilih database
    statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Total Database</div>
                <div class="stat-value">4</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Records</div>
                <div class="stat-value">915</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Last Update</div>
                <div class="stat-value" style="font-size: 1.2rem;">Today</div>
            </div>
        `;
  } else {
    // Tampilan spesifik untuk database yang dipilih
    const data = databaseData[type];
    statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">${data.icon} ${data.label}</div>
                <div class="stat-value">${data.count}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Records Ditampilkan</div>
                <div class="stat-value">${data.data.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Status Database</div>
                <div class="stat-value" style="font-size: 1.2rem; color: var(--success);">✓ Active</div>
            </div>
        `;
  }
}

// Fungsi untuk ganti database
function changeDatabase() {
  const selector = document.getElementById("databaseSelector");
  const selectedValue = selector.value;
  const tableContainer = document.getElementById("tableContainer");

  // Jika tidak ada yang dipilih, tampilkan pesan default
  if (!selectedValue) {
    tableContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Kode SNOMED CT</th>
                        <th>Display Name (FSN)</th>
                        <th>Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                            Silakan pilih database untuk menampilkan data
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    updateStats();
    return;
  }

  const dbConfig = databaseData[selectedValue];

  // Build table header
  let headerHtml = "<tr>";
  dbConfig.columns.forEach((col) => {
    headerHtml += `<th>${col}</th>`;
  });
  headerHtml += "</tr>";

  // Build table body
  let bodyHtml = "";
  dbConfig.data.forEach((row) => {
    bodyHtml += `
            <tr>
                <td>${row.no}</td>
                <td>${row.code}</td>
                <td>${row.name}</td>
                <td>${row.category}</td>
            </tr>
        `;
  });

  // Update table dengan animasi
  tableContainer.style.opacity = "0";
  tableContainer.style.transform = "translateY(20px)";

  setTimeout(() => {
    tableContainer.innerHTML = `
            <table>
                <thead>${headerHtml}</thead>
                <tbody>${bodyHtml}</tbody>
            </table>
        `;

    tableContainer.style.transition = "all 0.4s ease";
    tableContainer.style.opacity = "1";
    tableContainer.style.transform = "translateY(0)";
  }, 200);

  // Update statistik
  updateStats(selectedValue);
}

// Fungsi untuk tambah entry baru
function addNewEntry() {
  const selector = document.getElementById("databaseSelector");
  const selectedValue = selector.value;

  if (!selectedValue) {
    alert("⚠️ Silakan pilih database terlebih dahulu!");
    return;
  }

  const dbConfig = databaseData[selectedValue];
  alert(`✅ Membuka form tambah data untuk: ${dbConfig.label}`);
  // Di sini Anda bisa menambahkan logika untuk membuka modal form
  // Atau redirect ke halaman input
  // Contoh: showInputModal(selectedValue);
}

// Inisialisasi statistik saat halaman dimuat
// Pastikan dipanggil setelah DOM ready
document.addEventListener("DOMContentLoaded", function () {
  // Cek apakah elemen statsGrid ada
  if (document.getElementById("statsGrid")) {
    updateStats();
  }
});

// ========================================
// JAVASCRIPT UNTUK MODAL INPUT DATABASE (COMPACT VERSION)
// ========================================

// Storage data untuk setiap database (LocalStorage)
let dataKeluhan = [];
let dataDiagnosis = [];
let dataTindakan = [];
let dataObat = [];

// Load data dari localStorage saat halaman dimuat
function loadDataFromStorage() {
  dataKeluhan = JSON.parse(localStorage.getItem("dataKeluhan")) || [];
  dataDiagnosis = JSON.parse(localStorage.getItem("dataDiagnosis")) || [];
  dataTindakan = JSON.parse(localStorage.getItem("dataTindakan")) || [];
  dataObat = JSON.parse(localStorage.getItem("dataObat")) || [];

  // Update databaseData dengan data dari storage
  if (dataKeluhan.length > 0) {
    databaseData.keluhan.data = dataKeluhan;
    databaseData.keluhan.count = dataKeluhan.length;
  }
  if (dataDiagnosis.length > 0) {
    databaseData.diagnosis.data = dataDiagnosis;
    databaseData.diagnosis.count = dataDiagnosis.length;
  }
  if (dataTindakan.length > 0) {
    databaseData.tindakan.data = dataTindakan;
    databaseData.tindakan.count = dataTindakan.length;
  }
  if (dataObat.length > 0) {
    databaseData.obat.data = dataObat;
    databaseData.obat.count = dataObat.length;
  }
}

// Fungsi untuk membuka modal input (dipanggil dari halaman Input)
function showInputModal(type) {
  const modalId = "modalInput" + type.charAt(0).toUpperCase() + type.slice(1);
  const modal = document.getElementById(modalId);

  if (modal) {
    modal.style.display = "flex";
    // Reset form
    const form = modal.querySelector("form");
    if (form) form.reset();
  }
}

// Fungsi untuk menutup modal input
function tutupModalInput(type) {
  const modalId = "modalInput" + type.charAt(0).toUpperCase() + type.slice(1);
  const modal = document.getElementById(modalId);

  if (modal) {
    modal.style.display = "none";
  }
}

// ========================================
// SIMPAN DATA KELUHAN
// ========================================
function simpanKeluhan(event) {
  event.preventDefault();

  const kode = document.getElementById("keluhanKode").value.trim();
  const nama = document.getElementById("keluhanNama").value.trim();

  if (!kode || !nama) {
    alert("⚠️ Mohon isi semua field yang diperlukan!");
    return;
  }

  // Cek duplikasi kode
  if (dataKeluhan.some((item) => item.code === kode)) {
    alert("⚠️ Kode keluhan sudah ada! Gunakan kode yang berbeda.");
    return;
  }

  // Tambah data baru
  const newData = {
    no: dataKeluhan.length + 1,
    code: kode,
    name: nama,
    category: "Keluhan Pasien", // Keterangan default
  };

  dataKeluhan.push(newData);

  // Simpan ke localStorage
  localStorage.setItem("dataKeluhan", JSON.stringify(dataKeluhan));

  // Update databaseData
  databaseData.keluhan.data = dataKeluhan;
  databaseData.keluhan.count = dataKeluhan.length;

  // Tutup modal
  tutupModalInput("keluhan");

  // Notifikasi sukses
  alert("✅ Data keluhan berhasil disimpan!");

  // Update tampilan jika sedang di page Database
  const selector = document.getElementById("databaseSelector");
  if (selector && selector.value === "keluhan") {
    changeDatabase();
  }

  // Update statistik di halaman Input
  updateInputStats();
}

// ========================================
// SIMPAN DATA DIAGNOSIS
// ========================================
function simpanDiagnosis(event) {
  event.preventDefault();

  const kode = document.getElementById("diagnosisKode").value.trim();
  const nama = document.getElementById("diagnosisNama").value.trim();

  if (!kode || !nama) {
    alert("⚠️ Mohon isi semua field yang diperlukan!");
    return;
  }

  // Cek duplikasi kode
  if (dataDiagnosis.some((item) => item.code === kode)) {
    alert("⚠️ Kode diagnosis sudah ada! Gunakan kode yang berbeda.");
    return;
  }

  // Tambah data baru
  const newData = {
    no: dataDiagnosis.length + 1,
    code: kode,
    name: nama,
    category: "Diagnosis Penyakit", // Kategori default
  };

  dataDiagnosis.push(newData);

  // Simpan ke localStorage
  localStorage.setItem("dataDiagnosis", JSON.stringify(dataDiagnosis));

  // Update databaseData
  databaseData.diagnosis.data = dataDiagnosis;
  databaseData.diagnosis.count = dataDiagnosis.length;

  // Tutup modal
  tutupModalInput("diagnosis");

  // Notifikasi sukses
  alert("✅ Data diagnosis berhasil disimpan!");

  // Update tampilan jika sedang di page Database
  const selector = document.getElementById("databaseSelector");
  if (selector && selector.value === "diagnosis") {
    changeDatabase();
  }

  // Update statistik di halaman Input
  updateInputStats();
}

// ========================================
// SIMPAN DATA TINDAKAN
// ========================================
function simpanTindakan(event) {
  event.preventDefault();

  const kode = document.getElementById("tindakanKode").value.trim();
  const nama = document.getElementById("tindakanNama").value.trim();

  if (!kode || !nama) {
    alert("⚠️ Mohon isi semua field yang diperlukan!");
    return;
  }

  // Cek duplikasi kode
  if (dataTindakan.some((item) => item.code === kode)) {
    alert("⚠️ Kode tindakan sudah ada! Gunakan kode yang berbeda.");
    return;
  }

  // Tambah data baru
  const newData = {
    no: dataTindakan.length + 1,
    code: kode,
    name: nama,
    category: "Tindakan Medis", // Keterangan default
  };

  dataTindakan.push(newData);

  // Simpan ke localStorage
  localStorage.setItem("dataTindakan", JSON.stringify(dataTindakan));

  // Update databaseData
  databaseData.tindakan.data = dataTindakan;
  databaseData.tindakan.count = dataTindakan.length;

  // Tutup modal
  tutupModalInput("tindakan");

  // Notifikasi sukses
  alert("✅ Data tindakan berhasil disimpan!");

  // Update tampilan jika sedang di page Database
  const selector = document.getElementById("databaseSelector");
  if (selector && selector.value === "tindakan") {
    changeDatabase();
  }

  // Update statistik di halaman Input
  updateInputStats();
}

// ========================================
// SIMPAN DATA OBAT
// ========================================
function simpanObat(event) {
  event.preventDefault();

  const kode = document.getElementById("obatKode").value.trim();
  const nama = document.getElementById("obatNama").value.trim();

  if (!kode || !nama) {
    alert("⚠️ Mohon isi semua field yang diperlukan!");
    return;
  }

  // Cek duplikasi kode
  if (dataObat.some((item) => item.code === kode)) {
    alert("⚠️ Kode obat sudah ada! Gunakan kode yang berbeda.");
    return;
  }

  // Tambah data baru
  const newData = {
    no: dataObat.length + 1,
    code: kode,
    name: nama,
    category: "Obat-obatan", // Keterangan default
  };

  dataObat.push(newData);

  // Simpan ke localStorage
  localStorage.setItem("dataObat", JSON.stringify(dataObat));

  // Update databaseData
  databaseData.obat.data = dataObat;
  databaseData.obat.count = dataObat.length;

  // Tutup modal
  tutupModalInput("obat");

  // Notifikasi sukses
  alert("✅ Data obat berhasil disimpan!");

  // Update tampilan jika sedang di page Database
  const selector = document.getElementById("databaseSelector");
  if (selector && selector.value === "obat") {
    changeDatabase();
  }

  // Update statistik di halaman Input
  updateInputStats();
}

// ========================================
// UPDATE STATISTIK DI HALAMAN INPUT
// ========================================
function updateInputStats() {
  // Update angka di statistik bawah
  const statItems = document.querySelectorAll(
    "#input .stat-summary .stat-number"
  );
  if (statItems.length >= 4) {
    statItems[0].textContent = dataKeluhan.length;
    statItems[1].textContent = dataDiagnosis.length;
    statItems[2].textContent = dataTindakan.length;
    statItems[3].textContent = dataObat.length;
  }
}

// ========================================
// FUNGSI UNTUK TOMBOL "TAMBAH DATA BARU" DI HALAMAN DATABASE
// ========================================
function addNewEntry() {
  const selector = document.getElementById("databaseSelector");
  const selectedValue = selector.value;

  if (!selectedValue) {
    alert("⚠️ Silakan pilih database terlebih dahulu!");
    return;
  }

  // Buka modal input sesuai database yang dipilih
  showInputModal(selectedValue);
}

// ========================================
// INISIALISASI
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  // Load data dari localStorage
  loadDataFromStorage();

  // Update statistik di halaman Input
  updateInputStats();

  // Update stats di halaman Database jika ada
  if (document.getElementById("statsGrid")) {
    updateStats();
  }
});

// Close modal ketika klik di luar modal
window.onclick = function (event) {
  if (event.target.classList.contains("modal-overlay")) {
    event.target.style.display = "none";
  }
};
