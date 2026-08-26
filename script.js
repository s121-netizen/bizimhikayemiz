    const firebaseConfig = {
        apiKey: "AIzaSyCVufVE2sG5-qSFt3G_pt8TnE-qo6hj7eM",
        authDomain: "project-6700528244363532387.firebaseapp.com",
        databaseURL: "https://project-6700528244363532387-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "project-6700528244363532387",
        storageBucket: "project-6700528244363532387.firebasestorage.app",
        messagingSenderId: "524187994352",
        appId: "1:524187994352:web:8688a70183fab05cc6da35",
        measurementId: "G-B54QMGT2KZ"
    };
    try {
        firebase.initializeApp(firebaseConfig);
        window.akDB = firebase.database();
    } catch (e) {
        console.warn("Firebase başlatılamadı, sıralama sadece bu cihazda çalışacak:", e);
        window.akDB = null;
    }

(function(){
    let todoVeri = {};

    function todoRef(){
        return window.akDB ? window.akDB.ref("yapilacaklar") : null;
    }

    window.openTodoModu = function(){
        document.getElementById("todo-modal").style.display = "block";
        document.body.classList.add("modal-open");
        const ref = todoRef();
        if(!ref){
            document.getElementById("todo-list").innerHTML =
                "<div style='opacity:0.6;font-size:13px;text-align:center;padding:20px 0;'>bağlantı yok, liste yüklenemiyor 🥺</div>";
            return;
        }
        ref.on("value", snap=>{
            todoVeri = snap.val() || {};
            renderTodoListesi();
        });
    };

    window.closeTodoModu = function(){
        document.getElementById("todo-modal").style.display = "none";
        const ref = todoRef();
        if(ref) ref.off();
        if(document.getElementById("gunluk-modal").style.display === "none" &&
           document.getElementById("kitap-modal").style.display === "none"){
            document.body.classList.remove("modal-open");
        }
    };

    window.closeTodoOnBackdrop = function(e){
        if(e.target === document.getElementById("todo-modal")) closeTodoModu();
    };

    function renderTodoListesi(){
        const list = document.getElementById("todo-list");
        const keys = Object.keys(todoVeri).sort((a,b)=> (todoVeri[a].sira||0) - (todoVeri[b].sira||0));

        if(keys.length === 0){
            list.innerHTML = "<div style='opacity:0.5;font-size:13px;text-align:center;padding:20px 0;'>henüz bir şey eklenmedi, aşağıdan ekleyebilirsin 🎒</div>";
        } else {
            list.innerHTML = keys.map(k=>{
                const item = todoVeri[k];
                const done = !!item.tamamlandi;
                return `
                <div style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:14px;
                    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);">
                    <div onclick="todoToggle('${k}')" style="
                        width:24px; height:24px; flex-shrink:0; border-radius:8px; cursor:pointer;
                        display:flex; align-items:center; justify-content:center; font-size:15px;
                        border:1.5px solid ${done ? 'rgba(123,44,191,0.8)' : 'rgba(255,255,255,0.3)'};
                        background:${done ? 'rgba(123,44,191,0.6)' : 'transparent'};
                        transition: all 0.2s ease;
                    ">${done ? '✓' : ''}</div>
                    <div style="flex:1; font-size:14px; ${done ? 'opacity:0.45; text-decoration:line-through;' : ''}">${escapeHtmlTodo(item.metin || '')}</div>
                    <div onclick="todoSil('${k}')" style="
                        width:26px; height:26px; flex-shrink:0; border-radius:8px; cursor:pointer;
                        display:flex; align-items:center; justify-content:center; font-size:14px; opacity:0.5;
                    ">🗑️</div>
                </div>`;
            }).join("");
        }

        const toplam = keys.length;
        const biten = keys.filter(k=> todoVeri[k].tamamlandi).length;
        document.getElementById("todo-progress-label").textContent =
            toplam === 0 ? "liste boş" : (biten + " / " + toplam + " tamamlandı");
    }

    function escapeHtmlTodo(str){
        const d = document.createElement("div");
        d.textContent = str;
        return d.innerHTML;
    }

    window.todoEkle = function(){
        const ref = todoRef();
        if(!ref){ alert("bağlantı yok"); return; }
        const input = document.getElementById("todo-input");
        const metin = input.value.trim();
        if(!metin) return;
        const yeniRef = ref.push();
        yeniRef.set({
            metin: metin,
            tamamlandi: false,
            sira: Date.now()
        }).then(()=>{
            input.value = "";
            input.focus();
        }).catch(err=> alert("eklenemedi: " + err.message));
    };

    window.todoToggle = function(key){
        const ref = todoRef();
        if(!ref) return;
        const item = todoVeri[key];
        if(!item) return;
        ref.child(key).update({ tamamlandi: !item.tamamlandi });
    };

    window.todoSil = function(key){
        const ref = todoRef();
        if(!ref) return;
        ref.child(key).remove();
    };
})();

let slideSpeed = 3000;
let __lastHeartTap = 0;
let heartRainTimer = null;

// --- CİHAZ YETKİLENDİRME ---
(function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('anahtar') === 'aktif') {
        localStorage.setItem("ak_trusted_device", "true");
        alert("Cihazın başarıyla yetkilendirildi aşkım! 💜");
        window.history.replaceState({}, document.title, window.location.pathname);
    }
})();

// --- ŞİFRE KONTROLÜ ---
const MY_SECRET = "1046km";
const START_DATE = new Date("2025-11-28T19:58:00");

// --- DOĞUM GÜNÜ AYARI (İSTERSEN DEĞİŞTİR) ---
const BDAY_DAY = 3;      // gün (1-31)
const BDAY_MONTH = 3;    // ay (1-12)  -> Mart = 3

function isBirthdayToday(){
    const d = new Date();
    return (d.getDate() === BDAY_DAY && (d.getMonth()+1) === BDAY_MONTH);
}

// --- YURDA DÖNÜŞ / KAVUŞMA SAYACI (14 Eylül 2026) ---
const REUNION_DATE = new Date("2026-09-14T00:00:00");
let __reunionThemeApplied = false;

function applyReunionTheme(){
    if(__reunionThemeApplied) return;
    __reunionThemeApplied = true;
    document.body.classList.add("reunion-mode");
    const container = document.getElementById("reunion-container");
    if(container) container.classList.add("kavustuk");
    const h1 = document.getElementById("main-h1");
    if(h1) h1.innerHTML = "kavuştuk 🩶💜<br>artık aynı şehirdeyiz";
    const sub = document.getElementById("main-subtitle");
    if(sub) sub.textContent = "beklemek bitti, şimdi biz varız.";
    // kalp yağmurunu hızlandır (eski interval'ı durdurup tekini çalıştırır)
    if(typeof setHeartRainRate === "function"){
        setHeartRainRate(250);
    }
}

function updateReunionCountdown(){
    const el = document.getElementById("reunion-timer");
    const sub = document.getElementById("reunion-sub");
    if(!el) return;
    const diff = REUNION_DATE.getTime() - Date.now();

    if(diff <= 0){
        el.classList.add("kavustuk-text");
        el.textContent = "BUGÜN KAVUŞUYORUZ. 🩶💜";
        if(sub) sub.textContent = "artık saymaya gerek yok.";
        applyReunionTheme();
        return;
    }

    const gun = Math.floor(diff / 86400000);
    const saat = Math.floor((diff % 86400000) / 3600000);
    const dk = Math.floor((diff % 3600000) / 60000);
    const sn = Math.floor((diff % 60000) / 1000);

    el.innerHTML =
        '<span class="ru-num">' + gun + '</span> gün ' +
        '<span class="ru-num">' + String(saat).padStart(2,"0") + '</span> saat ' +
        '<span class="ru-num">' + String(dk).padStart(2,"0") + '</span> dakika ' +
        '<span class="ru-num">' + String(sn).padStart(2,"0") + '</span> saniye';
}

function showBirthday(){
    const el = document.getElementById("birthday-surprise");
    if(el) el.style.display = "flex";
}

function closeBirthday(){
    const el = document.getElementById("birthday-surprise");
    if(el) el.style.display = "none";
    startConfetti();
}

function startConfetti(){
    for(let i=0;i<90;i++){
        const conf = document.createElement("div");
        conf.textContent = (Math.random()<0.5 ? "🎉" : "✨");
        conf.style.position = "fixed";
        conf.style.left = (Math.random()*100) + "vw";
        conf.style.top = "-60px";
        conf.style.fontSize = (Math.random()*10 + 16) + "px";
        conf.style.animation = "fall " + (Math.random()*1.5 + 2.2) + "s linear forwards";
        conf.style.zIndex = "99999";
        document.body.appendChild(conf);
        setTimeout(()=>conf.remove(), 4200);
    }
}

function openBdayCard(){
    const m = document.getElementById("bday-card-modal");
    if(m){ m.classList.add("show"); m.setAttribute("aria-hidden","false"); }
}
function closeBdayCard(){
    const m = document.getElementById("bday-card-modal");
    if(m){ m.classList.remove("show"); m.setAttribute("aria-hidden","true"); }
}


// --- 1. CİHAZ YETKİ KONTROLÜ (URL'den ?anahtar=aktif gelirse) ---
(function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('anahtar') === 'aktif') {
        localStorage.setItem("ak_trusted_device", "true");
        alert("Cihazın başarıyla yetkilendirildi aşkım! 💜");
        window.history.replaceState({}, document.title, window.location.pathname);
    }
})();

// --- 2. GÜNCEL ŞİFRE VE ÇIKIŞ FONKSİYONLARI ---
function checkPass() {
    const inputEl = document.getElementById("pass-input");
    const val = inputEl ? inputEl.value.trim() : "";
    const isTrusted = localStorage.getItem("ak_trusted_device");

    if (val === MY_SECRET) {
        if (isTrusted === "true") {
            // Şifre doğru ve cihaz yetkili -> Giriş Yap
            executeLogin(); 
        } else {
            // Şifre doğru ama anahtar yok
            alert("Bu cihaz yetkilendirilmemiş . Önce sana gönderdiğim özel linke tıklamalısın! 🔐");
        }
    } else {
        const err = document.getElementById("error-msg");
        if (err) err.style.display = "block";
    }
}

function logout() {
    if (confirm("Çıkış yapmak ve bu cihazın yetkisini kaldırmak istediğine emin misin ?")) {
        // Tarayıcıdaki güvenli cihaz anahtarını siler
        localStorage.removeItem("ak_trusted_device");
        alert("Yetki kaldırıldı. Tekrar girmek için özel linke ihtiyacın olacak. 🔒");
        // Sayfayı yenileyerek şifre ekranına geri gönderir
        window.location.reload();
    }
}

// Giriş animasyonunu ve sayaçları başlatan fonksiyon
function executeLogin() {
    const overlay = document.getElementById("login-overlay");
    const content = document.getElementById("main-content");
    overlay.style.opacity = "0";
    setTimeout(() => {
        overlay.style.display = "none";
        content.style.opacity = "1";
        document.body.classList.add('logged-in');
        
        showWelcomeToast();
        updateLiveTimer();
        setInterval(updateLiveTimer, 1000);

        updateReunionCountdown();
        setInterval(updateReunionCountdown, 1000);
        
        if (typeof updateFooterDate === "function") updateFooterDate();
        if (typeof startHeartRain === "function") startHeartRain();
        
        // 🔥 İŞTE BURAYA EKLEDİK: Giriş yapıldığı an cache sistemini başlatıyoruz
        startOfflineCaching(); 
        
    }, 800);
}

// --- 3. ÇIKIŞ YAPMA FONKSİYONU ---
function logout() {
    if (confirm("Çıkış yapmak ve bu cihazın yetkisini kaldırmak istediğine emin misin a?")) {
        localStorage.removeItem("ak_trusted_device");
        alert("Yetki kaldırıldı. Tekrar girmek için özel linke ihtiyacın olacak. 🔒");
        window.location.reload(); // Sayfayı yenileyerek şifre ekranına döndürür
    }
}


let showTotalDaysOnly = false; // Format durumunu tutan değişken

let timerFormatMode = 0; 
// 0 = yıl/ay/gün
// 1 = sadece toplam gün
// 2 = gün + saat:dakika:saniye

