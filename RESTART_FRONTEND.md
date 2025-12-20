# 🚀 Frontend'i Yeniden Başlatma Kılavuzu

## Adım 1: Çalışan Frontend'i Durdurun

### Terminal'de Frontend Çalışıyorsa:

1. Frontend'in çalıştığı terminal penceresine gidin
2. **Ctrl + C** tuşlarına basın
3. "Terminate batch job (Y/N)?" sorusu gelirse **Y** yazıp Enter'a basın

### Eğer Terminal Kapalıysa veya Bulamıyorsanız:

**Windows PowerShell'de:**
```powershell
# Node.js process'lerini bul
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

**Veya Task Manager ile:**
1. **Ctrl + Shift + Esc** ile Task Manager'ı açın
2. "Node.js" veya "node" process'ini bulun
3. Sağ tıklayıp "End task" seçin

---

## Adım 2: Frontend Klasörüne Gidin

**PowerShell veya Command Prompt'ta:**
```powershell
cd C:\Users\hassan\kar-zarar-uygulamasi\frontend
```

**Veya proje root klasöründen:**
```powershell
cd frontend
```

---

## Adım 3: Frontend'i Başlatın

```powershell
npm run dev
```

**Başarılı olursa şunu göreceksiniz:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## Adım 4: Tarayıcıda Kontrol Edin

Tarayıcınızda şu adresi açın:
```
http://localhost:3000
```

**Göreceğiniz:**
- ✅ Bina görseli arka planda
- ✅ Kontrol paneli alt kısımda
- ✅ Hata mesajı OLMAMALI

---

## ⚠️ Hala Hata Varsa

Eğer hala Tailwind hatası alıyorsanız:

1. **Cache'i temizleyin:**
```powershell
cd C:\Users\hassan\kar-zarar-uygulamasi\frontend
Remove-Item -Path ".vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
```

2. **Node modules'ü yeniden yükleyin:**
```powershell
Remove-Item -Path "node_modules" -Recurse -Force
npm install
```

3. **Tekrar başlatın:**
```powershell
npm run dev
```

---

## 🎯 Hızlı Komutlar (Tek Seferde)

**Tümünü temizleyip yeniden başlatmak için:**
```powershell
cd C:\Users\hassan\kar-zarar-uygulamasi\frontend
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".vite" -Recurse -Force -ErrorAction SilentlyContinue
npm run dev
```



