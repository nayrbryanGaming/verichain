# 🦅 Verichain Smart Contract

**Verichain.sol** adalah smart contract inti dari proyek *Garuda Spark Blockchain for Good* — subtema **Anti-Hoax & Trusted Info**.  
Tujuannya adalah menciptakan sistem verifikasi keaslian konten digital berbasis blockchain untuk melawan hoaks dan menjaga transparansi informasi.

---

## 💡 Konsep Singkat

Setiap konten digital (artikel, gambar, video, atau berita) bisa memiliki **hash unik** (misal hasil hashing SHA256 atau CID dari IPFS).  
Melalui `Verichain.sol`, hash tersebut bisa direkam di blockchain bersama data:
- **verifier** → siapa yang memverifikasi
- **timestamp** → kapan diverifikasi
- **note** → catatan tambahan (misal sumber / lembaga verifikasi)

Dengan ini, publik bisa memeriksa apakah sebuah informasi benar-benar sudah diverifikasi dan oleh siapa, tanpa bergantung pada otoritas tunggal.

---

## 🧩 Smart Contract Details

| Detail | Keterangan |
|--------|-------------|
| **Nama Kontrak** | Verichain |
| **Bahasa** | Solidity (v0.8.20) |
| **Network Target** | EVM-Compatible (Ethereum Sepolia, Polygon, BNB, dll) |
| **Lisensi** | MIT |
| **Author** | Team Verichain (Garuda Spark Hackathon 2025) |

---

## ⚙️ Fitur Utama

| Fungsi | Deskripsi |
|---------|------------|
| `verifyContent(string _contentHash, string _note)` | Mencatat verifikasi konten digital ke blockchain. |
| `isVerified(string _contentHash)` | Mengecek apakah konten sudah diverifikasi. |
| `getVerification(string _contentHash)` | Mengambil detail verifikasi (verifier, waktu, catatan). |
| `getAllVerified()` | Mendapatkan daftar semua konten yang sudah diverifikasi. |

---

## 🧠 Struktur Data

```solidity
struct Verification {
    address verifier;
    string contentHash;
    uint256 timestamp;
    string note;
}