function toggleTimerFormat() {
    timerFormatMode = (timerFormatMode + 1) % 3;

    updateLiveTimer(); // Hemen güncelle

    // Kalp efekti
    if (typeof noteBurstHearts === "function") {
        const rect = document.getElementById("live-timer").getBoundingClientRect();
        noteBurstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
}

function updateLiveTimer() {
    const now = new Date();
    const diff = now - START_DATE;

    // 2. MOD → Gün + Saat
    if (timerFormatMode === 2) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        document.getElementById("live-timer").innerText =
            `${days} gün ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // 1. MOD → Sadece toplam gün
    } else if (timerFormatMode === 1) {

        const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById("live-timer").innerText = `${totalDays} GÜN`;

    // 0. MOD → Yıl / Ay / Gün
    } else {

        let years = now.getFullYear() - START_DATE.getFullYear();
        let months = now.getMonth() - START_DATE.getMonth();
        let days = now.getDate() - START_DATE.getDate();

        if (days < 0) {
            months--;
            let lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += lastMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        let result = "";

        if (years > 0) result += `${years} yıl `;
        if (months > 0 || years > 0) result += `${months} ay `;
        result += `${days} gün`;

        document.getElementById("live-timer").innerText = result;
    }
}

    const HEART_MAX_ACTIVE = 14; // aynı anda ekranda olabilecek maksimum kalp (mobilde DOM/GPU yükünü sınırlar)
    let __activeHeartCount = 0;

    function createHeart() {
        if(__activeHeartCount >= HEART_MAX_ACTIVE) return; // limit doluysa bu turu atla

        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.innerHTML = isBirthdayToday() ? "🎈" : "❤️";
        heart.style.left = Math.random() * 95 + "vw";
        heart.style.fontSize = (Math.random() * 10 + 12) + "px";
        heart.style.animationDuration = Math.random() * 3 + 4 + "s";
        __activeHeartCount++;
        let __heartCounted = true;
        function __releaseHeart(){
            if(__heartCounted){ __heartCounted = false; __activeHeartCount = Math.max(0, __activeHeartCount - 1); }
        }

        heart.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            __lastHeartTap = Date.now();

            const k = document.createElement("div");
            k.classList.add("k-pop");
            k.innerText = "K";
            k.style.left = e.clientX + "px";
            k.style.top = e.clientY + "px";
            document.body.appendChild(k);
            heart.remove();
            __releaseHeart();
            setTimeout(() => k.remove(), 1000);
        }, { capture: true });


// Mobilde dokunma desteği
        heart.addEventListener("touchstart", (e) => {
            // passive:false gerekir ki preventDefault çalışsın
            e.preventDefault();
            e.stopPropagation();
            __lastHeartTap = Date.now();

            const touch = e.touches[0];
            const k = document.createElement("div");
            k.classList.add("k-pop");
            k.innerText = "K";
            k.style.left = touch.clientX + "px";
            k.style.top = touch.clientY + "px";
            document.body.appendChild(k);
            heart.remove();
            __releaseHeart();
            setTimeout(() => k.remove(), 1000);
        }, { passive: false, capture: true });

document.body.appendChild(heart);
        setTimeout(() => { if(heart.parentNode) heart.remove(); __releaseHeart(); }, 6000);
    }

    function startHeartRain() { heartRainTimer = setInterval(createHeart, 600); }
    function setHeartRainRate(ms){ if(heartRainTimer) clearInterval(heartRainTimer); heartRainTimer = setInterval(createHeart, ms); }

    let currentIdx = 0;
    const imgs = document.querySelectorAll(".gallery-item img");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");

    imgs.forEach((img, i) => {
        img.onclick = () => { currentIdx = i; openLightbox(); };
    });

    // ---- GALERİ FAVORİ SİSTEMİ (localStorage) ----
    const FAV_KEY = "ak_galeri_favoriler";
    const favBtnMap = {}; // src -> galeri kartındaki kalp butonu

    function getFavorites() {
        try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
        catch (e) { return []; }
    }

    function saveFavorites(list) {
        localStorage.setItem(FAV_KEY, JSON.stringify(list));
    }

    window.isFavorite = function (src) {
        return getFavorites().includes(src);
    };

    function playFavPop(btn) {
        if (!btn) return;
        btn.classList.remove('fav-pop');
        void btn.offsetWidth; // reflow, animasyonu yeniden tetikler
        btn.classList.add('fav-pop');
    }

    function paintFavBtn(btn, fav) {
        if (!btn) return;
        btn.classList.toggle('is-fav', fav);
        btn.textContent = fav ? '❤️' : '🤍';
    }

    // src: img'in getAttribute('src') değeri (favoriler bu anahtarla saklanır)
    window.toggleFavorite = function (src) {
        let favs = getFavorites();
        const idx = favs.indexOf(src);
        const nowFav = idx === -1;
        if (idx > -1) favs.splice(idx, 1); else favs.push(src);
        saveFavorites(favs);

        // galeri kartındaki kalp
        const gridBtn = favBtnMap[src];
        paintFavBtn(gridBtn, nowFav);
        playFavPop(gridBtn);

        // lightbox açıksa ve şu an gösterilen resimse, oradaki kalp de güncellensin
        const lbBtn = document.getElementById('lightbox-fav-btn');
        if (lbBtn && imgs[currentIdx] && imgs[currentIdx].getAttribute('src') === src) {
            paintFavBtn(lbBtn, nowFav);
            playFavPop(lbBtn);
        }
    };

    // Lightbox'taki kalp butonuna basılınca çalışır
    window.toggleLightboxFavorite = function () {
        const img = imgs[currentIdx];
        if (!img) return;
        toggleFavorite(img.getAttribute('src'));
    };

    // Lightbox açılırken / resim değişirken kalp ikonunu güncel resme göre ayarla
    function syncLightboxFavBtn() {
        const lbBtn = document.getElementById('lightbox-fav-btn');
        const img = imgs[currentIdx];
        if (!lbBtn || !img) return;
        paintFavBtn(lbBtn, isFavorite(img.getAttribute('src')));
    }

    document.querySelectorAll('.gallery-item').forEach(item => {
        const img = item.querySelector('img');
        if (!img) return;
        const src = img.getAttribute('src');
        const favBtn = document.createElement('div');
        favBtn.className = 'gallery-fav-btn' + (isFavorite(src) ? ' is-fav' : '');
        favBtn.textContent = isFavorite(src) ? '❤️' : '🤍';
        favBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(src);
        };
        item.appendChild(favBtn);
        favBtnMap[src] = favBtn;
    });

    function openLightbox() {
        lightbox.style.display = "flex";
        lightboxImg.src = imgs[currentIdx].src;
        syncLightboxDate(currentIdx);
        syncLightboxFavBtn();
        updateAutoplayBtn();
        startAutoSlide();
        const tb = document.getElementById('theme-toggle-btn');
        const tp = document.getElementById('theme-picker');
        if (tb) tb.style.display = 'none';
        if (tp) { tp.style.display = 'none'; tp.classList.remove('open'); }
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        stopAutoSlide();
        const tb = document.getElementById('theme-toggle-btn');
        if (tb) tb.style.display = 'flex';
    }

    function changeImage(dir) {
        const img = document.getElementById('lightbox-img');
        img.classList.add('img-fade-out');
        setTimeout(()=>{ img.classList.remove('img-fade-out'); }, 200);
        currentIdx = (currentIdx + dir + imgs.length) % imgs.length;
        lightboxImg.src = imgs[currentIdx].src;
        syncLightboxDate(currentIdx);
        syncLightboxFavBtn();
    }



    // --- SWIPE DESTEK (TELEFONDA PARMAKLA KAYDIR) ---
    (function () {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox) return;

        let touchstartX = 0;
        let touchendX = 0;

        lightbox.addEventListener("touchstart", (e) => {
            touchstartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener("touchend", (e) => {
            touchendX = e.changedTouches[0].screenX;
            const diff = touchstartX - touchendX;

            // sola kaydır -> sonraki, sağa kaydır -> önceki
            if (diff > 50) changeImage(1);
            if (diff < -50) changeImage(-1);
        }, { passive: true });
    })();
    
let noteIndex = 0;

const loveNotes = [
"sen benim en güzel tesadüfümsün 💜",
"her şey değişir ama sana olan sevgim asla 🤍",
"kalbimin en güzel yeri senin isminle atıyor 💜",
"mesafeler var ama hislerimiz yan yana 🤍",
"gülüşün dünyamın en güzel manzarası 💜",
"iyi ki hayatıma girdin 🤍",
"seninle her şey daha anlamlı 💜",
"kalbimin ritmi seninle aynı 🤍",
"en güzel hayalim sensin 💜",
"sen benim huzurumsun 🤍",
"yıldızlara baktığımda aklıma sen geliyorsun 💜",
"sesin bile içimi ısıtıyor 🤍",
"yanımda olmasan da kalbimdesin 💜",
"seninle geçen her saniye değerli 🤍",
"kalbimin tek sahibi sensin 💜",
"günümü aydınlatan tek şey sensin 🤍",
"seni düşünmek bile mutluluk 💜",
"her duamda adın var 🤍",
"sonsuza kadar sen 💜",
"SENİ ÇOK SEVİYORUM SEVGİLİM ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️"
];

function generateNote() {
    const d = document.getElementById("note-display");
    d.style.opacity = 0;

    setTimeout(() => {

        d.innerText = loveNotes[noteIndex];

        // Önce glow'u temizle
        d.classList.remove("glow-love");

        // 🎨 Renk sistemi
        if (noteIndex % 2 === 0) {
            d.style.color = "#b57edc"; // mor
        } else {
            d.style.color = "#bfbfbf"; // gri
        }

        // 🔥 20. nota özel efekt
        if (noteIndex === 19) {
            d.style.fontSize = "24px";
            d.style.fontWeight = "800";
            d.style.letterSpacing = "1px";
            d.style.color = "#ff4d6d";
            d.classList.add("glow-love");
        } else {
            d.style.fontSize = "16px";
            d.style.fontWeight = "400";
            d.style.letterSpacing = "0px";
        }

        d.style.opacity = 1;

        noteIndex++;
        if (noteIndex >= loveNotes.length) {
            noteIndex = 0;
        }

    }, 300);
}






    // --- TIKLAYINCA MOR/GRİ KALP (GALERİYİ BOZMADAN) ---
    (function () {
        if (window.__tapHeartsAdded) return;
        window.__tapHeartsAdded = true;

        const colors = ["#8e44ad", "#b0b0b0"]; // mor, gri

        function spawnTapHeart(x, y) {
            const h = document.createElement("div");
            h.className = "tap-heart";
            h.textContent = isBirthdayToday() ? "🎈" : "❤";
            h.style.left = x + "px";
            h.style.top = y + "px";
            h.style.color = colors[Math.floor(Math.random() * colors.length)];
            h.style.fontSize = (14 + Math.random() * 8) + "px";
            document.body.appendChild(h);
            setTimeout(() => h.remove(), 1500);
        }

        document.addEventListener("click", function (e) {
            // yağan kalbe tıklayınca K çıkıyor — normal kalp spawn etme
            if (Date.now() - __lastHeartTap < 450) return;
            // login ekranında olmasın
            if (e.target.closest("#login-overlay")) return;

            // galeri / lightbox tıklamalarını hiç elleme
            if (e.target.closest(".gallery") || e.target.closest("#lightbox") || e.target.closest(".gallery-item")) return;

            // input/button/link tıklamalarında olmasın
            if (e.target.closest("button") || e.target.closest("input") || e.target.closest("a")) return;

            // yağan kalbe tıklayınca K çıkıyor — onu bozma
            if (e.target.closest(".heart")) return;

            spawnTapHeart(e.clientX, e.clientY);
        }, { passive: true });
    })();

function syncLightboxDate(index) {
        const dates = document.querySelectorAll(".gallery-date");
        const lbDate = document.getElementById("lightbox-date");
        if (!lbDate) return;
        if (dates && dates[index]) lbDate.innerText = dates[index].innerText;
        else lbDate.innerText = "";
    }


    function showWelcomeToast() {
        const t = document.getElementById("welcome-toast");
        if (!t) return;
        t.classList.remove("show");
        void t.offsetWidth; // restart anim
        t.classList.add("show");
    }

    function noteBurstHearts(x, y) {
    // Ana büyük kalp
    const big = document.createElement("div");
    big.className = "note-heart";
    big.textContent = "❤️";
    big.style.position = "fixed"; // Garantiye almak için
    big.style.left = x + "px";
    big.style.top = y + "px";
    big.style.fontSize = "40px";
    big.style.zIndex = "100000";
    document.body.appendChild(big);
    setTimeout(() => big.remove(), 950);

    // Etrafa saçılan küçük kalpler
    const count = 15; // Sayıyı biraz artırdım daha belirgin olsun
    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "note-heart-p";
        p.textContent = Math.random() > 0.5 ? "💜" : "🩶"; // Senin renklerin

        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 100;

        const x0 = x;
        const y0 = y;
        const x1 = x0 + Math.cos(angle) * dist;
        const y1 = y0 + Math.sin(angle) * dist;

        p.style.position = "fixed";
        p.style.zIndex = "100000";
        p.style.left = "0px";
        p.style.top = "0px";
        p.style.setProperty("--x0", `${x0}px`);
        p.style.setProperty("--y0", `${y0}px`);
        p.style.setProperty("--x1", `${x1}px`);
        p.style.setProperty("--y1", `${y1}px`);
        p.style.fontSize = (15 + Math.random() * 15) + "px";

        document.body.appendChild(p);
        p.addEventListener("animationend", () => p.remove());
    }
}

    let autoSlideTimer = null;
    let autoSlideResumeTimer = null;

    function startAutoSlide() {
        if (!autoplayEnabled) return;
        stopAutoSlide();
        autoSlideTimer = setInterval(() => {
            const lb = document.getElementById("lightbox");
            if (lb && lb.style.display === "flex") changeImage(1);
        }, slideSpeed);
    }

    function stopAutoSlide() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
        autoSlideTimer = null;
        if (autoSlideResumeTimer) clearTimeout(autoSlideResumeTimer);
        autoSlideResumeTimer = null;
    }

    function pauseThenResumeAutoSlide() {
        stopAutoSlide();
        autoSlideResumeTimer = setTimeout(() => startAutoSlide(), 4000);
    }

    // --- AUTO SLIDE ETKİLEŞİM: dokununca dur, sonra devam ---
    ["click","touchstart","keydown"].forEach(ev => {
        document.addEventListener(ev, (e) => {
            if (e.target && e.target.closest && e.target.closest("#login-overlay")) return;
            if (e.target && e.target.closest && e.target.closest("#lightbox")) return;
            pauseThenResumeAutoSlide();
        }, { passive: true });
    });

    // --- GALERİ OTOMATİK KAYDIR AÇ/KAPA ---
    let autoplayEnabled = false;

    function updateAutoplayBtn(){
        const btn = document.getElementById("autoplay-btn");
        if(!btn) return;
        btn.textContent = autoplayEnabled ? "otomatik: açık" : "otomatik: kapalı";
        btn.classList.toggle("off", !autoplayEnabled);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("autoplay-btn");
        if(!btn) return;
        updateAutoplayBtn();
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            autoplayEnabled = !autoplayEnabled;
            updateAutoplayBtn();
            if (autoplayEnabled) startAutoSlide();
            else stopAutoSlide();
        });
    });

    document.addEventListener("DOMContentLoaded", () => {
        const speedBtns = document.querySelectorAll("#speed-controls button");
        speedBtns.forEach(btn => {
            btn.addEventListener("click", (e)=>{
                speedBtns.forEach(b=>b.classList.remove("active"));
                btn.classList.add("active");
                slideSpeed = parseInt(btn.dataset.speed);
                if(autoplayEnabled){
                    stopAutoSlide();
                    startAutoSlide();
                }
            });
        });
    });

    // iOS/Android ghost click önleme: kalbe dokununca hemen ardından gelen click'i yeme
    document.addEventListener("touchend", (e) => {
        if (e.target && e.target.closest && e.target.closest(".heart")) {
            __lastHeartTap = Date.now();
        }
    }, { passive: true });

// ===== MINI OYUNLAR (FINAL - offline + localStorage) =====
(function(){
  const LS_KEY = "ak_mini_games_v2";

  const modal = () => document.getElementById("mini-game-modal");
  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  function load(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      const data = raw ? JSON.parse(raw) : { players:{} , lastName:"" };
      if(!data.players) data.players = {};
      return data;
    }catch(e){
      return { players:{}, lastName:"" };
    }
  }
  function save(data){
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }
  function normName(n){
    return (n||"").trim().slice(0,18);
  }

  // ---- Firebase (paylaşımlı sıralama) ----
  const FB_PATH = "leaderboard/players";
  // Firebase Realtime Database key'lerinde . # $ [ ] / kullanılamaz
  function fbKey(name){
    return encodeURIComponent(name).replace(/[.#$\[\]]/g, "_");
  }
  let cloudPlayers = null;   // Firebase'den gelen son veri (null = henüz yüklenmedi)
  let cloudReady = false;    // Firebase bağlantısı en az 1 kez veri verdi mi

  function startCloudSync(onUpdate){
    if(!window.akDB){ return; }
    try{
      window.akDB.ref(FB_PATH).on("value", (snap)=>{
        cloudPlayers = snap.val() || {};
        cloudReady = true;
        if(typeof onUpdate === "function") onUpdate();
      }, (err)=>{
        console.warn("Sıralama okunamadı (Firebase):", err);
        cloudReady = false;
      });
    }catch(e){
      console.warn("Firebase sıralama bağlantı hatası:", e);
    }
  }

  // ---- UI refs (lazy) ----
  function refs(){
    return {
      nameInput: q("#mg-name"),
      saveName: q("#mg-save-name"),
      nameOk: q("#mg-name-ok"),
      tabs: qa(".mg-tab"),
      panels: qa(".mg-panel"),
      // click hearts
      chArea: q("#ch-area"),
      chStart: q("#ch-start"),
      chStop: q("#ch-stop"),
      chScore: q("#ch-score"),
      chTime: q("#ch-time"),
      // memory
      mmGrid: q("#mm-grid"),
      mmStart: q("#mm-start"),
      mmMoves: q("#mm-moves"),
      mmTime: q("#mm-time"),
      // quiz
      qBox: q("#q-box"),
      qStart: q("#q-start"),
      qScore: q("#q-score"),
      qStep: q("#q-step"),
      // leaderboard
      lbClick: q("#lb-click"),
      lbMemory: q("#lb-memory"),
      lbQuiz: q("#lb-quiz"),
      lbClear: q("#lb-clear"),
    };
  }

  let currentName = "";
  let inited = false;

  function ensureInit(){
    if(inited) return;
    inited = true;
    const R = refs();
    const data = load();

    // restore last name
    if(data.lastName){
      currentName = data.lastName;
      if(R.nameInput) R.nameInput.value = data.lastName;
      if(R.nameOk) R.nameOk.textContent = `hazır: ${data.lastName} ✅`;
    }

    // tabs
    function activateTab(key){
      R.tabs.forEach(t=>{
        const on = t.dataset.tab === key;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true":"false");
      });
      R.panels.forEach(p=> p.classList.toggle("active", p.dataset.panel === key));
      if(key === "board") renderBoards();
    }
    R.tabs.forEach(t=> t.addEventListener("click", ()=> activateTab(t.dataset.tab)));

    // name save
    function setName(n){
      const name = normName(n);
      if(!name){
        R.nameOk.textContent = "bir isim yaz 😉";
        return false;
      }
      const d = load();
      if(!d.players[name]) d.players[name] = { click:0, memory:0, quiz:0, updatedAt: Date.now() };
      d.lastName = name;
      d.players[name].updatedAt = Date.now();
      save(d);
      currentName = name;
      R.nameOk.textContent = `kaydedildi: ${name} ✅`;

      // Firebase: oyuncuyu paylaşımlı sıralamada da oluştur/güncelle
      if(window.akDB){
        const ref = window.akDB.ref(`${FB_PATH}/${fbKey(name)}`);
        ref.transaction((cur)=>{
          if(cur) { cur.name = name; return cur; }
          return { name, click:0, memory:0, quiz:0, updatedAt: Date.now() };
        }, (err)=>{ if(err) console.warn("Firebase isim kaydı hatası:", err); });
      }

      renderBoards();
      return true;
    }

    R.saveName.addEventListener("click", ()=> setName(R.nameInput.value));
    R.nameInput.addEventListener("keydown", (e)=>{
      if(e.key === "Enter"){ e.preventDefault(); setName(R.nameInput.value); }
    });

    function updateScore(mode, value){
      const d = load();
      if(!currentName){
        R.nameOk.textContent = "önce ismini kaydet 😉";
        activateTab("board");
        return;
      }
      if(!d.players[currentName]) d.players[currentName] = { click:0, memory:0, quiz:0, updatedAt: Date.now() };
      d.players[currentName][mode] = Math.max(d.players[currentName][mode]||0, value);
      d.players[currentName].updatedAt = Date.now();
      save(d);

      // Firebase: paylaşımlı sıralamaya en iyi skoru yaz (transaction = çarpışma güvenli)
      if(window.akDB){
        const name = currentName;
        const ref = window.akDB.ref(`${FB_PATH}/${fbKey(name)}`);
        ref.transaction((cur)=>{
          const c = cur || { name, click:0, memory:0, quiz:0, updatedAt:0 };
          c.name = name;
          c[mode] = Math.max(c[mode]||0, value);
          c.updatedAt = Date.now();
          return c;
        }, (err)=>{ if(err) console.warn("Firebase skor yazma hatası:", err); });
      }

      renderBoards();
    }

    // leaderboard
    function topList(mode){
      let players;
      if(cloudReady && cloudPlayers){
        players = cloudPlayers;
      }else{
        players = load().players;
      }
      const arr = Object.entries(players).map(([key,s])=>({
        name: (s && s.name) || key,
        score: (s && s[mode]) || 0,
        updatedAt: (s && s.updatedAt) || 0
      }));
      arr.sort((a,b)=> (b.score-a.score) || (b.updatedAt-a.updatedAt));
      return arr.slice(0,10);
    }
    function renderOne(el, mode, suffix){
      const list = topList(mode);
      el.innerHTML = "";
      if(!list.length){ el.innerHTML = "<li>ilk sen ol 😏</li>"; return; }
      list.forEach(it=>{
        const li = document.createElement("li");
        li.textContent = `${it.name} — ${it.score}${suffix}`;
        el.appendChild(li);
      });
    }
    function renderBoards(){
      renderOne(R.lbClick, "click", "");
      renderOne(R.lbMemory, "memory", " pts");
      renderOne(R.lbQuiz, "quiz", " pts");
    }
    window.renderBoards = renderBoards; // debugging
    R.lbClear.addEventListener("click", ()=>{
      if(!confirm("sıralama sıfırlansın mı? bu HERKES için sıfırlanır, emin misin 😄")) return;
      save({players:{}, lastName: currentName || ""});
      if(window.akDB){
        window.akDB.ref(FB_PATH).remove((err)=>{ if(err) console.warn("Firebase sıfırlama hatası:", err); });
      }
      cloudPlayers = {};
      renderBoards();
    });

    // Firebase'den canlı veri geldiğinde tabloları otomatik güncelle
    startCloudSync(renderBoards);

    // ---------------- Game 1: Click Hearts ----------------
    let chScore = 0, chTime = 30, chRunning = false, chTick=null, chSpawn=null;

    function chReset(){
      chScore = 0; chTime = 30;
      R.chScore.textContent = "0";
      R.chTime.textContent = "30";
      R.chArea.innerHTML = "";
    }
    function chSpawnHeart(){
      if(!chRunning) return;
      const heart = document.createElement("div");
      heart.className = "ch-heart";
      heart.textContent = (Math.random() < 0.55 ? "💜" : "🩶");
      const pad = 18;
      const x = pad + Math.random()*(R.chArea.clientWidth - pad*2);
      const y = pad + Math.random()*(R.chArea.clientHeight - pad*2);
      heart.style.left = x + "px";
      heart.style.top = y + "px";
      heart.addEventListener("click", (e)=>{
        e.preventDefault(); e.stopPropagation();
        chScore += 1;
        R.chScore.textContent = String(chScore);
        heart.remove();
      }, {passive:false});
      R.chArea.appendChild(heart);
      setTimeout(()=>{ if(heart.isConnected) heart.remove(); }, 680);
    }
    function chEnd(){
      chRunning = false;
      clearInterval(chTick); clearInterval(chSpawn);
      chTick=null; chSpawn=null;
      R.chStart.disabled = false;
      R.chStop.disabled = true;
      updateScore("click", chScore);
    }
    R.chStart.addEventListener("click", ()=>{
      if(!setName(currentName || R.nameInput.value)){ R.nameInput.focus(); return; }
      chReset();
      chRunning = true;
      R.chStart.disabled = true;
      R.chStop.disabled = false;
      chSpawnHeart(); chSpawnHeart(); chSpawnHeart();
      chSpawn = setInterval(chSpawnHeart, 260);
      chTick = setInterval(()=>{
        chTime -= 1;
        R.chTime.textContent = String(chTime);
        if(chTime <= 0) chEnd();
      }, 1000);
    });
    R.chStop.addEventListener("click", ()=>{ if(chRunning) chEnd(); });

    // ---------------- Game 2: Memory ----------------
      const mmPairs = [
      { a:"💜", b:"🩶", key:"heart" },   // mor+gri eşleşir
      { a:"☯️", b:"☯️", key:"yy" },
      { a:"♥️", b:"♥️", key:"love" },
      { a:"🌼", b:"🌼", key:"a" },
      { a:"⛓️", b:"⛓️", key:"k" },
      { a:"🥌", b:"🥌", key:"d28" },
      { a:"🌚", b:"🌚", key:"d11" },
      { a:"🖕🏻", b:"🖕🏻", key:"d2025" },
      { a:"🪰", b:"🪰", key:"moon" },
      { a:"💍", b:"💍", key:"ring" }
    ];
    let mmDeck=[], mmFirst=null, mmSecond=null, mmLocked=false, mmMoves=0, mmTime=0, mmTimer=null, mmMatched=0;

    function mmShuffle(arr){
      for(let i=arr.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
      }
      return arr;
    }
    function mmStop(){ if(mmTimer){ clearInterval(mmTimer); mmTimer=null; } }
    function mmStartTimer(){ mmStop(); mmTimer=setInterval(()=>{ mmTime+=1; R.mmTime.textContent=String(mmTime); },1000); }
    function mmReset(){
      R.mmGrid.innerHTML="";
      mmFirst=null; mmSecond=null; mmLocked=false;
      mmMoves=0; mmTime=0; mmMatched=0;
      R.mmMoves.textContent="0"; R.mmTime.textContent="0";
      mmStop();
      mmDeck = mmShuffle(mmPairs.flatMap(p => ([{face:p.a,key:p.key},{face:p.b,key:p.key}]))); // 20
    }
    function mmScore(){
      const raw = 1000 - (mmTime*5 + mmMoves*20);
      return Math.max(0, raw);
    }
    function mmEnd(){
      mmStop();
      updateScore("memory", mmScore());
    }
    function mmCard(value){
      const b=document.createElement("button");
      b.type="button";
      b.className="mm-card";
      b.dataset.key = value.key;
      b.dataset.face = value.face;
      b.innerHTML = `<div class="mm-back">A 💜 K</div><div class="mm-face">${value.face}</div>`;
      b.addEventListener("click", ()=>{
        if(mmLocked) return;
        if(b.classList.contains("flipped") || b.classList.contains("matched")) return;
        if(!mmTimer) mmStartTimer();
        b.classList.add("flipped");

        if(!mmFirst){ mmFirst=b; return; }
        mmSecond=b;
        mmMoves += 1;
        R.mmMoves.textContent=String(mmMoves);

        if(mmFirst.dataset.key === mmSecond.dataset.key){
          mmFirst.classList.add("matched");
          mmSecond.classList.add("matched");
          mmFirst.classList.remove("flipped");
          mmSecond.classList.remove("flipped");
          mmFirst=null; mmSecond=null;
          mmMatched += 1;
          if(mmMatched >= mmPairs.length) mmEnd();
        }else{
          mmLocked=true;
          setTimeout(()=>{
            mmFirst.classList.remove("flipped");
            mmSecond.classList.remove("flipped");
            mmFirst=null; mmSecond=null;
            mmLocked=false;
          }, 550);
        }
      });
      return b;
    }
    function mmRender(){ mmDeck.forEach(v=> R.mmGrid.appendChild(mmCard(v))); }
    R.mmStart.addEventListener("click", ()=>{
      if(!setName(currentName || R.nameInput.value)){ R.nameInput.focus(); return; }
      mmReset(); mmRender();
    });

    // ---------------- Game 3: Quiz ----------------
    const quiz = [
  { q: "Atakan'ın favori rengi?", a: ["mor", "kırmızı", "mavi", "siyah"], c: 0 },
  { q: "Kevser'in rengi?", a: ["pembe", "gri", "turuncu", "yeşil"], c: 1 },
  { q: "Sizin temanız?", a: ["zombi", "yin-yang", "uzay", "süper kahraman"], c: 1 },
  { q: "Sitede kalp yağmuruna tıklayınca ne çıkar?", a: ["A", "K", "❤️", "☯️"], c: 1 },
  { q: "Favori ortak şarkınız?", a: ["romantik", "hayalperest", "hanımefendi", "otelden otele"], c: 1 },
  { q: "Kaç medya var?", a: ["2000-2500", "2500-3000", "3000-3500", "3500-4100"], c: 3 },
  { q: "En çok kullanılan hitap?", a: ["aşkım", "canım", "birtanem", "hayatım"], c: 0 },
  { q: "Büyük notta ne yazıyor?", a: ["iyi geceler", "SENİ ÇOK SEVİYORUM SEVGİLİM", "bye", "şaka"], c: 1 },
  { q: "İlk kavga sebebi?", a: ["oyun", "mesaj geç cevap", "şaka", "yok"], c: 3 },
  { q: "En çok hangi uygulamada konuşuyorsunuz?", a: ["WhatsApp", "Instagram", "Discord", "X"], c: 0 }
];
    let qi=0, qScore=0, qLocked=false;

    function qRender(){
      qLocked=false;
      const item=quiz[qi];
      R.qBox.innerHTML = `
        <div class="q-q">${item.q}</div>
        <div class="q-ans">
          ${item.a.map((t,i)=>`<button type="button" data-i="${i}">${t}</button>`).join("")}
        </div>
      `;
      qa("#q-box button").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          if(qLocked) return;
          qLocked=true;
          const pick=parseInt(btn.dataset.i,10);
          const correct=item.c;
          qa("#q-box button").forEach(b=>{
            if(parseInt(b.dataset.i,10)===correct) b.classList.add("correct");
          });
          if(pick===correct){
            qScore += 10;
            R.qScore.textContent=String(qScore);
          }else{
            btn.classList.add("wrong");
          }
          setTimeout(()=>{
            qi += 1;
            R.qStep.textContent=String(qi);
            if(qi>=quiz.length){
              R.qBox.innerHTML = `<div class="q-q">bitti 😄 puanın: <b>${qScore}</b> 💜</div><div class="mg-hint">sıralama güncellendi.</div>`;
              updateScore("quiz", qScore);
              return;
            }
            qRender();
          }, 650);
        });
      });
    }

    R.qStart.addEventListener("click", ()=>{
      if(!setName(currentName || R.nameInput.value)){ R.nameInput.focus(); return; }
      qi=0; qScore=0;
      R.qScore.textContent="0";
      R.qStep.textContent="0";
      qRender();
    });

    // Default view
    activateTab("click");
    renderBoards();
  }

  // IMPORTANT: when modal is opened (inline onclick), init once
  document.addEventListener("click", (e)=>{
    const t = e.target;
    if(t && (t.id === "mini-game-btn" || (t.closest && t.closest("#mini-game-btn")))){
      // init a tick later so modal DOM exists and is visible
      setTimeout(ensureInit, 0);
    }
  });

  // Also init if modal already visible (safety)
  window.addEventListener("load", ()=>{
    if(modal() && modal().classList.contains("show")) ensureInit();
  });
})();

// ===== FOOTER OTOMATİK TARİH =====
(function(){
  const el = document.getElementById("dynamic-date");
  if(!el) return;
  const now = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const trDate = now.toLocaleDateString("tr-TR", options);
  el.textContent = trDate;
})();


function filterGallery(month) {
    const btns = document.querySelectorAll('.filter-btn');
    
    // Önceki tüm aktif sınıfları temizle
    btns.forEach(btn => {
        btn.classList.remove('active', 'active-purple', 'active-grey');
    });

    if (event) {
        const clickedBtn = event.target;
        const btnArray = Array.from(btns);
        const btnIndex = btnArray.indexOf(clickedBtn);

        // Renk Döngüsü: 0, 2, 4 -> Mor | 1, 3, 5 -> Gri
        if (btnIndex % 2 === 0) {
            clickedBtn.classList.add('active-purple');
        } else {
            clickedBtn.classList.add('active-grey');
        }
    }

    // --- Filtreleme İşlemi (Mevcut kodun devamı) ---
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        const imgSrc = item.querySelector('img').getAttribute('src');
        let isMatch = false;

        if (month === 'favorites') {
            isMatch = isFavorite(imgSrc);
        }
        else if (month === 'all') isMatch = true;
        else if (month === '11.2025' && imgSrc.includes('11.2025')) isMatch = true;
        else if (month === '12.2025' && imgSrc.includes('2025') && !imgSrc.includes('11.2025')) isMatch = true;
        else if (month === '01.2026' && imgSrc.includes('01/')) isMatch = true;
        else if (month === '02.2026' && (imgSrc.includes('02/') || imgSrc.includes('2026.02'))) isMatch = true;
        else if (month === '03.2026' && imgSrc.includes('03/')) isMatch = true;
        else if (month === '04.2026' && imgSrc.includes('04.2026')) isMatch = true;
        else if (month === '05.2026' && imgSrc.includes('05.2026')) isMatch = true;
        else if (month === '06.2026' && imgSrc.includes('06.2026')) isMatch = true;
        else if (month === '07.2026' && imgSrc.includes('07.2026')) isMatch = true;
        else if (month === '08.2026' && imgSrc.includes('08.2026')) isMatch = true;

        item.style.display = isMatch ? 'block' : 'none';
    });
}

function setView(mode) {
    const gallery = document.getElementById('gallery-scroll');
    const btnScroll = document.getElementById('btn-scroll');
    const btnGrid = document.getElementById('btn-grid');

    if (mode === 'grid') {
        gallery.classList.add('gallery-grid-mode');
        btnGrid.classList.add('active');
        btnScroll.classList.remove('active');
    } else {
        gallery.classList.remove('gallery-grid-mode');
        btnScroll.classList.add('active');
        btnGrid.classList.remove('active');
    }
}

const slider = document.querySelector('.gallery-filters');
let isDown = false;
let startDate;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});

slider.addEventListener('mouseleave', () => {
    isDown = false;
});

slider.addEventListener('mouseup', () => {
    isDown = false;
});

slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // Kaydırma hızı (2 katı)
    slider.scrollLeft = scrollLeft - walk;
});

// Fare tekerleği ile yatay kaydırma desteği
slider.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
    }
});

/* ===== AŞK ÇARKI — FIREBASE CANLI SENKRON ===== */
let currentRotation = 0;
let isSpinning = false;
let motionInited = false;
const WHEEL_FB_PATH = 'wheel_state';

const rewards = [
    "5 dakika rol yaparak konuş 🎭",
    "Bizimle ilgili güzel bir anını anlat 📖",
    "Sana verdiğim mini challenge'ı yap ⚡",
    "Bana yeni bir lakap bul 🏷️",
    "Bana küçük bir itiraf yap 😳",
    "Bana sadece emojilerle mesaj at 😍",
    "Bana kısa bir şiir yaz 📝",
    "Bana kısa bir video çek 🎥"
];

// Firebase dinleyici — diğer cihazlardan gelen dönüşleri yakalar
function initWheelSync() {
    const badge = document.getElementById('wheel-live-text');
    if (!window.akDB) {
        if (badge) badge.textContent = 'çevrimdışı mod';
        return;
    }
    if (badge) badge.textContent = 'canlı bağlı ✓';

    window.akDB.ref(WHEEL_FB_PATH).on('value', (snap) => {
        const data = snap.val();
        if (!data) return;
        if (data.spinId === window._myWheelSpinId) return;

        const wheel = document.getElementById('wheel');
        const resultEl = document.getElementById('wheel-result');
        if (!wheel) return;

        currentRotation = data.targetRotation;
        isSpinning = true;

        wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0, 0.12, 1)';
        wheel.style.transform = `rotate(${currentRotation}deg)`;

        if (resultEl) {
            resultEl.textContent = 'Kaderin dönüyor... ✨';
            resultEl.classList.remove('has-result');
        }

        clearTimeout(window._wheelResultTimer);
        window._wheelResultTimer = setTimeout(() => {
            isSpinning = false;
            if (resultEl) {
                resultEl.textContent = data.result || '';
                resultEl.classList.add('has-result');
            }
            const wheelEl = document.getElementById('wheel');
            if (wheelEl && typeof noteBurstHearts === 'function') {
                const rect = wheelEl.getBoundingClientRect();
                noteBurstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        }, 4100);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initWheelSync, 1200);
});

function spinWheel() {
    if (isSpinning) return;
    if (!motionInited) requestMotionPermission();

    isSpinning = true;
    const wheel = document.getElementById('wheel');
    const resultEl = document.getElementById('wheel-result');

    const randomExtra = Math.floor(Math.random() * 360) + 1800;
    currentRotation += randomExtra;

    const actualAngle = currentRotation % 360;
    const prizeIndex = Math.floor(((360 - (actualAngle % 360)) % 360) / 45);
    const result = rewards[prizeIndex];

    const spinId = Date.now().toString();
    window._myWheelSpinId = spinId;

    if (wheel) {
        wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0, 0.12, 1)';
        wheel.style.transform = `rotate(${currentRotation}deg)`;
    }
    if (resultEl) {
        resultEl.textContent = 'Kaderin dönüyor... ✨';
        resultEl.classList.remove('has-result');
    }

    if (window.akDB) {
        window.akDB.ref(WHEEL_FB_PATH).set({
            spinId,
            targetRotation: currentRotation,
            result,
            ts: Date.now()
        });
    }

    clearTimeout(window._wheelResultTimer);
    window._wheelResultTimer = setTimeout(() => {
        isSpinning = false;
        if (resultEl) {
            resultEl.textContent = result;
            resultEl.classList.add('has-result');
        }
        if (wheel && typeof noteBurstHearts === 'function') {
            const rect = wheel.getBoundingClientRect();
            noteBurstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
    }, 4100);
}

// SALLAMA AYARLARI (Gelişmiş)
let lastShake = 0;
const shakeThreshold = 55; // Daha da sert sallama gerekir

function handleShake(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    
    // Daha profesyonel ivme ölçümü
    const speed = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
    const now = Date.now();
    
    if (speed > shakeThreshold && (now - lastShake > 3500)) { 
        lastShake = now;
        spinWheel();
    }
}

function requestMotionPermission() {
    motionInited = true;
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(s => {
            if (s === 'granted') window.addEventListener('devicemotion', handleShake);
        });
    } else {
        window.addEventListener('devicemotion', handleShake);
    }
}

// Mavi seçilme engelleyici
document.addEventListener('contextmenu', e => {
    if (e.target.closest('.wheel-wrapper')) e.preventDefault();
});

/* ===== DOĞRULUK MU CESARET Mİ ===== */
const TOD_FB_PATH = 'tod_state';
let todType = 'truth';   // 'truth' | 'dare' | 'random'
let todDrawnCount = 0;
let todHistory = [];

const todTruths = [
  "İlişkimizde en çok değer verdiğin şey nedir? 💜",
  "Birlikte yaşadığımız en unutulmaz an hangisiydi? ✨",
  "İlk tanıştığımız günü nasıl hatırlıyorsun? 😊",
  "Beni düşündüğünde aklına gelen ilk şey nedir? 💭",
  "İlişkimizde seni en mutlu eden şey nedir? 🌸",
  "Birlikte yapmak istediğin bir hayalin var mı? 🌍",
  "En çok hangi özelliğimi seviyorsun? 🥰",
  "Beni ilk kez özlediğini ne zaman fark ettin? 🥺",
  "Birlikte geçirdiğimiz en komik an hangisiydi? 😂",
  "İlişkimizde seni en çok ne heyecanlandırıyor? ✨",
  "Bana söylemek isteyip de söyleyemediğin bir şey var mı? 🤫",
  "Hayatındaki en büyük hedef nedir? 🎯",
  "Gelecekte bizi nasıl hayal ediyorsun? 🌟",
  "Birlikte gitmek istediğin bir yer var mı? ✈️",
  "İlk buluşmamızda ne hissetmiştin? 💕",
  "İlişkimizde seni en çok güldüren şey nedir? 😆",
  "Kendinle ilgili değiştirmek istediğin bir şey var mı? 🤔",
  "Birlikte yaşlanmayı hayal ediyor musun? 🫶",
  "En büyük korkun nedir? 😬",
  "Hayatındaki en mutlu günlerden biri hangisiydi? ☀️",
  "İlişkimizde öğrendiğin en önemli şey nedir? 📖",
  "Beni üç kelimeyle nasıl tanımlarsın? 💌",
  "Birlikte yaşadığımız hangi anı tekrar yaşamak isterdin? ⏳",
  "Beni ilk etkileyen şey neydi? 🌹",
  "İlişkimizde seni en güvende hissettiren şey nedir? 🤍",
  "En çok hangi ortak özelliğimizi seviyorsun? 🌱",
  "Şu anki halimize küçük bir not bırakacak olsan ne yazardın? 📝",
  "Birlikte yapmak istediğin küçük bir plan nedir? 🎈",
  "Bana duyduğun sevgiyi tek cümleyle anlatabilir misin? 💞",
  "İlişkimizin en güzel tarafı sence nedir? 💎"
];

const todDares = [
  "Karşındaki kişiyi 5 kelimeyle tarif et 🥰",
  "Birlikte yaşadığınız favori anıyı anlat 📖",
  "Karşındaki kişiye içten bir iltifat et 💜",
  "Sadece emojiler kullanarak ilişkinizi anlat 😍",
  "Gelecekle ilgili romantik bir hayalini paylaş 🌟",
  "Karşındaki kişi için kısa bir şiir yaz 📝",
  "Üç farklı sevgi sözcüğü söyle 💌",
  "Birlikte yapılacak eğlenceli bir aktivite öner 🎮",
  "Karşındaki kişinin en sevdiğin özelliğini anlat ✨",
  "Bir şarkı sözüyle duygularını ifade et 🎵",
  "İlişkinizi anlatan bir film adı uydur 🎬",
  "Birlikte çıkılacak hayali bir tatili anlat ✈️",
  "Karşındaki kişiye komik bir lakap bul 😂",
  "10 saniyelik bir motivasyon konuşması yap 🎤",
  "Karşındaki kişiye teşekkür etmek için üç neden say 🌸",
  "İlişkinizi bir renk olarak seç ve nedenini anlat 🎨",
  "Birlikte çekilmiş bir fotoğrafı tarif et 📸",
  "Karşındaki kişiye bir soru sor ve cevabını tahmin et 🤔",
  "Aşkı tek kelimeyle tanımla ❤️",
  "Birlikte yapılacak sürpriz bir plan oluştur 🎁",
  "Karşındaki kişiye özel bir emoji kombinasyonu oluştur 😊",
  "Birlikte yaşadığınız komik bir olayı anlat 🤣",
  "Şu anki ruh halini üç emojiyle açıkla 😌",
  "Karşındaki kişiye samimi bir teşekkür mesajı yaz 💕",
  "İlişkinizi anlatan üç şarkı seç 🎶",
  "Gelecekte birlikte görmek istediğin bir yeri söyle 🌍",
  "Karşındaki kişiyi bir mevsime benzet ve nedenini açıkla 🍂",
  "Bir dakika boyunca sadece güzel şeylerden bahset ☀️",
  "Karşındaki kişiye kısa bir sevgi notu yaz 💞",
  "Birlikte gerçekleşmesini istediğin küçük bir hayalini paylaş 🌙"
];

function todSetType(type) {
  todType = type;
  document.querySelectorAll('.tod-type-btn').forEach(b => b.classList.remove('active'));
  const btnMap = { truth: 'tod-btn-truth', dare: 'tod-btn-dare', random: 'tod-btn-random' };
  // random için rastgele butonu aktif
  if (type === 'random') {
    document.querySelectorAll('.tod-type-btn')[2].classList.add('active');
  } else {
    const btn = document.getElementById(btnMap[type]);
    if (btn) btn.classList.add('active');
  }
}

function todDraw() {
  const actualType = todType === 'random'
    ? (Math.random() < 0.5 ? 'truth' : 'dare')
    : todType;

  const pool = actualType === 'truth' ? todTruths : todDares;
  const q = pool[Math.floor(Math.random() * pool.length)];
  todDrawnCount++;

  // Firebase'e yaz (canlı senkron)
  const drawId = Date.now().toString();
  const payload = { drawId, type: actualType, question: q, count: todDrawnCount, ts: Date.now() };
  if (window.akDB) {
    window.akDB.ref(TOD_FB_PATH).set(payload);
  }
  todApply(payload, true);
}

function todApply(data, isOwn) {
  const card = document.getElementById('tod-card');
  const inner = document.getElementById('tod-card-inner');
  const badge = document.getElementById('tod-badge');
  const qEl  = document.getElementById('tod-question');
  const num  = document.getElementById('tod-card-num');

  // Flip animasyonu
  card.classList.remove('flip');
  void card.offsetWidth; // reflow
  card.classList.add('flip');

  const isD = data.type === 'dare';
  inner.classList.toggle('dare-mode', isD);
  badge.textContent = isD ? '🔥 Cesaret' : '🎯 Doğruluk';
  qEl.textContent = data.question;
  num.textContent = `kart #${data.count}`;

  // Geçmişe ekle
  todHistory.unshift({ type: data.type, question: data.question });
  if (todHistory.length > 5) todHistory.pop();
  todRenderHistory();
}

function todReset() {
  todDrawnCount = 0;
  todHistory = [];
  const qEl = document.getElementById('tod-question');
  const num = document.getElementById('tod-card-num');
  const inner = document.getElementById('tod-card-inner');
  if (qEl) qEl.textContent = 'Başlamak için kart çek 💜';
  if (num) num.textContent = '';
  if (inner) inner.classList.remove('dare-mode');
  document.getElementById('tod-badge').textContent = '🎯 Doğruluk';
  todRenderHistory();
  if (window.akDB) window.akDB.ref(TOD_FB_PATH).remove();
}

function todRenderHistory() {
  const container = document.getElementById('tod-history');
  if (!container) return;
  container.innerHTML = '';
  todHistory.forEach(item => {
    const div = document.createElement('div');
    div.className = 'tod-history-item';
    const span = document.createElement('span');
    span.className = 'tod-history-badge' + (item.type === 'dare' ? ' dare' : '');
    span.textContent = item.type === 'dare' ? '🔥' : '🎯';
    const txt = document.createElement('span');
    txt.textContent = item.question;
    div.appendChild(span);
    div.appendChild(txt);
    container.appendChild(div);
  });
}

function initTodSync() {
  const badge = document.getElementById('tod-live-text');
  if (!window.akDB) {
    if (badge) badge.textContent = 'çevrimdışı mod';
    return;
  }
  if (badge) badge.textContent = 'canlı bağlı ✓';

  window.akDB.ref(TOD_FB_PATH).on('value', (snap) => {
    const data = snap.val();
    if (!data) return;
    // Kendi yaptığımız çekilişi tekrar gösterme
    if (data.drawId === window._myTodDrawId) return;
    todDrawnCount = data.count || todDrawnCount;
    todHistory.unshift({ type: data.type, question: data.question });
    if (todHistory.length > 5) todHistory.pop();
    todApply(data, false);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initTodSync, 1400);
});




function downloadImage() {
    const currentImgUrl = document.getElementById("lightbox-img").src;
    const link = document.createElement("a");
    link.href = currentImgUrl;
    
    // Dosya adını resmin adından çekelim
    const fileName = currentImgUrl.split('/').pop();
    link.download = "AK_Animiz_" + fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}





// ===== GARANTİLİ OFFLINE VE CACHE SİSTEMİ =====
const CACHE_NAME = 'ak-anilar-v3';

function getStaticAssets() {
    const assets = [
        window.location.pathname,
        'index.html',
        'favicon.png',
        'logo4.png',
        window.TEMA_ACTIVE_URL || 'temalar/1.png'
    ];
    
    document.querySelectorAll('.gallery-item img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !assets.includes(src)) {
            assets.push(src);
        }
    });
    
    return assets;
}

