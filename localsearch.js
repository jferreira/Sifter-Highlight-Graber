let all = [];
chrome.bookmarks.search({}, (res) => {
  for (let item of res) {
    if (item.url > "") {
      item.title = item.title.toLowerCase();
      item.url = item.url.toLowerCase();
      all.push(item);
    }
  }
  all.sort((a, b) => b.dateAdded - a.dateAdded);
  results.innerHTML =
    "<p>Search your sifter bookmarks by title, url, highlights and notes (" +
    all.length +
    " urls)</p>";
});

const leftMark = "<<"; //'&ldquo;'
const rightMark = ">>"; //'&rdquo;'
const lenQuote = rightMark.length;

function annotationToArray(annotations) {
  if (!annotations) return [];
  if (annotations.trim().length === 0) return [];
  var chuncks = annotations.split(rightMark);
  var highlights = [];
  for (var i = 0; i < chuncks.length; i++) {
    var j = chuncks[i].indexOf(leftMark);
    if (j >= 0) {
      var comment = chuncks[i].substring(0, j).trim();
      var highlight = chuncks[i].substring(j + lenQuote);
      var k = highlight.lastIndexOf("@");
      var occurence = 0;
      var couleur = "yellow";
      var pagenumber = null;
      if (k > 0) {
        try {
          var string = highlight.substring(k + 1);
          var c = highlight.indexOf("#", k);
          if (c != -1) {
            var trail = highlight.substring(k + 1, c);
            var chk = trail.split(",");
            //occurence = parseInt(highlight.substring(k+1,c));
            occurence = parseInt(chk[0]);
            if (chk.length === 2) pagenumber = parseInt(chk[1]);
            couleur = highlight.substring(c + 1);
          } else {
            //occurence = parseInt(highlight.substring(k+1));
            var trail = highlight.substring(k + 1);
            var chk = trail.split(",");
            occurence = parseInt(chk[0]);
            if (chk.length === 2) pagenumber = parseInt(chk[1]);
          }
          highlight = highlight.substring(0, k);
        } catch (eint) {
          occurence = 0;
        }
      } else {
        var c = highlight.lastIndexOf("#");
        if (c > 0) {
          couleur = highlight.substring(c + 1);
          highlight = highlight.substring(0, c);
        }
      }
      highlight = highlight.trim(); //yawas_TrimString(highlight);
      var obj = {
        p: pagenumber,
        selection: highlight,
        n: occurence,
        color: couleur,
        comment: comment,
      };
      highlights.push(obj);
    }
  }
  return highlights;
}

function domain(url) {
  return new URL(url).hostname;
}

function bold(text, query_string) {
  if (query_string > "") return text.replaceAll(query_string, "<b>" + query_string + "</b>");
  else return text;
}
function search(query_string) {
  //chrome.bookmarks.search({}, res => {
  //}
  let res = [];
  for (let item of all) {
    if (item.url.indexOf(query_string) !== -1 || item.title.indexOf(query_string) !== -1)
      res.push(item);
  }
  results.innerHTML = "<p>" + res.length + " results</p>";
  for (let item of res) {
    let hit = document.createElement("div");
    let chunks = item.title.split("#__#");
    let title = chunks[0];
    let date = new Date(item.dateAdded).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    let highlights = annotationToArray(chunks[1]);
    let html = [];
    for (let h of highlights) {
      if (h.selection.indexOf(query_string) !== -1)
        html.push(`<span>${bold(h.selection, query_string)}</span>`);
      else html.push(`<span>${h.selection}</span>`);
    }
    html = html.join("...");
    hit.innerHTML = `<div class='res'><div class='title'><a href="${
      item.url
    }">${bold(title, query_string)}</a></div><div><a href="${item.url}">${domain(
      item.url
    )}</a> - ${date}</div><div>${html}</div>`;
    results.appendChild(hit);
  }
}

/*document.getElementById('close').addEventListener('click',(evt) => {
  evt.preventDefault()
  evt.stopPropagation()
  window.close();
})*/

document.getElementById("form").onsubmit = (evt) => {
  evt.preventDefault();
  evt.stopPropagation();
  if (query.value.trim() > "") search(query.value.trim());
};
