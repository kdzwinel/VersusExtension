(function () {
  "use strict";

  var queries = "";

  try {
    var json = (location.hash).slice(1);//removing #
    queries = JSON.parse(json)
  } catch (e) {
  }

  function getNumberOfResults(html) {
    //Scrapping results page
    //All available API options limit number of queries or don't provide total number of results
    var regexResult = html.match('resultStats[\'\"]>[^<0-9]+([0-9,]+)');

    if(regexResult && regexResult[1] !== undefined) {
      return regexResult[1];
    } else {
      return null;
    }
  }

  function pushNewResult(query, url, html) {
    var results = getNumberOfResults(html);

    var listItem = document.createElement('li');
    var a = document.createElement('a');
    a.innerText = query;
    a.href = url;
    listItem.appendChild(a);

    if(results) {
      listItem.innerHTML += ' - <strong>' + results + '</strong>';
    } else {
      listItem.innerHTML += ' - <em>Error fetching data...</em>';
    }

    document.getElementById('list').appendChild(listItem);
  }

  if(queries.length !== 0) {

    queries.forEach(function(query) {

      var url = 'https://google.com/search?q=' + encodeURIComponent('"' + query + '"');

      request({
        url: url,
        type: 'text',
        callback: pushNewResult.bind(this, query, url)
      });
    });
  }
})();