// Bu fonksiyonu doğrudan giriş başarılı olduğunda tetikleyeceğiz
function startOfflineCaching() {
    if ('service worker' in navigator) {
        const swBlob = new Blob([`
            const CACHE_NAME = '${CACHE_NAME}';
            self.addEventListener('install', (e) => { self.skipWaiting(); });
            self.addEventListener('activate', (e) => { e.waitUntil(clients.claim()); });
            self.addEventListener('fetch', (e) => {
                e.respondWith(
                    caches.match(e.request).then((cachedResponse) => {
                        if (cachedResponse) return cachedResponse;
                        return fetch(e.request).then((networkResponse) => {
                            if (networkResponse.status === 200) {
                                let responseToCache = networkResponse.clone();
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(e.request, responseToCache);
                                });
                            }
                            return networkResponse;
                        }).catch(() => caches.match('index.html'));
                    })
                );
            });
        `], { type: 'text/javascript' });

        const swUrl = URL.createObjectURL(swBlob);
        
        navigator.serviceWorker.register(swUrl, { scope: './' })
            .then(reg => {
                const toastEl = document.getElementById("welcome-toast");
                
                caches.open(CACHE_NAME).then(cache => {
                    const urlsToCache = getStaticAssets();
                    
                    if(toastEl) {
                        toastEl.innerText = "Anılarımız telefona kilitleniyor... ⏳";
                        toastEl.classList.add("show");
                    }

                    cache.addAll(urlsToCache).then(() => {
                        console.log('Önbelleğe alma başarılı!');
                        if(toastEl) {
                            toastEl.innerText = "Tüm anılar internetsiz kullanım için hazır! 💜🩶";
                            toastEl.classList.add("show");
                            setTimeout(() => { toastEl.classList.remove("show"); }, 4000);
                        }
                    }).catch(err => {
                        console.log("Önbelleğe alınırken bazı dosyalar atlandı:", err);
                    });
                });
            });
    }
}


