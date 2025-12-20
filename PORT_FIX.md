# 🔧 Port Sorunu Çözümü

## Sorun
- Port 3000 kullanımda
- Port 3001 backend tarafından kullanılıyor
- Port 3002 de kullanımda

## Çözüm
Frontend portu **3003** olarak değiştirildi.

## Yeni Adres
Frontend artık şu adreste çalışacak:
```
http://localhost:3003
```

## Kullanım
1. Frontend'i başlatın:
   ```powershell
   cd C:\Users\hassan\kar-zarar-uygulamasi\frontend
   npm run dev
   ```

2. Tarayıcıda açın:
   ```
   http://localhost:3003
   ```

## Portları Temizlemek İçin

Tüm Node.js process'lerini durdurmak için:
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

## Port Kullanımını Kontrol Etmek İçin

```powershell
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3001"
netstat -ano | findstr ":3003"
```



