(function () {
  "use strict";

  var LABELS = {
    "pt": ["Mostrar senha", "Ocultar senha"],
    "en": ["Show password", "Hide password"],
    "ko": ["비밀번호 표시", "비밀번호 숨기기"],
    "es": ["Mostrar contraseña", "Ocultar contraseña"]
  };
  var EYE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 5.1A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7a10.6 10.6 0 0 0 5.4-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

  function labels() {
    var lang = (document.documentElement.lang || "pt").slice(0, 2).toLowerCase();
    return LABELS[lang] || LABELS.pt;
  }

  function enhance(input) {
    if (input.dataset.cpPwToggle) return;
    input.dataset.cpPwToggle = "1";

    var wrap = document.createElement("span");
    wrap.className = "cp-pw-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cp-pw-toggle";
    btn.setAttribute("aria-controls", input.id || "");
    wrap.appendChild(btn);

    function place() {
      btn.style.top = (input.offsetTop + input.offsetHeight / 2) + "px";
    }
    window.addEventListener("resize", place);

    function render() {
      place();
      var visible = input.type === "text";
      var l = labels();
      btn.innerHTML = visible ? EYE_OFF : EYE;
      btn.setAttribute("aria-label", visible ? l[1] : l[0]);
      btn.setAttribute("aria-pressed", visible ? "true" : "false");
      btn.title = visible ? l[1] : l[0];
    }

    btn.addEventListener("click", function () {
      var pos = input.selectionStart;
      input.type = input.type === "password" ? "text" : "password";
      render();
      input.focus();
      try { input.setSelectionRange(pos, pos); } catch (e) {}
    });

    var form = input.form;
    if (form) {
      form.addEventListener("submit", function () {
        input.type = "password";
        render();
      });
    }

    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    render();
  }

  function injectStyle() {
    if (document.getElementById("cp-pw-style")) return;
    var st = document.createElement("style");
    st.id = "cp-pw-style";
    st.textContent = ".cp-pw-wrap{position:relative;display:block}.cp-pw-wrap>input{width:100%;padding-right:48px!important}.cp-pw-toggle{position:absolute;right:6px;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;margin:0;border:0!important;border-radius:50%;background:transparent!important;color:#7a5ca8;cursor:pointer;box-shadow:none}.cp-pw-toggle:hover{background:rgba(122,92,168,.1)!important}.cp-pw-toggle:focus-visible{outline:2px solid #7a5ca8;outline-offset:2px}";
    document.head.appendChild(st);
  }

  function init() {
    injectStyle();
    var inputs = document.querySelectorAll('input[type="password"]');
    for (var i = 0; i < inputs.length; i++) enhance(inputs[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
