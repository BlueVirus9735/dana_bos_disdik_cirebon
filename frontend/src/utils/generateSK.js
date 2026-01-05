import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = url;
  });
};

export const generateSK = async (data, category, year) => {
  // Landscape orientation ('l') for more columns
  const doc = new jsPDF("l", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width; // Approx 297mm for A4 Landscape

  // Helper for centering text
  const centerText = (text, y) => {
    const textWidth =
      (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // -- LOGO --
  try {
    const imgData = await getBase64ImageFromURL("/logo_dinas.png");
    // Position: Left side of the Kop
    // x=35, y=10, w=22, h=25 (Approx matches typical kop surat ratio)
    doc.addImage(imgData, "PNG", 35, 8, 22, 25);
  } catch (err) {
    console.error("Error loading logo:", err);
    // Continue generating PDF even if logo fails
  }

  // -- KOP SURAT --
  doc.setFontSize(14);
  doc.setFont("times", "bold");
  centerText("PEMERINTAH KABUPATEN CIREBON", 15);

  doc.setFontSize(16);
  centerText("DINAS PENDIDIKAN", 23);

  doc.setFontSize(10);
  doc.setFont("times", "normal");
  centerText(
    "Jalan Sunan Drajat No. 10, Sumber, Kabupaten Cirebon, Jawa Barat 45611",
    30
  );

  doc.setLineWidth(0.5);
  doc.line(20, 35, pageWidth - 20, 35);
  doc.setLineWidth(0.1);
  doc.line(20, 36, pageWidth - 20, 36);

  // -- JUDUL SURAT --
  doc.setFontSize(11); // Reduced from 12
  doc.setFont("times", "bold");
  centerText("KEPUTUSAN KEPALA DINAS PENDIDIKAN KABUPATEN CIREBON", 42); // y adjusted up

  doc.setFont("times", "normal");
  centerText("NOMOR: 421/SK-BOS/" + year, 47); // tighter spacing

  doc.setFontSize(11);
  centerText("TENTANG", 54);
  doc.setFont("times", "bold");
  centerText(
    "PENETAPAN SEKOLAH PENERIMA BANTUAN OPERASIONAL SEKOLAH (BOS)",
    59
  );
  centerText(`KATEGORI: ${category.toUpperCase()}`, 64);
  centerText(`TAHUN ANGGARAN ${year}`, 69);

  // -- BODY TEXT --
  doc.setFontSize(11);
  doc.setFont("times", "normal");
  const introText =
    "Berdasarkan hasil analisis data pokok pendidikan (Dapodik) dan metode Clustering K-Means, " +
    "Dinas Pendidikan Kabupaten Cirebon menyajikan data pendukung (Evidence) sebagai dasar penetapan " +
    `sekolah prioritas kategori: ${category}.`;

  const splitIntro = doc.splitTextToSize(introText, pageWidth - 40);
  doc.text(splitIntro, 20, 88);

  // -- TABLE WITH EVIDENCE --
  const tableColumn = [
    "No",
    "Nama Sekolah",
    "NPSN",
    "Jml\nSiswa",
    "Jml\nGuru",
    "R. Rusak\n(Unit)",
    "Dana BOS\n(Rupiah)",
    "Kesimpulan Status",
  ];

  const tableRows = [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  data.forEach((school, index) => {
    let keterangan = "";
    if (school.cluster_label == 2) {
      keterangan = "Prioritas Utama\n(Segera)";
    } else if (school.cluster_label == 1) {
      keterangan = "Dapat\nDipertimbangkan";
    } else {
      keterangan = "Kondisi Baik";
    }

    const schoolData = [
      index + 1,
      school.nama_sekolah,
      school.npsn,
      school.jumlah_siswa || "0",
      school.jumlah_guru || "0",
      school.kondisi_fasilitas_rusak || "0", // Bukti: Jumlah Kerusakan
      formatCurrency(school.dana_bos || 0), // Bukti: Dana yang ada
      keterangan,
    ];
    tableRows.push(schoolData);
  });

  autoTable(doc, {
    startY: 100,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: "center",
      valign: "middle",
      fontSize: 9,
      font: "times",
      lineWidth: 0.1,
    },
    styles: {
      font: "times",
      fontSize: 9,
      cellPadding: 3,
      valign: "middle",
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" }, // No
      1: { cellWidth: 70 }, // Nama Sekolah
      2: { cellWidth: 25, halign: "center" }, // NPSN
      3: { cellWidth: 20, halign: "center" }, // Siswa
      4: { cellWidth: 20, halign: "center" }, // Guru
      5: { cellWidth: 25, halign: "center", fontStyle: "bold" }, // Rusak (Highlight this mostly)
      6: { cellWidth: 40, halign: "right" }, // Dana BOS
      7: { cellWidth: "auto", halign: "center", fontStyle: "bold" }, // Keterangan
    },
    margin: { left: 20, right: 20 },
  });

  // -- TANDA TANGAN --
  const finalY = doc.lastAutoTable.finalY + 20;
  const signX = pageWidth - 80; // Right aligned relative to landscape width

  // Check page break
  if (finalY > 170) {
    // Limit for landscape A4 (approx 210mm height)
    doc.addPage();
    doc.text("Ditetapkan di: Cirebon", signX, 30);
    doc.text(
      `Pada Tanggal: ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      signX,
      36
    );
    doc.text("Kepala Dinas Pendidikan", signX, 45);
    doc.text("Kabupaten Cirebon", signX, 50);

    doc.setFont("times", "bold");
    doc.text("( Nama Kepala Dinas )", signX, 80);
    doc.setFont("times", "normal");
    doc.text("NIP. 19750101 200003 1 001", signX, 85);
  } else {
    doc.text("Ditetapkan di: Cirebon", signX, finalY);
    doc.text(
      `Pada Tanggal: ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      signX,
      finalY + 6
    );
    doc.text("Kepala Dinas Pendidikan", signX, finalY + 15);
    doc.text("Kabupaten Cirebon", signX, finalY + 20);

    doc.setFont("times", "bold");
    doc.text("( Nama Kepala Dinas )", signX, finalY + 50);
    doc.setFont("times", "normal");
    doc.text("NIP. 19750101 200003 1 001", signX, finalY + 55);
  }

  // Save PDF
  doc.save(`SK_Penetapan_${category.replace(/\s/g, "_")}_${year}_Lengkap.pdf`);
};
