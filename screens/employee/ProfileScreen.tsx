
import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User, Mail, Phone, MapPin, Briefcase, Camera, LogOut, Save, X, Hash, Edit } from 'lucide-react';
import { Employee } from '../../types';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';
import { InfoRow } from '../../components/InfoRow';

export const ProfileScreen = () => {
  const { user, updateUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatarUrl: user?.avatarUrl || ''
  });

  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({});

  useEffect(() => {
    if (!isEditing) { setErrors({}); return; }

    const phone = formData.phone || '';
    if (phone.length > 0 && (phone.length < 9 || phone.length > 15)) {
      setErrors(prev => ({ ...prev, phone: 'No. HP harus antara 9 dan 15 digit.' }));
    } else {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }

    const address = formData.address || '';
    if (address.length > 0 && address.length < 10) {
      setErrors(prev => ({ ...prev, address: 'Alamat harus memiliki minimal 10 karakter.' }));
    } else {
      setErrors(prev => ({ ...prev, address: undefined }));
    }
  }, [formData.phone, formData.address, isEditing]);

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    // You might want a toast notification here instead of alert
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      avatarUrl: user?.avatarUrl || ''
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, avatarUrl: base64String }));
        if (!isEditing) setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen w-full overflow-y-auto font-sans pb-32">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      <BackgroundPattern />

      <div className="relative z-10 p-4 pt-16">
        <div className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl">

          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="relative group cursor-pointer"
              onClick={handleAvatarClick}
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-400 to-amber-300 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
              <img
                src={isEditing && formData.avatarUrl ? formData.avatarUrl : user.avatarUrl}
                alt="Profile"
                className="relative w-24 h-24 rounded-full border-4 border-gray-800 object-cover bg-gray-600 transition-opacity group-hover:opacity-90"
              />
              <div className="absolute bottom-1 right-1 p-1.5 rounded-full bg-orange-500 text-white hover:scale-110 transition-transform z-10 flex items-center justify-center border-2 border-gray-700">
                <Camera size={14} />
              </div>
            </div>
          </div>

          <div className="pt-14 text-center animate-fade-in">
            <h2 className="text-lg font-bold text-white">{isEditing ? formData.name : user.name}</h2>
            <p className="text-xs font-medium text-white/60">{user.department}</p>
          </div>

          <div className="mt-6 space-y-3">
            <InfoRow icon={Hash} label="ID Karyawan" value={user.id} isProtected />
            <InfoRow
              icon={User}
              label="Nama Lengkap"
              value={formData.name || ''}
              isEditing={isEditing}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <InfoRow icon={Mail} label="Email" value={user.email} isProtected />
            <InfoRow
              icon={Phone}
              label="No. Telepon"
              value={formData.phone || ''}
              isEditing={isEditing}
              type="tel"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
              placeholder="Belum diisi"
              error={errors.phone}
            />
            <InfoRow
              icon={MapPin}
              label="Alamat"
              value={formData.address || ''}
              isEditing={isEditing}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Belum diisi"
              error={errors.address}
            />
            <InfoRow icon={Briefcase} label="Departemen" value={user.department} isProtected />
          </div>

          <div className="mt-6 space-y-3 pt-4 border-t border-white/10">
            {isEditing ? (
              <div className="flex space-x-3 animate-fade-in">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 font-bold flex justify-center items-center gap-2 transition-colors bg-black/20 hover:bg-black/40 active:scale-95 text-xs"
                >
                  <X size={16} /> Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={hasErrors}
                  className="flex-1 py-3 rounded-xl font-bold flex justify-center items-center gap-2 text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-900/40 text-xs"
                >
                  <Save size={16} /> Simpan
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors active:scale-95 bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white text-xs"
              >
                <Edit size={14} /> Edit Profil
              </button>
            )}

            <button
              onClick={logout}
              className="w-full py-3 rounded-xl flex justify-center items-center gap-2 font-semibold active:scale-95 bg-red-900/30 text-red-300 border border-red-500/20 hover:bg-red-900/50 hover:text-red-200 transition-colors text-xs"
            >
              <LogOut size={14} /> Keluar Aplikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
