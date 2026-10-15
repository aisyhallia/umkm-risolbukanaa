
"use strict";

// DATA PRODUK
const produk = {
    1: {
        nama: "Risol Mayo",
        harga: 3000
    },
    2: {
        nama: "Risol Sayur",
        harga: 3000
    }
};

// GANTI DENGAN NOMOR WHATSAPP TOKO
// Gunakan kode negara 62 tanpa angka 0 di depan.
const nomorWhatsApp = "6285270051074";

// KERANJANG BELANJA
const keranjang = {};

// ELEMEN HTML
const daftarKeranjang =
    document.getElementById("daftar-keranjang");

const jumlahKeranjang =
    document.getElementById("jumlah-keranjang");

const jumlahItem =
    document.getElementById("jumlah-item");

const totalElement =
    document.getElementById("total");

const tombolHapus =
    document.getElementById("hapus");

const tombolCheckout =
    document.getElementById("checkout");

const notifikasi =
    document.getElementById("notifikasi");

// FORMAT HARGA RUPIAH
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}

// HITUNG JUMLAH DAN TOTAL
function hitungKeranjang() {
    let jumlah = 0;
    let total = 0;

    Object.keys(keranjang).forEach(id => {
        jumlah += keranjang[id];
        total += produk[id].harga * keranjang[id];
    });

    jumlahKeranjang.textContent = jumlah;
    jumlahItem.textContent = `${jumlah} item`;
    totalElement.textContent = formatRupiah(total);

    return { jumlah, total };
}

// NOTIFIKASI
let timerNotifikasi;

function tampilkanNotifikasi(pesan) {
    notifikasi.textContent = pesan;
    notifikasi.classList.add("tampil");

    clearTimeout(timerNotifikasi);

    timerNotifikasi = setTimeout(() => {
        notifikasi.classList.remove("tampil");
    }, 2200);
}

// TAMPILKAN KERANJANG
function tampilkanKeranjang() {
    const ids = Object.keys(keranjang)
        .filter(id => keranjang[id] > 0);

    if (ids.length === 0) {
        daftarKeranjang.innerHTML = `
            <div class="keranjang-kosong">
                <span>🛍️</span>
                <h3>Keranjang masih kosong</h3>
                <p>Yuk, pilih Risol Mayo atau Risol Sayur!</p>
                <a href="#produk" class="btn-primary">
                    Pilih Produk
                </a>
            </div>
        `;
    } else {
        daftarKeranjang.innerHTML = ids.map(id => {
            const item = produk[id];
            const jumlah = keranjang[id];
            const subtotal = item.harga * jumlah;

            return `
                <div class="item-keranjang">
                    <div>
                        <h4>${item.nama}</h4>
                        <small>
                            ${formatRupiah(item.harga)} / buah
                        </small>
                        <p>
                            <strong>
                                ${formatRupiah(subtotal)}
                            </strong>
                        </p>
                    </div>

                    <div class="item-kanan">
                        <div class="kontrol-jumlah">
                            <button
                                type="button"
                                data-aksi="kurang"
                                data-id="${id}"
                                aria-label="Kurangi ${item.nama}">
                                −
                            </button>

                            <strong>${jumlah}</strong>

                            <button
                                type="button"
                                data-aksi="tambah"
                                data-id="${id}"
                                aria-label="Tambah ${item.nama}">
                                +
                            </button>
                        </div>

                        <button
                            type="button"
                            class="btn-hapus"
                            data-aksi="hapus"
                            data-id="${id}">
                            Hapus
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    hitungKeranjang();
}

// TOMBOL TAMBAH PRODUK
document.querySelectorAll(".btn-tambah").forEach(tombol => {
    tombol.addEventListener("click", () => {
        const id = tombol.dataset.id;

        if (!produk[id]) return;

        keranjang[id] = (keranjang[id] || 0) + 1;

        tampilkanKeranjang();

        tampilkanNotifikasi(
            `${produk[id].nama} berhasil ditambahkan!`
        );
    });
});

// TOMBOL TAMBAH, KURANG, DAN HAPUS ITEM
daftarKeranjang.addEventListener("click", event => {
    const tombol = event.target.closest("button");

    if (!tombol) return;

    const id = tombol.dataset.id;
    const aksi = tombol.dataset.aksi;

    if (!produk[id] || !keranjang[id]) return;

    if (aksi === "tambah") {
        keranjang[id]++;
    }

    if (aksi === "kurang") {
        keranjang[id]--;

        if (keranjang[id] <= 0) {
            delete keranjang[id];
        }
    }

    if (aksi === "hapus") {
        delete keranjang[id];

        tampilkanNotifikasi(
            `${produk[id].nama} dihapus dari keranjang.`
        );
    }

    tampilkanKeranjang();
});

// HAPUS SEMUA PESANAN
tombolHapus.addEventListener("click", () => {
    if (Object.keys(keranjang).length === 0) {
        tampilkanNotifikasi("Keranjang sudah kosong.");
        return;
    }

    Object.keys(keranjang).forEach(id => {
        delete keranjang[id];
    });

    tampilkanKeranjang();
    tampilkanNotifikasi("Semua pesanan berhasil dihapus.");
});

// CHECKOUT MELALUI WHATSAPP
tombolCheckout.addEventListener("click", () => {
    const { jumlah, total } = hitungKeranjang();

    if (jumlah === 0) {
        tampilkanNotifikasi(
            "Silakan pilih produk terlebih dahulu!"
        );
        return;
    }

    let pesan =
        "Halo Risol Buk Ana, saya ingin memesan:\n\n";

    Object.keys(keranjang).forEach(id => {
        const item = produk[id];
        const qty = keranjang[id];
        const subtotal = item.harga * qty;

        pesan += `${item.nama} x ${qty} = `;
        pesan += `${formatRupiah(subtotal)}\n`;
    });

    pesan += `\nJumlah item: ${jumlah}`;
    pesan += `\nTotal pembayaran: ${formatRupiah(total)}`;
    pesan += "\n\nMohon konfirmasi pesanan saya. Terima kasih!";

    const url =
        `https://wa.me/${nomorWhatsApp}?text=` +
        encodeURIComponent(pesan);

    window.open(url, "_blank");
});

// TAMPILKAN KERANJANG KOSONG SAAT PERTAMA DIBUKA
tampilkanKeranjang();