// ===== TEMA SİSTEMİ =====
function toggleThemePicker() {
    document.getElementById('theme-picker').classList.toggle('open');
}
document.addEventListener('click', function(e) {
    if (!e.target.closest('#theme-picker') && !e.target.closest('#theme-toggle-btn')) {
        document.getElementById('theme-picker').classList.remove('open');
    }
}, true);
function setTheme(name) {
    document.body.classList.remove('theme-light','theme-purple','theme-pink','theme-midnight','theme-grey');
    if (name !== 'dark') document.body.classList.add('theme-' + name);
    localStorage.setItem('ak-theme', name);
    document.querySelectorAll('.tp-btn').forEach(b => b.classList.remove('active-theme'));
    const idx = ['dark','light','purple','pink','midnight','grey'].indexOf(name);
    const btns = document.querySelectorAll('.tp-btn');
    if (btns[idx]) btns[idx].classList.add('active-theme');
    document.getElementById('theme-picker').classList.remove('open');
    // Karanlık (default) temaya dönünce bg-photo'yu sıfırla
    const bgPhoto = document.getElementById('bg-photo');
    if(bgPhoto && name === 'dark'){
        bgPhoto.style.background = '';
        bgPhoto.style.display = '';
    }
}
(function(){
    const t = localStorage.getItem('ak-theme') || 'dark';
    setTheme(t);
})();

