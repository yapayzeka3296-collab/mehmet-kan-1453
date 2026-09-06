# MySkyParcel — cPanel Git çalışma sistemi

## Amaç

cPanel Git repository'sinin GitHub `main` ile güvenli şekilde güncellenmesini sağlar. cPanel tarafında `git pull` işlemi fast-forward ile sınırlı olduğunda diverging-branch hatası oluşabilir.

## Kaynak repository

GitHub: `yapayzeka3296-collab/mehmet-kan-1453`

cPanel repository: `/home/myskypar/repositories/pixel-perfect-clone-14793`

## cPanel güncelleme prosedürü

cPanel Git arayüzündeki **Update from Remote** işlemi kullanılmadan önce repository'nin remote'u GitHub `main` olmalıdır.

Kontrol:

```bash
cd /home/myskypar/repositories/pixel-perfect-clone-14793
git remote -v
git branch -vv
git status
```

Eğer cPanel yerel `main` branch'i GitHub `origin/main` ile diverged durumdaysa, cPanel'deki yerel commitlerin korunması gerekiyorsa önce yedek branch oluşturulmalıdır:

```bash
git branch cpanel-local-backup-$(date +%Y%m%d-%H%M%S)
git fetch origin
```

Yerel commitlerin korunması gerekmiyorsa GitHub `main` çalışma kaynağı kabul edilerek:

```bash
git checkout main
git reset --hard origin/main
git clean -fd
git branch --set-upstream-to=origin/main main
git pull --ff-only origin main
```

Sonuç:

```bash
git status
```

`Your branch is up to date with 'origin/main'.` görülmelidir.

## Deployment

`.cpanel.yml` yalnızca deployment görevlerini yürütür. Git geçmişini merge/rebase/force işlemleriyle değiştirmez. Deployment için `/home/myskypar/repositories/pixel-perfect-clone-14793` içindeki `.output`, `app.js` ve gerekli public dosyalarının mevcut olması zorunludur.

## Önemli güvenlik kuralı

cPanel Git çalışma dizinini düzeltmek için GitHub `main` üzerine force-push yapılmaz. Yerel cPanel commitleri kaybedilmeden önce mutlaka backup branch oluşturulur.
