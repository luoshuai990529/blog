(function () {
  'use strict';

  var intro = document.querySelector('[data-intro]');
  var site = document.querySelector('[data-site]');
  var skip = document.querySelector('[data-skip-intro]');
  var spiderButton = document.querySelector('[data-spider]');
  var enterHome = document.querySelector('[data-enter-home]');
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-target]'));
  var articleList = document.querySelector('[data-article-list]');
  var articleFilters = document.querySelector('[data-article-filters]');
  var scrollTip = document.querySelector('[data-scroll-tip]');
  var categoryPriority = ['Agent 工程', 'RAG', 'AI Coding', 'AI 搜索与内容可见性', 'LLM', 'Prompt 工程', '大模型训练'];
  var articles = (Array.isArray(window.articleIndex) ? window.articleIndex.slice() : []).sort(function (left, right) {
    var leftRank = categoryPriority.indexOf(left.category);
    var rightRank = categoryPriority.indexOf(right.category);
    leftRank = leftRank === -1 ? categoryPriority.length : leftRank;
    rightRank = rightRank === -1 ? categoryPriority.length : rightRank;
    return leftRank - rightRank || left.title.localeCompare(right.title, 'zh-CN');
  });
  var hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var introOpening = false;
  var introDone = false;
  var aboutTerminalOpen = false;
  var currentCategory = '全部';

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character];
    });
  }

  function openCurtain() {
    if (introOpening || introDone) return;
    introOpening = true;
    site.classList.add('is-ready');
    intro.classList.add('is-opening');
  }

  function finishIntro() {
    if (introDone) return;
    openCurtain();
    introDone = true;
    intro.classList.add('is-done');
  }

  function showAboutTerminal() {
    aboutTerminalOpen = true;
    intro.classList.remove('is-opening', 'is-done');
    intro.classList.add('is-about');
    window.setTimeout(function () {
      if (aboutTerminalOpen) enterHome.focus();
    }, hasReducedMotion ? 0 : 2100);
  }

  function returnHome() {
    if (!aboutTerminalOpen) return;
    aboutTerminalOpen = false;
    intro.classList.remove('is-about');
    intro.classList.add('is-opening');
    window.setTimeout(function () { intro.classList.add('is-done'); }, hasReducedMotion ? 0 : 850);
    window.setTimeout(function () { spiderButton.focus(); }, hasReducedMotion ? 0 : 900);
  }

  if (hasReducedMotion) {
    site.classList.add('is-ready');
    finishIntro();
  } else {
    window.setTimeout(openCurtain, 3350);
    window.setTimeout(finishIntro, 4200);
  }
  skip.addEventListener('click', function () {
    openCurtain();
    window.setTimeout(finishIntro, 650);
  });
  spiderButton.addEventListener('click', showAboutTerminal);
  enterHome.addEventListener('click', returnHome);
  document.addEventListener('keydown', function (event) {
    if (aboutTerminalOpen && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      returnHome();
    }
  });

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var target = button.dataset.target;
      panels.forEach(function (panel) {
        var active = panel.dataset.panel === target;
        panel.classList.toggle('is-active', active);
        panel.setAttribute('aria-hidden', String(!active));
      });
      buttons.forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      if (target === 'articles') window.requestAnimationFrame(updateScrollTip);
    });
  });

  function updateScrollTip() {
    var canScroll = articleList.scrollHeight > articleList.clientHeight + 2;
    var atTop = articleList.scrollTop <= 4;
    scrollTip.hidden = !(currentCategory === '全部' && canScroll && atTop);
  }

  function renderArticles(category) {
    currentCategory = category;
    var visible = category === '全部' ? articles : articles.filter(function (article) {
      return article.category === category;
    });
    articleList.scrollTop = 0;
    articleList.innerHTML = visible.map(function (article, index) {
      return '<a class="article-link" href="' + escapeHtml(encodeURI(article.href)) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="article-link__number">' + String(index + 1).padStart(2, '0') + '</span>' +
        '<span class="article-link__title">' + escapeHtml(article.title) + '</span>' +
        '<span class="article-link__category">' + escapeHtml(article.category) + '</span>' +
        '</a>';
    }).join('');
    Array.prototype.forEach.call(articleFilters.querySelectorAll('button'), function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.category === category));
    });
    window.requestAnimationFrame(updateScrollTip);
  }

  var categories = ['全部'].concat(articles.reduce(function (result, article) {
    if (result.indexOf(article.category) === -1) result.push(article.category);
    return result;
  }, []));
  articleFilters.innerHTML = categories.map(function (category, index) {
    return '<button type="button" data-category="' + escapeHtml(category) + '" aria-pressed="' + String(index === 0) + '">' + escapeHtml(category) + '</button>';
  }).join('');
  articleFilters.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-category]');
    if (button) renderArticles(button.dataset.category);
  });
  articleList.addEventListener('scroll', updateScrollTip, { passive: true });
  window.addEventListener('resize', updateScrollTip, { passive: true });
  renderArticles('全部');
}());