// ===== POLAROİD TOGGLE =====
let polaroidOn = false;
function togglePolaroid() {
    polaroidOn = !polaroidOn;
    const scroll = document.getElementById('gallery-scroll');
    const btn = document.getElementById('polaroid-toggle-btn');
    if (!scroll || !btn) return;
    if (polaroidOn) {
        scroll.classList.add('polaroid-mode');
        btn.textContent = '🖼️ Polaroid Modu: AÇIK';
        btn.style.background = 'rgba(123,44,191,0.45)';
        btn.style.borderColor = '#9d4edd';
    } else {
        scroll.classList.remove('polaroid-mode');
        btn.textContent = '📷 Polaroid Modu: KAPALI';
        btn.style.background = 'rgba(255,255,255,0.08)';
        btn.style.borderColor = 'rgba(255,255,255,0.15)';
    }
}


/* ===== XOX — FİREBASE ÇOKLU CİHAZ ===== */
(function(){
  const FB_XOX = 'xox_game'; // Firebase yolu

  let xoxSize = 3;
  let xoxBoard = [];
  let xoxCurrent = 'X';
  let xoxOver = false;
  let xoxWinLen = 3;

  // Benim bilgim
  let myName = '';
  let mySymbol = ''; // 'X' ya da 'O'

  // Firebase'den gelen son state
  let fbState = null;
  let fbListener = null;

  function getWinLen(s){ return s===3?3:s===5?4:5; }

  /* --- Canlı bağlantı göstergesi --- */
  function setLive(on){
    const dot = document.getElementById('xox-live-dot');
    const txt = document.getElementById('xox-live-text');
    if(!dot||!txt) return;
    dot.style.background = on ? '#4ade80' : '#aaa';
    dot.style.boxShadow  = on ? '0 0 6px #4ade80' : 'none';
    txt.textContent = on ? 'canlı bağlı ✓' : 'çevrimdışı';
  }

  /* --- Firebase dinleyici başlat --- */
  function startFBListener(){
    if(!window.akDB){ setLive(false); return; }
    setLive(true);
    if(fbListener) window.akDB.ref(FB_XOX).off('value', fbListener);
    fbListener = window.akDB.ref(FB_XOX).on('value', snap=>{
      const data = snap.val();
      if(!data) return;
      fbState = data;
      applyState(data);
    }, ()=>setLive(false));
  }

  /* --- Firebase'e state yaz --- */
  function pushState(patch){
    if(!window.akDB) return;
    const cur = fbState || {};
    const next = Object.assign({}, cur, patch, {ts: Date.now()});
    window.akDB.ref(FB_XOX).set(next);
  }

  /* --- Firebase'den gelen state'i uygula --- */
  function applyState(s){
    if(!s) return;
    xoxSize    = s.size    || 3;
    xoxBoard   = s.board   || Array(xoxSize*xoxSize).fill('');
    xoxCurrent = s.current || 'X';
    xoxOver    = s.over    || false;

    // Boyut butonları
    document.querySelectorAll('.xox-size-btn').forEach(b=>{
      b.classList.toggle('active', parseInt(b.dataset.size)===xoxSize);
    });

    // Oyuncu kartları
    const px = s.playerX || '';
    const po = s.playerO || '';
    const ex = document.getElementById('xox-player-x-name');
    const eo = document.getElementById('xox-player-o-name');
    if(ex) ex.textContent = px || 'bekliyor...';
    if(eo) eo.textContent = po || 'bekliyor...';

    const sx = document.getElementById('xox-score-x');
    const so = document.getElementById('xox-score-o');
    if(sx) sx.textContent = (s.scoreX||0)+' puan';
    if(so) so.textContent = (s.scoreO||0)+' puan';

    // Sıra / durum
    const turnEl  = document.getElementById('xox-turn-display');
    const statusEl= document.getElementById('xox-status');

    if(s.over){
      const winner = s.winner;
      if(winner === 'draw'){
        if(turnEl){ turnEl.textContent='Berabere 🤝'; turnEl.style.color='#fff'; }
        if(statusEl) statusEl.textContent='🤝 Berabere! Harika oyun!';
      } else {
        const wname = winner==='X' ? (px||'❌') : (po||'⭕');
        const wsym  = winner==='X' ? '❌' : '⭕';
        if(turnEl){ turnEl.textContent=wsym+' Kazandı 🏆'; turnEl.style.color= winner==='X'?'#ff4d6d':'#9d4edd'; }
        if(statusEl) statusEl.textContent=`🎉 ${wname} kazandı! Tebrikler!`;
      }
    } else {
      const cname = xoxCurrent==='X' ? (px ? px : '❌') : (po ? po : '⭕');
      const csym  = xoxCurrent==='X' ? '❌' : '⭕';
      if(turnEl){ turnEl.textContent='sıra: '+csym+' ('+cname+')'; turnEl.style.color=xoxCurrent==='X'?'#ff4d6d':'#9d4edd'; }

      if(!px || !po){
        if(statusEl) statusEl.textContent='İki oyuncu bekleniyor... 💜';
      } else {
        // Benim sıram mı?
        if(mySymbol && xoxCurrent===mySymbol){
          if(statusEl) statusEl.textContent='Senin sıran! '+csym+' hamleni yap!';
        } else if(mySymbol) {
          if(statusEl) statusEl.textContent='Rakibinin hamlesi bekleniyor... ⏳';
        } else {
          if(statusEl) statusEl.textContent=cname+' hamleni yapıyor...';
        }
      }
    }

    // Katıl kutusu — ben zaten içerideyse gizle
    if(mySymbol){
      const jb = document.getElementById('xox-join-box');
      if(jb) jb.style.display='none';
    }

    xoxRenderBoard();
  }

  /* --- Tahtayı çiz --- */
  function xoxRenderBoard(){
    const board = document.getElementById('xox-board');
    if(!board) return;
    board.className = 'xox-board size-'+xoxSize;
    board.innerHTML = '';
    for(let i=0;i<xoxSize*xoxSize;i++){
      const cell = document.createElement('div');
      cell.className = 'xox-cell';
      if(xoxBoard[i]){
        cell.classList.add('taken');
        cell.classList.add(xoxBoard[i]==='X'?'x-cell':'o-cell');
        cell.textContent = xoxBoard[i]==='X'?'❌':'⭕';
      }
      // Kazanan hücreler
      const wins = fbState && fbState.winCells;
      if(wins && wins.includes(i)) cell.classList.add('win-cell');
      cell.addEventListener('click', ()=>xoxClick(i));
      board.appendChild(cell);
    }
  }

  /* --- Katıl --- */
  window.xoxJoin = function(){
    const input = document.getElementById('xox-name-input');
    const statusEl = document.getElementById('xox-join-status');
    const name = (input ? input.value.trim() : '').slice(0,14);
    if(!name){ if(statusEl) statusEl.textContent='İsim boş olamaz 😅'; return; }

    if(!window.akDB){
      // Offline: sadece yerel, X al
      myName=''; mySymbol='X';
      if(statusEl) statusEl.textContent='Çevrimdışı: sana ❌ verildi (sadece bu cihaz)';
      const jb = document.getElementById('xox-join-box');
      if(jb) jb.style.display='none';
      return;
    }

    window.akDB.ref(FB_XOX).once('value').then(snap=>{
      const s = snap.val() || {};
      const px = s.playerX || '';
      const po = s.playerO || '';

      // Aynı isimle zaten içeride mi?
      if(px === name){ myName=name; mySymbol='X'; if(statusEl) statusEl.textContent='Tekrar hoş geldin '+name+'! Sın ❌'; const jb=document.getElementById('xox-join-box'); if(jb)jb.style.display='none'; return; }
      if(po === name){ myName=name; mySymbol='O'; if(statusEl) statusEl.textContent='Tekrar hoş geldin '+name+'! Sin ⭕'; const jb=document.getElementById('xox-join-box'); if(jb)jb.style.display='none'; return; }

      // Oda dolu mu?
      if(px && po){ if(statusEl) statusEl.textContent='Oda dolu! Seyirci olarak izleyebilirsin 👀'; return; }

      // Hangi sembolü alacak?
      let symbol;
      if(!px && !po){
        // İlk kişi — rastgele
        symbol = Math.random() < 0.5 ? 'X' : 'O';
      } else if(!px){
        symbol = 'X';
      } else {
        symbol = 'O';
      }

      myName   = name;
      mySymbol = symbol;

      const patch = {};
      if(symbol==='X') patch.playerX = name;
      else             patch.playerO = name;

      // Eğer hiç oyun yoksa temiz başlat
      if(!px && !po){
        patch.board   = Array(xoxSize*xoxSize).fill('');
        patch.current = 'X';
        patch.over    = false;
        patch.winner  = null;
        patch.winCells= null;
        patch.size    = xoxSize;
        patch.scoreX  = 0;
        patch.scoreO  = 0;
      }
      pushState(patch);

      if(statusEl) statusEl.textContent = `Hoş geldin ${name}! Sana ${symbol==='X'?'❌':'⭕'} verildi 🎉`;
      const jb = document.getElementById('xox-join-box');
      if(jb) jb.style.display='none';
    });
  };

  /* --- Hamle yap --- */
  function xoxClick(idx){
    if(xoxOver || xoxBoard[idx]) return;

    // Sadece kendi sıramda oynayabilirim
    if(mySymbol && xoxCurrent !== mySymbol){
      const statusEl = document.getElementById('xox-status');
      if(statusEl){ statusEl.textContent='Bu senin sıran değil! ⏳'; setTimeout(()=>applyState(fbState),1200); }
      return;
    }

    // Oyuncu yoksa local oyna
    const s = fbState || {};
    if(!s.playerX && !s.playerO && !mySymbol){
      xoxBoard[idx] = xoxCurrent;
      xoxLocalAfterMove(idx);
      return;
    }

    const newBoard = [...xoxBoard];
    newBoard[idx] = xoxCurrent;

    const winCells = xoxCheckWin(newBoard, xoxCurrent, xoxSize, xoxWinLen);
    if(winCells){
      const patch = { board: newBoard, over:true, winner:xoxCurrent, winCells };
      if(xoxCurrent==='X') patch.scoreX = (s.scoreX||0)+1;
      else                  patch.scoreO = (s.scoreO||0)+1;
      pushState(patch);
    } else if(newBoard.every(v=>v)){
      pushState({ board: newBoard, over:true, winner:'draw', winCells:null });
    } else {
      const next = xoxCurrent==='X'?'O':'X';
      pushState({ board: newBoard, current: next, over:false, winner:null, winCells:null });
    }
  }

  /* --- Yerel (offline) hamle sonrası --- */
  function xoxLocalAfterMove(idx){
    xoxRenderBoard();
    const winCells = xoxCheckWin(xoxBoard, xoxCurrent, xoxSize, xoxWinLen);
    const statusEl = document.getElementById('xox-status');
    const turnEl   = document.getElementById('xox-turn-display');
    if(winCells){
      xoxOver=true;
      winCells.forEach(wi=>document.getElementById('xox-board').children[wi].classList.add('win-cell'));
      if(statusEl) statusEl.textContent='🎉 '+(xoxCurrent==='X'?'❌':'⭕')+' kazandı!';
      if(turnEl)   turnEl.textContent=(xoxCurrent==='X'?'❌':'⭕')+' Kazandı 🏆';
    } else if(xoxBoard.every(v=>v)){
      xoxOver=true;
      if(statusEl) statusEl.textContent='🤝 Berabere!';
    } else {
      xoxCurrent = xoxCurrent==='X'?'O':'X';
      if(turnEl){ turnEl.textContent='sıra: '+(xoxCurrent==='X'?'❌':'⭕'); turnEl.style.color=xoxCurrent==='X'?'#ff4d6d':'#9d4edd'; }
      if(statusEl) statusEl.textContent=(xoxCurrent==='X'?'❌':'⭕')+' hamleni yap!';
    }
  }

  /* --- Yeni oyun --- */
  window.xoxReset = function(){
    const s = fbState || {};
    const patch = {
      board: Array(xoxSize*xoxSize).fill(''),
      current:'X', over:false, winner:null, winCells:null, size:xoxSize,
      playerX: s.playerX||'', playerO: s.playerO||'',
      scoreX: s.scoreX||0, scoreO: s.scoreO||0
    };
    if(window.akDB) pushState(patch);
    else { xoxBoard=patch.board; xoxCurrent='X'; xoxOver=false; xoxRenderBoard(); }
  };

  /* --- Skoru sıfırla --- */
  window.xoxResetScore = function(){
    const s = fbState || {};
    pushState({ scoreX:0, scoreO:0, board:Array(xoxSize*xoxSize).fill(''), current:'X', over:false, winner:null, winCells:null, size:xoxSize, playerX:s.playerX||'', playerO:s.playerO||'' });
  };

  /* --- Odadan çık --- */
  window.xoxLeave = function(){
    if(!mySymbol){ return; }
    const s = fbState || {};
    const patch = {};
    if(mySymbol==='X') patch.playerX='';
    else               patch.playerO='';
    // Tahtayı da sıfırla
    patch.board=Array(xoxSize*xoxSize).fill('');
    patch.current='X'; patch.over=false; patch.winner=null; patch.winCells=null;
    pushState(patch);
    myName=''; mySymbol='';
    const jb = document.getElementById('xox-join-box');
    if(jb) jb.style.display='';
    const js = document.getElementById('xox-join-status');
    if(js) js.textContent='Odadan çıktın.';
  };

  /* --- Boyut değiştir --- */
  window.xoxSetSize = function(s){
    xoxSize=s; xoxWinLen=getWinLen(s);
    document.querySelectorAll('.xox-size-btn').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.size)===s));
    window.xoxReset();
  };

  /* --- Kazanma kontrolü --- */
  function xoxCheckWin(board, player, size, winLen){
    const idx=(r,c)=>r*size+c;
    for(let r=0;r<size;r++) for(let c=0;c<=size-winLen;c++){ const cs=Array.from({length:winLen},(_,k)=>idx(r,c+k)); if(cs.every(i=>board[i]===player)) return cs; }
    for(let c=0;c<size;c++) for(let r=0;r<=size-winLen;r++){ const cs=Array.from({length:winLen},(_,k)=>idx(r+k,c)); if(cs.every(i=>board[i]===player)) return cs; }
    for(let r=0;r<=size-winLen;r++) for(let c=0;c<=size-winLen;c++){ const cs=Array.from({length:winLen},(_,k)=>idx(r+k,c+k)); if(cs.every(i=>board[i]===player)) return cs; }
    for(let r=0;r<=size-winLen;r++) for(let c=winLen-1;c<size;c++){ const cs=Array.from({length:winLen},(_,k)=>idx(r+k,c-k)); if(cs.every(i=>board[i]===player)) return cs; }
    return null;
  }

  /* --- Enter ile katıl --- */
  document.addEventListener('DOMContentLoaded', ()=>{
    const inp = document.getElementById('xox-name-input');
    if(inp) inp.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); window.xoxJoin(); } });
    startFBListener();
    xoxRenderBoard();
  });
  if(document.readyState !== 'loading'){ startFBListener(); xoxRenderBoard(); }
})();

