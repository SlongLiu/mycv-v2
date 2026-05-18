$(document).ready(function() {
  // add toggle functionality to abstract and bibtex buttons
  $('a.abstract').click(function() {
    $(this).parent().parent().find(".abstract.hidden").toggleClass('open');
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass('open');
  });
  $('a.bibtex').click(function() {
    $(this).parent().parent().find(".bibtex.hidden").toggleClass('open');
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass('open');
  });
  $('a').removeClass('waves-effect waves-light');

  // bootstrap-toc
  if($('#toc-sidebar').length){
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href  = "../css/jupyter.css";
  cssLink.rel   = "stylesheet";
  cssLink.type  = "text/css";

  let theme = localStorage.getItem("theme");
  if (theme == null || theme == "null") {
    const userPref = window.matchMedia;
    if (userPref && userPref("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
  }

  $('.jupyter-notebook-iframe-container iframe').each(function() {
    $(this).contents().find("head").append(cssLink);

    if (theme == "dark") {
      $(this).bind("load",function(){
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark"});
      });
    }
  });

  updateImpactMetrics();
});

function formatCompactCount(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 10000 ? 1 : 0,
  }).format(value) + "+";
}

function setMetricText(elementId, value) {
  const element = document.getElementById(elementId);
  if (!element || !value) {
    return;
  }

  element.textContent = value;
  element.setAttribute("title", "Updated live from public APIs");
}

async function updateImpactMetrics() {
  const githubStarsElement = document.getElementById("github-stars");
  if (!githubStarsElement || !window.fetch) {
    return;
  }

  const repos = [
    "IDEA-Research/DAB-DETR",
    "IDEA-Research/DN-DETR",
    "IDEA-Research/DINO",
    "IDEA-Research/MaskDINO",
    "IDEA-Research/Stable-DINO",
    "IDEA-Research/GroundingDINO",
    "IDEA-Research/Grounded-Segment-Anything",
    "LLaVA-VL/LLaVA-Plus-Codebase",
    "Princeton-AI2-Lab/Avenir-Web",
  ];

  try {
    const responses = await Promise.allSettled(
      repos.map((repo) =>
        fetch(`https://api.github.com/repos/${repo}`, {
          headers: { Accept: "application/vnd.github+json" },
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`GitHub API request failed for ${repo}`);
          }
          return response.json();
        })
      )
    );

    const stars = responses.reduce((total, result) => {
      if (result.status !== "fulfilled") {
        return total;
      }
      return total + (Number(result.value.stargazers_count) || 0);
    }, 0);

    setMetricText("github-stars", formatCompactCount(stars));
  } catch (error) {
    // Keep the static fallback in the page.
  }
}
