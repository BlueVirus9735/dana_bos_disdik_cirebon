import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBOSData } from "../hooks/useBOSData";

// Components
import BOSHeader from "../components/bos/BOSHeader";
import BOSUploadSection from "../components/bos/BOSUploadSection";
import BOSTable from "../components/bos/BOSTable";
import BOSFormModal from "../components/bos/BOSFormModal";

import DamageViewModal from "../components/bos/DamageViewModal";

export default function DataBOS() {
  const { user } = useAuth();
  const {
    data,
    loading,
    uploading,
    fetchData,
    handleUpload,
    handleManualSubmit,
    handleVerify,
  } = useBOSData(user);

  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // View Damage Modal State
  const [viewDamageItem, setViewDamageItem] = useState(null);

  const handleViewDamage = (item) => {
    setViewDamageItem(item);
  };

  const onFileSelected = (e) => {
    setFile(e.target.files[0]);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const onUploadClick = async (e) => {
    e.preventDefault();
    const success = await handleUpload(file);
    if (success) {
      setFile(null);
    }
  };

  const onManualSubmitWrapper = async (formData, targetStatus) => {
    const dataToSend = {
      ...formData,
      status: targetStatus || formData.status || "DRAFT",
    };
    const success = await handleManualSubmit(
      dataToSend,
      isEditing,
      editItem?.id
    );
    if (success) {
      setIsModalOpen(false);
      setIsEditing(false);
      setEditItem(null);
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.nama_sekolah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.npsn.includes(searchTerm)
  );

  return (
    <div className="p-2 max-w-7xl mx-auto space-y-8 min-h-screen transition-colors duration-300">
      <BOSHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={fetchData}
        onAddManual={() => {
          setIsEditing(false);
          setEditItem(null);
          setIsModalOpen(true);
        }}
        userRole={user?.role}
        isRefreshing={loading}
      />

      {file && (
        <BOSUploadSection
          file={file}
          onUpload={onUploadClick}
          isUploading={uploading}
        />
      )}

      <BOSTable
        data={filteredData}
        loading={loading}
        user={user}
        onEdit={handleEdit}
        onVerify={handleVerify}
        onViewDamage={handleViewDamage}
      />

      <BOSFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onManualSubmitWrapper}
        isEditing={isEditing}
        initialData={editItem}
        user={user}
      />

      <DamageViewModal
        isOpen={!!viewDamageItem}
        onClose={() => setViewDamageItem(null)}
        data={viewDamageItem}
      />
    </div>
  );
}
