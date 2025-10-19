// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Verichain - Trusted Content Verification
 * @dev Mencatat verifikasi konten digital berbasis blockchain.
 * Digunakan untuk melawan hoaks, menegakkan transparansi, dan menjaga keaslian informasi.
 */

contract Verichain {
    struct Verification {
        address verifier;       // siapa yang memverifikasi konten
        string contentHash;     // hash unik konten digital (bisa dari IPFS / SHA256)
        uint256 timestamp;      // waktu verifikasi
        string note;            // catatan tambahan (opsional)
    }

    mapping(string => Verification) private verifications; // contentHash → data verifikasi
    string[] private verifiedList;                         // daftar semua hash yang diverifikasi

    event Verified(
        address indexed verifier,
        string contentHash,
        uint256 timestamp,
        string note
    );

    /**
     * @dev Melakukan verifikasi konten digital.
     * @param _contentHash Hash unik konten (mis. hasil hash SHA256 atau CID IPFS)
     * @param _note Catatan tambahan (mis. "diverifikasi oleh media terpercaya")
     */
    function verifyContent(string calldata _contentHash, string calldata _note) external {
        require(bytes(_contentHash).length > 0, "Content hash required");
        require(verifications[_contentHash].verifier == address(0), "Already verified");

        verifications[_contentHash] = Verification({
            verifier: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            note: _note
        });

        verifiedList.push(_contentHash);
        emit Verified(msg.sender, _contentHash, block.timestamp, _note);
    }

    /**
     * @dev Mengecek apakah suatu konten sudah diverifikasi.
     * @param _contentHash Hash konten digital.
     * @return bool True jika konten sudah diverifikasi.
     */
    function isVerified(string calldata _contentHash) external view returns (bool) {
        return verifications[_contentHash].verifier != address(0);
    }

    /**
     * @dev Mengambil detail verifikasi suatu konten.
     */
    function getVerification(string calldata _contentHash)
        external
        view
        returns (address verifier, uint256 timestamp, string memory note)
    {
        require(verifications[_contentHash].verifier != address(0), "Not verified");
        Verification memory v = verifications[_contentHash];
        return (v.verifier, v.timestamp, v.note);
    }

    /**
     * @dev Mendapatkan daftar semua konten yang sudah diverifikasi.
     */
    function getAllVerified() external view returns (string[] memory) {
        return verifiedList;
    }
}