(function(){
// ---- CONFIG ----
const BASLANGIC = new Date("2026-06-26T00:00:00"); // ilk gün: 26 Haziran 2026
const TOPLAM_GUN = 81; // 26 Haziran → 14 Eylül 2026 = 81 gün
const KISILER = { kevser: "🩶", atakan: "💜" };

// ---- STATE ----
let aktifKisi = "kevser";
let gunlukGorünum = "calendar"; // "calendar" | "list"
let seciliGun = null;
let duzenlemeModu = false;
let duzenleKey = null;

// ---- YARDIMCI ----
function gunNo(n){ // 1-indexed
    const d = new Date(BASLANGIC);
    d.setDate(d.getDate() + n - 1);
    return d;
}
function bugunGun(){
    const diff = Math.floor((Date.now() - BASLANGIC.getTime()) / 86400000) + 1;
    return Math.min(Math.max(diff, 1), TOPLAM_GUN);
}
function formatTarih(d){
    return d.getDate().toString().padStart(2,"0") + "." + (d.getMonth()+1).toString().padStart(2,"0") + "." + d.getFullYear();
}
function dbPath(gun, kisi){ return "gunluk/gun" + gun + "/" + kisi; }
function historyPath(gun, kisi){ return "gunluk_history/gun" + gun + "/" + kisi; }

// ---- MODAL AÇMA/KAPAMA ----
window.openGunluk = function(){
    document.getElementById("gunluk-modal").style.display = "block";
    document.body.classList.add("modal-open");
    renderGunlukView();
};
window.closeGunluk = function(){
    document.getElementById("gunluk-modal").style.display = "none";
    // Başka modal açık değilse kaldır
    if(document.getElementById("kitap-modal").style.display === "none"){
        document.body.classList.remove("modal-open");
    }
};
window.closeGunlukOnBackdrop = function(e){
    if(e.target === document.getElementById("gunluk-modal")) closeGunluk();
};
window.closeGunlukDetail = function(){
    document.getElementById("gunluk-detail-modal").style.display = "none";
    seciliGun = null; duzenlemeModu = false; duzenleKey = null;
};
window.closeGunlukDetailOnBackdrop = function(e){
    if(e.target === document.getElementById("gunluk-detail-modal")) closeGunlukDetail();
};

// ---- KİŞİ SEÇİCİ ----
window.setGunlukKisi = function(kisi){
    aktifKisi = kisi;
    document.querySelectorAll(".gkisi-btn").forEach(b=>{
        const isActive = b.dataset.kisi === kisi;
        if(kisi==="kevser"){
            b.style.background = isActive ? "rgba(176,176,176,0.25)" : "rgba(176,176,176,0.05)";
            b.style.borderColor = isActive ? "rgba(176,176,176,0.6)" : "rgba(176,176,176,0.15)";
            b.style.color = isActive ? "#f0f0f0" : "#888";
        } else if(kisi==="atakan"){
            b.style.background = isActive ? "rgba(123,44,191,0.3)" : (b.dataset.kisi==="kevser"?"rgba(176,176,176,0.05)":"rgba(123,44,191,0.08)");
            b.style.borderColor = isActive ? "rgba(123,44,191,0.65)" : "";
            b.style.color = isActive ? "#d8b4fe" : (b.dataset.kisi==="kevser"?"#888":"#c4a0ff");
        } else {
            b.style.background = isActive ? "rgba(255,255,255,0.15)" : "";
            b.style.borderColor = isActive ? "rgba(255,255,255,0.3)" : "";
            b.style.color = isActive ? "#fff" : "";
        }
    });
    renderGunlukView();
};

// ---- GÖRÜNÜM TOGGLE ----
window.toggleGunlukView = function(){
    gunlukGorünum = gunlukGorünum === "calendar" ? "list" : "calendar";
    document.getElementById("gunluk-view-btn").textContent = gunlukGorünum === "calendar" ? "📅" : "📋";
    document.getElementById("gunluk-calendar-view").style.display = gunlukGorünum === "calendar" ? "block" : "none";
    document.getElementById("gunluk-list-view").style.display = gunlukGorünum === "list" ? "flex" : "none";
    document.getElementById("gunluk-history-view").style.display = "none";
    renderGunlukView();
};

// ---- GEÇMİŞ TOGGLE ----
window.toggleGunlukHistory = function(){
    const hv = document.getElementById("gunluk-history-view");
    const cv = document.getElementById("gunluk-calendar-view");
    const lv = document.getElementById("gunluk-list-view");
    const isOpen = hv.style.display === "flex";
    if(isOpen){
        hv.style.display = "none";
        if(gunlukGorünum==="calendar"){ cv.style.display="block"; lv.style.display="none"; }
        else { cv.style.display="none"; lv.style.display="flex"; }
    } else {
        hv.style.display = "flex";
        cv.style.display = "none";
        lv.style.display = "none";
        renderHistoryView();
    }
};

// ---- ANA RENDER ----
function renderGunlukView(){
    if(!window.akDB){ renderOffline(); return; }
    const bugun = bugunGun();
    document.getElementById("gunluk-progress-label").textContent =
        bugun + ". gün · 26 Haz – 14 Eyl · " + (TOPLAM_GUN - bugun) + " gün kaldı";
    if(gunlukGorünum === "calendar") renderCalendar(bugun);
    else renderList(bugun);
}

function renderOffline(){
    document.getElementById("gunluk-progress-label").textContent = "bağlantı bekleniyor...";
}

// ---- TAKVİM GÖRÜNÜMÜ ----
function renderCalendar(bugun){
    const grid = document.getElementById("gunluk-calendar-grid");
    grid.innerHTML = "";
    // Tüm günlerin verilerini Firebase'den çekiyoruz
    window.akDB.ref("gunluk").once("value").then(snap=>{
        const data = snap.val() || {};
        for(let g=1; g<=TOPLAM_GUN; g++){
            const gunData = data["gun"+g] || {};
            const hasKevser = !!(gunData.kevser && gunData.kevser.metin);
            const hasAtakan = !!(gunData.atakan && gunData.atakan.metin);
            const isToday = g === bugun;
            const isFuture = g > bugun;
            const isFilled = aktifKisi==="hepsi" ? (hasKevser||hasAtakan) : 
                            aktifKisi==="kevser" ? hasKevser : hasAtakan;
            const isBoth = hasKevser && hasAtakan;

            const cell = document.createElement("div");
            cell.style.cssText = `
                aspect-ratio:1; border-radius:8px; display:flex; align-items:center; justify-content:center;
                font-size:10px; font-weight:700; cursor:${isFuture?"not-allowed":"pointer"};
                position:relative; transition:all 0.15s ease;
                border: 1px solid ${isToday ? "rgba(255,77,109,0.7)" : "rgba(255,255,255,0.07)"};
                background: ${isFuture ? "rgba(255,255,255,0.02)" :
                              isBoth ? "linear-gradient(135deg,rgba(176,176,176,0.22),rgba(123,44,191,0.22))" :
                              hasKevser ? "rgba(176,176,176,0.22)" :
                              hasAtakan ? "rgba(123,44,191,0.28)" :
                              "rgba(255,255,255,0.05)"};
                opacity: ${isFuture ? "0.3" : "1"};
                box-shadow: ${isToday ? "0 0 0 2px rgba(255,77,109,0.5)" : "none"};
                color: ${isFuture ? "#555" : "#ddd"};
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                touch-action: manipulation;
                -webkit-touch-callout: none;
            `;
            cell.textContent = g;
            if(isToday){
                const dot = document.createElement("div");
                dot.style.cssText = "position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:#ff4d6d;";
                cell.appendChild(dot);
            }
            if(!isFuture){
                cell.addEventListener("click", ()=> openGunDetail(g, data["gun"+g]||{}));
                cell.addEventListener("mouseover", ()=>{ cell.style.transform="scale(1.08)"; cell.style.zIndex="5"; });
                cell.addEventListener("mouseout", ()=>{ cell.style.transform="scale(1)"; cell.style.zIndex=""; });
            }
            grid.appendChild(cell);
        }
    }).catch(()=>renderOffline());
}

// ---- LİSTE GÖRÜNÜMÜ ----
function renderList(bugun){
    const list = document.getElementById("gunluk-list-view");
    list.innerHTML = '<div style="opacity:0.5;font-size:12px;text-align:center;padding:8px;">yükleniyor...</div>';
    window.akDB.ref("gunluk").once("value").then(snap=>{
        const data = snap.val() || {};
        list.innerHTML = "";
        // Sadece dolu günleri listele
        for(let g=bugun; g>=1; g--){
            const gunData = data["gun"+g] || {};
            const hasKevser = !!(gunData.kevser && gunData.kevser.metin);
            const hasAtakan = !!(gunData.atakan && gunData.atakan.metin);
            const show = aktifKisi==="hepsi" ? (hasKevser||hasAtakan) :
                         aktifKisi==="kevser" ? hasKevser : hasAtakan;
            if(!show) continue;
            const tarih = formatTarih(gunNo(g));
            const el = document.createElement("div");
            el.style.cssText = `
                padding:12px 16px; border-radius:14px; background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.08); cursor:pointer; transition:all 0.2s;
                -webkit-tap-highlight-color:transparent; user-select:none; touch-action:manipulation;
            `;
            let preview = "";
            if((aktifKisi==="kevser"||aktifKisi==="hepsi") && hasKevser){
                preview += `<div style="font-size:12px;opacity:0.8;margin-top:4px;">🩶 ${gunData.kevser.metin.substring(0,55)}${gunData.kevser.metin.length>55?"...":""}</div>`;
            }
            if((aktifKisi==="atakan"||aktifKisi==="hepsi") && hasAtakan){
                preview += `<div style="font-size:12px;opacity:0.8;margin-top:4px;">💜 ${gunData.atakan.metin.substring(0,55)}${gunData.atakan.metin.length>55?"...":""}</div>`;
            }
            el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-family:'Playfair Display',serif;font-size:14px;font-weight:600;">${g}. gün</span>
                <span style="font-size:11px;opacity:0.5;">${tarih}</span>
            </div>${preview}`;
            el.addEventListener("click", ()=> openGunDetail(g, data["gun"+g]||{}));
            el.addEventListener("mouseover", ()=>{ el.style.borderColor="rgba(123,44,191,0.4)"; el.style.background="rgba(123,44,191,0.08)"; });
            el.addEventListener("mouseout", ()=>{ el.style.borderColor="rgba(255,255,255,0.08)"; el.style.background="rgba(255,255,255,0.04)"; });
            list.appendChild(el);
        }
        if(!list.children.length){
            list.innerHTML = '<div style="opacity:0.45;font-size:13px;text-align:center;padding:20px;">henüz hiç yazı yok 🥺</div>';
        }
    });
}

// ---- GEÇMİŞ GÖRÜNÜMÜ (Son 5 düzenleme - her ikisi için de) ----
function renderHistoryView(){
    const hv = document.getElementById("gunluk-history-view");
    hv.innerHTML = '<div style="opacity:0.5;font-size:12px;text-align:center;padding:8px;">geçmiş yükleniyor...</div>';
    if(!window.akDB){ hv.innerHTML = '<div style="opacity:0.45;font-size:13px;text-align:center;padding:20px;">bağlantı yok</div>'; return; }
    window.akDB.ref("gunluk_history").once("value").then(snap=>{
        const data = snap.val() || {};
        hv.innerHTML = "";

        // Başlık
        const baslik = document.createElement("div");
        baslik.style.cssText = "font-size:11px;letter-spacing:1px;text-transform:uppercase;opacity:0.55;margin-bottom:12px;text-align:center;";
        baslik.textContent = "son 5 düzenleme · her ikisi için";
        hv.appendChild(baslik);

        const entries = [];
        Object.keys(data).forEach(gunKey=>{
            Object.keys(data[gunKey]).forEach(kisi=>{
                Object.keys(data[gunKey][kisi]).forEach(ts=>{
                    entries.push({ gun: parseInt(gunKey.replace("gun","")), kisi, ts: parseInt(ts), metin: data[gunKey][kisi][ts] });
                });
            });
        });
        entries.sort((a,b)=>b.ts-a.ts);
        if(!entries.length){
            hv.innerHTML += '<div style="opacity:0.45;font-size:13px;text-align:center;padding:20px;">henüz düzenleme geçmişi yok</div>';
            return;
        }
        // İkisi için ayrı ayrı son 5'i bul
        const kevserEntries = entries.filter(e=>e.kisi==="kevser").slice(0,5);
        const atakanEntries = entries.filter(e=>e.kisi==="atakan").slice(0,5);

        function renderGroup(label, color, items){
            if(!items.length) return;
            const grpLabel = document.createElement("div");
            grpLabel.style.cssText = `font-size:12px;font-weight:700;margin:10px 0 6px;color:${color};`;
            grpLabel.textContent = label + " — son 5 düzenleme";
            hv.appendChild(grpLabel);
            items.forEach(e=>{
                const d = new Date(e.ts);
                const zaman = d.getDate().toString().padStart(2,"0")+"."+(d.getMonth()+1).toString().padStart(2,"0")+"."+d.getFullYear()+" "+d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
                const el = document.createElement("div");
                el.style.cssText = "padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);margin-bottom:6px;cursor:pointer;";
                el.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                        <span style="font-size:12px;font-weight:600;">${e.kisi==="kevser"?"🩶 kevser":"💜 atakan"} · ${e.gun}. gün</span>
                        <span style="font-size:10px;opacity:0.5;">${zaman}</span>
                    </div>
                    <div style="font-size:12px;opacity:0.75;font-style:italic;">"${e.metin.substring(0,80)}${e.metin.length>80?"...":""}"</div>
                `;
                hv.appendChild(el);
            });
        }

        renderGroup("🩶 kevser", "#c8c8c8", kevserEntries);
        renderGroup("💜 atakan", "#c4a0ff", atakanEntries);
    });
}

