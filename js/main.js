(function () {
  var C = CONFIG, $ = function (id) { return document.getElementById(id); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---- data umum ---- */
  var wa = 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(C.pesanAwal);
  $$('[data-wa]').forEach(function (a) { a.href = wa; });
  $$('[data-mail]').forEach(function (a) { a.href = 'mailto:' + C.email; a.textContent = C.email; });
  $$('[data-year]').forEach(function (s) { s.textContent = new Date().getFullYear(); });
  $$('[data-sos]').forEach(function (u) {
    u.innerHTML = C.sosial.map(function (s) {
      return u.classList.contains('sl') ? '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + s.nama + '</a></li>'
        : '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + s.nama + '</a></li>';
    }).join('');
  });
  // .sl berisi <li><a>, tetap valid sebagai daftar
  $$('ul.sl').forEach(function (u) { u.style.listStyle = 'none'; });

  /* ---- menu mobile ---- */
  var m = $('menu'), nav = $('nav');
  if (m) {
    m.onclick = function () { var o = nav.classList.toggle('open'); m.setAttribute('aria-expanded', o); };
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); m.setAttribute('aria-expanded', 'false'); } });
  }

  /* ---- muncul saat scroll ---- */
  $$('section.pass, .ab > div, .card, .pc').forEach(function (e) { e.classList.add('rv'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });

  /* ---- boarding pass (beranda) ---- */
  var tabs = $('tabs');
  if (tabs) {
    var D = [
      { k: 'YUL', kota: 'Montréal', neg: 'Québec', jalur: 'Francophone Mobility', ujian: 'TCF Canada / TEF Canada', cat: 'Québec punya sistem imigrasi sendiri dan bahasa Prancis sebagai bahasa utama. Cek aturan terbaru.' },
      { k: 'YQB', kota: 'Québec', neg: 'Ontario', jalur: 'Francophone Mobility', ujian: 'TCF / TEF', cat: 'Kota yang mayoritas berbahasa Prancis; cocok untuk belajar bahasa sambil menjalani hidup sehari-hari.' },
      { k: 'YOW', kota: 'Ottawa', neg: 'Ontario', jalur: 'Francophone Mobility', ujian: 'TCF Canada / TEF Canada', cat: 'Di luar Québec, program Francophone Mobility memungkinkan perusahaan merekrut pekerja berbahasa Prancis tanpa LMIA, dengan syarat tertentu.' },
      { k: 'YQM', kota: 'Moncton', neg: 'New Brunswick', jalur: 'Francophone Mobility', ujian: 'TCF Canada / TEF Canada', cat: 'New Brunswick adalah provinsi resmi dwibahasa dengan komunitas Acadie yang kuat.' },
      { k: 'YWG', kota: 'Winnipeg', neg: 'Manitoba', jalur: 'Francophone Mobility', ujian: 'TCF Canada / TEF Canada', cat: 'Komunitas francophone ada di sekitar Saint-Boniface. Cek peluang dan syarat tiap provinsi.' }
    ];
    var btns = D.map(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.role = 'tab'; b.textContent = d.k; b.setAttribute('aria-selected', i === 0);
      b.tabIndex = i === 0 ? 0 : -1; b.onclick = function () { pick(i, true); };
      tabs.appendChild(b); return b;
    });
    function pick(i, f) {
      var d = D[i];
      btns.forEach(function (b, j) { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
      if (f) btns[i].focus();
      $('kodetujuan').textContent = d.k;
      $('d-kota').textContent = d.kota; $('d-neg').textContent = d.neg; $('d-jalur').textContent = d.jalur;
      $('d-ujian').textContent = d.ujian; $('d-cat').textContent = d.cat;
    }
    tabs.addEventListener('keydown', function (e) {
      var i = btns.indexOf(document.activeElement);
      if (e.key === 'ArrowRight') pick((i + 1) % D.length, true);
      if (e.key === 'ArrowLeft') pick((i - 1 + D.length) % D.length, true);
    });
    pick(0);

    var tk = $('tk'), kata = ['Bonjour', 'Canada', 'Merci', 'Montréal', 'À bientôt', 'Québec', 'Bienvenue', 'Ottawa', 'Santé', 'Moncton'], h = '';
    for (var r = 0; r < 4; r++) kata.forEach(function (k) { h += '<span>' + k + '</span>'; });
    tk.innerHTML = h;

    /* progres tahapan */
    var st = $('steps');
    function prog() {
      var r = st.getBoundingClientRect(), vh = innerHeight;
      st.style.setProperty('--p', Math.min(1, Math.max(0, (vh * .75 - r.top) / (r.height + vh * .2))).toFixed(3));
    }
    addEventListener('scroll', prog, { passive: true }); prog();

    /* filter tips */
    $$('.chips .chip').forEach(function (c) {
      c.onclick = function () {
        $$('.chips .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
        $$('#tipslist li').forEach(function (li) { li.hidden = !(c.dataset.f === 'semua' || li.dataset.c === c.dataset.f); });
      };
    });

    /* cari FAQ */
    $('cari').addEventListener('input', function () {
      var q = this.value.toLowerCase().trim(), n = 0;
      $$('#faqlist details').forEach(function (d) {
        var ok = d.textContent.toLowerCase().indexOf(q) > -1; d.hidden = !ok; if (ok) n++;
      });
      $('nol').style.display = n ? 'none' : 'block';
    });

    /* form -> WhatsApp */
    $('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var t = 'Halo Lungaabroad.id, saya ' + $('f-nama').value + '.\nTujuan: ' + $('f-tuj').value +
        '\nJalur: ' + $('f-jal').value + '\nLevel Prancis: ' + $('f-lv').value + '\nSaya ingin konsultasi.';
      window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(t), '_blank');
    });
  }

  /* ---- halaman program: jenjang + kalkulator ---- */
  var lv = $('lv');
  if (lv) {
    var L = [
      ['A1', 'Pemula', 'Memperkenalkan diri dan memakai kalimat sangat sederhana.', 80],
      ['A2', 'Dasar', 'Percakapan rutin: berbelanja, bertanya arah, bercerita singkat tentang diri.', 190],
      ['B1', 'Menengah', 'Mandiri di situasi umum; menyampaikan pendapat sederhana. Sering menjadi ambang awal banyak jalur.', 380],
      ['B2', 'Menengah atas', 'Mengikuti kuliah dan rapat kerja; berdiskusi dengan cukup lancar.', 600],
      ['C1', 'Mahir', 'Memakai bahasa secara fleksibel untuk keperluan akademik dan profesional.', 850]
    ], lb = [];
    L.forEach(function (x, i) {
      var b = document.createElement('button'); b.type = 'button'; b.role = 'tab'; b.textContent = x[0];
      b.setAttribute('aria-selected', i === 2); b.onclick = function () { show(i); }; lv.appendChild(b); lb.push(b);
    });
    function show(i) {
      lb.forEach(function (b, j) { b.setAttribute('aria-selected', j === i); });
      $('lv-h').textContent = L[i][0] + ' · ' + L[i][1]; $('lv-d').textContent = L[i][2]; $('lv-j').textContent = '± ' + L[i][3] + ' jam';
    }
    show(2);

    var A = $('c-a'), B = $('c-b'), J = $('c-j'), hrs = [0].concat(L.map(function (x) { return x[3]; }));
    ['Belum pernah'].concat(L.map(function (x) { return x[0]; })).forEach(function (n, i) {
      if (i < 5) A.add(new Option(i === 0 ? 'Belum pernah belajar' : n, i));
      if (i > 0) B.add(new Option(n, i));
    });
    B.value = 3;
    function hitung() {
      $('c-jv').textContent = J.value;
      var a = +A.value, b = +B.value, o = $('c-o'), n = $('c-n');
      if (b <= a) { o.textContent = '—'; n.textContent = 'Pilih target yang lebih tinggi dari level sekarang.'; return; }
      var jam = hrs[b] - hrs[a], mgg = Math.ceil(jam / J.value);
      o.textContent = Math.max(1, Math.round(mgg / 4.345)) + ' bulan';
      n.textContent = '± ' + jam + ' jam belajar, sekitar ' + mgg + ' minggu pada ' + J.value + ' jam per minggu.';
    }
    [A, B, J].forEach(function (e) { e.addEventListener('input', hitung); });
    hitung();
  }
  /* ---- slider foto webinar ---- */
  var wsl = $('wsl');
  if (wsl) {
    var wsd = $$('.ws', wsl), wtb = $$('.wt', wsl), wi = 0, wtm, wx = 0;
    function wshow(k) {
      wsd[wi].classList.remove('on'); wtb[wi].setAttribute('aria-current', 'false');
      wi = (k + wsd.length) % wsd.length;
      wsd[wi].classList.add('on'); wtb[wi].setAttribute('aria-current', 'true');
      $('wsub').textContent = wsd[wi].dataset.sub;
      $('wnum').textContent = '0' + (wi + 1) + ' / 0' + wsd.length;
    }
    function wplay() { clearInterval(wtm); if (!reduce) wtm = setInterval(function () { wshow(wi + 1); }, 5000); }
    function wstop() { clearInterval(wtm); }
    $('wprev').onclick = function () { wshow(wi - 1); wplay(); };
    $('wnext').onclick = function () { wshow(wi + 1); wplay(); };
    wtb.forEach(function (b, k) { b.onclick = function () { wshow(k); wplay(); }; });
    wsl.addEventListener('mouseenter', wstop); wsl.addEventListener('mouseleave', wplay);
    wsl.addEventListener('focusin', wstop); wsl.addEventListener('focusout', wplay);
    wsl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') wshow(wi - 1); if (e.key === 'ArrowRight') wshow(wi + 1);
    });
    wsl.addEventListener('touchstart', function (e) { wx = e.touches[0].clientX; wstop(); }, { passive: true });
    wsl.addEventListener('touchend', function (e) {
      var d = e.changedTouches[0].clientX - wx;
      if (Math.abs(d) > 40) wshow(wi + (d < 0 ? 1 : -1)); wplay();
    });
    wshow(0); wplay();
  }
})();
