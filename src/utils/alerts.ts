import Swal from 'sweetalert2';

// Modern SweetAlert2 Mixin for professional notifications
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export const showSuccessToast = (title: string, text?: string) => {
  return Toast.fire({
    icon: 'success',
    title,
    text
  });
};

export const showErrorToast = (title: string, text?: string) => {
  return Toast.fire({
    icon: 'error',
    title,
    text
  });
};

export const showInfoToast = (title: string, text?: string) => {
  return Toast.fire({
    icon: 'info',
    title,
    text
  });
};

/**
 * Modern Confirm Dialog with sleek styling and Kanit font
 */
export const showConfirmDialog = async ({
  title,
  text,
  confirmButtonText = 'Sahkan',
  cancelButtonText = 'Batal',
  icon = 'warning'
}: {
  title: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
}): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#2563eb', // Blue-600
    cancelButtonColor: '#94a3b8', // Slate-400
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true
  });

  return result.isConfirmed;
};

/**
 * Modern Delete Confirm Dialog in Malay
 */
export const showDeleteConfirm = async (itemTitle: string): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Adakah anda pasti mahu memadam?',
    html: `Anda akan memadamkan rekod <b>"${itemTitle}"</b><br><span style="color:#ef4444;font-size:0.85rem;">Tindakan ini tidak boleh diundur semula.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626', // Red-600
    cancelButtonColor: '#64748b', // Slate-500
    confirmButtonText: 'Ya, Padamkan',
    cancelButtonText: 'Batal',
    reverseButtons: true
  });

  return result.isConfirmed;
};

/**
 * Professional Permission Denied Alert in Malay
 */
export const showPermissionDeniedAlert = (detail?: string) => {
  return Swal.fire({
    icon: 'error',
    title: 'Akses Ditolak',
    html: detail || 'Mengikut dasar keselamatan data kerajaan, Pegawai Tadbir Mukim hanya dibenarkan mengurus maklumat mukim masing-masing sahaja.',
    confirmButtonColor: '#2563eb',
    confirmButtonText: 'Faham'
  });
};

/**
 * Success modal with view PDF or return option in Malay
 */
export const showMeetingSavedSuccess = async (meetingNumber: string): Promise<boolean> => {
  const result = await Swal.fire({
    icon: 'success',
    title: 'Minit Mesyuarat Berjaya Disimpan!',
    html: `Mesyuarat Bil. <b>${meetingNumber}</b> telah direkodkan dengan jayanya berserta semakan kuorum dan agenda rasmi.`,
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#10b981',
    confirmButtonText: 'Buka Paparan PDF Rasmi',
    cancelButtonText: 'Kembali Ke Senarai',
    reverseButtons: false
  });

  return result.isConfirmed;
};