// ---- TEMA RESMİ OTOMATİK BULMA ----
// "temalar/1.png" olması gereken ama farklı uzantı/büyük-küçük harfle
// yüklenmiş olabilecek tema resmini otomatik tespit eder ve
// --tema-img CSS değişkenini günceller. Böylece dosya adı
// "1.PNG", "1.jpg", "1.jpeg", "1.webp" gibi farklı olsa bile tema kırılmaz.
window.TEMA_ACTIVE_URL = "temalar/1.png";
(function resolveTemaImg(){
    const adaylar = [
        "temalar/1.png", "temalar/1.PNG", "temalar/1.Png",
        "temalar/1.jpg", "temalar/1.JPG", "temalar/1.jpeg",
        "temalar/1.webp", "temalar/1.PNG".toLowerCase()
    ];
    let bulunduMu = false;
    let denenenSayisi = 0;

    function dene(i){
        if(bulunduMu || i >= adaylar.length) return;
        const test = new Image();
        test.onload = function(){
            if(bulunduMu) return;
            bulunduMu = true;
            window.TEMA_ACTIVE_URL = adaylar[i];
            document.documentElement.style.setProperty("--tema-img", `url('${adaylar[i]}')`);
            const img = document.getElementById("gunluk-tema-img");
            if(img){ img.src = adaylar[i]; img.style.display = "block"; }
            if(typeof kitapBgGuncelle === "function") kitapBgGuncelle();
            if(i > 0) console.info("[tema] temalar/1.png bulunamadı, otomatik olarak kullanılan dosya:", adaylar[i]);
        };
        test.onerror = function(){
            denenenSayisi++;
            dene(i+1);
            if(denenenSayisi === adaylar.length){
                console.warn("[tema] 'temalar' klasöründe 1.png/1.jpg/1.jpeg/1.webp (büyük-küçük harf dahil) bulunamadı. Lütfen dosyanın index.html ile aynı dizindeki 'temalar' klasöründe ve tam olarak '1.png' adıyla yüklendiğinden emin olun.");
            }
        };
        test.src = adaylar[i];
    }
    dene(0);
})();

function loadTemaImg(){
    const img = document.getElementById("gunluk-tema-img");
    if(!img) return;
    img.src = window.TEMA_ACTIVE_URL || "temalar/1.png";
    img.style.display = "block";
}

// ---- GÜN DETAY AÇ ----
function openGunDetail(gun, gunData){
    seciliGun = gun;
    duzenlemeModu = false;
    duzenleKey = null;
    const tarih = formatTarih(gunNo(gun));
    document.getElementById("gunluk-detail-title").textContent = gun + ". gün · " + tarih;

    // Tema resmi yükle
    loadTemaImg(gun);

    renderDetailRead(gun, gunData);

    // Yaz alanı: kişi seçiliyse hazır, hepsi modunda yine seçtir
    const writeKisi = aktifKisi === "hepsi" ? null : aktifKisi;
    const yazLabel = document.getElementById("gunluk-write-label");
    if(writeKisi){
        yazLabel.textContent = (KISILER[writeKisi]||"") + " " + writeKisi + " olarak yaz";
    } else {
        yazLabel.textContent = "yazmak için önce kevser ya da atakan seç";
    }
    document.getElementById("gunluk-textarea").value = "";
    document.getElementById("gunluk-edit-note").textContent = "";
    document.getElementById("gunluk-edit-toggle").style.display = "none";

    // Yorumları yükle
    renderGunlukYorumlar(gun);

    // Yorum yazarken kim olarak yazılacağını başlat (aktif kişiyle başlar, sonra değiştirilebilir)
    yorumYazKisi = aktifKisi === "hepsi" ? (yorumYazKisi || "kevser") : aktifKisi;
    syncYorumKisiUI();
    document.getElementById("gunluk-yorum-textarea").value = "";

    // İleri / geri gün butonlarının durumunu güncelle
    const bugunLim = bugunGun();
    const prevBtn = document.getElementById("gunluk-detail-prev");
    const nextBtn = document.getElementById("gunluk-detail-next");
    if(prevBtn) prevBtn.style.opacity = gun <= 1 ? "0.25" : "1";
    if(nextBtn) nextBtn.style.opacity = gun >= bugunLim ? "0.25" : "1";

    document.getElementById("gunluk-detail-modal").style.display = "block";
}

// ---- GÜN DETAYINDA İLERİ / GERİ GİT ----
window.gunlukDetailGit = function(yon){
    if(seciliGun === null) return;
    const yeniGun = seciliGun + yon;
    const bugunLim = bugunGun();
    if(yeniGun < 1 || yeniGun > bugunLim) return;
    if(!window.akDB) return;
    window.akDB.ref("gunluk/gun" + yeniGun).once("value").then(snap=>{
        openGunDetail(yeniGun, snap.val() || {});
    }).catch(()=>{});
};

// ---- YORUM YAZARKEN KİŞİ SEÇ ----
let yorumYazKisi = "kevser";

function syncYorumKisiUI(){
    document.querySelectorAll(".yorum-kisi-btn").forEach(b=>{
        const isMe = b.dataset.k === yorumYazKisi;
        b.style.opacity = isMe ? "1" : "0.4";
        b.style.fontWeight = isMe ? "700" : "500";
    });
    const av = document.getElementById("gunluk-yorum-avatar");
    if(av){
        if(yorumYazKisi === "kevser"){ av.textContent = "🩶"; av.style.background = "linear-gradient(135deg,#b0b0b0,#888)"; }
        else { av.textContent = "💜"; av.style.background = "linear-gradient(135deg,#7b2cbf,#4a0e8f)"; }
    }
}

window.setYorumYazKisi = function(k){
    yorumYazKisi = k;
    syncYorumKisiUI();
};

// ---- YORUMLAR ----
function yorumPath(gun){ return "gunluk_yorumlar/gun" + gun; }

function renderGunlukYorumlar(gun){
    const list = document.getElementById("gunluk-yorumlar-list");
    if(!list) return;
    list.innerHTML = '<div style="font-size:11px;opacity:0.4;padding:4px 0;">yükleniyor...</div>';
    if(!window.akDB){ list.innerHTML = '<div style="font-size:11px;opacity:0.4;">bağlantı yok</div>'; return; }
    window.akDB.ref(yorumPath(gun)).orderByChild("ts").limitToLast(30).once("value").then(snap=>{
        list.innerHTML = "";
        const yorumlar = [];
        snap.forEach(ch=>{ yorumlar.push({id:ch.key, ...ch.val()}); });
        if(!yorumlar.length){
            list.innerHTML = '<div style="font-size:11px;opacity:0.35;padding:4px 0;">henüz yorum yok, ilk sen yaz 💬</div>';
            return;
        }
        // En yeniden eskiye
        yorumlar.reverse().forEach(y=>{
            const el = document.createElement("div");
            el.style.cssText = "display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);";
            const isKev = y.kisi==="kevser";
            const avatarBg = isKev ? "linear-gradient(135deg,#b0b0b0,#888)" : "linear-gradient(135deg,#7b2cbf,#4a0e8f)";
            const emoji = isKev ? "🩶" : "💜";
            const d = new Date(y.ts);
            const zaman = d.getDate().toString().padStart(2,"0")+"."+(d.getMonth()+1).toString().padStart(2,"0")+" "+d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
            el.innerHTML = `
                <div style="width:26px;height:26px;border-radius:50%;background:${avatarBg};display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">${emoji}</div>
                <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                        <span style="font-size:12px;font-weight:700;color:${isKev?"#c8c8c8":"#c4a0ff"};">${y.kisi}</span>
                        <span style="font-size:10px;opacity:0.4;">${zaman}</span>
                    </div>
                    <div style="font-size:13px;line-height:1.5;color:#e0e0e0;">${y.metin.replace(/\n/g,"<br>")}</div>
                </div>
            `;
            list.appendChild(el);
        });
    }).catch(()=>{ list.innerHTML = '<div style="font-size:11px;opacity:0.4;">yorumlar yüklenemedi</div>'; });
}

window.saveGunlukYorum = function(){
    if(!window.akDB){ alert("Bağlantı yok"); return; }
    const yazKisi = yorumYazKisi;
    if(!yazKisi){ alert("Önce kevser ya da atakan'ı seç 💜"); return; }
    const metin = document.getElementById("gunluk-yorum-textarea").value.trim();
    if(!metin){ alert("Bir şeyler yaz 🥺"); return; }
    const gun = seciliGun;
    const yorum = { kisi: yazKisi, metin, ts: Date.now() };
    window.akDB.ref(yorumPath(gun)).push(yorum).then(()=>{
        document.getElementById("gunluk-yorum-textarea").value = "";
        renderGunlukYorumlar(gun);
    }).catch(err=>alert("Kaydedilemedi: "+err.message));
};

