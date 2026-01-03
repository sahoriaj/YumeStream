/* Ad Block Detection */
(function () {
  const n = document, o = n.head;
  const hidden = "pointer-events:none;height:1px;width:0;opacity:0;visibility:hidden;position:fixed;bottom:0;";
  const a = n.createElement("div"),
        s = n.createElement("div"),
        d = n.createElement("ins");

  a.id = "div-gpt-ad-3061307416813-0"; a.style = hidden;
  s.className = "textads banner-ads banner_ads ad-unit ad-zone ad-space adsbox ads"; s.style = hidden;
  d.className = "adsbygoogle"; d.style = "display:none;";

  const checkObj = { allowed: null, elements: [a, s, d] };

  this.checkAdsStatus = function (cb) {
    if (typeof cb !== "function") return;
    if (typeof checkObj.allowed === "boolean") return cb(checkObj);

    document.body.appendChild(a);
    document.body.appendChild(s);
    document.body.appendChild(d);

    setTimeout(() => {
      if (a.offsetHeight === 0 || s.offsetHeight === 0 || d.firstElementChild) {
        checkObj.allowed = false;
        cb(checkObj);
      } else {
        const script = n.createElement("script");
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        script.async = true;
        script.crossOrigin = "anonymous";

        script.onload = () => { checkObj.allowed = true; cb(checkObj); };
        script.onerror = () => { checkObj.allowed = false; cb(checkObj); };

        o.appendChild(script);
      }

      a.remove(); s.remove(); d.remove();
    }, 40);
  };
}).call(this);

function antiAdBlockerHandler() {
  window.checkAdsStatus(function (ads) {
    if (!ads.allowed) {
      console.log("%c[ADS]", "color:#d32f2f;", "Blocked");

      const icon = "<svg style='stroke:none;fill:currentColor!important' viewBox='0 0 24 24'><path d='M12.2 9L10.2 7H13C14.1 7 15 7.9 15 9V11.8L13 9.8V9H12.2M23 9V7H19C17.9 7 17 7.9 17 9V11C17 12.1 17.9 13 19 13H21V15H18.2L20.2 17H21C22.1 17 23 16.1 23 15V13C23 11.9 22.1 11 21 11H19V9H23M22.1 21.5L20.8 22.8L14.4 16.4C14.1 16.7 13.6 17 13 17H9V10.9L7 8.9V17H5V13H3V17H1V9C1 7.9 1.9 7 3 7H5.1L1.1 3L2.4 1.7L22.1 21.5M5 9H3V11H5V9M13 14.9L11 12.9V15H13V14.9Z'/></svg>";
      const html =
        `<div class='popSc'><div class='popBo'>${icon}<h2>Ad blocker detected!</h2>
        <div class='popCo'><p>We detected an ad blocker in your browser.<br>Please whitelist our website to support us.</p></div>
        </div></div>`;

      document.body.insertAdjacentHTML("beforeend", html);
    } else {
      console.log("%c[ADS]", "color:#43a047;", "Allowed");
    }
  });

  document.removeEventListener("DOMContentLoaded", antiAdBlockerHandler);
}

if (document.readyState === "complete" || document.readyState !== "loading") {
  antiAdBlockerHandler();
} else {
  document.addEventListener("DOMContentLoaded", antiAdBlockerHandler);
}