function renderDetailRead(gun, gunData){
    const readDiv = document.getElementById("gunluk-detail-read");
    readDiv.innerHTML = "";
    const kisiler = aktifKisi === "hepsi" ? ["kevser","atakan"] : [aktifKisi];
    let anyContent = false;
    kisiler.forEach(kisi=>{
        const entry = gunData[kisi];
        if(entry && entry.metin){
            anyContent = true;
            const el = document.createElement("div");
            el.style.cssText = `margin-bottom:14px; padding:14px 16px; border-radius:14px;
                background:${kisi==="kevser"?"rgba(176,176,176,0.09)":"rgba(123,44,191,0.12)"};
                border:1px solid ${kisi==="kevser"?"rgba(176,176,176,0.2)":"rgba(123,44,191,0.25)"};`;
            const zaman = entry.zaman ? `<span style="font-size:10px;opacity:0.5;margin-left:6px;">${entry.zaman}</span>` : "";
            el.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:13px;font-weight:700;">${KISILER[kisi]} ${kisi}</span>
                    ${zaman}
                    ${kisi===aktifKisi||aktifKisi==="hepsi" ? `<button onclick="startEdit('${kisi}',\`${entry.metin.replace(/`/g,"\\`")}\`)" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:#aaa;padding:4px 10px;border-radius:9px;cursor:pointer;font-size:11px;">✏️ düzenle</button>` : ""}
                </div>
                <div style="font-size:14px;line-height:1.7;color:#e8e8e8;font-family:'Playfair Display',serif;font-style:italic;">${entry.metin.replace(/\n/g,"<br>")}</div>
            `;
            readDiv.appendChild(el);
        }
    });
    if(!anyContent){
        readDiv.innerHTML = '<div style="opacity:0.4;font-size:13px;text-align:center;padding:20px;font-style:italic;">bu gün henüz boş... ilk sen yaz 🌿</div>';
    }
}

// ---- DÜZENLEME BAŞLAT ----
window.startEdit = function(kisi, metin){
    duzenlemeModu = true;
    duzenleKey = kisi;
    document.getElementById("gunluk-textarea").value = metin;
    document.getElementById("gunluk-edit-note").textContent = "✏️ " + kisi + " notunu düzenliyorsun";
    document.getElementById("gunluk-edit-toggle").style.display = "none";
    document.getElementById("gunluk-textarea").focus();
};

window.toggleGunlukEdit = function(){};

// ---- KAYDET ----
window.saveGunlukEntry = function(){
    if(!window.akDB){ alert("Bağlantı yok, şu an kaydedilemez."); return; }
    const yazKisi = aktifKisi === "hepsi" ? duzenleKey : aktifKisi;
    if(!yazKisi){ alert("Önce kevser ya da atakan'ı seç 💜"); return; }
    const metin = document.getElementById("gunluk-textarea").value.trim();
    if(!metin){ alert("Bir şeyler yaz önce 🥺"); return; }
    const gun = seciliGun;
    const d = new Date();
    const zaman = d.getDate().toString().padStart(2,"0")+"."+(d.getMonth()+1).toString().padStart(2,"0")+"."+d.getFullYear()+" "+d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");

    // Varsa eski metni geçmişe kaydet
    window.akDB.ref(dbPath(gun, yazKisi)).once("value").then(snap=>{
        const old = snap.val();
        if(old && old.metin){
            const ts = Date.now();
            window.akDB.ref(historyPath(gun, yazKisi) + "/" + ts).set(old.metin);
        }
        // Yeni metni kaydet
        return window.akDB.ref(dbPath(gun, yazKisi)).set({ metin, zaman });
    }).then(()=>{
        // Detayı yenile
        window.akDB.ref("gunluk/gun"+gun).once("value").then(snap=>{
            renderDetailRead(gun, snap.val()||{});
        });
        document.getElementById("gunluk-textarea").value = "";
        document.getElementById("gunluk-edit-note").textContent = "✅ kaydedildi";
        duzenlemeModu = false; duzenleKey = null;
        setTimeout(()=>{ document.getElementById("gunluk-edit-note").textContent = ""; }, 2000);
        // Ana takvimi de yenile
        renderGunlukView();
    }).catch(err=>{ alert("Kaydedilemedi: "+err.message); });
};

// ---- OTOMATIK GİRİŞ SONRASI BAŞLATMA ----
const _origExecLogin = window.executeLogin || null;
document.addEventListener("DOMContentLoaded", ()=>{});

// ======== KİTAP MODU (YENİDEN YAZILDI) ========
let kitapAktifGun = 1;
let kitapFlipping = false;
let kitapYazKisi = "kevser";
let kitapTumVeri = {};

// ---- TEMA YARDIMCISI (otomatik tespit edilen tema resmi) ----
function kitapTemaUrl(){
    return window.TEMA_ACTIVE_URL || "temalar/1.png";
}

// Blurlu arka planı sabit temaya ayarla (sayfa resimleri artık CSS ile geliyor)
function kitapBgGuncelle(){
    const bg = document.getElementById("kitap-bg");
    if(bg){
        bg.style.backgroundImage = `url('${kitapTemaUrl()}')`;
    }
}

// ---- İÇERİK HTML'İ (sadece metin — tema resmi ayrı DOM'da) ----
function kitapSayfaIcerik(gun){
    if(gun < 1 || gun > TOPLAM_GUN) return "";
    const gd = kitapTumVeri["gun"+gun] || {};
    const tarih = formatTarih(gunNo(gun));

    let html = `<div style="font-size:9px;opacity:0.3;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;color:#c4a0ff;">${tarih}</div>`;

    const kevser = gd.kevser;
    const atakan = gd.atakan;

    if(!kevser && !atakan){
        html += `<div style="opacity:0.15;font-size:12px;text-align:center;margin-top:40px;font-style:italic;color:#c4a0ff;">henüz yazılmamış…</div>`;
    }
    if(kevser && kevser.metin){
        html += `<div class="kitap-not-kevser">
            <div class="kitap-not-label" style="color:#b0b0b0;">🩶 kevser</div>
            <div class="kitap-not-metin" style="color:#d0d0d0;">${kevser.metin.replace(/\n/g,"<br>")}</div>
            ${kevser.zaman ? `<div class="kitap-not-zaman" style="color:#b0b0b0;">${kevser.zaman}</div>` : ""}
        </div>`;
    }
    if(atakan && atakan.metin){
        html += `<div class="kitap-not-atakan">
            <div class="kitap-not-label" style="color:#c4a0ff;">💜 atakan</div>
            <div class="kitap-not-metin" style="color:#d8c8ff;">${atakan.metin.replace(/\n/g,"<br>")}</div>
            ${atakan.zaman ? `<div class="kitap-not-zaman" style="color:#c4a0ff;">${atakan.zaman}</div>` : ""}
        </div>`;
    }
    return html;
}

// ---- ANA RENDER ----
function renderKitapSayfa(){
    const gun = kitapAktifGun;
    const solGun = gun - 1;
    const bugun = bugunGun();
    const tarih = formatTarih(gunNo(gun));

    // Üst bar
    document.getElementById("kitap-gun-label").textContent = gun + ". gün";
    document.getElementById("kitap-tarih-label").textContent = tarih;

    // Sol sayfa içerik
    if(solGun >= 1){
        document.getElementById("kitap-sol-icerik").innerHTML = kitapSayfaIcerik(solGun);
        document.getElementById("kitap-sol-sayfa").textContent = (solGun * 2 - 1) + " · " + (solGun * 2);
    } else {
        document.getElementById("kitap-sol-icerik").innerHTML = `<div style="opacity:0.08;text-align:center;margin-top:60px;font-size:32px;">📖</div>`;
        document.getElementById("kitap-sol-sayfa").textContent = "";
    }

    // Sağ sayfa içerik
    document.getElementById("kitap-sag-icerik").innerHTML = kitapSayfaIcerik(gun);
    document.getElementById("kitap-sag-sayfa").textContent = (gun * 2 - 1) + " · " + (gun * 2);

    // Tema resimleri + arka plan
    kitapBgGuncelle(gun);

    // Progress
    const pct = Math.round(((gun - 1) / Math.max(TOPLAM_GUN - 1, 1)) * 100);
    document.getElementById("kitap-progress-bar").style.width = pct + "%";
    document.getElementById("kitap-progress-text").textContent = gun + " / " + TOPLAM_GUN;

    // Butonlar
    document.getElementById("kitap-prev-btn").style.opacity = gun <= 1 ? "0.2" : "1";
    document.getElementById("kitap-next-btn").style.opacity = gun >= bugun ? "0.2" : "1";
    document.getElementById("kitap-yaz-btn").style.display = gun <= bugun ? "block" : "none";
}

// ---- MODAL AÇ/KAPAT ----
window.toggleKitapModu = function(){
    closeGunluk();
    kitapAktifGun = bugunGun();
    openKitapModu();
};

window.openKitapModu = function(){
    document.getElementById("kitap-modal").style.display = "block";
    document.body.classList.add("modal-open");
    if(!window.akDB){ renderKitapSayfa(); return; }
    window.akDB.ref("gunluk").on("value", snap=>{
        kitapTumVeri = snap.val() || {};
        renderKitapSayfa();
    });
};

window.closeKitapModu = function(){
    kitapOtomatikDurdur();
    document.getElementById("kitap-modal").style.display = "none";
    if(window.akDB) window.akDB.ref("gunluk").off();
    if(document.getElementById("gunluk-modal").style.display === "none"){
        document.body.classList.remove("modal-open");
    }
};

// ---- OTOMATİK SAYFA ÇEVİRME (OYNAT) ----
let kitapOtomatikTimer = null;

window.toggleKitapPlayMenu = function(e){
    if(e) e.stopPropagation();
    document.getElementById("kitap-play-menu").classList.toggle("show");
};

window.kitapOtomatikBaslat = function(saniye){
    kitapOtomatikDurdur();
    document.getElementById("kitap-play-menu").classList.remove("show");
    document.getElementById("kitap-play-btn").classList.add("active");
    document.getElementById("kitap-play-btn").textContent = "⏸";
    kitapOtomatikTimer = setInterval(()=>{
        if(kitapAktifGun >= bugunGun()){ kitapOtomatikDurdur(); return; }
        if(!kitapFlipping) window.kitapSayfa(1);
    }, saniye * 1000);
};

window.kitapOtomatikDurdur = function(){
    if(kitapOtomatikTimer){ clearInterval(kitapOtomatikTimer); kitapOtomatikTimer = null; }
    const btn = document.getElementById("kitap-play-btn");
    if(btn){ btn.classList.remove("active"); btn.textContent = "▶"; }
    const menu = document.getElementById("kitap-play-menu");
    if(menu) menu.classList.remove("show");
};

// Menü dışına tıklanınca kapansın
document.addEventListener("click", (e)=>{
    const menu = document.getElementById("kitap-play-menu");
    const btn = document.getElementById("kitap-play-btn");
    if(menu && menu.classList.contains("show") && !menu.contains(e.target) && e.target !== btn){
        menu.classList.remove("show");
    }
});

// ---- SAYFA ÇEVİRME ----
function _kitapUI(gun){
    const bugun = bugunGun();
    const tarih = formatTarih(gunNo(gun));
    document.getElementById("kitap-gun-label").textContent = gun + ". gün";
    document.getElementById("kitap-tarih-label").textContent = tarih;
    const pct = Math.round(((gun - 1) / Math.max(TOPLAM_GUN - 1, 1)) * 100);
    document.getElementById("kitap-progress-bar").style.width = pct + "%";
    document.getElementById("kitap-progress-text").textContent = gun + " / " + TOPLAM_GUN;
    document.getElementById("kitap-prev-btn").style.opacity = gun <= 1 ? "0.2" : "1";
    document.getElementById("kitap-next-btn").style.opacity = gun >= bugun ? "0.2" : "1";
    document.getElementById("kitap-yaz-btn").style.display = gun <= bugun ? "block" : "none";
}

window.kitapSayfa = function(yon){
    if(kitapFlipping) return;
    const yeniGun = kitapAktifGun + yon;
    if(yeniGun < 1 || yeniGun > bugunGun()) return;

    kitapFlipping = true;
    const flipEl    = document.getElementById("kitap-flip-el");
    const flipFront = document.getElementById("kitap-flip-front");
    const flipBack  = document.getElementById("kitap-flip-back");
    const sagEl     = document.getElementById("kitap-sag");
    const solEl     = document.getElementById("kitap-sol");
    const sagW      = sagEl.offsetWidth;
    const solW      = solEl.offsetWidth;
    const ciltW     = document.getElementById("kitap-cilt").offsetWidth;

    if(yon === 1){
        // İLERİ: sağ sayfa sola kıvrılır
        // Flip yüzüne mevcut sağ sayfanın içeriğini koy
        flipFront.innerHTML = document.getElementById("kitap-sag-icerik").innerHTML;
        flipBack.innerHTML  = kitapSayfaIcerik(yeniGun - 1 >= 1 ? yeniGun - 1 : kitapAktifGun);

        // Konum: govde içinde, solW + ciltW kadar sağdan başla (relative)
        flipEl.style.width        = sagW + "px";
        flipEl.style.height       = sagEl.offsetHeight + "px";
        flipEl.style.left         = (solW + ciltW) + "px";
        flipEl.style.top          = "0px";
        flipEl.style.transformOrigin = "left center";
        flipEl.style.transform    = "rotateY(0deg)";
        flipEl.style.transition   = "";
        flipEl.style.display      = "block";

        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            flipEl.style.transition = "transform 0.6s cubic-bezier(0.45,0,0.2,1)";
            flipEl.style.transform  = "rotateY(-180deg)";
        }));

        // Animasyon ortasında arka planda içeriği güncelle (flip kapattığı için görünmez)
        setTimeout(()=>{
            document.getElementById("kitap-sag-icerik").innerHTML = kitapSayfaIcerik(yeniGun);
            document.getElementById("kitap-sag-sayfa").textContent = (yeniGun * 2 - 1) + " \xb7 " + (yeniGun * 2);
            if(yeniGun - 1 >= 1){
                document.getElementById("kitap-sol-icerik").innerHTML = kitapSayfaIcerik(yeniGun - 1);
                document.getElementById("kitap-sol-sayfa").textContent = ((yeniGun-1)*2-1) + " \xb7 " + ((yeniGun-1)*2);
            }
        }, 300);

        setTimeout(()=>{
            kitapAktifGun = yeniGun;
            flipEl.style.display = "none";
            kitapFlipping = false;
            kitapBgGuncelle();
            _kitapUI(yeniGun);
        }, 620);

    } else {
        // GERİ: sol sayfa sağa kıvrılır
        flipFront.innerHTML = document.getElementById("kitap-sol-icerik").innerHTML;
        flipBack.innerHTML  = kitapSayfaIcerik(yeniGun);

        flipEl.style.width        = solW + "px";
        flipEl.style.height       = solEl.offsetHeight + "px";
        flipEl.style.left         = "0px";
        flipEl.style.top          = "0px";
        flipEl.style.transformOrigin = "right center";
        flipEl.style.transform    = "rotateY(0deg)";
        flipEl.style.transition   = "";
        flipEl.style.display      = "block";

        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            flipEl.style.transition = "transform 0.6s cubic-bezier(0.45,0,0.2,1)";
            flipEl.style.transform  = "rotateY(180deg)";
        }));

        setTimeout(()=>{
            document.getElementById("kitap-sag-icerik").innerHTML = kitapSayfaIcerik(yeniGun);
            document.getElementById("kitap-sag-sayfa").textContent = (yeniGun * 2 - 1) + " \xb7 " + (yeniGun * 2);
            if(yeniGun - 1 >= 1){
                document.getElementById("kitap-sol-icerik").innerHTML = kitapSayfaIcerik(yeniGun - 1);
                document.getElementById("kitap-sol-sayfa").textContent = ((yeniGun-1)*2-1) + " \xb7 " + ((yeniGun-1)*2);
            } else {
                document.getElementById("kitap-sol-icerik").innerHTML = "<div style=\"opacity:0.08;text-align:center;margin-top:60px;font-size:32px;\">\uD83D\uDCD6</div>";
                document.getElementById("kitap-sol-sayfa").textContent = "";
            }
        }, 300);

        setTimeout(()=>{
            kitapAktifGun = yeniGun;
            flipEl.style.display = "none";
            kitapFlipping = false;
            kitapBgGuncelle();
            _kitapUI(yeniGun);
        }, 620);
    }
};

// ---- TOUCH KAYDIR ----
(function(){
    let tx = 0;
    document.addEventListener("touchstart", e=>{
        if(document.getElementById("kitap-modal").style.display !== "none")
            tx = e.touches[0].clientX;
    },{passive:true});
    document.addEventListener("touchend", e=>{
        if(document.getElementById("kitap-modal").style.display === "none") return;
        const dx = tx - e.changedTouches[0].clientX;
        if(Math.abs(dx) > 45){ if(window.kitapOtomatikDurdur) window.kitapOtomatikDurdur(); window.kitapSayfa(dx > 0 ? 1 : -1); }
    },{passive:true});
})();

// ---- KİTAP NOT YAZMA ----
window.kitapNotEkle = function(){
    document.getElementById("kitap-yaz-title").textContent = kitapAktifGun + ". güne not ekle";
    kitapYazKisi = "kevser";
    syncKitapYazKisiUI();
    const gd = kitapTumVeri["gun"+kitapAktifGun] || {};
    document.getElementById("kitap-yaz-textarea").value = (gd.kevser && gd.kevser.metin) ? gd.kevser.metin : "";
    document.getElementById("kitap-yaz-modal").style.display = "block";
    setTimeout(()=> document.getElementById("kitap-yaz-textarea").focus(), 100);
};

window.closeKitapYaz = function(e){
    if(e.target === document.getElementById("kitap-yaz-modal"))
        document.getElementById("kitap-yaz-modal").style.display = "none";
};

window.setKitapYazKisi = function(k){
    kitapYazKisi = k;
    syncKitapYazKisiUI();
    const gd = kitapTumVeri["gun"+kitapAktifGun] || {};
    document.getElementById("kitap-yaz-textarea").value = (gd[k] && gd[k].metin) ? gd[k].metin : "";
};

function syncKitapYazKisiUI(){
    document.querySelectorAll(".kyaz-kisi-btn").forEach(b=>{
        const isMe = b.dataset.k === kitapYazKisi;
        b.style.opacity    = isMe ? "1" : "0.4";
        b.style.fontWeight = isMe ? "700" : "500";
        b.style.borderColor = isMe
            ? (kitapYazKisi==="kevser" ? "rgba(176,176,176,0.7)" : "rgba(123,44,191,0.6)")
            : (b.dataset.k==="kevser"  ? "rgba(176,176,176,0.2)" : "rgba(123,44,191,0.15)");
    });
}

window.kaydetKitapNot = function(){
    if(!window.akDB){ alert("bağlantı yok"); return; }
    const metin = document.getElementById("kitap-yaz-textarea").value.trim();
    if(!metin){ alert("bir şeyler yaz önce 🥺"); return; }
    const gun = kitapAktifGun;
    const d = new Date();
    const zaman = d.getDate().toString().padStart(2,"0")+"."+(d.getMonth()+1).toString().padStart(2,"0")+"."+d.getFullYear()
        +" "+d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");

    window.akDB.ref(dbPath(gun, kitapYazKisi)).once("value").then(snap=>{
        const old = snap.val();
        if(old && old.metin){
            window.akDB.ref(historyPath(gun, kitapYazKisi)+"/"+Date.now()).set(old.metin);
        }
        return window.akDB.ref(dbPath(gun, kitapYazKisi)).set({ metin, zaman });
    }).then(()=>{
        document.getElementById("kitap-yaz-modal").style.display = "none";
    }).catch(err=>alert("kaydedilemedi: "+err.message));
};

})();
